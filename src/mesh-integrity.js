// Vertex counts must agree before Babylon clones a geometry or reads a channel.
// A stale short colour buffer otherwise throws inside getFloatData on impact.
function repairMeshVertexChannels(mesh){
 if(!mesh||mesh.isDisposed())return false;const count=mesh.getTotalVertices();if(!count)return false;let repaired=false;
 for(const kind of mesh.getVerticesDataKinds()){if(kind==='position')continue;const vb=mesh.getVertexBuffer(kind),raw=vb?.getData(),size=vb?.getSize();if(!raw||!size||vb.type!==5126||vb.byteOffset||vb.byteStride!==size*4)continue;
  const expected=count*size;if(raw.length===expected)continue;const out=new Float32Array(expected);if(kind==='color')out.fill(1);out.set(Array.from(raw).slice(0,expected));mesh.setVerticesData(kind,out,true,size);repaired=true;
 }return repaired;
}
function meshColourData(mesh){repairMeshVertexChannels(mesh);return mesh.isVerticesDataPresent('color')?mesh.getVerticesData('color'):null;}
