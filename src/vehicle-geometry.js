// Original, metre-scale game models. All exterior render paths share this registry.
const MODEL_REVISION='25.0';
const MODEL_PREVIEWS=/*__MODEL_PREVIEWS__*/{};
// Rounded sheet-metal edges, rather than hard rectangular blocks. Metres.
function vehicleBevelBox(name,w,h,d,r=Math.min(w,h,d)*.12){
 r=Math.min(r,w*.2,h*.2,d*.2);const half=[w/2,h/2,d/2],positions=[],indices=[],points=new Map(),at=(signs,axis)=>{const key=signs.join(',')+':'+axis;if(points.has(key))return points.get(key);const id=positions.length/3;for(let i=0;i<3;i++)positions.push(signs[i]*(half[i]-(i===axis?0:r)));points.set(key,id);return id;},triangle=(a,b,c)=>{const v=i=>new V(positions[i*3],positions[i*3+1],positions[i*3+2]),pa=v(a),pb=v(b),pc=v(c),normal=V.Cross(pb.subtract(pa),pc.subtract(pa)),centre=pa.add(pb).add(pc);if(V.Dot(normal,centre)<0)[b,c]=[c,b];indices.push(a,b,c);},quad=(a,b,c,d)=>{triangle(a,b,c);triangle(a,c,d);};
 for(let axis=0;axis<3;axis++)for(const side of [-1,1]){const others=[0,1,2].filter(i=>i!==axis),ids=[];for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const signs=[0,0,0];signs[axis]=side;signs[others[0]]=u;signs[others[1]]=v;ids.push(at(signs,axis));}quad(...ids);}
 for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){const third=3-a-b;for(const sa of [-1,1])for(const sb of [-1,1]){const lo=[0,0,0],hi=[0,0,0];lo[a]=hi[a]=sa;lo[b]=hi[b]=sb;lo[third]=-1;hi[third]=1;quad(at(lo,a),at(hi,a),at(hi,b),at(lo,b));}}
 for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])triangle(at([x,y,z],0),at([x,y,z],1),at([x,y,z],2));
 const mesh=new Mesh(name,scene),vd=new VertexData(),normals=[];VertexData.ComputeNormals(positions,indices,normals,{useRightHandedSystem:true});vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.uvs=[];for(let i=0;i<positions.length;i+=3)vd.uvs.push((positions[i]+half[0])/Math.max(w,.01),(positions[i+2]+half[2])/Math.max(d,.01));vd.applyToMesh(mesh,true);mesh.metadata={bevelledPanel:true};return mesh;
}
function modelSurface(name,points,indices,material,parent){const m=meshData(name,points.flat(),indices,material,parent);m.isPickable=false;material.backFaceCulling=false;return m;}
function modelQuad(name,p,material,parent){return modelSurface(name,p,[0,1,2,0,2,3],material,parent);}
function modelLoft(name,stations,material,parent,sides=16){
 const points=[],idx=[];
 for(const s of stations)for(let i=0;i<sides;i++){const a=i/sides*TAU;points.push([Math.cos(a)*s.w,s.y+Math.sin(a)*s.h,s.z]);}
 for(let j=0;j<stations.length-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides,c=(j+1)*sides+i,d=(j+1)*sides+(i+1)%sides;idx.push(a,b,c,b,d,c);}
 for(let i=1;i<sides-1;i++){idx.push(0,i+1,i);const end=(stations.length-1)*sides;idx.push(end,end+i,end+i+1);}
 return modelSurface(name,points,idx,material,parent);
}
function modelGlass(name){const m=mat(name,'#29475b',.025,.82);m.specularColor=new C(.65,.72,.8);m.specularPower=96;m.backFaceCulling=false;return m;}
function modelWheel(root,{name='road-wheel',x,z,r=.34,width=.24,spokes=6,paint=materials.metal,steer=false}){
 const wheel=new Node(name,scene);wheel.parent=root;wheel.position.set(x,r,z);wheel.metadata={wheel:true,radius:r,steer,restY:r};
 cylinder(name+'-tyre',r*2,width,0,0,0,materials.black,wheel,24).rotation.z=Math.PI/2;
 const side=Math.sign(x)||1,outer=side*(width/2+.008);cylinder(name+'-sidewall',r*1.84,.014,outer,0,0,materials.tyre,wheel,24).rotation.z=Math.PI/2;
 cylinder(name+'-rim',r*1.34,.025,outer+side*.013,0,0,materials.dark,wheel,24).rotation.z=Math.PI/2;
 cylinder(name+'-hub',r*.34,.045,outer+side*.032,0,0,paint,wheel,16).rotation.z=Math.PI/2;
 for(let i=0;i<spokes;i++){const a=i/spokes*TAU;tube(name+'-spoke',[[outer+side*.03,Math.sin(a)*r*.14,Math.cos(a)*r*.14],[outer+side*.035,Math.sin(a)*r*.59,Math.cos(a)*r*.59]],r*.06,paint,wheel);}
 return wheel;
}
const ROAD_SHAPES={
 drift:{roof:1.44,front:-.90,rear:1.42,roofFront:-.48,roofRear:.88,doors:4,hood:.82,wheel:.32,grille:'hex',hatch:true,spoiler:.12,accent:true},
 hilux:{roof:1.82,front:-1.28,rear:.91,roofFront:-.91,roofRear:.65,doors:4,hood:1.10,wheel:.38,grille:'trapezoid',bed:true},
 ranger:{roof:1.88,front:-1.28,rear:1.02,roofFront:-.97,roofRear:.77,doors:4,hood:1.17,wheel:.39,grille:'ranger',bed:true},
 patrol:{roof:1.94,front:-1.38,rear:2.30,roofFront:-.92,roofRear:1.97,doors:4,hood:1.10,wheel:.40,grille:'patrol',wagon:true},
 jimny:{roof:1.72,front:-.89,rear:1.55,roofFront:-.71,roofRear:1.35,doors:2,hood:.99,wheel:.35,grille:'round',wagon:true,spare:true},
 commodore:{roof:1.45,front:-1.18,rear:1.47,roofFront:-.63,roofRear:.85,doors:4,hood:.86,wheel:.34,grille:'split'},
 falcon:{roof:1.45,front:-1.12,rear:1.39,roofFront:-.58,roofRear:.79,doors:4,hood:.87,wheel:.34,grille:'falcon'},
 mustang:{roof:1.38,front:-.79,rear:1.74,roofFront:-.34,roofRear:.50,doors:2,hood:.85,wheel:.35,grille:'mustang',fastback:true},
 gtr:{roof:1.37,front:-1.07,rear:1.48,roofFront:-.53,roofRear:.52,doors:2,hood:.81,wheel:.35,grille:'gtr',fastback:true,spoiler:.30},
 wrx:{roof:1.46,front:-1.06,rear:1.30,roofFront:-.65,roofRear:.75,doors:4,hood:.86,wheel:.34,grille:'wrx',scoop:true,spoiler:.56}
};
function buildRoadExterior(root,p){
 const id=p.modelId,s=ROAD_SHAPES[id];if(!s)throw Error('No road model defined for '+id);
 const paint=mat(id+'-bodywork',p.colour),glass=modelGlass(id+'-windows'),black=materials.black,alloy=mat(id+'-wheel-alloy','#abb3bd'),w=p.width/2,l=p.length,base=s.hood;
 const archStations=[];for(const axle of [-p.wheelbase/2,p.wheelbase/2])for(let i=0;i<=12;i++){const z=axle+(i/12-.5)*(s.wheel+.06)*2;if(z>-l/2+.05&&z<l/2-.05)archStations.push([z,w*.99]);}
 const stations=[...archStations,[-l/2,w*.83],[-l*.43,w*.97],[-p.wheelbase/2,w],[s.front,w*.99],[s.rear,w*.99],...(s.bed?[[s.rear+.03,w*.99]]:[]),[p.wheelbase/2,w*.98],[l*.44,w*.95],[l/2,w*.86]].sort((a,b)=>a[0]-b[0]),vertices=[],faces=[];
 for(const [z,half] of stations){const top=s.bed&&z>s.rear?.82:base+.04,baseLow=s.wagon||s.bed?.32:.24,arch=Math.max(...[-p.wheelbase/2,p.wheelbase/2].map(z0=>{const d=Math.abs(z-z0),r=s.wheel+.055;return d<r?s.wheel+Math.sqrt(r*r-d*d):0;})),low=Math.max(baseLow,arch);for(const [x,y] of [[-half*.88,low],[-half,Math.max(low,baseLow+.12)],[-half,top-.10],[-half*.92,top],[half*.92,top],[half,top-.10],[half,Math.max(low,baseLow+.12)],[half*.88,low]])vertices.push([x,y,z]);}
 for(let j=0;j<stations.length-1;j++)for(let i=0;i<8;i++){const a=j*8+i,b=j*8+(i+1)%8,c=(j+1)*8+i,d=(j+1)*8+(i+1)%8;faces.push(a,b,c,b,d,c);}for(let i=1;i<7;i++){faces.push(0,i+1,i);const end=(stations.length-1)*8;faces.push(end,end+i,end+i+1);}modelSurface(id+'-sculpted-body',vertices,faces,paint,root);
 const hood=modelQuad(id+'-bonnet',[[-w*.85,base+.055,-l*.45],[w*.85,base+.055,-l*.45],[w*.91,base+.08,s.front],[-w*.91,base+.08,s.front]],paint,root);hood.metadata={crashPart:'panel'};
 for(const side of [-1,1])for(const axle of [-p.wheelbase/2,p.wheelbase/2]){const points=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI;points.push([side*w*1.006,s.wheel+Math.sin(a)*(s.wheel+.065),axle+Math.cos(a)*(s.wheel+.065)]);}tube(id+'-wheel-arch-trim',points,.024,black,root);}
 const bottom=base+.035,top=s.roof-.045,roofW=w*.84,baseW=w*.94;
 modelQuad(id+'-windscreen',[[-baseW,bottom,s.front],[baseW,bottom,s.front],[roofW,top,s.roofFront],[-roofW,top,s.roofFront]],glass,root);
 modelQuad(id+'-rear-glass',[[-baseW,bottom,s.rear],[-roofW,top,s.roofRear],[roofW,top,s.roofRear],[baseW,bottom,s.rear]],glass,root);
 modelQuad(id+'-painted-roof',[[-roofW,top+.025,s.roofFront],[roofW,top+.025,s.roofFront],[roofW,top+.025,s.roofRear],[-roofW,top+.025,s.roofRear]],paint,root);
 for(const side of [-1,1]){
  modelQuad(id+'-side-glass',[[side*baseW,bottom,s.front],[side*roofW,top,s.roofFront],[side*roofW,top,s.roofRear],[side*baseW,bottom,s.rear]],glass,root);
  for(const [label,from,to] of [['a',s.front,s.roofFront],['c',s.rear,s.roofRear]])tube(id+'-'+label+'-pillar',[[side*baseW,bottom,from],[side*roofW,top+.025,to]],.036,paint,root);
  tube(id+'-roof-gutter',[[side*roofW,top+.025,s.roofFront],[side*roofW,top+.025,s.roofRear]],.026,paint,root);
  const pillar=s.doors===4?-.02:.12;box(id+'-b-pillar',.045,top-bottom,.085,side*(baseW+roofW)/2,(top+bottom)/2,pillar,black,root);
  for(const z of s.doors===4?[s.front*.48,s.rear*.47]:[.05]){
   tube(id+'-door-seam',[[side*w*1.003,.44,z],[side*w*1.004,base+.04,z]],.009,materials.dark,root);
   box(id+'-door-handle',.024,.032,.15,side*w*1.015,base-.04,z+.18,alloy,root);
  }
  tube(id+'-mirror-arm',[[side*w*.92,base+.23,s.front+.19],[side*(w+.14),base+.27,s.front+.21]],.025,black,root);
  box(id+'-mirror',.19,.12,.23,side*(w+.16),base+.29,s.front+.22,black,root);
  for(const z of [-p.wheelbase/2,p.wheelbase/2]){
   const well=MB.CreateDisc(id+'-wheel-well',{radius:s.wheel*1.10,tessellation:24,sideOrientation:Mesh.DOUBLESIDE},scene);well.parent=root;well.rotation.y=Math.PI/2;well.position.set(side*(w+.006),s.wheel,z);well.material=black;well.isPickable=false;
   const arch=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;arch.push([side*(w+.018),s.wheel+Math.sin(a)*s.wheel*1.13,z+Math.cos(a)*s.wheel*1.13]);}tube(id+'-wheelarch-lip',arch,s.wagon||s.bed?.035:.02,s.wagon?black:paint,root);
   modelWheel(root,{x:side*(w-.05),z,r:s.wheel,width:s.wagon||s.bed?.27:.24,spokes:id==='gtr'?10:id==='mustang'?5:6,paint:alloy,steer:z<0});
  }
  box(id+'-sill',.07,.11,l*.62,side*w,.39,.05,s.accent?materials.red:black,root);
 }
 for(const side of [-1,1])for(const z of s.doors===4?[s.front+.65,s.rear-.42]:[s.front+.65]){box(id+'-interior-seat',.43,.13,.46,side*.43,base-.18,z,materials.dark,root);box(id+'-seat-back',.43,.48,.10,side*.43,base+.10,z+.19,materials.dark,root);box(id+'-head-rest',.23,.16,.10,side*.43,base+.39,z+.19,materials.black,root);}box(id+'-dashboard',w*1.70,.20,.25,0,base+.16,s.front+.14,materials.dark,root);
 const z=-l/2-.026;
 box(id+'-front-grille',w*1.27,s.bed||s.wagon?.32:.22,.04,0,base*.70,z,black,root);
 if(s.grille==='ranger')for(const side of [-1,1]){tube(id+'-c-shaped-daylight',[[side*w*.48,base+.10,z-.03],[side*w*.82,base+.10,z-.03],[side*w*.82,base-.19,z-.03],[side*w*.65,base-.19,z-.03]],.026,materials.light,root);}
 else if(s.grille==='round')for(const side of [-1,1]){const light=cylinder(id+'-round-headlamp',.22,.035,side*w*.64,base*.83,z-.025,materials.light,root,24);light.rotation.x=Math.PI/2;}
 else for(const side of [-1,1]){
  modelQuad(id+'-headlamp',[[side*w*.40,base+.06,z-.03],[side*w*.89,base+.02,z+.05],[side*w*.85,base-.08,z+.05],[side*w*.52,base-.10,z-.03]],materials.light,root);
  if(id==='mustang')for(let i=0;i<3;i++)box(id+'-daylight-slash',.018,.075,.023,side*(w*.47+i*.065),base+.035,z-.04,materials.light,root);
 }
 for(let i=0;i<(s.grille==='round'?5:3);i++)box(id+'-grille-detail',s.grille==='round'?.045:w*1.05,s.grille==='round'?.18:.02,.048,s.grille==='round'?(i-2)*.10:0,base*.68+(s.grille==='round'?0:(i-1)*.07),z-.025,alloy,root);
 box(id+'-splitter',w*1.96,.065,.15,0,.28,z+.035,s.accent?materials.red:black,root);
 if(s.bed){const rear=(s.rear+l/2)/2,bedLength=l/2-s.rear;box(id+'-open-bed-floor',w*1.79,.055,bedLength*.95,0,.82,rear,materials.dark,root);for(const side of [-1,1])box(id+'-pickup-bed-side',.10,.40,bedLength,side*w*.93,1.01,rear,paint,root);box(id+'-tailgate',w*1.88,.40,.075,0,1.01,l/2,paint,root);tube(id+'-sports-bar',[[-w*.83,1.12,s.rear+.15],[-w*.83,1.73,s.rear+.15],[w*.83,1.73,s.rear+.15],[w*.83,1.12,s.rear+.15]],.052,black,root);}
 if(s.wagon){for(const side of [-1,1])tube(id+'-roof-rail',[[side*w*.76,s.roof+.06,s.roofFront+.2],[side*w*.76,s.roof+.06,s.roofRear-.12]],.027,black,root);}
 for(const side of [-1,1]){
  if(id==='gtr')for(const offset of [-.13,.13]){const lamp=cylinder(id+'-round-tail-lamp',.16,.035,side*w*.58+offset,base*.83,l/2+.035,materials.red,root,20);lamp.rotation.x=Math.PI/2;}
  else if(id==='mustang')for(let i=0;i<3;i++)box(id+'-triple-tail-lamp',.055,.18,.033,side*(w*.48+i*.11),base*.83,l/2+.04,materials.red,root);
  else box(id+'-tail-lamp',s.bed?.14:w*.40,s.bed?.30:.13,.035,side*w*.76,base*.83,l/2+.04,materials.red,root);
  cylinder(id+'-exhaust-tip',.085,.18,side*w*.67,.27,l/2+.035,alloy,root,12).rotation.x=Math.PI/2;
 }
 if(s.scoop){box(id+'-hood-scoop-base',.55,.095,.40,0,base+.235,-l*.31,paint,root);box(id+'-hood-scoop-opening',.42,.055,.035,0,base+.24,-l*.31-.20,black,root);}
 if(s.spoiler){const sz=s.hatch?s.rear-.08:l*.42,sy=s.hatch?s.roof+.07:base+.22+s.spoiler;box(id+'-rear-wing',w*1.76,.055,.29,0,sy,sz,s.accent?black:paint,root);for(const x of [-w*.57,w*.57])box(id+'-wing-stanchion',.045,s.spoiler,.08,x,sy-s.spoiler/2,sz,black,root);}
 if(s.spare){const spare=modelWheel(root,{name:'rear-spare',x:0,z:l/2+.17,r:.34,width:.20,paint:alloy});spare.rotation.y=Math.PI/2;spare.position.set(0,.98,l/2+.19);}
 root.metadata={vehicle:p.name,kind:'car',modelId:id,body:p.body,revision:MODEL_REVISION,length:p.length,wheelbase:p.wheelbase,wheelCount:4,doors:s.doors};
}
function helicopterShell(root,sections,paint,glass,label){
 const n=16,points=[],skin=[],glazing=[];
 for(const s of sections)for(let i=0;i<n;i++){const a=i/n*TAU;points.push([Math.cos(a)*s.w,s.y+Math.sin(a)*s.h,s.z]);}
 for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+i,d=(j+1)*n+(i+1)%n,out=j<3&&i<8?glazing:skin;out.push(a,b,c,b,d,c);}
 for(let i=1;i<n-1;i++){skin.push(0,i+1,i);const end=(sections.length-1)*n;skin.push(end,end+i,end+i+1);}
 modelSurface(label+'-rounded-fuselage',points,skin,paint,root);modelSurface(label+'-wraparound-cockpit',points,glazing,glass,root);
}
function helicopterRotors(root,{label,diameter,height,mastZ,blades,tailZ,tailY,tailRadius,tailBlades}){
 cylinder(label+'-main-mast',.13,.53,0,height-.27,mastZ,materials.metal,root,16);cylinder(label+'-swashplate',.40,.085,0,height-.33,mastZ,materials.dark,root,20);
 for(let i=0;i<blades;i++){const a=i/blades*TAU;tube(label+'-pitch-link',[[Math.sin(a)*.19,height-.30,mastZ-Math.cos(a)*.19],[Math.sin(a)*.31,height-.04,mastZ-Math.cos(a)*.31]],.012,materials.metal,root);}
 const main=new Node(label+'-main-rotor',scene);main.parent=root;main.position.set(0,height,mastZ);main.metadata={rotating:true,blades,diameter};
 cylinder(label+'-rotor-hub',.42,.14,0,0,0,materials.metal,main,16);
 const radius=diameter/2,inner=.25;
 for(let i=0;i<blades;i++){const a=i/blades*TAU,r=(radius+inner)/2,b=box(label+'-main-blade',.23,.032,radius-inner,Math.sin(a)*r,0,-Math.cos(a)*r,materials.dark,main);b.rotation.y=-a;box(label+'-blade-tip',.23,.034,.22,Math.sin(a)*(radius-.11),.004,-Math.cos(a)*(radius-.11),materials.light,main).rotation.y=-a;}
 const tail=new Node(label+'-tail-rotor',scene);tail.parent=root;tail.position.set(.25,tailY,tailZ);tail.metadata={rotating:true,blades:tailBlades,diameter:tailRadius*2};cylinder(label+'-tail-hub',.16,.18,0,0,0,materials.metal,tail,12).rotation.z=Math.PI/2;
 for(let i=0;i<tailBlades;i++){const a=i/tailBlades*TAU,b=box(label+'-tail-blade',.045,tailRadius-.10,.115,0,Math.cos(a)*(tailRadius+.10)/2,Math.sin(a)*(tailRadius+.10)/2,materials.dark,tail);b.rotation.x=a;}
 exteriorRotor=main;return {mainRotor:main,tailRotor:tail};
}
function heliCabinInterior(root,p,rescue){
 const seats=new Node('visible-helicopter-cabin',scene);seats.parent=root;
 for(const side of [-1,1])for(const z of rescue?[-1.1,.7,1.55]:[-.85,.7]){box('helicopter-seat-cushion',.48,.12,.48,side*(rescue?.57:.43),1.1,z,materials.black,seats);box('helicopter-seat-back',.48,.62,.12,side*(rescue?.57:.43),1.42,z+.21,materials.dark,seats);box('helicopter-seat-headrest',.24,.20,.12,side*(rescue?.57:.43),1.83,z+.20,materials.black,seats);}
 box('helicopter-cabin-floor',rescue?2.20:1.6,.08,rescue?3.4:2.2,0,.79,rescue?.25:.12,materials.dark,seats);
 box('helicopter-flight-console',rescue?1.7:1.15,.32,.45,0,1.32,rescue?-1.9:-1.45,materials.dark,seats);
}
function buildDetailedChopper(root,p){
 const paint=mat('AS350-bodywork',p.colour),glass=modelGlass('AS350-canopy'),accent=mat('AS350-blue-livery','#245c87');
 helicopterShell(root,[{z:-2.5,w:.08,y:.98,h:.08},{z:-2.14,w:.67,y:1.17,h:.58},{z:-1.30,w:.98,y:1.28,h:.90},{z:-.22,w:1.02,y:1.30,h:1.0},{z:1.10,w:.88,y:1.40,h:.78},{z:1.95,w:.30,y:1.67,h:.34}],paint,glass,'AS350');
 for(const side of [-1,1]){
  modelQuad('AS350-rear-door-glass',[[side*1.022,1.15,-.20],[side*.99,1.96,-.20],[side*.87,1.96,.80],[side*.93,1.12,.85]],glass,root);
  tube('AS350-cockpit-frame',[[side*.25,1.0,-2.45],[side*.72,1.30,-2.15],[side*.90,1.93,-1.35],[side*.72,2.19,-.32]],.025,paint,root);
  tube('AS350-door-frame',[[side*1.02,.88,-.30],[side*1.02,2.02,-.30],[side*.89,2.02,.88],[side*.89,.90,.88]],.025,paint,root);
  tube('AS350-cabin-stripe',[[side*.69,.96,-1.93],[side*1.015,.97,-.25],[side*.88,1.09,1.15]],.05,accent,root);
  tube('AS350-raised-skid-tip',[[side*1.10,.33,-2.13],[side*1.10,.11,-1.78],[side*1.10,.10,2.03],[side*1.10,.17,2.18]],.045,materials.metal,root);
  for(const z of [-.95,1.02])tube('AS350-cross-tube',[[side*.60,.87,z],[side*.85,.34,z],[side*1.10,.13,z]],.04,materials.metal,root);
  box('AS350-door-handle',.045,.03,.17,side*1.04,1.14,.54,materials.metal,root);
 }
 tube('AS350-centre-windscreen-frame',[[0,1.0,-2.48],[0,1.69,-2.04],[0,2.17,-1.05],[0,2.27,-.25]],.024,paint,root);
 modelLoft('AS350-Arriel-engine-fairing',[{z:-.72,w:.24,y:2.22,h:.12},{z:-.36,w:.56,y:2.31,h:.31},{z:.95,w:.47,y:2.34,h:.28},{z:1.64,w:.25,y:2.24,h:.16}],paint,root);
 ellipsoid('AS350-engine-air-intake',0,2.35,-.57,.64,.29,.14,materials.black,root);
 cylinder('AS350-engine-exhaust',.30,.48,.35,2.30,1.54,materials.dark,root,16).rotation.x=Math.PI/2;
 modelLoft('AS350-tapered-tail-boom',[{z:1.33,w:.42,y:1.68,h:.34},{z:3.30,w:.24,y:1.91,h:.22},{z:5.60,w:.13,y:2.14,h:.15},{z:7.45,w:.07,y:2.35,h:.12}],paint,root,12);
 modelQuad('AS350-swept-vertical-fin',[[0,2.20,6.77],[0,3.34,7.02],[0,3.49,7.62],[0,2.12,7.69]],paint,root);
 for(const side of [-1,1])modelQuad('AS350-horizontal-stabilizer',[[0,2.12,5.32],[side*1.03,2.12,5.58],[side*1.03,2.12,6.07],[0,2.12,5.95]],accent,root);
 heliCabinInterior(root,p,false);vehicleLabel('VH-CEX',1.0,.20,1.03,.95,.18,root);
 const rotors=helicopterRotors(root,{label:'AS350',diameter:10.69,height:3.30,mastZ:.06,blades:3,tailZ:7.54,tailY:2.38,tailRadius:.93,tailBlades:2});
 root.metadata={vehicle:p.name,kind:'heli',modelId:p.modelId,revision:MODEL_REVISION,body:'rounded AS350 rotorcraft',rotorDiameter:10.69,skids:true,wheelCount:0,...rotors};
}
function buildRescueHelicopter(root,p){
 const paint=mat('rescue-bodywork',p.colour),glass=modelGlass('rescue-curved-canopy'),blue=mat('rescue-blue','#194a7d'),yellow=mat('rescue-yellow','#e5bc35');
 helicopterShell(root,[{z:-3.22,w:.06,y:1.20,h:.06},{z:-2.77,w:.52,y:1.42,h:.46},{z:-1.85,w:1.10,y:1.68,h:.87},{z:-.72,w:1.32,y:1.75,h:1.0},{z:1.24,w:1.33,y:1.77,h:.98},{z:2.70,w:.72,y:1.88,h:.60},{z:3.42,w:.20,y:2.02,h:.24}],paint,glass,'AW139-inspired');
 for(const side of [-1,1]){
  for(const z of [-.25,.64,1.54])modelQuad('rescue-rounded-cabin-window',[[side*1.335,1.47,z-.32],[side*1.22,2.33,z-.32],[side*1.22,2.33,z+.32],[side*1.335,1.47,z+.32]],glass,root);
  tube('rescue-sliding-door-outline',[[side*1.35,1.0,-.73],[side*1.35,2.52,-.73],[side*1.30,2.52,2.04],[side*1.30,1.0,2.04],[side*1.35,1.0,-.73]],.022,blue,root);
  tube('rescue-windscreen-pillar',[[side*.27,1.20,-3.15],[side*.84,1.66,-2.64],[side*1.02,2.26,-1.84],[side*.79,2.61,-.78]],.03,paint,root);
  tube('rescue-side-livery',[[side*.53,1.02,-2.69],[side*1.31,1.20,-.75],[side*1.31,1.23,1.72],[side*.65,1.65,2.75]],.13,p.livery?blue:yellow,root);
  modelLoft('rescue-turbine-cowling-'+side,[{z:-.52,w:.27,y:2.77,h:.22},{z:.04,w:.39,y:2.91,h:.34},{z:1.27,w:.37,y:2.91,h:.32},{z:2.00,w:.23,y:2.75,h:.19}],paint,root).position.x=side*.53;
  ellipsoid('rescue-turbine-intake',side*.53,2.83,-.48,.48,.36,.14,materials.black,root);
  cylinder('rescue-turbine-exhaust',.34,.48,side*.52,2.82,1.94,materials.dark,root,20).rotation.x=Math.PI/2;
  box('rescue-cabin-step',.34,.055,1.55,side*1.43,.72,.60,materials.dark,root);
 }
 tube('rescue-centre-windscreen-frame',[[0,1.20,-3.20],[0,2.02,-2.67],[0,2.55,-1.84],[0,2.74,-.75]],.03,paint,root);
 modelLoft('rescue-tapered-tail-boom',[{z:2.40,w:.63,y:1.97,h:.51},{z:4.03,w:.37,y:2.27,h:.37},{z:6.29,w:.19,y:2.73,h:.23},{z:8.48,w:.09,y:3.12,h:.16}],blue,root,12);
 modelQuad('rescue-swept-tail-fin',[[0,2.70,7.27],[0,4.34,7.81],[0,4.50,8.56],[0,2.81,8.77]],blue,root);
 for(const side of [-1,1])modelQuad('rescue-tailplane',[[0,2.68,6.1],[side*1.54,2.68,6.46],[side*1.45,2.68,7.12],[0,2.68,6.89]],yellow,root);
 const gearRoot=new Node('rescue-retractable-gear',scene);gearRoot.parent=root;gearRoot.position.y=1.02;gearRoot.metadata={retractable:true};
 for(const [x,z] of [[0,-2.06],[-1.30,1.45],[1.30,1.45]]){tube('rescue-gear-leg',[[x*.90,-.04,z],[x,-.75,z+.06]],.045,materials.metal,gearRoot);cylinder('rescue-landing-wheel',.50,.18,x,-.77,z+.06,materials.black,gearRoot,20).rotation.z=Math.PI/2;cylinder('rescue-wheel-hub',.24,.19,x,-.77,z+.06,materials.metal,gearRoot,16).rotation.z=Math.PI/2;}
 tube('rescue-hoist-support',[[1.0,2.45,.35],[1.61,2.50,.35]],.05,materials.metal,root);box('rescue-hoist-winch',.35,.24,.38,1.60,2.42,.35,materials.dark,root);ellipsoid('rescue-belly-searchlight',.63,.64,-1.37,.27,.27,.30,materials.light,root);
 heliCabinInterior(root,p,true);vehicleLabel(p.livery?'RACQ RESCUE':'LIFEFLIGHT',2.02,.25,1.36,1.17,.50,root);
 const rotors=helicopterRotors(root,{label:'rescue-five-blade',diameter:13.80,height:3.97,mastZ:.38,blades:5,tailZ:8.43,tailY:3.21,tailRadius:1.28,tailBlades:4});
 root.metadata={vehicle:p.name,kind:'heli',modelId:p.modelId,revision:MODEL_REVISION,body:'AW139-inspired rescue rotorcraft',rotorDiameter:13.8,wheelCount:3,rescue:true,gearRoot,...rotors};
}
function buildFighter(root,p){
 const paint=mat('fighter-bodywork',p.colour),glass=modelGlass('fighter-canopy'),dark=materials.dark;
 modelLoft('fighter-radome-and-fuselage',[{z:-8.5,w:.025,y:1.15,h:.025},{z:-7.42,w:.29,y:1.19,h:.30},{z:-5.25,w:.54,y:1.25,h:.51},{z:-2.20,w:.85,y:1.30,h:.72},{z:1.80,w:1.10,y:1.33,h:.69},{z:5.7,w:1.02,y:1.35,h:.65},{z:7.65,w:.78,y:1.34,h:.54}],paint,root,16);
 ellipsoid('fighter-two-seat-bubble-canopy',0,2.04,-3.95,1.02,.95,2.82,glass,root);tube('fighter-canopy-centre-bow',[[-.46,2.15,-3.85],[0,2.57,-3.85],[.46,2.15,-3.85]],.025,dark,root);
 for(const side of [-1,1]){
  modelQuad('fighter-leading-edge-extension',[[side*.39,1.47,-5.1],[side*1.72,1.44,-1.12],[side*1.97,1.42,.45],[side*.71,1.47,1.3]],paint,root);
  modelQuad('fighter-swept-main-wing',[[side*.90,1.30,-1.8],[side*5.45,1.30,1.50],[side*5.1,1.30,2.40],[side*1.0,1.30,3.58]],paint,root);
  tube('fighter-wing-trailing-flap',[[side*1.35,1.315,3.35],[side*4.72,1.315,2.40]],.012,dark,root);box('fighter-wingtip-launch-rail',.12,.10,1.65,side*5.37,1.34,1.82,dark,root);
  modelQuad('fighter-horizontal-stabilizer',[[side*.61,1.42,5.17],[side*3.04,1.42,6.75],[side*2.75,1.42,8.10],[side*.67,1.42,7.77]],paint,root);
  modelQuad('fighter-canted-vertical-fin',[[side*.90,1.55,3.53],[side*1.63,4.26,5.42],[side*1.72,4.33,6.24],[side*.99,1.52,7.72]],paint,root);
  modelLoft('fighter-engine-nacelle',[{z:.55,w:.47,y:1.07,h:.40},{z:5.9,w:.51,y:1.16,h:.47},{z:7.82,w:.43,y:1.20,h:.40}],paint,root,12).position.x=side*.56;
  cylinder('fighter-exhaust-nozzle',.87,.61,side*.56,1.20,8.02,dark,root,24).rotation.x=Math.PI/2;cylinder('fighter-exhaust-interior',.64,.015,side*.56,1.20,8.335,materials.black,root,24).rotation.x=Math.PI/2;
  modelQuad('fighter-intake-ramp',[[side*.52,.88,-2.22],[side*1.27,.88,-2.07],[side*1.25,1.40,-2.07],[side*.51,1.40,-2.22]],materials.black,root);
 }
 const gearRoot=new Node('fighter-tricycle-gear',scene);gearRoot.parent=root;gearRoot.position.y=1.08;
 for(const [x,z] of [[0,-4.5],[-1.20,2.3],[1.20,2.3]]){tube('fighter-gear-leg',[[x*.85,0,z-.1],[x,-.76,z]],.05,materials.metal,gearRoot);cylinder('fighter-landing-wheel',.57,.20,x,-.795,z,materials.black,gearRoot,20).rotation.z=Math.PI/2;box('fighter-gear-door',.36,.045,.78,x*.9,-.15,z,paint,gearRoot);}
 root.metadata={vehicle:p.name,kind:'jet',modelId:p.modelId,revision:MODEL_REVISION,body:'F/A-18-inspired twin-engine twin-tail fighter',span:11.02,wheelCount:3,gearRoot};
}
function buildRunabout(root,p,inside){
 const paint=mat('runabout-bodywork',p.colour),glass=modelGlass('marine-windscreen'),trim=materials.dark;
 modelSurface('runabout-deep-vee-hull',[[0,-.36,-2.95],[-.93,-.17,.25],[.93,-.17,.25],[-1.05,-.10,2.65],[1.05,-.10,2.65],[0,.72,-2.95],[-.92,.71,-1.18],[.92,.71,-1.18],[-1.15,.70,2.65],[1.15,.70,2.65]],[0,1,2,0,5,6,0,7,5,0,6,1,0,2,7,1,6,8,1,8,3,2,4,9,2,9,7,3,8,9,3,9,4],paint,root);
 modelQuad('runabout-triangular-bow-deck',[[0,.73,-2.94],[.92,.72,-1.18],[-.92,.72,-1.18],[0,.73,-2.94]],paint,root);
 box('runabout-cockpit-deck',2.10,.07,3.78,0,.29,.72,materials.light,root);
 for(const side of [-1,1]){tube('runabout-gunwale',[[0,.76,-2.95],[side*.95,.76,-1.18],[side*1.15,.76,2.65]],.045,trim,root);tube('runabout-stainless-bow-rail',[[side*.89,.80,-1.02],[side*.83,1.08,-1.45],[0,1.16,-2.72]],.018,materials.metal,root);box('runabout-captain-chair',.58,.15,.53,side*.50,.73,.25,trim,root);box('runabout-chair-back',.58,.44,.12,side*.50,.99,.48,trim,root);modelQuad('runabout-side-windscreen',[[side*.96,.95,-1.22],[side*.94,1.48,-.96],[side*1.01,1.22,-.42],[side*1.03,.93,-.39]],glass,root);}
 box('runabout-helm-console',1.86,.40,.36,0,.99,-1.01,trim,root);if(!inside)modelQuad('runabout-raked-windscreen',[[-.96,.97,-1.24],[.96,.97,-1.24],[.94,1.48,-.96],[-.94,1.48,-.96]],glass,root);
 box('runabout-stern-bench',1.85,.18,.62,0,.67,2.02,trim,root);box('runabout-transom',2.20,.48,.08,0,.45,2.65,paint,root);
 ellipsoid('runabout-outboard-cowling',0,.77,2.99,.60,.80,.59,trim,root);box('runabout-outboard-leg',.18,.77,.19,0,.04,3.0,trim,root);const prop=new Node('runabout-propeller',scene);prop.parent=root;prop.position.set(0,-.28,3.13);for(let i=0;i<3;i++){const blade=box('runabout-prop-blade',.10,.25,.035,Math.sin(i*TAU/3)*.11,Math.cos(i*TAU/3)*.11,0,materials.metal,prop);blade.rotation.z=-i*TAU/3;}
 root.metadata={vehicle:p.name,kind:'boat',modelId:p.modelId,revision:MODEL_REVISION,body:'vee-hull outboard runabout',propeller:prop,wheelCount:0};
}
function buildBicycle(root,p){buildLegacyBicycle(root,p);box('ebike-downtube-battery',.10,.13,.45,0,.55,-.24,materials.black,root).rotation.x=-.65;cylinder('ebike-crank-motor',.20,.16,0,.37,-.05,materials.dark,root,16).rotation.z=Math.PI/2;for(const side of [-1,1])tube('ebike-front-fork',[[side*.055,.85,-.48],[side*.055,.36,-.65]],.019,materials.metal,root);tube('ebike-chain',[[.065,.36,.65],[.065,.28,-.05],[.065,.44,-.05],[.065,.36,.65]],.007,materials.dark,root);root.metadata={vehicle:p.name,kind:'bike',modelId:p.modelId,revision:MODEL_REVISION,wheelCount:2,body:'electric bicycle'};}
function buildKart(root,p){buildLegacyKart(root,p);tube('kart-rear-axle',[[-.63,.16,.59],[.63,.16,.59]],.025,materials.metal,root);root.metadata={...root.metadata,kind:'car',modelId:p.modelId,revision:MODEL_REVISION,wheelCount:4,body:'open tubular go-kart'};}
function constructVehicle(root,p,id=p.modelId){
 exteriorRotor=null;
 if(id==='trafficTruck'){buildTrafficTruck(root,p);}else if(id==='ute'){const result=buildLandCruiser79(scene,root,false);for(const m of result.root.getChildMeshes())if(m.material?.name==='79-sandstone-paint')m.material.diffuseColor=C.FromHexString(p.colour).toLinearSpace();root.metadata={vehicle:p.name,kind:'car',modelId:id,revision:MODEL_REVISION,body:'79 Series single-cab trayback',wheelCount:4};}
 else if(p.body==='kart')buildKart(root,p);else if(p.kind==='car')buildRoadExterior(root,p);else if(p.kind==='heli'){if(p.body==='rescue-helicopter')buildRescueHelicopter(root,p);else buildDetailedChopper(root,p);}
 else if(p.kind==='jet')buildFighter(root,p);else if(p.kind==='boat')buildRunabout(root,p,false);else if(p.kind==='bike'){if(p.combustion)buildPetrolMotorcycle(root,p);else if(p.body==='electric-dirt-bike')buildElectricMoto(root,p);else buildBicycle(root,p);}else throw Error('Unknown vehicle model '+id);
 addVehicleCustoms(root,p,id);
 if(p.kind==='car')for(const m of root.getChildMeshes())if(/bumper|mirror|bonnet|grille/.test(m.name)&&!m.parent?.metadata?.crashPart)m.metadata={...m.metadata,crashPart:m.name.includes('mirror')?'mirror':'panel'};
 return root;
}

function buildFighterFlightStick(parent,e){const stick=new Node('fighter-flight-stick',scene);stick.parent=parent;stick.position.set(0,e-.78,-.55);tube('fighter-stick-shaft',[[0,0,0],[0,.29,-.05],[0,.39,-.04]],.022,materials.black,stick);box('fighter-stick-grip',.065,.13,.055,0,.41,-.04,materials.dark,stick);box('fighter-stick-trigger',.025,.025,.02,0,.46,-.075,materials.red,stick);box('fighter-side-throttle',.08,.09,.13,-.36,e-.55,-.46,materials.black,parent);for(const x of [-.16,.16])box('fighter-rudder-pedal',.14,.035,.22,x,e-.85,-1.0,materials.metal,parent);}
