/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/chakra-prelude.js     */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Thu Oct 11 09:18:36 2018 (serrano)                */
/*    Copyright   :  2017-18 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for JavaScriptCore                                  */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ].concat( WScript.Arguments ),
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


      
