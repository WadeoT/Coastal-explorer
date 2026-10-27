let renderingSuspended=false;
function renderGameFrame(dt){
 if(renderingSuspended)return;let phase='simulation';
 try{tick(dt);phase='render';if(state.mode!=='loading-map'||state.worldReady)scene.render();}
 catch(error){console.error(error);reportRuntimeError(error,phase);}
}
function reportRuntimeError(error,phase='simulation'){
 if(renderingSuspended)return;renderingSuspended=true;keys.clear();state.accumulator=0;state.mode='paused';AudioSystem.stop();
 state.lastError={message:String(error?.message||error),stack:String(error?.stack||''),phase};
 const panel=$('runtimeError');if(panel){$('runtimeErrorMessage').textContent=state.lastError.message;$('runtimeErrorReport').textContent=runtimeErrorReport();panel.classList.remove('hidden');}
}
function runtimeErrorReport(){return JSON.stringify({version:'V23',phase:state.lastError?.phase,message:state.lastError?.message,stack:state.lastError?.stack?.replace(/https?:\/\/[^\s)]+/g,u=>u.split('?')[0]),vehicle:state.vehicleId||null,worldReady:state.worldReady,connection:Multiplayer.connected?'connected':'not connected'},null,2);}
function initialiseRuntimeErrors(){
 const panel=document.createElement('section');panel.id='runtimeError';panel.className='public-lobby hidden';panel.setAttribute('role','alertdialog');panel.innerHTML='<div class="public-lobby-card"><h2>The game paused after an error</h2><p id="runtimeErrorMessage"></p><details><summary>Error details</summary><pre id="runtimeErrorReport"></pre></details><div class="shop-actions"><button id="runtimeReturnGarage" class="source-btn">RETURN TO GARAGE</button><button id="runtimeCopy" class="source-btn">COPY ERROR REPORT</button><button id="runtimeReload" class="source-btn">RELOAD GAME</button></div><p id="runtimeErrorHelp">Your saved career stays in this browser.</p></div>';document.body.append(panel);
 $('runtimeCopy').onclick=async()=>{try{await navigator.clipboard.writeText(runtimeErrorReport());$('runtimeErrorHelp').textContent='Error report copied.';}catch{$('runtimeErrorReport').parentElement.open=true;$('runtimeErrorHelp').textContent='Select and copy the error details above.';}};
 $('runtimeReturnGarage').onclick=()=>{try{state.mode='error';openGarage();state.lastError=null;renderingSuspended=false;panel.classList.add('hidden');}catch(e){$('runtimeErrorMessage').textContent=String(e.message);$('runtimeErrorHelp').textContent='Please reload the game to restore the renderer.';}};
 $('runtimeReload').onclick=()=>location.reload();
 engine.onContextLostObservable.add(()=>reportRuntimeError(new Error('The graphics context was lost. Wait for graphics recovery or reload the game.'),'graphics'));
}
