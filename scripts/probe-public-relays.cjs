'use strict';
// Two anonymous clients, one unique non-retained topic, one tiny loopback message.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const context=vm.createContext({WebSocket,crypto:crypto.webcrypto,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,Date,Math,JSON,setTimeout,clearTimeout,setInterval,clearInterval});
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../src/public-relay.js'),'utf8')+';this.Codec=CoastMQTT;',context);
const endpoints=['wss://broker.emqx.io:8084/mqtt','wss://test.mosquitto.org:8081/mqtt','wss://mqtt.eclipseprojects.io/mqtt','wss://broker.emqx.io/mqtt','wss://broker.hivemq.com:8884/mqtt'];
function probe(url){return new Promise(resolve=>{const sockets=[],nonce=crypto.randomUUID(),topic='coastal-explorer/probe/'+nonce;let ended=false,sent=false,timer;
 const done=(ok,reason)=>{if(ended)return;ended=true;clearTimeout(timer);for(const s of sockets)s.close();resolve({url,ok,reason});};
 const status=()=>{if(ended)return;if(sockets.some(s=>s.ws?.readyState===3)){done(false,'WebSocket/MQTT connection closed');return;}if(sockets.length===2&&sockets.every(s=>s.ready)&&!sent){sent=true;sockets[1].publish({probe:nonce});}};
 timer=setTimeout(()=>done(false,'No round-trip within 15 seconds'),15000);
 try{for(let i=0;i<2;i++)sockets.push(new context.Codec(url,topic,raw=>{try{if(JSON.parse(raw).probe===nonce)done(true,'Subscribe/publish/receive succeeded');}catch{}},status));}catch(e){done(false,e.message);}
 });}
(async()=>{const results=await Promise.all(endpoints.map(probe));for(const r of results)console.log((r.ok?'PASS ':'UNREACHABLE ')+r.url+' · '+r.reason);console.log('PROBE_RESULT '+JSON.stringify(results));if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Public relay network check\n\n'+results.map(r=>'- '+(r.ok?'PASS':'UNREACHABLE')+' '+r.url+' — '+r.reason).join('\n')+'\n');})().catch(e=>{console.error(e.message);process.exitCode=1;});
