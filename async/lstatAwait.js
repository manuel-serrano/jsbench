"use strict";

const fs = require("fs");

const file = process.env.HOME;
const SIZE = 50000;

fs.lstatPromise = file =>
   new Promise((res, rej) => fs.lstat(file, (err, stat) => res(stat)));

function test() {
   return new Promise(async (res, rej) => {
      let s;
      for (let i = 0; i < SIZE; i++) {
	 const w = await fs.lstatPromise(file);
	 s = w.size;
      }
      res(s);
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
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 15: 15;

main("lstatAsync", N); 
