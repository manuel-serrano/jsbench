"use strict";

function inc( v ) {
   return v + 1;
}

function Foo( a ) {
   this.a = a;
}

Foo.prototype.toNum = function( base ) {
   return this.a + 123;
}

function Bar( a ) {
   this.a = a + 20;
}

Bar.prototype.toNum = function( base ) {
   return 6666;
}


function gee( n ) {
   let o = new Foo( inc( 10 ) );
   let g = 0;

   for( let i = 0; i < n; i = inc( i ) ) {
      g = o.toNum( 10 );
   }

   return g;
}

function test( n ) {
   const k = n / 10;
   for( let i = 0; i < n; i++ ) {
      var r = gee( 100000 );
      if( i % k == 0 ) console.log( i, r );
   }
}

test( 20000 );
