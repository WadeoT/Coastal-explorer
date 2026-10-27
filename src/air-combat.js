// Local arcade air combat. All rounds follow the aircraft nose, never the camera.
const airCombat={ammo:578,heat:0,overheated:false,nextShot:0,flares:12,flareUntil:0,flareReady:0,ejection:null,wrecks:[],effects:[],range:null,lastShot:null};
const airMaterials=new Map();
function airMaterial(name,colour,glow=0){if(!airMaterials.has(name))airMaterials.set(name,mat(name,colour,glow));return airMaterials.get(name);}
function resetAirCombat(){
 if(airCombat.ejection)disposeFlightActor(airCombat.ejection.root);
 while(airCombat.wrecks.length>12)disposeFlightActor(airCombat.wrecks.shift().root);
 for(const e of airCombat.effects)e.mesh.dispose(false,!!e.ownedMaterial);
 if(airCombat.range)airCombat.range.root.dispose(false,false);
 Object.assign(airCombat,{ammo:578,heat:0,overheated:false,nextShot:0,flares:12,flareUntil:0,flareReady:0,ejection:null,wrecks:airCombat.wrecks,effects:[],range:null,lastShot:null});
}
const interceptorVolumes=[{min:{x:-1.25,y:.3,z:-8.5},max:{x:1.25,y:2.7,z:8.3}},{min:{x:-5.5,y:1.15,z:-1.8},max:{x:5.5,y:1.55,z:3.6}},{min:{x:-3.1,y:1.1,z:5.1},max:{x:3.1,y:1.7,z:8.2}}];
function prepareInterceptor(i){
 if(i.hitboxes)return;i.health=100;i.active=true;i.previous=i.root.position.clone();i.hitboxes=[];
 for(const b of interceptorVolumes){const mesh=box('interceptor-solid',b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z,(b.min.x+b.max.x)/2,(b.min.y+b.max.y)/2,(b.min.z+b.max.z)/2,materials.dark,i.root);mesh.isVisible=false;mesh.isPickable=true;mesh.metadata={airInterceptor:i};i.hitboxes.push(mesh);}
}
function impactSpark(point,colour='#ffb44c',size=.45){
 // Bound transient effects even during sustained cannon fire.
 if(airCombat.effects.length>=36){const old=airCombat.effects.shift();old.mesh.dispose(false,!!old.ownedMaterial);}
 const mesh=MB.CreateSphere('cannon-impact',{diameter:size,segments:5},scene);mesh.position.copyFrom(point);mesh.material=airMaterial('air-impact-'+colour,colour,1);mesh.isPickable=false;airCombat.effects.push({mesh,life:.24,max:.24});
}
function disableInterceptor(i,reason='cannon'){if(!i.active)return;i.active=false;i.health=0;for(const h of i.hitboxes||[])h.setEnabled(false);const velocity=new V(Math.sin(i.yaw||0)*(i.speed||100),-8,-Math.cos(i.yaw||0)*(i.speed||100));airCombat.wrecks.push({root:i.root,velocity,age:0,interceptor:true,hitGround:false});impactSpark(i.root.position,'#ff7a34',4);toast('INTERCEPTOR DISABLED · '+reason.toUpperCase(),2000);}
function fireJetCannon(){
 if(state.vehicleId!=='jet'||state.mode!=='playing'||airCombat.ejection||state.damage?.driverDead||state.elapsed<airCombat.nextShot)return false;
 if(airCombat.ammo<=0||airCombat.overheated)return false;
 for(const i of gameAirspace.interceptors)prepareInterceptor(i);
 player.computeWorldMatrix(true);const from=worldBodyPoint(new V(-.53,1.36-state.profile.clearance,-7.45)),direction=player.getDirection(new V(0,0,-1)).normalize(),range=1800;
 for(const i of gameAirspace.interceptors)for(const h of i.hitboxes||[])h.computeWorldMatrix(true);
 for(const a of trafficPool)a.hitbox.computeWorldMatrix(true);
 const hit=scene.pickWithRay(new Ray(from,direction,range),m=>m.isEnabled()&&(m.metadata?.openSolid||m.metadata?.traffic||m.metadata?.airInterceptor||m.metadata?.rangeTarget));
 const end=hit?.pickedPoint||from.add(direction.scale(range)),line=MB.CreateLines('F18-nose-cannon',{points:[from,end]},scene);line.color=new C(1,.8,.35);line.isPickable=false;if(airCombat.effects.length>=36){const old=airCombat.effects.shift();old.mesh.dispose(false,!!old.ownedMaterial);}airCombat.effects.push({mesh:line,ownedMaterial:true,life:.07,max:.07});
 airCombat.ammo--;airCombat.heat=clamp(airCombat.heat+.038,0,1);airCombat.overheated=airCombat.heat>=1;airCombat.nextShot=state.elapsed+1/12;
 airCombat.lastShot={from:from.clone(),direction:direction.clone(),hit:hit?.pickedMesh?.name||null};
 const target=hit?.pickedMesh?.metadata,trainingShot=airCombat.range&&!target?.traffic&&!target?.openSolid&&airCombat.range.targets.some(t=>t.isEnabled()&&V.Dot(direction,t.position.subtract(from).normalize())>Math.cos(12*RAD));
 if(hit?.hit){impactSpark(end);if(target?.airInterceptor){const i=target.airInterceptor;i.health=Math.max(0,i.health-22);if(!i.health)disableInterceptor(i);}else if(target?.traffic){const a=trafficPool[target.index];trafficBulletHit(a,from,direction,range,end);}else if(target?.rangeTarget)hitRangeTarget(hit.pickedMesh);}
 if(!target?.rangeTarget&&!trainingShot){state.aggressionUntil=state.elapsed+20;addCrime(18,'fighter cannon discharge');}
 return true;
}
function sweptInterceptorContact(i,start,end){
 if(!i.active)return null;const previous=i.previous||i.root.position,relativeStart=start.add(i.root.position.subtract(previous));i.root.computeWorldMatrix(true);const inverse=Matrix.Invert(i.root.getWorldMatrix()),a=V.TransformCoordinates(relativeStart,inverse),b=V.TransformCoordinates(end,inverse),delta=b.subtract(a),length=delta.length(),direction=length>1e-8?delta.scale(1/length):new V(0,0,-1),radius=state.profile.kind==='jet'?1.6:state.profile.kind==='heli'?2:1;
 let nearest=Infinity;for(const v of interceptorVolumes){const expanded={min:{x:v.min.x-radius,y:v.min.y-radius,z:v.min.z-radius},max:{x:v.max.x+radius,y:v.max.y+radius,z:v.max.z+radius}},t=VehicleDamageModel.rayBox(a,direction,expanded,Math.max(.001,length));if(t!==null)nearest=Math.min(nearest,t);}
 return Number.isFinite(nearest)?V.Lerp(start,end,length>0?clamp(nearest/length,0,1):0):null;
}
function deployFlares(){if(state.vehicleId!=='jet'||airCombat.ejection||state.mode!=='playing'||airCombat.flares<2||state.elapsed<airCombat.flareReady)return false;airCombat.flares-=2;airCombat.flareUntil=state.elapsed+2.3;airCombat.flareReady=state.elapsed+8;
 for(const side of [-1,1]){const mesh=MB.CreateSphere('fighter-countermeasure-flare',{diameter:.24,segments:6},scene);mesh.position.copyFrom(player.position);mesh.material=airMaterial('countermeasure-flare','#fff1c2',1);mesh.isPickable=false;airCombat.effects.push({mesh,velocity:new V(side*12,2,8),life:2.3,max:2.3});}toast('FLARES · brief visual tracking disruption · 8s recharge',2200);return true;}
function createEjectedPilot(parent,canopy=true){
 const root=new Node('ejected-pilot-parachute',scene);root.parent=parent||null;
 const suit=airMaterial('pilot-flight-suit','#59675a'),cloth=airMaterial('parachute-cloth','#d69b36');
 box('pilot-torso',.42,.58,.28,0,.9,0,suit,root);const helmet=MB.CreateSphere('pilot-helmet',{diameter:.28,segments:8},scene);helmet.position.set(0,1.34,0);helmet.parent=root;helmet.material=materials.dark;
 for(const side of [-1,1]){box('pilot-leg',.14,.50,.16,side*.12,.37,0,suit,root);box('pilot-arm',.12,.5,.13,side*.28,1.0,0,suit,root);}
 const chute=new Node('deployed-parachute',scene);chute.parent=root;chute.setEnabled(canopy);const dome=MB.CreateSphere('parachute-canopy',{diameter:1,segments:12,slice:.5},scene);dome.parent=chute;dome.position.y=4.1;dome.scaling.set(5.6,1.7,3.5);dome.material=cloth;dome.isPickable=false;
 for(const x of [-2.5,2.5])for(const z of [-1.4,1.4])tube('parachute-cord',[[x,4.0,z],[Math.sign(x)*.2,1.1,0]],.009,materials.light,chute);
 root.metadata={ejected:true,canopy:chute};for(const m of root.getChildMeshes())m.isPickable=false;return root;
}
function ejectFighter(){
 if(state.vehicleId!=='jet'||airCombat.ejection||!['playing','wrecked'].includes(state.mode)||state.damage?.driverDead||state.damage?.exploded){toast('Ejection requires a living pilot in the F18.');return false;}
 if(player.position.y-motion.lastSurface-state.profile.clearance<3&&state.speed<5){toast('Ejection is disabled while parked.');return false;}
 const health=state.damage.components.driver,savedRotor=exteriorRotor,wreck=new Node('abandoned-F18',scene);constructVehicle(wreck,profiles.jet,'jet');exteriorRotor=savedRotor;batchVehicle(wreck);wreck.position.copyFrom(player.position).addInPlace(new V(0,-state.profile.clearance,0));wreck.rotation.copyFrom(player.rotation);
 airCombat.wrecks.push({root:wreck,velocity:new V(motion.vx,motion.vy,motion.vz),age:0,hitGround:false});cancelActivity('Pilot ejected');disposeFlightVisuals();state.crashFlight=state.solidCrash=null;resetVehicleDamage();state.damage.components.driver=health;state.mode='playing';state.bustedTime=0;$('busted').classList.add('hidden');
 const root=createEjectedPilot(player,false);root.position.y=-.8;airCombat.ejection={root,age:0,canopy:false,landed:false,velocity:new V(motion.vx*.28,14+Math.max(0,motion.vy*.2),motion.vz*.28)};
 cockpit.setEnabled(false);exterior.setEnabled(false);vehicleSystems?.root.setEnabled(false);aircraftControls?.root.setEnabled(false);damageGraphics?.fx.setEnabled(false);camera.parent=null;cameraMode='third-person';state.cameraMode=cameraMode;document.body.classList.add('third-person');motion.vx=motion.vz=motion.vy=0;motion.pitch=motion.roll=0;state.rpm=0;state.grounded=false;keys.clear();stopCameraDrag();toast('EJECTED · chute opens automatically · WASD steers · G after landing',6500);Multiplayer.sendState(true);return true;
}
function stepEjectedPilot(dt){
 const e=airCombat.ejection;if(!e)return;e.age+=dt;if(e.landed){motion.vx=motion.vz=motion.vy=0;state.speed=0;return;}
 if(e.age>=.9&&!e.canopy){e.canopy=true;e.root.metadata.canopy.setEnabled(true);}
 const turn=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);motion.yaw+=turn*dt*.9;const glide=(keys.has('KeyW')?9:keys.has('KeyS')?2:5);e.velocity.x=smooth(e.velocity.x,Math.sin(motion.yaw)*glide,e.canopy?2:.15,dt);e.velocity.z=smooth(e.velocity.z,-Math.cos(motion.yaw)*glide,e.canopy?2:.15,dt);e.velocity.y=e.canopy?smooth(e.velocity.y,-5.2,3,dt):e.velocity.y-9.81*dt;
 const before=player.position.clone();player.position.addInPlace(e.velocity.scale(dt));player.position.x=clamp(player.position.x,BOUNDS.minX+10,BOUNDS.maxX-10);player.position.z=clamp(player.position.z,BOUNDS.minZ+10,BOUNDS.maxZ-10);
 let surface=groundAt(player.position.x,player.position.z,Math.max(before.y,player.position.y),true)??motion.lastSurface;const hit=scene.pickWithRay(new Ray(before.add(new V(0,1,0)),new V(0,-1,0),Math.max(3,before.y-player.position.y+2)),m=>m.isEnabled()&&m.metadata?.openSolid);if(hit?.hit)surface=Math.max(surface,hit.pickedPoint.y);motion.lastSurface=surface;
 if(player.position.y<=surface+.8){player.position.y=surface+.8;e.landed=true;state.grounded=true;e.root.metadata.canopy.setEnabled(false);const impact=Math.abs(e.velocity.y);e.velocity.setAll(0);if(impact>7){VehicleDamageModel.hit(state.damage,'driver',(impact-7)*18,'hard parachute landing');finishDamageState();}if(!state.damage.driverDead){pilotLandedOnFoot(e);return;}if(!state.damage.driverDead)toast(mappedWaterAt(player.position.x,player.position.z)!==null?'SPLASHDOWN · flotation active · G requests recovery':'PILOT SAFE · press G to return to garage',6000);}
 motion.vx=e.velocity.x;motion.vz=e.velocity.z;motion.vy=e.velocity.y;state.speed=Math.hypot(e.velocity.x,e.velocity.z);player.rotation.set(0,-motion.yaw,0);
}
function updateEjectionCamera(dt,snap=false){const p=player.position,desired=p.add(new V(-Math.sin(motion.yaw+cameraLook.yaw)*9,4+Math.sin(cameraLook.pitch)*5,Math.cos(motion.yaw+cameraLook.yaw)*9));camera.parent=null;camera.position.copyFrom(V.Lerp(camera.position,desired,snap?1:1-Math.exp(-dt*7)));camera.rotation.z=0;camera.upVector.set(0,1,0);camera.setTarget(p.add(new V(0,1.3,0)));}
function startGunneryRange(){
 if(state.vehicleId!=='jet'||airCombat.ejection||state.mode!=='playing'){toast('Launch the F18 before starting gunnery practice.');return false;}if(airCombat.range){toast('Finish the current five-target run first.');return false;}
 const root=new Node('fighter-gunnery-course',scene),targets=[],forward=new V(Math.sin(motion.yaw),0,-Math.cos(motion.yaw)),right=new V(Math.cos(motion.yaw),0,Math.sin(motion.yaw));
 for(let n=0;n<5;n++){const point=player.position.add(forward.scale(550+n*240)).add(right.scale((n%2?1:-1)*90)),h=terrainHeight(point.x,point.z);point.y=Math.max(point.y,h===null?120:h+150);if(point.x<BOUNDS.minX+20||point.x>BOUNDS.maxX-20||point.z<BOUNDS.minZ+20||point.z>BOUNDS.maxZ-20){root.dispose(false,false);toast('Turn toward the coast interior before starting the range.');return false;}const mesh=MB.CreateSphere('gunnery-target-'+n,{diameter:18,segments:10},scene);mesh.parent=root;mesh.position.copyFrom(point);mesh.material=airMaterial('gunnery-orange','#f6a837',.5);mesh.isPickable=true;mesh.metadata={rangeTarget:true,index:n};targets.push(mesh);}
 airCombat.range={root,targets,origin:player.position.clone(),hits:0,started:state.elapsed,paid:false};toast('GUNNERY · 5 orange drones · 120 seconds · A$4,000 once on completion',6000);return true;
}
function hitRangeTarget(mesh){const r=airCombat.range;if(!r||!mesh.isEnabled())return;mesh.setEnabled(false);r.hits++;if(r.hits===5&&!r.paid){r.paid=true;economy.balance+=4000;saveCareer();updateWallet();toast('RANGE COMPLETE · +A$4,000',5000);r.root.dispose(false,false);airCombat.range=null;}}
function updateAirCombat(dt){
 airCombat.heat=Math.max(0,airCombat.heat-dt*fighterLoadout().cooling);if(airCombat.heat<.3)airCombat.overheated=false;
 for(const i of gameAirspace.interceptors){prepareInterceptor(i);if(!i.active||airCombat.ejection||state.mode!=='playing'||worldUpgrade.collisions===false)continue;const point=sweptInterceptorContact(i,state.stepStart||player.position,player.position);if(point){const velocity=new V(Math.sin(i.yaw||0)*(i.speed||0),0,-Math.cos(i.yaw||0)*(i.speed||0)),relative=new V(motion.vx,motion.vy,motion.vz).subtract(velocity).length();disableInterceptor(i,'mid-air collision');recordCrash(Math.max(12,relative*.7),point);break;}}
 for(const w of airCombat.wrecks){if(w.root.isDisposed()){w.disposed=true;continue;}w.age+=dt;if(!w.hitGround){w.velocity.y-=9.81*dt;w.root.position.addInPlace(w.velocity.scale(dt));w.root.rotation.z+=dt*.5;const h=mappedWaterAt(w.root.position.x,w.root.position.z)??terrainHeight(w.root.position.x,w.root.position.z);if(h!==null&&w.root.position.y<h+1){w.hitGround=true;w.root.position.y=h+1;w.velocity.setAll(0);impactSpark(w.root.position,'#ff7a34',8);for(const m of w.root.getChildMeshes())if(!m.metadata?.airInterceptor)m.visibility=.5;}}
  if(airCombat.wrecks.length>12&&w.age>25){disposeFlightActor(w.root);w.disposed=true;}}
 airCombat.wrecks=airCombat.wrecks.filter(w=>!w.disposed);gameAirspace.interceptors=gameAirspace.interceptors.filter(i=>!i.root.isDisposed());
 for(const e of airCombat.effects){e.life-=dt;if(e.velocity){e.velocity.y-=dt*3;e.mesh.position.addInPlace(e.velocity.scale(dt));}if(e.life<=0)e.mesh.dispose(false,!!e.ownedMaterial);}airCombat.effects=airCombat.effects.filter(e=>e.life>0);
 if(airCombat.range&&state.elapsed-airCombat.range.started>120){airCombat.range.root.dispose(false,false);airCombat.range=null;toast('Gunnery time expired. Try another approach.');}
 if(airCombat.ejection)for(const i of gameAirspace.interceptors)if(i.active)i.root.position.addInPlace(new V(Math.sin(i.yaw||0)*(i.speed||160)*dt,0,-Math.cos(i.yaw||0)*(i.speed||160)*dt));
 const hud=$('jetCombat');if(hud){hud.hidden=state.vehicleId!=='jet'||state.mode!=='playing';if(!hud.hidden){$('jetEject').disabled=!!airCombat.ejection;$('jetFlares').disabled=!!airCombat.ejection||airCombat.flares<2||state.elapsed<airCombat.flareReady;$('jetRange').disabled=!!airCombat.ejection||!!airCombat.range;$('jetCombatReadout').textContent=airCombat.ejection?(airCombat.ejection.landed?'PILOT SAFE · G GARAGE':airCombat.ejection.canopy?'PARACHUTE · WASD STEER':'EJECTION SEAT · CHUTE DEPLOYING'):'CANNON '+airCombat.ammo+'/'+fighterLoadout().maxAmmo+' · HEAT '+Math.round(airCombat.heat*100)+'%'+(airCombat.overheated?' · COOLING LOCK':'')+' · FLARES '+airCombat.flares+(state.elapsed<airCombat.flareReady?' · RECHARGING':'')+(airCombat.range?' · TARGETS '+airCombat.range.hits+'/5 · '+Math.ceil(120-state.elapsed+airCombat.range.started)+'s':'');}}
}
function initialiseAirCombat(){const box=document.createElement('section');box.id='jetCombat';box.hidden=true;box.innerHTML='<strong id="jetCombatReadout"></strong><div><button id="jetEject" class="source-btn">EJECT · X</button><button id="jetFlares" class="source-btn">FLARES · Z</button><button id="jetRange" class="source-btn">GUNNERY RANGE</button></div>';document.body.append(box);const sight=document.createElement('div');sight.id='jetReticle';sight.textContent='+';sight.hidden=true;sight.setAttribute('aria-hidden','true');document.body.append(sight);const help=document.createElement('details');help.innerHTML='<summary>Host a shared public server</summary><p>Create a free Render account, connect this GitHub repository, choose codex/sunshine-coast-game and deploy its blueprint. Open and share the HTTPS address Render assigns; that address serves the game and automatically joins its lobby.</p><p><a class="source-btn" href="https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer" target="_blank" rel="noopener noreferrer">HOST ON RENDER</a></p><p>Keeping Netlify? Set COASTAL_RELAY_URL there to the Render address and redeploy. Free services can take time to wake.</p>';$('lobbyModal').querySelector('.dialog').append(help);$('jetEject').onclick=ejectFighter;$('jetFlares').onclick=deployFlares;$('jetRange').onclick=startGunneryRange;}

function updateJetSight(){
 const sight=$('jetReticle');if(!sight)return;sight.hidden=state.vehicleId!=='jet'||state.mode!=='playing'||!!airCombat.ejection;if(sight.hidden)return;
 player.computeWorldMatrix(true);camera.computeWorldMatrix(true);scene.updateTransformMatrix();const point=worldBodyPoint(new V(-.53,1.36-state.profile.clearance,-7.45)).add(player.getDirection(new V(0,0,-1)).normalize().scale(500)),toward=point.subtract(camera.globalPosition);
 if(V.Dot(toward,camera.getForwardRay().direction)<=0){sight.hidden=true;return;}const engine=scene.getEngine(),position=V.Project(point,Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight())),rect=$('world').getBoundingClientRect();
 sight.hidden=position.z<0||position.z>1||position.x<0||position.y<0||position.x>engine.getRenderWidth()||position.y>engine.getRenderHeight();if(!sight.hidden){sight.style.left=rect.left+position.x/engine.getRenderWidth()*rect.width+'px';sight.style.top=rect.top+position.y/engine.getRenderHeight()*rect.height+'px';}
}
