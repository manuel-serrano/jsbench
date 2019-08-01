/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/proxy/abbrev.js                 */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu May 16 08:58:06 2019                          */
/*    Last change :  Fri Jul 12 14:18:21 2019 (serrano)                */
/*    Copyright   :  2019 Manuel Serrano                               */
/*    -------------------------------------------------------------    */
/*    Basic Higher-Order contract JS implementation                    */
/*=====================================================================*/
"use strict";

/*---------------------------------------------------------------------*/
/*    CT                                                               */
/*---------------------------------------------------------------------*/
class CT {
   constructor( wrapper ) {
      this.wrapper = wrapper;
   }
   
   wrap( value ) {
      return this.wrapper( true ).box( value );
   }
}

/*---------------------------------------------------------------------*/
/*    CTwrapper ...                                                    */
/*---------------------------------------------------------------------*/
class CTWrapper {
   constructor( box ) {
      this.box = box;
   }
}

/*---------------------------------------------------------------------*/
/*    CTFlat ...                                                       */
/*---------------------------------------------------------------------*/
function CTFlat( pred ) {
   if( typeof pred !== "function" ) {
      throw new TypeError( "Illegal predicat: " + pred );
   } else {
      return new CT( function( info ) {
      	 return new CTWrapper( function( value ) {
	    if( pred( value ) ) {
	       return value;
	    } else {
	       throw new TypeError( 
		  "Predicate `" + pred.toString() + "' not satisfied for value `" + value + "': " + info );
	    }
      	 } );
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTFunction ...                                                   */
/*---------------------------------------------------------------------*/
function CTFunction( domain, range ) {
   
   function map2( args, domain, info ) {
      if( args.length !== domain.length ) {
	 throw new TypeError( 
	    "Wrong number of argument " + args.length + "/" + domain.length 
	    + ": " + info );
      } else {
	 let len = args.length;
	 
	 for( let i = 0; i < len; i++ ) {
	    args[ i ] = domain[ i ].box( args[ i ] );
	 }
	 
	 return args;
      }
   }
   
   const call = Function.prototype.call;
   const apply = Function.prototype.apply;
   
   if( !(domain instanceof Array) ) {
      throw new TypeError( "Illegal domain: " + domain );
   } else {
      return new CT( function( info ) {
	 const ri = CTapply( range, info );
	 const dis = domain.map( d => CTapply( d, !info ) );
	 
	 return new CTWrapper( function( value ) {
	    if( typeof value === "function" ) {
	       return new Proxy( value, {
		  apply: function( target, self, args ) {
		     switch( args.length ) {
			case 0:
		     	   return ri.box( value.call( this, undefined ) );
			case 1:
		     	   return ri.box( value.call( this, dis[ 0 ].box( args[ 0 ] ) ) );
			default: 
		     	   return ri.box( value.apply( this, map2( args, dis, info ) ) );
		     }
		  },
		  toString: function() {
		     return "<" + value.toString() + ">";
		  }
	       } );
	    } else {
	       throw new TypeError( 
		  "Not a function `" + value + "': " + info );
	    }
	 } );
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTArray ...                                                      */
/*---------------------------------------------------------------------*/
function CTArray( element ) {
   return new CT( function( info ) {
      const ei = CTapply( element, info );
      const nei = CTapply( element, !info );
      
      const handler = {
	 get: function( target, prop ) {
	    if( typeof prop === "string" && prop.match( /^[0-9]+$/ ) ) {
               return ei.box( target[ prop ] );
            } else {
	       return target[ prop ];
	    }
	 },
	 set: function( target, prop, newval ) {
	    if( typeof prop === "string" && prop.match( /^[0-9]+$/ ) ) {
                   target[ prop ] = nei.box( newval );
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
   } );
}

/*---------------------------------------------------------------------*/
/*    CTObject ...                                                     */
/*---------------------------------------------------------------------*/
function CTObject( fields ) {
   return new CT( function( info ) {
      const ei = {}, nei = {};
      
      for( let k in fields ) {
	 ei[ k ] = CTapply( fields[ k ], info );
      	 nei[ k ] = CTapply( fields[ k ], !info );
      }
      
      var handler = {
	 get: function( target, prop ) {
	    const ct = ei[ prop ];
	    if( ct ) { 
	       if( handler[ prop ] ) {
		  return handler[ prop ];
	       } else {
	       	  const cv = ct.box( target[ prop ] );
	       	  handler[ prop ] = cv;
	       	  return cv;
	       }
	    } else {
	       return target[ prop ];
	    }
      	 },
	 set: function( target, prop, newval ) {
	    const ct = nei[ prop ];
	    if( ct ) { 
	       target[ prop ] = false;
	       target[ prop ] = ct.box( newval );
	    } else {
	       target[ prop ] = newval;
	    }
	    return true;
      	 }
      }
      
      return new CTWrapper( function( value ) {
	 if( value instanceof Object ) {
	    return new Proxy( value, handler );
	 } else {
	    throw new TypeError(
	       "Not an object `" + value + "' " + info );
	 }
      } );
   } );
}

/*---------------------------------------------------------------------*/
/*    CTOr ...                                                         */
/*---------------------------------------------------------------------*/
function CTOr( left, right ) {
   return new CT( function( info ) {
      const cleft = CTapply( left, info );
      const cright = CTapply( right, info );
      
      return new CTWrapper( function( value ) {
	 try {
	    return cleft.box( value );
	 } catch( e ) {
      	    try {
 	       return cright.box( value );
	    } catch( e2 ) {
	       throw new TypeError( 
	       	  "Predicate `" + left.toString() + " || " + right.toString() 
	       	  + "' not satisfied for value `" + value + "': " + info );
	    }
	 }
      } );
   } )
}

/*---------------------------------------------------------------------*/
/*    CTapply ...                                                      */
/*---------------------------------------------------------------------*/
function CTapply( ctc, value ) {
   if( typeof ctc === "function" ) {
      return CTapply( CTFlat( ctc ), value );
   } else if( ctc === true ) {
      return CTapply( CTFlat( v => true ), value );
   } else {
      if( ctc instanceof CT ) {
	 return ctc.wrapper( value );
      } else {
	 throw new TypeError( 
	    "Not a contract `" + ctc + "': " + value );
      }
   }
}

/*---------------------------------------------------------------------*/
/*    predicates ...                                                   */
/*---------------------------------------------------------------------*/
function isObject( o ) { return (typeof o) === "object" }
function isString( o ) { return (typeof o) === "string" }
function isBoolean( o ) { return (typeof o) === "boolean" }
function isUndefined( o ) { return o === undefined }
function True( o ) { return true }

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
/*    abbrev                                                           */
/*---------------------------------------------------------------------*/
module.exports = exports = abbrev.abbrev = abbrev

function abbrev (list) {
/*   if (arguments.length !== 1 || !Array.isArray(list)) {             */
/*     list = Array.prototype.slice.call(arguments, 0)                 */
/*   }                                                                 */
  for (var i = 0, l = list.length, args = [] ; i < l ; i ++) {
    args[i] = typeof list[i] === "string" ? list[i] : String(list[i])
  }

  // sort them lexicographically, so that they're next to their nearest kin
  args = args.sort(lexSort)

  // walk through each, seeing how much it has in common with the next and previous
  var abbrevs = {}
    , prev = ""
  for (var i = 0, l = args.length ; i < l ; i ++) {
    var current = args[i]
      , next = args[i + 1] || ""
      , nextMatches = true
      , prevMatches = true
    if (current === next) continue
    for (var j = 0, cl = current.length ; j < cl ; j ++) {
      var curChar = current.charAt(j)
      nextMatches = nextMatches && curChar === next.charAt(j)
      prevMatches = prevMatches && curChar === prev.charAt(j)
      if (!nextMatches && !prevMatches) {
        j ++
        break
      }
    }
    prev = current
    if (j === cl) {
      abbrevs[current] = current
      continue
    }
    for (var a = current.substr(0, j) ; j <= cl ; j ++) {
      abbrevs[a] = current
      a += current.charAt(j)
    }
  }
  return abbrevs
}

function lexSort (a, b) {
  return a === b ? 0 : a > b ? 1 : -1
}

/*---------------------------------------------------------------------*/
/*    bench                                                            */
/*---------------------------------------------------------------------*/
const ctc = CTFunction( [ CTArray( isString ) ], 
   CTObject( { fl: isString } ) );
const ctabbrev = ctc.wrap( abbrev );

function test( fun ) {
   let abbrs = fun(['foo', 'fool', 'folding', 'flop']);
   return typeof abbrs.fl === "string";
}

function bench( count, fun ) {
   const n = count / 10;
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < n; i++ ) {
      	 const x = test( fun );
      }
      console.log( j );
   }
   return true;
}

/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
const TEST = process.argv[ 2 ] || "regular";
const N = parseInt( process.argv[ 3 ] || "3000000" );

console.log( "./a.out [regular|contract] [iteration]" );
console.log( "runnning: ", TEST );

/* function bench( count ) {                                           */
/*    const n = count / 10;                                            */
/*    for( let j = 0; j < 10; j++ ) {                                  */
/*       for( let i = 0; i < n; i++ ) {                                */
/*       	 const x = test2();                                    */
/*       }                                                             */
/*       console.log( j );                                             */
/*    }                                                                */
/*    return true;                                                     */
/* }                                                                   */

bench( 3000000, TEST === "contract" ? ctabbrev : abbrev );
//bench( 100000 );

