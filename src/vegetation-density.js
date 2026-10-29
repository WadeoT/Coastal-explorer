// Density follows mapped cover; species, crown shape and exact plant locations
// are visual estimates. Geometry is batched with the existing scenery meshes.
function vegetationHabitat(tags={}){
 if(tags.natural==='water'||/industrial|commercial|construction|retail|farmyard/.test(tags.landuse||'')||/pitch|parking/.test(tags.leisure||tags.amenity||''))return{kind:'clear',trees:0,shrubs:0};
 if(/mangrove/.test(tags.wetland||''))return{kind:'mangrove',trees:.66,shrubs:.8,height:4,variation:4,crown:.53};
 if(tags.natural==='wetland')return{kind:'wetland',trees:0,shrubs:.72,height:1,variation:1,crown:.4};
 if(tags.natural==='heath')return{kind:'heath',trees:.035,shrubs:.95,height:2.5,variation:1.5,crown:.5};
 if(tags.natural==='scrub')return{kind:'scrub',trees:.23,shrubs:.95,height:3.5,variation:3.5,crown:.5};
 if(tags.natural==='wood'||tags.landuse==='forest')return{kind:'forest',trees:.92,shrubs:.85,height:9,variation:10,crown:.35};
 if(tags.natural==='grassland'||/grass|meadow/.test(tags.landuse||''))return{kind:'grass',trees:0,shrubs:.08};
 if(tags.leisure==='park'||tags.leisure==='nature_reserve')return{kind:'park',trees:.24,shrubs:.26,height:5,variation:5,crown:.34};
 if(tags.landuse==='residential')return{kind:'garden',trees:.16,shrubs:.12,height:4,variation:4,crown:.32};
 return{kind:'clear',trees:0,shrubs:0};
}
function mappedVegetationAt(x,z){
 let best=null,size=Infinity;for(const a of terrainUseIndex.get(Math.floor(x/512)+','+Math.floor(z/512))||[]){const b=a.bounds,s=(b.maxX-b.minX)*(b.maxZ-b.minZ);if(s>=size||x<b.minX||x>b.maxX||z<b.minZ||z>b.maxZ||!pointInPolygon(x,z,a.points)||a.rings?.slice(1).some(r=>pointInPolygon(x,z,r)))continue;best=a;size=s;}
 return vegetationHabitat(best?.tags);
}
function vegetationSiteClear(x,z,r=1){return mappedWaterAt(x,z)===null&&!roadCorridorAt(x,z,r+.8)&&!airfieldProtectedAt(x,z)&&!buildingsNear(x,z,r+2).length;}
function appendVegetationCrown(a,x,y,z,r,rich){
 if(rich){const d={p:a.leafPos,i:a.leafIdx,c:a.leafColours,tint:true};appendCoastalFoliage(d,x,y,z,r);appendCoastalFoliage(d,x+r*.40,y-r*.38,z-r*.22,r*.68);appendCoastalFoliage(d,x-r*.35,y-r*.28,z+r*.27,r*.72);return;}
 const ring=[[x-r,y-r*.1,z],[x,y-r*.1,z+r],[x+r,y-r*.1,z],[x,y-r*.1,z-r]],top=[x,y+r*.75,z],bottom=[x,y-r*.65,z];for(let j=0;j<4;j++)for(const tri of [[ring[j],ring[(j+1)%4],top],[ring[(j+1)%4],ring[j],bottom]]){const base=a.leafPos.length/3;for(const v of tri){a.leafPos.push(...v);const tint=v[1]>y?1.08:.84;a.leafColours.push(tint,tint+.015,tint-.02,1);}a.leafIdx.push(base,base+1,base+2);}
}
async function buildMappedVegetation(centre,a,cuboid,yieldBuild){
 const view=localViewProfile(),density=graphicsPrefs.vegetation/100,low=performanceLow,limit=low?700:1800,radius=Math.min(1200,Math.max(600,view.buildings)),near=low?180:view.air?350:480,candidates=[],stats={trees:0,forest:0,scrub:0,mangrove:0,near:0,limit};let work=0;
 // Keep a fixed 12 m lattice for stable plants; the outer rings use lower LOD.
 for(let x=Math.floor((centre.x-radius)/24)*24;x<=centre.x+radius;x+=24)for(let z=Math.floor((centre.z-radius)/24)*24;z<=centre.z+radius;z+=24){if(++work%128===0)await yieldBuild();const d=Math.hypot(x-centre.x,z-centre.z);if(d>radius+30)continue;for(const [ox,oz]of d<near?[[0,0],[12,0],[0,12],[12,12]]:[[0,0]]){const gx=x+ox,gz=z+oz,seed=deterministic(gx+','+gz+'canopy'),px=gx+(seed-.5)*8,pz=gz+(deterministic(gx+'canopyZ'+gz)-.5)*8,dist=Math.hypot(px-centre.x,pz-centre.z);if(dist>radius)continue;const habitat=mappedVegetationAt(px,pz);if(!habitat.trees||seed>habitat.trees*density)continue;candidates.push({x:px,z:pz,seed,dist,habitat});}}
 candidates.sort((a,b)=>a.dist-b.dist);
 for(const q of candidates){if(stats.trees>=limit)break;if(++work%64===0)await yieldBuild();const {x,z,seed,habitat,dist}=q,height=habitat.height+seed*habitat.variation,r=height*habitat.crown;if(!vegetationSiteClear(x,z,Math.min(r,4)))continue;const h=terrainHeight(x,z);if(h===null)continue;if(a.nextObstacles?.some(o=>o.polygon&&Math.abs(o.x-x)<o.w+Math.min(r,4)&&Math.abs(o.z-z)<o.d+Math.min(r,4)))continue;cuboid(a.trunkPos,a.trunkIdx,x,h,z,.22,height*.72,.22);a.nextObstacles?.push({x,z,radius:.14,height:height*.72,baseY:h,kind:'tree'});appendVegetationCrown(a,x,h+height*.78,z,r,!low&&dist<near);stats.trees++;if(dist<near)stats.near++;if(stats[habitat.kind]!==undefined)stats[habitat.kind]++;}
 return stats;
}
