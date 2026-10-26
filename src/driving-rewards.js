const DrivingRewardModel=(()=>{
 const fresh=()=>({drift:{points:0,combo:0,seconds:0,gap:0,side:0},speed:{points:0,seconds:0,gap:0},pursuit:{seconds:0,bankAt:15},lastAward:null});
 function step(r,dt,i){
  const awards=[];if(!i.active||!i.validMovement||i.crashed||!Number.isFinite(dt)||dt<=0||dt>.11){Object.assign(r,fresh());return awards;}
  const speed=Number.isFinite(i.kph)?i.kph:0,angle=Math.abs(i.angle||0),drift=i.road&&i.grounded&&i.canDrift&&speed>=28&&angle>=12&&angle<=70;
  if(drift){const side=Math.sign(i.side||1);if(r.drift.combo===0||r.drift.gap>.3||side!==r.drift.side&&r.drift.seconds>.45)r.drift.combo=Math.min(8,r.drift.combo+1);r.drift.side=side;r.drift.gap=0;r.drift.seconds+=dt;r.drift.points+=dt*(8+speed*.32+angle*.25)*Math.max(1,r.drift.combo);}
  else if(r.drift.points>0){r.drift.gap+=dt;if(r.drift.gap>1.8){const amount=Math.floor(r.drift.points);if(amount>=25)awards.push({kind:'drift',amount,label:'Drift combo ×'+r.drift.combo});r.drift=fresh().drift;}}
  if(i.road&&i.grounded&&speed>=120){r.speed.gap=0;r.speed.seconds+=dt;if(r.speed.seconds>=3)r.speed.points=Math.min(20000,r.speed.points+dt*Math.min(120,40+(speed-120)*.5));}
  else if(r.speed.seconds>0){r.speed.gap+=dt;if(r.speed.gap>=2){if(r.speed.points>=25)awards.push({kind:'speed',amount:Math.floor(r.speed.points),label:'120+ road streak'});r.speed=fresh().speed;}}
  if(i.stars===5&&i.pursued&&speed>=25){r.pursuit.seconds+=dt;if(r.pursuit.seconds>=r.pursuit.bankAt){awards.push({kind:'pursuit',amount:Math.min(1500,350+Math.floor(r.pursuit.seconds/15)*100),label:'Five-star survival · '+Math.round(r.pursuit.seconds)+'s'});r.pursuit.bankAt+=15;}}
  else if(i.stars!==5)r.pursuit=fresh().pursuit;
  if(awards.length)r.lastAward=awards.at(-1);return awards;
 }
 return {fresh,step};
})();
let drivingRewards=DrivingRewardModel.fresh();
function resetDrivingRewards(){drivingRewards=DrivingRewardModel.fresh();}
function awardDrivingCash(amount,label){const multiplier=Multiplayer.connected?Multiplayer.serverSettings.rewardMultiplier:1;amount=Math.round(amount*multiplier);if(!Number.isFinite(amount)||amount<=0)return;economy.balance=Math.min(1e10,economy.balance+amount);saveCareer();updateWallet();toast(label+' · +'+dollars(amount),3000);}
function updateDrivingRewards(before,dt){
 const p=state.profile;if(!p)return;const moved=V.Distance(before,player.position),forward=motion.vx*Math.sin(motion.yaw)-motion.vz*Math.cos(motion.yaw),lateral=motion.vx*Math.cos(motion.yaw)+motion.vz*Math.sin(motion.yaw),contact=state.rewardRoad;
 const validMovement=moved<=p.top*dt*1.6+.20&&Number.isFinite(moved),road=p.kind==='car'&&contact&&contact.distance<=contact.halfWidth+1&&!['track','path','footway'].includes(contact.highway),pursued=state.wanted===5&&policeWitnesses(260)&&trafficPool.some(a=>a.police&&a.pursuing&&a.health>0&&a.root.isEnabled()&&V.Distance(a.root.position,player.position)<260);
 const awards=DrivingRewardModel.step(drivingRewards,dt,{active:state.mode==='playing'&&!state.adminTest&&!state.inputFrozen&&worldUpgrade.collisions!==false&&vehiclePowerFactor()>0,validMovement,crashed:state.collisionCooldown>.7&&state.lastCrashSpeed>3,road,grounded:state.grounded,kph:state.speed*3.6,angle:Math.atan2(Math.abs(lateral),Math.max(.1,Math.abs(forward)))/RAD,side:lateral,canDrift:p.kind==='car'&&!!p.driftable,stars:state.wanted,pursued:(pursued||isAircraft()&&aircraftInterceptorsEngaged())&&moved>.02});
 for(const a of awards)awardDrivingCash(a.amount,a.label);
}
function rewardFiveStarEscape(){if(drivingRewards.pursuit.seconds>=20)awardDrivingCash(Math.min(10000,Math.round(drivingRewards.pursuit.seconds*25)),'Five-star escape bonus');drivingRewards.pursuit=DrivingRewardModel.fresh().pursuit;}
function updateRewardsHUD(){if(!$('skillReadout'))return;const r=drivingRewards;$('skillDrift').textContent=r.drift.points?'DRIFT ×'+r.drift.combo+' · '+dollars(r.drift.points)+' pending':'DRIFT COMBOS · chain slides to earn';$('skillSpeed').textContent=r.speed.seconds?'120+ STREAK · '+r.speed.seconds.toFixed(1)+'s · '+dollars(r.speed.points):'ROAD STREAK · hold 120+ km/h';$('skillPursuit').textContent=state.wanted===5?'FIVE STARS · '+Math.floor(r.pursuit.seconds)+'s · payout every 15s':'FIVE STARS · survival + escape payouts';}
function initialiseRewardsUI(){const box=document.createElement('section');box.id='skillReadout';box.className='skill-readout';box.innerHTML='<strong>SKILL REWARDS</strong><span id="skillDrift"></span><span id="skillSpeed"></span><span id="skillPursuit"></span>';$('hud').append(box);updateRewardsHUD();}
