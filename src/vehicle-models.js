// 79 Series single-cab: metre-scale geometry shared by the garage render and FPV.
function buildLandCruiser79(scene,parent,inside=false){
 const {MeshBuilder:MB,TransformNode:Node,StandardMaterial,Color3,Vector3:V,Mesh,VertexData}=Coastal;
 const root=new Node('landcruiser-79-single-cab',scene);root.parent=parent||null;
 function material(name,hex,shine=.1,alpha=1){const m=new StandardMaterial('79-'+name,scene);m.diffuseColor=Color3.FromHexString(hex).toLinearSpace();m.specularColor=new Color3(shine,shine,shine);m.alpha=alpha;return m;}
 const paint=material('sandstone-paint','#bba77d',.35),black=material('rubber-and-trim','#16191c',.05),dark=material('dashboard','#282a2d',.08),steel=material('alloy-tray','#aab1b5',.6),chrome=material('steel-rims','#d4d7d8',.7),glass=material('windows','#385568',.8,inside?.11:.64),headlight=material('headlamps','#e5e8dc',.7),amber=material('indicators','#c98525',.25),red=material('tail-lamps','#922b27',.4),seat=material('cloth-seats','#3a3c3c',.04);
 glass.backFaceCulling=false;
 function box(name,w,h,d,x,y,z,m=paint,p=root){const b=MB.CreateBox('79-'+name,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.material=m;b.parent=p;b.isPickable=false;b.receiveShadows=true;return b;}
 function cylinder(name,d,h,x,y,z,m=black,p=root,segments=24){const b=MB.CreateCylinder('79-'+name,{diameter:d,height:h,tessellation:segments},scene);b.position.set(x,y,z);b.material=m;b.parent=p;b.isPickable=false;return b;}
 function tube(name,points,r,m=black,p=root){const b=MB.CreateTube('79-'+name,{path:points.map(a=>new V(...a)),radius:r,tessellation:8},scene);b.material=m;b.parent=p;b.isPickable=false;return b;}
 function panel(name,points,m){const b=new Mesh('79-'+name,scene),vd=new VertexData(),positions=points.flat(),normals=[];vd.positions=positions;vd.indices=[0,1,2,1,3,2];VertexData.ComputeNormals(positions,vd.indices,normals);vd.normals=normals;vd.uvs=[0,0,1,0,0,1,1,1];vd.applyToMesh(b);b.material=m;b.parent=root;b.isPickable=false;return b;}
 function label(name,text,w,h,x,y,z,colour='#ddd',background='#202326'){
  const texture=new Coastal.DynamicTexture('79-'+name+'-text',{width:512,height:128},scene,false),ctx=texture.getContext();ctx.fillStyle=background;ctx.fillRect(0,0,512,128);ctx.fillStyle=colour;ctx.font='bold 72px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,68);texture.update(false);
  const m=material(name+'-label','#ffffff',.05);m.diffuseTexture=texture;m.backFaceCulling=false;m.emissiveColor=new Color3(.07,.07,.07);const b=MB.CreatePlane('79-'+name,{width:w,height:h},scene);b.position.set(x,y,z);b.rotation.y=Math.PI;b.material=m;b.parent=root;b.isPickable=false;return b;
 }
 // Ladder chassis, axles and springs remain visible under the separate tray.
 for(const x of [-.53,.53])box('chassis-rail',.13,.17,4.28,x,.56,.12,black);
 for(const z of [-1.55,1.63]){const axle=cylinder('solid-axle',.13,1.78,0,.43,z,black);axle.rotation.z=Math.PI/2;cylinder('differential',.27,.25,0,.43,z,black).rotation.z=Math.PI/2;}
 for(const x of [-.56,.56])tube('rear-leaf-spring',[[x,.57,.94],[x,.48,1.63],[x,.57,2.25]],.028,steel);
 const wheels=[];
 for(const side of [-1,1])for(const z of [-1.55,1.63]){
  const wheel=new Node('79-wheel',scene);wheel.parent=root;wheel.position.set(side*.90,.43,z);wheels.push(wheel);
  cylinder('all-terrain-tyre',.82,.27,0,0,0,black,wheel,32).rotation.z=Math.PI/2;
  cylinder('sidewall',.74,.018,side*.143,0,0,black,wheel,32).rotation.z=Math.PI/2;
  cylinder('steel-wheel',.48,.024,side*.16,0,0,chrome,wheel,32).rotation.z=Math.PI/2;
  cylinder('wheel-hub',.15,.075,side*.19,0,0,dark,wheel).rotation.z=Math.PI/2;
  for(let i=0;i<6;i++){const a=i*Math.PI/3;cylinder('rim-hole',.072,.026,side*.18,Math.cos(a)*.165,Math.sin(a)*.165,black,wheel,10).rotation.z=Math.PI/2;cylinder('wheel-nut',.023,.035,side*.207,Math.cos(a)*.103,Math.sin(a)*.103,chrome,wheel,6).rotation.z=Math.PI/2;}
  for(let i=0;i<24;i++){const a=i*Math.PI/12,t=box('tyre-tread',.28,.036,.087,0,Math.cos(a)*.40,Math.sin(a)*.40,black,wheel);t.rotation.x=a;}
 }
 // Single cab and its long, flat bonnet; no stylised SUV body.
 box('cab-lower',1.74,.52,1.44,0,1.06,-.05);box('bonnet',1.65,.16,1.46,0,1.22,-1.64);box('bonnet-centre-pressing',.96,.018,1.29,0,1.31,-1.63);
 box('front-panel',1.72,.47,.12,0,1.03,-2.36);box('front-grille',.91,.30,.035,0,1.08,-2.43,black);
 for(let i=0;i<4;i++)box('grille-slat',.91,.018,.045,0,.963+i*.071,-2.456,chrome);
 label('toyota-grille','TOYOTA',.39,.085,0,1.093,-2.485);
 for(const side of [-1,1]){
  box('headlamp-surround',.38,.29,.046,side*.669,1.09,-2.44,black);box('rectangular-headlamp',.292,.205,.025,side*.650,1.105,-2.473,headlight);box('corner-indicator',.07,.18,.04,side*.843,1.08,-2.467,amber);
  box('front-wing',.20,.20,1.48,side*.85,1.15,-1.62);
  for(let i=0;i<16;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16,zc=-1.55;const arch=panel('wheel-arch',[[side*.957,.43+.49*Math.sin(a),zc+.49*Math.cos(a)],[side*.957,.43+.49*Math.sin(b),zc+.49*Math.cos(b)],[side*.957,.43+.43*Math.sin(a),zc+.43*Math.cos(a)],[side*.957,.43+.43*Math.sin(b),zc+.43*Math.cos(b)]],black);arch.material.backFaceCulling=false;}
  box('front-mudflap',.24,.32,.03,side*.87,.40,-1.06,black);
 }
 box('front-bumper',1.94,.19,.22,0,.72,-2.46,black);tube('bullbar-hoop',[[-.89,.78,-2.54],[-.89,1.18,-2.54],[-.49,1.18,-2.54],[-.40,.85,-2.54],[.40,.85,-2.54],[.49,1.18,-2.54],[.89,1.18,-2.54],[.89,.78,-2.54]],.038,black);
 box('cab-roof',1.80,.075,1.30,0,2.02,.07);box('roof-gutter',1.86,.025,1.34,0,1.991,.07,black);
 for(const side of [-1,1]){
  tube('windscreen-pillar',[[side*.83,1.34,-.94],[side*.79,1.99,-.57]],.035,paint);tube('rear-cab-pillar',[[side*.85,1.30,.72],[side*.81,1.99,.72]],.041,paint);
  box('door-skin',.028,.57,1.26,side*.881,1.03,.01);box('door-gap',.011,.53,.016,side*.901,1.05,.638,black);box('door-handle',.028,.048,.16,side*.909,1.30,.38,black);
  panel('side-window',[[side*.855,1.37,-.82],[side*.855,1.37,.63],[side*.804,1.96,-.53],[side*.804,1.96,.63]],glass);
  box('window-bottom-seal',.045,.045,1.42,side*.876,1.35,-.06,black);tube('mirror-arm',[[side*.89,1.40,-.67],[side*1.12,1.48,-.79]],.018,black);box('door-mirror',.17,.24,.075,side*1.15,1.58,-.80,black);box('mirror-glass',.14,.20,.012,side*1.15,1.58,-.755,chrome);
  box('side-step',.22,.075,1.33,side*.97,.68,.02,black);box('cab-back',.13,.60,.08,side*.78,1.68,.74,paint);
 }
 box('cab-back-panel',1.72,.36,.08,0,1.50,.74);box('rear-cab-window',1.34,.37,.016,0,1.79,.79,glass);
 if(!inside)panel('front-windscreen',[[-.795,1.37,-.925],[.795,1.37,-.925],[-.758,1.98,-.576],[.758,1.98,-.576]],glass);
 box('windscreen-header',1.64,.055,.07,0,1.98,-.57,paint);
 for(const x of [-.45,.35])tube('windscreen-wiper',[[x,1.36,-.969],[x+.24,1.39,-.972]],.008,black);
 tube('snorkel',[[.91,1.18,-1.33],[.94,1.36,-.93],[.91,1.98,-.60]],.055,black);box('snorkel-intake',.17,.13,.19,.91,2.055,-.63,black);
 // Alloy drop-side tray and full-height headboard behind the cab.
 box('tray-deck',1.98,.12,2.02,0,.99,1.75,steel);box('tray-floor',1.86,.028,1.93,0,1.068,1.75,steel);
 for(const side of [-1,1]){
  box('tray-drop-side',.045,.31,2.04,side*.999,1.20,1.75,steel);box('tray-top-rail',.065,.042,2.09,side*1.002,1.375,1.75,chrome);
  for(let i=0;i<6;i++)box('tray-rib',.012,.022,1.94,side*(.12+i*.13),1.09,1.75,chrome);
  for(const z of [1.09,2.35])box('tray-latch',.025,.09,.07,side*1.028,1.30,z,black);
  box('headboard-post',.055,.92,.065,side*.965,1.55,.74,steel);box('rear-mudguard',.32,.07,.98,side*.90,.94,1.63,black);box('rear-mudflap',.30,.38,.04,side*.90,.41,2.11,black);
 }
 box('headboard-top',1.98,.055,.07,0,2.0,.74,steel);for(let i=-4;i<=4;i++)box('headboard-mesh',.013,.62,.017,i*.19,1.64,.74,steel);
 box('tray-tailgate',1.98,.31,.05,0,1.20,2.78,steel);box('rear-light-bar',1.83,.14,.11,0,.81,2.77,black);for(const side of [-1,1]){box('tail-light',.22,.11,.025,side*.68,.82,2.84,red);box('rear-indicator',.10,.11,.026,side*.85,.82,2.842,amber);}
 box('rear-number-plate',.30,.11,.025,0,.81,2.84,headlight);box('tow-hitch',.11,.10,.29,0,.59,2.85,black);
 // Cabin is positioned in ground coordinates; FPV is at x=.49, eye height=1.72 m.
 box('cabin-floor',1.67,.08,1.50,0,.72,.05,black);for(const x of [-.47,.47]){box('seat-cushion',.58,.14,.53,x,.94,.25,seat);box('seat-back',.58,.61,.13,x,1.27,.53,seat);box('head-rest',.30,.20,.12,x,1.69,.52,seat);}
 box('rugged-dashboard',1.65,.24,.38,0,1.20,-.81,dark);box('dash-top-pad',1.69,.045,.48,0,1.345,-.82,black);box('instrument-binnacle',.61,.24,.11,.49,1.416,-.91,black);box('glovebox',.51,.18,.015,-.49,1.21,-.606,dark);box('glovebox-handle',.10,.018,.017,-.49,1.25,-.592,black);
 for(const x of [-.71,-.22,.02,.79]){box('rectangular-vent',.13,.085,.018,x,1.30,-.606,black);for(let i=0;i<4;i++)box('vent-slat',.11,.006,.012,x,1.273+i*.018,-.591,steel);}
 box('radio',.27,.10,.022,-.10,1.19,-.594,black);box('radio-screen',.13,.037,.008,-.10,1.21,-.578,glass);for(const x of [-.205,.005])cylinder('radio-knob',.025,.016,x,1.185,-.578,black).rotation.x=Math.PI/2;
 for(let i=0;i<3;i++)cylinder('climate-knob',.041,.025,-.20+i*.095,1.07,-.575,black).rotation.x=Math.PI/2;
 const steering=new Node('79-steering-wheel',scene);steering.parent=root;steering.position.set(.49,1.28,-.49);steering.rotation.x=-.28;
 const rim=MB.CreateTorus('79-steering-rim',{diameter:.40,thickness:.027,tessellation:36},scene);rim.rotation.x=Math.PI/2;rim.material=black;rim.parent=steering;rim.isPickable=false;
 for(const side of [-1,1])box('wheel-spoke',.135,.034,.026,side*.11,-.006,0,dark,steering);box('wheel-spoke-lower',.04,.15,.025,0,-.09,0,dark,steering);box('horn-pad',.13,.075,.045,0,0,.014,black,steering);
 tube('gear-stick',[[-.16,.80,-.05],[-.16,1.11,-.13],[-.16,1.22,-.23]],.015,black);const knob=MB.CreateSphere('79-manual-gear-knob',{diameter:.064,segments:12},scene);knob.position.set(-.16,1.235,-.23);knob.material=black;knob.parent=root;knob.isPickable=false;tube('transfer-stick',[[-.31,.80,-.06],[-.31,1.01,-.18]],.012,black);cylinder('transfer-knob',.042,.042,-.31,1.026,-.18,black);
 box('roof-interior',1.68,.04,1.17,0,1.966,.10,dark);box('rearview-mirror',.23,.07,.035,0,1.845,-.51,black);box('rearview-glass',.205,.047,.01,0,1.845,-.486,chrome);box('driver-sun-visor',.42,.022,.23,.48,1.94,-.40,dark);
 // Merge static parts by material to keep the driving scene inexpensive.
 const groups=new Map();for(const mesh of root.getChildMeshes()){if(mesh.parent!==root||!mesh.material)continue;const key=mesh.material;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);}
 for(const [m,parts] of groups){if(parts.length<2)continue;const merged=Mesh.MergeMeshes(parts,true,true,undefined,false,false);if(merged){merged.name='79-batched-'+m.name;merged.parent=root;merged.material=m;merged.isPickable=false;merged.receiveShadows=true;}}
 root.metadata={vehicle:'LandCruiser 79 Series',wheelbase:3.18,bodyStyle:'single cab alloy tray',eyeHeight:1.72};return{root,steering,wheels};
}
