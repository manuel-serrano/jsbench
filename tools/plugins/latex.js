/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/latex.js          */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:53:11 2017                          */
/*    Last change :  Thu Oct 17 08:45:12 2019 (serrano)                */
/*    Copyright   :  2017-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Generate a latex table from logs                                 */
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
/*    logLatex ...                                                     */
/*---------------------------------------------------------------------*/
function logLatex( log, namepad, enginepad, enames, meanfun ) {
   let len = 0;

   process.stdout.write( "\\texttt" );
   process.stdout.write( utils.padding( "{" + log.name + "}", namepad + 1 ) );

   enames.forEach( en => {
      let e = log.engines.find( o => o.name === en );
      
      process.stdout.write( " & " );
      if( !e || !e.logs || e.logs.length === 0
	  || !e.logs[ e.logs.length - 1 ].time
	  || e.logs[ e.logs.length - 1 ].time <= 0 ) {
	 process.stdout.write( utils.padding( "\\_", enginepad ) );
      } else {
	 const times = e.logs[ e.logs.length - 1 ].times;
	 const { tm, min, max } = meanfun( times.rtimes )
	 const pmin = (1 - (min / tm)) * 100, pmax = ((max / tm) - 1) * 100;

	 const mn = utils.mean( times.rtimes );
	 const dev = (utils.deviation( times.rtimes ) * 100 / mn).toFixed( 1 );
	 
	 const str = (tm/1000).toFixed( 2 ) + " \\tiny{$" + dev + "\\%$}";
	 
	 process.stdout.write( utils.padding( str, enginepad ) );
      }
   } );
   process.stdout.write( " \\\\\n" );
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
module.exports = function( logfiles, engines, args, config ) {
   const alogs = logfiles.map( l => require( common.normalizeCwd( l ) ) );

   const logs = common.mergeLogs( logfiles, args );
   const enames = engines.length > 0
	 ? engines.map( e => e.name )
	 : collectEngines( logs );
   let namepad = 10;
   let enginepad = 4;

   logs.forEach( l => { if( l.name.length > namepad ) namepad = l.name.length } );
   enames.forEach( n => { if( n.length > enginepad ) enginepad = n.length } );

   if( args.beginTabular ) {
      process.stdout.write( args.beginTabular.replace( /\\n/g, "\n" ) );
      process.stdout.write( "\n" );
   } else if( args.t ) {
      process.stdout.write( args.t.replace( /\\n/g, "\n" ) );
      process.stdout.write( "\n" );
   } else {
      let table = "\\begin{tabular}{|l|";
      for( let i = 0; i < enames.length; i++ ) table += "r|";
      table += "} \\hline\n";
      process.stdout.write( table );
   }

   process.stdout.write( "\\textit{benchmark}" );
   enames.forEach( n => {
      process.stdout.write( " & \\multicolumn{1}{c|}{\\makebox[" + (args.l ? args.l : "3em") + "][c]{\\texttt" );
      process.stdout.write( utils.padding( "{" + n + "}}}", enginepad + 3) );
   } );
   process.stdout.write( " \\\\\\hline\\hline\n" );
   
   logs.forEach( log => logLatex( log, namepad, enginepad + 27, enames, utils.median ) );
   process.stdout.write( "\\hline\n" );
   process.stdout.write( args.endTabular || "\\end{tabular}" );
   process.stdout.write( "\n" );
}


