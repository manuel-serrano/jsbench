"use strict";

let M = 0;

function fun( i ) {
   return this.x + i;
}

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 12345, y : 2, f: fun },
	      { a: 0, x: 12345, y: 2, f: fun } ];
   
   for( let j = 0; j < CNT; j++ ) {
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < 300000; i++ ) {
         let o = os[ i % M ];
         s = o.f( i );
      }
   }

   return s;
}

const N = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000;

console.log( gee( N, 1 ) + " (=22344)" );
