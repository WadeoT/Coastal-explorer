'use strict';
// Run on YOUR machine. Copy the value into the relay's private environment and
// the in-game owner login. Never commit it or put it in a shared game URL.
const crypto=require('crypto');
process.stdout.write(crypto.randomBytes(32).toString('base64url')+'\n');
