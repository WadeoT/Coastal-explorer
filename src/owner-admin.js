function runAdmin(command){
 const parts=String(command).trim().split(/\s+/),cmd=(parts.shift()||'help').toLowerCase();
 if(cmd==='help')return 'Owner login is required. Player actions: action <me|all|player ID> wanted <0–5> | money <amount> | repair | damage <component> <1–100> | fire | explode | freeze | unfreeze | tp <lat> <lon> | vehicle <ID> | job <ID> | canceljob | interceptors. Commands: gift <player ID|me> <amount> | ban <player ID> [reason] | unban <ID> | kick <ID> | players | time <0–24> | weather clear/cloudy/rain/storm/fog | settings maxPlayers <2–16> | settings rewardMultiplier <0.25–5> | settings policeEnabled on/off | settings autoWeather on/off | cash <amount> | repair | give <vehicle ID> | vehicle <ID> | wanted <0–5> | tp <lat> <lon> | noclip on/off';
 if(!Multiplayer.connected||!Multiplayer.relayMode||!Multiplayer.isOwner)return 'Owner authentication required. Connect to your relay and unlock with your private owner key.';
 if(cmd==='wanted'&&parts.length>=2)return Multiplayer.requestAdmin('action',[parts[0],'wanted',parts[1]]);if(['money','cash'].includes(cmd)&&parts.length>=2)return Multiplayer.requestAdmin('action',[parts[0],'money',parts[1]]);
 if(['action','gift','ban','unban','kick','players','time','weather','settings'].includes(cmd))return Multiplayer.requestAdmin(cmd,parts);
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
async function applyOwnerAction(data){
 if(!data||typeof data.actionId!=='string'||appliedOwnerActions.has(data.actionId)||!Multiplayer.relayMode)return;appliedOwnerActions.add(data.actionId);if(appliedOwnerActions.size>1000)appliedOwnerActions.delete(appliedOwnerActions.values().next().value);const args=data.args||[];resetDrivingRewards();
 switch(data.action){
 case 'money':economy.balance=Number(args[0]);saveCareer();updateWallet();break;
 case 'wanted':state.wanted=Number(args[0]);state.heat=state.wanted?WANTED_THRESHOLDS[state.wanted-1]:0;state.fiveStarPressure=0;state.evade=0;state.adminTest=true;updatePoliceDeployment();break;
 case 'repair':if(state.profile)repairVehicleDamage();break;
 case 'damage':if(state.profile)damageComponent(args[0],Number(args[1]),'owner test');break;
 case 'fire':if(state.damage){state.damage.burning=true;state.damage.fireTime=0;}break;
 case 'explode':if(state.damage){VehicleDamageModel.explode(state.damage);updateVehicleDamage(1/60);}break;
 case 'freeze':state.inputFrozen=true;keys.clear();motion.vx=motion.vz=motion.vy=0;break;
 case 'unfreeze':state.inputFrozen=false;break;
 case 'tp':if(state.profile){state.wanted=0;state.heat=0;await teleportTo(Number(args[0]),Number(args[1]));}break;
 case 'vehicle':if(profiles[args[0]]){if(!economy.owned.includes(args[0]))economy.owned.push(args[0]);saveCareer();selectVehicle(args[0]);}break;
 case 'job':{const job=availableContracts().find(j=>j.id===args[0]);if(job){state.wanted=0;await startActivity(job);}else toast('That job is not compatible with the current vehicle.');break;}
 case 'canceljob':cancelActivity('Owner cancelled job');break;
 case 'interceptors':if(isAircraft()){state.wanted=5;state.heat=450;state.forceInterceptors=true;state.adminTest=true;updatePoliceDeployment();}break;
 }
 toast('Owner action · '+data.action,2500);
}

function refreshOwnerAdminUI(){if(!$('ownerTarget'))return;const select=$('ownerTarget'),value=select.value;select.replaceChildren();for(const [id,label] of [['me','My player'],['all','All connected players'],...[...Multiplayer.remotes].map(([id,r])=>[id,r.target.name+' · '+id.slice(0,8)])]){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o);}if([...select.options].some(o=>o.value===value))select.value=value;for(const b of $('adminModal').querySelectorAll('[data-owner]'))b.disabled=!Multiplayer.isOwner;}
function initialiseOwnerUI(){
 const box=document.createElement('section');box.className='owner-tools';box.innerHTML='<h3>Player testing tools</h3><label>Target<select id="ownerTarget" class="maps-key-input"></select></label><div id="ownerWanted" class="shop-actions"></div><label>Set balance (A$)<input id="ownerMoney" class="maps-key-input" type="number" min="0" max="100000000" value="5000000"></label><button id="ownerSetMoney" class="source-btn" data-owner>SET MONEY</button><div id="ownerEffects" class="shop-actions"></div><p>Commands also support action &lt;me|all|player ID&gt; job &lt;job ID&gt;, vehicle &lt;ID&gt;, tp &lt;lat&gt; &lt;lon&gt;, ban, unban, gift and server settings.</p>';$('adminForm').before(box);
 const send=async(action,args=[])=>{$('adminOutput').textContent=await runAdmin(['action',$('ownerTarget').value,action,...args].join(' '));};for(let stars=0;stars<=5;stars++){const b=document.createElement('button');b.className='source-btn';b.dataset.owner='';b.textContent=stars+' ★';b.onclick=()=>send('wanted',[stars]);$('ownerWanted').append(b);}
 for(const [label,action,args] of [['REPAIR','repair',[]],['ENGINE FAIL','damage',['engine',100]],['COOLANT LEAK','damage',['radiator',80]],['OIL LEAK','damage',['oil',80]],['FUEL FIRE','fire',[]],['EXPLODE','explode',[]],['FREEZE','freeze',[]],['UNFREEZE','unfreeze',[]],['INTERCEPTORS','interceptors',[]]]){const b=document.createElement('button');b.className='source-btn';b.dataset.owner='';b.textContent=label;b.onclick=()=>send(action,args);$('ownerEffects').append(b);}$('ownerSetMoney').onclick=()=>send('money',[$('ownerMoney').value]);refreshOwnerAdminUI();
}
