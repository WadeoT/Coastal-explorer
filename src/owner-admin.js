let localAdminUnlocked=false;
function adminPanelUnlocked(){return localAdminUnlocked||Multiplayer.isOwner;}
function unlockGameAdmin(code){
 if(code==='Iamsteve'){localAdminUnlocked=true;$('ownerStatus').textContent='Code accepted · local controls unlocked.';refreshOwnerAdminUI();if(Multiplayer.connected&&Multiplayer.relayMode)Multiplayer.authenticateOwner(code);return true;}
 if(Multiplayer.connected&&Multiplayer.relayMode)return Multiplayer.authenticateOwner(code);
 $('ownerStatus').textContent='Incorrect admin code.';return false;
}
async function runLocalAdmin(cmd,args){
 if(cmd==='action'){
  const [target,action,...values]=args;if(!['me','all',Multiplayer.id].includes(target))return 'A shared-player action requires server owner authentication.';
  await applyOwnerAction({actionId:crypto.randomUUID(),action,args:values},true);return 'Applied '+action+' to your player.';
 }
 if(cmd==='gift'){if(!['me','all',Multiplayer.id].includes(args[0]))return 'Connect as server owner to gift another player.';const amount=Number(args[1]);if(!Number.isInteger(amount)||amount<1||amount>50000000)return 'Gift must be 1–50,000,000.';economy.balance=Math.min(1e10,economy.balance+amount);saveCareer();updateWallet();return 'Gifted '+dollars(amount);}
 if(cmd==='time'){const value=Number(args[0]);if(!Number.isFinite(value)||value<0||value>=24)return 'Time must be 0–23.99.';worldUpgrade.time=value/24;return 'Local time updated.';}
 if(cmd==='weather')return setWeather(args[0])?'Local weather updated.':'Unknown weather.';
 if(cmd==='settings'){const [key,value]=args;if(['policeEnabled','autoWeather'].includes(key))Multiplayer.serverSettings[key]=['true','on'].includes(value);else if(key==='rewardMultiplier'&&Number(value)>=.25&&Number(value)<=5)Multiplayer.serverSettings[key]=Number(value);else if(key==='maxPlayers')return 'Room capacity applies to a hosted server.';else return 'Invalid setting.';return 'Local setting updated.';}
 if(cmd==='players')return 'You · local player';if(cmd==='bans'){Multiplayer.bannedPlayers=[];refreshOwnerBans();return 'Bans require a connected server.';}
 if(['ban','unban','kick'].includes(cmd))return 'Connect as server owner to moderate other players.';
 if(['cash','repair','give','vehicle','wanted','tp','noclip'].includes(cmd))return executeOwnerLocal([cmd,...args].join(' '));
 return 'Unknown command.';
}
function runAdmin(command){
 const parts=String(command).trim().split(/\s+/),cmd=(parts.shift()||'help').toLowerCase();
 if(cmd==='help')return 'Owner login is required. Player actions: action <me|all|player ID> wanted <0–5> | money <amount> | repair | damage <component> <1–100> | fire | explode | freeze | unfreeze | tp <lat> <lon> | vehicle <ID> | job <ID> | canceljob | interceptors. Commands: gift <player ID|me> <amount> | ban <player ID> [reason] | unban <ID> | kick <ID> | players | time <0–24> | weather clear/cloudy/rain/storm/fog | settings maxPlayers <2–16> | settings rewardMultiplier <0.25–5> | settings policeEnabled on/off | settings autoWeather on/off | cash <amount> | repair | give <vehicle ID> | vehicle <ID> | wanted <0–5> | tp <lat> <lon> | noclip on/off';
 if(!Multiplayer.isOwner){if(!localAdminUnlocked)return 'Owner authentication required. Enter the admin code to unlock.';return Multiplayer.publicTransport?runCommunityAdmin(cmd,parts):runLocalAdmin(cmd,parts);}
 if(cmd==='wanted'&&parts.length>=2)return Multiplayer.requestAdmin('action',[parts[0],'wanted',parts[1]]);if(['money','cash'].includes(cmd)&&parts.length>=2)return Multiplayer.requestAdmin('action',[parts[0],'money',parts[1]]);
 if(['action','gift','ban','unban','bans','kick','players','time','weather','settings'].includes(cmd))return Multiplayer.requestAdmin(cmd,parts);
 if(['cash','repair','give','vehicle','wanted','tp','noclip'].includes(cmd))return Multiplayer.requestAdmin('client-action',[cmd,...parts]);
 return 'Unknown command. Type help.';
}
function receiveOwnerGift(gift){
 if(!gift||typeof gift.id!=='string'||!Number.isInteger(gift.amount)||gift.amount<1||gift.amount>50000000)return;
 economy.receivedGifts??=[];
 if(!economy.receivedGifts.includes(gift.id)){economy.balance=Math.min(1e10,economy.balance+gift.amount);economy.receivedGifts.push(gift.id);economy.receivedGifts=economy.receivedGifts.slice(-2000);saveCareer();updateWallet();toast('Owner gift · +'+dollars(gift.amount));}
 Multiplayer.send(Multiplayer.connections.get('relay'),{type:'gift-ack',id:gift.id});
}

const appliedOwnerActions=new Set();
async function applyOwnerAction(data,local=false,verifiedPublic=false){
 if(!data||typeof data.actionId!=='string'||appliedOwnerActions.has(data.actionId)||!(verifiedPublic|| (local?localAdminUnlocked:Multiplayer.relayMode)))return;appliedOwnerActions.add(data.actionId);if(appliedOwnerActions.size>1000)appliedOwnerActions.delete(appliedOwnerActions.values().next().value);const args=data.args||[];resetDrivingRewards();
 switch(data.action){
 case 'money':if(!Number.isInteger(Number(args[0]))||Number(args[0])<0||Number(args[0])>100000000)return;economy.balance=Number(args[0]);saveCareer();updateWallet();break;
 case 'wanted':if(!Number.isInteger(Number(args[0]))||Number(args[0])<0||Number(args[0])>5)return;state.wanted=Number(args[0]);state.heat=state.wanted?WANTED_THRESHOLDS[state.wanted-1]:0;state.fiveStarPressure=0;state.evade=0;state.adminTest=true;updatePoliceDeployment();break;
 case 'repair':if(state.profile)repairVehicleDamage();break;
 case 'damage':if(state.profile)damageComponent(args[0],Number(args[1]),'owner test');break;
 case 'fire':if(state.damage){state.damage.burning=true;state.damage.fireTime=0;}break;
 case 'explode':if(state.damage){VehicleDamageModel.explode(state.damage);updateVehicleDamage(1/60);}break;
 case 'freeze':state.inputFrozen=true;keys.clear();motion.vx=motion.vz=motion.vy=0;break;
 case 'unfreeze':state.inputFrozen=false;break;
 case 'tp':if(state.profile){state.wanted=0;state.heat=0;{const p=geoToLocal(Number(args[0]),Number(args[1]));await teleportTo(p.x,p.z);}}break;
 case 'vehicle':if(profiles[args[0]]){if(!economy.owned.includes(args[0]))economy.owned.push(args[0]);saveCareer();selectVehicle(args[0]);}break;
 case 'job':{const job=availableContracts().find(j=>j.id===args[0]);if(job){state.wanted=0;await startActivity(job);}else toast('That job is not compatible with the current vehicle.');break;}
 case 'canceljob':cancelActivity('Owner cancelled job');break;
 case 'interceptors':if(isAircraft()){state.wanted=5;state.heat=450;state.forceInterceptors=true;state.adminTest=true;updatePoliceDeployment();}break;
 }
 toast('Owner action · '+data.action,2500);
}

function refreshOwnerAdminUI(){
 if(!$('ownerTarget'))return;const select=$('ownerTarget'),value=select.value;
 const players=new Map((Multiplayer.roster||[]).filter(p=>p.id!==Multiplayer.id).map(p=>[p.id,p.name]));
 for(const [id,r] of Multiplayer.remotes)players.set(id,r.target.name);
 const options=[['me','My player'],['all','All connected players'],...[...players].map(([id,name])=>[id,name+' · '+id.slice(0,8)])],signature=JSON.stringify(options);
 if(select.dataset.options!==signature){select.dataset.options=signature;select.replaceChildren(...options.map(([id,label])=>{const o=document.createElement('option');o.value=id;o.textContent=label;return o;}));if(options.some(o=>o[0]===value))select.value=value;}
 for(const b of $('adminModal').querySelectorAll('[data-owner]'))b.disabled=!adminPanelUnlocked();
 $('ownerAccessHint').textContent=adminPanelUnlocked()?communityOwnerSecret?'Owner key loaded · public grants await recipient acknowledgement.':'Local admin unlocked · import the owner key to target other public players.':'Enter the admin code above to unlock. No server is needed for your own player.';
 if($('ownerVehicle').options.length===0)for(const [id,p] of Object.entries(profiles)){const o=document.createElement('option');o.value=id;o.textContent=p.name;$('ownerVehicle').append(o);}
 const jobKey=state.vehicleId+':'+Math.floor(player.position.x/1000)+':'+Math.floor(player.position.z/1000);if($('ownerJob').dataset.jobCache!==jobKey){$('ownerJob').dataset.jobCache=jobKey;const jobs=availableContracts();$('ownerJob').replaceChildren(...jobs.map(j=>{const o=document.createElement('option');o.value=j.id;o.textContent=j.title||j.name||j.id;return o;}));}
}
function refreshOwnerBans(){if(!$('ownerBanList'))return;const list=$('ownerBanList');list.replaceChildren();for(const p of Multiplayer.bannedPlayers||[]){const row=document.createElement('div'),text=document.createElement('span'),button=document.createElement('button');text.textContent=p.id.slice(0,8)+' · '+(p.reason||'Banned');button.className='source-btn';button.textContent='UNBAN';button.dataset.owner='';button.onclick=async()=>{await ownerPanelCommand('unban',[p.id]);await ownerPanelCommand('bans');};row.append(text,button);list.append(row);}}
async function ownerPanelCommand(command,args=[]){const result=await runAdmin([command,...args].join(' '));$('adminOutput').textContent=result;return result;}
function syncOwnerSettings(){const s=Multiplayer.serverSettings;$('ownerClock').value=String(Math.floor((s.time??worldUpgrade.time)*24)).padStart(2,'0')+':'+String(Math.floor((s.time??worldUpgrade.time)*1440)%60).padStart(2,'0');$('ownerWeather').value=s.weather||worldUpgrade.weather;$('ownerCapacity').value=s.maxPlayers||Multiplayer.maxPlayers;$('ownerReward').value=s.rewardMultiplier;$('ownerPolice').checked=s.policeEnabled!==false;$('ownerAutoWeather').checked=s.autoWeather!==false;}
function initialiseOwnerUI(){
 const box=document.createElement('section');box.className='owner-tools';box.innerHTML=`
 <p id="ownerAccessHint" role="status"></p><button id="ownerConnect" class="source-btn">CONNECT TO PUBLIC LOBBY</button>
 <label>Apply player actions to<select id="ownerTarget" class="maps-key-input"></select></label>
 <fieldset><legend>Money</legend><label>Amount (A$)<input id="ownerMoney" class="maps-key-input" type="number" min="0" max="100000000" value="5000000"></label><div id="ownerCashPresets" class="owner-button-grid"></div><div class="owner-button-grid"><button id="ownerSetMoney" data-owner>SET BALANCE</button><button id="ownerGiftMoney" data-owner>GIFT MONEY</button></div></fieldset>
 <fieldset><legend>Wanted level</legend><div id="ownerWanted" class="owner-button-grid"></div></fieldset>
 <fieldset><legend>Vehicle and health</legend><label>Vehicle<select id="ownerVehicle" class="maps-key-input"></select></label><button id="ownerGrantVehicle" data-owner>GIVE & SELECT VEHICLE</button><div id="ownerEffects" class="owner-button-grid"></div><div class="owner-form-row"><label>Component<select id="ownerComponent"><option value="engine">Engine</option><option value="radiator">Coolant / radiator</option><option value="oil">Oil system</option><option value="fuel">Fuel tank</option><option value="driver">Driver</option><option value="body">Body</option></select></label><label>Damage %<input id="ownerDamageAmount" type="number" min="1" max="100" value="50"></label></div><button id="ownerDamageApply" data-owner>APPLY DAMAGE</button></fieldset>
 <fieldset><legend>Travel and jobs</legend><div class="owner-button-grid"><button id="ownerBringHere" data-owner>BRING TARGET HERE</button><button id="ownerGoTo" data-owner>GO TO PLAYER</button></div><label>Job (must match target vehicle)<select id="ownerJob" class="maps-key-input"></select></label><div class="owner-button-grid"><button id="ownerStartJob" data-owner>START JOB</button><button id="ownerCancelJob" data-owner>CANCEL JOB</button></div></fieldset>
 <fieldset><legend>Moderation</legend><p>Select one other player to kick or ban.</p><label>Reason<input id="ownerBanReason" class="maps-key-input" maxlength="120" value="Removed by owner"></label><div class="owner-button-grid"><button id="ownerKick" data-owner>KICK PLAYER</button><button id="ownerBan" data-owner>BAN PLAYER</button><button id="ownerRefreshBans" data-owner>SHOW BANS</button></div><div id="ownerBanList"></div></fieldset>
 <fieldset><legend>Server settings</legend><div class="owner-form-row"><label>Time<input id="ownerClock" type="time" value="14:00"></label><label>Weather<select id="ownerWeather"><option>clear</option><option>cloudy</option><option>rain</option><option>storm</option><option>fog</option></select></label></div><div class="owner-button-grid"><button id="ownerSetTime" data-owner>SET TIME</button><button id="ownerSetWeather" data-owner>SET WEATHER</button></div><div class="owner-form-row"><label>Players per room<input id="ownerCapacity" type="number" min="2" max="16" value="8"></label><label>Reward multiplier<input id="ownerReward" type="number" min="0.25" max="5" step="0.25" value="1"></label></div><label><input id="ownerPolice" type="checkbox" checked> Police enabled</label><label><input id="ownerAutoWeather" type="checkbox" checked> Automatic weather</label><div class="owner-button-grid"><button id="ownerApplySettings" data-owner>APPLY SERVER SETTINGS</button><button id="ownerReadSettings">LOAD CURRENT SETTINGS</button></div></fieldset>`;
 $('adminForm').before(box);const advanced=document.createElement('details');advanced.className='owner-advanced';const summary=document.createElement('summary');summary.textContent='Advanced command console';advanced.append(summary);$('adminForm').before(advanced);advanced.append($('adminForm'));$('adminOutput').setAttribute('role','status');$('adminOutput').textContent='Choose a target and use the action buttons.';
 const target=()=>$('ownerTarget').value,send=(action,args=[])=>ownerPanelCommand('action',[target(),action,...args]);
 const click=(id,fn)=>{$(id).classList.add('source-btn');$(id).onclick=async()=>{try{await fn();}catch(e){$('adminOutput').textContent=e.message;}};};
 for(const amount of [1000,10000,100000,5000000]){const b=document.createElement('button');b.className='source-btn';b.textContent=dollars(amount);b.onclick=()=>$('ownerMoney').value=amount;$('ownerCashPresets').append(b);}
 for(let stars=0;stars<=5;stars++){const b=document.createElement('button');b.className='source-btn';b.dataset.owner='';b.textContent=stars===0?'CLEAR STARS':stars+' ★';b.onclick=()=>send('wanted',[stars]);$('ownerWanted').append(b);}
 for(const [label,action,args] of [['REPAIR','repair',[]],['ENGINE FAIL','damage',['engine',100]],['COOLANT LEAK','damage',['radiator',80]],['OIL LEAK','damage',['oil',80]],['RUPTURE SUMP','damage',['oil',100]],['FUEL FIRE','fire',[]],['EXPLODE','explode',[]],['FREEZE','freeze',[]],['UNFREEZE','unfreeze',[]],['INTERCEPTORS','interceptors',[]]]){const b=document.createElement('button');b.className='source-btn';b.dataset.owner='';b.textContent=label;b.onclick=()=>send(action,args);$('ownerEffects').append(b);}
 click('ownerSetMoney',()=>send('money',[$('ownerMoney').value]));
 click('ownerGiftMoney',()=>{const targets=target()==='all'?[...new Set([Multiplayer.id||'me',...(Multiplayer.roster||[]).map(p=>p.id),...Multiplayer.remotes.keys()])]:[target()];return Promise.all(targets.map(id=>ownerPanelCommand('gift',[id,$('ownerMoney').value])));});
 click('ownerGrantVehicle',()=>send('vehicle',[$('ownerVehicle').value]));click('ownerDamageApply',()=>send('damage',[$('ownerComponent').value,$('ownerDamageAmount').value]));
 click('ownerBringHere',()=>{if(!state.profile)throw Error('Choose a vehicle before setting a meeting position.');const p=localToGeo(player.position.x,player.position.z);return send('tp',[p.lat,p.lon]);});
 click('ownerGoTo',()=>{const other=Multiplayer.remotes.get(target());if(!other)throw Error('Select a player currently driving.');const p=localToGeo(other.target.x,other.target.z);return ownerPanelCommand('action',['me','tp',p.lat,p.lon]);});
 click('ownerStartJob',()=>send('job',[$('ownerJob').value]));click('ownerCancelJob',()=>send('canceljob'));
 for(const [id,cmd] of [['ownerKick','kick'],['ownerBan','ban']])click(id,()=>{if(['me','all'].includes(target()))throw Error('Select one other player first.');return ownerPanelCommand(cmd,[target(),$('ownerBanReason').value]);});
 click('ownerRefreshBans',()=>ownerPanelCommand('bans'));
 click('ownerSetTime',()=>{const [h,m]=$('ownerClock').value.split(':').map(Number);return ownerPanelCommand('time',[h+m/60]);});click('ownerSetWeather',()=>ownerPanelCommand('weather',[$('ownerWeather').value]));
 click('ownerApplySettings',async()=>{const capacity=Number($('ownerCapacity').value),reward=Number($('ownerReward').value);if(!Number.isInteger(capacity)||capacity<2||capacity>16||!Number.isFinite(reward)||reward<.25||reward>5)throw Error('Use 2–16 players and a reward multiplier of 0.25–5.');for(const [key,value] of [['maxPlayers',$('ownerCapacity').value],['rewardMultiplier',$('ownerReward').value],['policeEnabled',$('ownerPolice').checked?'on':'off'],['autoWeather',$('ownerAutoWeather').checked?'on':'off']])await ownerPanelCommand('settings',[key,value]);});
 click('ownerReadSettings',syncOwnerSettings);click('ownerConnect',()=>{openModal('lobbyModal');Multiplayer.autoJoin();});syncOwnerSettings();refreshOwnerAdminUI();
}
