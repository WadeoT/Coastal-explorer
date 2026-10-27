// Bounded arcade rigid-body approximation for ground cars. Aircraft retain their solver.
function carCrashSupport(p,roll,pitch){
 const height=p.height||clamp(p.eye+.45,1.2,2.25),centre=height/2-p.clearance,rot=Matrix.RotationYawPitchRoll(0,pitch,roll);let min=Infinity;
 for(const x of [-p.width/2,p.width/2])for(const y of [-p.clearance,height-p.clearance])for(const z of [-p.length*.46,p.length*.46])min=Math.min(min,V.TransformCoordinates(new V(x,y,z),rot).y);
 return {floor:-min,potential:-min+V.TransformCoordinates(new V(0,centre,0),rot).y};
}
function startCarCrash(speed,local,impact){
 const p=state.profile;if(p.kind!=='car'||speed<12||state.crashFlight?.groundVehicle)return false;
 const side=clamp(local.x/(p.width*.5),-1,1),sideHit=Math.abs(side)>.48,sign=Math.sign(side||motion.vx*Math.cos(motion.yaw)+motion.vz*Math.sin(motion.yaw))||1;
 const rollSpeed=sideHit?sign*clamp((speed-7)*.15*(p.eye/1.4),.8,5.5):0,pitchSpeed=sideHit?-.25:clamp((speed-15)*-.065,-1.8,0);
 state.crashFlight={groundVehicle:true,time:0,roll:motion.roll,pitch:motion.pitch,rollSpeed,pitchSpeed,yawSpeed:side*clamp(speed*.018,0,.8),vy:sideHit?Math.min(3,speed*.07):Math.min(1,speed*.025),rest:0,settled:false};state.solidCrash=null;state.overturned=false;
 if(impact?.solid){motion.vx+=(impact.normal?.x||0)*.8;motion.vz+=(impact.normal?.z||0)*.8;}else{motion.vx*=.72;motion.vz*=.72;}
 if(cameraMode!=='third-person')setCameraMode('third-person');return true;
}
function stepCarCrash(dt){
 const f=state.crashFlight,p=state.profile;if(!f?.groundVehicle)return;
 const subdivisions=Math.max(1,Math.ceil(dt/(1/120))),step=dt/subdivisions;
 for(let k=0;k<subdivisions;k++){
  if(f.settled){state.speed=0;motion.vx=motion.vz=motion.vy=0;break;}
  f.time+=step;const x=player.position.x,z=player.position.z;
  player.position.x=clamp(x+motion.vx*step,BOUNDS.minX+5,BOUNDS.maxX-5);player.position.z=clamp(z+motion.vz*step,BOUNDS.minZ+5,BOUNDS.maxZ-5);
  f.vy-=9.81*step;player.position.y+=f.vy*step;f.roll+=f.rollSpeed*step;f.pitch+=f.pitchSpeed*step;motion.yaw+=f.yawSpeed*step;
  const ground=groundAt(player.position.x,player.position.z,player.position.y,true)??motion.lastSurface,support=carCrashSupport(p,f.roll,f.pitch),floor=ground+support.floor;motion.lastSurface=ground;
  if(player.position.y<=floor+.02){
   const impact=Math.max(0,-f.vy);player.position.y=floor;f.vy=impact>1.5?impact*.11:0;
   const eps=.015,rollGradient=(carCrashSupport(p,f.roll+eps,f.pitch).potential-carCrashSupport(p,f.roll-eps,f.pitch).potential)/(2*eps),pitchGradient=(carCrashSupport(p,f.roll,f.pitch+eps).potential-carCrashSupport(p,f.roll,f.pitch-eps).potential)/(2*eps);
   f.rollSpeed-=clamp(rollGradient,-2,2)*9.81/(p.width*p.width/12+.35)*step;f.pitchSpeed-=clamp(pitchGradient,-3,3)*9.81/(p.length*p.length/12+.5)*step;
   f.rollSpeed*=Math.exp(-1.8*step);f.pitchSpeed*=Math.exp(-2.4*step);f.yawSpeed*=Math.exp(-2*step);
   const speed=Math.hypot(motion.vx,motion.vz),deceleration=(Math.abs(Math.sin(f.roll))>.3?5.5:3.2)*step,factor=speed?Math.max(0,1-deceleration/speed):0;motion.vx*=factor;motion.vz*=factor;
   if(impact>2&&state.elapsed-(f.lastContact||-10)>.25){f.lastContact=state.elapsed;const local=new V(Math.sin(f.roll)*p.width*.45,-p.clearance,0);dentVehicle(local,Math.min(.22,impact*.018),.9);VehicleDamageModel.hit(state.damage,'body',Math.min(18,impact*1.2),'rollover');spawnCrashDebris(worldBodyPoint(local),impact);}
   const calm=Math.hypot(motion.vx,motion.vz)<.35&&Math.abs(f.rollSpeed)<.25&&Math.abs(f.pitchSpeed)<.25&&Math.abs(f.vy)<.2;f.rest=calm?f.rest+step:0;
   if(f.rest>.65){f.settled=true;const up=V.TransformNormal(new V(0,1,0),Matrix.RotationYawPitchRoll(0,f.pitch,f.roll)).y;state.overturned=up<.65;if(state.overturned){state.rpm=0;dangerAlert('overturned','VEHICLE OVERTURNED','Engine stopped · R recovers your position; damage remains.','critical','body');}else if(state.mode==='playing'){state.crashFlight=null;motion.pitch=f.pitch;motion.roll=f.roll;}}
  }else{f.rollSpeed*=Math.exp(-.06*step);f.pitchSpeed*=Math.exp(-.06*step);}
  motion.pitch=f.pitch;motion.roll=f.roll;motion.vy=f.vy;player.rotation.set(f.pitch,-motion.yaw,f.roll);
  // The same swept scenery contacts keep sliding/tumbling wrecks outside buildings.
  collideMappedWorld(x,z);state.distance+=Math.hypot(player.position.x-x,player.position.z-z);
 }
 state.speed=Math.hypot(motion.vx,motion.vz);syncDamageHealth();finishDamageState();
}
function refineDamagePanels(root){
 for(const m of root.getChildMeshes()){
  if(m.metadata?.deformableSkin)continue;const name=m.name+' '+m.material?.name;if(!/paint|bodywork|alloy-tray/i.test(name)||/glass|wheel|tyre|instrument/i.test(name))continue;
  const pos=m.getVerticesData('position'),idx=m.getIndices(),uv=m.getVerticesData('uv');if(!pos||!idx||idx.length>12000||pos.length>24000)continue;
  const out=[],outUV=[],indices=[];
  for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],d=idx[t+2],v=i=>new V(pos[i*3],pos[i*3+1],pos[i*3+2]),n=clamp(Math.ceil(Math.max(V.Distance(v(a),v(b)),V.Distance(v(a),v(d)),V.Distance(v(b),v(d)))/.55),1,3),grid=[];
   for(let row=0;row<=n;row++){grid[row]=[];for(let col=0;col<=n-row;col++){const u=row/n,w=col/n,weights=[1-u-w,u,w],ids=[a,b,d];grid[row][col]=out.length/3;for(let axis=0;axis<3;axis++)out.push(ids.reduce((s,id,i)=>s+pos[id*3+axis]*weights[i],0));if(uv)for(let axis=0;axis<2;axis++)outUV.push(ids.reduce((s,id,i)=>s+uv[id*2+axis]*weights[i],0));}}
   for(let row=0;row<n;row++)for(let col=0;col<n-row;col++){indices.push(grid[row][col],grid[row+1][col],grid[row][col+1]);if(col<n-row-1)indices.push(grid[row+1][col],grid[row+1][col+1],grid[row][col+1]);}
  }
  const normals=[];VertexData.ComputeNormals(out,indices,normals);m.setVerticesData('position',out,true);m.setVerticesData('normal',normals,true);if(uv)m.setVerticesData('uv',outUV,true);m.setIndices(indices);m.refreshBoundingInfo();m.metadata={...m.metadata,deformableSkin:true};
 }
}
function impactDecalMaterial(large){
 const g=damageGraphics,key=large?'scrapeMaterial':'bulletMaterial';if(g[key])return g[key];
 const t=new DynamicTexture('attached-impact-texture-'+large,256,scene,true),c=t.getContext();c.clearRect(0,0,256,256);
 if(large){for(let i=0;i<35;i++){const y=80+(i*19)%100;c.strokeStyle=i%3?'rgba(28,26,23,.8)':'rgba(185,182,170,.9)';c.lineWidth=2+i%4;c.beginPath();c.moveTo(40+(i*13)%40,y);c.lineTo(150+(i*17)%65,y-10-i%14);c.stroke();}}else{const gradient=c.createRadialGradient(128,128,5,128,128,70);gradient.addColorStop(0,'#080808');gradient.addColorStop(.3,'#13120f');gradient.addColorStop(.48,'#9e9990');gradient.addColorStop(.68,'rgba(42,36,27,.8)');gradient.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gradient;c.fillRect(0,0,256,256);}
 t.hasAlpha=true;t.update(false);const m=mat('surface-attached-'+(large?'scraped-metal':'bullet-hole'),'#ffffff');m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.zOffset=-2;m.specularColor=new C(.15,.15,.15);g.materials.push(m);g[key]=m;return m;
}
