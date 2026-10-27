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
