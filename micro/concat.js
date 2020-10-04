"use strict";

let M = 0;

function bar( i ) {
   const a1 = [].concat( "foo" );
   const a2 = [ i ].concat( "bar" );
   const a3 = [ i ].concat( a2 );
   return a2.concat( a3 );
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   const k = Math.round( CNT / 10 );
   
   for( let j = 0, n = 0; j < CNT; j++ ) {
      if( j % k === 0 ) console.log( n++ );
      for( let i = 0; i < 300000; i++ ) {
         s = bar( i );
      }
   }

   return s;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 100);

console.log( "concat(", N, ")..." );
console.log( gee( N, 1 ) + " (=300000)" );

