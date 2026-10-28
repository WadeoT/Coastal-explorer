// NIP-01 signed ephemeral events: independent fallback from public MQTT services.
// No account, location outside the game, owner credentials or retained poses.
const NOSTR_BROKERS=['wss://relay.damus.io','wss://nos.lol'];
class CoastNostr {
 constructor(url,topic,onData,onStatus){Object.assign(this,{url,topic,onData,onStatus,attempt:0,closed:false,ready:false,lastError:'Connecting',lastSent:0});this.key=crypto.getRandomValues(new Uint8Array(32));this.pub=Array.from(CoastSigning.schnorr.getPublicKey(this.key),x=>x.toString(16).padStart(2,'0')).join('');this.tag='coastal-'+topic;this.connect();}
 sign(content){const e={pubkey:this.pub,created_at:Math.floor(Date.now()/1000),kind:20000,tags:[['t',this.tag]],content};const hash=CoastSigning.sha256(new TextEncoder().encode(JSON.stringify([0,e.pubkey,e.created_at,e.kind,e.tags,e.content])));e.id=Array.from(hash,x=>x.toString(16).padStart(2,'0')).join('');e.sig=Array.from(CoastSigning.schnorr.sign(hash,this.key),x=>x.toString(16).padStart(2,'0')).join('');return e;}
 validEvent(e){try{if(!/^[a-f0-9]{64}$/.test(e.id)||!/^[a-f0-9]{64}$/.test(e.pubkey)||!/^[a-f0-9]{128}$/.test(e.sig))return false;const bytes=CoastSigning.sha256(new TextEncoder().encode(JSON.stringify([0,e.pubkey,e.created_at,e.kind,e.tags,e.content]))),hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''),raw=h=>new Uint8Array(h.match(/../g).map(v=>parseInt(v,16)));return hex(bytes)===e.id&&CoastSigning.schnorr.verify(raw(e.sig),bytes,raw(e.pubkey));}catch{return false;}}
 connect(){if(this.closed)return;this.ready=false;this.sub='coast-'+crypto.randomUUID().slice(0,12);let ws;try{ws=this.ws=new WebSocket(this.url);}catch(e){this.failed(e.message);return;}
  ws.onopen=()=>{if(ws!==this.ws)return;this.lastError='Verifying signed public round-trip';ws.send(JSON.stringify(['REQ',this.sub,{kinds:[20000],'#t':[this.tag],since:Math.floor(Date.now()/1000)-2,limit:0}]));const e=this.sign(JSON.stringify({coastProbe:this.pub}));this.probe=e.id;ws.send(JSON.stringify(['EVENT',e]));};
  ws.onmessage=msg=>{if(ws!==this.ws||typeof msg.data!=='string'||msg.data.length>14000)return;let m;try{m=JSON.parse(msg.data);}catch{return;}if(!Array.isArray(m))return;
   if(m[0]==='EVENT'&&m[1]===this.sub){const e=m[2];if(!e||e.kind!==20000||typeof e.content!=='string'||e.content.length>4096||!e.tags?.some(t=>t[0]==='t'&&t[1]===this.tag)||Math.abs(Date.now()/1000-e.created_at)>20)return;
    if(!this.validEvent(e))return;
    if(e.id===this.probe&&e.pubkey===this.pub){this.ready=true;this.attempt=0;this.lastError='Connected · signed round-trip verified';clearTimeout(this.handshake);this.onStatus();return;}
    if(this.ready)this.onData(e.content);
   }else if(m[0]==='OK'&&m[2]===false){this.lastError='Relay rejected publish: '+String(m[3]).slice(0,120);ws.close();}else if(m[0]==='CLOSED'&&m[1]===this.sub){this.lastError='Relay rejected subscription: '+String(m[2]).slice(0,120);ws.close();}else if(m[0]==='NOTICE')this.lastError=String(m[1]).slice(0,120);
  };
  ws.onerror=()=>{this.lastError='WebSocket blocked or unreachable';};ws.onclose=e=>{if(ws!==this.ws)return;clearTimeout(this.handshake);this.ready=false;if(!this.lastError.startsWith('Relay rejected'))this.lastError='Closed '+e.code+(e.reason?' · '+e.reason:' · network, service or browser restriction');this.failed(this.lastError);};
  this.handshake=setTimeout(()=>{if(!this.ready){this.lastError='Signed handshake timed out';ws.close();}},16000);
 }
 failed(reason){this.ready=false;this.lastError=reason;if(!this.closed){this.attempt++;this.onStatus();this.retry=setTimeout(()=>this.connect(),/banned|rate.limit/i.test(reason)?120000:Math.min(30000,1500*2**Math.min(this.attempt,4)));}}
 publish(value){
  if(!this.ready||this.ws?.readyState!==1||this.ws.bufferedAmount>16000)return;const s=value.state,round=(v,step)=>Math.round((v||0)/step),pose=value.type==='pose'&&value.v===14?JSON.stringify([value.name,s?[s.vehicle,round(s.x,.08),round(s.y,.08),round(s.z,.08),round(s.yaw,.01),round(s.pitch,.01),round(s.roll,.01),round(s.health,1),s.indicator,s.headlights,s.ejected,s.parachute,s.gearDown,round(s.rotor,.1),s.passenger,s.passengerSeat,s.damageVisual,s.driverDead,(s.combat||[]).map(e=>e.id)]:null]):null;
  const control=value.type==='owner-control'||value.type==='owner-ack',interval=control?0:pose&&pose===this.lastPoseKey?2500:this.url.includes('damus')?1100:550;if(Date.now()-this.lastSent<interval)return;const content=JSON.stringify(value);if(content.length>4096)return;this.lastSent=Date.now();this.lastPoseKey=pose;this.ws.send(JSON.stringify(['EVENT',this.sign(content)]));
 }

 close(){this.closed=true;this.ready=false;clearTimeout(this.retry);clearTimeout(this.handshake);if(this.ws?.readyState===1)this.ws.send(JSON.stringify(['CLOSE',this.sub]));this.ws?.close();this.key.fill(0);}
}
