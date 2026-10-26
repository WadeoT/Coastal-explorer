// Play starts immediately. Multiplayer connects and retries in the background;
// the status badge distinguishes local play from a real server connection.
let lobbyLaunch=null,lobbyResume=false,lobbyRetry=null,lobbyAttempts=0,lobbyAutoWanted=false,lobbyHandshake=null,lobbyServerEdit=false;
const lobbyTabId=(()=>{try{let id=sessionStorage.getItem('coastal-tab');if(!id)sessionStorage.setItem('coastal-tab',id=crypto.randomUUID());return id;}catch{return crypto.randomUUID();}})();
function relaySessionKey(){return 'coastal-session:'+Multiplayer.relayOrigin;}
function getRelaySession(origin){
 try{
  const key='coastal-session:'+origin,tab=sessionStorage.getItem(key),lease=JSON.parse(localStorage.getItem(key+':lease')||'null');
  return tab||(!lease||lease.tab===lobbyTabId||lease.until<Date.now()?localStorage.getItem(key):'')||'';
 }catch{return '';}
}
function retainRelaySession(token){try{const key=relaySessionKey();sessionStorage.setItem(key,token);const lease=JSON.parse(localStorage.getItem(key+':lease')||'null');if(!lease||lease.tab===lobbyTabId||lease.until<Date.now()){localStorage.setItem(key,token);localStorage.setItem(key+':lease',JSON.stringify({tab:lobbyTabId,until:Date.now()+15000}));}}catch{}}
function releaseRelayLease(){try{const key=relaySessionKey(),lease=JSON.parse(localStorage.getItem(key+':lease')||'null');if(lease?.tab===lobbyTabId)localStorage.removeItem(key+':lease');}catch{}}
function refreshAutomaticLobby(){
 const status=$('publicLobbyStatus');if(!status)return;
 status.textContent=Multiplayer.status;
 $('connectionBadge').textContent=Multiplayer.connected?(Multiplayer.publicRoom?'PUBLIC LOBBY · ':'PRIVATE ROOM · ')+(Multiplayer.roster?.length||1)+' ONLINE':lobbyAutoWanted?'LOCAL PLAY · CONNECTING ONLINE':'LOCAL PLAY';
 $('connectionBadge').classList.toggle('connected',Multiplayer.connected);
 $('publicLobbySetup').hidden=!!$('relayInput').value.trim()&&!lobbyServerEdit;
 $('publicLobbyAttempts').textContent=Multiplayer.connected?'Connected · '+(Multiplayer.roomId||'room'):lobbyAttempts?'Connection attempt '+lobbyAttempts+' · retries automatically':'';
 const list=$('publicLobbyPlayers');list.replaceChildren();
 for(const p of Multiplayer.roster||[]){const row=document.createElement('li');row.textContent=(p.id===Multiplayer.id?'YOU · ':'')+(p.name||'Driver')+' · '+(profiles[p.vehicle]?.short||'Choosing a vehicle');list.append(row);}
}
function showAutomaticLobby(){
 $('publicLobby').classList.remove('hidden');refreshAutomaticLobby();
 if(state.mode==='playing'){state.mode='paused';lobbyResume=true;keys.clear();AudioSystem.stop();}
}
function finishAutomaticLobby(){
 clearTimeout(lobbyRetry);clearTimeout(lobbyHandshake);lobbyRetry=lobbyHandshake=null;lobbyAttempts=0;
 if(!Multiplayer.connected)return;
 $('publicLobby').classList.add('hidden');
 const next=lobbyLaunch;lobbyLaunch=null;
 if(next){lobbyResume=false;selectVehicle(next);}
 else if(lobbyResume&&state.profile){lobbyResume=false;state.mode='playing';state.accumulator=0;resetFlightInterpolation();AudioSystem.resume();$('world').focus();}
 refreshAutomaticLobby();
}
function launchFromLobby(type){
 if(!state.worldReady||!profiles[type]||!economy.owned.includes(type))return;
 lobbyLaunch=null;lobbyResume=false;$('publicLobby').classList.add('hidden');selectVehicle(type);
 if($('relayInput').value.trim()){lobbyAutoWanted=true;Multiplayer.autoJoin();}
 else Multiplayer.setStatus('Playing locally · a hosted server enables shared multiplayer.');
}
function queueLobbyReconnect(){
 clearTimeout(lobbyHandshake);lobbyHandshake=null;if(!lobbyAutoWanted)return;
 // Reconnection runs in the background and never blocks driving.
 const delay=Math.min(15000,1000*Math.pow(2,Math.min(4,lobbyAttempts-1)));
 clearTimeout(lobbyRetry);lobbyRetry=setTimeout(()=>{lobbyRetry=null;Multiplayer.autoJoin();},delay);
}
function initialiseAutomaticLobby(){
 const badge=document.createElement('button');badge.id='connectionBadge';badge.className='connection-badge';badge.textContent='LOBBY · NOT CONNECTED';badge.onclick=()=>{Multiplayer.renderLobby();openModal('lobbyModal');};document.body.append(badge);
 const legend=document.createElement('p');legend.className='map-contacts-legend';legend.innerHTML='<span class="players">● Players</span> · <span class="police">◆ Police / interceptors</span> · Edge arrows show bearing and distance';$('mapModal').querySelector('.dialog').append(legend);
 const gate=document.createElement('section');gate.id='publicLobby';gate.className='public-lobby hidden';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-labelledby','publicLobbyTitle');
 gate.innerHTML='<div class="public-lobby-card"><small>COASTAL EXPLORER · ONLINE</small><h2 id="publicLobbyTitle">Joining the public lobby</h2><p id="publicLobbyStatus" role="status"></p><p id="publicLobbyAttempts"></p><ul id="publicLobbyPlayers"></ul><div id="publicLobbySetup"><p>Connect a hosted server for shared multiplayer. Local Play remains available. The site owner can configure the server once when hosting.</p><label>Multiplayer server URL<input id="publicLobbyRelay" class="maps-key-input" type="url" placeholder="https://your-hosted-relay.example"></label><button id="publicLobbyConnect" class="source-btn">SAVE SERVER & CONNECT</button><a href="https://github.com/WadeoT/Coastal-explorer/blob/codex/sunshine-coast-game/docs/NETLIFY-MULTIPLAYER.md" target="_blank" rel="noopener">Hosting setup guide</a></div><div class="shop-actions"><button id="publicLobbyRetry" class="source-btn">RETRY NOW</button><button id="publicLobbyChangeServer" class="source-btn">CHANGE SERVER</button><button id="publicLobbyGarage" class="source-btn">BACK TO GARAGE</button></div></div>';
 document.body.append(gate);
 $('publicLobbyConnect').onclick=()=>{$('relayInput').value=$('publicLobbyRelay').value.trim();saveRelayPreference();Multiplayer.autoJoin();refreshAutomaticLobby();};
 $('publicLobbyChangeServer').onclick=()=>{lobbyServerEdit=true;$('publicLobbyRelay').value=$('relayInput').value;refreshAutomaticLobby();};
 $('publicLobbyRetry').onclick=()=>{clearTimeout(lobbyRetry);Multiplayer.autoJoin();};
 $('publicLobbyGarage').onclick=()=>{lobbyLaunch=null;lobbyResume=false;gate.classList.add('hidden');state.mode='garage';openGarage();};
 $('relayInput').addEventListener('change',saveRelayPreference);
 $('leaveRoom').textContent='REJOIN PUBLIC LOBBY';$('leaveRoom').onclick=()=>{Multiplayer.leave();lobbyAutoWanted=true;Multiplayer.autoJoin(true);};
 setInterval(()=>{if(Multiplayer.connected&&Multiplayer.relayMode){const token=getRelaySession(Multiplayer.relayOrigin);if(token)retainRelaySession(token);}},5000);
 if($('relayInput').value.trim()){lobbyAutoWanted=true;Multiplayer.autoJoin();}
 else Multiplayer.setStatus('Playing locally · multiplayer server not configured.');
}
function saveRelayPreference(){try{localStorage.setItem('coastal-relay-url',$('relayInput').value.trim());}catch{}}
