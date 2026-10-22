// Regression checks use the shipped real Sunshine Coast snapshot. No geographic fixtures.
const fs=require('fs'),path=require('path'),os=require('os'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),screenshots=path.join(os.tmpdir(),'coastal-explorer-checks');fs.mkdirSync(screenshots,{recursive:true});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),main=html.replace('init();\n})();','window.__sim={tick,keys,groundVehicle,helicopter,damage,updateTraffic,updateWanted};init();\n})();');
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});res.end(main);});
const executablePath=process.env.CHROMIUM_EXECUTABLE_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[],external=[],passed=[];
 const pass=name=>{passed.push(name);console.log('PASS',name)};
 page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});
 await page.route('**/*',r=>{if(r.request().url().startsWith(origin+'/'))return r.continue();external.push(r.request().url());return r.abort();});
 const start=Date.now();await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.coastalExplorer?.state.worldReady,{timeout:90000});
 await page.waitForFunction(()=>document.getElementById('loading').classList.contains('hidden'),{timeout:30000});
 await page.evaluate(()=>coastalExplorer.scene.getEngine().stopRenderLoop());
 const loaded=await page.evaluate(()=>{const c=coastalExplorer;return{ready:c.state.worldReady,bundled:c.state.bundledMap,meta:c.mapSnapshot,coverage:c.coverage,roads:c.roads.length,ways:c.osmWays.size,terrain:c.demTiles.size,enabled:[...document.querySelectorAll('[data-vehicle]')].every(b=>!b.disabled),bannerVisible:!document.getElementById('worldBanner').classList.contains('hidden')};});
 assert(loaded.bundled&&loaded.enabled);assert.equal(loaded.coverage.loaded,loaded.coverage.total);assert.equal(loaded.terrain,63);assert(loaded.ways>80000);assert(loaded.roads>30000);assert.equal(loaded.bannerVisible,false);assert.deepEqual(external,[]);
 console.log('REAL SNAPSHOT',JSON.stringify({readyMs:Date.now()-start,roads:loaded.roads,ways:loaded.ways,timestamp:loaded.meta.osmTimestamp}));pass('Real full-coast snapshot starts with all external requests blocked');
 const landmarks=await page.evaluate(()=>{const names=new Set(coastalExplorer.roads.map(r=>r.name));return['Mooloolaba Esplanade','Sunshine Motorway','David Low Way','Steve Irwin Way','Bruce Highway','Buderim Avenue'].map(n=>[n,names.has(n)]);});assert(landmarks.every(([,exists])=>exists));pass('Actual coastal roads and hinterland routes exist in the bundled source');
 await page.screenshot({path:path.join(screenshots,'real-offline-garage.png')});
 const preview=await page.locator('[data-art="ute"] img').evaluate(img=>({loaded:img.complete&&img.naturalWidth>=800,alt:img.alt}));assert(preview.loaded);assert(preview.alt.includes('79 Series'));pass('Garage displays the rendered single-cab 79 Series model');
 await page.click('[data-vehicle="ute"]');await page.evaluate(()=>coastalExplorer.scene.render());
 const cruiser=await page.evaluate(()=>{const c=coastalExplorer,p=c.player.position,g=c.groundAt(p.x,p.z),model=c.scene.getTransformNodeByName('landcruiser-79-single-cab');return{playing:c.state.mode,clearance:p.y-g,fpv:c.camera.parent===c.player,eye:c.camera.globalPosition.y-g,model:model?.metadata};});assert.equal(cruiser.playing,'playing');assert(Math.abs(cruiser.clearance-.55)<.08);assert(cruiser.fpv);assert(Math.abs(cruiser.eye-1.72)<.15);assert.equal(cruiser.model.wheelbase,3.18);assert.equal(cruiser.model.bodyStyle,'single cab alloy tray');pass('LandCruiser spawns on a real road with the revised right-hand cockpit');
 await page.screenshot({path:path.join(screenshots,'real-landcruiser-fpv.png')});
 await page.keyboard.down('w');const drive=await page.evaluate(()=>{const c=coastalExplorer,p=c.player.position.clone();for(let i=0;i<90;i++)__sim.groundVehicle(1/60);__sim.keys.clear();return{distance:Math.hypot(c.player.position.x-p.x,c.player.position.z-p.z),grounded:c.state.grounded,speed:c.state.speed,health:c.state.health};});await page.keyboard.up('w');console.log('DRIVE',JSON.stringify(drive));assert(drive.distance>.5);assert(drive.grounded);assert(drive.speed>0);pass('Driving input moves the vehicle on the actual Mooloolaba road surface');
 const recovery=await page.evaluate(()=>{const c=coastalExplorer;c.state.health=73;c.state.wanted=1;c.recover(true);const result={health:c.state.health,wanted:c.state.wanted};c.state.wanted=0;c.state.heat=0;return result;});assert.deepEqual(recovery,{health:73,wanted:1});pass('Recovery preserves health and pursuit state');
 for(const type of ['bike','drift','heli']){await page.evaluate(type=>{coastalExplorer.selectVehicle(type);},type);assert.equal(await page.evaluate(()=>coastalExplorer.state.mode),'playing');}pass('All four vehicle choices work without a map server');
 const flight=await page.evaluate(()=>{const c=coastalExplorer,y=c.player.position.y;__sim.keys.add('KeyW');for(let i=0;i<180;i++)__sim.helicopter(1/60);__sim.keys.clear();for(let i=0;i<180;i++)__sim.helicopter(1/60);return{lift:c.player.position.y-y,vertical:c.motion.vy};});assert(flight.lift>10);assert(Math.abs(flight.vertical)<.1);pass('Helicopter lifts and settles into hover over the bundled terrain');
 await page.evaluate(()=>coastalExplorer.selectVehicle('ute'));
 for(const name of ['Caloundra','Mooloolaba','Maroochydore','Coolum Beach','Noosa Heads','Buderim','Nambour','Montville','Maleny','Beerwah','Eumundi','Peregian Beach']){
  const travel=await page.evaluate(async name=>{const c=coastalExplorer;c.state.wanted=0;c.state.heat=0;const d=c.destinations.find(d=>d.name===name);await c.travelTo(d);const p=c.localToGeo(c.player.position.x,c.player.position.z);return{ready:c.state.worldReady,mode:c.state.mode,distance:Math.hypot((p.lat-d.lat)*111320,(p.lon-d.lon)*99400),ground:c.groundAt(c.player.position.x,c.player.position.z)};},name);
  assert(travel.ready&&travel.mode==='playing');assert(travel.distance<1200);assert(Number.isFinite(travel.ground));console.log('TOWN',name,Math.round(travel.distance)+' m from destination');
 }
 assert.deepEqual(external,[]);pass('All twelve coast and hinterland towns are reachable entirely offline');
 await page.click('#mapButton');assert.equal(await page.locator('#townTravel button').count(),12);await page.screenshot({path:path.join(screenshots,'real-whole-coast-map.png')});await page.click('[data-close="mapModal"]');pass('Regional map exposes all twelve destinations');
 await page.click('#garageButton');await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(screenshots,'real-offline-mobile.png')});await page.click('#helpButton');pass('Mobile garage fits and settings remain reachable');
 await page.selectOption('#qualitySelect','low');assert.equal(await page.evaluate(()=>coastalExplorer.scene.shadowsEnabled),false);assert.equal(await page.locator('#world').evaluate(e=>getComputedStyle(e).imageRendering),'pixelated');await page.selectOption('#qualitySelect','high');pass('Performance mode retains map detail with crisp low-resolution rendering');
 const event=page.waitForEvent('download');await page.click('#saveGame');const download=await event;assert.equal(download.suggestedFilename(),'Coastal-Explorer.html');assert.equal(await download.failure(),null);const copy=fs.readFileSync(await download.path(),'utf8');assert(copy.length>15000000);assert(copy.includes('id="coastData"'));pass('Browser download includes the complete offline map and game');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('RESULT',JSON.stringify({passed:passed.length,pageErrors:errors,externalRequests:external.length,screenshots}));await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
