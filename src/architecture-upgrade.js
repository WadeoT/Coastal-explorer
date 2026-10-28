const ARCHITECTURE_PILOT=/*__ARCHITECTURE_PILOT__*/{records:[]};
const architectureStats={matched:0,added:0,tagUpdates:0};
function applyArchitecturePilot(pack){
 const ids=new Map();for(const row of pack.buildings||[]){const id=/^w(\d+):/.exec(String(row[0]));if(id&&!ids.has(Number(id[1])))ids.set(Number(id[1]),row);}
 Object.assign(architectureStats,{matched:0,added:0,tagUpdates:0});
 for(const r of ARCHITECTURE_PILOT.records){let row=ids.get(r.id);if(row){architectureStats.matched++;for(const [k,v]of Object.entries(r.tags))if(!row[1][k]){row[1][k]=v;architectureStats.tagUpdates++;}}
 else{row=['w'+r.id+':pilot',{...r.tags},r.rings.map(ring=>ring.flatMap(([lon,lat])=>[Math.round(lat*1e6),Math.round(lon*1e6)]))];pack.buildings.push(row);ids.set(r.id,row);architectureStats.added++;}
 row[1]['coastal:pilot']='source-backed footprint';
 }
}
function addFacadeRelief(a,b,bottom,top,left,right,normal,positions,indices){
 const length=Math.hypot(b.x-a.x,b.z-a.z),dx=(b.x-a.x)/length,dz=(b.z-a.z)/length,nx=dz*normal,nz=-dx*normal;
 const box=(u,y,w,h)=>{const p=(x,yy,d)=>[a.x+dx*x+nx*d,yy,a.z+dz*x+nz*d],quad=(aa,bb,cc,dd)=>{const i=positions.length/3;positions.push(...aa,...bb,...cc,...dd);indices.push(i,i+1,i+2,i+1,i+3,i+2);};const l=u-w/2,r=u+w/2,t=y+h;quad(p(l,y,.07),p(r,y,.07),p(l,t,.07),p(r,t,.07));quad(p(l,y,.07),p(l,t,.07),p(l,y,.13),p(l,t,.13));quad(p(r,y,.13),p(r,t,.13),p(r,y,.07),p(r,t,.07));quad(p(l,t,.07),p(r,t,.07),p(l,t,.13),p(r,t,.13));quad(p(l,y,.13),p(r,y,.13),p(l,t,.13),p(r,t,.13));};
 box(left,bottom-.07,.07,top-bottom+.14);box(right,bottom-.07,.07,top-bottom+.14);box((left+right)/2,bottom-.07,right-left,.07);box((left+right)/2,top,right-left,.07);
}
