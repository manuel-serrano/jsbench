"use strict";

function foo( x, y, z ) {
   if( x && y || z ) {
      return 1;
   } else {
      return -1;
   }
}

function test( N ) {
   let k = 0;
   for( let i = 0; i < N; i++ ) {
      k += foo( i <= 1000, N > i, i > 1000 );
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
