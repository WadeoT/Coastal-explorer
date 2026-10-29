// Runs before the runtime/map scripts so boot failures cannot hide behind a spinner.
(()=>{
 const panel=document.getElementById('loading'),text=document.getElementById('loadingText');let complete=false;
 const actions=document.createElement('div');actions.id='startupActions';actions.hidden=true;actions.style.cssText='max-width:480px;margin:20px auto;letter-spacing:normal';
 const note=document.createElement('p');note.textContent='Loading is taking longer than usual. You can keep waiting or try lower graphics. Your career is kept.';note.style.cssText='font-size:13px;letter-spacing:normal;line-height:1.5';actions.append(note);
 const button=(label,fn)=>{const b=document.createElement('button');b.className='source-btn';b.textContent=label;b.style.margin='10px 5px';b.onclick=fn;actions.append(b);return b;};
 button('RELOAD GAME',()=>location.reload());
 button('START WITH LOW GRAPHICS',()=>{try{localStorage.setItem('coastal-graphics-v1',JSON.stringify({preset:'low',resolution:85,groundDistance:650,airDistance:2600,traffic:55,vegetation:60,shadows:false,adaptive:true,water:false,clouds:true,fps:45}));}catch{}location.reload();});
 panel.firstElementChild.append(actions);
 const timer=setTimeout(()=>{if(!complete)actions.hidden=false;},25000);
 window.CoastalStartup={
  stage(message){if(!complete)text.textContent=message;},
  ready(){complete=true;clearTimeout(timer);panel.classList.add('hidden');},
  fail(message){if(complete)return;clearTimeout(timer);text.textContent=String(message);text.style.cssText='white-space:pre-wrap;max-width:600px;line-height:1.6;letter-spacing:normal;font-size:14px';note.textContent='The game could not finish loading. Try reloading or starting with low graphics. Your saved career has not been cleared.';actions.hidden=false;}
 };
 window.addEventListener('error',event=>{if(event.message)window.CoastalStartup.fail(event.message);});
 window.addEventListener('unhandledrejection',event=>window.CoastalStartup.fail(event.reason?.message||String(event.reason)));
})();
