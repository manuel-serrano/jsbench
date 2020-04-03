"use strict";
"use hopscript";

function Ctor1() {
   this.ctor1 = 1;
}

function Ctor2() {
   this.ctor2 = 2;
}

function Ctor3() {
   this.ctor3 = 3;
}
Ctor3.prototype = new Ctor1();

function gee( CNT ) {
   let ddd = 0;

   let obj1 = new Ctor1();
   let obj2 = new Ctor2();
   let obj3 = new Ctor3();
   
   const N = CNT / 10;
   let cnt = 0;
   
   for( let jjj = 0, iii = 0; jjj < CNT; jjj++ ) {
      if( iii === N ) {
	 let tmp = obj1;
	 obj1 = obj2;
	 obj2 = obj3;
	 obj3 = tmp;

	 cnt += N
	 console.log( cnt );
	 iii = 0;
      } else {
	 iii++;
      }
      
      for( let iii = 0; iii < 80000; iii++ ) {
	 var d;
   	 if( d = Object.getOwnPropertyDescriptor( obj1, "ctor1" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj2, "ctor1" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj3, "ctor1" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj1, "ctor2" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj2, "ctor2" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj3, "ctor3" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj1, "ctor3" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj2, "ctor3" ) ) ddd += d.value;
   	 if( d = Object.getOwnPropertyDescriptor( obj3, "ctor3" ) ) ddd += d.value;
      }
   }

   return ddd;
}

exports.run = gee;

const N = (process.argv[ 1 ] === "fprofile") 
      ? 500
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 500);

console.log( "getownprop(", N, ")..." );
console.log( gee( N ) );
