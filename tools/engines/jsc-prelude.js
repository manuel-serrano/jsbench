/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/jsc-prelude.js        */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Mon Oct 15 08:05:28 2018 (serrano)                */
/*    Copyright   :  2017-18 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for JavaScriptCore                                  */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ].concat( this.arguments ),
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

