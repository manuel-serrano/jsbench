/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/html.js           */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:53:11 2017                          */
/*    Last change :  Mon Oct 22 18:50:21 2018 (serrano)                */
/*    Copyright   :  2017-18 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Generate a HTML table from logs                                  */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );
const format = require( "util" ).format;
const common = require( "../common.js" );
const utils = require( "./utils.js" );

/*---------------------------------------------------------------------*/
/*    logHtml ...                                                      */
/*---------------------------------------------------------------------*/
function logHtml( log, namepad, enginepad, enames, meanfun ) {
   let len = 0;

   process.stdout.write( "<tr>" );
   process.stdout.write( "<td class=\"name\"><tt>" );
   process.stdout.write( utils.padding( log.name + "</tt>", namepad + 1 ) );

   enames.forEach( en => {
      let e = log.engines.find( o => o.name === en );
      process.stdout.write( "</td><td class=\"" + e.name + "\">" );
      if( !e || !e.logs || e.logs.length === 0 || e.logs[ e.logs.length -1 ].time <= 0 ) {
	 process.stdout.write( utils.padding( "_", enginepad ) );
      } else {
	 const times = e.logs[ e.logs.length - 1 ].times;
	 const { tm, min, max } = meanfun( times.rtimes )
	 const pmin = (1 - (min / tm)) * 100, pmax = ((max / tm) - 1) * 100;

	 const mn = utils.mean( times.rtimes );
	 const str = (tm/1000).toFixed( 2 ) + "";
	 
	 process.stdout.write( utils.padding( str, enginepad ) );
      }
   } );
   process.stdout.write( "</td></tr>\n" );
}

/*---------------------------------------------------------------------*/
/*    collectEngines ...                                               */
/*---------------------------------------------------------------------*/
function collectEngines( logs ) {
   const enames = [];

   logs.forEach( log => {
      log.engines.forEach( e => {
	 if( enames.indexOf( e.name ) < 0 ) { enames.push( e.name ) };
      } );
   } );

   return enames;
}
      
/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args ) {
   const alogs = logfiles.map( l => require( common.normalizeCwd( l ) ) );
   const logs = Array.prototype.concat.apply( [], alogs );
   const enames = engines.length > 0
	 ? engines.map( e => e.name )
	 : collectEngines( logs );
   let namepad = 10;
   let enginepad = 4;

   logs.forEach( l => { if( l.name.length > namepad ) namepad = l.name.length } );
   enames.forEach( n => { if( n.length > enginepad ) enginepad = n.length } );

   if( args.beginTabular ) {
      process.stdout.write( args.beginTabular + "\n" );
   } else {
      process.stdout.write( "<table>\n" );
   }

   process.stdout.write( "<tr><th><span class=\"benchmark\">benchmark</span></th>" );
   enames.forEach( n => {
      process.stdout.write( "<th class=\"engine\"><tt>" );
      process.stdout.write( utils.padding( n + "</tt></th>", enginepad + 3) );
   } );
   process.stdout.write( "</tr>\n" );
   
   logs.forEach( log => logHtml( log, namepad, enginepad + 5, enames, utils.median ) );
   if( args.endTabular ) {
      process.stdout.write( args.endTabular + "\n" );
   } else {
      process.stdout.write( "</table>\n" );
   }
}


