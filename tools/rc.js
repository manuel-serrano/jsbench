/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/rc.js                     */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Fri Apr 14 06:43:39 2017                          */
/*    Last change :  Mon Aug 27 15:15:57 2018 (serrano)                */
/*    Copyright   :  2017-18 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Manages RC files                                                 */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );

/*---------------------------------------------------------------------*/
/*    defaultConfig ...                                                */
/*---------------------------------------------------------------------*/
function defaultConfig() {
   return {
      verbose: 1,                 // default verbosity
      run: 3,                     // default number of run
      tmp: "/tmp",                // default tmp directory
      log: true,
      host: hop.hostname,         
      platform: process.platform, 
      arch: process.arch          
   };
}

/*---------------------------------------------------------------------*/
/*    findConfigFile ...                                               */
/*---------------------------------------------------------------------*/
function findConfigFile( file ) {
   const host = process.env.HOST || process.env.HOSTNAME || "localhost";
   const home = process.env.HOME;
   const configdir = path.join( home, ".config", "hop", "jsbench" );
   const base = file.split( "." );
   const name = base[ 0 ];
   const suf = "." + base[ 1 ];
   
   let i = host.lastIndexOf( "." );

   while( i > 0 ) {
      let rc = path.join( configdir, name + "." + host.substring( 0, i ) + suf );
      if( fs.existsSync( rc ) ) {
	 return require( rc );
      } else {
	 i = host.lastIndexOf( ".", i - 1 );
      }
   }

   let rc = path.join( configdir, file );
   
   if( fs.existsSync( rc ) ) {
      return rc;
   } else {
      return false;
   }
}

/*---------------------------------------------------------------------*/
/*    mergeConfig ...                                                  */
/*---------------------------------------------------------------------*/
function mergeConfig( dst, src ) {
   for( let k in src ) {
      if( !(k in dst ) ) {
	 dst[ k ] = src[ k ];
      }
   }

   return dst;
}

/*---------------------------------------------------------------------*/
/*    loadConfig ...                                                   */
/*---------------------------------------------------------------------*/
function loadConfig( cfg ) {
   const dft = defaultConfig();
   
   if( cfg ) {
      if( fs.existsSync( cfg ) ) {
	 return mergeConfig( require( cfg ), dft );
      } else {
	 throw "Config file does not exist \"" + args.config + "\"";
      }
   } else {
      let cfg = findConfigFile( "jsbench.json" );
   
      if( cfg ) {
	 return mergeConfig( require( cfg ), dft );
      } else {
	 try {
	    return mergeConfig( require( "./jsbench.json" ), dft );
	 } catch( _ ) {
	    return dft;
	 }
      }
   }

   return config;
}

/*---------------------------------------------------------------------*/
/*    export                                                           */
/*---------------------------------------------------------------------*/
exports.defaultConfig = defaultConfig;
exports.loadConfig = loadConfig;
