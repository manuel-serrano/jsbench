/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/bglstone.hs/bague.js            */
/*    -------------------------------------------------------------    */
/*    Author      :  Pierre Weis                                       */
/*    Creation    :  Fri Apr  1 10:00:21 1994                          */
/*    Last change :  Sun Jul 11 10:39:48 2021 (serrano)                */
/*    -------------------------------------------------------------    */
/*    Resolution recursive du Baguenaudier: bench les appels de        */
/*    fonctions et les acces aux vecteurs                              */
/*    avec 21 pierres le nombre de coups est 1398101                   */
/*    avec 24 pierres le nombre de coups est 11184810                  */
/*    f (n+1) = 2*f(n) + n mod 2 avec f 1 = 1                          */
/*=====================================================================*/
"use strict";
"use hopscript";

//import { Vector } from "hopscript";

let nombre_de_coups = 0;
let jeu/*:vector*/ = new Vector(0);

const une_pierre = 1;
const une_case_vide = 0;

function init_jeu( nombre_de_pierres ) {
   nombre_de_coups = 0;
   jeu = new Vector( nombre_de_pierres );
   
   for( let i = nombre_de_pierres - 1; i >= 0; i-- ) {
      jeu[ i ] = une_pierre;
   }
}

function la_case( n ) {
   return n - 1;
}

function enleve_la_pierre( n ) {
   if( jeu[ la_case( n ) ] === une_pierre ) {
      jeu[ la_case( n ) ] = une_case_vide;
   }
}

function pose_la_pierre( n ) {
   if( jeu[ la_case( n ) ] === une_case_vide ) {
      jeu[ la_case( n ) ] = une_pierre;
   }
}

function autorise_mouvement( n ) {
   switch( n ) {
      case 1:
	 return true;
      case 2:
	 return jeu[ la_case( 1 ) ] === une_pierre;
      default:
	 if( jeu[ la_case( n - 1 ) ] !== une_pierre )
	    return false;

	 let b = true;

	 for( let i = 0; i <= la_case( n - 2 ); i++ ) {
	    b = b && (jeu[ i ] === une_case_vide);
	    i++;
	 }
	 
	 return b;
   }
}

function enleve_pierre( n ) {
   nombre_de_coups++;
   if( autorise_mouvement( n ) ) {
      enleve_la_pierre( n );
   }
}

function pose_pierre( n ) {
   nombre_de_coups++;
   if( autorise_mouvement( n ) ) {
      pose_la_pierre( n );
   }
}

function run( nombre_de_pierres ) {
   function bague( n ) {
      switch( n ) {
	 case 1:
	    enleve_pierre( 1 );
	    return;
	    
	 case 2:
	    enleve_pierre( 2 );
	    enleve_pierre( 1 );
	    return;
	    
	 default:
	    bague( n - 2 );
	    enleve_pierre( n );
	    repose( n - 2 );
	    bague( n - 1 );
      }
   }

   function repose( n ) {
      switch( n ) {
	 case 1:
	    pose_pierre( 1 );
	    return;

	 case 2:
	    pose_pierre( 1 );
	    pose_pierre( 2 );
	    return;

	 default:
	    repose( n - 1 );
	    bague( n - 2 );
	    pose_pierre( n );
	    repose( n - 2 );
      }
   }

   init_jeu( nombre_de_pierres );
   bague( nombre_de_pierres );

   let res = 0;

   switch( nombre_de_pierres ) {
      case 1: res = 1; break;
      case 2: res = 2; break;
      case 10: res = 682; break;
      case 14: res = 10922; break;
      case 20: res = 699050; break;
      case 24: res = 11184810; break;
      case 25: res = 22369621; break;
      case 26: res = 44739242; break;
      case 27: res = 89478485; break;
      case 28: res = 178956970; break;
   }

   return "res=" + res + " nb-coups=" + nombre_de_coups;
}
   
function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      res = run( 25 );
   }

   console.log( "res=", res );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 4
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 40;

main( "bague", N ); 

