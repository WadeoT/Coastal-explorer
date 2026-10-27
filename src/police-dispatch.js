const POLICE_STATION_DATA=/*__POLICE_STATIONS__*/{};let nextPoliceDispatch=0;
function policeStrength(stars){return [0,2,4,6,9,12][clamp(stars,0,5)]||0;}
function dispatchPoliceUnit(ai,preferStation=false){
 const p=player.position,stations=(POLICE_STATION_DATA.stations||[]).map(s=>({...s,point:geoToLocal(s.lat,s.lon)})).sort((a,b)=>Math.hypot(a.point.x-p.x,a.point.z-p.z)-Math.hypot(b.point.x-p.x,b.point.z-p.z));
 if(preferStation)for(const s of stations.slice(0,3)){if(Math.hypot(s.point.x-p.x,s.point.z-p.z)<120)continue;for(const offset of [0,18,-18,35])if(placeOnRoad(ai,s.point.x+offset,s.point.z)){ai.dispatchSource=s.name;ai.stationId=s.osmId;ai.stuckTime=0;ai.root.setEnabled(true);return true;}}
 for(let attempt=0;attempt<24;attempt++){const a=(ai.index%12)/12*TAU+attempt*.47,r=300+attempt*17;if(placeOnRoad(ai,p.x+Math.sin(a)*r,p.z+Math.cos(a)*r)){ai.dispatchSource='roaming patrol';ai.stuckTime=0;return true;}}return false;
}
function deployPoliceForWanted(){
 const desired=policeStrength(state.wanted);let units=trafficPool.filter(a=>a.isPoliceUnit);
 while(units.length<Math.max(4,desired)){const ai=createTrafficCar(trafficPool.length,true);ai.isPoliceUnit=true;ai.reserve=true;ai.health=100;ai.damage=VehicleDamageModel.create({kind:'car'});ai.disabledByDispatch=true;ai.root.setEnabled(false);trafficPool.push(ai);units.push(ai);}
 const ordered=[...units].sort((a,b)=>{const da=a.root.isEnabled()?Math.hypot(a.root.position.x-player.position.x,a.root.position.z-player.position.z):1e9,db=b.root.isEnabled()?Math.hypot(b.root.position.x-player.position.x,b.root.position.z-player.position.z):1e9;return da-db;});
 for(const [i,ai] of ordered.entries()){ai.disabledByDispatch=!!ai.reserve&&i>=desired;setPolice(ai,true);ai.pursuing=state.wanted>0&&i<desired;if(ai.disabledByDispatch){ai.root.setEnabled(false);continue;}if(ai.pursuing&&(!ai.path||!ai.root.isEnabled()||Math.hypot(ai.root.position.x-player.position.x,ai.root.position.z-player.position.z)>5000)){dispatchPoliceUnit(ai,ai.reserve&&i%3===0);ai.speed=Math.min(ai.targetSpeed||12,18);}}
}
function maintainPolicePatrols(dt){
 nextPoliceDispatch-=dt;if(nextPoliceDispatch>0)return;nextPoliceDispatch=1;
 for(const ai of trafficPool){if(!ai.isPoliceUnit||ai.disabledByDispatch||ai.health<=0)continue;const distance=Math.hypot(ai.root.position.x-player.position.x,ai.root.position.z-player.position.z);
  if((!ai.pursuing&&distance>1500)||(ai.pursuing&&distance>6500)||!ai.root.isEnabled()){dispatchPoliceUnit(ai,false);continue;}
  if(ai.pursuing){const moved=ai.dispatchLast?Math.hypot(ai.root.position.x-ai.dispatchLast.x,ai.root.position.z-ai.dispatchLast.z):10;ai.stuckSeconds=moved<.45?(ai.stuckSeconds||0)+1:0;ai.dispatchLast={x:ai.root.position.x,z:ai.root.position.z};
   if(ai.stuckSeconds>=3){const road=nearestRoad(ai.root.position.x,ai.root.position.z);if(road){ai.rejoinRoad={x:road.x,z:road.z};ai.yaw+=Math.PI*.55;ai.speed=3;}if(ai.stuckSeconds>12&&distance>160){dispatchPoliceUnit(ai,false);ai.stuckSeconds=0;}}
  }
 }
}
function airGroundIntercept(ai){if(!isAircraft())return null;if(ai.intercept&&state.elapsed<(ai.interceptUntil||0)&&Math.hypot(player.position.x-ai.interceptPlayerX,player.position.z-ai.interceptPlayerZ)<180)return ai.intercept;
 const forecast={x:player.position.x+motion.vx*8,z:player.position.z+motion.vz*8},paths=roadsNear(forecast.x,forecast.z,1400).filter(p=>p.length>100&&!['service','track'].includes(p.highway));paths.sort((a,b)=>Math.hypot((a.bounds.minX+a.bounds.maxX)/2-forecast.x,(a.bounds.minZ+a.bounds.maxZ)/2-forecast.z)-Math.hypot((b.bounds.minX+b.bounds.maxX)/2-forecast.x,(b.bounds.minZ+b.bounds.maxZ)/2-forecast.z));
 if(!paths.length)return null;const path=paths[ai.index%Math.min(12,paths.length)],point=samplePath(path,clamp(path.length*(.2+(ai.index%4)*.18),15,path.length-10),1,Math.min(2,path.width/4));ai.intercept={x:point.x,z:point.z};ai.interceptUntil=state.elapsed+6;ai.interceptPlayerX=player.position.x;ai.interceptPlayerZ=player.position.z;return ai.intercept;
}
function drawPoliceStations(ctx,project,mini){if(mini)return;ctx.save();ctx.fillStyle='#789ed9';ctx.font='bold 14px sans-serif';for(const s of POLICE_STATION_DATA.stations||[]){const p=project(geoToLocal(s.lat,s.lon));if(p.x>8&&p.y>8&&p.x<ctx.canvas.width-8&&p.y<ctx.canvas.height-8)ctx.fillText('P',p.x,p.y);}ctx.restore();}
