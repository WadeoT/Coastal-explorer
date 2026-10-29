"""Rebind only tyre/rim cylinders; source wheel materials are also used on chassis."""
import math
SPECS={'cruiser':(2.7,1.85,.39),'i20':(2.525,1.71,.32),'hilux':(3.085,1.86,.45),'patrol':(2.4,1.93,.42),'porsche':(2.457,1.9,.37),'bmw':(2.857,1.903,.37),'jeep':(3.487,1.9,.43)}
def bind_wheels(d):
 if d['key'] not in SPECS:return
 wb,width,radius=SPECS[d['key']];centres={}
 for part in ['FL','FR','RL','RR']:
  candidates=[]
  for m in d['meshes']:
   if m['part']!='life-wheel-'+part:continue
   used=set(m['i']);lo=[min(m['p'][i*3+k] for i in used) for k in range(3)];hi=[max(m['p'][i*3+k] for i in used) for k in range(3)];size=[b-a for a,b in zip(lo,hi)];at=[(a+b)/2 for a,b in zip(lo,hi)]
   if .02<size[0]<.65 and .18<size[1]<1.1 and .18<size[2]<1.1 and .65<size[1]/size[2]<1.5 and .12<at[1]<.8 and abs(at[0])>.5 and abs(at[2])>wb*.25:candidates.append((min(size[1],size[2]),at,max(size[1],size[2])/2))
  if candidates:
   _,at,r=max(candidates,key=lambda c:c[0]);centres[part]={'p':at,'r':max(radius,r)}
 for part in ['FL','FR','RL','RR']:
  if part in centres:continue
  other=part[0]+('R' if part[1]=='L' else 'L')
  if other in centres:
   at=centres[other]['p'][:];at[0]*=-1;centres[part]={'p':at,'r':centres[other]['r']};continue
  other=('R' if part[0]=='F' else 'F')+part[1]
  if other in centres:
   at=centres[other]['p'][:];at[2]+=(-wb if part[0]=='F' else wb);centres[part]={'p':at,'r':centres[other]['r']};continue
  centres[part]={'p':[(-1 if part[1]=='L' else 1)*width*.43,radius,(-1 if part[0]=='F' else 1)*wb*.5],'r':radius}
 merged={}
 for source_index,m in enumerate(d['meshes']):
  for j in range(0,len(m['i']),3):
   ids=m['i'][j:j+3];p=[m['p'][i*3:i*3+3] for i in ids];at=[sum(v[k] for v in p)/3 for k in range(3)];part='body' if m['part'].startswith('life-wheel-') else m['part']
   for wheel,c in centres.items():
    x,y,z=c['p'];r=c['r']+.018
    if abs(at[0]-x)<.27 and math.hypot(at[1]-y,at[2]-z)<r*1.02 and all(abs(v[0]-x)<.32 and math.hypot(v[1]-y,v[2]-z)<r*1.12 for v in p):part='life-wheel-'+wheel;break
   key=(m['material'],part);b=merged.setdefault(key,dict(material=m['material'],part=part,p=[],n=[],uv=[],c=[],i=[],lookup={}))
   for vi in ids:
    token=(source_index,vi)
    if token not in b['lookup']:
     b['lookup'][token]=len(b['p'])//3
     for attr,step in [('p',3),('n',3),('uv',2),('c',4)]:b[attr].extend(m[attr][vi*step:vi*step+step])
    b['i'].append(b['lookup'][token])
 for b in merged.values():del b['lookup']
 d['meshes']=list(merged.values());d['wheelPivots']=centres
