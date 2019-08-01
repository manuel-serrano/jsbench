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
   //   foo( this );
}

function test( n ) {
   let k = n / 10;
   let m = 0;
   var r = 0;
   
   
   for( let i = 0; i < n; i++ ) {
      let III = i;
      if( III % k == 0 ) console.log( III );
      if( i === n - 1 ) {
	 Object.defineProperty( p, "d", {
	    get: function() { return 333; },
	    set: function( v ) {}
	 } );
      }
      let OOO = new CTOR( III, n, 0, 1 );
      m += OOO.d;
   }

   return m;
}

var p = {};
CTOR.prototype = { __proto__: { __proto__: { __proto__: p } } };

var o1 = new CTOR( 1, 2, 3, 4 );

console.log( "test=", test( 70000000 ) );

var o2 = new CTOR( 10, 20, 30, 40 );

console.log( o1 );
console.log( o2, "d=", o2.d );

