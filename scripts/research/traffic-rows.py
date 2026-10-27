import urllib.request,json,re,csv,io,base64,zlib,xml.etree.ElementTree as ET,gzip

def get(url):
 r=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'*/*'}),timeout=25);b=r.read();return gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b

def out(title,s):print('::notice title='+title+'::'+str(s).replace('%','%25').replace('\n','%0A')[:12000])
urls=[('kml','https://www.data.qld.gov.au/dataset/5d74e022-a302-4f40-a594-f1840c92f671/resource/17e26d88-7245-4e88-9481-00f9aea5f4f5/download/trafficcensus2025.kml'),('roads','https://www.data.qld.gov.au/dataset/1c1d8224-0a5e-4a0c-ad6f-025096d206ba/resource/daab3617-077f-450a-a1c0-57c26d8ba47c/download/road-location-and-traffic-data_20260928.csv'),('store','https://www.data.qld.gov.au/api/3/action/datastore_search?resource_id=daab3617-077f-450a-a1c0-57c26d8ba47c&limit=2')]
for kind,url in urls:
 try:
  b=get(url);out('Traffic fetch '+kind,str(len(b))+' bytes '+repr(b[:160]))
  text=b.decode('utf8','replace')
  if kind=='roads' and '<html' not in text[:1000].lower():
   reader=csv.DictReader(io.StringIO(text));rows=[]
   for r in reader:
    t=json.dumps(r);nums=[]
    for v in r.values():
     try:nums.append(float(v))
     except:pass
    if 'Sunshine Coast' in t or 'Noosa' in t or any(-26.95<n<-26.28 for n in nums) and any(152.65<n<153.25 for n in nums):rows.append(r)
   out('Traffic CSV schema',json.dumps({'fields':reader.fieldnames,'count':len(rows),'sample':rows[:2]}));raw=json.dumps({'source':url,'rows':rows},separators=(',',':')).encode();enc=base64.b64encode(zlib.compress(raw,9)).decode();out('Traffic CSV payload bytes',len(enc))
   for i in range(0,min(len(enc),100000),10000):out('Traffic CSV payload '+str(i//10000),enc[i:i+10000])
  if kind=='kml' and '<kml' in text[:2000]:
   root=ET.fromstring(b);ns={'k':'http://www.opengis.net/kml/2.2'};rows=[]
   for p in root.findall('.//k:Placemark',ns):
    coord=p.find('.//k:coordinates',ns)
    if coord is None:continue
    try:lon,lat,*_=map(float,coord.text.strip().split()[0].split(','))
    except:continue
    if -26.95<lat<-26.28 and 152.65<lon<153.25:rows.append({'lat':lat,'lon':lon,'xml':ET.tostring(p,encoding='unicode')})
   out('Traffic KML schema',json.dumps({'count':len(rows),'sample':rows[:1]}));enc=base64.b64encode(zlib.compress(json.dumps(rows,separators=(',',':')).encode(),9)).decode();out('Traffic KML payload bytes',len(enc))
   for i in range(0,min(len(enc),100000),10000):out('Traffic KML payload '+str(i//10000),enc[i:i+10000])
 except Exception as e:out('Traffic fetch failure',kind+' '+str(e))
