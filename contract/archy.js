/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/proxy/archy.js                  */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu May 16 08:58:06 2019                          */
/*    Last change :  Wed Jul 17 17:27:18 2019 (serrano)                */
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
/*    CTRec                                                            */
/*---------------------------------------------------------------------*/
class CTRec {
   constructor( thunk ) {
      this.thunk = thunk;
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
/*    CTapply ...                                                      */
/*---------------------------------------------------------------------*/
function CTapply( ctc, info ) {
   if( typeof ctc === "function" ) {
      return CTapply( CTFlat( ctc ), info );
   } else if( ctc === true ) {
      return CTapply( CTFlat( v => true ), info );
   } else if( ctc === false ) {
      return CTapply( CTFlat( v => false ), info );
   } else {
      if( ctc instanceof CT ) {
	 return ctc.wrapper( info );
      } else {
	 throw new TypeError( 
	    "Not a contract `" + ctc + "': " + info );
      }
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
	    if( prop.match( /^[0-9]+$/ ) ) {
               return ei.box( target[ prop ] );
            } else {
	       return target[ prop ];
	    }
	 },
	 set: function( target, prop, newval ) {
	    if( prop.match( /^[0-9]+$/ ) ) {
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
/*    predicates ...                                                   */
/*---------------------------------------------------------------------*/
function isObject( o ) { return (typeof o) === "object" }
function isString( o ) { return (typeof o) === "string" }
function isBoolean( o ) { return (typeof o) === "boolean" }
function True( o ) { return true }
function False( o ) { return false }

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
/*    archy                                                            */
/*---------------------------------------------------------------------*/
function archy (obj, prefix, opts) {
    var chr = function(s) {
        var chars = {
            '│' : '|',
            '└' : '`',
            '├' : '+',
            '─' : '-',
            '┬' : '-'
        };
        return opts.unicode === false ? chars[s] : s;
    };
    
    if (typeof obj === 'string') obj = { label : obj };
    
    var nodes = obj.nodes || [];
    var lines = (obj.label || '').split('\n');
    var splitter = '\n' + prefix + (nodes.length ? chr('│') : ' ') + ' ';
    
    return prefix
        + lines.join(splitter) + '\n'
        + nodes.map(function (node, ix) {
            var last = ix === nodes.length - 1;
            var more = node.nodes && node.nodes.length;
            var prefix_ = prefix + (last ? ' ' : chr('│')) + ' ';

            return prefix
                + (last ? chr('└') : chr('├')) + chr('─')
                + (more ? chr('┬') : chr('─')) + ' '
                + archy(node, prefix_, opts).slice(prefix.length + 2)
            ;
        }).join('')
};

const ctOpt = CTObject( { unicode: isBoolean } );
const ctNode = CTOr( isString, function( val ) { return CTapply( ctData ).box( val ) } );
const ctData = CTObject( { label: isString, nodes: CTArray( ctNode ) } );
const ctApi = CTFunction( [ ctData, isString, ctOpt ], isString );

const ctarchy = ctApi.wrap( archy );

/*---------------------------------------------------------------------*/
/*    testing                                                          */
/*---------------------------------------------------------------------*/
const o = {
   label : 'beep\none\ntwo',
   nodes : [
      'ity',
      {
	 label : 'boop',
	 nodes : [
	    {
	       label : 'o_O\nwheee',
	       nodes : [
		  {
		     label : 'oh',
		     nodes : [ 'hello', 'puny\nmeat' ]
		  },
		  'creature'
	       ]
	    },
	    'party\ntime!'
	 ]
      }
      ]
};

const opt = { unicode: false };

function test( fun ) {
   var s = fun(o, "", opt );
   return s;
}

function bench( count, fun ) {
   console.log( "bench...", count );
   const n = count / 10;
   let r;
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < n; i++ ) {
	 r = test( fun );
      }
      console.log( j );
   }
   console.log( r );
   
   return r;
}

/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
const TEST = process.argv[ 2 ] || "regular";
const N = parseInt( process.argv[ 3 ] || "100000" );

console.log( "./a.out [regular|contract] [iteration]" );
console.log( "runnning: ", TEST );

bench( N, TEST === "contract" ? ctarchy : archy );
