// Anonymous public MQTT transport. Only this game's room topic is subscribed.
// Public test brokers provide best-effort transport, never admin authority.
const PUBLIC_BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://test.mosquitto.org:8081/mqtt'];
class CoastMQTT {
 constructor(url,topic,onData,onStatus){Object.assign(this,{url,topic,onData,onStatus,closed:false,attempt:0,buffer:new Uint8Array()});this.connect();}
 text(value){const s=new TextEncoder().encode(value);return new Uint8Array([s.length>>8,s.length&255,...s]);}
 packet(header,body){if(this.ws?.readyState!==1||this.ws.bufferedAmount>32000)return;let n=body.length,len=[];do{let b=n%128;n=Math.floor(n/128);len.push(b|(n?128:0));}while(n);this.ws.send(new Uint8Array([header,...len,...body]));}
 connect(){if(this.closed)return;const ws=this.ws=new WebSocket(this.url,'mqtt');ws.binaryType='arraybuffer';this.buffer=new Uint8Array();this.ready=false;
  ws.onopen=()=>{this.packet(16,new Uint8Array([...this.text('MQTT'),4,2,0,30,...this.text('coast-'+crypto.randomUUID().slice(0,23))]));this.handshake=setTimeout(()=>ws.close(),12000);};
  ws.onmessage=e=>{if(ws!==this.ws||!(e.data instanceof ArrayBuffer))return;try{this.read(new Uint8Array(e.data));}catch{ws.close();}};
  ws.onerror=()=>{};ws.onclose=()=>{clearTimeout(this.handshake);clearInterval(this.ping);this.ready=false;if(!this.closed){this.onStatus();this.retry=setTimeout(()=>this.connect(),Math.min(30000,1000*2**Math.min(this.attempt++,5))+Math.random()*500);}};
  this.connectTimeout=setTimeout(()=>{if(ws.readyState===0)ws.close();},15000);
 }
 read(chunk){if(this.buffer.length+chunk.length>32768)throw Error('MQTT packet too large');let bytes=new Uint8Array(this.buffer.length+chunk.length);bytes.set(this.buffer);bytes.set(chunk,this.buffer.length);let offset=0;
  while(offset<bytes.length){const start=offset,header=bytes[offset++];let length=0,mul=1,count=0,b;do{if(offset>=bytes.length){this.buffer=bytes.slice(start);return;}b=bytes[offset++];length+=(b&127)*mul;mul*=128;if(++count>4||length>16384)throw Error('Invalid packet');}while(b&128);if(offset+length>bytes.length){this.buffer=bytes.slice(start);return;}const body=bytes.slice(offset,offset+length);offset+=length;this.handle(header,body);}
  this.buffer=new Uint8Array();
 }
 handle(header,body){const type=header>>4;if(type===2){if(body.length!==2||body[1]!==0){this.ws.close();return;}this.packet(130,new Uint8Array([0,1,...this.text(this.topic),0]));}
  else if(type===9){if(body.length<3||body[0]!==0||body[1]!==1||body[2]!==0){this.ws.close();return;}clearTimeout(this.handshake);clearTimeout(this.connectTimeout);this.ready=true;this.attempt=0;this.lastPong=Date.now();this.ping=setInterval(()=>{if(Date.now()-this.lastPong>65000)this.ws.close();else this.packet(192,new Uint8Array());},20000);this.onStatus();}
  else if(type===13)this.lastPong=Date.now();
  else if(type===3&&!(header&7)){const n=(body[0]<<8)|body[1];if(n>body.length-2)return;const decoder=new TextDecoder();if(decoder.decode(body.slice(2,2+n))!==this.topic)return;this.onData(decoder.decode(body.slice(2+n)));}
 }
 publish(value){if(this.ready){const raw=new TextEncoder().encode(JSON.stringify(value));if(raw.length<=4096)this.packet(48,new Uint8Array([...this.text(this.topic),...raw]));}}
 close(){this.closed=true;clearTimeout(this.retry);clearTimeout(this.handshake);clearTimeout(this.connectTimeout);clearInterval(this.ping);if(this.ws?.readyState===1)this.packet(224,new Uint8Array());this.ws?.close();}
}
class CoastPublicRoom {
 constructor(mp,room){this.mp=mp;this.room=room;this.members=new Map();this.seq=0;this.stopped=false;this.links=[];this.topic='coastal-explorer/v14/rooms/'+room;
  for(const url of PUBLIC_BROKERS)this.links.push(new CoastMQTT(url,this.topic,raw=>this.receive(raw),()=>this.status()));
  this.timer=setInterval(()=>this.tick(),200);this.status();
 }
 status(){if(this.stopped)return;const mp=this.mp,connected=this.links.some(l=>l.ready),changed=mp.connected!==connected;mp.connected=connected;mp.setStatus(connected?'Connected · '+publicServerName(this.room):this.links.some(l=>l.attempt)?'Public connection unavailable · Local Play · retrying':'Joining '+publicServerName(this.room)+'…');if(connected&&changed){finishAutomaticLobby();this.tick();}}
 tick(){if(this.stopped)return;const mp=this.mp;for(const [id,p] of this.members)if(Date.now()-p.seen>8000){this.members.delete(id);mp.removeRemote(id);}mp.roster=[{id:mp.id,name:mp.name(),vehicle:state.profile&&state.mode!=='garage'?state.vehicleId:null},...[...this.members.values()].map(p=>p.player)];
  const spawned=!!state.worldReady&&!!state.profile&&state.mode!=='garage',pose=spawned?mp.snapshot():null;const packet={v:14,type:'pose',room:this.room,id:mp.id,seq:++this.seq,name:mp.name(),state:pose};for(const l of this.links)l.publish(packet);refreshAutomaticLobby();
 }
 receive(raw){if(this.stopped||raw.length>4096)return;let data;try{data=JSON.parse(raw);}catch{return;}const mp=this.mp;if(!data||data.v!==14||data.type!=='pose'||data.room!==this.room||typeof data.id!=='string'||!/^pub-[a-f0-9-]{36}$/.test(data.id)||data.id===mp.id||!Number.isSafeInteger(data.seq)||data.seq<1||typeof data.name!=='string'||data.name.length>20)return;
  const previous=this.members.get(data.id);if(previous&&data.seq<=previous.seq||!previous&&this.members.size>=15)return;if(data.state!==null&&(!mp.validSnapshot(data.state)||data.state.id!==data.id))return;
  this.members.set(data.id,{seq:data.seq,seen:Date.now(),player:{id:data.id,name:data.name,vehicle:data.state?.vehicle||null}});if(data.state)mp.receiveState({...data.state,name:data.name});else mp.removeRemote(data.id);mp.roster=[{id:mp.id,name:mp.name(),vehicle:state.profile&&state.mode!=='garage'?state.vehicleId:null},...[...this.members.values()].map(p=>p.player)];refreshAutomaticLobby();
 }
 close(){const mp=this.mp;for(const l of this.links)l.publish({v:14,type:'pose',room:this.room,id:mp.id,seq:++this.seq,name:mp.name(),state:null});this.stopped=true;clearInterval(this.timer);for(const l of this.links)l.close();this.members.clear();}
}
function publicRoomCode(value){return /^[A-Z0-9-]{4,32}$/.test(String(value))?String(value):'COAST-PUBLIC';}
function joinPublicBrokerRoom(room='COAST-PUBLIC'){
 Multiplayer.leave(true);$('relayInput').value='';lobbyAutoWanted=true;Multiplayer.id='pub-'+crypto.randomUUID();Multiplayer.publicRoom=room==='COAST-PUBLIC';Multiplayer.roomId=publicRoomCode(room);Multiplayer.maxPlayers=16;Multiplayer.publicTransport=new CoastPublicRoom(Multiplayer,Multiplayer.roomId);
 const url=new URL(location.origin+location.pathname);url.searchParams.set('publicRoom',Multiplayer.roomId);$('roomInput').value=url.href;return Multiplayer.roomId;
}
