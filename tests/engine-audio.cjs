// Render the real Web Audio graph offline: no speakers or external assets needed.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const source=fs.readFileSync(path.join(__dirname,'../src/engine-audio.js'),'utf8');
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><script>'+source+'</script>');});
(async()=>{
 let browser;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  const result=await page.evaluate(async()=>{
   const rate=24000;
   function setup(seconds){
    const ctx=new OfflineAudioContext(1,seconds*rate,rate),noise=ctx.createBuffer(1,rate,rate),data=noise.getChannelData(0);let seed=123;
    for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
    return {ctx,sound:new TurboDieselV8Sound(ctx,noise)};
   }
   function rms(a,start=0,end=a.length){let total=0;for(let i=start;i<end;i++)total+=a[i]*a[i];return Math.sqrt(total/(end-start));}
   function tone(a,hz){let re=0,im=0;for(let i=rate/2;i<rate;i++){const phase=2*Math.PI*hz*i/rate;re+=a[i]*Math.cos(phase);im+=a[i]*Math.sin(phase);}return Math.hypot(re,im)/(rate/2);}
   const idle=setup(1);idle.sound.update(750,0,1,true);const idleData=(await idle.ctx.startRendering()).getChannelData(0);
   const loaded=setup(3.2),waits=[];
   for(let i=1;i<=29;i++)waits.push(loaded.ctx.suspend(i*.1));
   loaded.sound.update(3000,1,1,true);const rendering=loaded.ctx.startRendering(),spool=[];
   for(let i=0;i<waits.length;i++){
    await waits[i];loaded.sound.update(3000,i<15?1:0,1,true);spool.push(loaded.sound.spool);
    if(i===28)loaded.sound.stop();await loaded.ctx.resume();
   }
   const loadedData=(await rendering).getChannelData(0);
   const muted=setup(.3);muted.sound.update(4200,1,0,true);const mutedData=(await muted.ctx.startRendering()).getChannelData(0);
   const inactive=setup(.3);inactive.sound.update(4200,1,1,false);const inactiveData=(await inactive.ctx.startRendering()).getChannelData(0);
   const guarded=setup(.1);guarded.sound.update(NaN,0,1,true);const safe=guarded.sound.rpm;guarded.sound.update(20000,0,1,true);const max=guarded.sound.rpm;guarded.sound.stop();
   return {idleRms:rms(idleData,rate/2),firing50:tone(idleData,50),off40:tone(idleData,40),off60:tone(idleData,60),peak:Math.max(...idleData.map(Math.abs)),spool,stopRms:rms(loadedData,Math.floor(3.15*rate)),loadedRms:rms(loadedData,rate,rate*1.5),mutedRms:rms(mutedData),inactiveRms:rms(inactiveData),safe,max};
  });
  assert(result.idleRms>.005&&result.idleRms<.2);assert(result.peak<.9);
  assert(result.firing50>result.off40*10&&result.firing50>result.off60*10);
  console.log('PASS V8 idle renders finite unclipped audio with 50 firing pulses/second at 750 RPM');
  assert(result.spool[0]>0&&result.spool[0]<.2);assert(result.spool[14]>.8);assert(result.spool[28]<result.spool[14]*.4);assert(result.loadedRms>.005);
  console.log('PASS Turbo builds gradually under load and decays after lifting off');
  assert.equal(result.mutedRms,0);assert.equal(result.inactiveRms,0);assert(result.stopRms<.001);
  console.log('PASS Volume zero and inactive vehicles are silent; stop fades the exhaust and turbo');
  assert.equal(result.safe,750);assert.equal(result.max,4200);assert.deepEqual(errors,[]);
  console.log('PASS RPM guards retain the diesel idle/redline and produce no browser errors');
  console.log('RESULT',JSON.stringify({passed:4,idleRms:result.idleRms,peak:result.peak,boostAtFullLoad:result.spool[14],boostAfterLift:result.spool[28]}));
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
