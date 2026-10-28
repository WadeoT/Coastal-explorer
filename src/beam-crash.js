// Small position-based node/beam cage. Plastic constraints keep permanent folds;
// this is a bounded game solver, not a calibrated manufacturer crash model.
const BeamCrash=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function create(p){const nodes=[],beams=[],height=p.height||Math.max(1.3,p.eye+.35);for(let z=0;z<5;z++)for(let y=0;y<2;y++)for(let x=0;x<3;x++){const at=[(x-1)*p.width*.5,y*height,(z/4-.5)*p.length];nodes.push({rest:at.slice(),p:at.slice(),v:[0,0,0]});}
  for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){const ax=a%3,ay=Math.floor(a/3)%2,az=Math.floor(a/6),bx=b%3,by=Math.floor(b/3)%2,bz=Math.floor(b/6);if(Math.abs(ax-bx)>1||Math.abs(ay-by)>1||Math.abs(az-bz)>1)continue;const len=Math.hypot(...nodes[a].p.map((v,i)=>v-nodes[b].p[i])),mid=(nodes[a].p[2]+nodes[b].p[2])/2,cabin=mid>-p.length*.17&&mid<p.length*.18;beams.push({a,b,len,original:len,cabin,broken:false});}
  return {nodes,beams,width:p.width,length:p.length,height,time:0,active:false,energy:0,broken:0};
 }
 function impact(s,point,normal,speed){if(!Number.isFinite(speed)||speed<3)return;const nlen=Math.hypot(...normal)||1,n=normal.map(v=>v/nlen),radius=Math.min(2.2,Math.max(s.height*.5+.4,.6+speed*.035));for(const node of s.nodes){const d=Math.hypot(...node.p.map((v,i)=>v-point[i])),weight=Math.max(0,1-d/radius);for(let i=0;i<3;i++){node.v[i]+=n[i]*Math.min(22,speed*.66)*weight;node.p[i]+=n[i]*Math.min(1.4,Math.max(0,speed-3)*.055)*weight;}}s.active=true;s.time=0;s.energy+=speed*speed;}
 function step(s,dt){if(!s.active||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1/30);const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;for(let k=0;k<steps;k++){
  const old=s.nodes.map(n=>n.p.slice());for(const n of s.nodes)for(let i=0;i<3;i++){n.v[i]*=Math.exp(-h*7);n.p[i]+=n.v[i]*h;}
  for(let iter=0;iter<4;iter++)for(const b of s.beams){if(b.broken)continue;const a=s.nodes[b.a],n=s.nodes[b.b],d=n.p.map((v,i)=>v-a.p[i]),len=Math.hypot(...d)||.0001,strain=(len-b.len)/b.len;
   if(iter===0&&Math.abs(strain)>(b.cabin?.06:.014))b.len=clamp(b.len+(len-b.len)*(b.cabin?.20:.34),b.original*.40,b.original*1.65);
   if(Math.abs(strain)>(b.cabin?1.1:.65)&&s.energy>600){b.broken=true;s.broken++;continue;}
   const correction=(len-b.len)/len*(b.cabin?.48:.32);for(let i=0;i<3;i++){a.p[i]+=d[i]*correction*.5;n.p[i]-=d[i]*correction*.5;}
  }
  for(let j=0;j<s.nodes.length;j++){const n=s.nodes[j],cabin=Math.abs(n.rest[2])<s.length*.2;for(let i=0;i<3;i++){n.p[i]+=(n.rest[i]-n.p[i])*(cabin&&Math.abs(n.rest[0])<.01?.015:cabin?.0003:.00001);n.p[i]=clamp(n.p[i],n.rest[i]-1.5,n.rest[i]+1.5);n.v[i]=(n.p[i]-old[j][i])/h;}}
  s.time+=h;
 }if(s.time>2.5)s.active=false;
 }
 function weights(s,p){const x=clamp((p[0]/s.width+.5)*2,0,2),y=clamp(p[1]/s.height,0,1),z=clamp((p[2]/s.length+.5)*4,0,4),ix=Math.min(1,Math.floor(x)),iz=Math.min(3,Math.floor(z)),out=[];for(let dz=0;dz<2;dz++)for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)out.push([(iz+dz)*6+dy*3+ix+dx,(dx?x-ix:1-x+ix)*(dy?y:1-y)*(dz?z-iz:1-z+iz)]);return out;}
 function offset(s,weights){const out=[0,0,0];for(const [id,w] of weights){const n=s.nodes[id];for(let i=0;i<3;i++)out[i]+=(n.p[i]-n.rest[i])*w;}return out;}
 return {create,impact,step,weights,offset};
})();
