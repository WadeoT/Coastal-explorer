// A living driver can leave a stopped ground vehicle and move clear of its fire.
const groundEscape={active:false,health:100,pilot:null,vehicleMatrix:null,vehiclePosition:null,vehicleRotation:null,blastChecked:false,swimming:false};
function startGroundEscape(){
 if(groundEscape.active)return enterParkedVehicle();
 if(!state.profile||!['car','bike','boat'].includes(state.profile.kind)||!['playing','wrecked'].includes(state.mode)||state.damage?.driverDead)return false;
 if(state.speed>4||Math.abs(state.crashFlight?.rollSpeed||0)>1.3){toast('Slow down and let the vehicle settle before exiting.');return false;}
 const p=state.profile,car=player.position.clone(),rotation=player.rotation.clone(),side=new V(Math.cos(motion.yaw),0,Math.sin(motion.yaw)),spot=car.add(side.scale(p.width*.5+1.1));
 let safe=false;for(const offset of [side.scale(p.width*.5+1.1),side.scale(-p.width*.5-1.1),new V(-Math.sin(motion.yaw)*(p.length*.5+1.1),0,Math.cos(motion.yaw)*(p.length*.5+1.1)),new V(Math.sin(motion.yaw)*(p.length*.5+1.1),0,-Math.cos(motion.yaw)*(p.length*.5+1.1))]){const candidate=car.add(offset),surface=groundAt(candidate.x,candidate.z,car.y,true)??motion.lastSurface;candidate.y=Math.max(surface,mappedWaterAt(candidate.x,candidate.z)??-1000);let blocked=false;for(const o of collisionObjectsNear(car,candidate,1))if(objectContact(o,candidate,{width:.55,length:.55,clearance:0,eye:1.65})){blocked=true;break;}if(!blocked){spot.copyFrom(candidate);safe=true;break;}}if(!safe){toast('Exit blocked on all sides. Find clearance before leaving the vehicle.');return false;}
 player.computeWorldMatrix(true);Object.assign(groundEscape,{active:true,health:Math.max(1,state.damage.components.driver),vehicleMatrix:player.getWorldMatrix().clone(),vehiclePosition:car,vehicleRotation:rotation,blastChecked:false});
 exterior.setParent(null);exterior.setEnabled(true);cockpit.setEnabled(false);if(vehicleSystems?.root){vehicleSystems.root.setParent(null);vehicleSystems.root.setEnabled(true);}groundEscape.pilot=createEjectedPilot(player,false);
 state.crashFlight=state.solidCrash=null;state.mode='playing';state.bustedTime=0;state.overturned=false;state.rpm=0;state.accumulator=0;keys.clear();cancelActivity('Left vehicle');resetDrivingRewards();$('busted').classList.add('hidden');dangerState.active.delete('fire');dangerState.last.delete('fire');player.position.copyFrom(spot);player.rotation.set(0,-motion.yaw,0);motion.vx=motion.vy=motion.vz=0;collider.scaling.set(.32,1,.13);collider.position.y=.75;cameraMode='third-person';state.cameraMode=cameraMode;document.body.classList.add('third-person');$('cameraButton').textContent='FIRST PERSON · C';AudioSystem.stop();$('world').focus();updateGroundEscapeCamera(0,true);toast('OUT OF VEHICLE · WASD to move · keep at least 12 m clear of a fire · E to re-enter · G for garage',7000);return true;
}
function stopGroundEscape(restorePosition=true){
 if(!groundEscape.active)return;groundEscape.active=false;groundEscape.pilot?.dispose(false,false);groundEscape.pilot=null;
 exterior?.setParent(player);if(exterior){exterior.position.set(0,-state.profile.clearance,0);exterior.rotation.setAll(0);}if(vehicleSystems?.root){vehicleSystems.root.setParent(player);vehicleSystems.root.position.setAll(0);vehicleSystems.root.rotation.setAll(0);}
 if(restorePosition){player.position.copyFrom(groundEscape.vehiclePosition);player.rotation.copyFrom(groundEscape.vehicleRotation);motion.pitch=player.rotation.x;motion.roll=player.rotation.z;motion.yaw=-player.rotation.y;}if($('footStatus'))$('footStatus').hidden=true;
}
function enterParkedVehicle(){
 if(!groundEscape.active)return false;const distance=V.Distance(player.position,groundEscape.vehiclePosition);
 if(distance>4){toast('Move within 4 m of your vehicle to enter.');return false;}
 if(state.damage.burning||state.damage.exploded||state.damage.components.body<=0){toast('That vehicle is unsafe. Keep clear and use G for the garage.');return false;}
 const health=groundEscape.health;stopGroundEscape();state.damage.components.driver=health;syncDamageHealth();const p=state.profile,bottom=-p.clearance+.10,top=Math.max(p.eye-p.clearance+.3,1.25);collider.scaling.set(p.width/1.8,(top-bottom)/1.5,p.length/4.8);collider.position.y=(top+bottom)/2;motion.vx=motion.vy=motion.vz=0;state.accumulator=0;state.overturned=Math.cos(motion.roll)*Math.cos(motion.pitch)<.65;if(state.overturned)state.crashFlight={groundVehicle:true,settled:true,roll:motion.roll,pitch:motion.pitch,vy:0,rollSpeed:0,pitchSpeed:0};setCameraMode('third-person');AudioSystem.resume();toast('Back in your vehicle · existing component damage retained.');return true;
}
function hurtGroundEscape(amount,reason){
 if(!groundEscape.active)return;groundEscape.health=Math.max(0,groundEscape.health-amount);state.driverHealth=groundEscape.health;
 if(groundEscape.health<=0){stopGroundEscape();state.damage.driverDead=true;state.damage.components.driver=0;state.damage.reason=reason;endDamagedRun('WASTED',reason);}
}
function stepGroundEscape(dt){
 if(!groundEscape.active)return;const before=player.position.clone(),forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),div=Math.max(1,Math.hypot(forward,side)),speed=groundEscape.swimming?2.1:keys.has('ShiftLeft')?6:4.6;
 const yaw=motion.yaw+cameraLook.yaw;motion.vx=(Math.sin(yaw)*forward+Math.cos(yaw)*side)/div*speed;motion.vz=(-Math.cos(yaw)*forward+Math.sin(yaw)*side)/div*speed;
 const next=before.add(new V(motion.vx*dt,0,motion.vz*dt)),profile={width:.55,length:.55,clearance:0,eye:1.65};let blocked=false;
 for(const o of collisionObjectsNear(before,next,1))if(objectContact(o,next,profile)){blocked=true;break;}if(!blocked){player.position.x=next.x;player.position.z=next.z;}
 const ground=groundAt(player.position.x,player.position.z,before.y,true)??motion.lastSurface,water=mappedWaterAt(player.position.x,player.position.z);groundEscape.swimming=water!==null&&ground<water+.2;player.position.y=groundEscape.swimming?water-.35:ground;motion.lastSurface=ground;player.rotation.set(0,-yaw,0);groundEscape.pilot.setEnabled(cameraMode!=='cockpit');state.speed=blocked?0:Math.hypot(motion.vx,motion.vz);state.grounded=!groundEscape.swimming;state.rpm=0;
 const distance=V.Distance(player.position,groundEscape.vehiclePosition);if(state.damage.burning&&distance<3)hurtGroundEscape(dt*22,'Burns from the vehicle fire');
 if(state.damage.exploded&&!groundEscape.blastChecked){groundEscape.blastChecked=true;if(distance<12)hurtGroundEscape(Math.max(0,(1-distance/12)*160),'Caught in the fuel explosion');}
 $('footStatus').hidden=false;$('footStatus').textContent=(groundEscape.swimming?'SWIMMING':'ON FOOT')+' · HEALTH '+Math.ceil(groundEscape.health)+'% · VEHICLE '+Math.round(distance)+' M'+(state.damage.burning?' · STAY 12 M CLEAR OF FIRE':'')+' · E ENTER · G GARAGE';
}
function updateGroundEscapeCamera(dt,snap=false){
 const p=player.position,yaw=motion.yaw+cameraLook.yaw,first=cameraMode==='cockpit',desired=first?p.add(new V(0,1.6,0)):p.add(new V(-Math.sin(yaw)*5,2.7+cameraLook.pitch*2,Math.cos(yaw)*5));camera.parent=null;camera.position.copyFrom(V.Lerp(camera.position,desired,snap?1:1-Math.exp(-dt*10)));camera.rotation.z=0;camera.upVector.set(0,1,0);camera.setTarget(p.add(new V(Math.sin(yaw)*(first?6:1),first?1.6-cameraLook.pitch:1.1,-Math.cos(yaw)*(first?6:1))));
}
function initialiseGroundEscape(){
 const label=document.createElement('div');label.id='footStatus';label.hidden=true;label.style.cssText='position:fixed;bottom:55px;left:50%;transform:translateX(-50%);z-index:15;padding:10px;background:#101620ed;color:#e5efff;border:1px solid #7699bc;font:12px monospace;max-width:90vw';document.body.append(label);
 const exit=document.createElement('button');exit.id='exitGroundVehicle';exit.hidden=true;exit.className='glass-btn';exit.textContent='EXIT / ENTER · X';exit.onclick=()=>startGroundEscape();document.querySelector('.actions').append(exit);
 window.addEventListener('keydown',e=>{if(e.repeat||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='KeyX'&&state.profile?.kind!=='jet')startGroundEscape();if(e.code==='KeyE'&&groundEscape.active)enterParkedVehicle();});
}
