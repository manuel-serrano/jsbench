'use strict';
const addon = require("./build/Release/4_object_factory");

function test(N) {
   const obj1 = addon('hello');
   const obj2 = addon('world');
   let res = true;
   
   for (let i = 0; i < N; i++) {
      res &= (obj1.msg === "hello") && (obj2.msg === "world");
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
      res = await test(5000000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[1] === "fprofile") 
   ? 2
   : process.argv[2] ? parseInt(process.argv[2]) : 1000;

main("4_object_factory", N); 
