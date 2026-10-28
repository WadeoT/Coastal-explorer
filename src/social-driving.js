// Public peers own their movement. Only the local body receives an impulse here.
const passengerRide={active:false,driver:null,seat:1,last:null};
function nearestFriendVehicle(){
 if(!groundEscape.active||passengerRide.active)return null;
 let best=null,distance=4.5;
 for(const [id,r]of Multiplayer.remotes){const p=profiles[r.vehicle];if(r.ejected||r.target.passenger||p.kind!=='car'||['kart','tank'].includes(p.body)||r.target.health<=0||r.target.driverDead)continue;const d=V.Distance(player.position,r.root.position);if(d<distance){best={id,r,p};distance=d;}}
 return best;
}
function joinFriendVehicle(friend=nearestFriendVehicle()){
 if(!friend||!groundEscape.active||passengerRide.active||V.Distance(player.position,friend.r.root.position)>4.5)return false;
 const capacity=friend.p.body==='coupe'?1:3,occupied=new Set([...Multiplayer.remotes.values()].filter(r=>r.target.passenger===friend.id).map(r=>r.target.passengerSeat));
 const seat=[1,2,3].slice(0,capacity).find(n=>!occupied.has(n));if(!seat){toast('That car has no free passenger seats.');return false;}
 Object.assign(passengerRide,{active:true,driver:friend.id,seat,last:{...friend.r.target,vehicle:friend.r.vehicle}});
 keys.clear();groundEscape.velocity.setAll(0);groundEscape.impactPending=false;stepFriendPassenger(0);Multiplayer.sendState(true);toast('RIDING WITH '+friend.r.target.name+' · X to get out · C camera',5000);return true;
}
function leaveFriendVehicle(reason='LEFT FRIEND’S CAR · moving exits can injure you'){
 if(!passengerRide.active)return false;const s=passengerRide.last,p=profiles[s?.vehicle]||profiles.ute;passengerRide.active=false;passengerRide.driver=null;
 const yaw=s?.yaw||0,side=passengerRide.seat===2?1:-1,offset=p.width/2+1.1;
 player.position.x=(s?.x??player.position.x)+Math.cos(yaw)*offset*side;player.position.z=(s?.z??player.position.z)+Math.sin(yaw)*offset*side;
 const floor=groundAt(player.position.x,player.position.z,player.position.y+2,true)??motion.lastSurface;player.position.y=Math.max(floor,(s?.y??floor)-p.clearance);
 groundEscape.velocity=new V(s?.vx||0,s?.vy||0,s?.vz||0);groundEscape.exitSpeed=groundEscape.velocity.length();groundEscape.impactPending=groundEscape.exitSpeed>4;groundEscape.airborne=true;
 groundEscape.pilot?.setEnabled(cameraMode!=='cockpit');keys.clear();toast(reason);Multiplayer.sendState(true);return true;
}
function stepFriendPassenger(dt){
 const r=Multiplayer.remotes.get(passengerRide.driver);if(!r||r.ejected||r.target.health<=0||r.target.driverDead||profiles[r.vehicle].kind!=='car'){leaveFriendVehicle('DRIVER UNAVAILABLE · you left the car');return;}
 // Simultaneous claims resolve to the same lowest player ID on every peer.
 if([...Multiplayer.remotes].some(([id,q])=>id<Multiplayer.id&&q.target.passenger===passengerRide.driver&&q.target.passengerSeat===passengerRide.seat)){leaveFriendVehicle('Seat already taken · choose another free seat');return;}
 const s=r.target,p=profiles[r.vehicle];passengerRide.last={...s,vehicle:r.vehicle};
 const side=passengerRide.seat===2?1:-1,back=passengerRide.seat>1?.75:-.30,rotation=Matrix.RotationYawPitchRoll(-s.yaw,s.pitch,s.roll),offset=V.TransformNormal(new V(side*p.width*.23,p.eye-1.55,back),rotation);
 player.position.copyFrom(r.root.position.add(offset));player.rotation.set(s.pitch,-s.yaw,s.roll);motion.yaw=s.yaw;motion.vx=s.vx;motion.vz=s.vz;motion.vy=s.vy||0;state.speed=Math.hypot(s.vx,s.vz);
 posePassenger(groundEscape.pilot);groundEscape.pilot.setEnabled(cameraMode!=='cockpit');$('footStatus').hidden=false;$('footStatus').textContent='PASSENGER · '+s.name+' · HEALTH '+Math.ceil(groundEscape.health)+'% · X EXIT · C CAMERA';
}
function posePassenger(pilot){for(const limb of pilot?.metadata.limbs||[]){limb.leg.rotation.x=1.2;limb.arm.rotation.x=1.0;}}
function passengerCamera(dt,snap){
 const r=Multiplayer.remotes.get(passengerRide.driver);if(!r)return;const p=profiles[r.vehicle],yaw=r.target.yaw+cameraLook.yaw,first=cameraMode==='cockpit',head=player.position.add(new V(0,1.5,0)),target=first?head.add(new V(Math.sin(yaw)*8,-cameraLook.pitch*4,-Math.cos(yaw)*8)):r.root.position.add(new V(0,p.eye,0)),desired=first?head:r.root.position.add(new V(-Math.sin(yaw)*8,3.2+Math.sin(cameraLook.pitch)*4,Math.cos(yaw)*8));
 camera.parent=null;if(!first){clipChaseCamera(target,desired);const floor=groundAt(desired.x,desired.z,desired.y,true);if(floor!==null)desired.y=Math.max(desired.y,floor+.65);}camera.position.copyFrom(V.Lerp(camera.position,desired,snap?1:1-Math.exp(-10*dt)));camera.upVector.set(0,1,0);camera.rotation.z=0;camera.setTarget(target);
}
function resolveRemoteContacts(){
 if(!Multiplayer.connected||!state.profile||state.mode!=='playing'||passengerRide.active||airCombat.ejection||worldUpgrade.collisions===false||!$('playerCollisions')?.checked)return;
 const own=groundEscape.active?{width:.55,length:.55,mass:80,eye:1.65}:state.profile;
 for(const [id,r]of Multiplayer.remotes){if(r.target.passenger||!r.root.isEnabled())continue;const s=r.target,q=r.ejected?{width:.55,length:.55,mass:80,eye:1.65}:profiles[r.vehicle],other=new V(s.x,s.y-(r.ejected?.8:0),s.z);
  if(Math.abs(player.position.y-other.y)>Math.max(2,own.eye,q.eye)||V.DistanceSquared(player.position,other)>((own.length+q.length)/2+2)**2)continue;
  const overlap=vehicleOverlap(player.position,motion.yaw,own,other,s.yaw,q);if(!overlap)continue;const n=overlap.normal,share=q.mass/(q.mass+own.mass);player.position.x+=n.x*(overlap.depth*share+.02);player.position.z+=n.z*(overlap.depth*share+.02);
  const closing=(motion.vx-s.vx)*n.x+(motion.vz-s.vz)*n.z;if(closing>=0)continue;const delta=-closing*1.05*share;motion.vx+=n.x*delta;motion.vz+=n.z*delta;if(groundEscape.active){groundEscape.velocity.x=motion.vx;groundEscape.velocity.z=motion.vz;}
  if(state.collisionCooldown<=0&&delta>3){const point=V.Lerp(player.position,other,.5);queueCombat('ram',point,{to:id,speed:clamp(-closing*own.mass/(own.mass+q.mass),0,55)});state.collisionCooldown=.7;if(groundEscape.active)hurtGroundEscape((delta-3)**1.4*3,'Hit by another player');else recordVehicleCrash(delta,point,{solid:false,kind:'player vehicle',normal:n});}
 }
}
window.addEventListener('keydown',e=>{if(passengerRide.active&&state.mode==='playing'&&e.code==='KeyX'&&!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();e.stopImmediatePropagation();leaveFriendVehicle();}},true);
function receiveRemoteDamage(remote,raw){
 if(!Array.isArray(raw)||raw.length!==6||!raw.every(Number.isFinite))return;const next=raw.map((n,i)=>clamp(n,0,i===0?100:i<4?3:1)),p=profiles[remote.vehicle],prior=remote.damageVisual||[100,0,0,0,0,0];
 if(next[0]>prior[0]+1||next.slice(1,4).some((v,i)=>v<prior[i+1]-.02))clearCrashStructure(remote.root,true);
 if(next[0]<prior[0]-2||next.slice(1,4).some((v,i)=>v>prior[i+1]+.025)){const deltas=next.slice(1,4).map((v,i)=>v-prior[i+1]),axis=['front','rear','side'][deltas.indexOf(Math.max(...deltas))],point=new V(axis==='side'?p.width/2:0,Math.min(1,p.eye*.6),axis==='rear'?p.length/2:axis==='front'?-p.length/2:0),normal=axis==='rear'?{x:0,z:-1}:axis==='side'?{x:-1,z:0}:{x:0,z:1};beginCrashStructure(remote.root,p,point,clamp(4+(100-next[0])*.40,4,45),normal);}
 if(remote.root.metadata.mainRotor)remote.root.metadata.mainRotor.setEnabled(!next[4]);remote.damageVisual=next;
}
