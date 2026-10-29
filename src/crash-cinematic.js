const crashCinematic={enabled:true,until:0,cooldownUntil:0};
try{crashCinematic.enabled=localStorage.getItem('coastal-crash-slow-motion')!=='off';}catch{}
function resetCrashCinematic(){crashCinematic.until=0;crashCinematic.cooldownUntil=0;}
function triggerCrashCinematic(speed){
 const now=performance.now();if(!crashCinematic.enabled||!soloOffline||Multiplayer.connected||groundEscape.active||!Number.isFinite(speed)||speed<14||now<crashCinematic.cooldownUntil||state.mode!=='playing')return false;
 crashCinematic.until=now+2200;crashCinematic.cooldownUntil=now+5000;return true;
}
function crashSimulationDelta(dt){
 if(!crashCinematic.until)return dt;if(!crashCinematic.enabled||!soloOffline||Multiplayer.connected||!['playing','wrecked'].includes(state.mode)){crashCinematic.until=0;return dt;}
 const remaining=crashCinematic.until-performance.now();if(remaining<=0){crashCinematic.until=0;return dt;}const blend=clamp(1-remaining/600,0,1);return dt*(.22+.78*blend*blend);
}
function initialiseCrashCinematic(){const label=document.createElement('label');label.className='settings-line';const input=document.createElement('input');input.id='crashSlowMotion';input.type='checkbox';input.checked=crashCinematic.enabled;input.onchange=()=>{crashCinematic.enabled=input.checked;if(!input.checked)resetCrashCinematic();try{localStorage.setItem('coastal-crash-slow-motion',input.checked?'on':'off');}catch{}};label.append(input,document.createTextNode('Slow-motion crashes · solo play'));$('graphicsPanel').append(label);}
