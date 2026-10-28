const crashStructures=new Map(),looseVehicleParts=[];
function beginCrashStructure(root,p,point,speed,worldNormal=null,owner=null){
 if(!root||p.kind!=='car'||speed<4)return;root.computeWorldMatrix(true);let s=crashStructures.get(root);
 if(!s){const world=root.getWorldMatrix().clone(),inv=Matrix.Invert(world),cage=BeamCrash.create(p),skins=[];
  for(const m of root.getChildMeshes()){if(m.metadata?.damageDecal||/glass|wheel|tyre|lamp|light|gauge|instrument|steering/i.test(m.name+' '+m.material?.name))continue;const pos=m.getVerticesData('position');if(!pos||pos.length>60000)continue;m.computeWorldMatrix(true);const relative=m.getWorldMatrix().multiply(inv),inverse=Matrix.Invert(relative),base=pos.slice(),binding=[];for(let i=0;i<base.length;i+=3){const v=V.TransformCoordinates(new V(base[i],base[i+1],base[i+2]),relative);binding.push({p:v,weights:BeamCrash.weights(cage,v.asArray())});}skins.push({mesh:m,base,binding,inverse});if(root===exterior&&damageGraphics&&!damageGraphics.original.has(m))damageGraphics.original.set(m,base.slice());}
  s={root,p,cage,skins,owner,age:0,clock:0};crashStructures.set(root,s);
 }
 const localNormal=worldNormal?V.TransformNormal(new V(worldNormal.x,worldNormal.y||0,worldNormal.z),Matrix.Invert(root.getWorldMatrix())).normalize():new V(-point.x,0,-point.z).normalize();BeamCrash.impact(s.cage,point.asArray(),localNormal.asArray(),speed);s.age=0;detachImpactParts(s,point,speed);return s;
}
function detachImpactParts(s,point,speed){
 if(speed<14)return;const root=s.root,p=s.p,near=point.clone();root.computeWorldMatrix(true);
 const candidates=[...root.getChildTransformNodes().filter(n=>n.metadata?.wheel||n.metadata?.crashPart),...root.getChildMeshes().filter(m=>m.metadata?.crashPart)];let count=0;
 for(const part of candidates){if(part.metadata?.detached||looseVehicleParts.filter(a=>!a.expired).length>=48||count>=6)continue;part.computeWorldMatrix(true);const centre=V.TransformCoordinates(part.getAbsolutePosition(),Matrix.Invert(root.getWorldMatrix())),distance=V.Distance(centre,near),wheel=part.metadata?.wheel,threshold=wheel?26:part.metadata.crashPart==='mirror'?14:21;
  if(speed<threshold||distance>(wheel?1.5:2.1))continue;const original={parent:part.parent,position:part.position.clone(),rotation:part.rotation.clone(),quaternion:part.rotationQuaternion?.clone()||null};part.setParent(null);part.setEnabled(true);part.metadata={...part.metadata,detached:true};
  const velocity=s.owner?new V(Math.sin(s.owner.yaw)*s.owner.speed,0,-Math.cos(s.owner.yaw)*s.owner.speed):new V(motion.vx,motion.vy,motion.vz),out=V.TransformNormal(centre.clone().normalize(),root.getWorldMatrix()).normalize();velocity.addInPlace(out.scale(speed*.14));velocity.y+=Math.min(5,speed*.10);
  if(wheel){const damage=s.owner?.damage||(root===exterior?state.damage:null);if(damage)damage.wheelsLost=(damage.wheelsLost||0)+1;}
  looseVehicleParts.push({part,source:root,original,velocity,age:0,spin:new V(2+count,3-count,1.4),expired:false});count++;
 }
}
function updateCrashStructures(dt){
 let processed=0;const ordered=[...crashStructures].sort(([a],[b])=>(a===exterior?-1:b===exterior?1:V.DistanceSquared(a.getAbsolutePosition(),player.position)-V.DistanceSquared(b.getAbsolutePosition(),player.position)));for(const [root,s] of ordered){if(root.isDisposed()){clearCrashStructure(root,false);continue;}s.age+=dt;if(s.age>3&&!s.cage.active)continue;if((root!==exterior&&V.DistanceSquared(root.getAbsolutePosition(),player.position)>240**2)||processed>=4){if(s.age>3)s.cage.active=false;continue;}processed++;BeamCrash.step(s.cage,dt);s.clock+=dt;if(s.clock<1/30)continue;s.clock=0;
  for(const skin of s.skins){const m=skin.mesh;if(m.isDisposed()||m.metadata?.detached||!m.isDescendantOf(root))continue;const pos=skin.base.slice();for(let i=0;i<skin.binding.length;i++){const b=skin.binding[i],offset=BeamCrash.offset(s.cage,b.weights),v=V.TransformCoordinates(b.p.add(new V(...offset)),skin.inverse);pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;}const normals=[];VertexData.ComputeNormals(pos,m.getIndices(),normals);m.setVerticesData('position',pos,true);m.setVerticesData('normal',normals,true);m.refreshBoundingInfo();}
 }
 for(const d of looseVehicleParts){if(d.expired)continue;d.age+=dt;if(d.part.isDisposed()){d.expired=true;continue;}if(d.age>20){d.part.setEnabled(false);d.expired=true;continue;}d.velocity.y-=9.81*dt;const before=d.part.position.clone(),next=before.add(d.velocity.scale(dt)),g=groundAt(next.x,next.z,before.y,true)??terrainHeight(next.x,next.z);
  for(const o of collisionObjectsNear(before,next,.5))if(objectContact(o,next,{width:.4,length:.4,clearance:0,eye:.4})){next.x=before.x;next.z=before.z;d.velocity.x*=-.15;d.velocity.z*=-.15;break;}
  if(g!==null&&next.y<g+.18){next.y=g+.18;d.velocity.y=Math.abs(d.velocity.y)*.18;d.velocity.x*=Math.exp(-dt*3);d.velocity.z*=Math.exp(-dt*3);d.spin.scaleInPlace(Math.exp(-dt*2));}d.part.position.copyFrom(next);if(d.part.rotationQuaternion){d.part.rotation.copyFrom(d.part.rotationQuaternion.toEulerAngles());d.part.rotationQuaternion=null;}d.part.rotation.addInPlace(d.spin.scale(dt));
 }
}
function clearCrashStructure(root,restore=true){
 const s=crashStructures.get(root);if(s&&restore)for(const skin of s.skins)if(!skin.mesh.isDisposed()){skin.mesh.setVerticesData('position',skin.base,true);const normals=[];VertexData.ComputeNormals(skin.base,skin.mesh.getIndices(),normals);skin.mesh.setVerticesData('normal',normals,true);skin.mesh.refreshBoundingInfo();}
 for(let i=looseVehicleParts.length-1;i>=0;i--){const d=looseVehicleParts[i];if(d.source!==root)continue;if(!d.part.isDisposed()){if(restore&&d.original.parent&&!d.original.parent.isDisposed()){d.part.parent=d.original.parent;d.part.position.copyFrom(d.original.position);d.part.rotation.copyFrom(d.original.rotation);d.part.rotationQuaternion=d.original.quaternion;d.part.setEnabled(true);d.part.metadata.detached=false;}else d.part.dispose(false,false);}looseVehicleParts.splice(i,1);}crashStructures.delete(root);
}
