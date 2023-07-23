/*=====================================================================*/
/*    .../project/hop/bench/jsbench/tools/engines/js102-prelude.js     */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Sun Jul 23 06:49:30 2023 (serrano)                */
/*    Copyright   :  2017-23 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for spidermonkey (js102)                            */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };
const __dirname = "@DIRNAME@";

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ].concat( scriptArgs ),
   env: { HOME: "@HOME" },
   stdout: {
      write: function( n ) {
	 if( n == "\n" ) {
	    print( buffer_stdout );
	    buffer_stdout = "";
	 } else {
	    buffer_stdout += n;
	 }
      }
   }
}

const console = {
   log: print
}

Array.prototype.fill = function( value, start, end ) {
   if( !start ) start = 0;
   if( !end ) end = this.length;
   
   for( let i = start; i < end; i++ ) {
      this[ i ] = value;
   }
}
      
const global = {
   console: console,
   process: process
}
