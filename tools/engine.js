/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/engine.js                 */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:55:49 2017                          */
/*    Last change :  Fri Jan  3 08:43:08 2020 (serrano)                */
/*    Copyright   :  2017-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Engine management                                                */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );
const common = require( "./common.js" );

/*---------------------------------------------------------------------*/
/*    loadEngines ...                                                  */
/*---------------------------------------------------------------------*/
function loadEngines( arr, args ) {
   
   function loadEngine( name, path ) {
      const o = require( path );
      if( !("name" in o ) ) o.name = name;

      if( o.compiler in args )
	 o.compiler = args[ o.compiler ];
      if( o.interpreter in args )
	 o.interpreter = args[ o.interpreter ];
      if( (o.compiler + "flags") in args )
	 o.extraopts = args[ o.compiler + "flags" ];
      
      if( o.version ) {
	 const ver = o.version
	       .replace( /@COMPILER@/g, o.compiler || "" )
	       .replace( /@INTERPRETER@/g, o.interpreter || "" )
	    + " 2> /dev/null";

	 o.version = #:js-string->jsstring( #:system->string( #:js-jsstring->string( ver ) ) ).replace( /\n/, "" );
      }

      if( o.prelude ) {
	 o.prelude = fs.readFileSync( dir + "/engines/" + o.prelude ).toString()
	    .replace( /@INTERPRETER@/g, o.interpreter || "" )
	    .replace( /@COMPILER@/g, o.compiler || "" );
      }
      
      return o;
   }

   const dir = path.dirname( module.filename );
   
   let engines = [];

   if( arr ) {
      (typeof arr === "string" ? [ arr ] : arr ).forEach( e => {
	 if( fs.existsSync( e ) ) {
	    if( fs.statSync( e ).isDirectory() ) {
	       let files = fs.readdirSync( e );

	       files.forEach( f => {
		  if( f.match( /[.]json$/ ) ) {
		     const n = f.replace( /[.]json$/, "" );
		     engines.push( loadEngine( n, path.join( e, f ) ) );
		  }
	       } );
	    } else {
	       const n = path.basename( e ).replace( /[.][^.]+/, "" );
	       engines.push( loadEngine( n, common.normalizeCwd( e ) ) );
	    }
	 } else {
	    try {
	       engines.push( loadEngine( e, "./engines/" + e + ".json" ) );
	    } catch( _ ) {
	       if( args.acceptmissing ) {
		  engines.push( { name: e } );
	       } else {
		  console.log( _ );
	       }
	    }
	 }
      } );
   }
   

   return engines;
}

/*---------------------------------------------------------------------*/
/*    exports                                                          */
/*---------------------------------------------------------------------*/
exports.loadEngines = loadEngines;
