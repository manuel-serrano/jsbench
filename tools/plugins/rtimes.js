/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/rtimes.js         */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Oct 27 14:00:39 2019                          */
/*    Last change :  Thu Apr 30 08:03:18 2020 (serrano)                */
/*    Copyright   :  2019-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Display the mean of real executions time for one benchmark       */
/*    and one engine.                                                  */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );
const format = require( "util" ).format;
const common = require( "../common.js" );

/*---------------------------------------------------------------------*/
/*    mean ...                                                         */
/*---------------------------------------------------------------------*/
function mean( times ) {
   let res = 0;
   
   for( let i = times.length - 1; i >= 0; i-- ) {
      res += times[ i ];
   }
   
   return Math.round( res / times.length );
}

/*---------------------------------------------------------------------*/
/*    logRTime ...                                                     */
/*---------------------------------------------------------------------*/
function logRTime( logs, enames, args ) {
   
   logs.forEach( log => {
      	 let len = 0;
      	 let engines = log.engines.filter( e => enames.indexOf( e.name ) != -1 );
	 
	 if( args.v ) {
      	    process.stdout.write( "log=" + log + "\n" );
	 }
      	 
      	 engines.forEach( e => {
	       if( e.name.length > len )
	    	  len = e.name.length;
	       if( e.host.length > len )
	    	  len = e.host.length;
	       if( e.version && (e.version.length + 2) > len )
	    	  len = 2 +  e.version.length;
      	    } );

      	 len += 6;

	 engines.forEach( e => {
	       let l = e.logs[ 0 ];
	       
	       if( l && l.times.rtimes ) {
		  process.stdout.writeSync( (mean( l.times.rtimes ) / 1000).toFixed( 2 ) + "\n" );
		  fs.fsyncSync( process.stdout );
	       } } );
      } );
}

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args ) {
   let logs = common.mergeLogs( logfiles, args );
   let queue = [];
   
   if( engines.length == 0 ) {
      logs.forEach( log => {
	 log.engines.forEach( e => {
	    if( queue.indexOf( e.name ) == -1 ) {
	       engines.push( e );
	       queue.push( e.name );
	    }
	 } );
      } );
   }
      
   if( args.v ) {
      process.stdout.write( "rtimes engines=" + engines + "\n" );
   }
   
   logRTime( logs, engines.map( e => e.name ), args );
}
