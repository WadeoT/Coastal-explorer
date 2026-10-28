// Original procedural surfaces are embedded and generated once per material.
// World dimensions in mesh UVs keep bricks, grass and roof ribs at useful scales.
function makeSurfaceTexture(name,kind,size=512){
 if($('qualitySelect')?.value==='ultra')size=kind==='paint'||kind==='metal'||kind==='rubber'?512:1024;
 const cacheKey=kind+':'+size;if(sharedSurfaceTextures.has(cacheKey))return sharedSurfaceTextures.get(cacheKey);
 const texture=new DynamicTexture(name,size,scene,true),c=texture.getContext(),pixels=c.createImageData(size,size);let seed=719;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const grid8=Array.from({length:64},rand),grid32=Array.from({length:1024},rand),noiseAt=(u,v,grid,n)=>{const x=u*n,y=v*n,ix=Math.floor(x),iy=Math.floor(y),a=x-ix,b=y-iy,s=a*a*(3-2*a),t=b*b*(3-2*b),at=(dx,dy)=>grid[((iy+dy)%n)*n+(ix+dx)%n];return lerp(lerp(at(0,0),at(1,0),s),lerp(at(0,1),at(1,1),s),t)-.5;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,noise=rand()-.5,macro=noiseAt(u,v,grid8,8),fine=noiseAt(u,v,grid32,32);let base=kind==='sand'?237:kind==='ground'?219:kind==='wall'?226:kind==='roof'?207:kind==='metal'?210:kind==='rubber'?177:244,variation=kind==='paint'?noise*12:kind==='rubber'?noise*25:noise*34+macro*12+fine*4;
  if(kind==='roof')variation+=Math.sin(u*TAU*32)*25;
  const i=(y*size+x)*4;pixels.data[i]=clamp(base+variation,0,255);pixels.data[i+1]=clamp(base+variation+(kind==='ground'?3:0),0,255);pixels.data[i+2]=clamp(base+variation-(kind==='ground'?8:0),0,255);pixels.data[i+3]=255;
 }
 c.putImageData(pixels,0,0);
 if(kind==='ground'){
  for(let i=0;i<85;i++){const x=rand()*size,y=rand()*size,r=4+rand()*35,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%3?'rgba(102,88,64,.30)':'rgba(243,230,189,.38)');g.addColorStop(1,'rgba(180,172,148,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<9000;i++){const x=rand()*size,y=rand()*size,len=1+rand()*5;c.strokeStyle=i%3?'rgba(120,127,94,.32)':'rgba(245,234,191,.60)';c.lineWidth=.6+rand();c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+1,y-len*.6,x+(rand()-.5)*3,y-len);c.stroke();}
  for(let i=0;i<650;i++){const x=rand()*size,y=rand()*size;c.fillStyle=i%2?'rgba(95,86,67,.35)':'rgba(241,238,211,.7)';c.beginPath();c.ellipse(x,y,1+rand()*2,.7+rand(),rand()*TAU,0,TAU);c.fill();}
 }else if(kind==='sand'){for(let i=0;i<8500;i++){c.fillStyle=i%3?'rgba(139,117,78,.15)':'rgba(255,250,226,.65)';c.fillRect(rand()*size,rand()*size,1,1);}for(let i=0;i<70;i++){c.strokeStyle='rgba(255,250,231,.75)';c.lineWidth=1;c.beginPath();c.arc(rand()*size,rand()*size,1+rand()*2,0,Math.PI*1.5);c.stroke();}}else if(kind==='wall'){
  const h=size/18,w=size/9;for(let row=0;row<18;row++)for(let col=-1;col<10;col++){const x=col*w+(row%2)*w*.5,y=row*h;c.fillStyle='rgba(133,125,112,.72)';c.fillRect(x,y,w,2);c.fillRect(x,y,2,h);c.fillStyle='rgba(255,255,244,.45)';c.fillRect(x+2,y+2,w-3,1);c.fillStyle='rgba(72,63,47,'+(rand()*.08)+')';c.fillRect(x+3,y+3,w-5,h-4);}
 }else if(kind==='roof'){
  for(let x=0;x<size;x+=size/32){c.fillStyle='rgba(70,80,82,.35)';c.fillRect(x,0,1,size);for(let y=24;y<size;y+=128){c.fillStyle='#7e8280';c.fillRect(x+3,y,2,2);}}
 }else if(kind==='metal'){
  for(let y=0;y<size;y++){c.fillStyle='rgba(255,255,255,'+(rand()*.16)+')';c.fillRect(0,y,size,1);}for(let x=0;x<size;x+=32){c.strokeStyle='rgba(100,106,112,.3)';c.beginPath();c.moveTo(x,0);c.lineTo(x+12,size);c.stroke();}
 }else if(kind==='rubber'){
  for(let y=0;y<size;y+=24)for(let x=0;x<size;x+=32){c.strokeStyle='rgba(40,44,46,.7)';c.lineWidth=5;c.beginPath();c.moveTo(x,y);c.lineTo(x+12,y+10);c.lineTo(x,y+20);c.stroke();}
 }else if(kind==='paint'){
  for(let i=0;i<700;i++){c.fillStyle=i%2?'rgba(255,255,255,.32)':'rgba(150,155,161,.18)';c.fillRect(rand()*size,rand()*size,1,1);}
 }
 texture.wrapU=texture.wrapV=1;texture.anisotropicFilteringLevel=8;texture.update(false);return keepSurfaceTexture(texture,cacheKey);
}
function vehicleSurfaceMaterial(m){
 if(!m||m.diffuseTexture)return;const n=m.name.toLowerCase();let kind=null;
 if(/paint|bodywork|cockpit-body|pastel-commuter/.test(n))kind='paint';else if(/alloy-tray|brushed|steel-rims|chrome/.test(n))kind='metal';else if(/rubber|tyre/.test(n))kind='rubber';
 if(!kind)return;m.diffuseTexture=makeSurfaceTexture('vehicle-'+kind+'-'+m.uniqueId,kind,256);m.specularPower=kind==='paint'?96:kind==='metal'?64:8;if(kind==='paint')m.specularColor=new C(.42,.44,.46);
}
