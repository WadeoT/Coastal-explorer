const atc={status:'idle',target:null,requestedAt:0,decisionAt:0,clearanceUntil:0,holds:0,message:'Select a map landing pin, or request a landing below your aircraft.'};
let policeAirUnit=null;
function atcHasClearance(position){if(!['approved','landed'].includes(atc.status)||state.elapsed>atc.clearanceUntil||!atc.target)return false;const t=atc.target;return Math.hypot(position.x-t.x,position.z-t.z)<220;}
function landingAssessment(target){
 const servicePad=repairPadAt(target.x,target.z),h=servicePad?.pad.y??terrainHeight(target.x,target.z);if(h===null)return {ok:false,reason:'Terrain not available at this location.'};
 if(mappedWaterAt(target.x,target.z)!==null)return {ok:false,reason:'Water landing refused for this aircraft.'};
 if(!servicePad&&buildingsNear(target.x,target.z,20).some(b=>pointInPolygon(target.x,target.z,b.points)))return {ok:false,reason:'No approved rooftop pad at this building.'};
 const zone=gameAirspace.zones.find(z=>{const p=geoToLocal(z.lat,z.lon);return Math.hypot(p.x-target.x,p.z-target.z)<z.radius;});
 if(zone?.id==='training-zone')return {ok:false,reason:'Military training exclusion · civilian landing refused.'};
 if(state.profile?.kind==='jet'&&!zone)return {ok:false,reason:'Fighter landing requires an airfield runway slot.'};
 if(state.wanted>=3)return {ok:false,reason:'Landing clearance refused during an active high-priority police pursuit.'};
 if(worldUpgrade.weather==='storm')return {ok:false,reason:'Unsafe weather · severe storm landing restriction.'};
 const road=nearestRoad(target.x,target.z);if(!servicePad&&road&&road.dist<road.path.width/2+9)return {ok:false,reason:'Active road or roadside is not a safe landing site.'};
 const access=groundAccessAt(target);if(!servicePad&&access&&(!zone||access.name==='PRIVATE GROUNDS')&&!activities.active?.profession)return {ok:false,reason:'Private or protected grounds · landowner authorization unavailable.'};
 const heights=[[-14,0],[14,0],[0,-14],[0,14]].map(([x,z])=>terrainHeight(target.x+x,target.z+z)).filter(Number.isFinite);if(!servicePad&&(heights.length<4||Math.max(...heights)-Math.min(...heights)>4))return {ok:false,reason:'Landing surface is too steep or obstructed.'};
 const busy=[...Multiplayer.remotes.values()].some(r=>Math.hypot(r.target.x-target.x,r.target.z-target.z)<300&&r.target.y-h<250);
 return {ok:true,busy,zone:zone?.id||null,reason:zone?'Airport operations approved a local landing slot.':'Visual landing site approved after terrain and access checks.'};
}
function requestLandingClearance(){
 if(!isAircraft()||state.mode!=='playing'){toast('Choose an aircraft and resume flight to contact ATC.');return false;}
 if(['queued','reviewing','holding'].includes(atc.status)){toast('ATC is still processing your request.');return false;}
 const pin=mapView.selection,target=pin?{x:pin.x,z:pin.z}:{x:player.position.x,z:player.position.z};
 Object.assign(atc,{status:'queued',target,requestedAt:state.elapsed,decisionAt:state.elapsed+2,clearanceUntil:0,holds:0,message:'Request transmitted · waiting for ATC acknowledgement.'});updateAtcUI();return true;
}
function updateAtc(dt){
 if(atc.status==='queued'&&state.elapsed>=atc.decisionAt){atc.status='reviewing';atc.decisionAt=state.elapsed+6;atc.message='ATC reviewing site, airspace, weather, traffic and access.';}
 else if(['reviewing','holding'].includes(atc.status)&&state.elapsed>=atc.decisionAt){const result=landingAssessment(atc.target);
  if(result.ok&&result.busy&&atc.holds<2){atc.status='holding';atc.holds++;atc.decisionAt=state.elapsed+8;atc.message='Hold outside the landing area · conflicting aircraft traffic.';}
  else if(!result.ok||result.busy){atc.status='denied';atc.message=result.busy?'Landing refused · traffic did not clear.':result.reason;dangerAlert('atc-denied','ATC · LANDING DENIED',atc.message,'warning','airspace');}
  else{atc.status='approved';atc.clearanceUntil=state.elapsed+120;atc.zone=result.zone;atc.message='Cleared at the selected site · 220 m radius · valid 120 seconds.';toast('ATC · LANDING CLEARED',5000);}
 }
 if(['approved','landed'].includes(atc.status)&&state.elapsed>atc.clearanceUntil){atc.status='expired';atc.message='Landing clearance expired · request a new slot.';}
 if(atc.status==='approved'&&atcHasClearance(player.position)&&state.grounded&&player.position.y-motion.lastSurface-state.profile.clearance<2&&state.speed<2){atc.status='landed';atc.message='Landing complete · local clearance remains until its expiry.';}
 updateAtcUI();
}
function updateAtcUI(){const box=$('atcPanel');if(!box)return;$('atcCompact').hidden=!isAircraft();if(!isAircraft())box.hidden=true;$('atcStatus').textContent=atc.status.toUpperCase()+' · '+atc.message;$('atcRequest').disabled=['queued','reviewing','holding'].includes(atc.status);}
function initialiseAtc(){const box=document.createElement('section');box.id='atcPanel';box.hidden=true;box.innerHTML='<button id="atcRequest" class="source-btn">REQUEST LANDING CLEARANCE</button><span id="atcStatus"></span>';document.body.append(box);$('atcRequest').onclick=requestLandingClearance;const compact=document.createElement('button');compact.id='atcCompact';compact.className='source-btn';compact.textContent='ATC';compact.hidden=true;compact.title='Air traffic control · T';compact.onclick=()=>{box.hidden=!box.hidden;updateAtcUI();};document.body.append(compact);}

function canFireNoseGun(forward,delta){const distance=delta.length();return distance>25&&distance<900&&V.Dot(forward.normalize(),delta.scale(1/distance))>=Math.cos(4*RAD);}
function fireInterceptorNose(i){
 if(rescueDispatchActive()&&(state.aggressionUntil||0)<=state.elapsed)return false;
 i.root.computeWorldMatrix(true);const from=V.TransformCoordinates(new V(0,.15,-8.5),i.root.getWorldMatrix()),forward=i.root.getDirection(new V(0,0,-1)).normalize(),delta=worldBodyPoint(new V(0,.35,0)).subtract(from);
 if(!canFireNoseGun(forward,delta)||!hasLineOfSight(from,player.position))return false;
 collider.computeWorldMatrix(true);const ray=new Ray(from,forward,900),hit=scene.pickWithRay(ray,m=>(m===collider||m.metadata?.openSolid)&&m.isEnabled()),end=hit?.pickedPoint||from.add(forward.scale(900));
 const line=MB.CreateLines('interceptor-nose-cannon',{points:[from,end]},scene);line.color=new C(1,.65,.2);line.isPickable=false;later(()=>line.dispose(),100);i.lastShot={from:from.clone(),direction:forward.clone(),hit:hit?.pickedMesh===collider};
 if(hit?.pickedMesh===collider)playerBulletHit(from,forward,900,hit.pickedPoint,.3);return true;
}
function updateAirPursuit(dt){
 const agl=player.position.y-motion.lastSurface-state.profile.clearance,enabled=Multiplayer.serverSettings.policeEnabled!==false;
 if(enabled&&!rescueDispatchActive()&&state.wanted>=2&&agl>12&&!policeAirUnit){const root=new Node('police-air-support',scene),old=exteriorRotor;buildDetailedChopper(root,profiles.heli);const rotor=exteriorRotor;exteriorRotor=old;batchVehicle(root);root.position.set(player.position.x+650,player.position.y+80,player.position.z+550);policeAirUnit={root,rotor,yaw:motion.yaw};dangerAlert('air-support','POLICE AIR SUPPORT','A helicopter is tracking your aircraft.','warning','airspace');}
 if(policeAirUnit){if(!enabled||state.wanted===0){disposeFlightActor(policeAirUnit.root);policeAirUnit=null;}else{const p=policeAirUnit.root.position,target=player.position.add(new V(motion.vx*1.5,65,motion.vz*1.5)),delta=target.subtract(p),dist=delta.length(),step=Math.min(dist,72*dt);if(dist>110)p.addInPlace(delta.normalize().scale(step));policeAirUnit.yaw+=clamp(angleDelta(Math.atan2(player.position.x-p.x,-(player.position.z-p.z)),policeAirUnit.yaw),-dt,dt);policeAirUnit.root.rotation.y=-policeAirUnit.yaw;if(policeAirUnit.rotor)policeAirUnit.rotor.rotation.y+=48*dt;}}
 for(const i of gameAirspace.interceptors){if(!enabled||state.wanted<5||(rescueDispatchActive()&&(state.aggressionUntil||0)<=state.elapsed))continue;i.age+=dt;i.fire-=dt;const distance=V.Distance(i.root.position,player.position),lead=clamp(distance/650,0,1.3),target=player.position.add(new V(motion.vx*lead,.35+motion.vy*lead,motion.vz*lead)),delta=target.subtract(i.root.position);let desired=Math.atan2(delta.x,-delta.z);
  if(distance<100)i.passUntil=i.age+2;if(i.age<(i.passUntil||0))desired=i.yaw;
  i.yaw+=clamp(angleDelta(desired,i.yaw),-.85*dt,.85*dt);i.speed=smooth(i.speed,distance<500?110:225,1.2,dt);i.pitch=smooth(i.pitch||0,clamp(Math.atan2(delta.y,Math.hypot(delta.x,delta.z)),-.6,.6),1.8,dt);
  i.root.position.addInPlace(new V(Math.sin(i.yaw)*Math.cos(i.pitch)*i.speed*dt,Math.sin(i.pitch)*i.speed*dt,-Math.cos(i.yaw)*Math.cos(i.pitch)*i.speed*dt));const g=terrainHeight(i.root.position.x,i.root.position.z);if(g!==null)i.root.position.y=Math.max(i.root.position.y,g+35);i.root.rotation.set(i.pitch,-i.yaw,clamp(angleDelta(desired,i.yaw),-.7,.7));
  if(i.age>5&&i.fire<=0&&fireInterceptorNose(i)){i.burst=(i.burst||0)+1;i.fire=i.burst%3===0?2.2:.22;}
 }
}
function airPoliceWitnesses(){if(!isAircraft()||!state.wanted)return false;const agl=player.position.y-motion.lastSurface;
 if(policeAirUnit&&V.Distance(policeAirUnit.root.position,player.position)<1500&&hasLineOfSight(policeAirUnit.root.position,player.position))return true;
 if(gameAirspace.interceptors.some(i=>i.active&&V.Distance(i.root.position,player.position)<2300&&hasLineOfSight(i.root.position,player.position)))return true;
 return agl>30&&gameAirspace.zones.some(z=>{const p=geoToLocal(z.lat,z.lon);return Math.hypot(player.position.x-p.x,player.position.z-p.z)<z.radius+2000;});
}
