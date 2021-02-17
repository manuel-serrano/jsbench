/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/jsc-prelude.js        */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Mon Feb 24 15:53:05 2020 (serrano)                */
/*    Copyright   :  2017-21 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for JavaScriptCore                                  */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };
const __dirname = "@DIRNAME@";

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ].concat( this.arguments ),
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

const global = {
   console: console,
   process: process
}
