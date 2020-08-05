"use strict";

function foo( x, y ) {
   if( x && y ) {
      return 4;
   } else {
      return 5;
   }
}

function test( N ) {
   let k = false;
   for( let i = 0; i < N; i++ ) {
      k = k || foo( i, N );
   }
   return k;
}
	 
function main( bench, n ) {
   var res;
   for( let i = 0; i < n; i++ ) {
      res = test( 100000 );
   }
   console.log( bench, res );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 1000
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000;

main( "totest", N );
