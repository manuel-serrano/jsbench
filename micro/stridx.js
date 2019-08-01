"use strict";
"use hopscript";

function build( num ) {
   var s = "aaabbb" + num;

   for( var i = 0; i < num; i++ ) {
      s = "leaftt" + s + "right";
   }

   return "<" + s + ">";
}

function str( num ) {
   var res = 0;
   var s = build( 100000 );
   var j = 0;

   console.log( "s=" + s.length );

   for( var i = 0; i < num; i++ ) {
      if( i % 1000 == 0 ) console.log( "i=" + i );

      res += s.indexOf( "taaabbb" );
      res -= s.indexOf( "aaabbb" );
   }

   return res;
}

console.log( "str=" + str( 30000 ) );

