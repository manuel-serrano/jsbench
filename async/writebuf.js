"use strict";

const fs = require("fs");

const file = "/dev/null";
const SIZE = 50000;
const buf = Buffer.alloc(1024);
const fd = fs.openSync(file, "w");

function test() {
   let i = 0;
   return new Promise((res, rej) => {
      function cb(err, s, buf) {
	 if (i < SIZE) {
	    i++;
	    loop();
	 } else {
	    res(s);
	 }
      }
      function loop() {
	 fs.write(fd, buf, 0, cb);
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
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 15: 15;

main("writebuf", N); 
