"""Repair supplied mesh data without changing its silhouette or increasing detail.

Source rescue geometry has one untextured material: its finish is inferred from
surface position, not an authored ADAC texture or surveyed aircraft markings.
"""
from pathlib import Path
import gzip, json, math
ROOT = Path(__file__).resolve().parents[1]

def normal_of(points):
    a, b, c = points
    u = [b[k]-a[k] for k in range(3)]; v = [c[k]-a[k] for k in range(3)]
    n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
    size = math.sqrt(sum(x*x for x in n))
    return [x/size for x in n] if size > 1e-10 else None

def rescue_region(points, part):
    x, y, z = [sum(p[k] for p in points)/3 for k in range(3)]
    n = normal_of(points) or [0, 1, 0]
    span = max(p[1] for p in points)-min(p[1] for p in points)
    # Preserve the fixed mast and aft fin. Small tessellated blade faces were
    # incorrectly left in the body by the original long-edge-only classifier.
    plane_error = max(abs(p[1]-(-.0198*p[0]+.0454*p[2]+3.716)) for p in points)
    outer_blade = (abs(x)>1.8 or z< -3.7) and min(p[1] for p in points)>3.0 and plane_error<.27
    inner_blade = -.3<y-3.716<.38 and -3.7<z<2.6 and plane_error<.14 and math.hypot(x,z+.6)>.55
    aft_blade = z>2.6 and min(p[1] for p in points)>3.0 and ((abs(x)>.7 and abs(n[1])>.35 and plane_error<.27) or (abs(n[1])>.65 and plane_error<.12))
    rotor = part == 'main-rotor' or outer_blade or inner_blade or aft_blade
    if rotor: return 'main-rotor', 'rotor'
    if y < .50 or (y < .95 and abs(x)>.8): return 'body', 'skids'
    if y>3.22 and abs(x)<.65 and -1.4<z<.5: return 'body', 'mechanical'
    window = 1.72<y<2.66 and abs(n[1])<.72 and ((-3.85<z< -1.45 and (abs(x)>.22 or n[2]< -.45)) or (-1.45<=z<.78 and abs(x)>.80 and abs(n[0])>.55))
    if window:return 'body', 'windows'
    return 'body', 'airframe'

RESCUE_MATERIALS = [
 {'name':'rescue-airframe-paint','color':[.82,.59,.025,1],'roughness':.32,'metallic':.05},
 {'name':'rescue-windowglass','color':[.12,.19,.23,.25],'glass':True,'roughness':.12},
 {'name':'rescue-rotor-carbon','color':[.035,.04,.045,1],'roughness':.75},
 {'name':'rescue-skids-metal','color':[.14,.16,.18,1],'roughness':.42,'metallic':.7},
 {'name':'rescue-mechanical','color':[.12,.13,.14,1],'roughness':.45,'metallic':.6}]
REGIONS = dict(zip(['airframe','windows','rotor','skids','mechanical'],range(5)))

def soften_rescue_normals(d):
    before = sum(len(m['p'])//3 for m in d['meshes'])
    for level in ['meshes','lowMeshes']:
        for m in d[level]:
            buckets = {}
            for i in range(len(m['p'])//3):
                key = tuple(m['p'][i*3:i*3+3]); n = m['n'][i*3:i*3+3]
                groups = buckets.setdefault(key, [])
                group = next((g for g in groups if sum(a*b for a,b in zip(g['axis'],n))>.766044443), None)
                if group is None:group={'axis':n[:], 'sum':[0.,0.,0.], 'ids':[]};groups.append(group)
                group['ids'].append(i)
                for k in range(3):group['sum'][k]+=n[k]
            for groups in buckets.values():
                for g in groups:
                    length=math.sqrt(sum(x*x for x in g['sum'])) or 1
                    normal=[round(x/length,6) for x in g['sum']]
                    for i in g['ids']:m['n'][i*3:i*3+3]=normal
            # Weld only identical attributes, preserving sharp edges and UV seams.
            out={a:[] for a in ['p','n','uv','c','i']};lookup={}
            for i in m['i']:
                value=tuple(m[a][i*step+k] for a,step in [('p',3),('n',3),('uv',2),('c',4)] for k in range(step))
                if value not in lookup:
                    lookup[value]=len(out['p'])//3
                    for a,step in [('p',3),('n',3),('uv',2),('c',4)]:out[a].extend(m[a][i*step:i*step+step])
                out['i'].append(lookup[value])
            m.update(out)
    d['normalRepair']={'creaseDegrees':40,'beforeVertices':before,'afterVertices':sum(len(m['p'])//3 for m in d['meshes'])}

def refine(d):
    if d.get('finishRevision'):
        if d['key']=='rescue' and d['finishRevision']<2:
            soften_rescue_normals(d);d['finishRevision']=2;return True
        return False
    stats={}
    for level in ['meshes','lowMeshes']:
        groups={}; seen=set(); removed=0
        for mesh in d[level]:
            for j in range(0,len(mesh['i']),3):
                ids=mesh['i'][j:j+3]; pts=[mesh['p'][i*3:i*3+3] for i in ids]
                if not normal_of(pts):removed+=1;continue
                # Same winding only: deliberately double-sided lamp shells stay.
                coordinates=[tuple(round(x,5) for x in p) for p in pts]
                signature=(mesh['part'],mesh['material'],min(tuple(coordinates[k:]+coordinates[:k]) for k in range(3)))
                if signature in seen:removed+=1;continue
                seen.add(signature)
                part,material=mesh['part'],mesh['material']
                if d['key']=='rescue':part,region=rescue_region(pts,part);material=REGIONS[region]
                target=groups.setdefault((part,material),dict(part=part,material=material,p=[],n=[],uv=[],c=[],i=[],lookup={}))
                for i in ids:
                    values=tuple(mesh[a][i*s:i*s+s][k] for a,s in [('p',3),('n',3),('uv',2),('c',4)] for k in range(s))
                    lookup=target['lookup']
                    if values not in lookup:
                        lookup[values]=len(target['p'])//3
                        for a,s in [('p',3),('n',3),('uv',2),('c',4)]:target[a].extend(mesh[a][i*s:i*s+s])
                    target['i'].append(lookup[values])
        d[level]=list(groups.values())
        for m in d[level]:del m['lookup']
        stats[level]=removed
    if not any(stats.values()) and d['key']!='rescue':return False
    if d['key']=='rescue':d['materials']=RESCUE_MATERIALS;d['finishNote']='Inferred yellow rescue finish and glazing; source has no authored textures.'
    d['triangles']=sum(len(m['i'])//3 for m in d['meshes']);d['lowTriangles']=sum(len(m['i'])//3 for m in d['lowMeshes']);d['finishRevision']=1;d['removedFaces']=stats
    if d['key']=='rescue':soften_rescue_normals(d);d['finishRevision']=2
    return True

if __name__=='__main__':
    for path in sorted((ROOT/'assets/life-models').glob('*.json.gz')):
        d=json.loads(gzip.decompress(path.read_bytes()))
        if refine(d):path.write_bytes(gzip.compress(json.dumps(d,separators=(',',':')).encode(),compresslevel=9,mtime=0))
        print(d['key'],d['triangles'],d.get('removedFaces'),flush=True)
