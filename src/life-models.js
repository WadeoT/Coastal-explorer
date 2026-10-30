// Uploaded models are bundled as data, decoded lazily, and built synchronously.
const LIFE_MODEL_ASSETS=/*__LIFE_MODEL_ASSETS__*/{};
const lifeModelCache=new Map(),lifeTextureCache=new Map();
let lifeReflectionTexture=null,lifeReflectionKey='';
function lifeModelData(key){if(lifeModelCache.has(key))return lifeModelCache.get(key);const encoded=LIFE_MODEL_ASSETS[key];if(!encoded)return null;const raw=atob(encoded),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),data=JSON.parse(Coastal.strFromU8(Coastal.decompressSync(bytes)));for(const mesh of [...data.meshes,...data.lowMeshes]){for(const attr of ['p','n','uv','c'])mesh[attr]=Float32Array.from(mesh[attr]);mesh.i=Uint32Array.from(mesh.i);}lifeModelCache.set(key,data);return data;}
function installLifeProfiles(){
 const set=(id,key,values)=>Object.assign(profiles[id],values,{lifeModel:key});
 set('ute','cruiser',{name:'Toyota Land Cruiser J50 (1975)',short:'LAND CRUISER J50 · 1975',body:'suv',length:4.675,width:1.85,wheelbase:2.7,height:1.8,eye:1.43,lifeCamera:{x:-.42,z:.05},manual:true,gears:4,transmission:'4-speed manual'});
 set('drift','i20',{name:'Hyundai i20 (2010)',short:'HYUNDAI i20 · 2010',length:3.94,width:1.71,wheelbase:2.525,height:1.65,eye:1.17,lifeCamera:{x:-.4,z:0}});
 set('hilux','hilux',{name:'Toyota Hilux (2022)',short:'TOYOTA HILUX · 2022',length:5.325,width:1.86,wheelbase:3.085,height:1.85,eye:1.48,manual:false,gears:6,transmission:'6-speed automatic',lifeCamera:{x:.42,z:-.12}});
 set('patrol','patrol',{name:'Nissan Patrol Y60',short:'NISSAN PATROL Y60',length:4.24,width:1.93,wheelbase:2.4,height:1.84,eye:1.48,price:28000,lifeCamera:{x:-.43,z:0},manual:true,gears:5,transmission:'5-speed manual'});
 profiles.lifePorsche={...profiles.mustang,modelId:'lifePorsche',brand:'Porsche',name:'Porsche 911 GT3 RS · Carrera Tribute (2023)',short:'911 GT3 RS · CARRERA TRIBUTE',lifeModel:'porsche',body:'coupe',length:4.572,width:1.90,wheelbase:2.457,height:1.365,eye:1.06,clearance:.23,mass:1450,power:386000,force:10500,top:296/3.6,price:480000,colour:'#e8e8e3',lifeCamera:{x:-.4,z:0},transmission:'7-speed automatic',manual:false,gears:7};
 profiles.lifeBmw={...profiles.commodore,modelId:'lifeBmw',brand:'BMW',name:'BMW M3 Competition Touring G81',short:'BMW M3 COMPETITION · G81',lifeModel:'bmw',body:'wagon',length:4.794,width:1.903,wheelbase:2.857,height:1.48,eye:1.12,clearance:.25,mass:1865,power:375000,force:11000,top:280/3.6,price:150000,colour:'#84888d',lifeCamera:{x:-.42,z:0},transmission:'8-speed automatic',manual:false,gears:8};
 profiles.lifeJeep={...profiles.hilux,modelId:'lifeJeep',brand:'Jeep',name:'Jeep Gladiator (2020)',short:'JEEP GLADIATOR · 2020',lifeModel:'jeep',body:'ute',length:5.537,width:1.90,wheelbase:3.487,height:1.90,eye:1.51,clearance:.46,mass:2350,power:209000,top:180/3.6,price:65000,colour:'#9a9b90',manual:false,gears:8,transmission:'8-speed automatic',lifeCamera:{x:-.43,z:-.10}};
 profiles.adac={...profiles.lifeflight,modelId:'adac',brand:'ADAC',name:'ADAC Rescue Helicopter',short:'ADAC · RESCUE HELICOPTER',lifeModel:'rescue',length:12.2,width:2.5,height:4.06,eye:2.3,gearType:'skids',price:950000,colour:'#dfcf2f',rescue:true};
 set('jet','hornet',{name:'Boeing F/A-18E/F Super Hornet',short:'F/A-18E/F SUPER HORNET',length:18.31,width:13.62,height:3.915});
}
function lifeModelTexture(key,name,data){const id=key+':'+name;if(lifeTextureCache.has(id))return lifeTextureCache.get(id);const uri=data.textures[name];if(!uri)return null;const texture=new Coastal.Texture(uri,scene,false,true);texture.name='life-texture-'+id;texture.hasAlpha=uri.startsWith('data:image/png');texture.anisotropicFilteringLevel=4;keepSurfaceTexture(texture,'life:'+id);lifeTextureCache.set(id,texture);return texture;}
// Material semantics remain separate from animation groups and source attribution.
function lifeMaterialRole(key,d){
 const name=d.name||'';
 if(/mirror|oglinzi/i.test(name))return 'mirror';
 if(d.glass){if(/red|orange|lamp|light|indicator|clearglass|saphir|glass_clear/i.test(name))return 'lens';return 'window';}
 if(/interior|torpeda|krisla|seat|carpet|fabric|leather/i.test(name))return 'interior';
 if(/tire|tyre|rubber|negru|rotor.carbon/i.test(name))return 'rubber';
 if(/chrome|rim|alloy|alu_ext|skids.metal/i.test(name))return 'metal';
 if(/primary|carpaint|paint_material|airframe.paint|base paint|darker paint/i.test(name)||key==='bmw'&&name==='m3g81law')return 'paint';
 return 'detail';
}
function makeLifeMaterial(data,d,p,id){
 const role=lifeMaterialRole(data.key,d),paint=role==='paint',glass=role==='window',lens=role==='lens',mirror=role==='mirror',m=new StandardMaterial('life-'+(paint?'bodywork-':'')+data.key+'-'+d.name,scene),c=d.color||[.7,.7,.7,1];
 m.diffuseColor=new C(c[0],c[1],c[2]);m.backFaceCulling=!glass&&!lens&&role!=='interior';m.sideOrientation=1;m.alpha=1;
 if(paint&&!d.texture)m.diffuseColor=new C(...c.slice(0,3).map(v=>clamp(v,.045,.74)));
 if(role==='interior'&&!d.texture)m.diffuseColor=new C(...c.slice(0,3).map(v=>clamp(v*.65,.04,.26)));
 if(role==='rubber')m.diffuseColor=new C(...c.slice(0,3).map(v=>clamp(v,.025,.10)));
 if(glass){m.diffuseColor=new C(.25,.32,.38);m.alpha=.23;m.transparencyMode=2;m.needDepthPrePass=true;m.separateCullingPass=true;}
 if(lens){m.alpha=/red|orange/i.test(d.name)?.88:.72;m.transparencyMode=2;m.needDepthPrePass=true;if(!/red|orange/i.test(d.name))m.diffuseColor=new C(.67,.72,.77);}
 if(mirror){m.diffuseColor=new C(.53,.58,.62);m.alpha=1;m.backFaceCulling=false;}
 if(d.texture){m.diffuseTexture=lifeModelTexture(data.key,d.texture,data);if(m.diffuseTexture?.hasAlpha&&!glass&&!lens&&/grille|badge|logo|sign|alpha|number|plate/i.test(d.name)){m.useAlphaFromDiffuseTexture=true;m.transparencyMode=1;}}
 const base=stockProfiles[id];if(paint&&base&&p.colour!==base.colour)m.diffuseColor=C.FromHexString(p.colour);
 const reflective=paint||glass||lens||mirror||role==='metal'||(d.metallic||0)>.65&&role!=='interior'&&role!=='rubber';
 m.specularColor=role==='rubber'?new C(.025,.027,.03):role==='interior'?new C(.055,.055,.055):new C(.34,.36,.38);
 m.specularPower=paint?112:glass||mirror?180:role==='rubber'?12:lerp(140,24,clamp(d.roughness??.4,0,1));
 m.metadata={lifeModel:data.key,sourceMaterial:d.name,reflective,surfaceRole:role};
 if(reflective&&!performanceLow){m.reflectionTexture=lifeEnvironmentMap();m.roughness=clamp(d.roughness??.4,.12,.85);const f=new Coastal.FresnelParameters();f.leftColor=new C(mirror?.16:.025,mirror?.16:.025,mirror?.16:.025);const edge=mirror?.65:glass?.32:lens?.26:role==='metal'?.4:.23;f.rightColor=new C(edge,edge,edge);f.power=3;m.reflectionFresnelParameters=f;}
 return m;
}
function buildLifeModel(root,p,id){
 const data=lifeModelData(p.lifeModel);if(!data)return false;const low=!root.metadata?.forceLifeHigh&&(/^(traffic-model-|remote-|interceptor|shared-police)/.test(root.name)||performanceLow&&!/^(player-exterior|showroom-vehicle|hijacked-exterior)/.test(root.name)),meshes=low?data.lowMeshes:data.meshes,parts=new Map(),materialMap=new Map();
 const materialFor=index=>{if(materialMap.has(index))return materialMap.get(index);const m=makeLifeMaterial(data,data.materials[index]||{name:'default',color:[.5,.5,.5,1]},p,id);materialMap.set(index,m);return m;};
 for(const name of new Set(meshes.map(m=>m.part))){if(name==='body')continue;const members=meshes.filter(m=>m.part===name),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const m of members)for(let i=0;i<m.p.length;i++){const k=i%3;min[k]=Math.min(min[k],m.p[i]);max[k]=Math.max(max[k],m.p[i]);}const node=new Node(name.startsWith('life-wheel-')?'road-wheel':'life-'+name,scene);node.parent=root;node.position.set((min[0]+max[0])/2,(min[1]+max[1])/2,(min[2]+max[2])/2);if(name.startsWith('life-wheel-'))node.metadata={wheel:true,radius:clamp((max[1]-min[1])/2,.12,.65),steer:name.includes('-F')};else if(name==='main-rotor'){node.metadata={lifeRotor:true};exteriorRotor=node;}else node.metadata={crashPart:'panel',lifeGear:name==='landing-gear',baseY:node.position.y};parts.set(name,node);}
 for(const source of meshes){const parent=parts.get(source.part)||root,indices=source.i;let positions=[],normals=[],uvs=[],colours=[],out=[],lookup=new Map(),chunk=0;const flush=()=>{if(!out.length)return;if(colours.length!==positions.length/3*4)throw Error('Invalid imported colour buffer '+data.key+': '+positions.length+'/'+colours.length);const mesh=new Mesh('life-model-'+data.key+'-'+source.part+'-'+source.material+'-'+chunk++,scene),vd=new VertexData();vd.positions=positions;vd.normals=normals;vd.uvs=uvs;vd.colors=colours;vd.indices=out;vd.applyToMesh(mesh,true);mesh.parent=parent;mesh.material=materialFor(source.material);mesh.isPickable=false;mesh.metadata={lifeModel:data.key,sourcePart:source.part};positions=[];normals=[];uvs=[];colours=[];out=[];lookup=new Map();};
  for(let i=0;i<indices.length;i+=3){if(lookup.size>8900)flush();for(let j=0;j<3;j++){const original=indices[i+j];let next=lookup.get(original);if(next===undefined){next=positions.length/3;lookup.set(original,next);for(let k=0;k<3;k++){positions.push(source.p[original*3+k]-(parent===root?0:parent.position.asArray()[k]));normals.push(source.n[original*3+k]);}uvs.push(source.uv[original*2],source.uv[original*2+1]);colours.push(...source.c.slice(original*4,original*4+4));}out.push(next);}}flush();
 }
 root.metadata={...root.metadata,modelId:id,vehicle:p.name,kind:p.kind,lifeModel:data.key,lifeDetail:low?'low':'high',mainRotor:parts.get('main-rotor'),gearRoot:parts.get('landing-gear'),body:'uploaded model'};return true;
}
const LIFE_MODEL_CREDITS=/*__LIFE_MODEL_CREDITS__*/{models:[]};
function initialiseLifeModelCredits(panel){if($('lifeModelCredits'))return;createGameDialog('lifeModelCredits','Model sources & credits','<div id="lifeModelCreditRows"></div>');const dialog=$('lifeModelCredits').querySelector('.dialog');dialog.style.maxHeight='85vh';dialog.style.overflowY='auto';const target=$('lifeModelCreditRows');for(const item of LIFE_MODEL_CREDITS.models){const p=document.createElement('p'),title=document.createElement('strong');title.textContent=item.title;p.append(title,document.createElement('br'));if(item.author)p.append(document.createTextNode(item.author+' · '));for(const [url,label]of [[item.source,'Original model'],[item.authorUrl,'Creator'],[item.licenseUrl,item.license]])if(url){const a=document.createElement('a');a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';p.append(a,document.createTextNode(' · '));}if(item.note)p.append(document.createTextNode(item.note));target.append(p);}const note=document.createElement('p');note.textContent=LIFE_MODEL_CREDITS.changes;target.append(note);const button=document.createElement('button');button.className='source-btn';button.textContent='MODEL CREDITS';button.onclick=()=>openModal('lifeModelCredits');panel.append(button);}

function lifeEnvironmentMap(){if(lifeReflectionTexture)return lifeReflectionTexture;lifeReflectionTexture=new Coastal.RawCubeTexture(scene,null,32,5,0,true,false,3);lifeReflectionTexture.name='shared-life-reflections';lifeReflectionTexture.level=.36;keepSurfaceTexture(lifeReflectionTexture,'life-reflections');updateLifeReflections();return lifeReflectionTexture;}
function updateLifeReflections(){if(!lifeReflectionTexture)return;const day=clamp((Math.sin((worldUpgrade.time-.25)*TAU)+.15)/.8,0,1),key=Math.round(day*12)+':'+worldUpgrade.weather;if(key===lifeReflectionKey)return;lifeReflectionKey=key;const faces=[],bad=['storm','fog','rain'].includes(worldUpgrade.weather)?.70:1;for(let f=0;f<6;f++){const bytes=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const u=(x+.5)/16-1,v=(y+.5)/16-1,dir=([[1,-v,-u],[-1,-v,u],[u,1,v],[u,-1,-v],[u,-v,1],[-u,-v,-1]])[f],n=Math.hypot(...dir),up=dir[1]/n,t=clamp(up,0,1),ground=clamp(-up*3,0,1),i=(y*32+x)*4;for(let k=0;k<3;k++){const horizon=[188,196,202][k],sky=[85,139,190][k],earth=[72,75,69][k],lit=lerp(lerp(horizon,sky,t),earth,ground);bytes[i+k]=Math.round(lerp([5,8,14][k],lit*bad,day));}bytes[i+3]=255;}faces.push(bytes);}lifeReflectionTexture.update(faces,5,0,false);}
