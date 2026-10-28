'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('src/damage-model.js','utf8')+';this.model=VehicleDamageModel;',context);const m=context.model,p={kind:'car',mass:1500,length:4.5,width:1.8,eye:1.3,clearance:.3};let passed=0;const pass=s=>{passed++;console.log('PASS',s);},front={x:0,y:.4,z:-2.2},rear={x:0,y:.4,z:2.2},side={x:.9,y:.4,z:0};
for(const [label,point]of [['front',front],['side',side]]){const d=m.create(p);m.crash(d,p,29,point,{solid:true,kind:'building'});assert(d.burning&&!d.exploded);pass('Severe '+label+' crash ignites a breached fuel system at the increased frequency');}
const warm=m.create(p);warm.oilTemp=125;m.crash(warm,p,35,rear,{solid:true,kind:'building'});assert(warm.exploded);pass('A warm, fuel-loaded high-energy rear impact now explodes immediately');
const extreme=m.create(p);m.crash(extreme,p,48,front,{solid:true,kind:'building'});assert(extreme.exploded);pass('An extreme fuel-loaded impact can explode without requiring a rear hit');
const fire=m.create(p);m.crash(fire,p,29,front,{solid:true,kind:'building'});assert(fire.fireDelay>=3&&fire.fireDelay<7);for(let i=0;i<100&&!fire.exploded;i++)m.step(fire,.1,{rpm:0});assert(fire.exploded);pass('Crash fires escalate to an explosion after the shorter bounded escape window');
const leak=m.create(p);m.hit(leak,'fuel',35,'puncture');const before=leak.fuel;for(let i=0;i<100;i++)m.step(leak,.1,{rpm:0});assert(!leak.burning&&!leak.exploded&&leak.fuel<before&&before-leak.fuel<2);pass('A modest puncture still gives a gradual visible leak before ignition');
const bullet=m.create(p);m.hit(bullet,'fuel',50,'bullet');assert(bullet.burning);pass('A serious fuel-system hit is more likely to ignite');
for(const [label,d]of [['empty',Object.assign(m.create(p),{fuel:0})],['electric',m.create({...p,electric:true})]]){d.oilTemp=160;m.crash(d,p,70,rear,{solid:true,kind:'building'});assert(!d.exploded&&!d.burning);pass(label+' vehicles do not create fictitious petrol fires');}
const scrape=m.create(p);m.crash(scrape,p,5,front,{solid:true,kind:'building'});assert(!scrape.burning&&!scrape.exploded);pass('Minor contact remains below the ignition threshold');
console.log('RESULT',JSON.stringify({passed}));
