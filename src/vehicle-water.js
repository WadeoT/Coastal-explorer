// Water entry uses flooding, drag and a finite air supply. Bathymetry is a
// bounded gameplay estimate where the land DEM has no underwater soundings.
function waterEscapeKey(){return state.profile?.kind==='bike'?'H':'X';}
function sinkingBedAt(x,z,level){return Math.max(level-18,Math.min(terrainHeight(x,z)??level-6,level-3));}
function resetVehicleSubmersion(){state.submersion=null;}
function beginVehicleSubmersion(level){
 if(state.submersion||!['car','bike'].includes(state.profile?.kind))return;
 state.submersion={level,age:0,flood:0,oxygen:18,vy:Math.min(0,motion.vy||0),engineWet:0,roll:motion.roll,pitch:motion.pitch};state.crashFlight=state.solidCrash=null;state.grounded=false;keys.delete('KeyW');dangerAlert('water-entry','VEHICLE FLOODING',waterEscapeKey()+' to get out before the cabin submerges.','critical','water');$('driveHint').textContent='SINKING · '+waterEscapeKey()+' EXIT · SWIM TO THE SURFACE';
}
function stepVehicleSubmersion(dt){
 const s=state.submersion,p=state.profile;if(!s)return;const water=mappedWaterAt(player.position.x,player.position.z);if(water!==null)s.level=water;s.age+=dt;s.flood=clamp(s.flood+dt*(.045+(100-state.damage.components.body)*.00045),0,1);
 motion.vx*=Math.exp(-dt*1.8);motion.vz*=Math.exp(-dt*1.8);const before=player.position.clone(),next=before.add(new V(motion.vx*dt,0,motion.vz*dt));let blocked=mappedWaterAt(next.x,next.z)===null;for(const o of collisionObjectsNear(before,next,p.width*.5))if(objectContact(o,next,p)){blocked=true;break;}if(!blocked){player.position.x=next.x;player.position.z=next.z;}else motion.vx=motion.vz=0;
 const buoyant=s.level+p.clearance-.32,target=s.age<1.4?buoyant:s.level-22,sinkSpeed=s.age<1.4?.22:.12+s.flood*1.25;s.vy=smooth(s.vy,player.position.y>target?-sinkSpeed:0,2.5,dt);player.position.y+=s.vy*dt;const floor=sinkingBedAt(player.position.x,player.position.z,s.level)+p.clearance;if(player.position.y<floor){player.position.y=floor;s.vy=0;}
 motion.pitch=smooth(motion.pitch,s.pitch-.06-s.flood*.12,1.4,dt);motion.roll=smooth(motion.roll,s.roll+Math.sin(s.age*.4)*.035,1.2,dt);player.rotation.set(motion.pitch,-motion.yaw,motion.roll);motion.vy=s.vy;motion.lastSurface=s.level;state.speed=Math.hypot(motion.vx,motion.vz,s.vy);state.grounded=false;state.rpm=0;
 const intake=player.position.y+.8-p.clearance;s.engineWet=intake<s.level?s.engineWet+dt:0;if(s.engineWet>.7&&!state.damage.engineFailed){state.damage.engineFailed=true;state.damage.components.engine=0;state.damage.reason='Engine flooded';dangerAlert('water-engine','ENGINE FLOODED','Leave the sinking vehicle with '+waterEscapeKey()+'.','critical','engine');}
 if(player.position.y+1-p.clearance<s.level){state.damage.burning=false;state.damage.crashIgnitionRemaining=null;}
 const head=player.position.y+p.eye-p.clearance;if(head<s.level-.05)s.oxygen=Math.max(0,s.oxygen-dt);else s.oxygen=Math.min(18,s.oxygen+dt*3);
 if(s.oxygen<10)dangerAlert('water-air','CABIN UNDERWATER · AIR '+Math.ceil(s.oxygen)+' S',waterEscapeKey()+' to escape. Your remaining air carries over while swimming up.','critical','water');
 if(s.oxygen<=0){VehicleDamageModel.hit(state.damage,'driver',dt*12,'drowning');state.damage.reason='Drowned in a submerged vehicle';}syncDamageHealth();finishDamageState();
}
function stepAbandonedSubmersion(dt){
 const s=state.submersion,g=groundEscape,p=state.profile;if(!s||!g.vehiclePosition)return;s.age+=dt;s.flood=clamp(s.flood+dt*.065,0,1);const water=mappedWaterAt(g.vehiclePosition.x,g.vehiclePosition.z);if(water!==null)s.level=water;const v=g.vehicleVelocity;v.x*=Math.exp(-dt*2);v.z*=Math.exp(-dt*2);v.y=smooth(v.y,-(.15+s.flood*1.2),2.5,dt);const old=g.vehiclePosition.clone();const next=g.vehiclePosition.add(v.scale(dt));if(mappedWaterAt(next.x,next.z)===null){next.x=old.x;next.z=old.z;v.x=v.z=0;}g.vehiclePosition.copyFrom(next);g.vehiclePosition.y=Math.max(sinkingBedAt(g.vehiclePosition.x,g.vehiclePosition.z,s.level)+p.clearance,g.vehiclePosition.y);const delta=g.vehiclePosition.subtract(old);exterior.position.addInPlace(delta);vehicleSystems?.root?.position.addInPlace(delta);g.vehicleMatrix=Matrix.Compose(new V(1,1,1),Quaternion.FromEulerAngles(g.vehicleRotation.x,g.vehicleRotation.y,g.vehicleRotation.z),g.vehiclePosition);state.damage.engineFailed=true;state.damage.burning=false;state.damage.crashIgnitionRemaining=null;
}
function stepSwimming(dt,water){
 const g=groundEscape,target=water-1.25;g.velocity.y=smooth(g.velocity.y,player.position.y<target?2.6:-.9,4,dt);player.position.y+=g.velocity.y*dt;if(player.position.y>target&&g.velocity.y>0){player.position.y=target;g.velocity.y=0;}g.airborne=false;g.impactPending=false;
 g.oxygen=Number.isFinite(g.oxygen)?g.oxygen:18;if(player.position.y+1.55<water-.05)g.oxygen=Math.max(0,g.oxygen-dt);else g.oxygen=Math.min(18,g.oxygen+dt*4);if(g.oxygen<10)dangerAlert('swim-air','SWIMMING UP · AIR '+Math.ceil(g.oxygen)+' S','Keep swimming toward the surface and shore.','critical','water');if(g.oxygen<=0)hurtGroundEscape(dt*12,'Drowned while underwater');
}

function stepNpcSubmersion(ai,dt,level=null){const p=ai.profile;if(!ai.sinking){if(level===null)return false;ai.sinking={level,age:0,vy:0};ai.npcCrash=null;ai.pursuing=false;ai.damage??=VehicleDamageModel.create(p);}const s=ai.sinking;s.age+=dt;ai.speed*=Math.exp(-dt*2);ai.impulseX=ai.impulseZ=0;s.vy=smooth(s.vy,-(.15+Math.min(1,s.age/15)),2,dt);ai.root.position.y=Math.max(sinkingBedAt(ai.root.position.x,ai.root.position.z,s.level),ai.root.position.y+s.vy*dt);if(s.age>2){ai.damage.engineFailed=true;ai.damage.components.engine=0;ai.damage.reason='Engine flooded';ai.health=0;}ai.damage.burning=false;ai.damage.crashIgnitionRemaining=null;if(s.age>30){preserveTrafficWreck(ai);resetTrafficDamage(ai);ai.path=null;ai.root.setEnabled(false);}return true;}
