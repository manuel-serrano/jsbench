"use strict";

function poly( o ) {
   return o.y;
}

let fns = [ poly, poly, poly ];

function gee( CNT ) {
   let o1 = { x: 12345, y : 2 };
   let o2 = { y : -2 };
   let zzz = 0;
   let ttt = 0;
   let ddd = 0;

   for( let jjj = 0; jjj < CNT; jjj++ ) {
      if( jjj % 1000 == 0 ) console.log( jjj );
      for( let iii = 0; iii < 500000; iii++ ) {
	 zzz = fns[ 0 ]( o1 );
	 ttt = fns[ 1 ]( o2 );
	 ddd = zzz + ttt;
      }
   }

   return zzz;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 100
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000);

console.log( "poly(", N, ")..." );
console.log( gee( N ) );

