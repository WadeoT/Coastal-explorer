"""Normalise regional OSM geometry and OurAirports names, retaining source records."""
import json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=root/'data/airfields'
records=json.loads((folder/'ourairports-source.json').read_text());osm=json.loads((folder/'osm-source.json').read_text());airports={};runways=[];aprons=[];taxiways=[]
def distance(a,b):return math.hypot((a[0]-b[0])*111320,(a[1]-b[1])*99500)
extra=json.loads((folder/'ybsu-aprons-source.json').read_text())
elements={e['id']:e for e in osm['elements']}
elements.update({e['id']:e for e in extra['elements']})
for e in elements.values():
 tags=e['tags'];g=e['geometry'];centre=[sum(p['lat'] for p in g)/len(g),sum(p['lon'] for p in g)/len(g)];matches=sorted((distance(centre,[float(r['latitude_deg']),float(r['longitude_deg'])]),r['ident'],r) for r in records if r['type']!='heliport');d,key,row=matches[0]
 if d>2500:key='osm-'+str(e['id']);row={'ident':key,'name':'Mapped rural airstrip','latitude_deg':centre[0],'longitude_deg':centre[1],'type':'unknown'}
 airport=airports.setdefault(key,{'id':key,'name':row['name'],'lat':float(row['latitude_deg']),'lon':float(row['longitude_deg']),'restricted':row['type'] in ['closed','unknown'] or 'private' in row['name'].lower(),'runways':[]})
 item={'osmId':e['id'],'airport':key,'tags':tags,'geometry':g}
 if tags['aeroway']=='runway' and tags.get('runway')!='displaced_threshold':
  if distance([g[0]['lat'],g[0]['lon']],[g[-1]['lat'],g[-1]['lon']])<80:continue
  runways.append(item);airport['runways'].append(e['id'])
 elif tags['aeroway']=='apron':aprons.append(item)
 elif tags['aeroway']=='taxiway':taxiways.append(item)
airports['YBSU']['parkingAprons']=[792749683,1049990731]
m={'apronSourceTimestamp':extra['osm3s']['timestamp_osm_base'],'sourceTimestamp':osm['osm3s']['timestamp_osm_base'],'sources':{'geometry':'© OpenStreetMap contributors, ODbL 1.0','names':'OurAirports, public domain','ourairportsUrl':'https://github.com/davidmegginson/ourairports-data','geometryQuery':'Regional runways and Caloundra surfaces (29 October 2026); Sunshine Coast Airport aprons/taxiways from retained additional OSM export'},'airports':[a for a in airports.values() if a['runways']],'runways':runways,'aprons':aprons,'taxiways':taxiways}
(folder/'runtime.json').write_text(json.dumps(m,separators=(',',':')));print(len(m['airports']),'airfields;',len(runways),'mapped runways;',len(aprons),'mapped aprons')
