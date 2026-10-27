function crushVehicleAgainstSurface(localPoint,worldNormal,speed){
 if(!damageGraphics||!exterior)return 0;player.computeWorldMatrix(true);const playerWorld=player.getWorldMatrix().clone(),inversePlayer=Matrix.Invert(playerWorld),n=V.TransformNormal(new V(worldNormal.x,0,worldNormal.z),inversePlayer).normalize(),p=state.profile;
 const support=Math.abs(n.x)*p.width*.5+Math.abs(n.z)*p.length*.5,depth=clamp((speed-15)*.055,.10,Math.min(1.35,support*.45)),zone=Math.max(.8,support*.85);let affected=0;
 for(const root of [exterior,cockpit])for(const mesh of root.getChildMeshes()){
  if(/instrument|gauge|switch|steering|navigation|rotor/i.test(mesh.name+' '+mesh.material?.name))continue;
  const positions=mesh.getVerticesData('position'),indices=mesh.getIndices();if(!positions||!indices||positions.length>150000)continue;mesh.computeWorldMatrix(true);const world=mesh.getWorldMatrix().clone(),inv=Matrix.Invert(world),next=positions.slice();let changed=false;
  for(let i=0;i<positions.length;i+=3){const at=V.TransformCoordinates(V.TransformCoordinates(new V(positions[i],positions[i+1],positions[i+2]),world),inversePlayer),along=V.Dot(at.subtract(localPoint),n),weight=clamp(1-Math.max(0,along)/zone,0,1);if(weight<=0||Math.abs(at.y-localPoint.y)>1.9)continue;
   at.addInPlace(n.scale(depth*weight));at.y+=Math.sin(at.x*9+at.z*11)*depth*.14*weight;const result=V.TransformCoordinates(V.TransformCoordinates(at,playerWorld),inv);next[i]=result.x;next[i+1]=result.y;next[i+2]=result.z;changed=true;
  }
  if(changed){if(!mesh.metadata?.damageDecal&&!damageGraphics.original.has(mesh))damageGraphics.original.set(mesh,positions.slice());const normals=[];VertexData.ComputeNormals(next,indices,normals);mesh.setVerticesData('position',next,true);mesh.setVerticesData('normal',normals,true);mesh.refreshBoundingInfo();affected++;}
 }
 if(Math.abs(localPoint.z)>p.length*.2){if(localPoint.z<0)state.frontCrush=Math.max(state.frontCrush||0,depth);else state.rearCrush=Math.max(state.rearCrush||0,depth);}else state.sideCrush=Math.max(state.sideCrush||0,depth*.4);state.lastImpact={kph:Math.round(speed*3.6),energyKJ:Math.round(.5*p.mass*speed*speed/1000),crushDepth:depth,affectedMeshes:affected,solid:true};return depth;
}
