/*=====================================================================*/
/*    .../project/hop/jsbench/tools/engines/d8jitless-prelude.js       */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Tue Aug 13 10:22:25 2019 (serrano)                */
/*    Copyright   :  2017-19 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for v8 (d8)                                         */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ].concat( scriptArgs ),
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
