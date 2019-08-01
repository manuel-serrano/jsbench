"use strict";

const beautify = require('js-beautify').js;
const fs = require('fs');
const path = require('path');

const K = 30;
const N = K / 10;
	  
function driver() {
   const file = (process.argv[ 2 ], false) 
      || path.join( path.dirname( module.filename ), "./test.js" );

   if( fs.existsSync( file ) ) {
      fs.readFile( file, 'utf8', function (err, data) {
	 let r = "";
	 if (err) throw err;
	 
	 for( let i = 0; i < K; i++ ) {
	    if( K % N === 0 ) console.log( i );
	    
	    r = beautify(data, { indent_size: 2, space_in_empty_paren: true });
	 }
	 
	 console.log( r );
      });
   }
}

driver();

   
   
