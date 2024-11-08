"use strict";

const fs = require("fs");

const file = process.env.HOME;
const SIZE = 50000;
   
function test() {
   let i = 0;
   return new Promise((res, rej) => {
      function cb(err, stat) {
	 const s = stat.size;
	 if (i < SIZE) {
	    i++; loop();
	 } else {
	    res(s);
	 }
      }
      function loop() {
	 fs.lstat(file, cb);
      }
      loop();
   });
}

async function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      res = await test();
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 13: 13;

main("lstat", N); 
