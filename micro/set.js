"use strict";
"use hopscript";

function Ctr() {
}

function gee( CNT ) {
   var ddd = 0;

   var obj = new Ctr();
   
   for( let jjj = 0; jjj < CNT; jjj++ ) {
      if( jjj % 1000 == 0 ) console.log( jjj );
      for( let iii = 0; iii < CNT; iii++ ) {
   
	 obj.yyy = 1;
	 obj.xxx = 2;
	 obj.aaa = 1;
	 obj.bbb = 2;
	 obj.aaa2 = 1;
	 obj.bbb2 = 2;
	 obj.aaa3 = 1;
	 obj.bbb3 = 2;
	 obj.aaa4 = 1;
	 obj.bbb4 = 2;
	 
	 //console.log( "yyy=", o.yyy, " xxx=", o.xxx );
	 ddd += (obj.bbb4 - obj.bbb);
      }
   }

   return ddd;
}

exports.run = gee;

console.log( gee( 25000 ) );
