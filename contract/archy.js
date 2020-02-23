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
   constructor( firstOrder, wrapper ) {
      this.cache = {};
/*       this.wrapper = ( info ) => {                                  */
/* 	 if( this.cache[ info ] ) {                                    */
/* 	    return this.cache[ info ];                                 */
/* 	 } else {                                                      */
/* 	    const nv = wrapper( info );                                */
/* 	    this.cache[ info ] = nv;                                   */
/* 	    console.log( "adding to cache ", info );                   */
/* 	    return nv;                                                 */
/* 	 }                                                             */
/*       }                                                             */
      this.firstOrder = firstOrder;
      this.wrapper = wrapper;
   }
   
   wrap( value, locationt = true, locationf = false ) {
      const { t: tval, f: fval } = this.wrapper( locationt, locationf );
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
function CTFlat( pred ) {
   if( typeof pred !== "function" ) {
      throw new TypeError( "Illegal predicat: " + pred );
   } else {
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
      return new CT( pred, function( infot, infof ) {
	 return { t: mkWrapper( infot ), f: mkWrapper( infof ) }
      } );
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

   function firstOrder( x ) {
      return typeof x === "function";
   }
      
   if( !(domain instanceof Array) ) {
      throw new TypeError( "Illegal domain: " + domain );
   } else {
      return new CT( firstOrder, function( infot, infof ) {
	  const ri = CTapply( range, infot, infof, "CTFunction" );
	  const dis = domain.map( d => CTapply( d, infot, infof, "CTFunction" ) );
	 
	 function mkWrapper( info, ri, rik, dis, disk ) {
	    const handler = {
	       apply: function( target, self, args ) {
      	       	  if( args.length !== domain.length ) {
	 	     throw new TypeError( 
	    	     	"Wrong number of argument " + args.length + "/" + domain.length 
	    	     	+ ": " + info );
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
	       if( firstOrder( value ) ) {
	       	  return new Proxy( value, handler );
	       } else {
	       	  throw new TypeError( 
		     "Not a function `" + value + "': " + info );
	       }
	    } );
	 }
	 
	 return { 
	    t: mkWrapper( infot, ri, "t", dis, "f" ),
	    f: mkWrapper( infof, ri, "f", dis, "t" )
	 }
      } );
   }
}

/*---------------------------------------------------------------------*/
/*    CTRec ...                                                        */
/*---------------------------------------------------------------------*/
function CTRec( thunk ) {
   let _thunkctc = false;
   
   function mthunk() {
      if( !_thunkctc ) {
	  _thunkctc = CTCoerce( thunk() , "CTRec" );
      }
      
      return _thunkctc;
   }
   
   function firstOrder( x ) {
      return mthunk().firstOrder( x );
   }
   
   return new CT( firstOrder, 
      function( infot, infof ) {
      	 var ei;
      	 function mkWrapper( info, kt ) {
	    return new CTWrapper( function( value ) {
	       if (!ei) ei = CTapply( mthunk(), infot, infof, "CTRec" );
	       return ei[kt].ctor(value);
	    })}
      	 return { 
	    t: mkWrapper( infot, "t" ),
	    f: mkWrapper( infof, "f" )
      	 }
      });
}

/*---------------------------------------------------------------------*/
/*    CTOr ...                                                         */
/*---------------------------------------------------------------------*/
function CTOrExplicitChoice( lchoose, left, rchoose, right ) {
   return new CT( x => lchoose( x ) || rchoose( x ),
      function( infot, infof ) {
	 const ei_l = CTapply( left, infot, infof, "CTOr");
	 const ei_r = CTapply( right, infot, infof, "CTOr" );
	 function mkWrapper( info, kt ) {
      	    return new CTWrapper( function( value ) {
	       const is_l = lchoose(value);
	       const is_r = rchoose(value);
	       var ei = undefined;
	       if (is_l && is_r) ei = ei_l; // this is first-or/c, do we want or/c?
	       if (is_l) ei = ei_l;
	       if (is_r) ei = ei_r;
	       if (!ei) {
		  throw new TypeError( 
		     "CTOr neither applied: " + value 
		     + ": " + info );
	       }
	       return ei[kt].ctor(value);
	    })
	 }
	 return { 
	    t: mkWrapper( infot, "t" ),
	    f: mkWrapper( infof, "f" )
	 }
      });
}

function CTOr( left, right ) {
   const lc = CTCoerce( left, "CTOr" );
   const rc = CTCoerce( right, "CTOr" );
   
   return CTOrExplicitChoice( lc.firstOrder, lc, rc.firstOrder, rc );
}
   
/*---------------------------------------------------------------------*/
/*    CTArray ...                                                      */
/*---------------------------------------------------------------------*/
function CTArray( element ) {
   function firstOrder( x ) {
      return x instanceof Array;
   }
   
   return new CT( firstOrder,
      function( infot, infof ) {
       	 const ei = CTapply( element, infot, infof, "CTArray" );

      	 function mkWrapper( info, ei, kt, kf ) {
      	    const handler = {
	       get: function( target, prop ) {
	       	  if( prop.match( /^[0-9]+$/ ) ) {
               	     return ei[ kt ].ctor( target[ prop ] );
            	  } else {
	       	     return target[ prop ];
	    	  }
	       },
	       set: function( target, prop, newval ) {
	    	  if( prop.match( /^[0-9]+$/ ) ) {
                     target[ prop ] = ei[ kf ].ctor( newval );
            	  } else {
	       	     target[ prop ] = newval;
	    	  }
	    	  return true;
	       }
      	    };
	    
      	    return new CTWrapper( function( value ) {
	       if( firstOrder( value ) ) {
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
      } );
}

/*---------------------------------------------------------------------*/
/*    CTObject ...                                                     */
/*---------------------------------------------------------------------*/
function CTObject( fields ) {
   function firstOrder( x ) {
      return x instanceof Object
   }
	 
   return new CT( firstOrder, 
      function( infot, infof ) {
      	 const ei = {};
      	 
      	 for( let k in fields ) {
	    const ctc = fields[ k ];

	    ei[ k ] = CTapply( ctc, infot, infof, "CTObject" );
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
	       if( firstOrder( value ) ) {
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
      } );
}

/*---------------------------------------------------------------------*/
/*    CTCoerce ...                                                     */
/*---------------------------------------------------------------------*/
function CTCoerce( obj, who ) {
   if( typeof obj === "function" ) {
       return CTCoerce( CTFlat( obj ) , who);
   } else if( obj === true ) {
       return CTCoerce( CTFlat( v => true ) , who);
   } else {
      if( obj instanceof CT ) {
	 return obj;
      } else {
	 throw new TypeError( 
	     (who ? (who + ": ") : "") +
	     "not a contract `" + obj + "'" );
      }
   }
}
/*---------------------------------------------------------------------*/
/*    CTapply ...                                                      */
/*---------------------------------------------------------------------*/
function CTapply( ctc, infot, infof, who ) {
    return CTCoerce( ctc, who ).wrapper( infot, infof );
}

/*---------------------------------------------------------------------*/
/*    predicates ...                                                   */
/*---------------------------------------------------------------------*/
function isObject( o ) { return (typeof o) === "object" }
function isFunction( o ) { return (typeof o) === "function" }
function isString( o ) { return (typeof o) === "string" }
function isBoolean( o ) { return (typeof o) === "boolean" }
function isNumber( o ) { return (typeof o) === "number" }
function True( o ) { return true }

/*---------------------------------------------------------------------*/
/*    exports                                                          */
/*---------------------------------------------------------------------*/
exports.CTObject = CTObject;
exports.CTOr = CTOr;
exports.CTRec = CTRec;
exports.CTFunction = CTFunction;
exports.CTArray = CTArray;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.isString = isString;
exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.True = True;

exports.CTexports = function( ctc, val, locationt ) {
    return (locationf) =>
	CTCoerce(ctc, "CTExports " + locationt)
	.wrap( val, locationt, locationf );
}

exports.CTimports = function( obj, location ) {
   let res = {};
   for( let k in obj ) {
      res[ k ] = obj[ k ]( location );
   }
   return res;
}

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
const ctNode = CTOr( isString, CTRec( () => ctData));
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

/*---------------------------------------------------------------------*/
/*    test                                                             */
/*---------------------------------------------------------------------*/
function runtest( fun ) {
   var s = fun(o, "", opt );
   return s;
}

function testplain( ctfun, fun ) {
   return runtest( fun );
   return runtest( fun );
}

function testcontract( ctfun, fun ) {
   return runtest( ctfun );
   return runtest( ctfun );
}

function testmix( ctfun, fun ) {
   runtest( ctfun );
   runtest( fun );
}   
/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
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
      	 res = test( ctarchy, archy );
      }
      console.log( j );
   }

   console.log( "res=", res );
}
   
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 20
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 400000;

const TEST =
   ( process.argv.length > 3 ? process.argv[ 3 ] : "mix"); 

main( "archy", N, TEST );
