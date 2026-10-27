import urllib.request,json,base64,zlib,collections

def get(url):return json.load(urllib.request.urlopen(url,timeout=45))
def out(title,s):print('::notice title='+title+'::'+str(s).replace('%','%25').replace('\n','%0A')[:3900])
rid='dd96f1cd-f7ee-4c00-b5bc-2eb4f0b16952';url='https://www.data.qld.gov.au/api/3/action/datastore_search?resource_id='+rid+'&limit=10000'
try:
 data=get(url);rows=data['result']['records'];selected=[];stations={}
 for r in rows:
  if not ('Sunshine' in r['LGA_NAME'] or 'Noosa' in r['LGA_NAME']):continue
  lat=float(r['SITE_LATITUDE']);lon=float(r['SITE_LONGITUDE'])
  if not (-26.95<lat<-26.28 and 152.65<lon<153.25):continue
  selected.append(r)
  if r['TRAVEL_DIRECTION']!='BOTH DIRECTIONS':continue
  key=r['SITE_ID'];s=stations.setdefault(key,{'id':key,'road':r['ROAD_NAME'],'lat':lat,'lon':lon,'speed':int(float(r['SPEED_LIMIT'] or 60)),'aadt':0,'light':0,'heavy':0,'rigid':0,'articulated':0,'directions':[]})
  if r['TRAVEL_DIRECTION'] in s['directions']:continue
  s['directions'].append(r['TRAVEL_DIRECTION'])
  for k,field in [('aadt','AADT'),('light','AADT_CLASS_0A'),('heavy','AADT_CLASS_0B'),('rigid','AADT_CLASS_1B')]:s[k]+=float(r[field] or 0)
  s['articulated']+=float(r['AADT_CLASS_1C'] or 0)+float(r['AADT_CLASS_1D'] or 0)
 for s in stations.values():
  for k in ['aadt','light','heavy','rigid','articulated']:s[k]=round(s[k],2)
 package=get('https://www.data.qld.gov.au/api/3/action/package_show?id=traffic-census-for-the-queensland-state-declared-road-network')['result']
 result={'year':2025,'source':url,'dataset':'https://www.data.qld.gov.au/dataset/traffic-census-for-the-queensland-state-declared-road-network','license':package.get('license_title'),'license_url':package.get('license_url'),'retrieved':'2026-10-27','source_record_count':len(selected),'note':'Annual average daily vehicles, not concurrent cars. BOTH DIRECTIONS record used once per site; opposing directions are not added again. Make/model mix and unmeasured streets are estimates.','stations':list(stations.values())}
 encoded=base64.b64encode(zlib.compress(json.dumps(result,separators=(',',':')).encode(),9)).decode();out('Census verified summary',json.dumps({'records':len(selected),'stations':len(stations),'bytes':len(encoded),'license':result['license'],'largest':sorted(stations.values(),key=lambda s:s['aadt'],reverse=True)[:3]}))
 for i in range(0,len(encoded),3000):out('Census compact '+str(i//3000),encoded[i:i+3000])
except Exception as e:out('Census extraction error',str(e))
