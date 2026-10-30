'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('src/street-experience.js','utf8')+';this.model=StreetComboModel;',ctx);const m=ctx.model;
let s=m.fresh();m.step(s,.1,1);assert.equal(s.count,1);const first=s.points;m.step(s,.1,1);assert(s.points-first>first);let bank;for(let i=0;i<41;i++)bank=m.step(s,.1)||bank;assert.equal(bank.count,2);assert.equal(bank.amount,193);assert.equal(s.points,0);for(let i=0;i<60;i++)assert.equal(m.step(s,.1),null);
s=m.fresh();m.step(s,.1,100);assert.equal(s.count,8);assert.equal(s.points,5000);m.step(s,.1,0,true);assert.equal(s.points,0);assert.equal(s.count,0);
for(const dt of [NaN,Infinity,-1,0,5]){s=m.fresh();assert.equal(m.step(s,dt,2),null);assert.equal(s.points,0);}
console.log('PASS near-miss multipliers, single delayed cash payout, caps, crash loss and invalid timing');
