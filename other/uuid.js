"use strict";

/*---------------------------------------------------------------------*/
/*    date ...                                                         */
/*---------------------------------------------------------------------*/
function Datenow() {
   return 1600956559750;
}

/*---------------------------------------------------------------------*/
/*    assert                                                           */
/*---------------------------------------------------------------------*/
function assert( v ) {
   if( !v ) throw( "assert error" );
}

assert.strictEqual = ( x, y ) => x === y;

function equal( x, y ) {
   if( x === y ) return true;
   if( typeof x !== typeof y ) throw( "assert.deepEqual error" );
   if( x instanceof Array ) {
      for( let i = x.length - 1; i >= 0; i-- ) {
	 if( x[ i ] !== y[ i ] ) throw( "asser.deepEqual error" );
      }
   }
}
   
assert.equal = equal;

function deepEqual( x, y ) {
   if( x === y ) return true;
   if( typeof x !== typeof y ) throw( "assert.deepEqual error" );
   if( x instanceof Array ) {
      for( let i = x.length - 1; i >= 0; i-- ) {
	 if( !deepEqual( x[ i ], y[ i ] ) ) throw( "asser.deepEqual error" );
      }
   }
}
   
assert.deepEqual = deepEqual;

assert.throws = function( thunk ) {
   try {
      thunk();
      throw( "assert.throws error" );
   } catch( _ ) {
      return true;
   }
}

assert.ok = function( x ) { return x === true };

/*---------------------------------------------------------------------*/
/*    md5                                                              */
/*---------------------------------------------------------------------*/
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
const hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
const b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
const chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function buf_md5(s){ return binl2buf(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}

/*** META ((export hmac-md5sum-string)) */
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }

function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

function md5Buffer( n ) {
   let s=new Array( 4 );
   let i = 7;
   for( let j = 3; j >= 0; j-- ) {
      let v0 = (n>>>(i--*4)) & 0xf; 
      let v1 = (n>>>(i--*4)) & 0xf; 
      s[ j ] = v0 << 4 | v1; 
   }
   return s;
}

function binl2buf(bin)
{
   return md5Buffer( bin[0] )
      .concat( md5Buffer( bin[1] ), md5Buffer( bin[2] ), md5Buffer( bin[3] ) );
/*    return md5Buffer( bin[0] )                                       */
/*       .concat( md5Buffer( bin[1] ) )                                */
/*       .concat( md5Buffer( bin[2] ) )                                */
/*       .concat( md5Buffer( bin[3] ) );                               */
}


function md5(s){ 
   return buf_md5(s); 
}

// <Buffer 32 7b 6f 07 43 58 11 23 9b c4 7e 15 44 35 32 73>
//console.log( "md5=", md5( "foo bar" ) );

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

/*---------------------------------------------------------------------*/
/*    sha1                                                             */
/*---------------------------------------------------------------------*/
function sha1( msg ) {
   // constants [4.2.1]
   var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];


   // PREPROCESSING 
 
   msg += String.fromCharCode(0x80); // add trailing '1' bit to string [5.1.1]

   // convert string msg into 512-bit/16-integer blocks arrays of ints [5.2.1]
   var l = Math.ceil(msg.length/4) + 2;  // long enough to contain msg plus 2-word length
   var N = Math.ceil(l/16);              // in N 16-int blocks
   var M = new Array(N);
   for (var i=0; i<N; i++) {
      M[i] = new Array(16);
      for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
	 M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
	    (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
      }
   }

   // add length (in bits) into final pair of 32-bit integers (big-endian) [5.1.1]
   // note: most significant word would be ((len-1)*8 >>> 32, but since JS converts
   // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
   M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32);
   M[N-1][14] = Math.floor(M[N-1][14]);
   M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

   // set initial hash value [5.3.1]
   var H0 = 0x67452301;
   var H1 = 0xefcdab89;
   var H2 = 0x98badcfe;
   var H3 = 0x10325476;
   var H4 = 0xc3d2e1f0;

   // HASH COMPUTATION [6.1.2]

   var W = new Array(80); var a, b, c, d, e;
   for (var i=0; i<N; i++) {

      // 1 - prepare message schedule 'W'
      for (var t=0;  t<16; t++) {
	 W[t] = M[i][t];
      }
      for (var t=16; t<80; t++) {
	 W[t] = sha1ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);
      }

      // 2 - initialise five working variables a, b, c, d, e with previous hash value
      a = H0; b = H1; c = H2; d = H3; e = H4;

      // 3 - main loop
      for (var t=0; t<80; t++) {
	 var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
	 var T = (sha1ROTL(a,5) + sha1f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
	 var y = (sha1ROTL(a,5) + sha1f(s,b,c,d) + e + K[s] + W[t]);

	 e = d;
	 d = c;
	 c = sha1ROTL(b, 30);
	 b = a;
	 a = T;
      }

      // 4 - compute the new intermediate hash value
      H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
      H1 = (H1+b) & 0xffffffff; 
      H2 = (H2+c) & 0xffffffff; 
      H3 = (H3+d) & 0xffffffff; 
      H4 = (H4+e) & 0xffffffff;
   }

   return sha1Buffer(H0).concat( sha1Buffer(H1),sha1Buffer(H2), sha1Buffer(H3), sha1Buffer(H4) );
/*    return sha1Buffer(H0)                                            */
/*       .concat( sha1Buffer(H1) )                                     */
/*       .concat( sha1Buffer(H2) )                                     */
/*       .concat( sha1Buffer(H3) )                                     */
/*       .concat( sha1Buffer(H4) );                                    */
}

//<Buffer 37 73 de a6 51 56 90 98 38 fa 6c 22 82 5c af e0 90 ff 80 30>
//console.log( "sha1=", sha1sum( "foo bar" ) );


//
// function 'f' [4.1.1]
//
function sha1f(s, x, y, z) {
   switch (s) {
      case 0: return (x & y) ^ (~x & z);           // Ch()
      case 1: return x ^ y ^ z;                    // Parity()
      case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
      case 3: return x ^ y ^ z;                    // Parity()
   }
}

//
// rotate left (circular left shift) value x by n positions [3.2.5]
//
function sha1ROTL(x, n) {
   return (x<<n) | (x>>>(32-n));
}

//
// extend Number class with a tailored hex-string method 
//   (note toString(16) is implementation-dependant, and 
//   in IE returns signed numbers when used on full words)
//
function sha1HexStr( n ) {
   var s="", v;
   for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
   return s;
}

function sha1Buffer( n ) {
   let s=new Array( 4 );
   let i = 7;
   for( let j = 0; j < 4; j++ ) {
      let v0 = (n>>>(i--*4)) & 0xf; 
      let v1 = (n>>>(i--*4)) & 0xf; 
      s[ j ] = v0 << 4 | v1; 
   }
   return s;
}

/*---------------------------------------------------------------------*/
/*    rng.js                                                           */
/*---------------------------------------------------------------------*/
const rndsNums = [187,55,129,176,7,23,180,251,197,120,60,168,219,172,243,90,192,111,72,174,51,96,140,195,204,234,236,44,244,79,116,126,84,158,110,170,229,142,12,162,11,36,159,163,177,192,116,254,226,118,59,147,39,115,184,211,4,149,133,15,90,21,229,188,130,167,99,157,172,112,18,70,112,175,8,190,98,122,67,12,81,117,165,114,86,92,59,22,165,223,47,139,44,183,220,32,145,95,192,99,179,16,192,165,9,120,45,125,185,97,214,179,238,36,199,100,87,130,51,179,83,88,247,35,114,102,221,225,87,135,60,138,94,94,230,146,59,181,234,129,28,62,16,81,109,21,104,3,9,151,26,99,129,161,173,196,134,203,235,3,130,55,54,162,232,62,133,7,151,226,153,140,224,218,119,145,166,191,28,159,89,230,210,121,26,156,143,152,208,55,195,26,109,197,53,211,178,119,159,118,22,35,88,143,22,37,31,134,242,79,106,180,241,3,150,29,140,29,119,160,130,110,161,199,183,147,249,254,58,26,190,3,206,3,188,236,227,95,100,247,109,232,32,229,201,74,35,85,109,31,33,66,179,71,209,72];

function randomFillSync( buf ) {
   for( let i = 0; i < rndsNums.length; i++ ) {
      buf[ i ] = rndsNums[ i ];
   }
}

const rnds8Pool = new Array(256); // # of random values to pre-allocate
let poolPtr = rnds8Pool.length;

function rngReset() {
   poolPtr = rnds8Pool.length;
}

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}

/*---------------------------------------------------------------------*/
/*    validate.js                                                      */
/*---------------------------------------------------------------------*/
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

/*---------------------------------------------------------------------*/
/*    stringify.js                                                     */
/*---------------------------------------------------------------------*/
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();

  // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields
  if (!validate(uuid)) {
     console.log( "UU=", uuid, arr, offset );
     console.log( arr[ 6 ], arr[ 7 ] );
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/*---------------------------------------------------------------------*/
/*    v1.js                                                            */
/*---------------------------------------------------------------------*/
// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

let _nodeId;
let _clockseq;

// Previous uuid creation time
let _lastMSecs = 0;
let _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  let i = (buf && offset) || 0;
  const b = buf || new Array(16);

  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1],
        seedBytes[2],
        seedBytes[3],
        seedBytes[4],
        seedBytes[5],
      ];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  let msecs = options.msecs !== undefined ? options.msecs : Datenow();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = (clockseq + 1) & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = (tl >>> 24) & 0xff;
  b[i++] = (tl >>> 16) & 0xff;
  b[i++] = (tl >>> 8) & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
  b[i++] = (tmh >>> 8) & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  //#:tprint( "ICI" );
  b[i++] = ((tmh >>> 24) & 0xf) | 0x10; // include version
  b[i++] = (tmh >>> 16) & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = (clockseq >>> 8) | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || stringify(b);
}

function parse(uuid) {
  if (!validate(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Array(16);

  // Parse ########-....-....-....-............
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = (v >>> 16) & 0xff;
  arr[2] = (v >>> 8) & 0xff;
  arr[3] = v & 0xff;

  // Parse ........-####-....-....-............
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff;

  // Parse ........-....-####-....-............
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff;

  // Parse ........-....-....-####-............
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff;

  // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
  arr[10] = ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff;
  arr[11] = (v / 0x100000000) & 0xff;
  arr[12] = (v >>> 24) & 0xff;
  arr[13] = (v >>> 16) & 0xff;
  arr[14] = (v >>> 8) & 0xff;
  arr[15] = v & 0xff;

  return arr;
}

/*---------------------------------------------------------------------*/
/*    v35.js                                                           */
/*---------------------------------------------------------------------*/
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

function bytesToString( bytes ) {
   let s = "";
   let l = bytes.length;
   
   for( let i = 0; i < l; i++ ) {
      s += String.fromCharCode( bytes[ i ] );
   }
   
   return s;
}


function v35(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = parse(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    }

    // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`
    let bytes = new Array(16 + value.length);
/*     bytes.set(namespace);                                           */
/*     bytes.set(value, namespace.length);                             */
    for( let i = namespace.length -1; i >= 0; i-- ) {
       bytes[ i ] = namespace[ i ];
    }
    for( let i = value.length - 1, base = namespace.length; i >= 0; i-- ) {
       bytes[ i + base ] = value[ i ];
    }
    
    bytes = hashfunc(bytesToString( bytes ));

    bytes[6] = (bytes[6] & 0x0f) | version;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return stringify(bytes);
  }

  // Function#name is not settable on some platforms (#270)
  try {
    generateUUID.name = name;
    // eslint-disable-next-line no-empty
  } catch (err) {}

  // For CommonJS default export support
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;

  return generateUUID;
}

/*---------------------------------------------------------------------*/
/*    v3.js ...                                                        */
/*---------------------------------------------------------------------*/
const v3 = v35('v3', 0x30, md5);
v3.DNS = DNS;
v3.URL = URL;

/*---------------------------------------------------------------------*/
/*    v4.js ...                                                        */
/*---------------------------------------------------------------------*/
function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

/*---------------------------------------------------------------------*/
/*    v5.js ...                                                        */
/*---------------------------------------------------------------------*/
const v5 = v35('v5', 0x50, sha1);

const NIL = '00000000-0000-0000-0000-000000000000';

function version(uuid) {
  if (!validate(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

/*---------------------------------------------------------------------*/
/*    tests                                                            */
/*---------------------------------------------------------------------*/
let verbOn = true;

function describe( msg, thunk ) {
   if( verbOn ) console.log( msg, "..." );
   thunk();
}

function test( msg, thunk ) {
   if( verbOn ) console.log( "   " + msg );
   thunk();
}

/*---------------------------------------------------------------------*/
/*    testv1 ...                                                       */
/*---------------------------------------------------------------------*/
function testv1() {
   const TIME = 1321644961388; // 2011-11-18 11:36:01.388-08:00

   describe('v1', () => {
      test('v1 sort order (default)', () => {
    	 const ids = [v1(), v1(), v1(), v1(), v1()];

    	 const sorted = [...ids].sort((a, b) => {
      	       a = a.split('-').reverse().join('-');
      	       b = b.split('-').reverse().join('-');
      	       return a < b ? -1 : a > b ? 1 : 0;
    	    });

    	 assert.deepEqual(ids, sorted);
      });
      
      // Verify ordering of v1 ids created with explicit times
      test('v1 sort order (time option)', () => {
    	 const ids = [
      	    v1({ msecs: TIME - 10 * 3600 * 1000 }),
      	    v1({ msecs: TIME - 1 }),
      	    v1({ msecs: TIME }),
      	    v1({ msecs: TIME + 1 }),
      	    v1({ msecs: TIME + 28 * 24 * 3600 * 1000 }),
    	    ];

    	 const sorted = [...ids].sort((a, b) => {
      	       a = a.split('-').reverse().join('-');
      	       b = b.split('-').reverse().join('-');
      	       return a < b ? -1 : a > b ? 1 : 0;
    	    });

    	 assert.deepEqual(ids, sorted);
      });

      test('msec', () => {
    	 // eslint-disable-next-line no-self-compare
    	 assert(v1({ msecs: TIME }) !== v1({ msecs: TIME }), 'IDs created at same msec are different');
      });

      test('exception thrown when > 10k ids created in 1ms', () => {
    	 assert.throws(function () {
      	    v1({ msecs: TIME, nsecs: 10000 });
    	 }, 'throws when > 10K ids created in 1 ms');
      });

      test('clock regression by msec', () => {
    	 // Verify clock regression bumps clockseq
    	 const uidt = v1({ msecs: TIME });
    	 const uidtb = v1({ msecs: TIME - 1 });
    	 assert(
      	    parseInt(uidtb.split('-')[3], 16) - parseInt(uidt.split('-')[3], 16) === 1,
      	    'Clock regression by msec increments the clockseq'
    	    );
      });

      test('clock regression by nsec', () => {
    	 // Verify clock regression bumps clockseq
    	 const uidtn = v1({ msecs: TIME, nsecs: 10 });
    	 const uidtnb = v1({ msecs: TIME, nsecs: 9 });
    	 assert(
      	    parseInt(uidtnb.split('-')[3], 16) - parseInt(uidtn.split('-')[3], 16) === 1,
      	    'Clock regression by nsec increments the clockseq'
    	    );
      });

      const fullOptions = {
    	 msecs: 1321651533573,
    	 nsecs: 5432,
    	 clockseq: 0x385c,
    	 node: [0x61, 0xcd, 0x3c, 0xbb, 0x32, 0x10],
      };

      test('explicit options product expected id', () => {
    	 // Verify explicit options produce expected id
    	 const id = v1(fullOptions);
    	 assert(id === 'd9428888-122b-11e1-b85c-61cd3cbb3210', 'Explicit options produce expected id');
      });

      test('ids spanning 1ms boundary are 100ns apart', () => {
    	 // Verify adjacent ids across a msec boundary are 1 time unit apart
    	 const u0 = v1({ msecs: TIME, nsecs: 9999 });
    	 const u1 = v1({ msecs: TIME + 1, nsecs: 0 });

    	 const before = u0.split('-')[0];
    	 const after = u1.split('-')[0];
    	 const dt = parseInt(after, 16) - parseInt(before, 16);
    	 assert(dt === 1, 'Ids spanning 1ms boundary are 100ns apart');
      });

      const expectedBytes = [217, 66, 136, 136, 18, 43, 17, 225, 184, 92, 97, 205, 60, 187, 50, 16];

      test('fills one UUID into a buffer as expected', () => {
    	 const buffer = [];
    	 const result = v1(fullOptions, buffer);
    	 assert.deepEqual(buffer, expectedBytes);
    	 assert.strictEqual(buffer, result);
      });

      test('fills two UUIDs into a buffer as expected', () => {
    	 const buffer = [];
    	 v1(fullOptions, buffer, 0);
    	 v1(fullOptions, buffer, 16);
    	 assert.deepEqual(buffer, expectedBytes.concat(expectedBytes));
      });
   });
}

/*---------------------------------------------------------------------*/
/*    testv35                                                          */
/*---------------------------------------------------------------------*/
function testv35() {
   describe('v35', () => {
      const HASH_SAMPLES = [
    	 {
      	    input: '',
      	    sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
      	    md5: 'd41d8cd98f00b204e9800998ecf8427e',
    	 },

    	 // Extended ascii chars
    	 {
      	    input:
            '\t\b\f  !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u00A1\u00A2\u00A3\u00A4\u00A5\u00A6\u00A7\u00A8\u00A9\u00AA\u00AB\u00AC\u00AE\u00AF\u00B0\u00B1\u00B2\u00B3\u00B4\u00B5\u00B6\u00B7\u00B8\u00B9\u00BA\u00BB\u00BC\u00BD\u00BE\u00BF\u00C0\u00C1\u00C2\u00C3\u00C4\u00C5\u00C6\u00C7\u00C8\u00C9\u00CA\u00CB\u00CC\u00CD\u00CE\u00CF\u00D0\u00D1\u00D2\u00D3\u00D4\u00D5\u00D6\u00D7\u00D8\u00D9\u00DA\u00DB\u00DC\u00DD\u00DE\u00DF\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5\u00E6\u00E7\u00E8\u00E9\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F0\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6\u00F7\u00F8\u00F9\u00FA\u00FB\u00FC\u00FD\u00FE\u00FF',
            sha1: 'ca4a426a3d536f14cfd79011e79e10d64de950a0',
 	    md5: 'e8098ec21950f841731d28749129d3ee',
    	 },

    	 // A sampling from the Unicode BMP
    	 {
      	    input:
            '\u00A5\u0104\u018F\u0256\u02B1o\u0315\u038E\u0409\u0500\u0531\u05E1\u05B6\u0920\u0903\u09A4\u0983\u0A20\u0A02\u0AA0\u0A83\u0B06\u0C05\u0C03\u1401\u16A0',
      	    sha1: 'f2753ebc390e5f637e333c2a4179644a93ae9f65',
      	    md5: '231b309e277b6be8bb3d6c688b7f098b',
    	 },
  	 ];

      function hashToHex(hash) {
    	 return hash
      	    .map(function (b) {
               return b.toString(16).padStart(2, '0');
      	    })
      	    .join('');
      }

      test('sha1 node', () => {
    	 HASH_SAMPLES.forEach(function (sample) {
      	    assert.equal(hashToHex(sha1(sample.input)), sample.sha1);
    	 });
      });

/*       test('sha1 browser', () => {                                  */
/*     	 HASH_SAMPLES.forEach(function (sample) {                      */
/*       	    assert.equal(hashToHex(sha1Browser(sample.input)), sample.sha1); */
/*     	 });                                                           */
/*       });                                                           */
/*                                                                     */
      test('md5 node', () => {
    	 HASH_SAMPLES.forEach(function (sample) {
      	    assert.equal(hashToHex(md5(sample.input)), sample.md5);
    	 });
      });

/*       test('md5 browser', () => {                                   */
/*     	 HASH_SAMPLES.forEach(function (sample) {                      */
/*       	    assert.equal(hashToHex(md5Browser(sample.input)), sample.md5); */
/*     	 });                                                           */
/*       });                                                           */
/*                                                                     */
      test('v3', () => {
    	 // Expect to get the same results as http://tools.adjet.org/uuid-v3
    	 assert.strictEqual(v3('hello.example.com', v3.DNS), '9125a8dc-52ee-365b-a5aa-81b0b3681cf6');

    	 assert.strictEqual(
      	    v3('http://example.com/hello', v3.URL),
      	    'c6235813-3ba4-3801-ae84-e0a6ebb7d138'
    	    );

    	 assert.strictEqual(
      	    v3('hello', '0f5abcd1-c194-47f3-905b-2df7263a084b'),
      	    'a981a0c2-68b1-35dc-bcfc-296e52ab01ec'
    	    );
      });

/*       test('v3 namespace.toUpperCase', () => {                      */
/*     	 assert.strictEqual(                                           */
/*       	    v3('hello.example.com', v3.DNS.toUpperCase()),     */
/*       	    '9125a8dc-52ee-365b-a5aa-81b0b3681cf6'             */
/*     	    );                                                         */
/*                                                                     */
/*     	 assert.strictEqual(                                           */
/*       	    v3('http://example.com/hello', v3.URL.toUpperCase()), */
/*       	    'c6235813-3ba4-3801-ae84-e0a6ebb7d138'             */
/*     	    );                                                         */
/*                                                                     */
/*     	 assert.strictEqual(                                           */
/*       	    v3('hello', '0f5abcd1-c194-47f3-905b-2df7263a084b'.toUpperCase()), */
/*       	    'a981a0c2-68b1-35dc-bcfc-296e52ab01ec'             */
/*     	    );                                                         */
/*       });                                                           */
/*                                                                     */
      test('v3 namespace string validation', () => {
    	 assert.throws(() => {
      	       v3('hello.example.com', 'zyxwvuts-rqpo-nmlk-jihg-fedcba000000');
    	    });

    	 assert.throws(() => {
      	       v3('hello.example.com', 'invalid uuid value');
    	    });

    	 assert.ok(v3('hello.example.com', '00000000-0000-0000-0000-000000000000'));
      });

      test('v3 namespace buffer validation', () => {
    	 assert.throws(() => {
      	       v3('hello.example.com', new Array(15));
    	    });

    	 assert.throws(() => {
      	       v3('hello.example.com', new Array(17));
    	    });

	 let js68fix = new Array(16);
	 js68fix.fill(0);
    	 assert.ok(v3('hello.example.com', js68fix));
      });

      test('v3 fill buffer', () => {
    	 let buf = new Array(16);

    	 const testBuf = [
      	    0x91,
      	    0x25,
      	    0xa8,
      	     0xdc,
      	      0x52,
      	      0xee,
      	       0x36,
      	       0x5b,
      		0xa5,
      		 0xaa,
      		  0x81,
      		  0xb0,
      		   0xb3,
      		    0x68,
      		    0x1c,
      		     0xf6,
    		    ];

    	 const result = v3('hello.example.com', v3.DNS, buf);

    	 assert.deepEqual(buf, testBuf);
    	 assert.strictEqual(result, buf);

    	 // test offsets as well
    	 buf = new Array(19);

    	 for (let i = 0; i < 3; ++i) {
      	    buf[i] = 'landmaster';
    	 }

    	 v3('hello.example.com', v3.DNS, buf, 3);

    	 assert.deepEqual(buf, ['landmaster', 'landmaster', 'landmaster'].concat(testBuf));
      });

      test('v5', () => {
    	 // Expect to get the same results as http://tools.adjet.org/uuid-v5
    	 assert.strictEqual(v5('hello.example.com', v5.DNS), 'fdda765f-fc57-5604-a269-52a7df8164ec');

    	 assert.strictEqual(
      	    v5('http://example.com/hello', v5.URL),
      	    '3bbcee75-cecc-5b56-8031-b6641c1ed1f1'
    	    );

    	 assert.strictEqual(
      	    v5('hello', '0f5abcd1-c194-47f3-905b-2df7263a084b'),
      	    '90123e1c-7512-523e-bb28-76fab9f2f73d'
    	    );
      });

/*       test('v5 namespace.toUpperCase', () => {                      */
/*     	 // Expect to get the same results as http://tools.adjet.org/uuid-v5 */
/*     	 assert.strictEqual(                                           */
/*       	    v5('hello.example.com', v5.DNS.toUpperCase()),     */
/*       	    'fdda765f-fc57-5604-a269-52a7df8164ec'             */
/*     	    );                                                         */
/*                                                                     */
/*     	 assert.strictEqual(                                           */
/*       	    v5('http://example.com/hello', v5.URL.toUpperCase()), */
/*       	    '3bbcee75-cecc-5b56-8031-b6641c1ed1f1'             */
/*     	    );                                                         */
/*                                                                     */
/*     	 assert.strictEqual(                                           */
/*       	    v5('hello', '0f5abcd1-c194-47f3-905b-2df7263a084b'.toUpperCase()), */
/*       	    '90123e1c-7512-523e-bb28-76fab9f2f73d'             */
/*     	    );                                                         */
/*       });                                                           */
/*                                                                     */
      test('v5 namespace string validation', () => {
    	 assert.throws(() => {
      	       v5('hello.example.com', 'zyxwvuts-rqpo-nmlk-jihg-fedcba000000');
    	    });

    	 assert.throws(() => {
      	       v5('hello.example.com', 'invalid uuid value');
    	    });

    	 assert.ok(v5('hello.example.com', '00000000-0000-0000-0000-000000000000'));
      });

      test('v5 namespace buffer validation', () => {
    	 assert.throws(() => {
      	       v5('hello.example.com', new Array(15));
    	    });

    	 assert.throws(() => {
      	       v5('hello.example.com', new Array(17));
    	    });

	 let js68fix = new Array(16);
	 js68fix.fill(0);
    	 assert.ok(v5('hello.example.com', js68fix));
      });

      test('v5 fill buffer', () => {
    	 let buf = new Array(16);

    	 const testBuf = [
      	    0xfd,
      	     0xda,
      	      0x76,
      	      0x5f,
      	       0xfc,
      		0x57,
      		0x56,
      		0x04,
      		0xa2,
      		 0x69,
      		 0x52,
      		 0xa7,
      		  0xdf,
      		   0x81,
      		   0x64,
      		   0xec,
    		   ];

    	 const result = v5('hello.example.com', v5.DNS, buf);
    	 assert.deepEqual(buf, testBuf);
    	 assert.strictEqual(result, buf);

    	 // test offsets as well
    	 buf = new Array(19);

    	 for (let i = 0; i < 3; ++i) {
      	    buf[i] = 'landmaster';
    	 }

    	 v5('hello.example.com', v5.DNS, buf, 3);

    	 assert.deepEqual(buf, ['landmaster', 'landmaster', 'landmaster'].concat(testBuf));
      });

      test('v3/v5 constants', () => {
    	 assert.strictEqual(v3.DNS, '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
    	 assert.strictEqual(v3.URL, '6ba7b811-9dad-11d1-80b4-00c04fd430c8');
    	 assert.strictEqual(v5.DNS, '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
    	 assert.strictEqual(v5.URL, '6ba7b811-9dad-11d1-80b4-00c04fd430c8');
      });
   });
}

/*---------------------------------------------------------------------*/
/*    testv4 ...                                                       */
/*---------------------------------------------------------------------*/
function testv4() {
   describe('v4', () => {
      const randomBytesFixture = [
    	 0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71,
	 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36, ];

      const expectedBytes = [16, 145, 86, 190, 196, 251, 65, 234, 177, 180, 239, 225, 103, 28, 88, 54];

      test('subsequent UUIDs are different', () => {
    	 const id1 = v4();
    	 const id2 = v4();
    	 assert(id1 !== id2);
      });

      test('explicit options.random produces expected result', () => {
    	 const id = v4({
      			  random: randomBytesFixture,
    		       });
    	 assert.strictEqual(id, '109156be-c4fb-41ea-b1b4-efe1671c5836');
      });

      test('explicit options.rng produces expected result', () => {
    	 const id = v4({
      			  rng: () => randomBytesFixture,
    		       });
    	 assert.strictEqual(id, '109156be-c4fb-41ea-b1b4-efe1671c5836');
      });

      test('fills one UUID into a buffer as expected', () => {
    	 const buffer = [];
    	 const result = v4(
      	    {
               random: randomBytesFixture,
      	    },
      	    buffer
    	       );
    	 assert.deepEqual(buffer, expectedBytes);
    	 assert.strictEqual(buffer, result);
      });

      test('fills two UUIDs into a buffer as expected', () => {
    	 const buffer = [];
    	 v4(
      	    {
               random: randomBytesFixture,
      	    },
      	    buffer,
      	    0
    	    );
    	 v4(
      	    {
               random: randomBytesFixture,
      	    },
      	    buffer,
      	    16
    	    );
    	 assert.deepEqual(buffer, expectedBytes.concat(expectedBytes));
      });
   });
}

/*---------------------------------------------------------------------*/
/*    testAll                                                          */
/*---------------------------------------------------------------------*/
function testAll( verb ) {
   verbOn = verb;
   rngReset();
   testv1();
   testv35();
   testv4();
}

function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   testAll( true );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      testAll( false );
   }
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 500
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 5000;

main( "uuid", N ); 
