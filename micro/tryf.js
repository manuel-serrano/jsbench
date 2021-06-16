"use strict";

function thrower(f, v) {
   if (f) {
      throw v;
   } else {
      return v;
   }
}
function test(f1, f2, f3, f4, f5, N) {
   let x = 0;

   for (let i = 0; i < N; i++) {
      try {
	 x += thrower(f5, N);
      	 try {
	    x += thrower(f4, N);
	    try {
	       x += thrower(f3, N);
	       try {
		  x += thrower(f2, N);
	       	  try {
		     x += thrower(f1, N);
	       	  } catch(e1) {
		     x = e1;
	       	  }
	       } catch(e2) {
	       	  x = e2;
	       }
	    } catch(e3) {
	       x = e3;
	    }
      	 } catch(e4) {
	    x = e4;
      	 }
      } catch(e5) {
	 x = e5;
      }
   }
   return x;
}

function main(bench, n) {
   const f = false;
   const m = f ? Math.round( n / 128 ) : n;
   let N = Math.round(m / 10);
   
   let res = 0;
   
   for (let i = 0, j = 0; i < m; i++, j++) {
      res = test(false, false, f, false, false, 10000);
      res += test(true, false, false, false, false, 10);
      res += test(false, true, false, false, false, 10);
      res += test(false, false, true, false, false, 10);
      res += test(false, false, false, true, false, 10);
      res += test(false, false, false, false, true, 10);
      if (j === N) {
	 console.log(i);
	 j = 0;
      }
   }
   console.log(bench, res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 100
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000;

main( "totest", N );
