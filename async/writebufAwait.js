"use strict";

const fs = require("fs");

const file = "/dev/null";
const SIZE = 50000;
const buf = Buffer.alloc(1024);
const fd = fs.openSync(file, "w");

fs.writePromise = (fd, buf, offset, len, pos) =>
   new Promise((res, rej) => fs.write(fd, buf, offset, len, pos, (err, s, buf) => res(s)));

function test() {
   return new Promise(async (res, rej) => {
      let s;
      for (let i = 0; i < SIZE; i++) {
	 const w = await fs.writePromise(fd, buf, 0, 1024, 0);
	 s = w;
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

main("writebufAsync", N); 
