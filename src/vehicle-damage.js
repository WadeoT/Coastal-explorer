let damageGraphics=null;
function resetVehicleDamage(){disposeDamageGraphics();state.damage=VehicleDamageModel.create(state.profile);state.health=100;state.driverHealth=100;state.bodyDamage=0;state.crashFlight=null;state.damageOutcome='';}
function vehiclePowerFactor(){return VehicleDamageModel.power(state.damage);}
function bodyPoint(world){player.computeWorldMatrix(true);return V.TransformCoordinates(world,Matrix.Invert(player.getWorldMatrix()));}
function worldBodyPoint(local){player.computeWorldMatrix(true);return V.TransformCoordinates(new V(local.x,local.y,local.z),player.getWorldMatrix());}
function disposeDamageGraphics(){if(!damageGraphics)return;for(const mark of damageGraphics.marks)mark.dispose();damageGraphics.mount?.dispose(false,false);damageGraphics.panel?.dispose();damageGraphics.panelMaterial?.dispose(false,true);damageGraphics.fx.dispose(false,false);for(const material of damageGraphics.materials)material.dispose(false,true);damageGraphics=null;}
function createDamageGraphics(){
 disposeDamageGraphics();if(!state.profile||!cockpit)return;
 const fx=new Node('vehicle-damage-effects',scene),ownedMaterials=[],make=(name,hex,emission=0,alpha=1)=>{const m=mat(name,hex,emission,alpha);ownedMaterials.push(m);return m;};
 const scorch=make('impact-scorch','#181714'),metal=make('exposed-impact-metal','#8c8982'),debrisMat=make('wreck-debris-metal','#4e5557'),fireMat=make('damage-flame','#ffb13e',1,.9),smokeMat=make('damage-smoke','#414344',0,.42);
 for(const [m,fire] of [[fireMat,true],[smokeMat,false]]){const t=new DynamicTexture('damage-billboard-'+fire,64,scene,false),ctx=t.getContext(),g=ctx.createRadialGradient(32,fire?44:32,2,32,32,31);g.addColorStop(0,fire?'rgba(255,245,157,1)':'rgba(180,180,180,.85)');g.addColorStop(.4,fire?'rgba(255,103,12,.85)':'rgba(150,150,150,.6)');g.addColorStop(1,'rgba(70,70,70,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);t.hasAlpha=true;t.update(false);m.diffuseTexture=t;if(fire)m.emissiveTexture=t;m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.disableLighting=true;}
 const particles=[];for(let i=0;i<20;i++){const fire=i<7,m=MB.CreatePlane(fire?'damage-fire':'damage-smoke',{size:1},scene);m.parent=fx;m.material=fire?fireMat:smokeMat;m.billboardMode=Mesh.BILLBOARDMODE_ALL;m.isPickable=false;m.isVisible=false;particles.push({mesh:m,fire,index:fire?i:i-7});}
 const debris=[];for(let i=0;i<6;i++){const mesh=box('crash-debris',.13+i*.035,.07,.20,0,0,0,debrisMat,fx);mesh.isVisible=false;debris.push({mesh,velocity:new V(),life:0});}
 const blast=MB.CreateSphere('fuel-explosion-flash',{diameter:1,segments:8},scene);blast.parent=fx;blast.material=make('fuel-explosion-glow','#ff9d24',1,.8);blast.isPickable=false;blast.isVisible=false;
 const leaks=[];for(const [kind,hex] of [['oil','#161a18'],['coolant','#688f66']]){const mesh=MB.CreateDisc(kind+'-leak-puddle',{radius:1,tessellation:16,sideOrientation:Mesh.DOUBLESIDE},scene);mesh.rotation.x=Math.PI/2;mesh.parent=fx;mesh.material=make(kind+'-puddle',hex,0,.75);mesh.isPickable=false;mesh.isVisible=false;leaks.push({kind,mesh});}
 damageGraphics={fx,materials:ownedMaterials,particles,debris,blast,leaks,marks:[],scorch,metal,original:new Map(),originalColours:new Map(),age:0,blastAge:99,explosionShown:false,panel:null,panelMaterial:null,panelTexture:null,lastGauge:null};
 if(state.profile.kind!=='bike'){
  const p=state.profile,kart=p.body==='kart',e=p.eye-p.clearance,texture=new DynamicTexture('live-engine-fluid-gauges',{width:768,height:384},scene,false),material=mat('cockpit-engine-gauges','#ffffff',1);material.diffuseTexture=texture;material.emissiveTexture=texture;material.disableLighting=true;material.backFaceCulling=false;
  const air=p.kind==='heli'||p.kind==='jet',width=kart?.25:air?.30:.36,height=width/2,mount=new Node('cockpit-engine-monitor-pod',scene);mount.parent=cockpit;mount.position.set(kart?.25:air?.55:.18,e-(kart?.16:air?.14:.10),air?-.95:kart?-.65:-.68);box('engine-monitor-bezel',width+.024,height+.024,.035,0,0,0,materials.black,mount);box('engine-monitor-mount',.045,.16,.045,0,-height*.5-.07,-.005,materials.dark,mount);const panel=MB.CreatePlane('cockpit-oil-coolant-fuel-gauges',{width,height},scene);panel.parent=mount;panel.position.z=.024;panel.material=material;panel.isPickable=false;damageGraphics.mount=mount;
  damageGraphics.panel=panel;damageGraphics.panelMaterial=material;damageGraphics.panelTexture=texture;
 }
 updateDamageGauges();
}
function dentVehicle(local,depth=.1,radius=.8){
 if(!damageGraphics||!exterior||!Number.isFinite(depth))return;
 const world=worldBodyPoint(local);let total=0;
 for(const root of [exterior,cockpit])for(const mesh of root.getChildMeshes()){
  if(total>=12||/glass|tyre|wheel|instrument|gauge|rotor|light|steering/i.test(mesh.name+' '+mesh.material?.name)||!/paint|body|bonnet|bumper|door|tray|fuselage|cabin|roof|wing/i.test(mesh.name+' '+mesh.material?.name))continue;
  const positions=mesh.getVerticesData('position'),indices=mesh.getIndices();if(!positions||!indices||positions.length>120000)continue;
  mesh.computeWorldMatrix(true);const inverse=Matrix.Invert(mesh.getWorldMatrix()),point=V.TransformCoordinates(world,inverse),normal=new V(point.x,0,point.z).normalize(),next=positions.slice();let changed=false;
  for(let i=0;i<next.length;i+=3){const dist=Math.hypot(next[i]-point.x,next[i+1]-point.y,next[i+2]-point.z);if(dist>=radius)continue;const k=depth*(1-dist/radius);next[i]-=normal.x*k;next[i+1]-=k*.18;next[i+2]-=normal.z*k;changed=true;}
  if(!changed)continue;if(!damageGraphics.original.has(mesh))damageGraphics.original.set(mesh,positions.slice());
  const normals=[];VertexData.ComputeNormals(next,indices,normals);mesh.setVerticesData('position',next,true);mesh.setVerticesData('normal',normals,true);mesh.refreshBoundingInfo();total++;
 }
}
function addImpactMark(local,large=false){
 if(!damageGraphics)return;while(damageGraphics.marks.length>=(large?23:24))damageGraphics.marks.shift().dispose();
 const normal=Math.abs(local.z)/(state.profile.length/2)>Math.abs(local.x)/(state.profile.width/2)?new V(0,0,Math.sign(local.z)||-1):new V(Math.sign(local.x)||1,0,0);
 const hole=MB.CreateDisc('visible-bullet-scar',{radius:large?.15:.045,tessellation:8,sideOrientation:Mesh.DOUBLESIDE},scene);hole.parent=player;hole.position.copyFrom(local).addInPlace(normal.scale(.018));hole.rotation.y=Math.atan2(normal.x,normal.z);hole.material=damageGraphics.scorch;hole.isPickable=false;damageGraphics.marks.push(hole);
 if(large){const a=normal.z?new V(1,0,0):new V(0,0,1),points=[];for(let i=0;i<5;i++){const angle=i*TAU/5;points.push(local.add(a.scale(Math.cos(angle)*.27)).add(new V(0,Math.sin(angle)*.20,0)),local);}const crack=MB.CreateLines('impact-scratched-glass',{points},scene);crack.parent=player;crack.color=new C(.75,.77,.73);crack.isPickable=false;damageGraphics.marks.push(crack);}
}
function damageComponent(part,amount,cause='bullet',local=null){
 if(state.mode!=='playing'||!state.damage)return false;
 if(!VehicleDamageModel.hit(state.damage,part,amount,cause))return false;
 state.damageFlash=.5;
 if(local){addImpactMark(local,part==='driver');dentVehicle(local,cause==='bullet'?.045:.16,cause==='bullet'?.38:1.1);}
 const labels={engine:'ENGINE HIT',radiator:'COOLANT LEAK',oil:'OIL SYSTEM HIT',fuel:'FUEL TANK HIT',driver:'DRIVER HIT',body:'BODY HIT'};toast(labels[part]+' · '+(state.damage.engineFailed?state.damage.reason:Math.round(state.damage.components[part])+'%'),2500);
 finishDamageState();return true;
}
function traceVehicleBullet(p,root,from,direction,range){root.computeWorldMatrix(true);const inv=Matrix.Invert(root.getWorldMatrix()),origin=V.TransformCoordinates(from,inv),dir=V.TransformNormal(direction,inv).normalize();return {hits:VehicleDamageModel.trace(p,origin,dir,range),origin,dir};}
function playerBulletHit(from,direction,range=100,surface=null){
 if(state.mode!=='playing')return false;
 const trace=traceVehicleBullet(state.profile,player,from,direction,range),hit=trace.hits[0],part=hit?.part||'body',point=surface?bodyPoint(surface):trace.origin.add(trace.dir.scale(hit?.t||0)),amount={engine:42,radiator:70,oil:70,fuel:65,driver:100,body:9}[part];
 damageComponent(part,amount,'bullet',point);
 // A frontal radiator hit can also penetrate into the engine behind it.
 if(part==='radiator'&&trace.hits.some(h=>h.part==='engine'))damageComponent('engine',14,'bullet');
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
 if(!['playing','wrecked'].includes(state.mode))return;const alreadyWrecked=state.mode==='wrecked';if(alreadyWrecked&&state.damageOutcome===detail)return;if(!alreadyWrecked){cancelActivity(detail);state.mode='wrecked';state.bustedTime=0;keys.clear();AudioSystem.stop();}state.damageOutcome=detail;
 const el=$('busted');el.querySelector('strong').textContent=title;el.querySelector('p').textContent=detail+' · Returning to garage';el.classList.remove('hidden');if(cameraMode!=='third-person')setCameraMode('third-person');
}
function finishDamageState(){const d=state.damage;if(!d)return;syncDamageHealth();if(d.driverDead)endDamagedRun(d.exploded?'DESTROYED':'WASTED',d.reason||'Driver killed');else if(d.components.body<=0)endDamagedRun('WRECKED',d.reason||'Vehicle destroyed');}
function recordVehicleCrash(speed,worldPoint=null){
 if(!state.damage||state.mode!=='playing'||speed<3||!Number.isFinite(speed))return;
 let local=worldPoint?bodyPoint(worldPoint):new V(0,.45-state.profile.clearance,-state.profile.length*.42);
 local=new V(clamp(local.x,-state.profile.width*.53,state.profile.width*.53),clamp(local.y,-state.profile.clearance,state.profile.eye),clamp(local.z,-state.profile.length*.52,state.profile.length*.52));
 const severity=VehicleDamageModel.crash(state.damage,state.profile,speed,local);state.lastCrashSpeed=speed;state.damageFlash=.6;
 dentVehicle(local,Math.min(.5,speed*.014),1.0+speed*.025);addImpactMark(local,true);spawnCrashDebris(worldBodyPoint(local),speed);
 if(speed>17&&state.profile.kind==='car'){
  const side=local.x/(state.profile.width/2),glancing=Math.abs(side)>.65;
  state.crashFlight={time:0,vy:Math.min(4,speed*.10),roll:motion.roll,pitch:motion.pitch,rollSpeed:glancing?Math.sign(side)*Math.min(4,speed*.10):0,pitchSpeed:glancing?0:-Math.min(1.2,speed*.025)};
  motion.vx*=.65;motion.vz*=.65;motion.yaw+=side*Math.min(.5,speed*.009);
 }
 if(severity>45&&state.damage.engineFailed)toast('ENGINE FAILURE · '+state.damage.reason,4000);finishDamageState();
}
function spawnCrashDebris(origin,speed){if(!damageGraphics)return;for(const [i,p] of damageGraphics.debris.entries()){p.mesh.position.copyFrom(origin);p.mesh.isVisible=true;p.life=3;const a=(i+.3)*2.399;p.velocity.set(Math.cos(a)*Math.min(7,speed*.18),2+i*.4,Math.sin(a)*Math.min(7,speed*.18));}}
function stepCrashPhysics(dt){
 const flight=state.crashFlight,p=state.profile,prevX=player.position.x,prevZ=player.position.z;
 motion.vx*=Math.exp(-.8*dt);motion.vz*=Math.exp(-.8*dt);player.position.x=clamp(prevX+motion.vx*dt,BOUNDS.minX+5,BOUNDS.maxX-5);player.position.z=clamp(prevZ+motion.vz*dt,BOUNDS.minZ+5,BOUNDS.maxZ-5);
 if(flight){flight.time+=dt;flight.vy-=9.81*dt;player.position.y+=flight.vy*dt;flight.roll+=flight.rollSpeed*dt;flight.pitch+=flight.pitchSpeed*dt;flight.rollSpeed*=Math.exp(-1.2*dt);flight.pitchSpeed*=Math.exp(-1.6*dt);
  const h=groundAt(player.position.x,player.position.z,player.position.y,true)??motion.lastSurface;motion.lastSurface=h;const clearance=p.clearance+Math.abs(Math.sin(flight.roll))*p.width*.25;
  if(player.position.y<h+clearance){player.position.y=h+clearance;flight.vy=flight.vy<-1?-flight.vy*.18:0;motion.vx*=.96;motion.vz*=.96;}
  motion.roll=flight.roll;motion.pitch=flight.pitch;player.rotation.set(flight.pitch,-motion.yaw,flight.roll);
  if(flight.time>2.5){state.crashFlight=null;if(Math.abs(Math.sin(flight.roll))>.8&&state.mode==='playing'){VehicleDamageModel.hit(state.damage,'body',100,'rollover');finishDamageState();}else if(state.mode==='playing'){motion.roll=motion.pitch=0;motion.suspensionVelocity=0;}}
 }else{const h=groundAt(player.position.x,player.position.z,player.position.y,true);if(h!==null){player.position.y=h+p.clearance;motion.lastSurface=h;}}
 state.speed=Math.hypot(motion.vx,motion.vz);state.distance+=Math.hypot(player.position.x-prevX,player.position.z-prevZ);
}
function updateVehicleDamage(dt){
 const d=state.damage;if(!d)return;const failed=d.engineFailed,throttle=keys.has('KeyW')||keys.has('ArrowUp');
 VehicleDamageModel.step(d,dt,{rpm:state.rpm,load:throttle?1:0,ambient:worldUpgrade.weather==='rain'?23:27});
 if(d.engineFailed){state.rpm=0;if(!failed)toast(d.reason+' · Engine stopped. Visit the garage or use admin repair.',6500);}
 if(d.exploded&&damageGraphics&&!damageGraphics.explosionShown){damageGraphics.explosionShown=true;damageGraphics.blastAge=0;damageGraphics.blast.position.copyFrom(player.position).addInPlace(new V(0,.5,0));spawnCrashDebris(player.position,30);motion.vx+=2;motion.vz-=2;for(const root of [cockpit,exterior])for(const m of root?.getChildMeshes()||[]){const mat=m.material;if(!mat||Object.values(materials).includes(mat)||damageGraphics.originalColours.has(mat))continue;damageGraphics.originalColours.set(mat,mat.diffuseColor.clone());mat.diffuseColor.scaleInPlace(.24);}}
 finishDamageState();
}
function updateDamageEffects(dt){
 const g=damageGraphics,d=state.damage;if(!g||!d)return;g.age+=dt;
 const z=VehicleDamageModel.zones(state.profile).find(z=>z.part===(d.burning?'fuel':'engine')),local=z?new V((z.min.x+z.max.x)/2,z.max.y,(z.min.z+z.max.z)/2):new V(),origin=worldBodyPoint(local),steam=d.coolantTemp>108&&d.components.radiator<90,smoke=d.burning||d.exploded||d.components.engine<45||steam;
 for(const {mesh,fire,index} of g.particles){const active=fire?d.burning||d.exploded:smoke;mesh.isVisible=active;if(!active)continue;const life=((g.age*(fire?1.7:.34)+index*.173)%1),angle=index*2.399,spread=(fire?.28:.4)+life*(fire?.25:1.2),height=life*(fire?1.6:4.5);mesh.position.set(origin.x+Math.cos(angle)*spread,origin.y+height,origin.z+Math.sin(angle)*spread+life*.7);const size=fire?(.45+Math.sin(g.age*11+index)*.09)*(1-life*.55):.4+life*1.6;mesh.scaling.set(size,fire?size*1.8:size,size);}
 if(g.blastAge<.8){g.blastAge+=dt;g.blast.isVisible=true;g.blast.scaling.setAll(1+g.blastAge*10);g.blast.material.alpha=Math.max(0,.8-g.blastAge);}else g.blast.isVisible=false;
 for(const p of g.debris){if(p.life<=0){p.mesh.isVisible=false;continue;}p.life-=dt;p.velocity.y-=9.81*dt;p.mesh.position.addInPlace(p.velocity.scale(dt));p.mesh.rotation.x+=dt*3;p.mesh.rotation.z+=dt*2;const h=terrainHeight(p.mesh.position.x,p.mesh.position.z);if(h!==null&&p.mesh.position.y<h+.08){p.mesh.position.y=h+.08;p.velocity.y=Math.abs(p.velocity.y)*.25;p.velocity.x*=.8;p.velocity.z*=.8;}}
 for(const leak of g.leaks){const lost=d.capacity[leak.kind]-d[leak.kind];if(lost>.05&&state.speed<1){const h=groundAt(origin.x,origin.z,player.position.y,true);if(h!==null){leak.mesh.isVisible=true;leak.mesh.position.set(origin.x,h+.04,origin.z);leak.mesh.scaling.setAll(clamp(.2+lost*.08,.2,1.2));}}}
}
function updateDamageGauges(){
 const g=damageGraphics,d=state.damage;if(!g||!d)return;
 const percent=key=>d.capacity[key]?Math.round(d[key]/d.capacity[key]*100):0;
 const warning=d.exploded?'FUEL EXPLOSION':d.driverDead?'DRIVER KILLED':d.burning?'FIRE — FUEL LEAK':d.engineFailed?d.reason:d.oilPressure<.7&&state.rpm>300?'LOW OIL PRESSURE':d.coolantTemp>110?'ENGINE OVERHEATING':d.components.radiator<90?'COOLANT LEAK':d.components.oil<90?'OIL LEAK':'SYSTEMS NORMAL';
 if($('damageStatus')){$('damageStatus').textContent=warning;$('damageStatus').classList.toggle('critical',warning!=='SYSTEMS NORMAL');$('damageNumbers').textContent=d.electric?'MOTOR '+Math.round(d.components.engine)+'% · RIDER '+Math.round(d.components.driver)+'%':'OIL '+d.oilPressure.toFixed(1)+' BAR · COOLANT '+Math.round(d.coolantTemp)+'°C · FUEL '+percent('fuel')+'%';}
 g.lastGauge={oilPressure:d.oilPressure,coolantTemp:d.coolantTemp,oilTemp:d.oilTemp,oil:percent('oil'),coolant:percent('coolant'),fuel:percent('fuel'),warning};
 if(!g.panelTexture)return;const c=g.panelTexture.getContext();c.setTransform(1,0,0,1,0,0);c.fillStyle='#0d1119';c.fillRect(0,0,768,384);c.textAlign='center';c.textBaseline='middle';
 function dial(cx,label,value,max,unit,warn){const cy=139,r=88;c.lineWidth=9;c.strokeStyle='#344649';c.beginPath();c.arc(cx,cy,r,-Math.PI*1.2,Math.PI*.2);c.stroke();const a=-Math.PI*1.2+clamp(value/max,0,1)*Math.PI*1.4;c.strokeStyle=warn?'#fb634c':'#d3dfef';c.beginPath();c.arc(cx,cy,r,-Math.PI*1.2,a);c.stroke();c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*r*.85,cy+Math.sin(a)*r*.85);c.stroke();c.fillStyle=warn?'#ff8f75':'#e8eff9';c.font='bold 32px monospace';c.fillText((max<10?value.toFixed(1):Math.round(value))+unit,cx,195);c.font='bold 19px sans-serif';c.fillText(label,cx,28);}
 dial(133,'OIL PRESSURE',d.oilPressure,6,' bar',d.oilPressure<.7&&state.rpm>300);dial(384,d.airCooled?'ENGINE TEMP':'COOLANT TEMP',d.coolantTemp,150,'°C',d.coolantTemp>110);dial(635,'OIL TEMP',d.oilTemp,160,'°C',d.oilTemp>130);
 for(const [i,key] of ['oil','coolant','fuel'].entries()){const x=35+i*248,has=d.capacity[key]>0,fill=has?percent(key):0;c.fillStyle='#31464a';c.fillRect(x,262,204,15);c.fillStyle=fill<20?'#f37c52':'#d2a85c';c.fillRect(x,262,204*fill/100,15);c.fillStyle='#d9e2ee';c.font='bold 19px monospace';c.fillText(key.toUpperCase()+' '+(has?fill+'%':'N/A'),x+102,300);}
 c.font='bold 21px sans-serif';c.fillStyle=warning==='SYSTEMS NORMAL'?'#bdcce2':'#ff8b6b';c.fillText(warning.toUpperCase().slice(0,47),384,351);g.panelTexture.update();
}
function repairVehicleDamage(){
 if(!state.profile)return false;
 if(damageGraphics){for(const [mesh,positions] of damageGraphics.original)if(!mesh.isDisposed()){const normals=[];VertexData.ComputeNormals(positions,mesh.getIndices(),normals);mesh.setVerticesData('position',positions,true);mesh.setVerticesData('normal',normals,true);mesh.refreshBoundingInfo();}for(const [mat,color] of damageGraphics.originalColours)if(mat.diffuseColor)mat.diffuseColor.copyFrom(color);}
 state.damage=VehicleDamageModel.create(state.profile);state.health=100;state.driverHealth=100;state.bodyDamage=0;state.crashFlight=null;state.rpm=state.profile.kind==='bike'?0:state.vehicleId==='ute'?750:900;if(exterior)exterior.scaling.setAll(1);createDamageGraphics();updateDamageGauges();
}
function initialiseDamageUI(){const panel=document.createElement('div');panel.className='damage-readout';panel.innerHTML='<strong id="damageStatus">SYSTEMS NORMAL</strong><span id="damageNumbers">OIL · COOLANT · FUEL</span>';$('hud').append(panel);const info=document.createElement('p');info.textContent='Component damage: engine hits reduce power, radiator/coolant leaks cause overheating, oil leaks lose pressure and can seize the engine, fuel damage can cause fire/explosion, and a direct driver hit can be fatal. Severe crashes leave dents, debris and burning wrecks. Watch the cockpit fluid gauges. Garage vehicle selection respawns; admin repair restores components and fluids.';$('helpModal').querySelector('.dialog').append(info);}
