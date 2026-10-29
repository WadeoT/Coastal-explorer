import bpy,sys,json,math,os
from pathlib import Path
from mathutils import Vector
key,path,out=sys.argv[sys.argv.index('--')+1:];out=Path(out);out.mkdir(parents=True,exist_ok=True)
if path.endswith('.blend'):bpy.ops.wm.open_mainfile(filepath=path,load_ui=False,use_scripts=False)
else:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 if path.lower().endswith('.fbx'):bpy.ops.import_scene.fbx(filepath=path,use_custom_normals=True)
 elif path.lower().endswith('.obj'):bpy.ops.wm.obj_import(filepath=path)
 else:bpy.ops.import_scene.gltf(filepath=path)
config={'patrol':(4.24,'-Y',28000),'porsche':(4.572,'-Y',50000),'hornet':(18.31,'-X',32000),'rescue':(12.2,'+X',32000),'cruiser':(4.675,'-Zup-Y',56000),'i20':(3.94,'-Zup-Y',50000),'jeep':(5.537,'-Y',50000),'bmw':(4.794,'-Y',50000),'hilux':(5.325,'-Y',50000)}[key]
meshes=[o for o in bpy.data.objects if o.type=='MESH' and len(o.data.polygons) and 'colider' not in o.name.lower() and 'collider' not in o.name.lower()]
for o in meshes:
 if o.modifiers:
  evaluated=o.evaluated_get(bpy.context.evaluated_depsgraph_get());o.data=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=bpy.context.evaluated_depsgraph_get());o.modifiers.clear()
points=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box];low=[min(v[i] for v in points) for i in range(3)];high=[max(v[i] for v in points) for i in range(3)];axis=1 if config[1]=='-Y' else 2 if config[1]=='-Zup-Y' else 0;vertical=1 if config[1]=='-Zup-Y' else 2;scale=config[0]/(high[axis]-low[axis]);centres=[(a+b)/2 for a,b in zip(low,high)]
def game(v):
 x,y,z=v
 if config[1]=='-Zup-Y':return (-x*scale,-y*scale,z*scale)
 if config[1]=='-Y':return (-x*scale,z*scale,y*scale)
 if config[1]=='-X':return (y*scale,z*scale,x*scale)
 return (-y*scale,z*scale,-x*scale)
baseCentre=centres[:];baseCentre[vertical]=high[vertical] if config[1]=='-Zup-Y' else low[vertical];centre=game(Vector(baseCentre))
def pos(v):return tuple(round(x-y,5) for x,y in zip(game(v),centre))
def normal(v):
 x,y,z=game(v);n=math.sqrt(x*x+y*y+z*z) or 1;return tuple(round(a/n,5) for a in (x,y,z))
# Preserve actual car wheel assemblies through joining and simplification.
for o in meshes:
 names=[];parent=o
 while parent:names.append(parent.name.lower());parent=parent.parent
 label=' '.join(names);wheel=next((w for w in ['FL','FR','RL','RR'] if o.name==w),None)
 if not wheel and any(w in label for w in ['wheel front','wheel rear','rim front','rim rear','tyre front','tyre rear','tire front','tire rear']):
  wheel=('F' if 'front' in label else 'R')+('L' if ' l' in label else 'R')
 if wheel:
  g=o.vertex_groups.new(name='life-wheel-'+wheel);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.hide_set(False);o.hide_viewport=False;o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();obj=bpy.context.object
# Source images are exported data only; no embedded scripts are executed.
images={};materials=[]
def image_ref(im):
 if not im:return None
 if im.name in images:return images[im.name]
 idx=len(images);ext=Path(im.filepath).suffix.lower();dest=out/('image-'+str(idx)+(ext if ext in ['.png','.jpg','.jpeg','.webp'] else '.png'))
 if im.packed_file:dest.write_bytes(bytes(im.packed_file.data))
 else:
  source=Path(bpy.path.abspath(im.filepath))
  if not source.is_file():
   candidates=list(Path(path).parent.rglob(Path(im.filepath).name));source=candidates[0] if candidates else source
  if source.is_file():dest.write_bytes(source.read_bytes())
  else:
   im.filepath_raw=str(dest);im.file_format='PNG'
   try:im.save()
   except:return None
 images[im.name]=dest.name;return dest.name

def linked_image(socket,seen=None):
 seen=seen or set()
 for link in socket.links:
  node=link.from_node
  if node.name in seen:continue
  seen.add(node.name)
  if node.type=='TEX_IMAGE':return node.image
  for input in node.inputs:
   result=linked_image(input,seen)
   if result:return result
 return None
for mat in obj.data.materials:
 if not mat:materials.append({'name':'default','color':[.5,.5,.5,1]});continue
 entry={'name':mat.name,'color':list(mat.diffuse_color),'roughness':mat.roughness,'metallic':mat.metallic}
 node=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) if mat.use_nodes else None
 if node:
  color=node.inputs['Base Color'];entry['color']=list(color.default_value);entry['texture']=image_ref(linked_image(color));entry['roughness']=node.inputs['Roughness'].default_value;entry['metallic']=node.inputs['Metallic'].default_value;entry['color'][3]=node.inputs['Alpha'].default_value
 if any(s in mat.name.lower() for s in ['glass','window','oglinzi']):entry['glass']=True;entry['color'][3]=min(.38,entry['color'][3])
 materials.append(entry)
original=sum(len(p.vertices)-2 for p in obj.data.polygons);ratio=min(1,config[2]/original)
mod=obj.modifiers.new('browser-detail-budget','DECIMATE');mod.ratio=ratio;mod.use_collapse_triangulate=True;bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
obj.data.calc_loop_triangles();mesh=obj.data;uv=mesh.uv_layers.active;col=mesh.color_attributes.active_color;world=obj.matrix_world;norm=world.to_3x3().inverted().transposed();groups={g.index:g.name for g in obj.vertex_groups};batches={}
for tri in mesh.loop_triangles:
 mi=tri.material_index;part='body';weights=[]
 for vi in tri.vertices:
  weights.extend(groups.get(g.group,'') for g in mesh.vertices[vi].groups if g.weight>.5 and groups.get(g.group,'').startswith('life-wheel-'))
 if weights:part=max(set(weights),key=weights.count)
 gp=[pos(world@mesh.vertices[vi].co) for vi in tri.vertices];mid=[sum(v[k] for v in gp)/3 for k in range(3)]
 if key=='rescue' and mid[1]>(high[2]-low[2])*scale*.78 and max(v[1] for v in gp)-min(v[1] for v in gp)<.16 and math.hypot(mid[0],mid[2])>1.0 and max(math.dist(gp[i],gp[(i+1)%3]) for i in range(3))>.7:part='main-rotor'
 name=materials[mi]['name'].lower() if mi<len(materials) else ''
 if key in ['porsche','cruiser','i20','bmw','jeep','hilux'] and any(w in name for w in ['wheel1','calliper','tyre','tire','brakedisk','wheel_','rim']):part='life-wheel-'+('F' if mid[2]<0 else 'R')+('L' if mid[0]<0 else 'R')
 if key=='hornet' and (abs(mid[0])>3 or mid[2]>5.3):part='wing-left' if mid[0]<0 else 'wing-right' if mid[0]>0 else 'tail'
 b=batches.setdefault((mi,part),{'material':mi,'part':part,'p':[],'n':[],'uv':[],'c':[],'i':[],'lookup':{}})
 for vi,li,p in zip(tri.vertices,tri.loops,gp):
  n=normal(norm@mesh.corner_normals[li].vector);t=tuple(round(v,5) for v in uv.data[li].uv) if uv else (0,0);colour=tuple(round(v,4) for v in col.data[li if col.domain=='CORNER' else vi].color) if col else (1,1,1,1);value=p+n+t+colour
  if value not in b['lookup']:
   b['lookup'][value]=len(b['p'])//3;b['p']+=p;b['n']+=n;b['uv']+=t;b['c']+=colour
  b['i'].append(b['lookup'][value])
for b in batches.values():del b['lookup']
result={'key':key,'source':Path(path).name,'originalTriangles':original,'triangles':sum(len(b['i'])//3 for b in batches.values()),'materials':materials,'meshes':list(batches.values())}
result['bounds']={'min':[min(min(b['p'][k::3]) for b in batches.values()) for k in range(3)],'max':[max(max(b['p'][k::3]) for b in batches.values()) for k in range(3)]}
(out/'model.json').write_text(json.dumps(result,separators=(',',':')));print('EXPORTED',key,original,result['triangles'],len(batches),len(images),result['bounds'])
