"use strict";

let M = 0;

function fun( i ) {
   return this.x + i;
}

function fun2( i ) {
   return this.a + 1;
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 12345, y : 2, f: fun },
	      { x: 12345, b: 3, y : 2, f: fun },
	      { a: 0, x: 12345, y: 2, f: fun2 } ];
   
   for( let j = 0; j < CNT; j++ ) {
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < 300000; i++ ) {
         let o = os[ i % M ];
         s = o.f( i );
      }
   }

   return s;
}

const K = 1;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1) * K);

console.log( "callobjhit(", N, ")..." );
console.log( gee( N, 3 ) + " (=22344)" );

