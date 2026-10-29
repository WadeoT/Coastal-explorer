// The uploaded GeoPDF supplies marked heights and a map reference, not a DEM.
// Correct the existing triangulated DEM locally; keep water, tile seams and roads
// on the same surface. No elevation fitting or per-vertex work runs each frame.
const QTOPO=/*__QTOPO_DATA__*/{points:[],warp:[]};
const QTOPO_IMAGE=/*__QTOPO_IMAGE__*/'';
const qtopo={ready:false,controls:[],boundary:[],radius:1100,image:null,enabled:false,cache:null,report:[]};
function qtopoKernel(distance){const r=distance/qtopo.radius;return r>=1?0:(1-r)**4*(1+4*r);}
function qtopoNodeMask(x,z,height){
 if(height<=5)return 0;let edge=Infinity;
 for(let i=0;i<qtopo.boundary.length;i++){const a=qtopo.boundary[i],b=qtopo.boundary[(i+1)%qtopo.boundary.length],cross=(b.x-a.x)*(z-a.z)-(b.z-a.z)*(x-a.x),d=cross/Math.hypot(b.x-a.x,b.z-a.z);edge=Math.min(edge,d);}
 const fade=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};return fade(edge/300)*fade((height-5)/25);
}
function qtopoTriangle(tile,x,z){
 const n=tile.surfaceN,g=localToGeo(x,z),p=tileCoords(g.lat,g.lon),gx=clamp((p.x-tile.tx)*n,0,n),ix=Math.min(n-1,Math.floor(gx)),iy=terrainRow(tile,z),u=gx-ix,v=clamp((z-tile.surfaceZ[iy])/(tile.surfaceZ[iy+1]-tile.surfaceZ[iy]),0,1),a=iy*(n+1)+ix;
 return u+v<=1?[[a,1-u-v],[a+1,u],[a+n+1,v]]:[[a+n+2,u+v-1],[a+n+1,1-u],[a+1,1-v]];
}
function qtopoNodePosition(tile,index){const n=tile.surfaceN,j=Math.floor(index/(n+1)),i=index%(n+1);return{x:geoToLocal(0,tileGeo(tile.tx+i/n,tile.ty).lon).x,z:tile.surfaceZ[j]};}
function solveQTopo(matrix,values){
 const n=values.length,a=matrix.map((row,i)=>[...row,values[i]]);
 for(let i=0;i<n;i++){let pivot=i;for(let j=i+1;j<n;j++)if(Math.abs(a[j][i])>Math.abs(a[pivot][i]))pivot=j;if(Math.abs(a[pivot][i])<1e-10)throw Error('QTopo control matrix is singular');[a[i],a[pivot]]=[a[pivot],a[i]];const divisor=a[i][i];for(let k=i;k<=n;k++)a[i][k]/=divisor;for(let j=0;j<n;j++){if(j===i)continue;const factor=a[j][i];for(let k=i;k<=n;k++)a[j][k]-=factor*a[i][k];}}
 return a.map(row=>row[n]);
}
function initialiseQTopoElevation(){
 if(qtopo.ready||!QTOPO.points.length)return;
 // BL -> TL -> TR -> BR is positive in the game's east/south coordinate system.
 qtopo.boundary=[0,1,2,3].map(i=>{const [lon,lat]=QTOPO.geographicCorners[i];return geoToLocal(lat,lon);});
 qtopo.controls=QTOPO.points.map(p=>({...p,...geoToLocal(p.lat,p.lon)}));
 const rows=qtopo.controls.map(p=>{const t=tileCoords(p.lat,p.lon),tile=demTiles.get(Math.floor(t.x)+'/'+Math.floor(t.y));if(!tile)throw Error('Missing QTopo control terrain');prepareTerrainSurface(tile);return{p,tile,base:terrainHeight(p.x,p.z),nodes:qtopoTriangle(tile,p.x,p.z)};});
 const matrix=rows.map(({tile,nodes})=>qtopo.controls.map(c=>nodes.reduce((sum,[i,w])=>{const p=qtopoNodePosition(tile,i);return sum+w*qtopoNodeMask(p.x,p.z,tile.surfaceHeights[i])*qtopoKernel(Math.hypot(p.x-c.x,p.z-c.z));},0)));
 const coefficients=solveQTopo(matrix,rows.map(r=>r.p.height-r.base));qtopo.controls.forEach((p,i)=>p.coefficient=coefficients[i]);qtopo.ready=true;
 for(const tile of demTiles.values())if(tile.surfaceHeights)applyQTopoSurface(tile);
 qtopo.report=rows.map(r=>({name:r.p.name,target:r.p.height,before:r.base,after:terrainHeight(r.p.x,r.p.z)}));
}
function applyQTopoSurface(tile){
 if(!qtopo.ready||tile.qtopoApplied)return;tile.qtopoApplied=true;const n=tile.surfaceN,xs=Array.from({length:n+1},(_,i)=>geoToLocal(0,tileGeo(tile.tx+i/n,tile.ty).lon).x),zs=tile.surfaceZ,candidates=qtopo.controls.filter(c=>c.coefficient&&c.x+qtopo.radius>=xs[0]&&c.x-qtopo.radius<=xs[n]&&c.z+qtopo.radius>=zs[0]&&c.z-qtopo.radius<=zs[n]);if(!candidates.length)return;const deltas=new Float32Array(tile.surfaceHeights.length);
 // Iterate only rows/columns inside each compact support, rather than 38
 // distance checks for every vertex of every tile.
 for(const c of candidates){const step=xs[1]-xs[0],lo=clamp(Math.floor((c.x-qtopo.radius-xs[0])/step),0,n),hi=clamp(Math.ceil((c.x+qtopo.radius-xs[0])/step),0,n);for(let j=0;j<=n;j++){if(Math.abs(zs[j]-c.z)>=qtopo.radius)continue;for(let i=lo;i<=hi;i++){const index=j*(n+1)+i;deltas[index]+=c.coefficient*qtopoKernel(Math.hypot(xs[i]-c.x,zs[j]-c.z));}}}
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const k=j*(n+1)+i;if(deltas[k]){deltas[k]*=qtopoNodeMask(xs[i],zs[j],tile.surfaceHeights[k]);tile.surfaceHeights[k]+=deltas[k];}}
 tile.qtopoDeltas=deltas;
}
function qtopoSurfaceDelta(tile,x,z){return tile.qtopoDeltas?qtopoTriangle(tile,x,z).reduce((sum,[i,w])=>sum+w*tile.qtopoDeltas[i],0):0;}
function setupQTopoMap(){
 const tools=$('mapZoomIn')?.parentElement;if(!tools||$('qtopoLayer'))return;const button=document.createElement('button');button.id='qtopoLayer';button.className='source-btn';button.textContent='QTOPO';button.title='Show the uploaded 1:100,000 topographic sheet; height corrections are always active';button.setAttribute('aria-pressed','false');
 button.onclick=()=>{qtopo.enabled=!qtopo.enabled;button.setAttribute('aria-pressed',String(qtopo.enabled));button.textContent=qtopo.enabled?'QTOPO ON':'QTOPO';if(qtopo.enabled&&!qtopo.image){const image=qtopo.image=new Image();image.onload=()=>{qtopo.cache=null;drawBigMap();};image.onerror=()=>toast('The bundled QTopo image could not open.');image.src=QTOPO_IMAGE;}qtopo.cache=null;drawBigMap();};tools.append(button);
}
function drawQTopoMap(ctx,project){
 if(!qtopo.enabled||!qtopo.image?.complete||!qtopo.image.naturalWidth)return false;
 const key=[ctx.canvas.width,ctx.canvas.height,mapView.x,mapView.z,mapView.zoom].join(':');
 if(qtopo.cache?.key!==key){const canvas=document.createElement('canvas');canvas.width=ctx.canvas.width;canvas.height=ctx.canvas.height;const c=canvas.getContext('2d'),image=qtopo.image,grid=QTOPO.warp;
  function triangle(vertices){const s=vertices.map(v=>({x:v.i/8*image.naturalWidth,y:v.j/8*image.naturalHeight})),d=vertices.map(v=>{const g=grid[v.j][v.i];return project(geoToLocal(g[0],g[1]));}),sx1=s[1].x-s[0].x,sy1=s[1].y-s[0].y,sx2=s[2].x-s[0].x,sy2=s[2].y-s[0].y,den=sx1*sy2-sx2*sy1,dx1=d[1].x-d[0].x,dy1=d[1].y-d[0].y,dx2=d[2].x-d[0].x,dy2=d[2].y-d[0].y,a=(dx1*sy2-dx2*sy1)/den,b=(dy1*sy2-dy2*sy1)/den,cc=(dx2*sx1-dx1*sx2)/den,dd=(dy2*sx1-dy1*sx2)/den;
   c.save();c.beginPath();c.moveTo(d[0].x,d[0].y);c.lineTo(d[1].x,d[1].y);c.lineTo(d[2].x,d[2].y);c.closePath();c.clip();c.setTransform(a,b,cc,dd,d[0].x-a*s[0].x-cc*s[0].y,d[0].y-b*s[0].x-dd*s[0].y);c.drawImage(image,0,0);c.restore();}
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){triangle([{i,j},{i:i+1,j},{i,j:j+1}]);triangle([{i:i+1,j},{i:i+1,j:j+1},{i,j:j+1}]);}qtopo.cache={key,canvas};
 }ctx.drawImage(qtopo.cache.canvas,0,0);return true;
}
