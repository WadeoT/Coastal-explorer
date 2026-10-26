// Deterministic, rendering-independent arcade damage. Values are gameplay
// approximations; fuel explosions are deliberately cinematic, not a safety model.
const VehicleDamageModel=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function create(p={kind:'car'}){
  const electric=p.kind==='bike',airCooled=electric||p.body==='kart',capacity={oil:electric?0:7.5,coolant:airCooled?0:12,fuel:electric?0:p.kind==='jet'?5000:p.kind==='heli'?450:p.kind==='boat'?120:p.body==='kart'?5:90};
  return {components:{engine:100,radiator:100,oil:100,fuel:100,driver:100,body:100},capacity,oil:capacity.oil,coolant:capacity.coolant,fuel:capacity.fuel,coolantTemp:88,oilTemp:92,oilPressure:electric?0:1.5,engineFailed:false,driverDead:false,burning:false,exploded:false,fireTime:0,oilStarvation:0,overheatTime:0,reason:'',lastHit:null,impacts:0,electric,airCooled};
 }
 function hit(d,part,amount,cause='bullet'){
  if(!d||d.exploded||!Object.hasOwn(d.components,part)||!Number.isFinite(amount)||amount<=0)return false;
  const c=d.components;c[part]=clamp(c[part]-amount,0,100);d.lastHit={part,cause,amount};d.impacts++;
  if(part==='engine'&&c.engine<=12){d.engineFailed=true;d.reason='Engine destroyed';}
  if(part==='driver'&&c.driver<=0){d.driverDead=true;d.reason='Driver killed';}
  if(part==='fuel'&&d.fuel>0&&c.fuel<=40){d.burning=true;if(c.fuel<=0)d.fireTime=Math.max(d.fireTime,3.3);}
  if(part==='body'&&c.body<=0){d.engineFailed=true;d.reason='Vehicle wrecked';}
  return true;
 }
 function explode(d){if(d.exploded)return false;d.exploded=true;d.burning=true;d.engineFailed=true;d.driverDead=true;d.reason='Fuel explosion';for(const key of Object.keys(d.components))d.components[key]=0;d.fuel=0;return true;}
 function step(d,dt,{rpm=750,load=0,ambient=25}={}){
  if(!d||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);load=clamp(load,0,1);rpm=clamp(Number.isFinite(rpm)?rpm:0,0,12000);
  const c=d.components,running=!d.engineFailed&&!d.exploded&&rpm>300;
  if(d.capacity.coolant&&c.radiator<90)d.coolant=Math.max(0,d.coolant-d.capacity.coolant*(.005+(100-c.radiator)*.00055)*dt);
  if(d.capacity.oil&&c.oil<90)d.oil=Math.max(0,d.oil-d.capacity.oil*(.004+(100-c.oil)*.00045)*dt);
  if(d.capacity.fuel&&c.fuel<90)d.fuel=Math.max(0,d.fuel-d.capacity.fuel*(100-c.fuel)*.00012*dt);
  if(running&&d.capacity.fuel)d.fuel=Math.max(0,d.fuel-(.0006+load*.005)*dt);
  const oilFill=d.capacity.oil?d.oil/d.capacity.oil:1,coolFill=d.capacity.coolant?d.coolant/d.capacity.coolant:1;
  d.oilPressure=running&&d.capacity.oil?clamp(.45+rpm/650,0,5)*clamp(oilFill*1.2,0,1)*Math.pow(c.oil/100,1.7):0;
  const target=running?88+load*10+(d.airCooled?0:(1-coolFill)*90+(1-c.radiator/100)*35):ambient;
  d.coolantTemp+=(target-d.coolantTemp)*(1-Math.exp(-dt*(running?.055:.015)));
  d.oilTemp+=((running?92+load*18+Math.max(0,d.coolantTemp-95)*.8:ambient)-d.oilTemp)*(1-Math.exp(-dt*.03));
  if(running&&d.capacity.oil&&d.oilPressure<.65)d.oilStarvation+=dt;else d.oilStarvation=Math.max(0,d.oilStarvation-dt*.4);
  if(running&&d.coolantTemp>125)d.overheatTime+=dt;else d.overheatTime=Math.max(0,d.overheatTime-dt*.3);
  if(running&&d.coolantTemp>112)c.engine=Math.max(0,c.engine-(d.coolantTemp-112)*.035*dt);
  if(d.oilStarvation>7){d.engineFailed=true;d.reason='Engine seized — oil pressure lost';c.engine=0;}
  if(d.overheatTime>6||c.engine<=12){d.engineFailed=true;d.reason=d.overheatTime>6?'Engine seized — overheated':d.reason||'Engine destroyed';c.engine=0;}
  if(d.capacity.fuel&&d.fuel<=0&&!d.exploded){d.engineFailed=true;d.reason=d.reason||'Fuel exhausted';}
  if(d.burning&&!d.exploded){d.fireTime+=dt;c.body=Math.max(0,c.body-dt*5);c.engine=Math.max(0,c.engine-dt*8);if(d.fireTime>=3.5&&d.fuel>0)explode(d);else if(d.fireTime>=3.5&&d.fuel===0)d.burning=false;}
 }
 function power(d){if(!d)return 1;if(d.engineFailed||d.exploded||d.driverDead)return 0;return clamp(d.components.engine/100,.12,1)*clamp(1-(d.coolantTemp-110)/60,.25,1);}
 // Coordinates are relative to the player's chassis origin, +X driver's side,
 // -Z forward. Component volumes occupy the actual interior, not a random roll.
 function zones(p){
  const w=p.width,l=p.length,c=p.clearance||0,h=p.kind==='heli'?1.5:1.15;
  const box=(part,x,y,z,sx,sy,sz)=>({part,min:{x:x-sx/2,y:y-c-sy/2,z:z-sz/2},max:{x:x+sx/2,y:y-c+sy/2,z:z+sz/2}});
  if(p.kind==='bike')return [box('driver',0,1.2,0,.5,1,.6),box('engine',0,.5,.2,.3,.4,.5)];
  const rearEngine=p.body==='kart'||p.kind==='boat'||p.kind==='heli'||p.kind==='jet',ez=rearEngine?l*.28:-l*.30,ey=p.kind==='heli'?2:.70;
  return [box('driver',p.body==='kart'?0:w*.23,h,-l*.06,w*.27,.70,l*.14),box('oil',0,ey-.30,ez,w*.45,.23,l*.18),box('radiator',0,ey,rearEngine?ez-l*.13:-l*.48,w*.75,.60,.16),box('engine',0,ey,ez,w*.66,.48,l*.25),box('fuel',-w*.22,.38,l*.27,w*.47,.45,l*.20)];
 }
 function rayBox(origin,dir,b,maxDistance=1000){let near=0,far=maxDistance;for(const axis of ['x','y','z']){if(Math.abs(dir[axis])<1e-8){if(origin[axis]<b.min[axis]||origin[axis]>b.max[axis])return null;}else{let a=(b.min[axis]-origin[axis])/dir[axis],c=(b.max[axis]-origin[axis])/dir[axis];if(a>c)[a,c]=[c,a];near=Math.max(near,a);far=Math.min(far,c);if(near>far)return null;}}return near;}
 function trace(p,origin,dir,range=1000){return zones(p).map(b=>({part:b.part,t:rayBox(origin,dir,b,range)})).filter(h=>h.t!==null).sort((a,b)=>a.t-b.t);}
 function crash(d,p,speed,point){
  if(!Number.isFinite(speed)||speed<3||d.exploded)return 0;
  const severity=clamp((speed-3)**1.4*1.15,0,120),front=point.z<-p.length*.12,rear=point.z>p.length*.18;
  hit(d,'body',severity,'crash');
  if(front){hit(d,'engine',severity*.85,'crash');hit(d,'radiator',severity*1.1,'crash');if(point.y<(p.clearance||.5))hit(d,'oil',severity*.45,'crash');}
  if(rear)hit(d,'fuel',severity*.8,'crash');
  if(speed>17)hit(d,'driver',(speed-17)**1.45*.7,'crash');
  if(speed>23&&d.capacity.fuel){d.burning=true;if(speed>34){d.components.fuel=0;d.fireTime=3.3;}}
  return severity;
 }
 return {create,hit,step,power,zones,rayBox,trace,crash,explode};
})();
