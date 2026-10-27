function publicServerName(room){return room==='COAST-PUBLIC'?'SUNSHINE COAST PUBLIC':'FRIENDS ROOM';}
let publicRosterSignature='',remoteTagClock=0;
function connectedServerPlayers(){
 const mp=Multiplayer;if(!mp.connected)return [];
 if(mp.roster?.length)return mp.roster;
 return [{id:mp.id,name:mp.name(),vehicle:state.profile&&state.mode!=='garage'?state.vehicleId:null},...[...mp.remotes].map(([id,r])=>({id,name:r.target.name,vehicle:r.vehicle}))];
}
function refreshPublicServerUI(){
 if(!$('publicServerSummary'))return;const mp=Multiplayer,players=connectedServerPlayers(),onPublic=mp.connected&&mp.publicTransport&&mp.roomId==='COAST-PUBLIC',peerCount=players.filter(p=>p.id!==mp.id).length;
 if($('connectionRouteReport'))$('connectionRouteReport').textContent=connectionDiagnosticText();
 $('publicServerJoin').textContent=onPublic?'PLAY IN THIS SERVER':'JOIN PUBLIC SERVER';
 $('publicServerSummary').textContent=onPublic?players.length+' / 16 ONLINE · '+(peerCount?peerCount+' other player'+(peerCount===1?'':'s'):'Just you right now'):mp.connected?'You are in '+(mp.roomId||'another room')+' · choose below to join the common public server':mp.publicTransport?(mp.publicTransport.links.some(l=>l.attempt)?'Connection unavailable · retrying · player count unknown':'Connecting · player count unavailable'):'Not connected to the public server';
 $('publicServerHelp').textContent=onPublic?(peerCount?'Everyone connected is listed below. Use FIND ON MAP to locate a player.':'Connected successfully. No other players detected here yet. Your mate can click JOIN PUBLIC SERVER to join you.'):'You can keep driving while the connection retries. The game tries standard HTTPS port 443 first, then two backup routes. If all fail, your network or browser may block WebSockets; local play stays available.';
 const signature=JSON.stringify([mp.connected,mp.id,mp.roomId,players.map(p=>[p.id,p.name,p.vehicle]),[...mp.remotes].map(([id,r])=>[id,Math.round(r.target.x/20),Math.round(r.target.z/20)]),Math.round(player?.position.x/20),Math.round(player?.position.z/20)]);
 if(signature===publicRosterSignature)return;publicRosterSignature=signature;
 $('onlinePlayerHeading').textContent=mp.connected?'PLAYERS IN YOUR SERVER · '+players.length+' ONLINE':'PLAYERS · NOT CONNECTED';
 const list=$('roomPlayers');list.replaceChildren();
 if(!players.length){const row=document.createElement('p');row.textContent='Player list unavailable until the server connects.';list.append(row);return;}
 for(const p of players){const row=document.createElement('div');row.className='online-player-row';row.dataset.playerId=p.id;const text=document.createElement('span'),r=mp.remotes.get(p.id),distance=r&&state.profile?Math.hypot(r.target.x-player.position.x,r.target.z-player.position.z):null;
  text.textContent=(p.id===mp.id?'YOU · ':'● ')+(p.name||'Driver')+' · '+(r?.ejected?'ON FOOT / PILOT':profiles[p.vehicle]?.short||'In garage / choosing a vehicle')+(distance===null?'':' · '+(distance>=1000?(distance/1000).toFixed(1)+' km away':Math.round(distance)+' m away'));row.append(text);
  if(r){const locate=document.createElement('button');locate.className='source-btn';locate.textContent='FIND ON MAP';locate.onclick=()=>{const current=mp.remotes.get(p.id);if(!current)return;mapView.x=current.target.x;mapView.z=current.target.z;mapView.zoom=2;mapView.selection={x:current.target.x,z:current.target.z};if(state.profile)setPersonalWaypoint(mapView.selection,(current.target.name||'Player')+' · last marked position');openModal('mapModal');drawBigMap();};row.append(locate);}list.append(row);
 }
}
function updateRemotePlayerTags(dt){
 remoteTagClock+=dt;if(remoteTagClock<.1)return;remoteTagClock=0;
 const holder=$('remotePlayerTags');if(!holder||!camera||!scene)return;
 if(!state.profile||state.mode==='garage'||!Multiplayer.connected){holder.replaceChildren();return;}
 const rect=$('world').getBoundingClientRect(),viewport=camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()),visible=new Set();
 for(const [id,r]of Multiplayer.remotes){const s=r.target,distance=Math.hypot(s.x-player.position.x,s.z-player.position.z);if(distance>1500)continue;
  const point=V.Project(new V(r.root.position.x,r.root.position.y+(profiles[r.vehicle].kind==='heli'?4:2.5),r.root.position.z),Matrix.Identity(),scene.getTransformMatrix(),viewport);if(point.z<0||point.z>1)continue;
  const x=rect.left+point.x/engine.getRenderWidth()*rect.width,y=rect.top+point.y/engine.getRenderHeight()*rect.height;if(x<0||x>innerWidth||y<0||y>innerHeight)continue;
  let label=[...holder.children].find(n=>n.dataset.playerId===id);if(!label){label=document.createElement('span');label.dataset.playerId=id;holder.append(label);}label.textContent=(s.name||'Player')+' · '+Math.round(distance)+' m';label.style.transform='translate(-50%, -100%) translate('+x+'px,'+y+'px)';visible.add(id);
 }
 for(const label of [...holder.children])if(!visible.has(label.dataset.playerId))label.remove();
}
function initialisePublicServerUI(){
 const css=document.createElement('style');css.textContent='.public-server-card{background:#151d2a;border:1px solid #607899;border-radius:8px;padding:16px;margin:14px 0;color:#edf4ff}.public-server-card h3{margin:6px 0}.public-server-card small{font-size:10px;letter-spacing:1px;color:#9ccaff}.public-server-card p{font-size:12px!important;line-height:1.6}.public-server-card .source-btn{background:#d9e8ff;color:#10151d;font-weight:bold}.online-player-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #415066;font-size:12px}.online-player-row .source-btn{flex-shrink:0;font-size:10px;margin:0}#roomPlayers{max-height:260px!important;overflow:auto}#remotePlayerTags{position:fixed;inset:0;z-index:7;pointer-events:none}#remotePlayerTags span{position:absolute;top:0;left:0;white-space:nowrap;background:#101827dc;border:1px solid #70bcff;color:#d5eeff;font:bold 12px sans-serif;border-radius:4px;padding:4px 7px}.modal-backdrop:not(.hidden)~#remotePlayerTags{display:none}@media(max-width:600px){.online-player-row{align-items:flex-start;flex-direction:column;gap:5px}}';document.head.append(css);
 const tags=document.createElement('div');tags.id='remotePlayerTags';tags.setAttribute('aria-hidden','true');document.body.append(tags);
 $('publicServerJoin').onclick=()=>{const mp=Multiplayer;if(mp.connected&&mp.publicTransport&&mp.roomId==='COAST-PUBLIC'){closeModal('lobbyModal');return;}joinPublicBrokerRoom();saveRelayPreference();refreshAutomaticLobby();};
 $('playerName').addEventListener('input',()=>{try{localStorage.setItem('coastal-player-name',$('playerName').value);}catch{}});
 try{const name=localStorage.getItem('coastal-player-name');if(name)$('playerName').value=name.slice(0,20);else $('playerName').value='Driver '+lobbyTabId.slice(0,4);}catch{}
 const diagnostic=document.createElement('details');diagnostic.id='connectionDiagnostics';diagnostic.innerHTML='<summary>Connection diagnostics · V25</summary><pre id="connectionRouteReport" style="white-space:pre-wrap;font:11px monospace;line-height:1.6"></pre><button id="copyConnectionReport" class="source-btn">COPY CONNECTION REPORT</button><a class="source-btn" target="_blank" rel="noopener" href="https://wadeot.github.io/Coastal-explorer/index.html?v=25&amp;publicRoom=COAST-PUBLIC">OPEN FRESH V25</a>';$('publicServerHelp').after(diagnostic);$('copyConnectionReport').onclick=async()=>{const report=connectionDiagnosticText();try{await navigator.clipboard.writeText(report);toast('Connection report copied.');}catch{const box=document.createElement('textarea');box.value=report;diagnostic.append(box);box.select();document.execCommand('copy');box.remove();toast('Connection report selected and copied.');}};
 setInterval(refreshPublicServerUI,500);
}

function connectionDiagnosticText(){const mp=Multiplayer;return ['Coastal Explorer V25',location.origin+location.pathname,'Online: '+navigator.onLine+' · HTTPS: '+isSecureContext+' · Browser: '+navigator.userAgent,...(mp.publicTransport?.links||[]).map(l=>l.url+' — '+(l.ready?'CONNECTED':l.lastError||'Connecting')+' · attempts '+l.attempt),'Policy blocks: '+(connectionPolicyBlocks.join(', ')||'none reported')].join('\n');}
const connectionPolicyBlocks=[];window.addEventListener('securitypolicyviolation',e=>{if(e.effectiveDirective==='connect-src'&&connectionPolicyBlocks.length<8)connectionPolicyBlocks.push(String(e.blockedURI).split('?')[0].split('#')[0]);});
