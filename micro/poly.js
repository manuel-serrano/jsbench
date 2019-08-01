"use strict";

function poly( o ) {
   return o.y;
}

var fns = [ poly, poly, poly ];

function gee( CNT ) {
   var o1 = { x: 12345, y : 2 };
   var o2 = { y : -2 };
   var zzz = 0;
   var ttt = 0;
   var ddd = 0;

   for( let jjj = 0; jjj < CNT; jjj++ ) {
      if( jjj % 1000 == 0 ) console.log( jjj );
      for( let iii = 0; iii < CNT; iii++ ) {
	 zzz = fns[ 0 ]( o1 );
	 ttt = fns[ 1 ]( o2 );
	 ddd = zzz + ttt;
      }
   }

   return zzz;
}

console.log( gee( 10000 ) );

