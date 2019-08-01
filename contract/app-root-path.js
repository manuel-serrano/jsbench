/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/proxy/app-root-path.js          */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu May 16 08:58:06 2019                          */
/*    Last change :  Tue Jul 16 16:51:17 2019 (serrano)                */
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
      return this.wrapper( true ).ctor( value );
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
	    args[ i ] = domain[ i ].ctor( args[ i ] );
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
		    	   return ri.ctor( value.call( this, undefined ) );
			case 1:
		    	   return ri.ctor( value.call( this, dis[ 0 ].ctor( args[ 0 ] ) ) );
			default: 
		    	   return ri.ctor( value.apply( this, map2( args, dis, info ) ) );
		     }
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
               return ei.ctor( target[ prop ] );
            } else {
	       return target[ prop ];
	    }
	 },
	 set: function( target, prop, newval ) {
	    if( prop.match( /^[0-9]+$/ ) ) {
                   target[ prop ] = nei.ctor( newval );
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
	       	  const cv = ct.ctor( target[ prop ] );
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
	       target[ prop ] = ct.ctor( newval );
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

const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_DOT = 46;
const CHAR_UPPERCASE_A = 64;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_A = 97;
const CHAR_LOWERCASE_Z = 122;
const CHAR_COLON = 58;

function isPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}

function isPosixPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH;
}

// Resolves . and .. elements in a path with directory names
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (isPathSeparator(code))
      break;
    else
      code = CHAR_FORWARD_SLASH;

    if (isPathSeparator(code)) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== CHAR_DOT ||
            res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = '';
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
           if (res.length > 0) {
            res += `${separator}..`;
	   }
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
         if (res.length > 0) {
          res += separator + path.slice(lastSlash + 1, i); 
	 }
         else {
          res = path.slice(lastSlash + 1, i);
	 }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

const path = {
   dirname: function dirname(path)  {
      if (path.length === 0)
      	 return '.';
      const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      var end = -1;
      var matchedSlash = true;
      for (var i = path.length - 1; i >= 1; --i) {
      	 if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
               end = i;
               break;
            }
      	 } else {
            // We saw the first non-path separator
            matchedSlash = false;
      	 }
      }

      if (end === -1)
      	 return hasRoot ? '/' : '.';
      if (hasRoot && end === 1)
      	 return '//';
      return path.slice(0, end);
   },

   resolve: function resolve(path) {
      var resolvedPath = '';
      var resolvedAbsolute = false;

      // Skip empty entries
      if (path.length !== 0) {
	 resolvedPath = path + '/' + resolvedPath;
	 resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      }

      // At this point the path should be resolved to a full absolute path, but
      // handle relative paths to be safe (might happen when process.cwd() fails)

      // Normalize the path
      resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/',
	 isPosixPathSeparator);

      if (resolvedAbsolute) {
      	 if (resolvedPath.length > 0)
            return '/' + resolvedPath;
      	 else
         return '/';
      } else if (resolvedPath.length > 0) {
      	 return resolvedPath;
      } else {
      	 return '.';
      }
   },
   sep: '/',
   join: function join(dir,file) {
      return dir + "/" + file;
   }
}

const requireResolvejs = function() {
   // Dependencies
   //require('path');

   // Load global paths
   var globalPaths = [ '/home/serrano/.node_modules',
  		       '/home/serrano/.node_libraries',
  		       '/usr/lib/x86_64-linux-gnu/nodejs',
  		       '/usr/share/nodejs',
  		       '/usr/lib/nodejs' ];

   // Guess at NPM's global install dir
   var npmGlobalPrefix;
   if ('win32' === process.platform) {
      npmGlobalPrefix = path.dirname(process.execPath);
   } else {
      npmGlobalPrefix = path.dirname(path.dirname(process.execPath));
   }
   var npmGlobalModuleDir = path.resolve(npmGlobalPrefix, 'lib', 'node_modules');
   console.log( "npm=", npmGlobalModuleDir );

   // Save OS-specific path separator
   var sep = path.sep;

   // If we're in webpack, force it to use the original require() method
   var requireFunction = ("function" === typeof __webpack_require__ || "function" === typeof __non_webpack_require__)
      ? __non_webpack_require__
	   : require;

   // Resolver
   module.exports = function resolve(dirname) {
      // Check for environmental variable
      if (process.env.APP_ROOT_PATH) {
	 return path.resolve(process.env.APP_ROOT_PATH);
      }

      // Defer to Yarn Plug'n'Play if enabled
      if (process.versions.pnp) {
	 try {
	    var pnp = requireFunction('pnpapi');
	    return pnp.getPackageInformation(pnp.topLevel).packageLocation;
	 } catch (e) {}
      }

      // Defer to main process in electron renderer
      if ('undefined' !== typeof window && window.process && 'renderer' === window.process.type) {
	 try {
	    var remote = requireFunction('electron').remote;
	    return remote.require('app-root-path').path;
	 } catch (e) {}
      }

      // Defer to AWS Lambda when executing there
      if (process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV) {
	 return process.env.LAMBDA_TASK_ROOT;
      }

      var resolved = path.resolve(dirname);
      var alternateMethod = false;
      var appRootPath = null;

      // Make sure that we're not loaded from a global include path
      // Eg. $HOME/.node_modules
      //     $HOME/.node_libraries
      //     $PREFIX/lib/node
      globalPaths.forEach(function(globalPath) {
	 if (!alternateMethod && 0 === resolved.indexOf(globalPath)) {
	    alternateMethod = true;
	 }
      });

      // If the app-root-path library isn't loaded globally,
      // and node_modules exists in the path, just split __dirname
      var nodeModulesDir = sep + 'node_modules';
      if (!alternateMethod && -1 !== resolved.indexOf(nodeModulesDir)) {
	 var parts = resolved.split(nodeModulesDir);
	 if (parts.length) {
	    appRootPath = parts[0];
	    parts = null;
	 }
      }

      // If the above didn't work, or this module is loaded globally, then
      // resort to require.main.filename (See http://nodejs.org/api/modules.html)
      if (alternateMethod || null == appRootPath) {
	 appRootPath = path.dirname(require.main.filename);
      }

      // Handle global bin/ directory edge-case
      if (alternateMethod && -1 !== appRootPath.indexOf(npmGlobalModuleDir) && (appRootPath.length - 4) === appRootPath.indexOf(sep + 'bin')) {
	 appRootPath = appRootPath.slice(0, -4);
      }

      // Return
      return appRootPath;
   };
}

const lib = function(dirname) {
   //var path = require('path');
   var resolve = requireResolvejs;
   var appRootPath = dirname;

   var publicInterface = {
      resolve: function(pathToModule) {
	 return path.join(appRootPath, pathToModule);
      },

      require: function(pathToModule) {
	 return require(publicInterface.resolve(pathToModule));
      },

      toString: function() {
	 return appRootPath;
      },

      setPath: function(explicitlySetPath) {
	 appRootPath = path.resolve(explicitlySetPath);
	 publicInterface.path = appRootPath;
      },

      path: appRootPath
   };

   return publicInterface;
};

const root = lib(__dirname);

/*---------------------------------------------------------------------*/
/*    bench                                                            */
/*---------------------------------------------------------------------*/
const ctz = CTObject( { z: isString } );
const cty = CTObject( { y: ctz } );
const ctx = CTObject( { x: cty } );
const ctw = CTObject( { w: ctx } );
function test( root ) {
   const o = ctw.wrap( { w: { x: { y: { z: "zzz" } } } } );
}

function test2( root ) {
   const p = root.path;
   root.resolve('../dir');
   root.toString();
   //root.require('app-root-path');
   root.setPath('C:\\app-root');
   root.setPath(p);
}

const ctApi = CTObject( 
   { aaa: CTFunction( [ isString ], isString ),
     resolve: CTFunction( [ isString ], isString ),
     require: CTFunction( [ isString ], isObject ),
     toString: CTFunction( [ ], isString ),
     setPath: CTFunction( [ isString ], True ),
     path: isString } );
			 

const ctroot = ctApi.wrap( root );

function bench( count, fun ) {
   const n = count / 10;
   let r;
   for( let j = 0; j < 10; j++ ) {
      for( let i = 0; i < n; i++ ) {
	 r = test( fun );
      }
      console.log( j );
   }
   return r;
}

/*---------------------------------------------------------------------*/
/*    Command line                                                     */
/*---------------------------------------------------------------------*/
const TEST = process.argv[ 2 ] || "regular";
const N = parseInt( process.argv[ 3 ] || "5000000" );

console.log( "./a.out [regular|contract] [iteration]" );
console.log( "runnning: ", TEST );

bench( N, TEST === "contract" ? ctroot : root );
