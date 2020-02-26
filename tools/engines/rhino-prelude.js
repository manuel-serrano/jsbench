/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/rhino-prelude.js      */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Mon Feb 24 15:56:11 2020 (serrano)                */
/*    Copyright   :  2017-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for rhino compiler                                  */
/*=====================================================================*/
"use strict";

let exports = {};
let module = { filename: "@PATH@" };

let buffer_stdout = "";

let process = {
   argv: [ "@INTERPRETER@", "-" ],
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
