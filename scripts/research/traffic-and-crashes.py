"""Read-only official-source research. Emits bounded GitHub annotations, not commits."""
import urllib.request, json, re, html, csv, io, zipfile

def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'CoastalExplorer-development-research/1.0'})
 return urllib.request.urlopen(req,timeout=35).read()
def notice(title,text):
 print('::notice title='+title+'::'+str(text).replace('%','%25').replace('\r','%0D').replace('\n','%0A')[:12000])
try:
 data=json.loads(fetch('https://www.data.qld.gov.au/api/3/action/package_search?q=traffic%20census&rows=3'))
 for d in data['result']['results']:
  notice('Official traffic dataset',json.dumps({'title':d['title'],'name':d['name'],'resources':[{'name':r['name'],'format':r.get('format'),'url':r['url']} for r in d['resources']]}))
except Exception as e:notice('Traffic research unavailable',str(e))
for url in ['https://www.ancap.com.au/safety-ratings/toyota/landcruiser','https://www.ancap.com.au/safety-ratings/toyota/landcruiser-70-series','https://www.ancap.com.au/safety-testing-explained']:
 try:
  s=fetch(url).decode('utf8','replace');s=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>','',s);s=re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]*>',' ',s)))
  matches=[]
  for term in ['64km','64 km','50km','50 km','frontal','offset','70 Series']:
   m=re.search(term,s,re.I)
   if m:matches.append(s[max(0,m.start()-80):m.start()+600])
  notice('ANCAP reference',url+' '+json.dumps(matches or [s[:800]]))
 except Exception as e:notice('ANCAP source unavailable',url+' '+str(e))
# Read the workbook with standard-library XML; preserve actual source fields.
try:
 import xml.etree.ElementTree as ET,base64,zlib
 url='https://www.data.qld.gov.au/dataset/5d74e022-a302-4f40-a594-f1840c92f671/resource/dd96f1cd-f7ee-4c00-b5bc-2eb4f0b16952/download/aadt_2025.xlsx'
 z=zipfile.ZipFile(io.BytesIO(fetch(url)));ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
 shared=[''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns)] if 'xl/sharedStrings.xml' in z.namelist() else []
 rows=[]
 for sheet in [n for n in z.namelist() if re.match(r'xl/worksheets/sheet\d+.xml',n)][:2]:
  selected=[];head=[]
  for row in ET.fromstring(z.read(sheet)).findall('.//m:row',ns):
   cells={}
   for c in row.findall('m:c',ns):
    v=c.find('m:v',ns);value=v.text if v is not None else ''.join(c.itertext());value=shared[int(value)] if c.get('t')=='s' and value else value;cells[re.sub(r'\d','',c.get('r',''))]=value
   if len(head)<6:head.append(cells)
   vals=list(cells.values());text=' '.join(vals)
   nums=[]
   for v in vals:
    try:nums.append(float(v))
    except:pass
   if ('Sunshine' in text or 'Noosa' in text or any(-26.95<n<-26.28 for n in nums) and any(152.65<n<153.25 for n in nums)):selected.append(cells)
  notice('Traffic workbook schema',json.dumps({'sheet':sheet,'head':head,'count':len(selected),'sample':selected[:4]}))
  raw=json.dumps({'source':url,'sheet':sheet,'head':head,'rows':selected},separators=(',',':')).encode();encoded=base64.b64encode(zlib.compress(raw,9)).decode()
  if len(encoded)<50000:
   for i in range(0,len(encoded),10000):notice('Traffic payload '+str(i//10000),encoded[i:i+10000])
except Exception as e:notice('Workbook extraction unavailable',str(e))
for url in ['https://www.euroncap.com/en/vehicle-safety/the-ratings-explained/adult-occupant-protection/frontal-impact/','https://www.nhtsa.gov/ratings']:
 try:
  text=fetch(url).decode('utf8','replace');text=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>','',text);text=re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]*>',' ',text)))
  extracts=[]
  for m in re.finditer(r'50 km|64 km|35 mph|frontal crash|deformable',text,re.I):
   extracts.append(text[max(0,m.start()-70):m.start()+450])
   if len(extracts)>=6:break
  notice('Official crash protocol',url+' '+json.dumps(extracts or [text[:500]]))
 except Exception as e:notice('Crash protocol unavailable',str(e))
