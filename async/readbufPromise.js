"use strict";

const fs = require("fs");

const file = "/dev/zero";
const SIZE = 50000;
const buf = Buffer.alloc(1024);
const fd = fs.openSync(file, "r");
   
function test() {
   return new Promise((res, rej) => {
      function loop(i) {
	 new Promise((res, rej) => {
	    fs.read(fd, buf, 0, 1024, -1, (err, s, buf) => res(s));
	 }).then(s => {
	    if (i < SIZE) {
	       loop(i+1);
	    } else {
	       res(s);
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
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 15 : 15;

main("readbufPromise", N); 
