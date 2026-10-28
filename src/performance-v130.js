// One bounded overscan canvas keeps static map work out of the frequent HUD draw.
const miniBase={canvas:null,x:0,z:0,key:'',built:0,builds:0,hits:0};
function drawMinimapBase(ctx,w,h,scale,px,pz){
 const now=performance.now(),margin=96,key=[w,h,roads.length,landFeatures.length,aerialMap.mode,aerialMap.revision||0].join(':');
 if(!miniBase.canvas||miniBase.key!==key||Math.abs(px-miniBase.x)*scale>margin-8||Math.abs(pz-miniBase.z)*scale>margin-8||now-miniBase.built>10000){
  const canvas=miniBase.canvas||(miniBase.canvas=document.createElement('canvas'));canvas.width=w+margin*2;canvas.height=h+margin*2;const c=canvas.getContext('2d'),x=px,z=pz,project=p=>({x:canvas.width/2+(p.x-x)*scale,y:canvas.height/2+(p.z-z)*scale}),radius=Math.max(canvas.width,canvas.height)/scale/2;
  drawNaturalMap(c,project,{minX:x-canvas.width/scale/2,maxX:x+canvas.width/scale/2,minZ:z-canvas.height/scale/2,maxZ:z+canvas.height/scale/2});c.lineCap='round';
  for(const road of roadsNear(x,z,radius)){c.beginPath();road.points.forEach((p,i)=>{const q=project(p);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);});c.strokeStyle=road.motorway?'#c2b48d':'#7b879b';c.lineWidth=road.motorway?5:3;c.stroke();}
  Object.assign(miniBase,{x,z,key,built:now,builds:miniBase.builds+1});
 }else miniBase.hits++;
 ctx.drawImage(miniBase.canvas,margin+(px-miniBase.x)*scale,margin+(pz-miniBase.z)*scale,w,h,0,0,w,h);
}
const naturalMapIndex={count:-1,first:null,cells:new Map(),large:[]};
function indexedMapAreas(view){
 const index=naturalMapIndex;if(index.count!==landFeatures.length||index.first!==landFeatures[0]){index.count=landFeatures.length;index.first=landFeatures[0];index.cells.clear();index.large=[];for(const a of landFeatures){const b=a.bounds,x0=Math.floor(b.minX/512),x1=Math.floor(b.maxX/512),z0=Math.floor(b.minZ/512),z1=Math.floor(b.maxZ/512);if((x1-x0+1)*(z1-z0+1)>128){index.large.push(a);continue;}for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=x+','+z;if(!index.cells.has(key))index.cells.set(key,[]);index.cells.get(key).push(a);}}}
 const x0=Math.floor(view.minX/512),x1=Math.floor(view.maxX/512),z0=Math.floor(view.minZ/512),z1=Math.floor(view.maxZ/512);if((x1-x0+1)*(z1-z0+1)>256)return landFeatures;
 const found=new Set(index.large);for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)for(const a of index.cells.get(x+','+z)||[])found.add(a);return [...found];
}
