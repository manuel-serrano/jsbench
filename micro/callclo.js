"use strict";

let M = 0;

function fun( i ) {
   return i + 1;
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 12345, y : 2, f: fun },
	      { a: 0, x: 12345, y: 2, f: fun },
	      { a: 0, b: 1, x: 12345, y: 2, f: fun } ];
   
   for( let j = 0; j < CNT; j++ ) {
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < 200000; i++ ) {
         let o = os[ i % M ];
	 let g = o.f;
         s = g( i );
      }
   }

   return s;
}

const K = 10;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10 
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1) * K);

console.log( "callclo(", N, ")..." );
console.log( gee( N, 3 ) + " (=300000)" );

