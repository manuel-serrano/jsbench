"use strict";
"use hopscript";

function Ctor1() {
}

function Ctor2() {
}

function Ctor3() {
}
Ctor3.prototype = new Ctor1();

function gee( CNT ) {
   let ddd = 0;

   let obj1 = new Ctor1();
   let obj2 = new Ctor2();
   let obj3 = new Ctor3();
   
   for( let jjj = 0; jjj < CNT; jjj++ ) {
      if( jjj % 1000 === 0 ) {
	 let tmp = obj1;
	 obj1 = obj2;
	 obj2 = obj3;
	 obj3 = tmp;
	 console.log( jjj );
      }
      for( let iii = 0; iii < 80000; iii++ ) {
   	 if( obj1 instanceof Ctor1 ) ddd++;
   	 if( obj1 instanceof Ctor2 ) ddd++;
   	 if( obj1 instanceof Ctor3 ) ddd++;
   	 if( obj2 instanceof Ctor1 ) ddd++;
   	 if( obj2 instanceof Ctor2 ) ddd++;
   	 if( obj2 instanceof Ctor3 ) ddd++;
   	 if( obj3 instanceof Ctor1 ) ddd++;
   	 if( obj3 instanceof Ctor2 ) ddd++;
   	 if( obj3 instanceof Ctor3 ) ddd++;
      }
   }

   return ddd;
}

exports.run = gee;

const N = (process.argv[ 1 ] === "fprofile") 
      ? 1000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 5000);

console.log( "instanceof(", N, ")..." );
console.log( gee( N ) );
