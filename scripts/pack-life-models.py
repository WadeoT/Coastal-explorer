"""Pack Blender-converted, user-supplied geometry/textures for offline loading."""
from pathlib import Path
from PIL import Image
import sys,json,base64,io,gzip,importlib.util
spec=importlib.util.spec_from_file_location("wheel_pivots",Path(__file__).parent/"life-wheel-pivots.py");wheels=importlib.util.module_from_spec(spec);spec.loader.exec_module(wheels)
root=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]);dest=root/'assets/life-models'
paths=sorted(source.glob('*/model.json'))
if not paths:raise SystemExit('No converted models found; pass the folder containing <key>/model.json exports.')
for p in paths:
 d=json.loads(p.read_text());textures={}
 for m in d['materials']:
  name=m.pop('texture',None)
  if name:
   if name not in textures:
    im=Image.open(p.parent/name);im.thumbnail((1024,1024),Image.Resampling.LANCZOS);out=io.BytesIO();alpha=im.mode=='RGBA' and im.getextrema()[3][0]<255
    if alpha:im.save(out,format='PNG',optimize=True);mime='image/png'
    else:im.convert('RGB').save(out,format='JPEG',quality=83,optimize=True);mime='image/jpeg'
    textures[name]='data:'+mime+';base64,'+base64.b64encode(out.getvalue()).decode()
   m['texture']=name
 d['textures']=textures
 # Canonicalise duplicate imported material slots before batching.
 unique=[];slots={};remap={}
 for i,m in enumerate(d['materials']):
  paint=any(k in m['name'].lower() for k in ['paint','primary'])
  signature=json.dumps({k:v for k,v in m.items() if k!='name'},sort_keys=True)+str(paint)
  if signature not in slots:slots[signature]=len(unique);unique.append(m)
  remap[i]=slots[signature]
 d['materials']=unique
 merged={}
 for m in d['meshes']:
  material=remap[m['material']];key=(material,m['part'])
  b=merged.setdefault(key,dict(material=material,part=m['part'],p=[],n=[],uv=[],c=[],i=[]));offset=len(b['p'])//3
  for attr in ['p','n','uv','c']:b[attr].extend(m[attr])
  b['i'].extend(i+offset for i in m['i'])
 d['meshes']=list(merged.values())
 # Align front-face winding with supplied normals after baked source transforms.
 for m in d['meshes']:
  for j in range(0,len(m['i']),3):
   ids=m['i'][j:j+3];p0,p1,p2=[m['p'][i*3:i*3+3] for i in ids];u=[p1[k]-p0[k] for k in range(3)];v=[p2[k]-p0[k] for k in range(3)];cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];n=[sum(m['n'][i*3+k] for i in ids) for k in range(3)]
   if sum(cross[k]*n[k] for k in range(3))<0:m['i'][j+1],m['i'][j+2]=m['i'][j+2],m['i'][j+1]

 if d['key']=='hornet':
  for m in d['meshes']:
   if m['part']!='body':continue
   gear=[];body=[]
   for j in range(0,len(m['i']),3):
    ids=m['i'][j:j+3];x=sum(m['p'][i*3] for i in ids)/3;y=sum(m['p'][i*3+1] for i in ids)/3
    (gear if y<1.15 and abs(x)<2.25 else body).extend(ids)
   if gear:
    d['meshes'].append({**m,'part':'landing-gear','i':gear});m['i']=body
  d['meshes']=[m for m in d['meshes'] if m['i']]
 if d['key']=='rescue':
  # The source tail (including its tall fin) points towards -Z; reverse it.
  for m in list(d['meshes']):
   if m['part']=='main-rotor':
    rotor=[];fixed=[]
    for j in range(0,len(m['i']),3):
     ids=m['i'][j:j+3];y=sum(m['p'][i*3+1] for i in ids)/3
     (rotor if y>3.72 else fixed).extend(ids)
    m['i']=rotor
    if fixed:d['meshes'].append({**m,'part':'body','i':fixed})
  for m in d['meshes']:
   for i in range(0,len(m['p']),3):m['p'][i]*=-1;m['p'][i+2]*=-1;m['n'][i]*=-1;m['n'][i+2]*=-1
  lo=d['bounds']['min'];hi=d['bounds']['max'];d['bounds']={'min':[-hi[0],lo[1],-hi[2]],'max':[-lo[0],hi[1],-lo[2]]}
 if d['key']=='hilux':
  for m in d['meshes']:
   for i in range(0,len(m['p']),3):m['p'][i]*=-1;m['p'][i+2]*=-1;m['n'][i]*=-1;m['n'][i+2]*=-1
   if m['part'].startswith('life-wheel-'):
    part=m['part'];m['part']='life-wheel-'+('R' if part[-2]=='F' else 'F')+('R' if part[-1]=='L' else 'L')
  lo=d['bounds']['min'];hi=d['bounds']['max'];d['bounds']={'min':[-hi[0],lo[1],-hi[2]],'max':[-lo[0],hi[1],-lo[2]]}

 # Remove unreferenced vertices after separating moving/fixed assemblies.
 compact=[]
 for m in d['meshes']:
  if not m['i']:continue
  b={**m,'p':[],'n':[],'uv':[],'c':[],'i':[]};lookup={}
  for original in m['i']:
   if original not in lookup:
    lookup[original]=len(b['p'])//3
    for attr,step in [('p',3),('n',3),('uv',2),('c',4)]:b[attr].extend(m[attr][original*step:original*step+step])
   b['i'].append(lookup[original])
  compact.append(b)
 d['meshes']=compact
 wheels.bind_wheels(d)
 dest.mkdir(exist_ok=True);(dest/(d['key']+'.json')).write_text(json.dumps(d,separators=(',',':')))
 print(d['key'],d['triangles'],'triangles',len(textures),'textures')
