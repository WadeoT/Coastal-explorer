from pxr import Usd,UsdGeom,UsdShade
from pathlib import Path
import zipfile,sys,re
src=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(exist_ok=True,parents=True)
z=zipfile.ZipFile(src)
for f in z.infolist():
 if '..' in Path(f.filename).parts or Path(f.filename).is_absolute() or f.is_dir():continue
 p=out/f.filename;p.parent.mkdir(exist_ok=True,parents=True);p.write_bytes(z.read(f))
s=Usd.Stage.Open(str(out/'scene.usdc'));cache=UsdGeom.XformCache();up=UsdGeom.GetStageUpAxis(s);obj=open(out/'hilux.obj','w');mtl=open(out/'hilux.mtl','w');obj.write('mtllib hilux.mtl\n');vbase=tbase=nbase=0;mats={}
def xyz(p):return tuple(p)  # This asset's mesh is Z-up despite its stage metadata.
def material(prim):
 mat,_=UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()
 if not mat:return None
 key=str(mat.GetPath())
 if key in mats:return mats[key]
 name=re.sub('[^A-Za-z0-9_]','_',mat.GetPrim().GetName())+'_'+str(len(mats));mats[key]=name;shader=mat.ComputeSurfaceSource()[0];mtl.write('newmtl '+name+'\nKd 1 1 1\n')
 if shader:
  d=shader.GetInput('diffuseColor');value=d.Get() if d else None
  if value:mtl.write('Kd '+' '.join(str(a) for a in value)+'\n')
  conn=d.GetConnectedSource() if d else None
  if conn:
   texture=UsdShade.Shader(conn[0].GetPrim());f=texture.GetInput('file').Get()
   if f:
    p=out/f.path
    if not p.is_file():
     matches=list(out.rglob(Path(f.path).name));p=matches[0] if matches else p
    if p.is_file():mtl.write('map_Kd '+str(p)+'\n')
 return name
for prim in s.Traverse():
 if not prim.IsA(UsdGeom.Mesh):continue
 mesh=UsdGeom.Mesh(prim);points=mesh.GetPointsAttr().Get();counts=mesh.GetFaceVertexCountsAttr().Get();indices=mesh.GetFaceVertexIndicesAttr().Get();world=cache.GetLocalToWorldTransform(prim);uv=UsdGeom.PrimvarsAPI(prim).GetPrimvar('st');uvs=uv.ComputeFlattened() if uv else [];interp=str(uv.GetInterpolation()) if uv else '';normals=mesh.GetNormalsAttr().Get() or [];ninterp=str(mesh.GetNormalsInterpolation());obj.write('o '+prim.GetName()+'\n')
 for p in points:obj.write('v '+' '.join(str(a) for a in xyz(world.Transform(p)))+'\n')
 for t in uvs:obj.write('vt '+str(t[0])+' '+str(t[1])+'\n')
 for n in normals:obj.write('vn '+' '.join(str(a) for a in xyz(world.TransformDir(n)))+'\n')
 mat=material(prim)
 if mat:obj.write('usemtl '+mat+'\n')
 at=0
 for fi,count in enumerate(counts):
  face=[]
  for j in range(count):
   vi=indices[at+j];ti=(at+j if interp=='faceVarying' else vi) if uvs else None;ni=(at+j if ninterp=='faceVarying' else vi if ninterp in ['vertex','varying'] else fi) if normals else None
   face.append(str(vbase+vi+1)+('/'+str(tbase+ti+1) if ti is not None else '/')+('/'+str(nbase+ni+1) if ni is not None else ''))
  obj.write('f '+' '.join(face)+'\n');at+=count
 vbase+=len(points);tbase+=len(uvs);nbase+=len(normals)
obj.close();mtl.close();print('Exported Hilux OBJ',vbase,'vertices',len(mats),'materials')
