"use strict";
"use hopscript";

function build( num ) {
   let s = num + "AAABBB" + num;

   for( let i = 0; i < num; i++ ) {
      s = "leaftt" + s + "right";
   }

   return "<" + s + ">";
}

function str( num ) {
   let res = 0;
   let s = build( 10 );
   let j = 0;

   console.log( "s=" + s.length );

   for( let k = 0; k < 10; k++ ) {
      console.log( "k=", k );
      for( let i = 0; i < num; i++ ) {
      	 for( let j = 0; s.charAt( j ) !== 'B'; j++ );
         res += j;
         for( let j = s.length -1 ; s.charAt( j ) !== 'A'; j-- );
         res -= j;
      }
   }

   return res;
}

const K = 1000;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1) * K)

console.log( "charat(", N, ")..." );

console.log( "charat==" + str( N ) );

