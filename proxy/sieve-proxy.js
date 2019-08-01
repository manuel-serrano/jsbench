"use strict";

const handler = {
   get: function( target, key ) { return target[ key ] },
   set: function( target, key, val ) { target[ key ] = val; return true }
}

function Cons( a, d ) {
   this.car = a;
   this.cdr = d;
}

function interval( min, max ) {
   if( min > max ) {
      return null;
   } else {
      return new Proxy( new Cons( min, interval( min + 1, max ) ), handler );
   }
}

function sfilter( p, l ) {
   if( l === null ) {
      return l;
   } else {
      let a = l.car;
      let r = l.cdr;

      if( p( a ) ) {
	 return new Proxy( new Cons( a, sfilter( p, r ) ), handler );
      } else {
	 return sfilter( p, r );
      }
   }
}

function remove_multiples_of( n, l ) {
   return sfilter( m => (m % n) != 0, l );
}

function sieve( max ) {
   function filter_again( l ) {
      if( l === null ) {
	 return l;
      } else {
	 let n = l.car;
	 let r = l.cdr;

	 if( n * n > max ) {
	    return l;
	 } else {
	    return new Proxy( new Cons( n, filter_again( remove_multiples_of( n, r ) ) ), handler );
	 }
      }
   }
   return filter_again( interval( 2, max ) );
}

function do_list( f, lst ) {
   while( lst !== null ) {
      f( lst.car );
      lst = lst.cdr;
   }
}

function length( lst ) {
   let res = 0;

   while( lst != null ) {
      res++;
      lst = lst.cdr;
   }

   return res;
}

function doit( num ) {
   let res = 0;
   
   while( num-- > 0 ) {
      res += length( sieve( 3000 ) );
   }

   return res;
}

function list2array( lst ) {
   let len = length( lst );
   var res = new Proxy( new Array( len ), handler );

   for( let i = 0; i < len; lst = lst.cdr, i++ ) {
      res[ i ] = lst.car;
   }

   return res;
}
      
function main() {
   let s100 = sieve( 100 );
   let n = 4000;

   doit( n );
   console.log( list2array( s100 ) );
}

main();


