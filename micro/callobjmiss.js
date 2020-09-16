"use strict";

let M = 0;
let G = 0;

function fun( i ) {
   G++;
   return this.x;
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 1, y : 2, f: fun },
	      { a: 0, x: 2, y: 2, f: fun },
	      { a: 0, b: 1, x: -3, y: 2, f: fun } ];
   
   for( let j = 0; j < CNT; j++ ) {
      G = 0;
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < 150000; i++ ) {
         let o = os[ i % M ];
         s = o.f( i );
      }
      for( let i = 0; i < 150000; i++ ) {
         let o = os[ i % M ];
         s = o.f( i );
      }
   }

   return G + s;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 100 
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000);

console.log( "callobjhit(", N, ")..." );
console.log( gee( N, 3 ) + " (=22344)" );
