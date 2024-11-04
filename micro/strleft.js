"use strict";
"use hopscript";

function build( num, j ) {
   let s = "aaabbb" + num;

   for( let i = 0; i < num; i++ ) {
      s += "right";
      s += j;
      s += ("b" + j);
   }

   return s;
}

function str( num ) {
   let j = 0;
   let l = 0;
   const k = Math.round( num / 10 );
   let res = new Array( k );;
   
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < k; i++ ) {
      	 let s = build( 5000, j );

      	 res[ j ] = s.length + 1;
      }
      console.log( "j=" + j );
   }

   return res;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000);

console.log( "strleft(", N, ")..." );

console.log( "len=" + str( N ) );

