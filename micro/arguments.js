"use strict";

let M = 0;

function bar( i ) {
   return arguments[ 0 ] + arguments.length;
}

function fun() {
   return bar.apply( null, arguments );
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   const k = Math.round( CNT / 10 );
   
   for( let j = 0, n = 0; j < CNT; j++ ) {
      if( j % k === 0 ) console.log( n++ );
      for( let i = 0; i < 300000; i++ ) {
         s = fun( i );
      }
   }

   return s;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 100 
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 4000);

console.log( "arguments(", N, ")..." );
console.log( gee( N, 1 ) + " (=300000)" );

