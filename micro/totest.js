"use strict";

function puzzle( k, end, P, PUZZLE, i, j ) {
   if( k > end || P[ i ][ k ] && PUZZLE[ j + k ] ) {
      return 1;
   } else {
      return -1;
   }
}

function test( N ) {
   let r = 0;
   let end = 10;
   const P = [ [ true, false ], [ true, true ], [ false, false ] ];
   const PUZZLE = [ true, false, false, true ];
   
   for( let i = 0; i < N; i++ ) {
      r += puzzle( 10, 0, P, PUZZLE, 0, 0 );
      r += puzzle( 0, 1, P, PUZZLE, 1, 0 );
      r += puzzle( 0, 1, P, PUZZLE, 2, 0 );
      r += puzzle( 0, 1, P, PUZZLE, 2, 1 );
   }
   return r;
}
	 
function main( bench, n ) {
   var res;
   let N = Math.round( n / 10 );
   
   for( let i = 0, j = 0; i < n; i++, j++ ) {
      res = test( 100000 );
      if( j === N ) {
	 console.log( i );
	 j = 0;
      }
   }
   console.log( bench, res );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 1000
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000;

main( "totest", N );
