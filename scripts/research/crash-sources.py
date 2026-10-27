import urllib.request,re,html,xml.etree.ElementTree as ET,json

def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read().decode('utf8','replace')
def out(title,text):print('::notice title='+title+'::'+text.replace('%','%25').replace('\n','%0A')[:3800])
try:
 s=get('https://www.ancap.com.au/sitemap.xml');links=re.findall(r'<loc>(.*?)</loc>',s);out('ANCAP sitemap',json.dumps(links[:8]));targets=[u for u in links if re.search('landcruiser|i20|wrx|falcon',u,re.I)]
 if not targets:
  for url in [u for u in links if 'sitemap' in u][:6]:
   try:targets += [u for u in re.findall(r'<loc>(.*?)</loc>',get(url)) if re.search('landcruiser|i20|wrx|falcon',u,re.I)]
   except:pass
 out('ANCAP vehicle links',json.dumps(targets[:20]))
 for url in targets[:3]:
  raw=get(url);pdfs=re.findall(r'https?[^\s\"<>]+\.pdf[^\s\"<>]*',raw);text=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>','',raw);text=re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]*>',' ',text)));out('ANCAP vehicle evidence',url+' '+json.dumps({'pdfs':pdfs[:5],'text':text[:2800]}))
except Exception as e:out('ANCAP retrieval',str(e))
try:
 s=get('https://www.google.com/search?q=site%3Aancap.com.au+2016+LandCruiser+70+series+crash+test');s=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>','',s);text=re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]*>',' ',s)));out('Crash reference discovery',text[:3600])
except Exception as e:out('Crash discovery unavailable',str(e))
