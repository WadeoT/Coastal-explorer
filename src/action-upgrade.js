// Best-effort peer combat: bounded, spatially checked, never an admin channel.
const actionWorld={seen:new Set(),outgoing:[],lastPeerHit:new Map()};
function queueCombat(kind,point,extra={}){
 if(!Multiplayer.connected)return;actionWorld.outgoing.push({id:crypto.randomUUID(),kind,p:point.asArray().map(n=>Math.round(n*100)/100),at:Date.now(),...extra});actionWorld.outgoing=actionWorld.outgoing.slice(-8);
}
function combatPayload(){actionWorld.outgoing=actionWorld.outgoing.filter(e=>Date.now()-e.at<2000);return actionWorld.outgoing.slice(-4);}
function validCombatVector(p){return Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);}
function receiveCombat(id,events){
 const peer=Multiplayer.remotes.get(id);if(!peer||!Array.isArray(events))return;
 for(const e of events.slice(0,4)){
  if(!e||typeof e.id!=='string'||e.id.length>60||actionWorld.seen.has(e.id)||!Number.isFinite(e.at)||Date.now()-e.at>6000||e.at-Date.now()>1000||!validCombatVector(e.p)||e.p[0]<BOUNDS.minX||e.p[0]>BOUNDS.maxX||e.p[2]<BOUNDS.minZ||e.p[2]>BOUNDS.maxZ||e.p[1]<-500||e.p[1]>5000||!['cannon','ram'].includes(e.kind))continue;
  const point=new V(...e.p),origin=new V(peer.target.x,peer.target.y,peer.target.z),rate=e.kind==='ram'?500:70,key=id+':'+e.kind,last=actionWorld.lastPeerHit.get(key)||0;
  if(e.at-last<rate)continue;
  if(e.kind==='cannon'){
   if(peer.vehicle!=='jet'||peer.ejected||!validCombatVector(e.o)||!validCombatVector(e.d))continue;
   const from=new V(...e.o),dir=new V(...e.d),length=dir.length();if(length<.99||length>1.01||V.Distance(origin,from)>140||V.Distance(from,point)>1801||V.Dot(point.subtract(from),dir)<0||V.Distance(point,from.add(dir.scale(V.Distance(from,point))))>2)continue;
   // Nose alignment, including pitch and roll; camera direction grants no aim.
   const nose=V.TransformNormal(new V(0,0,-1),Matrix.RotationYawPitchRoll(-peer.target.yaw,peer.target.pitch,peer.target.roll));if(V.Dot(nose,dir)<.94)continue;
  }else{
   if(e.to!==Multiplayer.id||peer.target.passenger||V.Distance(origin,player.position)>35||V.Distance(point,player.position)>Math.max(4,(state.profile?.length||4)/2+2)||!Number.isFinite(e.speed)||e.speed<0||e.speed>55)continue;
   const relative=Math.hypot(motion.vx-peer.target.vx,motion.vz-peer.target.vz);if(e.speed>relative+5)continue;
  }
  actionWorld.seen.add(e.id);if(actionWorld.seen.size>1000)actionWorld.seen.delete(actionWorld.seen.values().next().value);actionWorld.lastPeerHit.set(key,e.at);
  if(state.mode!=='playing')continue;
  if(e.kind==='cannon'){
   const from=new V(...e.o),dir=new V(...e.d),hit=rayLocalCombatBody(from,dir,Math.min(1800,V.Distance(from,point)+1));if(hit===null)continue;
   impactSpark(from.add(dir.scale(hit)));playerBulletHit(from,dir,hit+1,from.add(dir.scale(hit)),.55);
  }else if(!passengerRide.active&&state.collisionCooldown<=0){state.collisionCooldown=.7;if(groundEscape.active)hurtGroundEscape(Math.max(0,e.speed-3)**1.4*3,'Hit by a player vehicle');else recordVehicleCrash(e.speed,point,{solid:false,kind:'player vehicle',normal:{x:Math.sin(peer.target.yaw),z:-Math.cos(peer.target.yaw)}});}
 }
}
function rayCombatBody(from,direction,range,centre,yaw,pitch,roll,p,foot=false){
 const bounds=foot?{min:{x:-.35,y:0,z:-.35},max:{x:.35,y:1.8,z:.35}}:{min:{x:-p.width/2,y:-p.clearance,z:-p.length/2},max:{x:p.width/2,y:(p.height||p.eye+.3)-p.clearance,z:p.length/2}},matrix=Matrix.RotationYawPitchRoll(-yaw,pitch,roll);matrix.setTranslation(centre);const inv=Matrix.Invert(matrix),a=V.TransformCoordinates(from,inv),b=V.TransformNormal(direction,inv).normalize();return VehicleDamageModel.rayBox(a,b,bounds,range);
}
function rayLocalCombatBody(from,direction,range){return rayCombatBody(from,direction,range,player.position,motion.yaw,player.rotation.x,player.rotation.z,state.profile,groundEscape.active);}
function rayRemotePlayer(from,direction,range){
 let best=null;for(const [id,r]of Multiplayer.remotes){const s=r.target,p=profiles[r.vehicle],centre=new V(s.x,s.y-(r.ejected?.8:0),s.z),distance=rayCombatBody(from,direction,range,centre,s.yaw,s.pitch,s.roll,p,r.ejected);if(distance!==null&&(!best||distance<best.distance))best={id,distance,point:from.add(direction.scale(distance))};}return best;
}
function forgetPeerCombat(id){for(const key of actionWorld.lastPeerHit.keys())if(key.startsWith(id+':'))actionWorld.lastPeerHit.delete(key);}
