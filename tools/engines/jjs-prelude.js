/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/engines/jjs-prelude.js        */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 07:38:36 2017                          */
/*    Last change :  Tue Apr  3 05:14:29 2018 (serrano)                */
/*    Copyright   :  2017-21 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Prelude file for jjs compiler                                    */
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
