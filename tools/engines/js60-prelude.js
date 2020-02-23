/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/js60-prelude.js       */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Wed Feb 19 14:47:52 2020 (serrano)                */
/*    Copyright   :  2017-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for spidermonkey (js24)                             */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };
const __dirname = "@DIRNAME@";

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

Array.prototype.fill = function( value, start, end ) {
   if( !start ) start = 0;
   if( !end ) end = this.length;
   
   for( let i = start; i < end; i++ ) {
      this[ i ] = value;
   }
}
      
