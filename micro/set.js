"use strict";
"use hopscript";

function Ctr() {
}

function gee( CNT ) {
   let ddd = 0;
   let obj = new Ctr();
   let profstart = Date.now();
   for( let jjj = 0; jjj < CNT; jjj++ ) {
      if( jjj % 1000 == 0 ) {
	 const profend = Date.now();
	 console.log( jjj, profend - profstart );
	 profstart = profend;
      }
      for( let iii = 0; iii < 80000; iii++ ) {
   
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

const N = (process.argv[ 1 ] === "fprofile") 
      ? 1000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 25000);

console.log( "set(", N, ")..." );
console.log( gee( N ) );
