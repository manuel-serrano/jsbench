'use strict';
const addon = require("./build/Release/5_function_factory");

function test(N) {
   let res = true;
   
   for (let i = 0; i < N; i++) {
      const fn = addon();
      
      res &= (fn(), "hello world");
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
      res = await test(25000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[1] === "fprofile") 
   ? 2
   : process.argv[2] ? parseInt(process.argv[2]) : 100;

main("4_object_factory", N); 
