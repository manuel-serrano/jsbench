/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/jerry-prelude.js      */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Tue Apr  3 05:14:01 2018 (serrano)                */
/*    Copyright   :  2017-18 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for rhino compiler                                  */
/*=====================================================================*/
"use strict";

var exports = {};
var module = { filename: "@PATH@" };

var buffer_stdout = "";

var process = {
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

var console = {
   log: print
}
