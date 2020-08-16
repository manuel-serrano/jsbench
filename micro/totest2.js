"use strict";

function puzzle( k2, end2, P, PUZZLE, i, j ) {
   const end = end2 > 0 ? 1 : 0;
   const k = k2 === 0 ? 10 : 0;
   if( k > end || P[ i ][ k ] && PUZZLE[ j + k ] ) {
      return 10;
   } else {
      return -10;
   }
}

function test( N ) {
   let rrr = 0;
   let end = 10;
   const P = [ [ true, false ], [ true, true ], [ false, false ] ];
   const PUZZLE = [ true, false, false, true ];
   
   for( let i = 0; i < N; i++ ) {
      rrr += puzzle( i, i, P, PUZZLE, 0, 0 );
      rrr += puzzle( i, i, P, PUZZLE, 1, 0 );
      rrr += puzzle( i, i, P, PUZZLE, 2, 0 );
      rrr += puzzle( i, i, P, PUZZLE, 2, 1 );
   }
   return rrr;
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
