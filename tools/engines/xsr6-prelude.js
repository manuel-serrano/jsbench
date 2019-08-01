/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/xsr6-prelude.js       */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Tue Apr  3 05:13:14 2018 (serrano)                */
/*    Copyright   :  2017-18 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for rhino compiler                                  */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ],
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

this.getJitCompilerOptions = true;
