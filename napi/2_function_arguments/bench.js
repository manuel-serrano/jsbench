'use strict';
const addon = require("./build/Release/2_function_arguments.node");

function test(N) {
   let r = true;
   for (let i = 0; i < N; i++) {
      r &= (addon.add(3, 5) === 8);
   }
   return r;
}

async function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      res = await test(10000000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 15: 15;

main("2_function_arguments", N); 
