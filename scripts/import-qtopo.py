from pathlib import Path
import fitz,re,json,hashlib,math,argparse,io
from PIL import Image
from pyproj import Transformer
parser=argparse.ArgumentParser(description='Extract the supplied georeferenced QTopo reference and marked spot heights. Requires PyMuPDF, pyproj and Pillow.');parser.add_argument('pdf',type=Path);args=parser.parse_args();root=Path(__file__).resolve().parents[1];output=root/'data/qtopo';output.mkdir(exist_ok=True);source=args.pdf;assert hashlib.sha256(source.read_bytes()).hexdigest()=='41b4a7038c205c25fc2ad90a11f5c9e7f7d83f02d0e0b7819462e13cebba6ad6', 'This importer is validated for the supplied QTopo sheet only';doc=fitz.open(source);page=doc[0];vp=doc.xref_get_key(page.xref,'VP')[1];views=[]
for match in re.finditer(r'/BBox\[([^]]+)\].*?/GPTS\[([^]]+)\]',vp,re.S):
 bbox=list(map(float,match[1].split()));gpts=list(map(float,match[2].split()));views.append((bbox,gpts))
bbox,gpts=max(views,key=lambda a:(a[0][2]-a[0][0])*(a[0][3]-a[0][1]));rect=fitz.Rect(bbox[0],page.rect.height-bbox[3],bbox[2],page.rect.height-bbox[1]);forward=Transformer.from_crs(7844,7856,always_xy=True);inverse=Transformer.from_crs(7856,7844,always_xy=True);corners=[forward.transform(gpts[i+1],gpts[i]) for i in range(0,8,2)];left=(corners[0][0]+corners[1][0])/2;right=(corners[2][0]+corners[3][0])/2;bottom=(corners[0][1]+corners[3][1])/2;top=(corners[1][1]+corners[2][1])/2

def geo(x,y):return inverse.transform(left+(x-rect.x0)/rect.width*(right-left),top-(y-rect.y0)/rect.height*(top-bottom))
spans=[s for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans']];heights=[s for s in spans if s['color']==5059328 and re.fullmatch(r'\d{1,4}',s['text'])];names=[s for s in spans if s['color']==5059328 and not re.fullmatch(r'\d{1,4}',s['text'])];images=[i for i in page.get_image_info(xrefs=True) if i['xref']==7336 and rect.contains((fitz.Rect(i['bbox']).tl+fitz.Rect(i['bbox']).br)/2)];pairs=[]
for i,image in enumerate(images):
 b=fitz.Rect(image['bbox']);cx,cy=(b.x0+b.x1)/2,(b.y0+b.y1)/2
 for j,h in enumerate(heights):
  x,y=h['origin'];distance=math.hypot(x-cx,y-cy)
  if distance<18:pairs.append((distance,i,j,cx,cy))
used_i=set();used_j=set();points=[]
for distance,i,j,x,y in sorted(pairs):
 if i in used_i or j in used_j:continue
 used_i.add(i);used_j.add(j);h=heights[j];hx,hy=h['origin'];candidates=[n for n in names if abs(n['origin'][0]-hx)<3 and 2<hy-n['origin'][1]<18];name=min(candidates,key=lambda n:abs(hy-n['origin'][1]-8))['text'] if candidates else 'QTopo height '+h['text'];lon,lat=geo(x,y);points.append(dict(name=name,lat=round(lat,8),lon=round(lon,8),height=int(h['text']),pdfSymbol=[x,y],labelDistancePt=round(distance,3)))
points.sort(key=lambda p:p['name']);contours=[]
for b in page.get_text('dict')['blocks']:
 for line in b.get('lines',[]):
  ss=[s for s in line['spans'] if s['color'] in [9007172,7556096]]
  if not ss:continue
  text=''.join(s['text'] for s in ss).strip().replace(' ','')
  if text.isdigit() and 0<int(text)<=1000:
   bb=fitz.Rect(ss[0]['bbox'])
   for s in ss[1:]:bb.include_rect(s['bbox'])
   if rect.contains(bb):
    lon,lat=geo((bb.x0+bb.x1)/2,(bb.y0+bb.y1)/2);contours.append(dict(height=int(text),lat=round(lat,8),lon=round(lon,8),pdfBounds=list(bb),direction=list(line['dir'])))
meta=dict(title='QTopo Sunshine Coast A1',sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),scale=100000,crs='EPSG:7856',verticalUnits='metres as printed; vertical datum not stated in PDF',pdfBounds=list(rect),mgaBounds=[left,bottom,right,top],geographicCorners=[[gpts[i+1],gpts[i]] for i in range(0,8,2)],points=points,contourLabels=contours,imageSymbolXref=7336,licence='CC-BY-4.0',source='User-uploaded Queensland QTopo map, produced 29 October 2026')
(output/'reference.json').write_text(json.dumps(meta,indent=2));print('Matched heights',len(points),'of',len(heights),'labels;',len(contours),'contour label records');print('MGA bounds',meta['mgaBounds']);print('Corner closure metres',corners)
for p in points:print(p['name'],p['height'],p['lat'],p['lon'],p['labelDistancePt'])

# Render only the main georeferenced viewport. The full original remains available
# beside it; contour labels are reference data, never silently treated as DEM samples.
pix=page.get_pixmap(matrix=fitz.Matrix(2,2),clip=rect,alpha=False)
Image.open(io.BytesIO(pix.tobytes('png'))).save(output/'map.webp',format='WEBP',lossless=True,method=6)
warp=[]
for j in range(9):
 row=[]
 for i in range(9):
  lon,lat=geo(rect.x0+rect.width*i/8,rect.y0+rect.height*j/8);row.append([round(lat,9),round(lon,9)])
 warp.append(row)
runtime={k:v for k,v in meta.items() if k not in ['contourLabels','imageSymbolXref']}
runtime.update(warp=warp,imageWidth=pix.width,imageHeight=pix.height,contourUse='Visible reference only; ambiguous rotated labels are not elevation controls.')
(output/'runtime.json').write_text(json.dumps(runtime,separators=(',',':')))
(output/'source.pdf').write_bytes(source.read_bytes())
print('Rendered',pix.width,pix.height,'with 8x8 projected warp grid')
