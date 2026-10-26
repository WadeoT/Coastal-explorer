function mapContacts(){
 const contacts=[];
 for(const [id,r] of Multiplayer.remotes){const s=r.target;if(!Multiplayer.validSnapshot(s))continue;contacts.push({id,type:'player',name:s.name||'Player',x:s.x,y:s.y,z:s.z,yaw:s.yaw});}
 for(const ai of trafficPool)if(ai.police&&ai.health>0&&ai.root.isEnabled()){const p=ai.root.position;contacts.push({id:'police-'+ai.index,type:'police',name:'POLICE',x:p.x,y:p.y,z:p.z,yaw:ai.yaw,pursuing:ai.pursuing});}
 for(const [i,a] of gameAirspace.interceptors.entries())if(a.active){const p=a.root.position;contacts.push({id:'interceptor-'+i,type:'interceptor',name:'INTERCEPTOR',x:p.x,y:p.y,z:p.z,yaw:a.yaw});}
 if(policeAirUnit){const p=policeAirUnit.root.position;contacts.push({id:'police-air-support',type:'police',name:'POLICE HELICOPTER',x:p.x,y:p.y,z:p.z,yaw:policeAirUnit.yaw});}return contacts;
}
function drawMapContacts(ctx,project,mini=false){
 const w=ctx.canvas.width,h=ctx.canvas.height,drawn=[];ctx.save();
 for(const c of mapContacts()){
  const q=project(c);let x=q.x,y=q.y,edge=false;
  if(mini){const dx=x-w/2,dy=y-h/2,fit=Math.max(1,Math.abs(dx)/(w/2-19),Math.abs(dy)/(h/2-24));edge=fit>1;x=w/2+dx/fit;y=h/2+dy/fit;}
  else if(x<10||y<10||x>w-10||y>h-10)continue;
  const colour=c.type==='player'?'#57d5ff':c.type==='interceptor'?'#ff795f':'#ff5f72',size=mini?7:10;
  if(edge)drawArrow(ctx,x,y,Math.atan2(q.x-w/2,-(q.y-h/2)),size,colour);
  else{ctx.fillStyle='#070b13';ctx.strokeStyle=colour;ctx.lineWidth=2.5;ctx.beginPath();if(c.type==='police'){ctx.moveTo(x,y-size);ctx.lineTo(x+size,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size,y);ctx.closePath();}else ctx.arc(x,y,size,0,TAU);ctx.fill();ctx.stroke();if(c.type==='interceptor')drawArrow(ctx,x,y,c.yaw,size*.8,colour);}
  const distance=Math.hypot(c.x-player.position.x,c.z-player.position.z),text=edge?(distance>=1000?(distance/1000).toFixed(1)+'km':Math.round(distance)+'m'):mini?(c.type==='player'?c.name.slice(0,12):'POLICE'):c.name;
  ctx.font='bold '+(mini?13:18)+'px sans-serif';ctx.textAlign=x>w*.72?'right':'left';const lx=x+(x>w*.72?-11:11),ly=clamp(y-10,16,h-6);ctx.lineWidth=4;ctx.strokeStyle='#080c14';ctx.strokeText(text,lx,ly);ctx.fillStyle=colour;ctx.fillText(text,lx,ly);
  drawn.push({id:c.id,type:c.type,x,y,edge});
 }
 ctx.restore();return drawn;
}
