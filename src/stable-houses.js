// Fixed world tiles and deterministic neighbour priority keep estimated houses
// identical across scenery refreshes, camera positions and separate clients.
const homeRawTiles=new Map(),homeTileCache=new Map(),homePathCandidates=new Map();
function clearEstimatedHomesCache(){homeRawTiles.clear();homeTileCache.clear();homePathCandidates.clear();homeCache.clear();}
function homeCandidates(path){if(homePathCandidates.has(path.id))return homePathCandidates.get(path.id);const result=[];for(let d=20;d<path.length;d+=26){const p=samplePath(path,d,1,0);for(const side of [-1,1])result.push({id:'infill-'+path.id+'-'+Math.round(d)+'-'+side,x:p.x+p.dz*(path.width/2+12)*side,z:p.z-p.dx*(path.width/2+12)*side,dx:p.dx,dz:p.dz});}homePathCandidates.set(path.id,result);return result;}
function rawHomeTile(cx,cz){
 const key=cx+','+cz;if(homeRawTiles.has(key))return homeRawTiles.get(key);const result=[],x=cx*1024,z=cz*1024;
 const paths=roadsNear(x+512,z+512,560).filter(p=>['residential','living_street'].includes(p.highway)).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
 for(const path of paths)for(const c of homeCandidates(path)){
  if(Math.floor(c.x/1024)!==cx||Math.floor(c.z/1024)!==cz||inMappedLanduse(woodlandIndex,c.x,c.z)||mappedWaterAt(c.x,c.z)!==null)continue;
  const use=terrainUseAt(c.x,c.z)?.tags||{};if(/park|golf|pitch|cemetery|recreation|beach|school|industrial|commercial|retail|forest|wood|farmland/.test([use.landuse,use.natural,use.leisure,use.amenity].join(' ')))continue;
  const road=nearestRoad(c.x,c.z);if(!road||road.dist<8)continue;const width=7+deterministic(c.id)*3,depth=8+deterministic(c.id+'d')*4,points=[];
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]])points.push({x:c.x+c.dx*a*width/2+c.dz*b*depth/2,z:c.z+c.dz*a*width/2-c.dx*b*depth/2});
  if(points.some(p=>mappedWaterAt(p.x,p.z)!==null||inMappedLanduse(woodlandIndex,p.x,p.z)))continue;
  if(buildingsNear(c.x,c.z,24).some(b=>points.some(p=>pointInPolygon(p.x,p.z,b.points))||b.points.some(p=>pointInPolygon(p.x,p.z,points))))continue;
  const xs=points.map(p=>p.x),zs=points.map(p=>p.z),tags={building:'house',height:String(deterministic(c.id+'levels')>.82?6.2:3.4+deterministic(c.id+'h')*.8),'roof:shape':deterministic(c.id+'shape')>.25?'hipped':'gabled',source:'Estimated frontage, deterministic world tile'};
  result.push({...c,tags,points,rings:[points],estimated:true,bounds:{minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)}});
 }
 homeRawTiles.set(key,result);return result;
}
function estimatedHomeTile(cx,cz){const key=cx+','+cz;if(homeTileCache.has(key))return homeTileCache.get(key);const cells=new Map();for(let x=cx-1;x<=cx+1;x++)for(let z=cz-1;z<=cz+1;z++)for(const c of rawHomeTile(x,z)){const k=Math.floor(c.x/32)+','+Math.floor(c.z/32);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(c);}const homes=rawHomeTile(cx,cz).filter(c=>{for(let ix=Math.floor((c.x-20)/32);ix<=Math.floor((c.x+20)/32);ix++)for(let iz=Math.floor((c.z-20)/32);iz<=Math.floor((c.z+20)/32);iz++)for(const other of cells.get(ix+','+iz)||[])if(other.id<c.id&&Math.hypot(other.x-c.x,other.z-c.z)<20)return false;return true;});homeTileCache.set(key,homes);return homes;}
async function prepareEstimatedHomes(x,z,yieldBuild){if(!worldUpgrade.estimatedBuildings)return;const radius=worldUpgrade.buildingRenderDistance||3600;let start=performance.now();for(let cx=Math.floor((x-radius)/1024);cx<=Math.floor((x+radius)/1024);cx++)for(let cz=Math.floor((z-radius)/1024);cz<=Math.floor((z+radius)/1024);cz++){estimatedHomeTile(cx,cz);if(performance.now()-start>5){await yieldBuild();start=performance.now();}}}
function estimatedHomesNear(x,z){
 homeCache.clear();if(!worldUpgrade.estimatedBuildings)return[];const radius=worldUpgrade.buildingRenderDistance||3600,result=[];
 for(let cx=Math.floor((x-radius)/1024);cx<=Math.floor((x+radius)/1024);cx++)for(let cz=Math.floor((z-radius)/1024);cz<=Math.floor((z+radius)/1024);cz++)for(const h of estimatedHomeTile(cx,cz))if(h.bounds.maxX>=x-radius&&h.bounds.minX<=x+radius&&h.bounds.maxZ>=z-radius&&h.bounds.minZ<=z+radius){result.push(h);const k=Math.floor(h.x/32)+','+Math.floor(h.z/32);if(!homeCache.has(k))homeCache.set(k,[]);homeCache.get(k).push({x:h.x,z:h.z});}
 return result;
}
