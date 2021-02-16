"use strict";

function *iter( n ) {
   let i = 0;
   while( i++ < n ) {
      yield i;
      yield n;
   }
}

function test( n ) {
   let S;
   
   for( let j = 0; j < 10; j++ ) {
      var g = iter( n );
      var sum = 0;
      let m = 0;
      console.log( j );
      while( !(m = g.next(), m.done) ) {
      	 sum += m.value;
      }
      
      S = sum;
   }
   
   return S;
}

const K = 1000;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000) * K);

console.log( "genwhile(", N, ")..." );

console.log( test( N ) );
    

