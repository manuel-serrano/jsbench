"use strict";

let M = 0;

function bar( i ) {
   return arguments[ 0 ] + arguments.length;
}

function gee( i ) {
   return arguments[ 1 ] + arguments.length;
}

function fun( f ) {
   return f.apply( null, arguments );
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   const k = Math.round( CNT / 10 );
   let fs = [ bar, gee ];
   
   for( let j = 0, n = 0; j < CNT; j++ ) {
      let f = fs[ j % 2 ];
      if( j % k === 0 ) console.log( n++ );
      for( let i = 0; i < 300000; i++ ) {
         s = fun( f, i, j );
      }
   }

   return s;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 100);

console.log( "arguments(", N, ")..." );
console.log( gee( N, 1 ) + " (=300000)" );

