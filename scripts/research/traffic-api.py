import urllib.request,urllib.parse,json,base64,zlib

def get(url):return json.load(urllib.request.urlopen(url,timeout=45))
def out(title,s):print('::notice title='+title+'::'+str(s).replace('%','%25').replace('\n','%0A')[:12000])
for name,rid in [('census','dd96f1cd-f7ee-4c00-b5bc-2eb4f0b16952'),('roads','daab3617-077f-450a-a1c0-57c26d8ba47c')]:
 try:
  root='https://www.data.qld.gov.au/api/3/action/datastore_search?resource_id='+rid
  schema=get(root+'&limit=2');out('API schema '+name,json.dumps(schema))
  if not schema.get('success'):continue
  rows=[];offset=0;total=schema['result'].get('total',0)
  while offset<min(total,80000):
   data=get(root+'&limit=10000&offset='+str(offset));records=data['result']['records'];offset+=len(records)
   if not records:break
   for r in records:
    nums=[]
    for v in r.values():
     try:nums.append(float(v))
     except:pass
    if any(-26.95<n<-26.28 for n in nums) and any(152.65<n<153.25 for n in nums):rows.append(r)
  out('API regional sample '+name,json.dumps({'total':total,'selected':len(rows),'sample':rows[:2]}))
  if rows:
   enc=base64.b64encode(zlib.compress(json.dumps({'source':root,'rows':rows},separators=(',',':')).encode(),9)).decode();out('API payload size '+name,len(enc))
   for i in range(0,min(len(enc),100000),10000):out('API payload '+name+' '+str(i//10000),enc[i:i+10000])
 except Exception as e:out('Traffic API error',name+' '+str(e))
