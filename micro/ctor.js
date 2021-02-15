"use strict";

function CTOR( a, b, c, d ) {
   this.a = a;
   this.b = b;
   this.c = c;
   this.d = d;
   this.a2 = a;
   this.b2 = b;
   this.c2 = c;
   this.d2 = d;
}

function test( n ) {
   let k = n / 10;
   let m = 0;
   var r = 0;
   let j = 0;
   let l = arr.length;
  
   for( let i = 0; i < n; i++ ) {
      let III = i;
      if( III % k == 0 ) console.log( III );
      let OOO = new CTOR( III, n, 0, 1 );
      if( ++j === l ) j = 0;
      arr[ j ] = OOO;
   }

   return m;
}

var p = {};
CTOR.prototype = { __proto__: { __proto__: { __proto__: p } } };

var o1 = new CTOR( 1, 2, 3, 4 );

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 70000000);

let arr = new Array( Math.min( N, 10 ) );

console.log( "ctor2(", N, ")..." );

console.log( "test=", test( N ) );
var o2 = new CTOR( 10, 20, 30, 40 );

let s = 0;
for( let i = arr.length - 1; i >= 0; i-- ) {
   s +=  ((arr[ i ].a > arr[ i ].b) ? 1 : -1);
   s +=  ((arr[ i ].c2 > arr[ i ].d2) ? 1 : -1);
}

console.log( "s=", s );
