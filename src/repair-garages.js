const REPAIR_GARAGE_DATA=/*__REPAIR_GARAGES__*/{};
const repairGarages=[],mechanicByBuilding=new Map(),workshopMaterials=new Map();let garageStatus=null,garageService=null,padContact=null;
function workshopRoofPoint(building){
 const b=building.bounds;let best=null,score=0;
 for(let x=b.minX+8.5;x<=b.maxX-8.5;x+=1.75)for(let z=b.minZ+8.5;z<=b.maxZ-8.5;z+=1.75){if(!pointInPolygon(x,z,building.points)||(building.rings||[]).slice(1).some(r=>pointInPolygon(x,z,r)))continue;const d=polygonEdgeDistance(x,z,building.points);if(d<8.3||d<=score)continue;let safe=true;for(let i=0;i<12;i++){const a=i/12*TAU,px=x+Math.cos(a)*8.1,pz=z+Math.sin(a)*8.1;if(!pointInPolygon(px,pz,building.points)||(building.rings||[]).slice(1).some(r=>pointInPolygon(px,pz,r)))safe=false;}if(safe){best={x,z};score=d;}}
 return best;
}
function indexRepairGarages(){
 repairGarages.length=0;mechanicByBuilding.clear();
 const buildings=new Map(mappedBuildings.map(b=>[b.id,b]));
 for(const record of REPAIR_GARAGE_DATA.garages||[]){const b=buildings.get(record.buildingId);if(!b)continue;const centre=geoToLocal(record.lat,record.lon),road=nearestRoad(centre.x,centre.z);if(!road)continue;
  let edge=null,score=Infinity;
  for(let i=0;i<b.points.length;i++){const a=b.points[i],q=b.points[(i+1)%b.points.length],length=Math.hypot(q.x-a.x,q.z-a.z);if(length<6.5)continue;const mid={x:(a.x+q.x)/2,z:(a.z+q.z)/2},dist=Math.hypot(mid.x-road.x,mid.z-road.z);if(dist<score){score=dist;edge={index:i,a,q,length,mid};}}
  if(!edge)continue;const tx=(edge.q.x-edge.a.x)/edge.length,tz=(edge.q.z-edge.a.z)/edge.length;let nx=tz,nz=-tx;if(pointInPolygon(edge.mid.x+nx,edge.mid.z+nz,b.points)){nx=-nx;nz=-nz;}
  const half=Math.min(3.0,edge.length*.35),depth=Math.min(8,Math.max(5,Math.min(b.bounds.maxX-b.bounds.minX,b.bounds.maxZ-b.bounds.minZ)*.38)),bay=[];
  for(const [side,d] of [[-1,4],[1,4],[1,-depth],[-1,-depth]])bay.push({x:edge.mid.x+tx*side*half+nx*d,z:edge.mid.z+tz*side*half+nz*d});
  const heights=(b.rings||[b.points]).flat().map(p=>terrainHeight(p.x,p.z));if(heights.some(h=>h===null))continue;const baseY=Math.max(...heights),height=clamp(parseFloat(b.tags.height)||(parseFloat(b.tags['building:levels'])*3||4.5),2,140),roof=baseY+height,pad=height>=3.5?workshopRoofPoint(b):null;
  let deckY=roof+.65;if(pad)for(const nearby of buildingsNear(pad.x,pad.z,16)){if(!pointInPolygon(pad.x,pad.z,nearby.points)&&polygonEdgeDistance(pad.x,pad.z,nearby.points)>15)continue;const levels=clamp(parseFloat(nearby.tags.height)||(parseFloat(nearby.tags['building:levels'])*3||4.5),2,140),ground=(nearby.rings||[nearby.points]).flat().map(p=>terrainHeight(p.x,p.z)).filter(Number.isFinite);if(ground.length)deckY=Math.max(deckY,Math.max(...ground)+levels+.35);}
  const g={...record,id:'workshop-'+record.osmId,building:b,centre,edge,nx,nz,tx,tz,half,bay,depth,bayPoint:{x:edge.mid.x-nx*depth*.52,z:edge.mid.z-nz*depth*.52},baseY,roof,doorHeight:Math.min(3.25,height-.5),road:{x:road.x,z:road.z},pad:pad?{...pad,y:deckY,radius:7.8}:null};repairGarages.push(g);mechanicByBuilding.set(b.id,g);
 }
}
function repairPadAt(x,z){return repairGarages.find(g=>g.pad&&Math.hypot(x-g.pad.x,z-g.pad.z)<g.pad.radius)||null;}
function workshopAccessAt(position){for(const g of repairGarages){if(pointInPolygon(position.x,position.z,g.bay))return true;const a=g.road,b=g.edge.mid,dx=b.x-a.x,dz=b.z-a.z,t=clamp(((position.x-a.x)*dx+(position.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);if(Math.hypot(position.x-a.x-dx*t,position.z-a.z-dz*t)<3.5)return true;}return false;}
function workshopGroundAt(x,z,reference,ground){const g=repairPadAt(x,z);const clearance=state.profile?.kind==='heli'?state.profile.clearance:0;if(g&&(reference===null||reference>=g.pad.y+clearance-.45))return Math.max(ground??-10000,g.pad.y);return ground;}
function addWorkshopWall(e,index,ringIndex,a,b,ha,hb,roofY,positions,indices,quad){
 const g=mechanicByBuilding.get(e.id);if(!g||ringIndex!==0||index!==g.edge.index){quad(positions,indices,[a.x,ha,a.z],[b.x,hb,b.z],[a.x,roofY,a.z],[b.x,roofY,b.z]);return;}
 const length=g.edge.length,left=length/2-g.half,right=length/2+g.half,p=d=>[a.x+g.tx*d,a.z+g.tz*d],v0=p(left),v1=p(right),sill=Math.max(ha,hb),top=sill+g.doorHeight;
 quad(positions,indices,[a.x,ha,a.z],[v0[0],sill,v0[1]],[a.x,roofY,a.z],[v0[0],roofY,v0[1]]);quad(positions,indices,[v1[0],sill,v1[1]],[b.x,hb,b.z],[v1[0],roofY,v1[1]],[b.x,roofY,b.z]);quad(positions,indices,[v0[0],top,v0[1]],[v1[0],top,v1[1]],[v0[0],roofY,v0[1]],[v1[0],roofY,v1[1]]);
}
function workshopSign(text,width,parent,name){const key='sign:'+text;let m=workshopMaterials.get(key);if(!m){const tex=new DynamicTexture(name+'-label',{width:1024,height:160},scene,false),ctx=tex.getContext();ctx.fillStyle='#101a29';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#f2c85e';ctx.font='bold 52px sans-serif';ctx.textAlign='center';ctx.fillText(text.slice(0,40),512,98);tex.update();m=mat(name+'-sign','#ffffff',.4);m.diffuseTexture=tex;m.emissiveTexture=tex;m.backFaceCulling=false;workshopMaterials.set(key,m);}const mesh=MB.CreatePlane(name,{width,height:width*.156},scene);mesh.parent=parent;mesh.material=m;mesh.isPickable=false;return mesh;}
function buildWorkshopGeometry(parent,centre){
 const root=new Node('mapped-repair-workshops',scene);root.parent=parent;const built=[];
 for(const g of repairGarages){if(Math.hypot(g.centre.x-centre.x,g.centre.z-centre.z)>worldUpgrade.buildingRenderDistance)continue;const node=new Node(g.id,scene);node.parent=root;
  const floor=modelQuad('workshop-bay-floor',g.bay.map(p=>[p.x,g.baseY+.025,p.z]),openConcreteMaterial,node);floor.metadata={workshop:g.id};
  const inner=g.bayPoint;for(const side of [-1,1]){const x=inner.x+g.tx*side*(g.half-.45),z=inner.z+g.tz*side*(g.half-.45);box('workshop-vehicle-lift',.22,2.65,.28,x,g.baseY+1.325,z,materials.dark,node);const arm=box('workshop-lift-arm',g.half*.8,.10,.18,x-g.tx*side*.65,g.baseY+.25,z-g.tz*side*.65,materials.metal,node);arm.rotation.y=-Math.atan2(g.tz,g.tx);}
  const sign=workshopSign(g.name,Math.min(9,g.edge.length*.85),node,'workshop-front-sign');sign.position.set(g.edge.mid.x+g.nx*.09,g.baseY+g.doorHeight+.55,g.edge.mid.z+g.nz*.09);sign.rotation.y=Math.atan2(g.nx,g.nz);
  if(g.pad){const deck=cylinder('workshop-helipad-deck',g.pad.radius*2,.25,g.pad.x,g.pad.y-.125,g.pad.z,openConcreteMaterial,node,48);deck.isPickable=true;deck.metadata={workshop:g.id,helipad:true,openSolid:true};const rise=g.pad.y-.25-g.roof;for(const dx of [-4.3,4.3])for(const dz of [-4.3,4.3])if(rise>.05)box('helipad-support-column',.32,rise,.32,g.pad.x+dx,g.roof+rise/2,g.pad.z+dz,materials.metal,node);const pad=MB.CreateDisc('workshop-rooftop-helipad',{radius:g.pad.radius,tessellation:48,sideOrientation:Mesh.DOUBLESIDE},scene);pad.parent=node;pad.rotation.x=Math.PI/2;pad.position.set(g.pad.x,g.pad.y,g.pad.z);let m=workshopMaterials.get('helipad');if(!m){const texture=new DynamicTexture('workshop-pad-markings',{width:512,height:512},scene,false),c=texture.getContext();c.fillStyle='#252b31';c.fillRect(0,0,512,512);c.strokeStyle='#f3ce55';c.lineWidth=15;c.beginPath();c.arc(256,256,227,0,TAU);c.stroke();c.fillStyle='#edf2f7';c.font='bold 270px sans-serif';c.textAlign='center';c.fillText('H',256,350);texture.update();m=mat('workshop-pad','#ffffff',.18);m.diffuseTexture=texture;m.backFaceCulling=false;workshopMaterials.set('helipad',m);}pad.material=m;pad.isPickable=false;pad.metadata={workshop:g.id,helipad:true};
   for(let i=0;i<8;i++){const a=i/8*TAU;box('helipad-edge-beacon',.16,.10,.16,g.pad.x+Math.cos(a)*g.pad.radius*.92,g.pad.y+.06,g.pad.z+Math.sin(a)*g.pad.radius*.92,materials.light,node);}
  }built.push(g.id);
 }
 root.metadata={workshops:built};return root;
}
function garageRepairCost(){const d=state.damage;if(!d)return 0;const damaged=d.engineFailed||d.coolantTemp>110||d.oilTemp>125||Object.values(d.components).some(v=>v<99)||['oil','coolant','fuel'].some(k=>d.capacity[k]>0&&d[k]/d.capacity[k]<.95);if(!damaged)return 0;return Math.round(350+(100-d.components.body)*30+Object.values(d.components).reduce((sum,v)=>sum+100-v,0)*4);}
function garageArrival(){
 if(!state.profile||state.mode!=='playing'||!state.damage||state.damage.driverDead||state.damage.exploded||state.damage.components.body<=0){padContact=null;return null;}
 for(const g of repairGarages){
  if(state.profile.kind==='heli'&&g.pad){const distance=Math.hypot(player.position.x-g.pad.x,player.position.z-g.pad.z),height=player.position.y-state.profile.clearance-g.pad.y;
   if(distance<g.pad.radius+12&&Math.abs(height)<12){
    const inside=distance<=g.pad.radius-2,gear=state.profile.gearType!=='retractable'||aircraftSystems.gearDown,contact=inside&&gear&&state.grounded&&Math.abs(height)<.045&&Math.abs(motion.vy)<.35&&state.speed<1.2&&Math.abs(motion.roll)<.25&&Math.abs(motion.pitch)<.25;
    if(!contact)padContact=null;else if(!padContact||padContact.id!==g.id||padContact.vehicle!==state.vehicleId||state.elapsed<padContact.started||Math.hypot(player.position.x-padContact.x,player.position.z-padContact.z)>.75)padContact={id:g.id,vehicle:state.vehicleId,started:state.elapsed,x:player.position.x,z:player.position.z};
    const landing=state.lastLanding,confirmed=landing&&Math.hypot(landing.x-g.pad.x,landing.z-g.pad.z)<g.pad.radius+1&&Math.abs(landing.surface-g.pad.y)<.5&&landing.rate<=3.5,settled=padContact&&state.elapsed-padContact.started>=1.5,ok=!!(contact&&(confirmed||settled));
    const reason=!inside?'Move onto the marked H pad.':!gear?'Lower the landing gear before touchdown.':!contact?'Set down on the pad and stop; hovering does not count.':!ok?'Touchdown detected · hold still to confirm service.':'Landing secure · rooftop repair available.';
    return{garage:g,mode:'pad',ok,reason};
   }
  }
  if(['car','bike'].includes(state.profile.kind)&&pointInPolygon(player.position.x,player.position.z,g.bay)&&Math.hypot(player.position.x-g.bayPoint.x,player.position.z-g.bayPoint.z)<g.depth*.5&&Math.abs(player.position.y-state.profile.clearance-g.baseY)<1.1){padContact=null;return{garage:g,mode:'bay',ok:state.speed<.6,reason:'Stop inside the repair bay to begin service.'};}
 }
 padContact=null;return null;
}
function beginGarageRepair(){if(garageService)return false;const a=garageArrival();if(!a?.ok||state.damage.burning){toast(a?.reason||'Stop in a workshop bay or make a safe helipad landing.');return false;}const cost=garageRepairCost();if(!cost){toast('Vehicle systems are already healthy.');return false;}if(economy.balance<cost){toast('Repair needs '+dollars(cost)+'.');return false;}garageService={garageId:a.garage.id,vehicle:state.vehicleId,cost,elapsed:0,duration:a.mode==='pad'?6:5};return true;}
function updateRepairGarages(dt){const a=garageArrival();garageStatus=a;const box=$('workshopService');if(!box)return;box.hidden=!a;document.body.classList.toggle('at-workshop',!!a);if(!a){garageService=null;return;}
 if(garageService){if(!a.ok||garageService.garageId!==a.garage.id||garageService.vehicle!==state.vehicleId||state.damage.burning)garageService=null;else{garageService.elapsed+=dt;if(garageService.elapsed>=garageService.duration){if(economy.balance>=garageService.cost){economy.balance-=garageService.cost;saveCareer();repairVehicleDamage();updateWallet();toast('Workshop service complete · '+dollars(garageService.cost),4500);}garageService=null;}}}
 $('workshopName').textContent=a.garage.name;$('workshopArrival').textContent=state.damage.burning?'Fire must be extinguished before workshop service.':garageService?'Repairing · '+Math.ceil(garageService.duration-garageService.elapsed)+'s · stay stopped':a.reason;
 const cost=garageRepairCost();$('workshopRepair').textContent=garageService?'SERVICE IN PROGRESS':cost?'REPAIR · '+dollars(cost):'SYSTEMS HEALTHY';$('workshopRepair').disabled=!a.ok||!cost||!!garageService||state.damage.burning;
}
function drawWorkshopMarkers(ctx,project,mini=false){ctx.save();for(const g of repairGarages){const q=project(g.pad||g.bayPoint);if(q.x<8||q.y<8||q.x>ctx.canvas.width-8||q.y>ctx.canvas.height-8)continue;ctx.fillStyle='#efc65c';ctx.strokeStyle='#101722';ctx.lineWidth=3;ctx.font='bold '+(mini?17:22)+'px sans-serif';ctx.textAlign='center';const text=g.pad?'H':'+';ctx.strokeText(text,q.x,q.y);ctx.fillText(text,q.x,q.y);if(!mini&&(mapView.zoom>4||$('placeSearch').value)){ctx.font='13px sans-serif';ctx.strokeText(g.name,q.x,q.y+17);ctx.fillText(g.name,q.x,q.y+17);}}ctx.restore();}
function initialiseRepairGarages(){const box=document.createElement('section');box.id='workshopService';box.hidden=true;box.innerHTML='<strong id="workshopName"></strong><span id="workshopArrival"></span><button id="workshopRepair" class="source-btn">REPAIR</button>';document.body.append(box);$('workshopRepair').onclick=beginGarageRepair;const note=document.createElement('p');note.className='map-contacts-legend';note.textContent='Gold + workshops · H rooftop game helipads. Workshop locations are mapped OSM businesses; entrances and rooftop landing pads are gameplay additions.';$('mapModal').querySelector('.dialog').append(note);}

function cancelWorkshopService(){garageService=null;padContact=null;garageStatus=null;if($('workshopService'))$('workshopService').hidden=true;document.body.classList.remove('at-workshop');}
