"use strict";

function *iter( n ) {
   for( let i = 0; i < n; i++ ) {
      yield i;
      yield n;
   }
}

function test( n ) {
   var g = iter( n );
   var sum = 0;

   while( !(n = g.next(), n.done) ) {
      sum += n.value;
   }

   return sum;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 300000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000000);

console.log( "genfor(", N, ")..." );

console.log( test( N ) );
    

