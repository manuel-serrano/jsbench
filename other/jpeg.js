"use strict";

/*
  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without 
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
  
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution.
  
  * Neither the name of Adobe Systems Incorporated nor the names of its 
    contributors may be used to endorse or promote products derived from 
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
JPEG encoder ported to JavaScript and optimized by Andreas Ritter, www.bytestrom.eu, 11/2009

Basic GUI blocking jpeg encoder
*/

var kkk = 0;

const MyBuffer = {
   alloc: function(bytes) { return new Array(bytes); },
   from: function(buf) { return buf; }
}

function ArrayInt32( len ) {
   let a = new Array( len );
   a.fill( 0 );
   return a;
}

function checksum( buffer ) {
   let sum = 43;
   for( let i = buffer.length - 1; i >= 0; i-- ) {
      sum ^= (buffer[ i ] & 0xff);
   }
   return sum;
}

var btoa = btoa || function(buf) {
  return Buffer.from(buf).toString('base64');
};

function JPEGEncoder(quality) {
  var self = this;
	var fround = Math.round;
	var ffloor = Math.floor;
	var YTable = new Array(64);
	var UVTable = new Array(64);
	var fdtbl_Y = new Array(64);
	var fdtbl_UV = new Array(64);
	var YDC_HT;
	var UVDC_HT;
	var YAC_HT;
	var UVAC_HT;

	var bitcode = new Array(65535);
	var category = new Array(65535);
	var outputfDCTQuant = new Array(64);
	var DU = new Array(64);
	var byteout = [];
	var bytenew = 0;
	var bytepos = 7;

	var YDU = new Array(64);
	var UDU = new Array(64);
	var VDU = new Array(64);
	var clt = new Array(256);
	var RGB_YUV_TABLE = new Array(2048);
	var currentQuality;

	var ZigZag = [
			 0, 1, 5, 6,14,15,27,28,
			 2, 4, 7,13,16,26,29,42,
			 3, 8,12,17,25,30,41,43,
			 9,11,18,24,31,40,44,53,
			10,19,23,32,39,45,52,54,
			20,22,33,38,46,51,55,60,
			21,34,37,47,50,56,59,61,
			35,36,48,49,57,58,62,63
		];

	var std_dc_luminance_nrcodes = [0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
	var std_dc_luminance_values = [0,1,2,3,4,5,6,7,8,9,10,11];
	var std_ac_luminance_nrcodes = [0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
	var std_ac_luminance_values = [
			0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,
			0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,
			0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,
			0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,
			0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,
			0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,
			0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,
			0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
			0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,
			0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,
			0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,
			0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
			0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,
			0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,
			0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,
			0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,
			0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,
			0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,
			0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,
			0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
			0xf9,0xfa
		];

	var std_dc_chrominance_nrcodes = [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
	var std_dc_chrominance_values = [0,1,2,3,4,5,6,7,8,9,10,11];
	var std_ac_chrominance_nrcodes = [0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
	var std_ac_chrominance_values = [
			0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,
			0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,
			0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,
			0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,
			0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,
			0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,
			0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,
			0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,
			0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,
			0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,
			0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,
			0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,
			0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,
			0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,
			0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,
			0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,
			0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,
			0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,
			0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,
			0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
			0xf9,0xfa
		];

	function initQuantTables(sf){
			var YQT = [
				16, 11, 10, 16, 24, 40, 51, 61,
				12, 12, 14, 19, 26, 58, 60, 55,
				14, 13, 16, 24, 40, 57, 69, 56,
				14, 17, 22, 29, 51, 87, 80, 62,
				18, 22, 37, 56, 68,109,103, 77,
				24, 35, 55, 64, 81,104,113, 92,
				49, 64, 78, 87,103,121,120,101,
				72, 92, 95, 98,112,100,103, 99
			];

			for (var i = 0; i < 64; i++) {
				var t = ffloor((YQT[i]*sf+50)/100);
				if (t < 1) {
					t = 1;
				} else if (t > 255) {
					t = 255;
				}
				YTable[ZigZag[i]] = t;
			}
			var UVQT = [
				17, 18, 24, 47, 99, 99, 99, 99,
				18, 21, 26, 66, 99, 99, 99, 99,
				24, 26, 56, 99, 99, 99, 99, 99,
				47, 66, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99,
				99, 99, 99, 99, 99, 99, 99, 99
			];
			for (var j = 0; j < 64; j++) {
				var u = ffloor((UVQT[j]*sf+50)/100);
				if (u < 1) {
					u = 1;
				} else if (u > 255) {
					u = 255;
				}
				UVTable[ZigZag[j]] = u;
			}
			var aasf = [
				1.0, 1.387039845, 1.306562965, 1.175875602,
				1.0, 0.785694958, 0.541196100, 0.275899379
			];
			var k = 0;
			for (var row = 0; row < 8; row++)
			{
				for (var col = 0; col < 8; col++)
				{
					fdtbl_Y[k]  = (1.0 / (YTable [ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
					fdtbl_UV[k] = (1.0 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
					k++;
				}
			}
		}

		function computeHuffmanTbl(nrcodes, std_table){
			var codevalue = 0;
			var pos_in_table = 0;
			var HT = new Array();
			for (var k = 1; k <= 16; k++) {
				for (var j = 1; j <= nrcodes[k]; j++) {
					HT[std_table[pos_in_table]] = [];
					HT[std_table[pos_in_table]][0] = codevalue;
					HT[std_table[pos_in_table]][1] = k;
					pos_in_table++;
					codevalue++;
				}
				codevalue*=2;
			}
			return HT;
		}

		function initHuffmanTbl()
		{
			YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes,std_dc_luminance_values);
			UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes,std_dc_chrominance_values);
			YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes,std_ac_luminance_values);
			UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes,std_ac_chrominance_values);
		}

		function initCategoryNumber()
		{
			var nrlower = 1;
			var nrupper = 2;
			for (var cat = 1; cat <= 15; cat++) {
				//Positive numbers
				for (var nr = nrlower; nr<nrupper; nr++) {
					category[32767+nr] = cat;
					bitcode[32767+nr] = [];
					bitcode[32767+nr][1] = cat;
					bitcode[32767+nr][0] = nr;
				}
				//Negative numbers
				for (var nrneg =-(nrupper-1); nrneg<=-nrlower; nrneg++) {
					category[32767+nrneg] = cat;
					bitcode[32767+nrneg] = [];
					bitcode[32767+nrneg][1] = cat;
					bitcode[32767+nrneg][0] = nrupper-1+nrneg;
				}
				nrlower <<= 1;
				nrupper <<= 1;
			}
		}

		function initRGBYUVTable() {
			for(var i = 0; i < 256;i++) {
				RGB_YUV_TABLE[i]      		=  19595 * i;
				RGB_YUV_TABLE[(i+ 256)>>0] 	=  38470 * i;
				RGB_YUV_TABLE[(i+ 512)>>0] 	=   7471 * i + 0x8000;
				RGB_YUV_TABLE[(i+ 768)>>0] 	= -11059 * i;
				RGB_YUV_TABLE[(i+1024)>>0] 	= -21709 * i;
				RGB_YUV_TABLE[(i+1280)>>0] 	=  32768 * i + 0x807FFF;
				RGB_YUV_TABLE[(i+1536)>>0] 	= -27439 * i;
				RGB_YUV_TABLE[(i+1792)>>0] 	= - 5329 * i;
			}
		}

		// IO functions
		function writeBits(bs)
		{
			var value = bs[0];
			var posval = bs[1]-1;
			while ( posval >= 0 ) {
				if (value & (1 << posval) ) {
					bytenew |= (1 << bytepos);
				}
				posval--;
				bytepos--;
				if (bytepos < 0) {
					if (bytenew == 0xFF) {
						writeByte(0xFF);
						writeByte(0);
					}
					else {
						writeByte(bytenew);
					}
					bytepos=7;
					bytenew=0;
				}
			}
		}

		function writeByte(value)
		{
			//byteout.push(clt[value]); // write char directly instead of converting later
      byteout.push(value);
		}

		function writeWord(value)
		{
			writeByte((value>>8)&0xFF);
			writeByte((value   )&0xFF);
		}

		// DCT & quantization core
		function fDCTQuant(data, fdtbl)
		{
			var d0, d1, d2, d3, d4, d5, d6, d7;
			/* Pass 1: process rows. */
			var dataOff=0;
			var i;
			var I8 = 8;
			var I64 = 64;
			for (i=0; i<I8; ++i)
			{
				d0 = data[dataOff];
				d1 = data[dataOff+1];
				d2 = data[dataOff+2];
				d3 = data[dataOff+3];
				d4 = data[dataOff+4];
				d5 = data[dataOff+5];
				d6 = data[dataOff+6];
				d7 = data[dataOff+7];

				var tmp0 = d0 + d7;
				var tmp7 = d0 - d7;
				var tmp1 = d1 + d6;
				var tmp6 = d1 - d6;
				var tmp2 = d2 + d5;
				var tmp5 = d2 - d5;
				var tmp3 = d3 + d4;
				var tmp4 = d3 - d4;

				/* Even part */
				var tmp10 = tmp0 + tmp3;	/* phase 2 */
				var tmp13 = tmp0 - tmp3;
				var tmp11 = tmp1 + tmp2;
				var tmp12 = tmp1 - tmp2;

				data[dataOff] = tmp10 + tmp11; /* phase 3 */
				data[dataOff+4] = tmp10 - tmp11;

				var z1 = (tmp12 + tmp13) * 0.707106781; /* c4 */
				data[dataOff+2] = tmp13 + z1; /* phase 5 */
				data[dataOff+6] = tmp13 - z1;

				/* Odd part */
				tmp10 = tmp4 + tmp5; /* phase 2 */
				tmp11 = tmp5 + tmp6;
				tmp12 = tmp6 + tmp7;

				/* The rotator is modified from fig 4-8 to avoid extra negations. */
				var z5 = (tmp10 - tmp12) * 0.382683433; /* c6 */
				var z2 = 0.541196100 * tmp10 + z5; /* c2-c6 */
				var z4 = 1.306562965 * tmp12 + z5; /* c2+c6 */
				var z3 = tmp11 * 0.707106781; /* c4 */

				var z11 = tmp7 + z3;	/* phase 5 */
				var z13 = tmp7 - z3;

				data[dataOff+5] = z13 + z2;	/* phase 6 */
				data[dataOff+3] = z13 - z2;
				data[dataOff+1] = z11 + z4;
				data[dataOff+7] = z11 - z4;

				dataOff += 8; /* advance pointer to next row */
			}

			/* Pass 2: process columns. */
			dataOff = 0;
			for (i=0; i<I8; ++i)
			{
				d0 = data[dataOff];
				d1 = data[dataOff + 8];
				d2 = data[dataOff + 16];
				d3 = data[dataOff + 24];
				d4 = data[dataOff + 32];
				d5 = data[dataOff + 40];
				d6 = data[dataOff + 48];
				d7 = data[dataOff + 56];

				var tmp0p2 = d0 + d7;
				var tmp7p2 = d0 - d7;
				var tmp1p2 = d1 + d6;
				var tmp6p2 = d1 - d6;
				var tmp2p2 = d2 + d5;
				var tmp5p2 = d2 - d5;
				var tmp3p2 = d3 + d4;
				var tmp4p2 = d3 - d4;

				/* Even part */
				var tmp10p2 = tmp0p2 + tmp3p2;	/* phase 2 */
				var tmp13p2 = tmp0p2 - tmp3p2;
				var tmp11p2 = tmp1p2 + tmp2p2;
				var tmp12p2 = tmp1p2 - tmp2p2;

				data[dataOff] = tmp10p2 + tmp11p2; /* phase 3 */
				data[dataOff+32] = tmp10p2 - tmp11p2;

				var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781; /* c4 */
				data[dataOff+16] = tmp13p2 + z1p2; /* phase 5 */
				data[dataOff+48] = tmp13p2 - z1p2;

				/* Odd part */
				tmp10p2 = tmp4p2 + tmp5p2; /* phase 2 */
				tmp11p2 = tmp5p2 + tmp6p2;
				tmp12p2 = tmp6p2 + tmp7p2;

				/* The rotator is modified from fig 4-8 to avoid extra negations. */
				var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433; /* c6 */
				var z2p2 = 0.541196100 * tmp10p2 + z5p2; /* c2-c6 */
				var z4p2 = 1.306562965 * tmp12p2 + z5p2; /* c2+c6 */
				var z3p2 = tmp11p2 * 0.707106781; /* c4 */

				var z11p2 = tmp7p2 + z3p2;	/* phase 5 */
				var z13p2 = tmp7p2 - z3p2;

				data[dataOff+40] = z13p2 + z2p2; /* phase 6 */
				data[dataOff+24] = z13p2 - z2p2;
				data[dataOff+ 8] = z11p2 + z4p2;
				data[dataOff+56] = z11p2 - z4p2;

				dataOff++; /* advance pointer to next column */
			}

			// Quantize/descale the coefficients
			var fDCTQuant;
			for (i=0; i<I64; ++i)
			{
				// Apply the quantization and scaling factor & Round to nearest integer
				fDCTQuant = data[i]*fdtbl[i];
				outputfDCTQuant[i] = (fDCTQuant > 0.0) ? ((fDCTQuant + 0.5)|0) : ((fDCTQuant - 0.5)|0);
				//outputfDCTQuant[i] = fround(fDCTQuant);

			}
			return outputfDCTQuant;
		}

		function writeAPP0()
		{
			writeWord(0xFFE0); // marker
			writeWord(16); // length
			writeByte(0x4A); // J
			writeByte(0x46); // F
			writeByte(0x49); // I
			writeByte(0x46); // F
			writeByte(0); // = "JFIF",'\0'
			writeByte(1); // versionhi
			writeByte(1); // versionlo
			writeByte(0); // xyunits
			writeWord(1); // xdensity
			writeWord(1); // ydensity
			writeByte(0); // thumbnwidth
			writeByte(0); // thumbnheight
		}

		function writeAPP1(exifBuffer) {
			if (!exifBuffer) return;

			writeWord(0xFFE1); // APP1 marker

			if (exifBuffer[0] === 0x45 &&
					exifBuffer[1] === 0x78 &&
					exifBuffer[2] === 0x69 &&
					exifBuffer[3] === 0x66) {
				// Buffer already starts with EXIF, just use it directly
				writeWord(exifBuffer.length + 2); // length is buffer + length itself!
			} else {
				// Buffer doesn't start with EXIF, write it for them
				writeWord(exifBuffer.length + 5 + 2); // length is buffer + EXIF\0 + length itself!
				writeByte(0x45); // E
				writeByte(0x78); // X
				writeByte(0x69); // I
				writeByte(0x66); // F
				writeByte(0); // = "EXIF",'\0'
			}

			for (var i = 0; i < exifBuffer.length; i++) {
				writeByte(exifBuffer[i]);
			}
		}

		function writeSOF0(width, height)
		{
			writeWord(0xFFC0); // marker
			writeWord(17);   // length, truecolor YUV JPG
			writeByte(8);    // precision
			writeWord(height);
			writeWord(width);
			writeByte(3);    // nrofcomponents
			writeByte(1);    // IdY
			writeByte(0x11); // HVY
			writeByte(0);    // QTY
			writeByte(2);    // IdU
			writeByte(0x11); // HVU
			writeByte(1);    // QTU
			writeByte(3);    // IdV
			writeByte(0x11); // HVV
			writeByte(1);    // QTV
		}

		function writeDQT()
		{
			writeWord(0xFFDB); // marker
			writeWord(132);	   // length
			writeByte(0);
			for (var i=0; i<64; i++) {
				writeByte(YTable[i]);
			}
			writeByte(1);
			for (var j=0; j<64; j++) {
				writeByte(UVTable[j]);
			}
		}

		function writeDHT()
		{
			writeWord(0xFFC4); // marker
			writeWord(0x01A2); // length

			writeByte(0); // HTYDCinfo
			for (var i=0; i<16; i++) {
				writeByte(std_dc_luminance_nrcodes[i+1]);
			}
			for (var j=0; j<=11; j++) {
				writeByte(std_dc_luminance_values[j]);
			}

			writeByte(0x10); // HTYACinfo
			for (var k=0; k<16; k++) {
				writeByte(std_ac_luminance_nrcodes[k+1]);
			}
			for (var l=0; l<=161; l++) {
				writeByte(std_ac_luminance_values[l]);
			}

			writeByte(1); // HTUDCinfo
			for (var m=0; m<16; m++) {
				writeByte(std_dc_chrominance_nrcodes[m+1]);
			}
			for (var n=0; n<=11; n++) {
				writeByte(std_dc_chrominance_values[n]);
			}

			writeByte(0x11); // HTUACinfo
			for (var o=0; o<16; o++) {
				writeByte(std_ac_chrominance_nrcodes[o+1]);
			}
			for (var p=0; p<=161; p++) {
				writeByte(std_ac_chrominance_values[p]);
			}
		}

		function writeSOS()
		{
			writeWord(0xFFDA); // marker
			writeWord(12); // length
			writeByte(3); // nrofcomponents
			writeByte(1); // IdY
			writeByte(0); // HTY
			writeByte(2); // IdU
			writeByte(0x11); // HTU
			writeByte(3); // IdV
			writeByte(0x11); // HTV
			writeByte(0); // Ss
			writeByte(0x3f); // Se
			writeByte(0); // Bf
		}

		function processDU(CDU, fdtbl, DC, HTDC, HTAC){
			var EOB = HTAC[0x00];
			var M16zeroes = HTAC[0xF0];
			var pos;
			var I16 = 16;
			var I63 = 63;
			var I64 = 64;
			var DU_DCT = fDCTQuant(CDU, fdtbl);
			//ZigZag reorder
			for (var j=0;j<I64;++j) {
				DU[ZigZag[j]]=DU_DCT[j];
			}
			var Diff = DU[0] - DC; DC = DU[0];
			//Encode DC
			if (Diff==0) {
				writeBits(HTDC[0]); // Diff might be 0
			} else {
				pos = 32767+Diff;
				writeBits(HTDC[category[pos]]);
				writeBits(bitcode[pos]);
			}
			//Encode ACs
			var end0pos = 63; // was const... which is crazy
			for (; (end0pos>0)&&(DU[end0pos]==0); end0pos--) {};
			//end0pos = first element in reverse order !=0
			if ( end0pos == 0) {
				writeBits(EOB);
				return DC;
			}
			var i = 1;
			var lng;
			while ( i <= end0pos ) {
				var startpos = i;
				for (; (DU[i]==0) && (i<=end0pos); ++i) {}
				var nrzeroes = i-startpos;
				if ( nrzeroes >= I16 ) {
					lng = nrzeroes>>4;
					for (var nrmarker=1; nrmarker <= lng; ++nrmarker)
						writeBits(M16zeroes);
					nrzeroes = nrzeroes&0xF;
				}
				pos = 32767+DU[i];
				writeBits(HTAC[(nrzeroes<<4)+category[pos]]);
				writeBits(bitcode[pos]);
				i++;
			}
			if ( end0pos != I63 ) {
				writeBits(EOB);
			}
			return DC;
		}

		function initCharLookupTable(){
			var sfcc = String.fromCharCode;
			for(var i=0; i < 256; i++){ ///// ACHTUNG // 255
				clt[i] = sfcc(i);
			}
		}

		this.encode = function(image,quality) // image data object
		{
			var time_start = new Date().getTime();

			if(quality) setQuality(quality);

			// Initialize bit writer
			byteout = new Array();
			bytenew=0;
			bytepos=7;

			// Add JPEG headers
			writeWord(0xFFD8); // SOI
			writeAPP0();
			writeAPP1(image.exifBuffer);
			writeDQT();
			writeSOF0(image.width,image.height);
			writeDHT();
			writeSOS();


			// Encode 8x8 macroblocks
			var DCY=0;
			var DCU=0;
			var DCV=0;

			bytenew=0;
			bytepos=7;


			this.encode.displayName = "_encode_";

			var imageData = image.data;
			var width = image.width;
			var height = image.height;

			var quadWidth = width*4;
			var tripleWidth = width*3;

			var x, y = 0;
			var r, g, b;
			var start,p, col,row,pos;
			while(y < height){
				x = 0;
				while(x < quadWidth){
				start = quadWidth * y + x;
				p = start;
				col = -1;
				row = 0;

				for(pos=0; pos < 64; pos++){
					row = pos >> 3;// /8
					col = ( pos & 7 ) * 4; // %8
					p = start + ( row * quadWidth ) + col;

					if(y+row >= height){ // padding bottom
						p-= (quadWidth*(y+1+row-height));
					}

					if(x+col >= quadWidth){ // padding right
						p-= ((x+col) - quadWidth +4)
					}

					r = imageData[ p++ ];
					g = imageData[ p++ ];
					b = imageData[ p++ ];


					/* // calculate YUV values dynamically
					YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
					UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
					VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
					*/

					// use lookup table (slightly faster)
					YDU[pos] = ((RGB_YUV_TABLE[r]             + RGB_YUV_TABLE[(g +  256)>>0] + RGB_YUV_TABLE[(b +  512)>>0]) >> 16)-128;
					UDU[pos] = ((RGB_YUV_TABLE[(r +  768)>>0] + RGB_YUV_TABLE[(g + 1024)>>0] + RGB_YUV_TABLE[(b + 1280)>>0]) >> 16)-128;
					VDU[pos] = ((RGB_YUV_TABLE[(r + 1280)>>0] + RGB_YUV_TABLE[(g + 1536)>>0] + RGB_YUV_TABLE[(b + 1792)>>0]) >> 16)-128;

				}

				DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
				DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
				DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
				x+=32;
				}
				y+=8;
			}


			////////////////////////////////////////////////////////////////

			// Do the bit alignment of the EOI marker
			if ( bytepos >= 0 ) {
				var fillbits = [];
				fillbits[1] = bytepos+1;
				fillbits[0] = (1<<(bytepos+1))-1;
				writeBits(fillbits);
			}

			writeWord(0xFFD9); //EOI

			if (typeof module === 'undefined') return new Uint8Array(byteout);
      return MyBuffer.from(byteout);

			var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));

			byteout = [];

			// benchmarking
			var duration = new Date().getTime() - time_start;
    		//console.log('Encoding time: '+ duration + 'ms');
    		//

			return jpegDataUri
	}

	function setQuality(quality){
		if (quality <= 0) {
			quality = 1;
		}
		if (quality > 100) {
			quality = 100;
		}

		if(currentQuality == quality) return // don't recalc if unchanged

		var sf = 0;
		if (quality < 50) {
			sf = Math.floor(5000 / quality);
		} else {
			sf = Math.floor(200 - quality*2);
		}

		initQuantTables(sf);
		currentQuality = quality;
		//console.log('Quality set to: '+quality +'%');
	}

	function init(){
		var time_start = new Date().getTime();
		if(!quality) quality = 50;
		// Create tables
		initCharLookupTable()
		initHuffmanTbl();
		initCategoryNumber();
		initRGBYUVTable();

		setQuality(quality);
		var duration = new Date().getTime() - time_start;
    	//console.log('Initialization '+ duration + 'ms');
	}

	init();

};

function encode(imgData, qu) {
  if (typeof qu === 'undefined') qu = 50;
  var encoder = new JPEGEncoder(qu);
  var data = encoder.encode(imgData, qu);
  return {
    data: data,
    width: imgData.width,
    height: imgData.height
  };
}

/* // helper function to get the imageData of an existing image on the current page. */
/* function getImageDataFromImage(idOrElement){                        */
/* 	var theImg = (typeof(idOrElement)=='string')? document.getElementById(idOrElement):idOrElement; */
/* 	var cvs = document.createElement('canvas');                    */
/* 	cvs.width = theImg.width;                                      */
/* 	cvs.height = theImg.height;                                    */
/* 	var ctx = cvs.getContext("2d");                                */
/* 	ctx.drawImage(theImg,0,0);                                     */
/* 	                                                               */
/* 	return (ctx.getImageData(0, 0, cvs.width, cvs.height));        */
/* }                                                                   */

/* -*- tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   Copyright 2011 notmasteryet

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)

var JpegImage = (function jpegImage() {
  "use strict";
/*   var dctZigZag = new Int32Array([                                  */
/*      0,                                                             */
/*      1,  8,                                                         */
/*     16,  9,  2,                                                     */
/*      3, 10, 17, 24,                                                 */
/*     32, 25, 18, 11, 4,                                              */
/*      5, 12, 19, 26, 33, 40,                                         */
/*     48, 41, 34, 27, 20, 13,  6,                                     */
/*      7, 14, 21, 28, 35, 42, 49, 56,                                 */
/*     57, 50, 43, 36, 29, 22, 15,                                     */
/*     23, 30, 37, 44, 51, 58,                                         */
/*     59, 52, 45, 38, 31,                                             */
/*     39, 46, 53, 60,                                                 */
/*     61, 54, 47,                                                     */
/*     55, 62,                                                         */
/*     63                                                              */
/*   ]);                                                               */
  var dctZigZag = [
     0,
     1,  8,
    16,  9,  2,
     3, 10, 17, 24,
    32, 25, 18, 11, 4,
     5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13,  6,
     7, 14, 21, 28, 35, 42, 49, 56,
    57, 50, 43, 36, 29, 22, 15,
    23, 30, 37, 44, 51, 58,
    59, 52, 45, 38, 31,
    39, 46, 53, 60,
    61, 54, 47,
    55, 62,
    63
  ];

  var dctCos1  =  4017   // cos(pi/16)
  var dctSin1  =   799   // sin(pi/16)
  var dctCos3  =  3406   // cos(3*pi/16)
  var dctSin3  =  2276   // sin(3*pi/16)
  var dctCos6  =  1567   // cos(6*pi/16)
  var dctSin6  =  3784   // sin(6*pi/16)
  var dctSqrt2 =  5793   // sqrt(2)
  var dctSqrt1d2 = 2896  // sqrt(2) / 2

  function constructor() {
  }

  function buildHuffmanTable(codeLengths, values) {
    var k = 0, code = [], i, j, length = 16;
    while (length > 0 && !codeLengths[length - 1])
      length--;
    code.push({children: [], index: 0});
    var p = code[0], q;
    for (i = 0; i < length; i++) {
      for (j = 0; j < codeLengths[i]; j++) {
        p = code.pop();
        p.children[p.index] = values[k];
        while (p.index > 0) {
          if (code.length === 0)
            throw new Error('Could not recreate Huffman Table');
          p = code.pop();
        }
        p.index++;
        code.push(p);
        while (code.length <= i) {
          code.push(q = {children: [], index: 0});
          p.children[p.index] = q.children;
          p = q;
        }
        k++;
      }
      if (i + 1 < length) {
        // p here points to last code
        code.push(q = {children: [], index: 0});
        p.children[p.index] = q.children;
        p = q;
      }
    }
    return code[0].children;
  }

  function decodeScan(data, offset,
                      frame, components, resetInterval,
                      spectralStart, spectralEnd,
                      successivePrev, successive, opts) {
    var precision = frame.precision;
    var samplesPerLine = frame.samplesPerLine;
    var scanLines = frame.scanLines;
    var mcusPerLine = frame.mcusPerLine;
    var progressive = frame.progressive;
    var maxH = frame.maxH, maxV = frame.maxV;

    var startOffset = offset, bitsData = 0, bitsCount = 0;
    function readBit() {
      if (bitsCount > 0) {
        bitsCount--;
        return (bitsData >> bitsCount) & 1;
      }
      bitsData = data[offset++];
      if (bitsData == 0xFF) {
        var nextByte = data[offset++];
        if (nextByte) {
          throw new Error("unexpected marker: " + ((bitsData << 8) | nextByte).toString(16));
        }
        // unstuff 0
      }
      bitsCount = 7;
      return bitsData >>> 7;
    }
    function decodeHuffman(tree) {
      var node = tree, bit;
      while ((bit = readBit()) !== null) {
        node = node[bit];
        if (typeof node === 'number')
          return node;
        if (typeof node !== 'object')
          throw new Error("invalid huffman sequence");
      }
      return null;
    }
    function receive(length) {
      var n = 0;
      while (length > 0) {
        var bit = readBit();
        if (bit === null) return;
        n = (n << 1) | bit;
        length--;
      }
      return n;
    }
    function receiveAndExtend(length) {
      var n = receive(length);
      if (n >= 1 << (length - 1))
        return n;
      return n + (-1 << length) + 1;
    }
    function decodeBaseline(component, zz) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : receiveAndExtend(t);
      zz[0]= (component.pred += diff);
      var k = 1;
      while (k < 64) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15)
            break;
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        zz[z] = receiveAndExtend(s);
        k++;
      }
    }
    function decodeDCFirst(component, zz) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : (receiveAndExtend(t) << successive);
      zz[0] = (component.pred += diff);
    }
    function decodeDCSuccessive(component, zz) {
      zz[0] |= readBit() << successive;
    }
    var eobrun = 0;
    function decodeACFirst(component, zz) {
      if (eobrun > 0) {
        eobrun--;
        return;
      }
      var k = spectralStart, e = spectralEnd;
      while (k <= e) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15) {
            eobrun = receive(r) + (1 << r) - 1;
            break;
          }
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        zz[z] = receiveAndExtend(s) * (1 << successive);
        k++;
      }
    }
    var successiveACState = 0, successiveACNextValue;
    function decodeACSuccessive(component, zz) {
      var k = spectralStart, e = spectralEnd, r = 0;
      while (k <= e) {
        var z = dctZigZag[k];
        var direction = zz[z] < 0 ? -1 : 1;
        switch (successiveACState) {
        case 0: // initial state
          var rs = decodeHuffman(component.huffmanTableAC);
          var s = rs & 15, r = rs >> 4;
          if (s === 0) {
            if (r < 15) {
              eobrun = receive(r) + (1 << r);
              successiveACState = 4;
            } else {
              r = 16;
              successiveACState = 1;
            }
          } else {
            if (s !== 1)
              throw new Error("invalid ACn encoding");
            successiveACNextValue = receiveAndExtend(s);
            successiveACState = r ? 2 : 3;
          }
          continue;
        case 1: // skipping r zero items
        case 2:
          if (zz[z])
            zz[z] += (readBit() << successive) * direction;
          else {
            r--;
            if (r === 0)
              successiveACState = successiveACState == 2 ? 3 : 0;
          }
          break;
        case 3: // set value for a zero item
          if (zz[z])
            zz[z] += (readBit() << successive) * direction;
          else {
            zz[z] = successiveACNextValue << successive;
            successiveACState = 0;
          }
          break;
        case 4: // eob
          if (zz[z])
            zz[z] += (readBit() << successive) * direction;
          break;
        }
        k++;
      }
      if (successiveACState === 4) {
        eobrun--;
        if (eobrun === 0)
          successiveACState = 0;
      }
    }
    function decodeMcu(component, decode, mcu, row, col) {
      var mcuRow = (mcu / mcusPerLine) | 0;
      var mcuCol = mcu % mcusPerLine;
      var blockRow = mcuRow * component.v + row;
      var blockCol = mcuCol * component.h + col;
      // If the block is missing and we're in tolerant mode, just skip it.
      if (component.blocks[blockRow] === undefined && opts.tolerantDecoding)
        return;
      decode(component, component.blocks[blockRow][blockCol]);
    }
    function decodeBlock(component, decode, mcu) {
      var blockRow = (mcu / component.blocksPerLine) | 0;
      var blockCol = mcu % component.blocksPerLine;
      // If the block is missing and we're in tolerant mode, just skip it.
      if (component.blocks[blockRow] === undefined && opts.tolerantDecoding)
        return;
      decode(component, component.blocks[blockRow][blockCol]);
    }

    var componentsLength = components.length;
    var component, i, j, k, n;
    var decodeFn;
    if (progressive) {
      if (spectralStart === 0)
        decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
      else
        decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
    } else {
      decodeFn = decodeBaseline;
    }

    var mcu = 0, marker;
    var mcuExpected;
    if (componentsLength == 1) {
      mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
    } else {
      mcuExpected = mcusPerLine * frame.mcusPerColumn;
    }
    if (!resetInterval) resetInterval = mcuExpected;

    var h, v;
    while (mcu < mcuExpected) {
      // reset interval stuff
      for (i = 0; i < componentsLength; i++)
        components[i].pred = 0;
      eobrun = 0;

      if (componentsLength == 1) {
        component = components[0];
        for (n = 0; n < resetInterval; n++) {
          decodeBlock(component, decodeFn, mcu);
          mcu++;
        }
      } else {
        for (n = 0; n < resetInterval; n++) {
          for (i = 0; i < componentsLength; i++) {
            component = components[i];
            h = component.h;
            v = component.v;
            for (j = 0; j < v; j++) {
              for (k = 0; k < h; k++) {
                decodeMcu(component, decodeFn, mcu, j, k);
              }
            }
          }
          mcu++;

          // If we've reached our expected MCU's, stop decoding
          if (mcu === mcuExpected) break;
        }
      }

      if (mcu === mcuExpected) {
        // Skip trailing bytes at the end of the scan - until we reach the next marker
        do {
          if (data[offset] === 0xFF) {
            if (data[offset + 1] !== 0x00) {
              break;
            }
          }
          offset += 1;
        } while (offset < data.length - 2);
      }

      // find marker
      bitsCount = 0;
      marker = (data[offset] << 8) | data[offset + 1];
      if (marker < 0xFF00) {
        throw new Error("marker was not found");
      }

      if (marker >= 0xFFD0 && marker <= 0xFFD7) { // RSTx
        offset += 2;
      }
      else
        break;
    }

    return offset - startOffset;
  }

  function buildComponentData(frame, component) {
    var lines = [];
    var blocksPerLine = component.blocksPerLine;
    var blocksPerColumn = component.blocksPerColumn;
    var samplesPerLine = blocksPerLine << 3;
    // Only 1 used per invocation of this function and garbage collected after invocation, so no need to account for its memory footprint.
    var R = new Array(64), r = new Array(64);

    // A port of poppler's IDCT method which in turn is taken from:
    //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
    //   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
    //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
    //   988-991.
    function quantizeAndInverse(zz, dataOut, dataIn) {
      var qt = component.quantizationTable;
      var v0, v1, v2, v3, v4, v5, v6, v7, t;
      var p = dataIn;
      var i;

      // dequant
      for (i = 0; i < 64; i++)
        p[i] = zz[i] * qt[i];

      // inverse DCT on rows
      for (i = 0; i < 8; ++i) {
        var row = 8 * i;

        // check for all-zero AC coefficients
        if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 &&
            p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 &&
            p[7 + row] == 0) {
          t = (dctSqrt2 * p[0 + row] + 512) >> 10;
          p[0 + row] = t;
          p[1 + row] = t;
          p[2 + row] = t;
          p[3 + row] = t;
          p[4 + row] = t;
          p[5 + row] = t;
          p[6 + row] = t;
          p[7 + row] = t;
          continue;
        }

        // stage 4
        v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
        v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
        v2 = p[2 + row];
        v3 = p[6 + row];
        v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
        v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
        v5 = p[3 + row] << 4;
        v6 = p[5 + row] << 4;

        // stage 3
        t = (v0 - v1+ 1) >> 1;
        v0 = (v0 + v1 + 1) >> 1;
        v1 = t;
        t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
        v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
        v3 = t;
        t = (v4 - v6 + 1) >> 1;
        v4 = (v4 + v6 + 1) >> 1;
        v6 = t;
        t = (v7 + v5 + 1) >> 1;
        v5 = (v7 - v5 + 1) >> 1;
        v7 = t;

        // stage 2
        t = (v0 - v3 + 1) >> 1;
        v0 = (v0 + v3 + 1) >> 1;
        v3 = t;
        t = (v1 - v2 + 1) >> 1;
        v1 = (v1 + v2 + 1) >> 1;
        v2 = t;
        t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
        v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
        v7 = t;
        t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
        v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
        v6 = t;

        // stage 1
        p[0 + row] = v0 + v7;
        p[7 + row] = v0 - v7;
        p[1 + row] = v1 + v6;
        p[6 + row] = v1 - v6;
        p[2 + row] = v2 + v5;
        p[5 + row] = v2 - v5;
        p[3 + row] = v3 + v4;
        p[4 + row] = v3 - v4;
      }

      // inverse DCT on columns
      for (i = 0; i < 8; ++i) {
        var col = i;

        // check for all-zero AC coefficients
        if (p[1*8 + col] == 0 && p[2*8 + col] == 0 && p[3*8 + col] == 0 &&
            p[4*8 + col] == 0 && p[5*8 + col] == 0 && p[6*8 + col] == 0 &&
            p[7*8 + col] == 0) {
          t = (dctSqrt2 * dataIn[i+0] + 8192) >> 14;
          p[0*8 + col] = t;
          p[1*8 + col] = t;
          p[2*8 + col] = t;
          p[3*8 + col] = t;
          p[4*8 + col] = t;
          p[5*8 + col] = t;
          p[6*8 + col] = t;
          p[7*8 + col] = t;
          continue;
        }

        // stage 4
        v0 = (dctSqrt2 * p[0*8 + col] + 2048) >> 12;
        v1 = (dctSqrt2 * p[4*8 + col] + 2048) >> 12;
        v2 = p[2*8 + col];
        v3 = p[6*8 + col];
        v4 = (dctSqrt1d2 * (p[1*8 + col] - p[7*8 + col]) + 2048) >> 12;
        v7 = (dctSqrt1d2 * (p[1*8 + col] + p[7*8 + col]) + 2048) >> 12;
        v5 = p[3*8 + col];
        v6 = p[5*8 + col];

        // stage 3
        t = (v0 - v1 + 1) >> 1;
        v0 = (v0 + v1 + 1) >> 1;
        v1 = t;
        t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
        v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
        v3 = t;
        t = (v4 - v6 + 1) >> 1;
        v4 = (v4 + v6 + 1) >> 1;
        v6 = t;
        t = (v7 + v5 + 1) >> 1;
        v5 = (v7 - v5 + 1) >> 1;
        v7 = t;

        // stage 2
        t = (v0 - v3 + 1) >> 1;
        v0 = (v0 + v3 + 1) >> 1;
        v3 = t;
        t = (v1 - v2 + 1) >> 1;
        v1 = (v1 + v2 + 1) >> 1;
        v2 = t;
        t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
        v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
        v7 = t;
        t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
        v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
        v6 = t;

        // stage 1
        p[0*8 + col] = v0 + v7;
        p[7*8 + col] = v0 - v7;
        p[1*8 + col] = v1 + v6;
        p[6*8 + col] = v1 - v6;
        p[2*8 + col] = v2 + v5;
        p[5*8 + col] = v2 - v5;
        p[3*8 + col] = v3 + v4;
        p[4*8 + col] = v3 - v4;
      }

      // convert to 8-bit integers
      for (i = 0; i < 64; ++i) {
        var sample = 128 + ((p[i] + 8) >> 4);
        dataOut[i] = sample < 0 ? 0 : sample > 0xFF ? 0xFF : sample;
      }
    }

    requestMemoryAllocation(samplesPerLine * blocksPerColumn * 8);

    var i, j;
    for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      var scanLine = blockRow << 3;
      for (i = 0; i < 8; i++) {
	 var l = new Array(samplesPerLine);
	 lines.push(l);
      }
      for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
        quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);

        var offset = 0, sample = blockCol << 3;
        for (j = 0; j < 8; j++) {
          var line = lines[scanLine + j];
          for (i = 0; i < 8; i++)
            line[sample + i] = r[offset++];
        }
      }
    }
    return lines;
  }

  function clampTo8bit(a) {
    return a < 0 ? 0 : a > 255 ? 255 : a;
  }

  constructor.prototype = {
    load: function load(path) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = (function() {
        // TODO catch parse error
        var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
        this.parse(data);
        if (this.onload)
          this.onload();
      }).bind(this);
      xhr.send(null);
    },
     parse: function parse(data, tarray) {
      var maxResolutionInPixels = this.opts.maxResolutionInMP * 1000 * 1000;
      var offset = 0, length = data.length;
      function readUint16() {
        var value = (data[offset] << 8) | data[offset + 1];
        offset += 2;
        return value;
      }
      function readDataBlock() {
        var length = readUint16();
        var array = tarray 
	   ? data.subarray(offset, offset + length - 2)
	   : data.slice( offset, offset + length - 2);
        offset += array.length;
        return array;
      }
      function prepareComponents(frame) {
        var maxH = 0, maxV = 0;
        var component, componentId;
        for (componentId in frame.components) {
          if (frame.components.hasOwnProperty(componentId)) {
            component = frame.components[componentId];
            if (maxH < component.h) maxH = component.h;
            if (maxV < component.v) maxV = component.v;
          }
        }
        var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
        var mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
        for (componentId in frame.components) {
          if (frame.components.hasOwnProperty(componentId)) {
            component = frame.components[componentId];
            var blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / maxH);
            var blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines  / 8) * component.v / maxV);
            var blocksPerLineForMcu = mcusPerLine * component.h;
            var blocksPerColumnForMcu = mcusPerColumn * component.v;
            var blocksToAllocate = blocksPerColumnForMcu * blocksPerLineForMcu;
            var blocks = [];

            // Each block is a Int32Array of length 64 (4 x 64 = 256 bytes)
            requestMemoryAllocation(blocksToAllocate * 256);

            for (var i = 0; i < blocksPerColumnForMcu; i++) {
              var row = [];
              for (var j = 0; j < blocksPerLineForMcu; j++) {
		 let r = tarray ? new Int32Array(64) : new ArrayInt32(64);
                 row.push(r);
	      }
              blocks.push(row);
            }
            component.blocksPerLine = blocksPerLine;
            component.blocksPerColumn = blocksPerColumn;
            component.blocks = blocks;
          }
        }
        frame.maxH = maxH;
        frame.maxV = maxV;
        frame.mcusPerLine = mcusPerLine;
        frame.mcusPerColumn = mcusPerColumn;
      }
      var jfif = null;
      var adobe = null;
      var pixels = null;
      var frame, resetInterval;
      var quantizationTables = [], frames = [];
      var huffmanTablesAC = [], huffmanTablesDC = [];
      var fileMarker = readUint16();
      this.comments = [];
      if (fileMarker != 0xFFD8) { // SOI (Start of Image)
        throw new Error("SOI not found");
      }

      fileMarker = readUint16();
      while (fileMarker != 0xFFD9) { // EOI (End of image)
        var i, j, l;
        switch(fileMarker) {
          case 0xFF00: break;
          case 0xFFE0: // APP0 (Application Specific)
          case 0xFFE1: // APP1
          case 0xFFE2: // APP2
          case 0xFFE3: // APP3
          case 0xFFE4: // APP4
          case 0xFFE5: // APP5
          case 0xFFE6: // APP6
          case 0xFFE7: // APP7
          case 0xFFE8: // APP8
          case 0xFFE9: // APP9
          case 0xFFEA: // APP10
          case 0xFFEB: // APP11
          case 0xFFEC: // APP12
          case 0xFFED: // APP13
          case 0xFFEE: // APP14
          case 0xFFEF: // APP15
          case 0xFFFE: // COM (Comment)
            var appData = readDataBlock();

            if (fileMarker === 0xFFFE) {
              var comment = String.fromCharCode.apply(null, appData);
              this.comments.push(comment);
            }

            if (fileMarker === 0xFFE0) {
              if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 &&
                appData[3] === 0x46 && appData[4] === 0) { // 'JFIF\x00'
                jfif = {
                  version: { major: appData[5], minor: appData[6] },
                  densityUnits: appData[7],
                  xDensity: (appData[8] << 8) | appData[9],
                  yDensity: (appData[10] << 8) | appData[11],
                  thumbWidth: appData[12],
                  thumbHeight: appData[13],
                  thumbData: tarray
		     ? appData.subarray(14, 14 + 3 * appData[12] * appData[13])
		     : appData.slice(14, 14 + 3 * appData[12] * appData[13])
                };
              }
            }
            // TODO APP1 - Exif
            if (fileMarker === 0xFFE1) {
              if (appData[0] === 0x45 &&
                appData[1] === 0x78 &&
                appData[2] === 0x69 &&
                appData[3] === 0x66 &&
                appData[4] === 0) { // 'EXIF\x00'
                this.exifBuffer = tarray
		   ? appData.subarray(5, appData.length)
		   : appData.slide(5, appData.length);
              }
            }

            if (fileMarker === 0xFFEE) {
              if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F &&
                appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) { // 'Adobe\x00'
                adobe = {
                  version: appData[6],
                  flags0: (appData[7] << 8) | appData[8],
                  flags1: (appData[9] << 8) | appData[10],
                  transformCode: appData[11]
                };
              }
            }
            break;

          case 0xFFDB: // DQT (Define Quantization Tables)
            var quantizationTablesLength = readUint16();
            var quantizationTablesEnd = quantizationTablesLength + offset - 2;
            while (offset < quantizationTablesEnd) {
              var quantizationTableSpec = data[offset++];
              requestMemoryAllocation(64 * 4);
              var tableData = tarray ? new Int32Array(64) : new ArrayInt32(64);
              if ((quantizationTableSpec >> 4) === 0) { // 8 bit values
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = data[offset++];
                }
              } else if ((quantizationTableSpec >> 4) === 1) { //16 bit
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = readUint16();
                }
              } else
                throw new Error("DQT: invalid table spec");
              quantizationTables[quantizationTableSpec & 15] = tableData;
            }
            break;

          case 0xFFC0: // SOF0 (Start of Frame, Baseline DCT)
          case 0xFFC1: // SOF1 (Start of Frame, Extended DCT)
          case 0xFFC2: // SOF2 (Start of Frame, Progressive DCT)
            readUint16(); // skip data length
            frame = {};
            frame.extended = (fileMarker === 0xFFC1);
            frame.progressive = (fileMarker === 0xFFC2);
            frame.precision = data[offset++];
            frame.scanLines = readUint16();
            frame.samplesPerLine = readUint16();
            frame.components = {};
            frame.componentsOrder = [];

            var pixelsInFrame = frame.scanLines * frame.samplesPerLine;
            if (pixelsInFrame > maxResolutionInPixels) {
              var exceededAmount = Math.ceil((pixelsInFrame - maxResolutionInPixels) / 1e6);
              throw new Error(`maxResolutionInMP limit exceeded by ${exceededAmount}MP`);
            }

            var componentsCount = data[offset++], componentId;
            var maxH = 0, maxV = 0;
            for (i = 0; i < componentsCount; i++) {
              componentId = data[offset];
              var h = data[offset + 1] >> 4;
              var v = data[offset + 1] & 15;
              var qId = data[offset + 2];
              frame.componentsOrder.push(componentId);
              frame.components[componentId] = {
                h: h,
                v: v,
                quantizationIdx: qId
              };
              offset += 3;
            }
            prepareComponents(frame);
            frames.push(frame);
            break;

          case 0xFFC4: // DHT (Define Huffman Tables)
            var huffmanLength = readUint16();
            for (i = 2; i < huffmanLength;) {
              var huffmanTableSpec = data[offset++];
              var codeLengths = new Array(16);
              var codeLengthSum = 0;
              for (j = 0; j < 16; j++, offset++) {
                codeLengthSum += (codeLengths[j] = data[offset]);
              }
              requestMemoryAllocation(16 + codeLengthSum);
              var huffmanValues = new Array(codeLengthSum);
              for (j = 0; j < codeLengthSum; j++, offset++)
                huffmanValues[j] = data[offset];
              i += 17 + codeLengthSum;

              ((huffmanTableSpec >> 4) === 0 ?
                huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] =
                buildHuffmanTable(codeLengths, huffmanValues);
            }
            break;

          case 0xFFDD: // DRI (Define Restart Interval)
            readUint16(); // skip data length
            resetInterval = readUint16();
            break;

          case 0xFFDC: // Number of Lines marker
            readUint16() // skip data length
            readUint16() // Ignore this data since it represents the image height
            break;

          case 0xFFDA: // SOS (Start of Scan)
            var scanLength = readUint16();
            var selectorsCount = data[offset++];
            var components = [], component;
            for (i = 0; i < selectorsCount; i++) {
              component = frame.components[data[offset++]];
              var tableSpec = data[offset++];
              component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
              component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
              components.push(component);
            }
            var spectralStart = data[offset++];
            var spectralEnd = data[offset++];
            var successiveApproximation = data[offset++];
            var processed = decodeScan(data, offset,
              frame, components, resetInterval,
              spectralStart, spectralEnd,
              successiveApproximation >> 4, successiveApproximation & 15, this.opts);
            offset += processed;
            break;

          case 0xFFFF: // Fill bytes
            if (data[offset] !== 0xFF) { // Avoid skipping a valid marker.
              offset--;
            }
            break;

          default:
            if (data[offset - 3] == 0xFF &&
                data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
              // could be incorrect encoding -- last 0xFF byte of the previous
              // block was eaten by the encoder
              offset -= 3;
              break;
            }
            throw new Error("unknown JPEG marker " + fileMarker.toString(16));
        }
        fileMarker = readUint16();
      }
      if (frames.length != 1)
        throw new Error("only single frame JPEGs supported");

      // set each frame's components quantization table
      for (var i = 0; i < frames.length; i++) {
        var cp = frames[i].components;
        for (var j in cp) {
          cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
          delete cp[j].quantizationIdx;
        }
      }

      this.width = frame.samplesPerLine;
      this.height = frame.scanLines;
      this.jfif = jfif;
      this.adobe = adobe;
      this.components = [];
      for (var i = 0; i < frame.componentsOrder.length; i++) {
        var component = frame.components[frame.componentsOrder[i]];
        this.components.push({
          lines: buildComponentData(frame, component),
          scaleX: component.h / frame.maxH,
          scaleY: component.v / frame.maxV
        });
      }
    },
    getData: function getData(width, height) {
      var scaleX = this.width / width, scaleY = this.height / height;
      var component1, component2, component3, component4;
      var component1Line, component2Line, component3Line, component4Line;
      var x, y;
      var offset = 0;
      var Y, Cb, Cr, K, C, M, Ye, R, G, B;
      var colorTransform;
      var dataLength = width * height * this.components.length;
      requestMemoryAllocation(dataLength);
      var data = new Array(dataLength);
      switch (this.components.length) {
        case 1:
          component1 = this.components[0];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              Y = component1Line[0 | (x * component1.scaleX * scaleX)];

              data[offset++] = Y;
            }
          }
          break;
        case 2:
          // PDF might compress two component data in custom colorspace
          component1 = this.components[0];
          component2 = this.components[1];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              Y = component1Line[0 | (x * component1.scaleX * scaleX)];
              data[offset++] = Y;
              Y = component2Line[0 | (x * component2.scaleX * scaleX)];
              data[offset++] = Y;
            }
          }
          break;
        case 3:
          // The default transform for three components is true
          colorTransform = true;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.opts.colorTransform !== 'undefined')
            colorTransform = !!this.opts.colorTransform;

          component1 = this.components[0];
          component2 = this.components[1];
          component3 = this.components[2];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              if (!colorTransform) {
                R = component1Line[0 | (x * component1.scaleX * scaleX)];
                G = component2Line[0 | (x * component2.scaleX * scaleX)];
                B = component3Line[0 | (x * component3.scaleX * scaleX)];
              } else {
                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];

                R = clampTo8bit(Y + 1.402 * (Cr - 128));
                G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                B = clampTo8bit(Y + 1.772 * (Cb - 128));
              }

              data[offset++] = R;
              data[offset++] = G;
              data[offset++] = B;
            }
          }
          break;
        case 4:
          if (!this.adobe)
            throw new Error('Unsupported color mode (4 components)');
          // The default transform for four components is false
          colorTransform = false;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.opts.colorTransform !== 'undefined')
            colorTransform = !!this.opts.colorTransform;

          component1 = this.components[0];
          component2 = this.components[1];
          component3 = this.components[2];
          component4 = this.components[3];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
            component4Line = component4.lines[0 | (y * component4.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              if (!colorTransform) {
                C = component1Line[0 | (x * component1.scaleX * scaleX)];
                M = component2Line[0 | (x * component2.scaleX * scaleX)];
                Ye = component3Line[0 | (x * component3.scaleX * scaleX)];
                K = component4Line[0 | (x * component4.scaleX * scaleX)];
              } else {
                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];
                K = component4Line[0 | (x * component4.scaleX * scaleX)];

                C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
              }
              data[offset++] = 255-C;
              data[offset++] = 255-M;
              data[offset++] = 255-Ye;
              data[offset++] = 255-K;
            }
          }
          break;
        default:
          throw new Error('Unsupported color mode');
      }
      return data;
    },
    copyToImageData: function copyToImageData(imageData, formatAsRGBA) {
      var width = imageData.width, height = imageData.height;
      var imageDataArray = imageData.data;
      var data = this.getData(width, height);
      var i = 0, j = 0, x, y;
      var Y, K, C, M, R, G, B;
      switch (this.components.length) {
        case 1:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              Y = data[i++];

              imageDataArray[j++] = Y;
              imageDataArray[j++] = Y;
              imageDataArray[j++] = Y;
              if (formatAsRGBA) {
                imageDataArray[j++] = 255;
              }
            }
          }
          break;
        case 3:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              R = data[i++];
              G = data[i++];
              B = data[i++];

              imageDataArray[j++] = R;
              imageDataArray[j++] = G;
              imageDataArray[j++] = B;
              if (formatAsRGBA) {
                imageDataArray[j++] = 255;
              }
            }
          }
          break;
        case 4:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              C = data[i++];
              M = data[i++];
              Y = data[i++];
              K = data[i++];

              R = 255 - clampTo8bit(C * (1 - K / 255) + K);
              G = 255 - clampTo8bit(M * (1 - K / 255) + K);
              B = 255 - clampTo8bit(Y * (1 - K / 255) + K);

              imageDataArray[j++] = R;
              imageDataArray[j++] = G;
              imageDataArray[j++] = B;
              if (formatAsRGBA) {
                imageDataArray[j++] = 255;
              }
            }
          }
          break;
        default:
          throw new Error('Unsupported color mode');
      }
    }
  };


  // We cap the amount of memory used by jpeg-js to avoid unexpected OOMs from untrusted content.
  var totalBytesAllocated = 0;
  var maxMemoryUsageBytes = 0;
  function requestMemoryAllocation(increaseAmount = 0) {
    var totalMemoryImpactBytes = totalBytesAllocated + increaseAmount;
    if (totalMemoryImpactBytes > maxMemoryUsageBytes) {
      var exceededAmount = Math.ceil((totalMemoryImpactBytes - maxMemoryUsageBytes) / 1024 / 1024);
      throw new Error(`maxMemoryUsageInMB limit exceeded by at least ${exceededAmount}MB`);
    }

    totalBytesAllocated = totalMemoryImpactBytes;
  }

  constructor.resetMaxMemoryUsage = function (maxMemoryUsageBytes_) {
    totalBytesAllocated = 0;
    maxMemoryUsageBytes = maxMemoryUsageBytes_;
  };

  constructor.getBytesAllocated = function () {
    return totalBytesAllocated;
  };

  constructor.requestMemoryAllocation = requestMemoryAllocation;

  return constructor;
})();

function decode(jpegData, userOpts = {}) {
  var defaultOpts = {
    // "undefined" means "Choose whether to transform colors based on the image’s color model."
    colorTransform: undefined,
    useTArray: false,
    formatAsRGBA: true,
    tolerantDecoding: true,
    maxResolutionInMP: 100, // Don't decode more than 100 megapixels
    maxMemoryUsageInMB: 512, // Don't decode if memory footprint is more than 512MB
  };

  var opts = {...defaultOpts, ...userOpts};
  var arr = opts.useTArray ? new Uint8Array(jpegData) :jpegData;
  var decoder = new JpegImage();
  decoder.opts = opts;
  // If this constructor ever supports async decoding this will need to be done differently.
  // Until then, treating as singleton limit is fine.
  JpegImage.resetMaxMemoryUsage(opts.maxMemoryUsageInMB * 1024 * 1024);
  decoder.parse(arr, opts.useTArray);

  var channels = (opts.formatAsRGBA) ? 4 : 3;
  var bytesNeeded = decoder.width * decoder.height * channels;
  try {
    JpegImage.requestMemoryAllocation(bytesNeeded);
    var image = {
      width: decoder.width,
      height: decoder.height,
      exifBuffer: decoder.exifBuffer,
      data: opts.useTArray ?
        new Uint8Array(bytesNeeded) :
        MyBuffer.alloc(bytesNeeded)
    };
    if(decoder.comments.length > 0) {
      image["comments"] = decoder.comments;
    }
  } catch (err){
    if (err instanceof RangeError){
      throw new Error("Could not allocate enough memory for the image. " +
                      "Required: " + bytesNeeded);
    } else {
      throw err;
    }
  }

  decoder.copyToImageData(image, opts.formatAsRGBA);

  return image;
}


const expectobj = {
   value: undefined,
   toEqual: function( v ) { 
      if( this.value !== v ) {
	 throw( `expected ${v}, received ${this.value}` ); 
      }
   }
};
      
function expect( value ) {
   expectobj.value = value;
   return expectobj;
}

function it( msg, thunk ) { thunk(); }

const jpeg = {"type":"Buffer","data":[255,216,255,224,0,16,74,70,73,70,0,1,1,1,0,72,0,72,0,0,255,219,0,67,0,3,2,2,3,2,2,3,3,3,3,4,3,3,4,5,8,5,5,4,4,5,10,7,7,6,8,12,10,12,12,11,10,11,11,13,14,18,16,13,14,17,14,11,11,16,22,16,17,19,20,21,21,21,12,15,23,24,22,20,24,18,20,21,20,255,219,0,67,1,3,4,4,5,4,5,9,5,5,9,20,13,11,13,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,255,194,0,17,8,0,16,0,16,3,1,17,0,2,17,1,3,17,1,255,196,0,21,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,255,196,0,22,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,5,6,255,218,0,12,3,1,0,2,16,3,16,0,0,1,183,6,235,4,41,218,16,35,38,47,255,196,0,25,16,0,2,3,1,0,0,0,0,0,0,0,0,0,0,0,0,4,5,1,2,3,20,255,218,0,8,1,1,0,1,5,2,153,98,3,161,58,182,62,151,100,83,177,199,59,54,191,255,196,0,38,17,0,1,2,3,6,7,0,0,0,0,0,0,0,0,0,0,1,2,3,4,17,240,0,18,33,65,81,177,19,20,34,35,49,161,178,255,218,0,8,1,3,1,1,63,1,38,13,232,52,52,210,15,22,120,154,203,65,151,211,166,29,48,225,187,178,112,121,173,170,96,220,234,73,198,200,68,111,58,183,28,95,110,189,234,115,219,255,196,0,34,17,0,2,1,3,2,7,0,0,0,0,0,0,0,0,0,0,1,3,4,2,33,240,0,81,17,18,34,49,65,161,193,255,218,0,8,1,2,1,1,63,1,145,34,152,148,150,180,219,81,140,134,200,47,21,130,162,45,155,239,156,30,136,174,139,203,85,201,238,51,209,192,181,182,134,155,244,120,25,159,63,255,196,0,38,16,0,1,3,2,5,3,5,0,0,0,0,0,0,0,0,0,1,2,3,4,18,240,17,21,33,65,97,19,20,34,81,113,145,161,178,255,218,0,8,1,1,0,6,63,2,149,42,84,166,242,186,0,67,96,106,78,192,15,94,119,252,173,254,186,23,5,73,240,0,94,183,237,42,52,152,173,229,116,10,85,141,235,198,216,124,184,165,56,142,198,128,16,216,23,127,95,255,196,0,27,16,1,0,2,3,1,1,0,0,0,0,0,0,0,0,0,0,1,17,33,0,49,65,81,129,255,218,0,8,1,1,0,1,63,33,122,197,209,162,210,141,204,160,37,98,37,11,250,85,28,23,47,124,194,86,191,103,184,70,45,51,52,161,29,57,208,166,7,30,1,196,235,217,43,31,255,218,0,12,3,1,0,2,0,3,0,0,0,16,85,255,0,255,196,0,29,17,1,1,1,0,2,2,3,0,0,0,0,0,0,0,0,0,1,17,33,0,65,49,240,81,97,113,255,218,0,8,1,3,1,1,63,16,1,226,180,201,149,89,171,0,5,14,240,118,106,105,127,54,246,57,4,145,111,124,230,128,123,239,207,38,2,194,19,110,253,208,53,69,2,103,131,159,255,196,0,30,17,1,0,2,2,1,5,0,0,0,0,0,0,0,0,0,0,1,17,33,49,65,0,81,97,113,240,241,255,218,0,8,1,2,1,1,63,16,142,249,193,181,208,29,126,176,10,2,55,80,243,81,144,51,39,52,64,145,201,212,190,33,236,69,32,204,247,226,138,4,0,32,3,0,106,54,225,34,184,255,196,0,25,16,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,17,33,0,49,65,255,218,0,8,1,1,0,1,63,16,124,29,47,103,178,50,221,96,0,28,78,63,80,221,129,85,154,174,130,16,59,160,158,130,171,235,198,98,6,163,137,137,24,108,74,30,253,186,160,3,193,223,255,217]};

const raw = {
   width: 16,
   height: 16,
   data: decode( jpeg.data )
}

function decodeTest( jpegData ) {
   var rawImageData = decode(jpegData);
   expect(rawImageData.width).toEqual(16);
   expect(rawImageData.height).toEqual(16);
   expect(checksum(rawImageData.data)).toEqual(209);
}

function encodeTest( rawimg ) {
   var jpegImageData = encode(rawimg, 50);
   expect(jpegImageData.width).toEqual(16);
   expect(jpegImageData.height).toEqual(16);
   expect(checksum(jpegImageData.data)).toEqual(76);
}

/*---------------------------------------------------------------------*/
/*    testAll                                                          */
/*---------------------------------------------------------------------*/
function testAll() {
   for( let i = 0; i < 10; i++ ) {
      decodeTest( jpeg.data );
      encodeTest( raw );
   }
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

decodeTest( jpeg.data );
encodeTest( raw );

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 10
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 30;

main( "jpeg", N ); 
