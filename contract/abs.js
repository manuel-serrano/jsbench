/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/contract/abs.js                 */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu May 16 08:58:06 2019                          */
/*    Last change :  Fri Feb 21 21:43:44 2020 (serrano)                */
/*    Copyright   :  2019-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Basic Higher-Order contract JS implementation                    */
/*=====================================================================*/
"use strict";

/*---------------------------------------------------------------------*/
/*    CT                                                               */
/*---------------------------------------------------------------------*/
class CT {
   constructor( wrapper, tostr, firstorder ) {
      this.wrapper = wrapper;
      this.toString = tostr;
      this.firstOrder = firstorder;
   }
   
   wrap( value ) {
      const { t: tval, f: fval } = this.wrapper( true, false );
      return tval.ctor( value );
   }
}

/*---------------------------------------------------------------------*/
/*    CTwrapper ...                                                    */
/*---------------------------------------------------------------------*/
class CTWrapper {
   constructor( ctor ) {
      this.ctor = ctor;
   }
}

/*---------------------------------------------------------------------*/
/*    CTFlat ...                                                       */
/*---------------------------------------------------------------------*/
class CTFlat extends CT {
   constructor( pred ) {
      super( function( infot, infof ) {
	 return { t: mkWrapper( infot ), f: mkWrapper( infof ) }
      }, toString, pred );
      
      function toString() {
      	 return "CTFlat( " + this.pred.toString() + " )";
      }
   
      function mkWrapper( info ) {
	 return new CTWrapper( function( value ) {
	    if( pred( value ) ) {
	       return value;
	    } else {
	       throw new TypeError( 
		  "Predicate `" + pred.toString() + "' not satisfied for value `" + value + "': " + info );
	    }
	 } );
      }
      
      if( typeof pred !== "function" ) {
	 throw new TypeError( "Illegal predicat: " + pred );
      }
   }
}

/*---------------------------------------------------------------------*/
/*    CTFunction ...                                                   */
/*---------------------------------------------------------------------*/
function CTFunction( domain, range ) {
   
   function map2( args, domain, key ) {
      let len = args.length;
      
      for( let i = 0; i < len; i++ ) {
	 args[ i ] = domain[ i ][ key ].ctor( args[ i ] );
      }
      
      return args;
   }

   if( !(domain instanceof Array) ) {
      throw new TypeError( "Illegal domain: " + domain );
   } else {
      return new CT( function( infot, infof ) {
	 const ri = CTapply( range, infot, infof );
	 const dis = domain.map( d => CTapply( d, infot, infof ) );
	 
	 function mkWrapper( infot, infof, ri, rik, dis, disk ) {
	    const handler = {
	       apply: function( target, self, args ) {
      	       	  if( args.length !== domain.length ) {
	 	     throw new TypeError( 
	    	     	"Wrong number of argument " + args.length + "/" + domain.length 
	    	     	+ ": " + infof );
      	       	  } else {
	       	     switch( args.length ) {
		     	case 0:
		     	   return ri[ rik ].ctor( target.call( this, undefined ) );
		     	case 1:
		     	   return ri[ rik ].ctor( target.call( this, dis[ 0 ][ disk ].ctor( args[ 0 ] ) ) );
		     	default: 
		     	   return ri[ rik ].ctor( target.apply( this, map2( args, dis, disk ) ) );
	       	     }
	       	  }
	       }
	    }
	    return new CTWrapper( function( value ) {
 	       if( typeof value === "function" ) {
	       	  return new Proxy( value, handler );
	       } else {
	       	  throw new TypeError( 
		     "Not a function `" + value + "': " + infot );
	       }
	    } );
	 }
	 
	 return { 
	    t: mkWrapper( infot, infof, ri, "t", dis, "f" ),
	    f: mkWrapper( infof, infot, ri, "f", dis, "t" )
	 }
      }, function() {
 	 return "(" + domain.map( function( v ) { return v.toString() } ).join( ", " ) + " => " + range.toString() + ")";
      }, function( value ) { 
	 return typeof value === "function";
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTArray ...                                                      */
/*---------------------------------------------------------------------*/
function CTArray( element ) {
   return new CT( function( infot, infof ) {
      const ei = CTapply( element, infot, infof );

      function mkWrapper( info, ei, kt, kf ) {
      	 const handler = {
	    get: function( target, prop ) {
	       if( typeof prop === "string" && prop.match( /^[0-9]+$/ ) ) {
               return ei[ kt ].ctor( target[ prop ] );
            } else {
	       return target[ prop ];
	    }
	 },
	 set: function( target, prop, newval ) {
	    if( typeof prop === "string" && prop.match( /^[0-9]+$/ ) ) {
                   target[ prop ] = ei[ kf ].ctor( newval );
            } else {
	       target[ prop ] = newval;
	    }
	    return true;
	 }
      };
	 
      	 return new CTWrapper( function( value ) {
	    if( value instanceof Array ) {
	       return new Proxy( value, handler );
	    } else {
	       throw new TypeError(
	       	  "Not an array `" + value + "' " + info );
	    }
      	 } );
      }
      
      return { 
	 t: mkWrapper( infot, ei, "t", "f" ),
	 f: mkWrapper( infof, ei, "f", "t" )
      }
   }, function() { 
      return "CTArray( " + element.toString() + " )";
   }, function( value ) {
      return value instanceof Array;
   } );
}

/*---------------------------------------------------------------------*/
/*    CTObject ...                                                     */
/*---------------------------------------------------------------------*/
function CTObject( fields ) {
   return new CT( function( infot, infof ) {
      const ei = {};
      
      for( let k in fields ) {
	 const ctc = fields[ k ];

	 ei[ k ] = CTapply( ctc, infot, infof );
      }
      
      function mkWrapper( info, ei, kt, kf ) {
      	 var handler = {
	    get: function( target, prop ) {
	       const ct = ei[ prop ];
	       const priv = target.__private;
	       const cache = priv[ prop ];
	       if( ct ) { 
	       	  if( cache ) {
		     return cache;
	       	  } else {
	       	     const cv = ct[ kt ].ctor( target[ prop ] );
	       	     priv[ prop ] = cv;
	       	     return cv;
	       	  }
	       } else {
	       	  return target[ prop ];
	       }
      	    },
	    set: function( target, prop, newval ) {
	       const ct = ei[ prop ];
	       if( ct ) { 
	       	  priv[ prop ] = false;
	       	  target[ prop ] = ct[ kf ].ctor( newval );
	       } else {
	       	  target[ prop ] = newval;
	       }
	       return true;
      	    }
      	 }
      	 
      	 return new CTWrapper( function( value ) {
	    value.__private = {};
	    if( value instanceof Object ) {
	       return new Proxy( value, handler );
	    } else {
	       throw new TypeError(
	       	  "Not an object `" + value + "' " + info );
	    }
      	 } );
      }
      
      return {
	 t: mkWrapper( infot, ei, "t", "f" ),
	 f: mkWrapper( infof, ei, "f", "t" )
      }
   }, function() {
      return "CTObject( { "
	 + Object.keys( fields )
	    .map( k => { k + ": ", fields[ k ].toString } )
	    .join( ", " )
	 + " } )";
   }, function( value ) {
      return value instanceof Object;
   } );
}

/*---------------------------------------------------------------------*/
/*    CTOr ...                                                         */
/*---------------------------------------------------------------------*/
function CTOr( left, right ) {
   if( (left instanceof CTFlat) && (right instanceof CTFlat) ) {
      const pleft = left.firstOrder;
      const pright = right.firstOrder;
      
      return new CTFlat( function( value ) {
	 return pleft( value ) || pright( value );
      } );
   } else if( right instanceof CTFlat ) {
      return CTor( right, left );
   } else if( left instanceof CTFlat ) {
      const pleft = left.firstOrder;
      return new CT( function( infot, infof ) {
      	 const cright = CTapply( right, infot, infof );

      	 function mkWrapper( k ) {
      	    return new CTWrapper( function( value ) {
	       if( pleft( value ) ) {
		  return value;
	       } else {
		  return cright[ k ].ctor( value );
	       }
	    } );
	 }
	 
	 return {
	    t: mkWrapper( "t" ),
	    f: mkWrapper( "f" )
	 }
      } );
   } else {
      const ccleft = CTcoerce( left );
      const ccright = CTcoerce( right );
      
      return new CT( function( infot, infof ) {
      	 const cleft = CTapply( ccleft, infot, infof );
      	 const cright = CTapply( ccright, infot, infof );

      	 function mkWrapper( k ) {
      	    return new CTWrapper( function( value ) {
	       const leftfo = ccleft.firstOrder( value );
	       const rightfo = ccright.firstOrder( value );
	       
	       if( leftfo && rightfo ) {
		  throw new TypeError( 
		     "Not a valid OR contract `" + left + " || " + right + "'" );
	       } else if( !leftfo && !rightfo ) {
		  throw new TypeError( 
		     "Contract violation `" + left + " || " + right + "'" );
	       } else if( leftfo ) {
		  return cleft[ k ].ctor( value );
	       } else {
		  return cright[ k ].ctor( value );
	       }
	    } );
	 }
	 
	 return {
	    t: mkWrapper( "t" ),
	    f: mkWrapper( "f" )
	 }
      },
 	 function() {
      	    return "CTOr( " + left.toString() + ", " + right.toString() + " )";
	 },
	 function( value ) {
	    return ccleft.firstOrder( value ) || ccright.firstOrder( value );
	 } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTFix ...                                                        */
/*---------------------------------------------------------------------*/
function CTFix( thunk ) {
   let ctc = false;
   function get() {
      if( !ctc ) {
	 ctc = CTcoerce( thunk() )
      }
      return ctc;
   };
   
   return new CT( function( infot, infof ) {
	    console.log( "HERE.0");
      return { 
	 t: new CTWrapper( function( value ) {
	    console.log( "HERE.1");
	    return CTapply( get(), infot, infof ).t.ctor( value );
	 } ), 
	 f: new CTWrapper( function( value ) {
	    console.log( "HERE.2");
	    return CTapply( get(), infot, infof ).f.ctor( value );
      	 } )
      }
   },
      () => "fix",
      value => true );
//      value => get().firstOrder( value ) );
}

/*---------------------------------------------------------------------*/
/*    CTcoerce ...                                                     */
/*---------------------------------------------------------------------*/
function CTcoerce( ctc ) {
   if( typeof ctc === "function" ) {
      return new CTFlat( ctc );
   } else if( ctc === true 
	      || ctc === false 
	      || ctc === undefined 
	      || ctc === null 
	      || typeof ctc === "number" ) {
      return new CTFlat( v => v === ctc );
   } else {
      if( ctc instanceof CT ) {
	 return ctc;
      } else {
	 throw new TypeError( 
	    "Not a contract `" + ctc + "'" );
      }
   }
}

/*---------------------------------------------------------------------*/
/*    CTapply ...                                                      */
/*---------------------------------------------------------------------*/
function CTapply( ctc, infot, infof ) {
   return CTcoerce( ctc ).wrapper( infot, infof );
}

/*---------------------------------------------------------------------*/
/*    predicates ...                                                   */
/*---------------------------------------------------------------------*/
function isObject( o ) { return (typeof o) === "object" }
function isString( o ) { return (typeof o) === "string" }
function isNumber( o ) { return (typeof o) === "number" }
function isBoolean( o ) { return (typeof o) === "boolean" }
const Any = new CTFlat( o => true );

isObject.toString = function() { return "isObject" };
isString.toString = function() { return "isString" };
isNumber.toString = function() { return "isNumber" };
isBoolean.toString = function() { return "isBoolean" };
Any.toString = function() { return "Any" };

/*---------------------------------------------------------------------*/
/*    example                                                          */
/*---------------------------------------------------------------------*/
/* function add( x, y ) {                                              */
/*    return x + y;                                                    */
/* }                                                                   */
/*                                                                     */
/* const fxadd = CTFunction(                                           */
/*    [ Number.isInteger, Number.isInteger ],                          */
/*    Number.isInteger )                                               */
/*    .wrap( add );                                                    */
/*                                                                     */
/* function checkf( thunk ) {                                          */
/*    try {                                                            */
/*       return thunk();                                               */
/*    } catch( e ) {                                                   */
/*       console.log( "exnf=", e );                                    */
/*       return false;                                                 */
/*    }                                                                */
/* }                                                                   */
/*                                                                     */
/* console.log( "f.test1=", checkf( () => fxadd( 5, 2 ) ) );           */
/* console.log( "f.test2=", checkf( () => fxadd( 1.2, 2 ) ) );         */
/*                                                                     */
/* function checka( arr, src ) {                                       */
/*    try {                                                            */
/*       for( let i = src.length - 1; i >=0; i-- ) {                   */
/*       	 arr[ i ] += src[ i ];                                 */
/*       }                                                             */
/*       return arr;                                                   */
/*    } catch( e ) {                                                   */
/*       console.log( "exna=", e );                                    */
/*       return false;                                                 */
/*    }                                                                */
/* }                                                                   */
/*                                                                     */
/* console.log( "a.test1=", checka( CTArray( Number.isInteger ).wrap( [ 1, 2, -4 ] ), [ 10, 20, 30 ] ) ); */
/* console.log( "a.test2=", checka( CTArray( Number.isInteger ).wrap( [ 1, 2, -4 ] ), [ 10, 2.1, 30 ] ) ); */
/* console.log( "a.test3=", checka( CTArray( Number.isInteger ).wrap( [ 1, 2.3, -4 ] ), [ 10, 20, 30 ] ) ); */
 
/*---------------------------------------------------------------------*/
/*    abs                                                              */
/*---------------------------------------------------------------------*/
var path = require("path"),
   ul = { HOME_DIR: process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] };

/**
 * abs
 * Computes the absolute path of an input.
 *
 * @name abs
 * @function
 * @param {String} input The input path (if not provided, the current
 * working directory will be returned).
 * @return {String} The absolute path.
 */
function abs(input) {
    if (!input) {
        return process.cwd();
    }
    if (input.charAt(0) === "/") {
        return input;
    }
    if (input.charAt(0) === "~" && input.charAt(1) === "/") {
        input = ul.HOME_DIR + input.substr(1);
    }
    return path.resolve(input);
}

/*---------------------------------------------------------------------*/
/*    test                                                             */
/*---------------------------------------------------------------------*/
const ctabs = CTFunction( [ isString ], isString ).wrap( abs );

let t = true;

function bench( fun ) {
   const x = fun('/foo');
   const y = fun('/bar');
   t ^= (x !== y);
}

function testplain( ctfun, fun ) {
   bench( fun );
   bench( fun );
}

function testcontract( ctfun, fun ) {
   bench( ctfun );
   bench( ctfun );
}

function testmix( ctfun, fun ) {
   bench( ctfun );
   bench( fun );
}

/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
/* const TEST = process.argv[ 2 ] || "regular";                        */
/* const N = parseInt( process.argv[ 3 ] || "200000000" );             */
/*                                                                     */
/* console.log( "./a.out [regular|contract] [iteration]" );            */
/* console.log( "runnning: ", TEST, N );                               */
/*                                                                     */
/* bench( N, TEST === "contract" ? ctabs : abs );                      */
/* console.log( "t=", t );                                             */
/*                                                                     */
/* module.exports = abs;                                               */
/*                                                                     */
function main( name, n, testname ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   let test;
   
   switch( testname ) {
      case "mix": test = testmix; break;
      case "plain": test = testplain; break;
      default: test = testcontract;
   }
   
   console.log( name + " " + testname + " (", n, ")..." );
   
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < k; i++ ) {
      	 res = test( ctabs, abs );
      }
      console.log( j );
   }

   console.log( "res=", res );
}
   
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 20
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 20000000;

const TEST =
   ( process.argv.length > 3 ? process.argv[ 3 ] : "mix"); 

main( "abs", N, TEST );

