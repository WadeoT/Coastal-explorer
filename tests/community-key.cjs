// Test credentials exist only in memory. No production private key is needed or committed.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
function credential(){const c=vm.createContext({crypto:crypto.webcrypto});vm.runInContext(fs.readFileSync('vendor/nostr-crypto.min.js','utf8'),c);c.seed=crypto.randomBytes(32).toString('hex');const publicKey=vm.runInContext("Array.from(CoastSigning.schnorr.getPublicKey(new Uint8Array(seed.match(/../g).map(x=>parseInt(x,16)))),b=>b.toString(16).padStart(2,'0')).join('')",c);return{publicKey,privateKey:c.seed};}
function withOwner(html,key){return html.replace(/const COMMUNITY_OWNER=\s*\{\s*"publicKey"\s*:\s*"[a-f0-9]{64}"\s*\}\s*;/,'const COMMUNITY_OWNER='+JSON.stringify({publicKey:key.publicKey})+';');}
module.exports={credential,withOwner};
