#!/usr/bin/env python3
"""Prepare real OSM coast clipping, water and building data (development only).
Requires numpy, Pillow and shapely>=2.1. Existing DEM measurements are reused.
"""
import argparse, array, base64, concurrent.futures, gzip, hashlib, json, math, statistics, sys, urllib.request
from pathlib import Path
import numpy as np
import shapely as sh
from shapely.geometry import Polygon, LineString, Point, box
from shapely.ops import unary_union, polygonize, linemerge

ROOT=Path(__file__).resolve().parents[1]
SOUTH,WEST,NORTH,EAST=-26.98,152.50,-26.10,153.22
LAT0,LON0=-26.68,153.05
MLAT=111320; MLON=MLAT*math.cos(math.radians(LAT0)); N=256

def local(lon,lat):return ((lon-LON0)*MLON,(LAT0-lat)*MLAT)
def tile_at(lat,lon):return ((lon+180)/360*4096,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*4096)
def tile_geo(x,y):return (x/4096*360-180,math.degrees(math.atan(math.sinh(math.pi*(1-2*y/4096)))))
def coords(geometry):return [(p['lon'],p['lat']) for p in geometry]
def polys(g):
 if g.is_empty:return []
 if g.geom_type=='Polygon':return [g]
 return [p for part in getattr(g,'geoms',[]) for p in polys(part)]
def valid(g):return sh.make_valid(g) if not g.is_valid else g
def local_shape(g):return sh.transform(g,lambda a:np.column_stack(((a[:,0]-LON0)*MLON,(LAT0-a[:,1])*MLAT)))
def ring_data(p):return [[v for lon,lat in r.coords for v in (round(lat*1e6),round(lon*1e6))] for r in [p.exterior,*p.interiors]]
def relation_shape(e):
 rings={role:[] for role in ['outer','inner']}
 for role in rings:
  lines=[LineString(coords(m['geometry'])) for m in e.get('members',[]) if m.get('type')=='way' and (m.get('role') or 'outer')==role and len(m.get('geometry',[]))>=2]
  if lines:rings[role]=list(polygonize(unary_union(lines)))
 outer=unary_union(rings['outer']);inner=unary_union(rings['inner'])
 return valid(outer.difference(inner))

p=argparse.ArgumentParser();p.add_argument('--osm',required=True);p.add_argument('--supplement');p.add_argument('--water-relations');p.add_argument('--extra',action='append',default=[]);args=p.parse_args()
source=json.loads(gzip.decompress(Path(args.osm).read_bytes()))
supp=json.loads(Path(args.supplement).read_text())['elements'] if args.supplement else []
water_rel=json.loads(Path(args.water_relations).read_text())['elements'] if args.water_relations else []
extra=[e for file in args.extra for e in json.loads(Path(file).read_text())['elements']]
elements={ (e['type'],e['id']):e for e in source['elements']+supp+water_rel+extra }
old=json.loads(gzip.decompress((ROOT/'data/sunshine-coast.json.gz').read_bytes()))
measurements={ (row[0],row[1]):row for row in old['terrain'] }
repairs=old['meta'].get('terrainOutlierRepairs',[])
x0,y1=tile_at(SOUTH,WEST);x1,y0=tile_at(NORTH,EAST)
keys=[(x,y) for x in range(math.floor(x0),math.floor(x1)+1) for y in range(math.floor(y0),math.floor(y1)+1)]
def fetch_dem(key):
 if key in measurements:return key,measurements[key],[]
 cache=Path('/tmp/coastal-geography-cache');cache.mkdir(exist_ok=True);cached=cache/(str(key[0])+'-'+str(key[1])+'.json')
 if cached.exists():return key,json.loads(cached.read_text()),[]
 from PIL import Image
 import io
 x,y=key;url=f'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/12/{x}/{y}.png'
 with urllib.request.urlopen(url,timeout=50) as r:im=Image.open(io.BytesIO(r.read())).convert('RGB')
 rgb=np.array(im,dtype=np.float64);a=rgb[:,:,0]*256+rgb[:,:,1]+rgb[:,:,2]/256-32768;fixes=[]
 for j,i in zip(*np.where((a < -100)|(a >1200))):
  near=a[max(0,j-2):j+3,max(0,i-2):i+3];good=near[(near>=-100)&(near<=1200)]
  if not good.size:raise ValueError('Missing DEM measurements')
  h=float(np.median(good));fixes.append({'tile':[x,y],'pixel':[int(i),int(j)],'original':float(a[j,i]),'replacement':h});a[j,i]=h
 raw=np.rint(a*4).astype('<i2').tobytes()
 row=[x,y,im.width,base64.b64encode(raw).decode()];cached.write_text(json.dumps(row));return key,row,fixes
print('Preparing',len(keys),'measured elevation tiles',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for key,row,fixes in pool.map(fetch_dem,keys):measurements[key]=row;repairs.extend(fixes)
terrain=[measurements[k] for k in sorted(keys)]

# One shared interpolation defines original terrain, clipped triangles and road contact.
prepared={}
raster={(tx,ty):np.frombuffer(base64.b64decode(encoded),dtype='<i2').reshape(w,w)/4 for tx,ty,w,encoded in terrain}
for tx,ty,w,encoded in terrain:
 data=raster[tx,ty];px=np.arange(N+1)/N*w-.5;ix=np.floor(px).astype(int);jx=ix+1;f=px-ix
 def pixels(cols,row):
  output=data[np.clip(row,0,w-1),np.clip(cols,0,w-1)].copy();dy=math.floor(row/w)
  for dx in [-1,0,1]:
   mask=(cols//w==dx);near=raster.get((tx+dx,ty+dy))
   if near is not None:output[mask]=near[row%w,cols[mask]%w]
   elif (tx+dx,ty) in raster:output[mask]=raster[tx+dx,ty][np.clip(row,0,w-1),cols[mask]%w]
   elif (tx,ty+dy) in raster:output[mask]=raster[tx,ty+dy][row%w,np.clip(cols[mask],0,w-1)]
  return output
 heights=np.empty((N+1,N+1))
 for j in range(N+1):
  py=j/N*w-.5;iy=math.floor(py);jy=iy+1;fy=py-iy
  heights[j]=((pixels(ix,iy)*(1-f)+pixels(jx,iy)*f)*(1-fy)+(pixels(ix,jy)*(1-f)+pixels(jx,jy)*f)*fy)
 zs=np.array([local(*tile_geo(tx,ty+j/N))[1] for j in range(N+1)])
 xs=np.array([local(*tile_geo(tx+i/N,ty))[0] for i in range(N+1)])
 prepared[tx,ty]=(heights,xs,zs)

def height(x,z):
 lat=LAT0-z/MLAT;lon=LON0+x/MLON;fx,fy=tile_at(lat,lon);tx,ty=math.floor(fx),math.floor(fy)
 if (tx,ty) not in prepared:return None
 h,xs,zs=prepared[tx,ty];px=np.clip((fx-tx)*N,0,N);ix=min(N-1,int(px));iy=max(0,min(N-1,int((fy-ty)*N)));u=px-ix;v=np.clip((z-zs[iy])/(zs[iy+1]-zs[iy]),0,1)
 a,b,c,d=h[iy,ix],h[iy,ix+1],h[iy+1,ix],h[iy+1,ix+1]
 return float(a+(b-a)*u+(c-a)*v if u+v<=1 else d+(c-d)*(1-u)+(b-d)*(1-v))

boundary=box(WEST,SOUTH,EAST,NORTH)
coast=[LineString(coords(e['geometry'])) for e in elements.values() if e.get('tags',{}).get('natural')=='coastline' and len(e.get('geometry',[]))>1]
regions=list(polygonize(unary_union([boundary.boundary]+[l.intersection(boundary) for l in coast])))
land=[];sea=[]
for region in regions:
 q=region.representative_point();line=min(coast,key=lambda l:l.distance(q));best=(math.inf,0)
 for a,b in zip(line.coords,list(line.coords)[1:]):
  distance=LineString([a,b]).distance(q)
  if distance<best[0]:best=(distance,(b[0]-a[0])*(q.y-a[1])-(b[1]-a[1])*(q.x-a[0]))
 (land if best[1]>0 else sea).append(region)
sea_shape=local_shape(unary_union(sea));land_shape=local_shape(unary_union(land))
water_relations=[e for e in elements.values() if e['type']=='relation' and e.get('tags',{}).get('natural')=='water']
water_members={m['ref'] for e in water_relations for m in e.get('members',[]) if m.get('type')=='way'}
waters=[];woods=[];beaches=[]
for e in elements.values():
 tags=e.get('tags',{})
 if e['type']=='relation' and tags.get('natural')=='water':g=relation_shape(e)
 elif e['type']=='way' and len(e.get('geometry',[]))>=4:
  xy=coords(e['geometry'])
  if xy[0]!=xy[-1]:continue
  if e['id'] in water_members:continue
  g=valid(Polygon(xy))
 else:continue
 if tags.get('natural')=='water' or tags.get('waterway')=='riverbank':waters.append(local_shape(g.intersection(boundary)))
 if tags.get('natural') in ['wood','scrub'] or tags.get('landuse')=='forest':woods.append(local_shape(g.intersection(boundary)))
 if tags.get('natural')=='beach':beaches.append(local_shape(g.intersection(boundary)))
# Shoreline islands take precedence over untagged lake outer-way interiors.
islands=local_shape(unary_union([p for p in land if p.area<.02]))
water=valid(unary_union([sea_shape,*waters]).difference(islands))
land_surface=valid(land_shape.difference(water));sh.prepare(land_surface)
forest=unary_union(woods);sand=unary_union(beaches);sh.prepare(forest);sh.prepare(sand)
water_parts=polys(water);levels=[]
for g in water_parts:
 if g.intersects(sea_shape):level=0.
 else:
  pts=list(g.exterior.coords);step=max(1,len(pts)//120);values=[height(x,z) for x,z in pts[::step]];values=sorted(v for v in values if v is not None)
  level=max(0.,values[int((len(values)-1)*.1)]) if values else 0.
 levels.append(round(level,2))
print('Shoreline regions:',len(regions),'water bodies:',len(water_parts),flush=True)

def b64_array(a):return base64.b64encode(a.tobytes()).decode()
surfaces={};total_clipped=0;water_tree=sh.STRtree(water_parts)
for number,(tx,ty) in enumerate(sorted(prepared)):
 h,xs,zs=prepared[tx,ty]
 # Triangles preserve the rendered DEM's exact diagonal and shared grid vertices.
 triangles=[]
 for j in range(N):
  for i in range(N):
   a=(xs[i],zs[j]);b=(xs[i+1],zs[j]);c=(xs[i],zs[j+1]);d=(xs[i+1],zs[j+1]);triangles.extend([[a,c,b],[b,c,d]])
 array_triangles=np.asarray(triangles)
 geometry=sh.polygons(array_triangles);inside=sh.covers(land_surface,geometry);intersect=sh.intersects(land_surface,geometry)
 flags=np.where(inside,1,np.where(intersect,2,0)).astype(np.uint8)
 extra=[]
 for tri in geometry[(flags==2)]:
  clipped=sh.intersection(tri,land_surface)
  for piece in sh.get_parts(sh.constrained_delaunay_triangles(clipped)):
   if piece.area<.0001:continue
   for x,z in list(piece.exterior.coords)[:3]:extra.extend((round(x*100),round(height(x,z)*100),round(z*100)))
 # Seal the terrain edge down to its adjacent mapped water level.
 edge=land_surface.boundary.intersection(box(xs[0],zs[0],xs[-1],zs[-1]))
 def edge_lines(g):
  if g.geom_type in ['LineString','LinearRing']:return [g]
  return [line for part in getattr(g,'geoms',[]) for line in edge_lines(part)]
 for line in edge_lines(edge):
  xy=list(line.coords)
  for a,b in zip(xy,xy[1:]):
   mid=Point((a[0]+b[0])/2,(a[1]+b[1])/2);nearest=int(water_tree.nearest(mid))
   if water_parts[nearest].distance(mid)>.03:continue
   level=levels[nearest];ha=height(*a);hb=height(*b)
   if ha is None or hb is None or max(ha,hb)<=level+.02:continue
   vertices=[(a[0],ha,a[1]),(b[0],hb,b[1]),(a[0],level,a[1]),(a[0],level,a[1]),(b[0],hb,b[1]),(b[0],level,b[1])]
   for vertex in vertices:extra.extend(round(v*100) for v in vertex)
 total_clipped+=len(extra)//9
 xx,zz=np.meshgrid(xs,zs);points=sh.points(xx.ravel(),zz.ravel());classes=np.zeros(len(points),dtype=np.uint8)
 classes[sh.covers(forest,points)]=2;classes[sh.covers(sand,points)]=1
 surfaces[f'{tx}/{ty}']={'flags':b64_array(flags),'extra':b64_array(np.asarray(extra,dtype='<i4')),'classes':b64_array(classes)}
 if number%12==0:print('Clipped terrain',number+1,'/',len(prepared),flush=True)

# Water is indexed into 512 m cells so contact checks never scan a whole coastline.
water_index=sh.STRtree(water_parts);cells={};water_mesh=[]
minx,minz=local(WEST,NORTH);maxx,maxz=local(EAST,SOUTH)
for ix in range(math.floor(minx/512),math.floor(maxx/512)+1):
 for iz in range(math.floor(minz/512),math.floor(maxz/512)+1):
  cell=box(ix*512,iz*512,(ix+1)*512,(iz+1)*512);found=[];full=None
  for index in water_index.query(cell,predicate='intersects'):
   g=water_parts[index];level=levels[index]
   if g.covers(cell):full=level;break
   for piece in polys(g.intersection(cell)):
    rings=[[[round(x,2),round(z,2)] for x,z in r.coords] for r in [piece.exterior,*piece.interiors]]
    found.append([level,rings])
  if full is not None:cells[f'{ix},{iz}']=full
  elif found:cells[f'{ix},{iz}']=found
for g,level in zip(water_parts,levels):
 if level<=.01:continue
 for piece in polys(g):water_mesh.append([level,[[v for x,z in r.coords for v in (round(x*100),round(z*100))] for r in [piece.exterior,*piece.interiors]]])

building_relations=[e for e in elements.values() if e['type']=='relation' and e.get('tags',{}).get('building') not in [None,'no'] and e.get('members')]
building_members={m['ref'] for e in building_relations for m in e.get('members',[]) if m.get('role')!='inner' and m.get('type')=='way'}
buildings=[];building_shapes=[]
for e in elements.values():
 tags=e.get('tags',{})
 if tags.get('building') in [None,'no']:continue
 if e['type']=='relation':
  if not e.get('members'):continue
  shape=relation_shape(e)
 elif e['type']=='way' and len(e.get('geometry',[]))>=4:
  if e['id'] in building_members:continue
  shape=valid(Polygon(coords(e['geometry'])))
 else:continue
 for k,g in enumerate(polys(shape)):
  if not g.intersects(boundary):continue
  buildings.append([f"{e['type'][0]}{e['id']}:{k}",tags,ring_data(g)]);building_shapes.append(g)
# Isolated building parts still represent real structures; don't duplicate mapped outlines.
index=sh.STRtree(building_shapes)
for e in elements.values():
 if e['type']!='way' or not e.get('tags',{}).get('building:part') or e.get('tags',{}).get('building') or len(e.get('geometry',[]))<4:continue
 shape=valid(Polygon(coords(e['geometry'])))
 for k,g in enumerate(polys(shape)):
  if not g.intersects(boundary):continue
  matches=index.query(g.representative_point(),predicate='within')
  if len(matches):continue
  buildings.append([f"part{e['id']}:{k}",dict(e['tags'],building=e['tags']['building:part']),ring_data(g)])
keep=set('highway surface tracktype width lanes name ref oneway junction maxspeed sidewalk sidewalk:left sidewalk:right lane_markings building building:part building:levels building:colour height roof:shape roof:height roof:colour natural water waterway landuse layer bridge tunnel ele diameter_crown leaf_type place crossing footway'.split())
ways=[];nodes=[]
for e in elements.values():
 tags={k:v for k,v in e.get('tags',{}).items() if k in keep}
 if e['type']=='way' and len(e.get('geometry',[]))>1:ways.append([e['id'],tags,[v for p in e['geometry'] for v in (round(p['lat']*1e6),round(p['lon']*1e6))]])
 elif e['type']=='node' and 'lat' in e:nodes.append([e['id'],tags,round(e['lat']*1e6),round(e['lon']*1e6)])
places=[r for r in nodes if r[1].get('place') and r[1].get('name')]
meta=dict(old['meta'],bounds=[SOUTH,WEST,NORTH,EAST],osmTimestamp=source['osm3s']['timestamp_osm_base'],downloaded='2026-10-22',ways=len(ways),nodes=len(nodes),terrainTiles=len(terrain),counts={'highwayWays':sum('highway'in w[1] for w in ways),'buildings':len(buildings),'namedPlaces':len(places)},terrainOutlierRepairs=repairs,surfaceModel={'shorelineWays':len(coast),'waterBodies':len(water_parts),'clippedTriangles':total_clipped,'waterRelations':len(water_relations),'buildingRelations':len(building_relations),'renderGrid':N,'demEdges':'shared border samples blended from neighbouring source pixels; original raw measurements retained','precision':'original OSM coordinates; extra clipped vertices rounded to 1 cm; original measured heights unchanged'})
payload={'meta':meta,'ways':ways,'points':nodes,'terrain':terrain,'buildings':buildings,'surfaces':{'gridResolution':N,'tiles':surfaces,'waterCells':cells,'waterMesh':water_mesh,'mapWater':[[[v for x,z in ring.coords for v in (round(x*100),round(z*100))] for ring in [g.exterior,*g.interiors]] for g in water_parts]}}
raw=json.dumps(payload,separators=(',',':'),ensure_ascii=False).encode();packed=gzip.compress(raw,compresslevel=9,mtime=0)
(ROOT/'data/sunshine-coast.json.gz').write_bytes(packed);(ROOT/'data/provenance.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Pack written:',len(packed),'bytes;',len(buildings),'real buildings;',len(places),'named places;',len(terrain),'DEM tiles',flush=True)
print('SHA256',hashlib.sha256(packed).hexdigest(),flush=True)
