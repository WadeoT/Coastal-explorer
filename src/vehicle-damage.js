let damageGraphics=null;
function resetVehicleDamage(){state.lastCollision=null;state.lastLanding=null;state.wasAirborne=false;state.aircraftContactAirborne=false;disposeDamageGraphics();state.damage=VehicleDamageModel.create(state.profile);state.health=100;state.driverHealth=100;state.bodyDamage=0;state.crashFlight=null;state.solidCrash=null;state.overturned=false;state.frontCrush=state.rearCrush=state.sideCrush=0;state.lastImpact=null;state.wreckSurface=null;state.damageOutcome='';state.wreckReturnAfter=8;if(typeof dangerState!=='undefined'){dangerState.active.clear();dangerState.last.clear();renderDangerAlerts();}}
function vehiclePowerFactor(){return groundEscape.active||state.overturned?0:VehicleDamageModel.power(state.damage);}
function bodyPoint(world){player.computeWorldMatrix(true);return V.TransformCoordinates(world,Matrix.Invert(player.getWorldMatrix()));}
function worldBodyPoint(local){player.computeWorldMatrix(true);return V.TransformCoordinates(new V(local.x,local.y,local.z),groundEscape.active?groundEscape.vehicleMatrix:player.getWorldMatrix());}
function disposeDamageGraphics(){if(!damageGraphics)return;for(const mark of damageGraphics.marks)mark.dispose();damageGraphics.mount?.dispose(false,false);damageGraphics.panel?.dispose();damageGraphics.panelMaterial?.dispose(false,true);damageGraphics.flashLight?.dispose();damageGraphics.fx.dispose(false,false);for(const material of damageGraphics.materials)material.dispose(false,true);damageGraphics=null;}
function createDamageGraphics(){
 disposeDamageGraphics();if(!state.profile||!cockpit)return;refineDamagePanels(exterior);
 const fx=new Node('vehicle-damage-effects',scene),ownedMaterials=[],make=(name,hex,emission=0,alpha=1)=>{const m=mat(name,hex,emission,alpha);ownedMaterials.push(m);return m;};
 const scorch=make('impact-scorch','#181714'),metal=make('exposed-impact-metal','#8c8982'),debrisMat=make('wreck-debris-metal','#4e5557'),fireMat=make('damage-flame','#ffb13e',1,.9),smokeMat=make('damage-smoke','#414344',0,.42);
 for(const [m,fire] of [[fireMat,true],[smokeMat,false]]){const t=new DynamicTexture('damage-billboard-'+fire,128,scene,false),ctx=t.getContext(),g=ctx.createRadialGradient(64,fire?85:64,5,64,64,62);g.addColorStop(0,fire?'rgba(255,245,157,1)':'rgba(180,180,180,.85)');g.addColorStop(.4,fire?'rgba(255,103,12,.85)':'rgba(150,150,150,.6)');g.addColorStop(1,'rgba(70,70,70,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);t.hasAlpha=true;t.update(false);m.diffuseTexture=t;if(fire)m.emissiveTexture=t;m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.disableLighting=true;m.disableDepthWrite=true;}
 const particles=[];for(let i=0;i<36;i++){const fire=i<12,m=MB.CreatePlane(fire?'damage-fire':'damage-smoke',{size:1},scene);m.parent=fx;m.material=fire?fireMat:smokeMat;m.billboardMode=Mesh.BILLBOARDMODE_ALL;m.isPickable=false;m.isVisible=false;particles.push({mesh:m,fire,index:fire?i:i-12});}
 const debris=[];for(let i=0;i<16;i++){const mesh=box('crash-debris',.13+(i%5)*.06,.05,.20+(i%3)*.09,0,0,0,debrisMat,fx);mesh.isVisible=false;debris.push({mesh,velocity:new V(),life:0});}
 const blast=MB.CreatePlane('fuel-explosion-fireball',{size:1},scene);blast.billboardMode=Mesh.BILLBOARDMODE_ALL;blast.parent=fx;blast.material=make('fuel-explosion-glow','#ff9d24',1,.8);blast.isPickable=false;blast.isVisible=false;blast.material.diffuseTexture=fireMat.diffuseTexture;blast.material.emissiveTexture=fireMat.diffuseTexture;blast.material.useAlphaFromDiffuseTexture=true;blast.material.disableLighting=true;blast.material.disableDepthWrite=true;
 const shockwave=MB.CreateTorus('explosion-dust-ring',{diameter:1,thickness:.10,tessellation:40},scene);shockwave.parent=fx;shockwave.material=make('blast-dust','#bcae92',.1,.35);shockwave.isPickable=false;shockwave.isVisible=false;const flashLight=new Coastal.SpotLight('explosion-flash-light',new V(),new V(0,-1,0),2.4,1,scene);flashLight.diffuse=new C(1,.54,.18);flashLight.range=28;flashLight.intensity=0;flashLight.renderPriority=100;flashLight.setEnabled(false);
 const sparks=[];for(let i=0;i<20;i++){const mesh=box('impact-hot-spark',.025,.025,.18,0,0,0,fireMat,fx);mesh.isVisible=false;sparks.push({mesh,velocity:new V(),life:0});}
 const leaks=[];for(const [kind,hex] of [['oil','#161a18'],['coolant','#688f66']]){const mesh=MB.CreateDisc(kind+'-leak-puddle',{radius:1,tessellation:16,sideOrientation:Mesh.DOUBLESIDE},scene);mesh.rotation.x=Math.PI/2;mesh.parent=fx;mesh.material=make(kind+'-puddle',hex,0,.75);mesh.isPickable=false;mesh.isVisible=false;leaks.push({kind,mesh});}
 damageGraphics={fx,materials:ownedMaterials,particles,debris,blast,shockwave,flashLight,sparks,leaks,marks:[],scorch,metal,original:new Map(),originalColours:new Map(),age:0,blastAge:99,explosionShown:false,panel:null,panelMaterial:null,panelTexture:null,lastGauge:null};
 if(['heli','jet'].includes(state.profile.kind)){
  const p=state.profile,kart=p.body==='kart',e=p.eye-p.clearance,texture=new DynamicTexture('live-engine-fluid-gauges',{width:768,height:384},scene,false),material=mat('cockpit-engine-gauges','#ffffff',1);material.diffuseTexture=texture;material.emissiveTexture=texture;material.disableLighting=true;material.backFaceCulling=false;
  const air=p.kind==='heli'||p.kind==='jet',width=kart?.36:air?.50:.54,height=width/2,mount=new Node('cockpit-engine-monitor-pod',scene);mount.parent=cockpit;mount.position.set(kart?.24:air?.42:.15,e-(kart?.19:air?.02:.17),air?-.95:kart?-.65:-.68);box('engine-monitor-bezel',width+.024,height+.024,.035,0,0,0,materials.black,mount);box('engine-monitor-mount',.045,.16,.045,0,-height*.5-.07,-.005,materials.dark,mount);const panel=MB.CreatePlane('cockpit-oil-coolant-fuel-gauges',{width,height},scene);panel.parent=mount;panel.position.z=.024;panel.material=material;panel.isPickable=false;damageGraphics.mount=mount;
  damageGraphics.panel=panel;damageGraphics.panelMaterial=material;damageGraphics.panelTexture=texture;
 }
 updateDamageGauges();
}
function dentVehicle(local,depth=.1,radius=.8){
 if(!damageGraphics||!exterior||!Number.isFinite(depth))return;player.computeWorldMatrix(true);const playerWorld=player.getWorldMatrix().clone(),inversePlayer=Matrix.Invert(playerWorld),inward=new V(local.x,0,local.z);if(inward.length()<.05)inward.set(1,0,0);inward.normalize();let total=0;
 for(const root of [exterior,cockpit])for(const mesh of root.getChildMeshes()){
  const decal=!!mesh.metadata?.damageDecal,name=mesh.name+' '+mesh.material?.name;if(!decal&&(total>=12||/glass|tyre|wheel|instrument|gauge|rotor|light|steering/i.test(name)||!/paint|body|bonnet|bumper|door|tray|fuselage|cabin|roof|wing/i.test(name)))continue;
  const positions=mesh.getVerticesData('position'),indices=mesh.getIndices();if(!positions||!indices||positions.length>120000)continue;mesh.computeWorldMatrix(true);const world=mesh.getWorldMatrix().clone(),inverse=Matrix.Invert(world),next=positions.slice();let changed=false;
  for(let i=0;i<next.length;i+=3){const at=V.TransformCoordinates(V.TransformCoordinates(new V(positions[i],positions[i+1],positions[i+2]),world),inversePlayer),dist=V.Distance(at,local);if(dist>=radius)continue;const amount=depth*(1-dist/radius);at.addInPlace(inward.scale(-amount));at.y-=amount*.18;const result=V.TransformCoordinates(V.TransformCoordinates(at,playerWorld),inverse);next[i]=result.x;next[i+1]=result.y;next[i+2]=result.z;changed=true;}
  if(!changed)continue;if(!decal&&!damageGraphics.original.has(mesh))damageGraphics.original.set(mesh,positions.slice());const normals=[];VertexData.ComputeNormals(next,indices,normals);mesh.setVerticesData('position',next,true);mesh.setVerticesData('normal',normals,true);mesh.refreshBoundingInfo();if(!decal)total++;
 }
}

function addImpactMark(local,large=false){
 if(!damageGraphics||!exterior)return;while(damageGraphics.marks.length>=24)damageGraphics.marks.shift().dispose();
 const centre=new V(0,state.profile.eye*.35,0),out=new V(local.x-centre.x,(local.y-centre.y)*.5,local.z-centre.z);if(out.length()<.05)out.set(1,0,0);out.normalize();
 const origin=worldBodyPoint(local.add(out.scale(3))),direction=V.TransformNormal(out.scale(-1),player.getWorldMatrix()).normalize(),meshes=new Set(exterior.getChildMeshes().filter(m=>!m.metadata?.damageDecal&&!/glass|tyre|wheel|light|rotor/i.test(m.name+' '+m.material?.name)));
 const hit=scene.pickWithRay(new Ray(origin,direction,7),m=>meshes.has(m)&&m.isEnabled());if(!hit?.hit)return;
 const mark=MB.CreateDecal('body-surface-impact',hit.pickedMesh,{position:hit.pickedPoint,normal:hit.getNormal(true)||direction.scale(-1),size:new V(large?.65:.15,large?.38:.15,.12),cullBackFaces:true});if(!mark.getTotalVertices()){mark.dispose();return;}
 mark.material=impactDecalMaterial(large);mark.isPickable=false;mark.metadata={damageDecal:true,surface:hit.pickedMesh.name};mark.setParent(hit.pickedMesh);damageGraphics.marks.push(mark);
}

function damageComponent(part,amount,cause='bullet',local=null){
 if(!['playing','paused'].includes(state.mode)||!state.damage)return false;
 if(!VehicleDamageModel.hit(state.damage,part,amount,cause))return false;
 state.damageFlash=.5;
 if(local){dentVehicle(local,cause==='bullet'?.045:.16,cause==='bullet'?.38:1.1);addImpactMark(local,part==='driver');}
 const labels={engine:'ENGINE HIT',radiator:state.damage.capacity.coolant?'COOLANT LEAK':'ENGINE COOLING HIT',oil:'OIL SYSTEM HIT',fuel:'FUEL TANK HIT',driver:'DRIVER HIT',body:'BODY HIT'};toast(labels[part]+' · '+(state.damage.engineFailed?state.damage.reason:Math.round(state.damage.components[part])+'%'),2500);
 finishDamageState();return true;
}
function traceVehicleBullet(p,root,from,direction,range){root.computeWorldMatrix(true);const inv=Matrix.Invert(root.getWorldMatrix()),origin=V.TransformCoordinates(from,inv),dir=V.TransformNormal(direction,inv).normalize();return {hits:VehicleDamageModel.trace(p,origin,dir,range),origin,dir};}
function playerBulletHit(from,direction,range=100,surface=null,damageScale=1){if(groundEscape.active){hurtGroundEscape(35*damageScale,'Shot while on foot');return 'driver';}
 if(state.mode!=='playing')return false;
 const trace=traceVehicleBullet(state.profile,player,from,direction,range),hit=trace.hits[0],part=hit?.part||'body',point=surface?bodyPoint(surface):trace.origin.add(trace.dir.scale(hit?.t||0)),amount={engine:42,radiator:70,oil:70,fuel:65,driver:100,body:9}[part];
 damageComponent(part,amount*clamp(damageScale,.1,1),'bullet',point);
 // A frontal radiator hit can also penetrate into the engine behind it.
 if(part==='radiator'&&trace.hits.some(h=>h.part==='engine'))damageComponent('engine',14*clamp(damageScale,.1,1),'bullet');
 return part;
}
function trafficBulletHit(ai,from,direction,range,surface){
 const p={kind:'car',width:1.8,length:4,clearance:0},trace=traceVehicleBullet(p,ai.root,from,direction,range),part=trace.hits[0]?.part||'body';
 ai.damage??=VehicleDamageModel.create(p);VehicleDamageModel.hit(ai.damage,part,{engine:48,radiator:75,oil:75,fuel:70,driver:100,body:25}[part]);ai.health=Math.min(ai.health,ai.damage.components.body);if(ai.damage.engineFailed||ai.damage.driverDead){ai.health=0;ai.pursuing=false;}ai.speed*=.65;
 if(ai.damage.burning){VehicleDamageModel.explode(ai.damage);ai.health=0;spawnCrashDebris(surface||ai.root.position,14);if(damageGraphics){damageGraphics.blast.position.copyFrom(surface||ai.root.position);damageGraphics.blastAge=0;}}
 ai.bodyMat.diffuseColor=ai.health===0?new C(.13,.14,.14):ai.bodyMat.diffuseColor.scale(.90);toast(ai.health===0?'Vehicle disabled · '+part:'Vehicle hit · '+part);return part;
}
function syncDamageHealth(){const d=state.damage;if(!d)return;state.health=d.exploded?0:d.components.body;state.driverHealth=d.components.driver;state.bodyDamage=clamp((100-d.components.body)/100,0,1);}
function endDamagedRun(title,detail){
 if(!['playing','paused','wrecked'].includes(state.mode))return;const alreadyWrecked=state.mode==='wrecked';if(alreadyWrecked&&state.damageOutcome===detail)return;if(!alreadyWrecked){cancelActivity(detail);state.mode='wrecked';state.bustedTime=0;state.wreckReturnAfter=state.damage?.burning&&!state.damage.exploded?(state.damage.fireDelay||3.5)+5:8;keys.clear();AudioSystem.stop();}state.damageOutcome=detail;
 const el=$('busted');el.querySelector('strong').textContent=title;el.querySelector('p').textContent=(state.lastImpact?.solid?state.lastImpact.kph+' KM/H · '+state.lastImpact.energyKJ+' KJ · ':'')+detail+' · Returning to garage';el.classList.remove('hidden');if(cameraMode!=='third-person')setCameraMode('third-person');
}
function finishDamageState(){const d=state.damage;if(!d)return;syncDamageHealth();if(groundEscape.active){state.driverHealth=groundEscape.health;return;}if(d.driverDead)endDamagedRun(d.exploded?'DESTROYED':'WASTED',d.reason||'Driver killed');else if(d.components.body<=0)endDamagedRun('WRECKED',d.reason||'Vehicle destroyed');}
function recordVehicleCrash(speed,worldPoint=null,impact=null){
 if(!state.damage||state.mode!=='playing'||speed<3||!Number.isFinite(speed))return;
 let local=worldPoint?bodyPoint(worldPoint):new V(0,.45-state.profile.clearance,-state.profile.length*.42);
 local=new V(clamp(local.x,-state.profile.width*.53,state.profile.width*.53),clamp(local.y,-state.profile.clearance,state.profile.eye),clamp(local.z,-state.profile.length*.52,state.profile.length*.52));
 resetDrivingRewards();const severity=VehicleDamageModel.crash(state.damage,state.profile,speed,local);state.lastCrashSpeed=speed;state.damageFlash=.6;
 dentVehicle(local,Math.min(.5,speed*.014),1.0+speed*.025);spawnCrashDebris(worldBodyPoint(local),speed);
 if(state.profile.kind==='car'&&speed>=12){if(impact?.solid&&impact.normal&&speed>17)crushVehicleAgainstSurface(local,impact.normal,speed);startCarCrash(speed,local,impact);}else if(impact?.solid&&impact.normal&&speed>17&&['car','boat','heli','jet'].includes(state.profile.kind)){const depth=crushVehicleAgainstSurface(local,impact.normal,speed);player.position.x-=impact.normal.x*depth;player.position.z-=impact.normal.z*depth;state.solidCrash=state.damage.components.body<=0||state.damage.driverDead?{x:player.position.x,z:player.position.z}:null;state.crashFlight=null;motion.vx=motion.vz=motion.vy=0;motion.suspensionVelocity=0;if(['heli','jet'].includes(state.profile.kind)){state.solidCrash=null;state.crashFlight={time:0,vy:-2,roll:motion.roll,pitch:motion.pitch,rollSpeed:.5,pitchSpeed:.3};}}else if(speed>17&&['car','heli','jet'].includes(state.profile.kind)){
  const side=local.x/(state.profile.width/2),glancing=Math.abs(side)>.65;
  state.crashFlight={time:0,vy:Math.min(4,speed*.10),roll:motion.roll,pitch:motion.pitch,rollSpeed:glancing?Math.sign(side)*Math.min(4,speed*.10):0,pitchSpeed:glancing?0:-Math.min(1.2,speed*.025)};
  motion.vx*=.65;motion.vz*=.65;motion.yaw+=side*Math.min(.5,speed*.009);
 }
 addImpactMark(local,true);
 dangerAlert('crash','IMPACT · '+Math.round(speed*3.6)+' KM/H',impact?.solid?'Solid collision · body and components damaged.':'Vehicle impact · inspect damage before continuing.','critical','body');
 if(severity>45&&state.damage.engineFailed)toast('ENGINE FAILURE · '+state.damage.reason,4000);finishDamageState();
}
function spawnCrashDebris(origin,speed){if(!damageGraphics)return;for(const [i,p] of damageGraphics.debris.entries()){p.mesh.position.copyFrom(origin);p.mesh.isVisible=true;p.life=3;const a=(i+.3)*2.399;p.velocity.set(Math.cos(a)*Math.min(11,speed*.24),2+(i%6)*.7,Math.sin(a)*Math.min(11,speed*.24));}for(const [i,p]of damageGraphics.sparks.entries()){const a=i*2.399;p.mesh.position.copyFrom(origin);p.life=.25+(i%8)*.07;p.velocity.set(Math.cos(a)*Math.min(18,speed*.6),2+i%5,Math.sin(a)*Math.min(18,speed*.6));p.mesh.isVisible=true;}}
function stepCrashPhysics(dt){if(state.crashFlight?.groundVehicle){stepCarCrash(dt);return;}
 const flight=state.crashFlight,p=state.profile,prevX=player.position.x,prevZ=player.position.z;if(state.solidCrash){player.position.x=state.solidCrash.x;player.position.z=state.solidCrash.z;motion.vx=motion.vz=motion.vy=0;state.speed=0;return;}
 motion.vx*=Math.exp(-.8*dt);motion.vz*=Math.exp(-.8*dt);player.position.x=clamp(prevX+motion.vx*dt,BOUNDS.minX+5,BOUNDS.maxX-5);player.position.z=clamp(prevZ+motion.vz*dt,BOUNDS.minZ+5,BOUNDS.maxZ-5);
 if(flight){flight.time+=dt;flight.vy-=9.81*dt;player.position.y+=flight.vy*dt;flight.roll+=flight.rollSpeed*dt;flight.pitch+=flight.pitchSpeed*dt;flight.rollSpeed*=Math.exp(-1.2*dt);flight.pitchSpeed*=Math.exp(-1.6*dt);
  const ground=groundAt(player.position.x,player.position.z,player.position.y,true)??motion.lastSurface,h=state.wreckSurface&&pointInPolygon(player.position.x,player.position.z,state.wreckSurface.polygon)?Math.max(ground,state.wreckSurface.height):ground;motion.lastSurface=h;const clearance=p.clearance+Math.abs(Math.sin(flight.roll))*p.width*.25;
  if(player.position.y<h+clearance){player.position.y=h+clearance;flight.vy=flight.vy<-1?-flight.vy*.18:0;motion.vx*=.96;motion.vz*=.96;}
  motion.roll=flight.roll;motion.pitch=flight.pitch;player.rotation.set(flight.pitch,-motion.yaw,flight.roll);
  if(flight.time>2.5){state.crashFlight=null;if(Math.abs(Math.sin(flight.roll))>.8&&state.mode==='playing'){VehicleDamageModel.hit(state.damage,'body',100,'rollover');finishDamageState();}else if(state.mode==='playing'){motion.roll=motion.pitch=0;motion.suspensionVelocity=0;}}
 }else{const raw=groundAt(player.position.x,player.position.z,player.position.y,true),h=state.wreckSurface&&pointInPolygon(player.position.x,player.position.z,state.wreckSurface.polygon)?Math.max(raw??-10000,state.wreckSurface.height):raw;if(h!==null){player.position.y=h+p.clearance;motion.lastSurface=h;}}
 state.speed=Math.hypot(motion.vx,motion.vz);state.distance+=Math.hypot(player.position.x-prevX,player.position.z-prevZ);
}
function updateVehicleDamage(dt){
 const d=state.damage;if(!d||airCombat.ejection)return;const failed=d.engineFailed,throttle=keys.has('KeyW')||keys.has('ArrowUp');
 const turbine=state.profile.kind==='jet',load=groundEscape.active?0:turbine?(state.jetThrottle||0):state.profile.kind==='heli'?clamp(.5+motion.collective*.5,0,1):throttle?1:0;
 VehicleDamageModel.step(d,dt,{rpm:state.rpm,load,airspeed:Math.hypot(motion.vx,motion.vy,motion.vz),redline:turbine?11000:state.vehicleId==='ute'?4200:6500,boost:turbine&&keys.has('ShiftLeft')?1:0,ambient:worldUpgrade.weather==='rain'?23:27});
 if(d.engineFailed){state.rpm=0;if(!failed)toast(d.reason+' · Engine stopped. Visit the garage or use admin repair.',6500);}
 if(d.exploded&&damageGraphics&&!damageGraphics.explosionShown){damageGraphics.explosionShown=true;damageGraphics.blastAge=0;damageGraphics.blast.position.copyFrom(groundEscape.active?groundEscape.vehiclePosition:player.position).addInPlace(new V(0,.5,0));spawnCrashDebris(groundEscape.active?groundEscape.vehiclePosition:player.position,30);if(!state.solidCrash&&!groundEscape.active){motion.vx+=2;motion.vz-=2;}for(const root of [cockpit,exterior])for(const m of root?.getChildMeshes()||[]){const mat=m.material;if(!mat||Object.values(materials).includes(mat)||damageGraphics.originalColours.has(mat))continue;damageGraphics.originalColours.set(mat,mat.diffuseColor.clone());mat.diffuseColor.scaleInPlace(.24);}}
 finishDamageState();
}
function updateDamageEffects(dt){
 const g=damageGraphics,d=state.damage;if(!g||!d)return;if(airCombat.ejection){g.fx.setEnabled(false);return;}g.age+=dt;
 const z=VehicleDamageModel.zones(state.profile).find(z=>z.part===(d.burning?'fuel':'engine')),local=z?new V((z.min.x+z.max.x)/2,z.max.y,(z.min.z+z.max.z)/2):new V(),origin=worldBodyPoint(local),steam=d.capacity.coolant>0&&d.coolantTemp>108&&d.components.radiator<90,smoke=d.burning||d.exploded||d.components.engine<45||steam;
 for(const {mesh,fire,index} of g.particles){const active=fire?d.burning||d.exploded:smoke;mesh.isVisible=active;if(!active)continue;const life=((g.age*(fire?1.7:.34)+index*.173)%1),angle=index*2.399,spread=(fire?.28:.4)+life*(fire?.25:1.2),height=life*(fire?1.6:4.5);mesh.position.set(origin.x+Math.cos(angle)*spread,origin.y+height,origin.z+Math.sin(angle)*spread+life*.7);const size=fire?(.45+Math.sin(g.age*11+index)*.09)*(1-life*.55):.4+life*1.6;mesh.scaling.set(size,fire?size*1.8:size,size);}
 if(g.blastAge<1.2){g.blastAge+=dt;const age=g.blastAge;g.blast.isVisible=true;g.blast.scaling.setAll(2+age*11);g.blast.position.y+=dt*1.6;g.blast.material.alpha=Math.max(0,1-age/1.2);g.flashLight.setEnabled(true);g.flashLight.position.copyFrom(g.blast.position).addInPlace(new V(0,4,0));g.flashLight.intensity=18*Math.exp(-age*9);g.shockwave.isVisible=age<.8;g.shockwave.position.copyFrom(player.position);g.shockwave.position.y=(terrainHeight(player.position.x,player.position.z)??motion.lastSurface)+.12;g.shockwave.scaling.set(2+age*22,1,2+age*22);g.shockwave.material.alpha=Math.max(0,.45-age*.6);}else{g.blast.isVisible=g.shockwave.isVisible=false;g.flashLight.intensity=0;g.flashLight.setEnabled(false);}
 for(const p of g.sparks){if(p.life<=0){p.mesh.isVisible=false;continue;}p.life-=dt;p.velocity.y-=9.81*dt;p.mesh.position.addInPlace(p.velocity.scale(dt));p.mesh.scaling.setAll(clamp(p.life*2,0,1));p.mesh.isVisible=true;}
 for(const p of g.debris){if(p.life<=0){p.mesh.isVisible=false;continue;}p.life-=dt;p.velocity.y-=9.81*dt;p.mesh.position.addInPlace(p.velocity.scale(dt));p.mesh.rotation.x+=dt*3;p.mesh.rotation.z+=dt*2;const h=terrainHeight(p.mesh.position.x,p.mesh.position.z);if(h!==null&&p.mesh.position.y<h+.08){p.mesh.position.y=h+.08;p.velocity.y=Math.abs(p.velocity.y)*.25;p.velocity.x*=.8;p.velocity.z*=.8;}}
 for(const leak of g.leaks){const lost=d.capacity[leak.kind]-d[leak.kind];if(lost>.05&&state.speed<1){const h=groundAt(origin.x,origin.z,player.position.y,true);if(h!==null){leak.mesh.isVisible=true;leak.mesh.position.set(origin.x,h+.04,origin.z);leak.mesh.scaling.setAll(clamp(.2+lost*.08,.2,1.2));}}}
}
function updateDamageGauges(){
 const g=damageGraphics,d=state.damage;if(!g||!d)return;
 const air=['heli','jet'].includes(state.profile.kind);
 const percent=key=>d.capacity[key]?Math.round(d[key]/d.capacity[key]*100):0;
 const warning=d.exploded?'FUEL EXPLOSION':d.driverDead?'DRIVER KILLED':d.burning?'FIRE — FUEL LEAK':d.engineFailed?d.reason:d.oilPressure<.7&&state.rpm>300?'LOW OIL PRESSURE':d.coolantTemp>110?'ENGINE OVERHEATING':d.capacity.coolant>0&&d.components.radiator<90?'COOLANT LEAK':d.components.oil<90?'OIL LEAK':'SYSTEMS NORMAL';
 const readout=$('damageStatus')?.parentElement;if(readout){readout.hidden=groundEscape.active||!air&&warning==='SYSTEMS NORMAL';readout.classList.toggle('ground-warning',!air);$('damageNumbers').hidden=!air;}
 if($('damageStatus')){$('damageStatus').textContent=warning;$('damageStatus').classList.toggle('critical',warning!=='SYSTEMS NORMAL');const rows=!air?[]:d.electric?[['MOTOR',Math.round(d.components.engine)+'%'],['RIDER',Math.round(d.components.driver)+'%']]:[['OIL PRESSURE',d.oilPressure.toFixed(1)+' bar'],['OIL TEMP',Math.round(d.oilTemp)+' °C'],[d.turbine?'EXHAUST TEMP':d.airCooled?'ENGINE TEMP':'COOLANT TEMP',Math.round(d.turbine?d.exhaustTemp:d.coolantTemp)+' °C'],['FUEL',percent('fuel')+'%'],['OIL / COOLANT',percent('oil')+'% / '+(d.capacity.coolant?percent('coolant')+'%':'N/A')]];$('damageNumbers').replaceChildren(...rows.map(([label,value])=>{const row=document.createElement('span'),name=document.createElement('b'),reading=document.createElement('strong');name.textContent=label;reading.textContent=value;row.append(name,reading);return row;}));}
 g.lastGauge={oilPressure:d.oilPressure,coolantTemp:d.coolantTemp,oilTemp:d.oilTemp,oil:percent('oil'),coolant:percent('coolant'),fuel:percent('fuel'),warning};
 if(!g.panelTexture)return;const c=g.panelTexture.getContext();c.setTransform(1,0,0,1,0,0);c.fillStyle='#0d1119';c.fillRect(0,0,768,384);c.textAlign='center';c.textBaseline='middle';
 function dial(cx,label,value,max,unit,warn){const cy=139,r=88;c.lineWidth=9;c.strokeStyle='#344649';c.beginPath();c.arc(cx,cy,r,-Math.PI*1.2,Math.PI*.2);c.stroke();const a=-Math.PI*1.2+clamp(value/max,0,1)*Math.PI*1.4;c.strokeStyle=warn?'#fb634c':'#d3dfef';c.beginPath();c.arc(cx,cy,r,-Math.PI*1.2,a);c.stroke();c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*r*.85,cy+Math.sin(a)*r*.85);c.stroke();c.fillStyle=warn?'#ff8f75':'#e8eff9';c.font='bold 43px monospace';c.fillText((max<10?value.toFixed(1):Math.round(value))+unit,cx,195);c.font='bold 24px sans-serif';c.fillText(label,cx,28);}
 dial(133,'OIL PRESSURE',d.oilPressure,6,' bar',d.oilPressure<.7&&state.rpm>300);dial(384,d.turbine?'EXHAUST TEMP':d.airCooled?'ENGINE TEMP':'COOLANT TEMP',d.turbine?d.exhaustTemp:d.coolantTemp,d.turbine?1200:150,'°C',d.turbine?d.exhaustTemp>1050:d.coolantTemp>110);dial(635,'OIL TEMP',d.oilTemp,160,'°C',d.oilTemp>130);
 for(const [i,key] of ['oil','coolant','fuel'].entries()){const x=35+i*248,has=d.capacity[key]>0,fill=has?percent(key):0;c.fillStyle='#31464a';c.fillRect(x,262,204,15);c.fillStyle=fill<20?'#f37c52':'#d2a85c';c.fillRect(x,262,204*fill/100,15);c.fillStyle='#d9e2ee';c.font='bold 25px monospace';c.fillText(key.toUpperCase()+' '+(has?fill+'%':'N/A'),x+102,300);}
 c.font='bold 21px sans-serif';c.fillStyle=warning==='SYSTEMS NORMAL'?'#bdcce2':'#ff8b6b';c.fillText(warning.toUpperCase().slice(0,47),384,351);g.panelTexture.update();
}
function repairVehicleDamage(){
 if(!state.profile)return false;
 if(damageGraphics){for(const [mesh,positions] of damageGraphics.original)if(!mesh.isDisposed()){const normals=[];VertexData.ComputeNormals(positions,mesh.getIndices(),normals);mesh.setVerticesData('position',positions,true);mesh.setVerticesData('normal',normals,true);mesh.refreshBoundingInfo();}for(const [mat,color] of damageGraphics.originalColours)if(mat.diffuseColor)mat.diffuseColor.copyFrom(color);}
 state.damage=VehicleDamageModel.create(state.profile);state.health=100;state.driverHealth=100;state.bodyDamage=0;state.crashFlight=null;state.solidCrash=null;state.overturned=false;state.frontCrush=state.rearCrush=state.sideCrush=0;dangerState.active.clear();dangerState.last.clear();renderDangerAlerts();state.wreckSurface=null;state.rpm=state.profile.kind==='bike'?0:state.vehicleId==='ute'?750:900;if(exterior)exterior.scaling.setAll(1);createDamageGraphics();updateDamageGauges();
}
function initialiseDamageUI(){const panel=document.createElement('div');panel.className='damage-readout';panel.innerHTML='<strong id="damageStatus">SYSTEMS NORMAL</strong><span id="damageNumbers">OIL · COOLANT · FUEL</span>';$('hud').append(panel);const info=document.createElement('p');info.textContent='Component damage: engine hits reduce power, radiator/coolant leaks cause overheating, oil leaks lose pressure and can seize the engine, fuel damage can cause fire/explosion, and a direct driver hit can be fatal. Severe crashes leave dents, debris and burning wrecks. Cars show critical warnings; aircraft also have cockpit fluid gauges. Garage vehicle selection respawns; admin repair restores components and fluids.';$('helpModal').querySelector('.dialog').append(info);}
