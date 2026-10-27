'use strict';
const vm=require('vm'),fs=require('fs'),assert=require('assert/strict');
let timers=0;class WS{constructor(url,protocol){assert.equal(protocol,'mqtt');this.readyState=1;this.bufferedAmount=0;this.sent=[];}send(b){this.sent.push(b);}close(){this.readyState=3;this.onclose?.();}}
const c=vm.createContext({WebSocket:WS,crypto:require('crypto').webcrypto,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,Date,Math,JSON,setTimeout:()=>++timers,clearTimeout(){},setInterval:()=>++timers,clearInterval(){}});vm.runInContext(fs.readFileSync('src/public-relay.js','utf8')+';this.MQ=CoastMQTT;',c);
const received=[],statuses=[];const q=new c.MQ('wss://fixture/mqtt','coast/test',d=>received.push(d),()=>statuses.push(q.ready));let passed=0;const pass=s=>{passed++;console.log('PASS',s);};
q.ws.onopen();assert.equal(q.ws.sent[0][0],16);q.read(new Uint8Array([32,2,0,0]));assert.equal(q.ws.sent[1][0],130);assert(!q.ready);q.read(new Uint8Array([144,3,0,1,0]));assert(q.ready);pass('MQTT CONNECT and exact-topic SUBSCRIBE finish only after successful SUBACK');
function publish(topic,raw){const t=q.text(topic),payload=new TextEncoder().encode(raw),body=new Uint8Array([...t,...payload]),len=[];let n=body.length;do{const b=n%128;n=Math.floor(n/128);len.push(b|(n?128:0));}while(n);return new Uint8Array([48,...len,...body]);}
const packet=publish('coast/test',JSON.stringify({value:'a'.repeat(180)}));q.read(packet.slice(0,2));q.read(packet.slice(2,9));q.read(packet.slice(9));assert.equal(JSON.parse(received[0]).value.length,180);pass('Split MQTT packets and multibyte lengths reconstruct the original payload');
q.read(new Uint8Array([...publish('wrong/topic','{}'),...publish('coast/test','{}')]));assert.equal(received.length,2);pass('Combined packets parse correctly and other topics are rejected');
q.publish({hello:'test'});assert.equal(q.ws.sent.at(-1)[0],48);assert.equal(q.ws.sent.at(-1)[0]&7,0);pass('Outbound state is non-retained QoS zero');
let before=q.ws.sent.length;q.ws.bufferedAmount=40000;q.publish({hello:'slow'});assert.equal(q.ws.sent.length,before);q.ws.bufferedAmount=0;q.publish({large:'a'.repeat(5000)});assert.equal(q.ws.sent.length,before);pass('Backpressure and packet-size caps drop excess traffic');
assert.throws(()=>q.read(new Uint8Array([48,255,255,255,255,255])));pass('Oversized/malformed MQTT lengths fail closed');
q.close();assert(q.closed&&q.ws.readyState===3);pass('Closing shuts down the socket and prevents automatic reconnection');
const demo=new c.MQ('wss://public.cloud.shiftr.io','coast/test',()=>{},()=>{});demo.ws.onopen();const connect=demo.ws.sent[0];assert.equal(connect[9],194);assert(Buffer.from(connect).includes(Buffer.from('public')));demo.close();pass('Standard HTTPS-port route supplies only the documented public demo MQTT credentials');
console.log('RESULT',JSON.stringify({passed}));
