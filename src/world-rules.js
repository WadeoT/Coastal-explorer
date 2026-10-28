const collisionCells=new Map(),restrictedCells=new Map();let collisionCount=-1,restrictionClock=0,propertyViolation=0;
function indexCollisionObjects(){collisionCells.clear();for(const o of obstacles){const w=(o.w||o.radius||1)+2,d=(o.d||o.radius||1)+2;for(let x=Math.floor((o.x-w)/128);x<=Math.floor((o.x+w)/128);x++)for(let z=Math.floor((o.z-d)/128);z<=Math.floor((o.z+d)/128);z++){const k=x+','+z;if(!collisionCells.has(k))collisionCells.set(k,[]);collisionCells.get(k).push(o);}}collisionCount=obstacles.length;}
function collisionObjectsNear(a,b,reach){if(collisionCount!==obstacles.length)indexCollisionObjects();const out=new Set();for(let x=Math.floor((Math.min(a.x,b.x)-reach)/128);x<=Math.floor((Math.max(a.x,b.x)+reach)/128);x++)for(let z=Math.floor((Math.min(a.z,b.z)-reach)/128);z<=Math.floor((Math.max(a.z,b.z)+reach)/128);z++)for(const o of collisionCells.get(x+','+z)||[])out.add(o);return addSolidTraffic(out,a,b,reach);}
function objectContact(o,position,p){
 if(o.removed||o.destroyed)return false;
 // A low raised island is a wheel/foot support surface, not an enclosing body wall.
 if(o.kind==='roundabout-island'&&o.height<=.28&&(!p.kind||['car','bike'].includes(p.kind)))return false;
 const radius=Math.max(.2,p.width*.47-(state.sideCrush||0)),reach=p.length*.36,fx=Math.sin(motion.yaw),fz=-Math.cos(motion.yaw);
 if(position.y-p.clearance>o.baseY+o.height+.12||position.y+Math.max(.7,p.eye-p.clearance)<o.baseY)return false;
 for(const side of [-1,0,1]){const length=Math.max(.2,reach-(side>0?state.frontCrush||0:state.rearCrush||0)),x=position.x+fx*length*side,z=position.z+fz*length*side;
  if(o.polygon){if(nearPolygon(x,z,o.polygon,radius)&&![...(o.holes||[]),...(o.garageBay&&position.y+Math.max(.7,p.eye-p.clearance)<o.bayCeiling?[o.garageBay]:[])].some(h=>pointInPolygon(x,z,h)&&polygonEdgeDistance(x,z,h)>radius))return true;}
  else if(Math.hypot(x-o.x,z-o.z)<radius+(o.radius||.2))return true;
 }return false;
}
function solidContactResponse(o,before,velocity){
 let point=null,best=Infinity;
 if(o.polygon)for(let i=0;i<o.polygon.length;i++){const a=o.polygon[i],b=o.polygon[(i+1)%o.polygon.length],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((before.x-a.x)*dx+(before.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1),x=a.x+dx*t,z=a.z+dz*t,d=Math.hypot(before.x-x,before.z-z);if(d<best){best=d;point={x,z};}}
 if(!point){const dx=before.x-o.x,dz=before.z-o.z,len=Math.hypot(dx,dz)||1;point={x:o.x+dx/len*(o.radius||.2),z:o.z+dz/len*(o.radius||.2)};}
 let nx=before.x-point.x,nz=before.z-point.z,len=Math.hypot(nx,nz);if(len<.001){nx=-velocity.x;nz=-velocity.z;len=Math.hypot(nx,nz)||1;}nx/=len;nz/=len;
 const closing=velocity.x*nx+velocity.z*nz,speed=Math.max(0,-closing);if(closing<0){motion.vx=(velocity.x-closing*nx)*.35;motion.vz=(velocity.z-closing*nz)*.35;}
 return {x:point.x,z:point.z,normal:{x:nx,z:nz},speed,solid:true,kind:o.kind||'building'};
}
function collideMappedWorld(prevX,prevZ){
 if(worldUpgrade.collisions===false&&adminPanelUnlocked())return;
 const p=state.profile,end=player.position.clone(),start=new V(prevX,state.stepStart&&Math.abs(state.stepStart.x-prevX)<.01&&Math.abs(state.stepStart.z-prevZ)<.01?state.stepStart.y:end.y,prevZ),distance=V.Distance(start,end),velocity=new V(motion.vx,motion.vy,motion.vz),extent=p.length*.4+p.width*.5;
 const objects=collisionObjectsNear(start,end,extent),steps=Math.min(80,Math.max(1,Math.ceil(distance/.35)));let last=start.clone();
 for(let step=1;step<=steps;step++){
  const at=V.Lerp(start,end,step/steps);
  for(const o of objects){if(!objectContact(o,at,p))continue;
   // Allow a vehicle already touching a surface to move away from it.
   if(objectContact(o,start,p)&&Math.hypot(end.x-o.x,end.z-o.z)>Math.hypot(start.x-o.x,start.z-o.z)+.02)continue;
   player.position.copyFrom(last);const impact=solidContactResponse(o,last,velocity);state.lastCollision={kind:o.kind||'building',x:o.x,z:o.z,roof:o.baseY+o.height};if(impact.speed<3&&Math.abs(velocity.y)>3){impact.speed=Math.abs(velocity.y);impact.normal={x:-Math.sin(motion.yaw),z:Math.cos(motion.yaw)};impact.vertical=true;motion.vy=0;if(o.polygon)state.wreckSurface={height:o.baseY+o.height,polygon:o.polygon};}
   if(impact.speed>2.8&&!o.ownerActor&&!o.ownerVehicle&&state.elapsed-(o.lastWorldImpact||-10)>.2){o.lastWorldImpact=state.elapsed;damageWorldObject(o,impact);if(o.removed&&o.buildingId===undefined){const factor=1-Math.min(.8,obstacleMass(o)/(p.mass+obstacleMass(o)));motion.vx=velocity.x*factor;motion.vz=velocity.z*factor;player.position.copyFrom(at);dentVehicle(bodyPoint(new V(impact.x,last.y+.2,impact.z)),.05,.45);return impact;}}if(state.collisionCooldown<=0&&impact.speed>2.8){if(o.ownerActor)recordNpcCrash(o.ownerActor,impact.speed*.6,new V(impact.x,last.y+.2,impact.z),impact.normal,'vehicle');if(o.ownerVehicle)damageParkedVehicle(o,impact);recordCrash(impact.speed,new V(impact.x,last.y+.2,impact.z),impact);state.collisionCooldown=.6;}
   return impact;
  }last=at;
 }
 // Vertical roof strikes and contact with actual generated canopies/poles.
 if(isAircraft()&&distance>.005){const lift=Math.max(.25,p.eye-p.clearance)*.4,origin=start.add(new V(0,lift,0)),dir=end.subtract(start).normalize(),ray=new Ray(origin,dir,distance+.25),hit=scene.pickWithRay(ray,m=>!!m.metadata?.openSolid&&m.isEnabled());
  if(hit?.hit){const normal=hit.getNormal(true)||dir.scale(-1),speed=Math.max(0,-V.Dot(velocity,normal));player.position.copyFrom(start);motion.vx=motion.vz=0;motion.vy=Math.max(0,motion.vy);const impact={x:hit.pickedPoint.x,z:hit.pickedPoint.z,normal:{x:normal.x,z:normal.z},speed,solid:true,kind:'scenery',meshName:hit.pickedMesh?.name};state.lastCollision={kind:impact.kind,meshName:impact.meshName};if(state.collisionCooldown<=0&&speed>3){recordCrash(speed,hit.pickedPoint,impact);state.collisionCooldown=.6;}return impact;}
 }
 return null;
}
function indexRestrictedGround(){restrictedCells.clear();for(const area of landFeatures){const t=area.tags,restricted=['private','no','permit'].includes(t.access)||['military','industrial','construction'].includes(t.landuse)||['park','nature_reserve','playground','pitch','golf_course'].includes(t.leisure)||t.landuse==='residential';if(!restricted)continue;for(let x=Math.floor(area.bounds.minX/512);x<=Math.floor(area.bounds.maxX/512);x++)for(let z=Math.floor(area.bounds.minZ/512);z<=Math.floor(area.bounds.maxZ/512);z++){const k=x+','+z;if(!restrictedCells.has(k))restrictedCells.set(k,[]);restrictedCells.get(k).push(area);}}}
function groundAccessAt(position){
 if(workshopAccessAt(position))return null;
 const road=nearestRoad(position.x,position.z);if(road&&road.dist<=road.path.width/2+4&&!['private','no','permit'].includes(road.path.tags?.access))return null;
 for(const a of restrictedCells.get(Math.floor(position.x/512)+','+Math.floor(position.z/512))||[])if(pointInPolygon(position.x,position.z,a.points))return {name:a.tags.name||({residential:'PRIVATE GROUNDS',industrial:'RESTRICTED INDUSTRIAL YARD',military:'MILITARY AREA',construction:'CONSTRUCTION SITE'}[a.tags.landuse])||'PROTECTED GROUNDS',source:a.tags.access?'mapped access restriction':'gameplay off-road restriction'};
 return null;
}
function updateGroundAccess(dt){if(passengerRide.active)return;if(!state.profile||!['car','bike'].includes(state.profile.kind)||!state.grounded){propertyViolation=0;return;}restrictionClock+=dt;if(restrictionClock<.25)return;const elapsed=restrictionClock;restrictionClock=0;const area=groundAccessAt(player.position);if(area){propertyViolation+=elapsed;if(propertyViolation<.6)dangerAlert('trespass','RESTRICTED GROUNDS',area.name+' · Return to a public road.','warning');if(propertyViolation>2)addCrime(elapsed*12,'trespass · '+area.name);}else{propertyViolation=0;dangerState.active.delete('trespass');}}
