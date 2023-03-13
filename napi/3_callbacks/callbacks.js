'use strict';
const addon = require("./build/Release/3_callbacks.node");

let res = true;
addon.RunCallback(function(msg) {
  res &= (msg === 'hello world');
});

function testRecv(desiredRecv) {
  addon.RunCallbackWithRecv(function() {
    res &= (this === desiredRecv);
  }, desiredRecv);
}

function test(N) {
   for (let i = 0; i < N; i++) {
      testRecv(undefined);
      testRecv(null);
      testRecv(5);
      testRecv(true);
      testRecv('Hello');
      testRecv([]);
      testRecv({});
   }
   return res;
}

async function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      res = await test(500000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 15: 15;

main("3_callbacks", N); 
