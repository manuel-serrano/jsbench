"use strict";

let M = 0;

function fun1( i ) {
   return i + 1;
}

function fun2( i ) {
   return i + 2;
}

function fun3( i ) {
   return i + 2;
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 12345, y : 2, f: fun1 },
	      { a: 0, x: 12345, y: 2, f: fun2 },
	      { a: 0, b: 1, x: 12345, y: 2, f: fun3 } ];
   
   for( let j = 0; j < CNT; j++ ) {
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < 300000; i++ ) {
         let o = os[ i % M ];
	 let g = o.f;
         s = g( i );
      }
   }

   return s;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 100 
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000);

console.log( "callclo2(", N, ")..." );
console.log( gee( N, 3 ) + " (=300000)" );

