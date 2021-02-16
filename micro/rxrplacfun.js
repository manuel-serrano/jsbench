/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/micro/rxrplacfun.js             */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu Oct  5 07:34:05 2017                          */
/*    Last change :  Tue Oct 29 14:43:21 2019 (serrano)                */
/*    Copyright   :  2017-21 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Testing string.replace( rx, fun )                                */
/*=====================================================================*/
"use strict";

const plainText = "ROMEO: But, soft! what light through yonder window breaks?\n\
It is the east, and Juliet is the sun.\n\
Arise, fair sun, and kill the envious moon,\n\
Who is already sick and pale with grief,\n\
That thou her maid art far more fair than she:\n\
Be not her maid, since she is envious;\n\
Her vestal livery is but sick and green\n\
And none but fools do wear it; cast it off.\n\
It is my lady, O, it is my love!\n\
O, that she knew she were!\n\
She speaks yet she says nothing: what of that?\n\
Her eye discourses; I will answer it.\n\
I am too bold, 'tis not to me she speaks:\n\
Two of the fairest stars in all the heaven,\n\
Having some business, do entreat her eyes\n\
To twinkle in their spheres till they return.\n\
What if her eyes were there, they in her head?\n\
The brightness of her cheek would shame those stars,\n\
As daylight doth a lamp; her eyes in heaven\n\
Would through the airy region stream so bright\n\
That birds would sing and think it were not night.\n\
See, how she leans her cheek upon her hand!\n\
O, that I were a glove upon that hand,\n\
That I might touch that cheek!\n\
JULIET: Ay me!\n\
ROMEO: She speaks:\n\
O, speak again, bright angel! for thou art\n\
As glorious to this night, being o'er my head\n\
As is a winged messenger of heaven\n\
Unto the white-upturned wondering eyes\n\
Of mortals that fall back to gaze on him\n\
When he bestrides the lazy-pacing clouds\n\
And sails upon the bosom of the air.";

function escCtrlChars( str ) {
   return str.replace(
	 /[\0\t\n\v\f\r\xa0'"!-:;?.]/g,
      function(c) { return '!' + c.charCodeAt( 0 ) + '!'; });
}

function rxrplacfun( i, str ) {
   return escCtrlChars( str ).length + i;
}

function run( N ) {
   let k = N / 10;
   
   for( let i = 0; i < N; i++ ) {
      if( i % k == 0 ) console.log( i );
      rxrplacfun( i, plainText );
   }
   return rxrplacfun( N, plainText );
}

const K = 50;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000) * K;

console.log( run( N ) );
