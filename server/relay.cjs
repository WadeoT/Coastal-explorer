'use strict';
// Dependency-free HTTP + RFC 6455 relay for the standalone browser game.
const {Transform}=require('stream');
const http=require('http'),crypto=require('crypto'),fs=require('fs'),path=require('path');
const MAX_PAYLOAD=65536;
const {createOwnerStore}=require('./owner-store.cjs');

const gamePath=path.resolve(__dirname,'../index.html');
function frame(payload,opcode=1){const data=Buffer.from(payload),head=data.length<126?Buffer.from([128|opcode,data.length]):Buffer.from([128|opcode,126,data.length>>8,data.length&255]);return Buffer.concat([head,data]);}
function send(client,data){if(client.socket.destroyed||client.socket.writableLength>262144)return;client.socket.write(frame(JSON.stringify(data)));}
function end(client,reason){if(client.closed)return;client.closed=true;const room=client.room;if(!client.socket.destroyed){const message=Buffer.from(reason.slice(0,100)),payload=Buffer.concat([Buffer.from([3,232]),message]);client.socket.end(frame(payload,8));}room?.clients.delete(client.id);if(room&&client.id===room.host){if(room.public&&room.clients.size){room.host=room.clients.keys().next().value;for(const other of room.clients.values())send(other,{type:'host-change',host:room.host});}else{for(const other of [...room.clients.values()])end(other,'Host left the room');room.registry.delete(room.id);}}if(room&&!room.clients.size)room.registry.delete(room.id);}
function validState(s){return s&&(s.ejected===undefined||typeof s.ejected==='boolean')&&(s.parachute===undefined||typeof s.parachute==='boolean')&&typeof s.vehicle==='string'&&['ute','bike','drift','heli','hilux','ranger','patrol','jimny','commodore','falcon','mustang','gtr','wrx','boat','kart','jet','lifeflight','racq'].includes(s.vehicle)&&['x','y','z','yaw','pitch','roll','vx','vz'].every(k=>Number.isFinite(s[k]))&&Math.abs(s.x)<100000&&Math.abs(s.z)<100000&&s.y>-500&&s.y<5000&&Math.abs(s.vx)<500&&Math.abs(s.vz)<500;}
function message(client,raw){let data;try{data=JSON.parse(raw);}catch{return;}if(data&&typeof data==='object')client.dispatch(data);}
function receive(client,chunk){client.buffer=Buffer.concat([client.buffer,chunk]);if(client.buffer.length>MAX_PAYLOAD*2){end(client,'Message too large');return;}while(client.buffer.length>=2){const b=client.buffer,fin=!!(b[0]&128),op=b[0]&15,masked=!!(b[1]&128);if(!masked||b[0]&112){end(client,'Invalid frame');return;}let length=b[1]&127,offset=2;if(length===126){if(b.length<4)return;length=b.readUInt16BE(2);offset=4;}else if(length===127){if(b.length<10)return;if(b.readUInt32BE(2)!==0){end(client,'Frame too large');return;}length=b.readUInt32BE(6);offset=10;}if(length>MAX_PAYLOAD){end(client,'Frame too large');return;}if(b.length<offset+4+length)return;const mask=b.subarray(offset,offset+4),payload=Buffer.from(b.subarray(offset+4,offset+4+length));for(let i=0;i<length;i++)payload[i]^=mask[i%4];client.buffer=b.subarray(offset+4+length);if(op>=8){if(!fin||length>125){end(client,'Invalid control frame');return;}if(op===8){end(client,'Left room');return;}if(op===9)client.socket.write(frame(payload,10));if(op===10)client.alive=true;continue;}if(op===1){if(client.fragment){end(client,'Invalid fragments');return;}if(fin)message(client,payload.toString('utf8'));else client.fragment=payload;}else if(op===0&&client.fragment){client.fragment=Buffer.concat([client.fragment,payload]);if(client.fragment.length>MAX_PAYLOAD){end(client,'Message too large');return;}if(fin){message(client,client.fragment.toString('utf8'));client.fragment=null;}}else{end(client,'Text messages only');return;}}}
function createRelay(options={}){
 const rooms=new Map(),origins=(options.origins||process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean),store=createOwnerStore({ownerToken:options.ownerToken||process.env.OWNER_ADMIN_TOKEN||'Iamsteve',file:options.stateFile===false?null:options.stateFile||process.env.COASTAL_DATA_FILE||path.resolve(__dirname,'.coastal-data/state.json')});
 const clients=()=>[...rooms.values()].flatMap(r=>[...r.clients.values()]);
 const environment=()=>({type:'environment',...store.data.settings,time:(store.data.settings.time+(Date.now()-(store.data.settings.timeEpoch||Date.now()))/1200000)%1});
 const publishEnvironment=()=>{for(const c of clients())send(c,environment());};
 function admin(client,data){
  const reply=(ok,message,extra={})=>send(client,{type:'admin-result',requestId:String(data.requestId||'').slice(0,80),ok,message,...extra});
  if(!client.isOwner){reply(false,'Owner authentication required.');return;}
  const command=String(data.command||''),args=Array.isArray(data.args)?data.args:[];
  if(command==='gift'){
   const target=args[0]==='me'?client.id:String(args[0]),amount=Number(args[1]),gift=store.gift(target,amount,client.id);if(!gift){reply(false,'Use gift <player ID | me> <whole amount, 1–50,000,000>.');return;}
   for(const c of clients())if(c.id===target)send(c,{type:'gift',gift});reply(true,'Gift queued for '+target+': A$'+amount.toLocaleString('en-AU'));return;
  }
  if(['kick','ban','unban'].includes(command)){
   const id=String(args[0]||''),target=clients().find(c=>c.id===id);if(id===client.id||target?.isOwner){reply(false,'The authenticated owner cannot be removed.');return;}
   if(command==='unban'){reply(store.unban(id),'Unban requested for '+id);return;}
   if(command==='ban'&&!store.ban(id,args.slice(1).join(' '))){reply(false,'Unknown player identity.');return;}
   if(command==='kick'&&!target){reply(false,'Player is not connected.');return;}
   if(target)end(target,command==='ban'?'Banned by owner':'Removed by owner');reply(true,(command==='ban'?'Banned ':'Kicked ')+id);return;
  }
  if(command==='action'){
   const [targetId,action,...values]=args,allowed=['wanted','money','repair','damage','fire','explode','freeze','unfreeze','tp','vehicle','job','canceljob','interceptors'];
   if(!allowed.includes(action)){reply(false,'Unknown action. Allowed: '+allowed.join(', '));return;}
   if(action==='wanted'&&(!Number.isInteger(Number(values[0]))||Number(values[0])<0||Number(values[0])>5)){reply(false,'Wanted level must be 0–5.');return;}
   if(action==='money'&&(!Number.isInteger(Number(values[0]))||Number(values[0])<0||Number(values[0])>100000000)){reply(false,'Money must be 0–100,000,000.');return;}
   if(action==='damage'&&(!['engine','radiator','oil','fuel','driver','body'].includes(values[0])||!Number.isFinite(Number(values[1]))||Number(values[1])<=0||Number(values[1])>100)){reply(false,'damage <component> <1–100>');return;}
   if(action==='tp'&&(!Number.isFinite(Number(values[0]))||!Number.isFinite(Number(values[1]))||Number(values[0])< -26.98||Number(values[0])> -26.1||Number(values[1])<152.5||Number(values[1])>153.22)){reply(false,'Teleport must remain within the game region.');return;}
   const targets=targetId==='all'?clients():clients().filter(c=>c.id===(targetId==='me'?client.id:targetId));if(!targets.length){reply(false,'Player is not connected.');return;}
   for(const target of targets)send(target,{type:'owner-action',actionId:crypto.randomUUID(),action,args:values,by:client.id});reply(true,'Sent '+action+' to '+targets.length+' player(s).');return;
  }
  if(command==='client-action'){
   const [action,...values]=args,allowed=['cash','repair','give','vehicle','wanted','tp','noclip'];
   if(!allowed.includes(action)){reply(false,'Unknown owner action.');return;}
   if(action==='cash'&&(!Number.isFinite(Number(values[0]))||Number(values[0])<0||Number(values[0])>1e8)){reply(false,'Invalid cash amount.');return;}
   if(action==='wanted'&&(!Number.isInteger(Number(values[0]))||Number(values[0])<0||Number(values[0])>5)){reply(false,'Wanted level must be 0–5.');return;}
   reply(true,'Owner action authorised.',{local:{command:action,args:values}});return;
  }
  if(command==='bans'){reply(true,'Banned player identities.',{bans:Object.entries(store.data.bans).map(([id,b])=>({id,reason:b.reason}))});return;}
  if(command==='players'){reply(true,clients().map(c=>c.id+' · '+(c.state?.name||'Driver')+(c.isOwner?' · OWNER':'')).join('\n'));return;}
  const settings=store.data.settings;
  if(command==='time'){const value=Number(args[0]);if(!Number.isFinite(value)||value<0||value>=24){reply(false,'Time must be 0–23.99.');return;}settings.time=value/24;settings.timeEpoch=Date.now();}
  else if(command==='weather'){if(!['clear','cloudy','rain','storm','fog'].includes(args[0])){reply(false,'Unknown weather.');return;}settings.weather=args[0];settings.weatherEpoch=Date.now();}
  else if(command==='settings'){
   const [key,raw]=args,value=Number(raw);
   if(key==='maxPlayers'&&Number.isInteger(value)&&value>=2&&value<=16)settings.maxPlayers=value;
   else if(key==='rewardMultiplier'&&Number.isFinite(value)&&value>=.25&&value<=5)settings.rewardMultiplier=value;
   else if(['policeEnabled','autoWeather'].includes(key)&&['true','false','on','off'].includes(raw))settings[key]=['true','on'].includes(raw);
   else{reply(false,'settings maxPlayers 2–16 | rewardMultiplier 0.25–5 | policeEnabled on/off | autoWeather on/off');return;}
  }else{reply(false,'Unknown server command.');return;}
  store.persist();publishEnvironment();reply(true,'Server setting updated.');
 }
 function dispatch(client,data){
  const room=client.room;if(!room||client.closed)return;
  if(data.type==='state'&&validState(data.state)){client.pendingState={...data.state,id:client.id,name:String(data.state.name||'Driver').slice(0,20)};}
  else if(data.type==='owner-auth'){
   const accepted=store.owner(data.token);client.isOwner=accepted;send(client,{type:'owner-status',owner:accepted,configured:store.configured,message:accepted?'Owner verified.':store.configured?'Incorrect owner key.':'Configure OWNER_ADMIN_TOKEN on the server first.'});if(!accepted&&++client.authFailures>=5)end(client,'Too many failed owner logins');
  }else if(data.type==='owner-logout'){client.isOwner=false;send(client,{type:'owner-status',owner:false,message:'Owner logged out.'});}
  else if(data.type==='admin')admin(client,data);
  else if(data.type==='gift-ack'&&typeof data.id==='string')store.acknowledge(client.id,data.id);
  else if(data.type==='environment'||data.type==='kick')send(client,{type:'admin-result',ok:false,message:'Use the owner-authenticated server console.'});
 }
 const server=http.createServer((req,res)=>{
  let url;try{url=new URL(req.url,'http://relay');}catch{res.writeHead(400);res.end();return;}
  if(url.pathname==='/health'){res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({ok:true,rooms:rooms.size,protocol:2,ownerConfigured:store.configured,publicRooms:true}));return;}
  if(url.pathname==='/'||url.pathname==='/index.html'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache'});let first=true;const inject=new Transform({transform(chunk,encoding,next){if(first){first=false;next(null,Buffer.from(chunk.toString('utf8').replace('<head>','<head><script>window.COASTAL_SERVER=true;</script>')));}else next(null,chunk);}});const input=fs.createReadStream(gamePath);input.on('error',()=>res.destroy());input.pipe(inject).pipe(res);return;}
  res.writeHead(404);res.end('Not found');
 });
 server.on('upgrade',(req,socket,head)=>{
  let url;try{url=new URL(req.url,'http://relay');}catch{socket.destroy();return;}
  const key=req.headers['sec-websocket-key'],publicJoin=url.searchParams.get('role')==='public',hosting=url.searchParams.get('role')==='host';let roomId=(url.searchParams.get('room')||'').toUpperCase();
  if(url.pathname!=='/multiplayer'||req.headers['sec-websocket-version']!=='13'||!key||Buffer.from(key,'base64').length!==16||(!publicJoin&&!/^[A-Z0-9-]{4,32}$/.test(roomId))||origins.length&&!origins.includes(req.headers.origin)){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
  if(publicJoin){const invited=rooms.get(roomId);let available=invited?.public&&invited.clients.size<store.data.settings.maxPlayers?invited:[...rooms.values()].find(r=>r.public&&r.clients.size<store.data.settings.maxPlayers);roomId=available?.id||'PUBLIC-'+crypto.randomUUID().slice(0,8).toUpperCase();}
  let room=rooms.get(roomId);if(hosting&&room||!hosting&&!publicJoin&&!room||room?.clients.size>=store.data.settings.maxPlayers||rooms.size>=1000&&!room){socket.end('HTTP/1.1 409 Conflict\r\n\r\n');return;}
  const session=store.session(url.searchParams.get('session')||'');if(!session){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}if(clients().some(c=>c.id===session.id)){socket.end('HTTP/1.1 409 Conflict\r\n\r\n');return;}
  const id=session.id;if(!room){room={id:roomId,host:id,public:publicJoin,clients:new Map(),registry:rooms};rooms.set(roomId,room);}
  const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  const client={id,socket,room,buffer:Buffer.alloc(0),fragment:null,closed:false,alive:true,lastState:0,state:null,isOwner:false,authFailures:0};client.dispatch=data=>dispatch(client,data);room.clients.set(id,client);socket.on('data',chunk=>receive(client,chunk));socket.on('error',()=>end(client,'Connection error'));socket.on('close',()=>end(client,'Connection closed'));
  send(client,{type:'welcome',id,isHost:id===room.host,host:room.host,room:roomId,relay:true,public:room.public,sessionToken:session.token,owner:false,maxPlayers:store.data.settings.maxPlayers});send(client,environment());for(const gift of store.data.gifts[id]||[])send(client,{type:'gift',gift});if(head.length)receive(client,head);
 });
 let environmentAt=Date.now(),rosterAt=0;const broadcast=setInterval(()=>{if(store.data.settings.autoWeather&&Date.now()-(store.data.settings.weatherEpoch||Date.now())>180000){store.data.settings.weatherEpoch=Date.now();store.data.settings.weather=['clear','cloudy','rain','storm','fog'][Math.floor(Math.random()*5)];store.persist();publishEnvironment();}if(Date.now()-environmentAt>2000){environmentAt=Date.now();publishEnvironment();}for(const room of rooms.values()){for(const c of room.clients.values())if(c.pendingState){c.state=c.pendingState;c.pendingState=null;}const players=[...room.clients.values()].map(c=>c.state).filter(Boolean),data={type:'world',players,present:players.map(p=>p.id)};for(const c of room.clients.values()){send(c,data);if(Date.now()-rosterAt>1000)send(c,{type:'lobby-roster',players:[...room.clients.values()].map(p=>({id:p.id,name:p.state?.name||'Driver',vehicle:p.state?.vehicle||null}))});}}if(Date.now()-rosterAt>1000)rosterAt=Date.now();},67);
 const heartbeat=setInterval(()=>{for(const c of clients()){if(!c.alive)end(c,'Connection timed out');else{c.alive=false;c.socket.write(frame('',9));}}},25000);broadcast.unref();heartbeat.unref();server.on('close',()=>{clearInterval(broadcast);clearInterval(heartbeat);for(const c of clients())end(c,'Server stopped');rooms.clear();});server.shutdown=()=>{for(const c of clients())end(c,'Server stopped');};return server;
}
if(require.main===module){const server=createRelay(),port=Number(process.env.PORT)||8080;server.listen(port,'0.0.0.0',()=>console.log('Coastal Explorer relay listening on port '+port));for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.shutdown();server.close(()=>process.exit(0));});}
module.exports={createRelay,validState};
