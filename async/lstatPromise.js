"use strict";

const fs = require("fs");

const file = process.env.HOME;
const SIZE = 50000;
   
function test() {
   return new Promise((res, rej) => {
      function loop(i) {
	 new Promise((res, rej) => {
	    fs.lstat(file, (err, stat) => res(stat));
	 }).then(stat => {
	    if (i < SIZE) {
	       loop(i+1);
	    } else {
	       res(stat.size);
	    }
	 });
      }
      loop(0);
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
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 20 : 20;

main("lstatPromise", N); 
