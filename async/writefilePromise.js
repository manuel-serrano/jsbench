"use strict";

const fs = require("fs");

const file = "/tmp/writefileSync.out";
const buf = fs.readFileSync(module.filename);
const SIZE = 1000;
   
function test() {
   return new Promise((res, rej) => {
      function loop(i) {
	 new Promise((res, rej) => {
	    fs.writeFile(file, buf, err => res(err));
	 }).then(err => {
	    if (i < SIZE) {
	       loop(i+1);
	    } else {
	       res(err);
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

   fs.unlinkSync(file);

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 150;

main("writefilePromise", N); 
