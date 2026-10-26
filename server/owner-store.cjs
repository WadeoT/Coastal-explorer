'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const digest=s=>crypto.createHash('sha256').update(String(s)).digest();
function createOwnerStore({file,ownerToken}={}){
 const data={sessions:{},bans:{},gifts:{},settings:{time:.56,timeEpoch:Date.now(),weather:'clear',maxPlayers:8,rewardMultiplier:1,policeEnabled:true,autoWeather:true,weatherEpoch:Date.now()}};
 if(file&&fs.existsSync(file)){const saved=JSON.parse(fs.readFileSync(file,'utf8'));for(const key of Object.keys(data))if(saved[key]&&typeof saved[key]==='object')Object.assign(data[key],saved[key]);}
 const persist=()=>{if(!file)return;fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data),{mode:0o600});fs.renameSync(tmp,file);};
 const configured=typeof ownerToken==='string'&&ownerToken.length>=8,ownerHash=configured?digest(ownerToken):null;
 return {data,configured,persist,
  owner(token){return configured&&typeof token==='string'&&token.length<=512&&crypto.timingSafeEqual(digest(token),ownerHash);},
  session(token){if(token){if(!/^[a-f0-9]{64}$/.test(token))return null;const value=data.sessions[digest(token).toString('hex')];return value&&!data.bans[value.id]?{...value,token}:null;}
   const secret=crypto.randomBytes(32).toString('hex'),value={id:crypto.randomUUID(),created:Date.now()};data.sessions[digest(secret).toString('hex')]=value;persist();return {...value,token:secret};},
  gift(id,amount,by){if(!Object.values(data.sessions).some(s=>s.id===id)||!Number.isInteger(amount)||amount<1||amount>50000000)return null;const gift={id:crypto.randomUUID(),amount,by,created:Date.now()};(data.gifts[id]??=[]).push(gift);persist();return gift;},
  acknowledge(id,giftId){const list=data.gifts[id]||[],next=list.filter(g=>g.id!==giftId);if(next.length!==list.length){data.gifts[id]=next;persist();}},
  ban(id,reason){if(!Object.values(data.sessions).some(s=>s.id===id))return false;data.bans[id]={reason:String(reason||'Removed by owner').slice(0,120),created:Date.now()};persist();return true;},
  unban(id){if(!data.bans[id])return false;delete data.bans[id];persist();return true;}
 };
}
module.exports={createOwnerStore};
