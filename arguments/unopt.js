"use strict";

let g = new Array(5);

function test(n) {
   if (arguments.length > 100) {
      console.log(g, "prevent", "nodejs");
      console.log("from", "inlining", "this", "function");
      console.log(g, "prevent", "nodejs");
      console.log("from", "inlining", "this", "function");
      console.log(g, "prevent", "nodejs");
      console.log("from", "inlining", "this", "function");
      g[0] = [ "prevent", "nodejs", "from", "inlining" ];
   }
   g[arguments.length] = arguments;
}

async function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test();
      test(0);
      test(0, 1);
      test(0, 1, 2);
      test(0, 1, 2, 3);
      res = g[0].length + g[3].length;
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 95000000: 95000000;

main("unopt", N); 
