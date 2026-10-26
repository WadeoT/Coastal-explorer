const jobTargetCache=new Map();
function jobPlace(name,mode='road'){
 const key=name+mode;if(jobTargetCache.has(key))return jobTargetCache.get(key);const place=allPlaces.find(p=>p.name===name)||destinations.find(p=>p.name===name);if(!place)return null;const at=geoToLocal(place.lat,place.lon);let point=null;
 if(mode==='water')point=findBoatSpawn(at);
 else if(mode==='landing'){
  for(let r=20;r<=1000&&!point;r+=40)for(let i=0;i<16;i++){const x=at.x+Math.cos(i*TAU/16)*r,z=at.z+Math.sin(i*TAU/16)*r;if(mappedWaterAt(x,z)!==null||inMappedLanduse(woodlandIndex,x,z)||inMappedLanduse(residentialIndex,x,z)||buildingsNear(x,z,18).length)continue;const h=terrainHeight(x,z),heights=[[8,0],[-8,0],[0,8],[0,-8]].map(([dx,dz])=>terrainHeight(x+dx,z+dz));if(h===null||heights.some(v=>v===null||Math.abs(v-h)>1.2))continue;point={x,z};break;}
 }else{const road=nearestRoad(at.x,at.z);if(road)point=samplePath(road.path,road.distance,1,Math.min(3,road.path.width/4));}
 if(!point)return null;point={x:point.x,z:point.z,name};jobTargetCache.set(key,point);return point;
}
function professionalContract({id,name,description,vehicleIds,places,mode='road',passengers=0,reward=6000,clearance=[],flyThrough=false,hoist=false}){
 const points=places.map(n=>jobPlace(n,mode));if(points.some(p=>!p))return null;const distance=points.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-points[i].x,p.z-points[i].z),0);
 const checkpoints=points.map((p,i)=>({...p,boarding:i===0?'pickup':'dropoff',dwell:flyThrough?0:mode==='landing'?6:4,altitudeAGL:flyThrough?200+(i%2)*100:0,flyThrough,hoist:hoist&&i===0}));
 return {id,name,description,vehicleIds,profession:true,kind:'profession',mode,passengers,checkpoints,minimum:distance*.60,timeLimit:mode==='landing'?1800:1200,reward:Math.min(60000,Math.round(reward+distance*(mode==='landing'?1.4:.7))),clearance};
}
function availableProfessionalJobs(){
 const id=state.vehicleId,p=state.profile;if(!p)return[];const jobs=[],add=o=>{if(!o.vehicleIds.includes(id))return;const job=professionalContract(o);if(job)jobs.push(job);};
 add({id:'helicopter-shuttle',name:'Coastal air shuttle · 3 passengers',description:'Land and hold still at the marked open landing zones in Kuluin and Coolum. Board 3 passengers, then fly them to their destination. Mission landing zones are approximate game sites.',vehicleIds:['heli','lifeflight','racq'],places:['Kuluin','Coolum Beach'],mode:'landing',passengers:3,reward:12000,clearance:['sunshine-airport']});
 add({id:'hinterland-medical',name:'Hinterland medical transfer',description:'Collect a patient near Nambour and fly to the Maleny landing zone. Land gently and hold for six seconds to load/unload. Keep vehicle integrity above 40%.',vehicleIds:['lifeflight','racq'],places:['Nambour','Maleny'],mode:'landing',passengers:1,reward:18000,clearance:['sunshine-airport','caloundra-airport']});
 add({id:'rescue-hoist',name:'Rescue extraction · hoist required',description:'Hover 8–24 m above the first marker, deploy the hoist (B), and hold position to extract the stranded person. Land at the destination to transfer them.',vehicleIds:['lifeflight','racq'],places:['Mudjimba','Bli Bli'],mode:'landing',passengers:1,hoist:true,reward:20000,clearance:['sunshine-airport']});
 add({id:'tray-supplies',name:'Hinterland supplies run',description:'Stop for loading in Palmwoods, then deliver the visible tray cargo to Woombye. Utes only. Four seconds stopped at each marker.',vehicleIds:['ute','hilux','ranger'],places:['Palmwoods','Woombye'],reward:7000});
 add({id:'coffee-courier',name:'Coastal coffee courier',description:'E-bike only: collect a café order in Maroochydore and deliver it to Alexandra Headland. Stop at each marker; keep the bike in good condition.',vehicleIds:['bike'],places:['Maroochydore','Alexandra Headland'],reward:4000});
 add({id:'river-ferry',name:'River taxi · 2 passengers',description:'Boat only: collect two passengers on mapped water near Maroochydore and drop them near Twin Waters. Slow below docking speed for boarding.',vehicleIds:['boat'],places:['Maroochydore','Twin Waters'],mode:'water',passengers:2,reward:6500});
 add({id:'rideshare',name:'Coast rideshare · airport district',description:'Collect two passengers in Kuluin and drive them to Pacific Paradise. Sedans only; stop for boarding and arrive with at least 40% integrity.',vehicleIds:['commodore','falcon','wrx'],places:['Kuluin','Pacific Paradise'],passengers:2,reward:6000});
 add({id:'track-survey',name:'Hinterland access survey',description:'Use a compact or heavy 4WD to inspect two hinterland access points. Come to a complete stop at each survey marker.',vehicleIds:['jimny','patrol'],places:['Mapleton','Flaxton'],reward:9000});
 add({id:'airshow-flyover',name:'Coastal airshow training',description:'Fighter only: fly through the marked rings at the displayed altitude, at more than 60 m/s. Mission airport clearance is included; other game airspace restrictions remain.',vehicleIds:['jet'],places:['Caloundra','Mooloolaba','Coolum Beach'],mode:'landing',flyThrough:true,reward:30000,clearance:['caloundra-airport','sunshine-airport']});
 if(id==='kart'){const race=baseContracts().find(j=>j.kind==='race');if(race)jobs.push({...race,id:'kart-trial',name:'Kart clock challenge',description:'Kart-only checkpoint time trial on the mapped road course.',vehicleIds:['kart'],reward:18000});}return jobs;
}
function availableContracts(){return [...baseContracts().filter(j=>!['heli','jet'].includes(state.profile?.kind)),...availableProfessionalJobs()];}
function updateProfessionalActivity(before,dt){
 const a=activities.active;if(!a)return;const moved=V.Distance(before,player.position);if(a.vehicleId!==state.vehicleId||moved>state.profile.top*dt*1.6+.2){cancelActivity('Vehicle changed or position jumped');return;}
 if(state.elapsed-a.started>a.timeLimit||state.health<40||state.damage?.driverDead){cancelActivity('Time expired or vehicle too damaged');toast('Job failed. Protect the vehicle and passengers.');return;}
 a.travelled+=moved;a.legTravelled=(a.legTravelled||0)+moved;const c=a.checkpoints[a.index],distance=Math.hypot(player.position.x-c.x,player.position.z-c.z),h=mappedWaterAt(c.x,c.z)??terrainHeight(c.x,c.z)??0,agl=player.position.y-state.profile.clearance-h;
 let valid=distance<(c.flyThrough?150:22);
 if(c.flyThrough)valid=valid&&Math.abs(agl-c.altitudeAGL)<70&&state.speed>60;
 else if(c.hoist)valid=valid&&agl>=8&&agl<=24&&state.speed<1.8&&aircraftSystems.hoist>=agl-2;
 else valid=valid&&Math.abs(agl)<3&&state.speed<(a.mode==='water'?1.5:2);
 a.hold=valid?(a.hold||0)+dt:0;
 const instruction=c.flyThrough?'FLY THROUGH · '+c.altitudeAGL+'m AGL':c.hoist?'HOVER 8–24m · DEPLOY HOIST B':a.mode==='landing'?'LAND + HOLD STILL':'STOP FOR '+c.boarding.toUpperCase();
 $('activityStatus').textContent=a.name+' · '+c.name+' · '+Math.ceil(distance)+'m · '+instruction+(a.hold>0?' · '+a.hold.toFixed(1)+'/'+c.dwell+'s':'')+(a.loaded?' · '+(a.passengers?a.passengers+' ABOARD':'CARGO LOADED'):'');
 if(valid&&(c.flyThrough||a.hold>=c.dwell)&&(a.index===0||a.legTravelled>=a.legMinimum)){
  if(a.index===a.checkpoints.length-1){if(a.travelled>=a.minimum)completeActivity();return;}
  if(a.index===0){a.loaded=true;loadJobCargo(a);toast(a.passengers?a.passengers+' passenger(s) aboard. Follow the next marker.':'Cargo loaded. Follow the next marker.');}
  const previous=c;a.index++;a.legTravelled=0;a.hold=0;a.legMinimum=Math.hypot(a.checkpoints[a.index].x-previous.x,a.checkpoints[a.index].z-previous.z)*.60;makeActivityMarker();
 }
}
function loadJobCargo(a){if(!a.passengers&&['ute','hilux','ranger'].includes(a.vehicleId)&&exterior){a.payloadNode=new Node('job-tray-cargo',scene);a.payloadNode.parent=exterior;for(const x of [-.35,.35])box('supply-crate',.55,.55,.65,x,1.2,1.4,materials.dark,a.payloadNode);}}
function makeProfessionalMarker(){
 const a=activities.active,c=a.checkpoints[a.index],h=mappedWaterAt(c.x,c.z)??terrainHeight(c.x,c.z)??0,root=new Node('professional-job-target',scene);root.position.set(c.x,h+(c.flyThrough?c.altitudeAGL:.2),c.z);activities.marker=root;
 if(!activities.material)activities.material=mat('activity-gold','#f0c548',.6,.8);const ring=MB.CreateTorus('job-landing-ring',{diameter:c.flyThrough?110:28,thickness:c.flyThrough?1.1:.3,tessellation:32},scene);ring.parent=root;ring.material=activities.material;ring.isPickable=false;if(c.flyThrough)ring.rotation.x=Math.PI/2;
 if(a.passengers&&!c.flyThrough){for(let i=0;i<Math.min(3,a.passengers);i++){const person=new Node('waiting-passenger-'+i,scene);person.parent=root;person.position.set(11,0,i*1.2-1.2);cylinder('passenger-body',.40,1.0,0,.70,0,materials.dark,person,8);const head=MB.CreateSphere('passenger-head',{diameter:.33,segments:8},scene);head.parent=person;head.position.y=1.42;head.material=materials.light;head.isPickable=false;}}
}
