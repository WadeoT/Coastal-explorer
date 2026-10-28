"""Validate uploaded data without executing its bundled scripts; build compact runtime records."""
import json,re,gzip
from pathlib import Path
root=Path(__file__).resolve().parents[1];rows=[json.loads(s) for s in (root/'data/architecture/buildings.jsonl').read_text().splitlines()];seen=set();out=[]
for r in rows:
 assert r['id']==f"osm:way:{r['osm_way_id']}" and r['id'] not in seen;seen.add(r['id'])
 assert not r['synthetic'];rings=r['footprint']['coordinates'];assert r['footprint']['type']=='Polygon'
 for ring in rings:
  assert len(ring)>=4 and ring[0]==ring[-1]
  assert all(len(p)==2 and 152.5<=p[0]<=153.3 and -26.98<=p[1]<=-26.1 for p in ring)
 tags={};mapping={'storey_count':'building:levels','roof_type':'roof:shape','roof_material':'roof:material','wall_material':'building:material','wall_primary_colour_hex':'building:colour','roof_colour_hex':'roof:colour'}
 for name,key in mapping.items():
  a=r['attributes'][name]
  if a['value'] is not None and a['status']=='observed':tags[key]=str(a['value'])
 kind=r['attributes']['building_type']
 if kind['status']=='observed' and kind['value'] not in [None,'other']:tags['building']=kind['value']
 # Raw council elevations and 3m/storey estimates are not measured building heights.
 out.append({'id':r['osm_way_id'],'area':r['area_sample'],'tags':tags,'rings':rings})
assert len(out)==100
(root/'data/architecture/runtime.json').write_text(json.dumps({'records':out,'source':'Uploaded OSM architecture pilot, 2026-10-28; ODbL 1.0'},separators=(',',':'))+'\n')
print('Validated 100 unique real footprints; exported observed tags only.')
