"use strict";
"use hopscript";

function build( num ) {
   let s = "aaabbb" + num;

   for( let i = 0; i < num; i++ ) {
      s = "left" + s + "right";
   }

   return "<" + s + ">";
}

function str( num ) {
   let res = 0;
   let s = build( 100000 );
   let j = 0;

   console.log( "s=" + s.length );

   for( let i = 0; i < num; i++ ) {
      if( i % 1000 == 0 ) console.log( "i=" + i );

      res += s.indexOf( "taaabbb" );
      res -= s.indexOf( "aaabbb" );
   }

   return res;
}

const K = 10;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1) * K);

console.log( "string(", N, ")..." );

console.log( "str=" + str( N ) );

