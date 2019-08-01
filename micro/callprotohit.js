"use strict";

let M = 0;

function fun( i ) {
   return this.x + i;
}

const proto = { f: fun };

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 12345, y : 2, __proto__: proto },
	      { a: 0, x: 12345, y: 2, __proto__: proto }
	    ];
   
   for( let j = 0; j < CNT; j++ ) {
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < CNT; i++ ) {
         let o = os[ i % M ];
         s = o.f( i );
      }
   }

   return s;
}

console.log( gee( 10000, 1 ) + " (=22344)" );
