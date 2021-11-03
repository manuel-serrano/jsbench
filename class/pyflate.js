// Copyright 2021 Manuel Serrano for the JavaScript translation
// Copyright 2006--2007-01-21 Paul Sladen for the Python Implementation
// http://www.paul.sladen.org/projects/compression/
// 
// You may use and distribute this code under any DFSG-compatible
// license (eg. BSD, GNU GPLv2).
// 
// Stand-alone pure-Python DEFLATE (gzip) and bzip2 decoder/decompressor.
// This is probably most useful for research purposes/index building;  there
// is certainly some room for improvement in the Huffman bit-matcher.
// 
// With the as-written implementation, there was a known bug in BWT
// decoding to do with repeated strings.  This has been worked around;
// see 'bwt_reverse()'.  Correct output is produced in all test cases
// but ideally the problem would be found...

"use strict";

let M = 0;
function log(m) {
   console.log(M++ + " " + m);
}
function iota(size) {
   const a = new Array(size);
   for (let i = 0; i < size; i++) {
      a[i] = i;
   }
   return a;
}
const None = undefined;

function bytes(b) {
   const c = b[0];
   if (c === 0xd) {
      return "b'\\r'";
   } else if (c === 0xa) {
      return "b'\\n'";
   } else if (c < 16) {
      return "b'\\x0" + c.toString(16) + "'";
   } else if (c < 32) {
      return "b'\\x" + c.toString(16) + "'";
   } else if (c <127) {
      return "b'" + String.fromCharCode(c) + "'";
   } else {
      return "b'\\x" + c.toString(16) + "'";
   }
}

function ord(c) {
   if (typeof(c) === "number") {
      return c;
   } else if (typeof(c) === "string") {
      return c.charCodeAt(0);
   } else {
      return c[0];
   }
}

function bool(x) {
   return x ? true : false;
}

function int2byte(n) {
   return n & 0xff;
}

function iota(size) {
   const a = new Array(size);
   for (let i = 0; i < size; i++) {
      a[i] = i;
   }
   return a;
}

function str(o) {
   if (typeof(o) === "string") {
      return o;
   } else if (typeof(o) === "number") {
      return o;
   } else if (o === true) {
      return "True";
   } else if (o === false) {
      return "False";
   } else if (typeof(o) === "bigint") {
      return o;
   } else if (o === undefined) {
      return "None";
   } else if (o instanceof Array) {
      return "[" + o.map(str).join(", ") + "]";
   } else {
      return o;
   }
}

function rep(o) {
   if (typeof(o) === "string") {
      return o;
   } else if (typeof(o) === "number") {
      return `Number(${o})`;
   } else if (typeof(o) === "boolean") {
      return `Boolean(${o})`;
   } else if (typeof(o) === "bigint") {
      return `BigInt(${o})`;
   } else if (o instanceof Array) {
      return "Array[" + o.join(", ") + "]";
   } else {
      return o;
   }
}
   
// @record
class Runner {
   metadata = {};
   
   constructor() {
   }
   
   bench_func(name, proc, ...args) {
      
      return proc.apply(undefined, args);
   }
}

const files = {
   "./sample.tar.bz2" : { bytes: "425a68393141592653592335680000007aff84c210030040017f80004000a067059e40000400082000741a9a18a0c80d00d34d0494269a34d0000037fbb8b9c8413bc04893e4cb064c4989206ead1dd3623af8405ba0690216cb57264917aa93890a44d26bd10dc76560a301a4f8a0e0e673140dde9e9a87a884feac7eae6ac6300fc5dc914e142408cd5a0000", hash: "b4d67e3d882bb71400a4c768be09759f" }
}

// @record
class FD {
   #array;
   #offset = 0;

   static #BYTESA = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
		     [10], [11], [12], [13], [14], [15], [16], [17], [18], [19],
		     [20], [21], [22], [23], [24], [25], [26], [27], [28], [29],
		     [30], [31], [32], [33], [34], [35], [36], [37], [38], [39],
		     [40], [41], [42], [43], [44], [45], [46], [47], [48], [49],
		     [50], [51], [52], [53], [54], [55], [56], [57], [58], [59],
		     [60], [61], [62], [63], [64], [65], [66], [67], [68], [69],
		     [70], [71], [72], [73], [74], [75], [76], [77], [78], [79],
		     [80], [81], [82], [83], [84], [85], [86], [87], [88], [89],
		     [90], [91], [92], [93], [94], [95], [96], [97], [98], [99],
		     [100], [101], [102], [103], [104], [105], [106], [107], [108], [109],
		     [110], [111], [112], [113], [114], [115], [116], [117], [118], [119],
		     [120], [121], [122], [123], [124], [125], [126], [127], [128], [129],
		     [130], [131], [132], [133], [134], [135], [136], [137], [138], [139],
		     [140], [141], [142], [143], [144], [145], [146], [147], [148], [149],
		     [150], [151], [152], [153], [154], [155], [156], [157], [158], [159],
		     [160], [161], [162], [163], [164], [165], [166], [167], [168], [169],
		     [170], [171], [172], [173], [174], [175], [176], [177], [178], [179],
		     [180], [181], [182], [183], [184], [185], [186], [187], [188], [189],
		     [190], [191], [192], [193], [194], [195], [196], [197], [198], [199],
		     [200], [201], [202], [203], [204], [205], [206], [207], [208], [209],
		     [210], [211], [212], [213], [214], [215], [216], [217], [218], [219],
		     [220], [221], [222], [223], [224], [225], [226], [227], [228], [229],
		     [230], [231], [232], [233], [234], [235], [236], [237], [238], [239],
		     [240], [241], [242], [243], [244], [245], [246], [247], [248], [249],
		     [250], [251], [252], [253], [254], [255]];
		    
   constructor(buffer) {
      const a = new Array(buffer.length);
      for (let i = buffer.length - 1; i >=0; i--) {
	 a[i]=buffer[i];
      }
      this.#array = a;
   }
 
   read(n) {
      if (n > 1) {
	 throw new TypeError(`Unsupported read length ${n}`);
      }
      return FD.#BYTESA[this.#array[this.#offset++]];
   }
   
   close() {
      this.#array = [];
      this.#offset = 0;
   }
   
   seek(n) {
      this.#offset = n;
   }
}
   
function open(filename, mode) {
   if (!filename in files) {
      throw new Error(`Cannot find (static) file ${filename}`);
   } else {
      return new FD(new Buffer(files[filename].bytes, "hex"));
   }
}

//////////////////////////////////////////////////////////////////////////////
let R = 0;

// @record
class BitfieldBase {
   #f;
   bits;
   bitfield;
   #count;
   
   constructor(x) {
      if (x instanceof BitfieldBase) {
	 this.#f = x.#f;
	 this.bits = x.bits;
	 this.bitfield = x.bitfield;
	 this.#count = x.#count;
      } else {
	 this.#f = x;
	 this.bits = 0;
	 this.bitfield = 0n;
	 this.#count = 0;
      }
   }

   _read(n) {
      /* log("_read.0 n=" + n + " " + R++); */
      const s = this.#f.read(n);
      /* log("_read.1 n=" + n + " s=" + bytes(s)); */
      if (!s) {
	 throw new TypeError("Length Error");
      }
      this.#count += s.length;
      return s;
   }

   needbits(n) {
      while (this.bits < n) {
	 this._more();
      }
   }

   _mask(n) {
      return (2n ** BigInt(n)) - 1n;
   }

   _maskM(n) {
      return (2n ** BigInt(n));
   }

   toskip() {
      return this.bits & 0x7;
   }

   align() {
      this.readbits(this.toskip());
   }

   dropbits(n) {
      while (n >= this.bits && n > 7) {
	 n -= this.bits;
	 this.bits = 0;
	 n -= (this.#f._read(n >> 3)).length << 3;
      }
      if (n) {
	 this.readbits(n);
        // No return value
      }
   }

   dropbytes(n) {
      this.dropbits(n << 3, 8);
   }

   tell() {
      return [this.#count - ((this.bits + 7) >> 3), 7 - ((this.bits - 1) & 0x7)];
   }

   tellbits() {
      const [bytes, bits] = this.tell();
      return (bytes << 3) + bits;
   }
}

// @record
class Bitfield extends BitfieldBase {

   _more() {
      const c = this._read(1);
      this.bitfield += BigInt(ord(c)) * (2n ** BigInt(this.bits));
      // this.bitfield += BigInt(ord(c)) << BigInt(this.bits);
      /* log("_more=" + str(this.bitfield) + " " +str(ord(c))); */
      this.bits += 8;
   }

   snoopbits(n) {
      if (n > this.bits) {
	 this.needbits(n);
      }
      return Number(this.bitfield % this._maskM(n));
      /* return Number(BigInt.asIntN(53,this.bitfield & this._mask(n))); */
   }

   readbits(n) {
      if (n > this.bits)
	 this.needbits(n);
      const r = this.bitfield % this._maskM(n);
      //const r = this.bitfield & this._mask(n);
      /* log("readbits r.1=" + str(r) + " " + str(n) + " " + str(this.bitfield)); */
      this.bits -= n;
      this.bitfield /= (2n ** BigInt(n));
      /* log("readbits r.2=" + str(r) + " " + str(this.bitfield)); */
      return Number(r);
   }
}

// @record
class RBitfield extends BitfieldBase {

   _more() {
      const c = this._read(1);
      /* log("_rmore.1=" + str(this.bitfield) + " " +str(ord(c))); */
      this.bitfield *= 256n;
      /* log("_rmore.2=" + str(this.bitfield) + " " +str(ord(c))); */
      this.bitfield += BigInt(ord(c));
      /* log("_rmore.3=" + str(this.bitfield) + " " +str(ord(c))); */
      this.bits += 8;
   }

   snoopbits(n) {
      if (n > this.bits) {
	 this.needbits(n);
      }
      return Number(this.bitfield / (2n ** BigInt(this.bits - n)) % this._maskM(n));
      //return Number(BigInt.asIntN(53,(this.bitfield >> BigInt(this.bits - n)) & this._mask(n)));
   }

   readbits(n) {
      /* log("rreadbits this.bits=" + this.bits + " n=" + n); */
      if (n > this.bits) {
	 this.needbits(n);
      }

      const r = (this.bitfield / (2n ** BigInt(this.bits - n))) % this._maskM(n);
      // const r = (this.bitfield >> BigInt(this.bits - n)) & this._mask(n);
      /* log("rreadbits r.1=" + str(r) + " " + str(n) + " this.bits=" + this.bits); */
      this.bits -= n;
      const b = (this.bitfield % (2n ** BigInt(this.bits)));
      //const b = this.bitfield & ~(this._mask(n) << BigInt(this.bits));
      this.bitfield = b;
      /* log("rreadbits r.2=" + str(r)); */
      return Number(r);
   }
}

function printbits(v, n) {
   let o = '';
   for (let i = 0; i < n; i++) {
      if (v & 1) {
	 o = '1' + o;
      } else {
	 o = '0' + o;
      }
      v >>= 1;
   }
   return o;
}

// @record
class HuffmanLength {
   code;
   bits;
   symbol;
   reverse_symbol;
   
   constructor(code, bits) {
      this.code = code;
      this.bits = bits;
      this.symbol = None;
      this.reverse_symbol = None;
   }
   
   __repr__() {
      return `<HufmmanLength(${this.code}, ${this.bits}, ${this.symbol}, ${this.reverse_symbol}>`;
   }

   static _sort_func(o1, o2) {
      if (o1.bits < o2.bits) return -1;
      if (o1.bits > o2.bits) return 1;
      if (o1.code < o2.code) return -1;
      if (o1.code > o2.code) return 1;
      return 0;
   }
   
   toString() {
      return `(${this.code}, ${this.bits}, ${str(this.symbol)}, ${str(this.reverse_symbol)})`;
   }
}

function reverse_bits(v, n) {
   let a = 1 << 0;
   let b = 1 << (n - 1);
   let z = 0;
   for (let i = n - 1; i > -1; i -= 2) {
      z |= (v >> i) & a;
      z |= (v << i) & b;
      a <<= 1;
      b >>= 1;
   }
   /* log("reverse_bits v=" + str(v) + " n=" + str(n) + " -> " + str(z)); */
   return z
}

function reverse_bytes(v, n) {
   let a = 0xff << 0;
   let b = 0xff << (n - 8);
   let z = 0;
   for (let i = n - 8; i > -8; i-= 16) {
      z |= (v >> i) & a;
      z |= (v << i) & b;
      a <<= 8;
      b >>= 8;
   }
   return z;
}

// @record
class HuffmanTable {
   #min_bits;
   #max_bits;
   #table;
   
   constructor(bootstrap) {
      /* log(">>> HuffmanTable " + str(bootstrap[0])); */
      let l = [];
      let [start, bits] = bootstrap[0];
      for (let i = 1; i < bootstrap.length; i++) {
	 const [finish, endbits ] = bootstrap[i];
	 if (bits) {
	    for (let code = start; code < finish; code++) {
	       l.push(new HuffmanLength(code, bits));
	    }
            start = finish; 
	    bits = endbits;
	    /* log("start=" + start); */
	    /* log("bits=" + bits); */
            if (endbits === -1) {
	       break;
	    }
	 }
      }
      l.sort(HuffmanLength._sort_func);
      /* log("<<< HuffmanTable " + str(l)); */
      this.#table = l;
   }

   populate_huffman_symbols() {
      let bits = -1;
      let symbol = -1;
      for (let x of this.#table) {
	 /* log("phs x=" + str(x)); */
	 symbol += 1;
	 if (x.bits !== bits) {
	    symbol <<= (x.bits - bits);
	    bits = x.bits;
	    /* log("phs symbol=" + str(symbol) + " bits=" + bits + " x=" + str(x)); */
	 }
	 x.symbol = symbol;
	 x.reverse_symbol = reverse_bits(symbol, bits);
	 /* log("RS=" + str(x.reverse_symbol) + " " + str(symbol) + " " + str(bits)); */
      }
   }

   tables_by_bits() {
      let d = {};
      for (let x in this.#table) {
	 try {
	    d[x.bits] = d[x.bits].concat(x);
	 } catch(e) {
	    d[x.bits] = [x];
	 }
      }
   }

   min_max_bits() {
      this.#min_bits = 16;
      this.#max_bits = -1;
      for (let x of this.#table) {
	 if (x.bits < this.#min_bits) {
	    this.#min_bits = x.bits;
	 }
	 if (x.bits > this.#max_bits) {
	    this.#max_bits = x.bits;
	 }
      }
   }

   _find_symbol(bits, symbol, table) {
      for (let h in table) {
	 if (h.bits == bits && h.reverse_symbol === symbol) {
	    return h.code;
	 }
      }
      return -1;
   }

   find_next_symbol(field, reversed) {
      let cached_length = -1;
      let cached = None;
      for (let x of this.#table) {
      	 /* log("FNS " + str(x.symbol)); */
 	 /* log("cached_length=" + cached_length + " x.bits=" + str(x.bits)); */
	 if (cached_length !== x.bits) {
	    /* log("find_next_symbol.1 " + x.bits); */
	    cached = field.snoopbits(x.bits, 8);
	    cached_length = x.bits;
	 }
	 /* log("reversed=" + str(reversed) + " " + str(x.reverse_symbol) + " symbol=" + str(x.symbol)+ " cache=" + str(cached)); */
	 if ((reversed && x.reverse_symbol === cached) || (!reversed && (x.symbol === cached))) {
	    field.readbits(x.bits);
	    /* log("FNS x.code=" + x.code); */
	    return x.code;
	 }
      }
      throw new TypeError(`unfound symbol, even after end of table ${field.tell()}`);

      for (let bits = this.#min_bits; bits < this.#max_bits + 1; bits++) {
	 /* log("find_next_symbol.2 " + bits); */
	 let r = this._find_symbol(bits, field.snoopbits(bits, 8), this.#table);
	 if (0 <= r) {
	    field.readbits(bits);
	    return r;
	 } else if (bits === this.max_bits) {
	    throw new TypeError("unfound symbol, even after max_bits");
	 }
      }
   }
}

// @record
class OrderedHuffmanTable extends HuffmanTable {
   
   constructor(lengths) {
      /* log("OrderedHuffmanTable lengths=" + str(lengths)); */
      const l = lengths.length;
      const z = lengths.map((v,i,a) => [i, v]).concat([[l, -1]]);
      /* log("l=" + str(l) + " Z=" + str(z.length)); */
      super(z);
   }
}

const CODE_LENGTH_ORDERS = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
function code_length_orders(i) {
   return CODE_LENGTH_ORDERS[i];
}

const DISTANCE_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
	   	       257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193,
	   	       12289, 16385, 24577];
function distance_base(i) {
   return DISTANCE_BASE[i];
}

const LENGTH_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35,
	   	     43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
function length_base(i) {
   return LENGTH_BASE[i - 257];
}

function extra_distance_bits(n) {
   if (0 <= n && n <= 1) {
      return 0;
   } else if (2 <= n && n <= 29) {
      return (n >> 1) - 1;
   } else {
      throw new TypeError("illegal distance code");
   }
}

function extra_length_bits(n) {
   if ((257 <= n && n <= 260) || n == 285) {
      return 0;
   } else if (261 <= n && n <= 284) {
      return ((n - 257) >> 2) - 1;
   } else {
      throw new TypeError("illegal length code");
   }
}

function move_to_front(l, c) {
   /* log("<<< move_to_front " + str(l) + " c=" + c); */
   const lc = l[c];
   l.copyWithin(1, 0, c);
   l[0] = lc;
   /* log("<<< move_to_front " + str(l)); */
}

function bwt_transform(L) {
    // Semi-inefficient way to get the character counts
    /* log("bwt_transform L=" + str(L)); */
    const F = [].concat(L).sort((x,y) => x < y ? -1 : (x > y ? 1 : 0));
    let base = [];
    /* log("bwt_transform F=" + str(F)); */
    for (let i = 0; i < 256; i++) {
       base.push(F.indexOf(int2byte(i)));
    }
    
    /* log("bwt_transform base=" + str(base)); */

    let pointers = new Array(L.length).fill(-1);
    for (let i = 0; i < L.length; i++) {
       const symbol = L[i];
       /* log("bwt_transform i=" + str(i) + " sym=" + str(symbol)); */
       pointers[base[symbol]] = i;
       base[symbol] += 1;
    }
	
    /* log("bwt_transform " + str(pointers)); */
    return pointers
}

function bwt_reverse(L, end) {
   /* log("bwt_reverse L=" + L.length + " " + str(L)); */
   let out = [];
   if (L.length) {
      let T = bwt_transform(L);

      // STRAGENESS WARNING: There was a bug somewhere here in that
      // if the output of the BWT resolves to a perfect copy of N
      // identical strings (think exact multiples of 255 'X' here),
      // then a loop is formed.  When decoded, the output string would
      // be cut off after the first loop, typically '\0\0\0\0\xfb'.
      // The previous loop construct was:
      //
      //  next = T[end]
      //  while next != end:
      //      out += L[next]
      //      next = T[next]
      //  out += L[next]
      //
      // For the moment, I've instead replaced it with a check to see
      // if there has been enough output generated.  I didn't figured
      // out where the off-by-one-ism is yet---that actually produced
      // the cyclic loop.

      for (let i = 0; i < L.length; i++) {
	 end = T[end];
	 out.push(L[end]);
      }
   }

   /* log("bwt_reverse out=" + str(out)); */
   return out;
}

function compute_used(b) {
   const huffman_used_map = b.readbits(16);
   let map_mask = 1 << 15;
   let used = [];
   
   while (map_mask > 0) {
      if (huffman_used_map & map_mask) {
	 const huffman_used_bitmap = b.readbits(16);
	 let bit_mask = 1 << 15;
         while (bit_mask > 0) {
	    if (huffman_used_bitmap & bit_mask) {
	       ;
	    }
	    used = used.concat([bool(huffman_used_bitmap & bit_mask)]);
	    bit_mask >>= 1;
	 }
      } else {
	 used = used.concat(new Array(16).fill(false));
      }
      map_mask >>= 1;
   }
	
   /* log("compute_used " + str(used)); */
   return used;
}

function compute_selectors_list(b, huffman_groups) {
   let selectors_used = b.readbits(15);
   let mtf = iota(huffman_groups);
   let selectors_list = [];
   for (let i = 0; i < selectors_used; i++) {
        // zero-terminated bit runs (0..62) of MTF'ed huffman table
        let c = 0;
        while (b.readbits(1)) {
	   c += 1;
	   if (c >= huffman_groups) {
	      throw new TypeError("Bzip2 chosen selector greater than number of groups (max 6)");
	   }
	}
        if (c >= 0) {
	   move_to_front(mtf, c);
	}
        selectors_list = selectors_list.concat(mtf[0]);
   }
   return selectors_list;
}

function compute_tables(b, huffman_groups, symbols_in_use) {
   let groups_lengths = [];
   for (let j = 0; j < huffman_groups; j++) {
      let length = b.readbits(5);
      let lengths = [];
      for (let i = 0; i < symbols_in_use; i++) {
	 if (!(0 <= length && length <= 20)) {
	    throw new TypeError("Bzip2 Huffman length code outside range 0..20");
	 }
	 while (b.readbits(1)) {
	    length -= (b.readbits(1) * 2) - 1;
	 }
	 lengths.push(length);
      }
      groups_lengths.push(lengths);
   }

   let tables = [];
   for (let g of groups_lengths) {
      /* log("compute_tables g=" + str(g)); */
      const codes = new OrderedHuffmanTable(g);
      codes.populate_huffman_symbols();
      codes.min_max_bits();
      tables = tables.concat(codes);
   }
   
   return tables;
}

function decode_huffman_block(b, out) {
   const randomised = b.readbits(1);
   if (randomised) {
      throw new TypeError("Bzip2 randomised support not implemented");
   }
   let pointer = b.readbits(24);
   let used = compute_used(b);

   let huffman_groups = b.readbits(3);
   if (!(2 <= huffman_groups && huffman_groups <= 6)) {
      throw new TypeError("Bzip2: Number of Huffman groups not in range 2..6");
   }

   let selectors_list = compute_selectors_list(b, huffman_groups);
   let symbols_in_use = used.reduce((a,b) => a + b, 2);  // remember RUN[AB] RLE symbols
   let tables = compute_tables(b, huffman_groups, symbols_in_use);

   /* log("used=" + str(used)); */
   let favourites = used.map((x,i) => [x,i]).filter(e=>e[0]).map(e => int2byte(e[1]));
   
   /* log("decode_huffman_block favourites=" + str(favourites)); */
   let selector_pointer = 0;
   let decoded = 0;
   // Main Huffman loop
   let repeat = 0;
   let repeat_power = 0;
   let buffer = [];
   let t = None;
   while (true) {
      decoded -= 1;
      if (decoded <= 0) {
	 decoded = 50;  // Huffman table re-evaluate/switch length
	 if (selector_pointer <= selectors_list.length) {
	    t = tables[selectors_list[selector_pointer]];
	    selector_pointer += 1;
	 }
      }

      let r = t.find_next_symbol(b, false);
      /* log( "decode_huffman_block r=" + r); */
      if (0 <= r && r <= 1) {
	 if (repeat === 0) {
	    repeat_power = 1;
	 }
	 repeat += repeat_power << r;
         repeat_power <<= 1;
         continue;
      } else if (repeat > 0) {
            // Remember kids: If there is only one repeated
            // real symbol, it is encoded with *zero* Huffman
            // bits and not output... so buffer[-1] doesn't work.
	    const rep = new Array(repeat).fill(favourites[0]);
	    /* log("rep=" + str(rep)); */
	    /* log("pushing rep=" + rep); */
            buffer.push(rep);
	    /* log("decode_huffman_block " + str(buffer.length)); */
            repeat = 0;
      }
      if (r === symbols_in_use - 1) {
	 break;
      } else {
	 const n = r - 1;
	 const o = favourites[n];
	 move_to_front(favourites, r - 1);
	 /* log("pushing o=" + o + " r=" + r + " n=" + n); */
	 buffer.push([o]);
      }
   }

   /* log("nearly_there buf=" + str(buffer)); */
   let nearly_there = bwt_reverse(Array.prototype.concat.apply([],buffer), pointer);
   /* log("nearly_there nt=" + str(nearly_there)); */
   let nt = nearly_there;
   let i = 0;
   // Pointless/irritating run-length encoding step
   while (i < nearly_there.length) {
      if (i < nearly_there.length - 4 && nt[i] === nt[i + 1] && nt[i] === nt[i + 2] && nt[i]=== nt[i + 3]) {
	 const tmp = nearly_there[i + 4];
	 /* log("tmp=" + tmp); */
	 const len = ord(tmp) + 4;
	 const buf = new Array(len).fill(nearly_there.slice(i,i + 1));
	 /* log("buf=" + str(buf)); */
	 out = out.concat(buf);
	 i += 5;
      } else {
	 out = out.concat(nearly_there.slice(i,i + 1));
	 i += 1;
      }
   }
   /* log("decode_huffman_block out=" + str(out.length)); */
   return Array.prototype.concat.apply([],out);
}

// Sixteen bits of magic have been removed by the time we start decoding


function bzip2_main(input) {
   let b = new RBitfield(input);

   let method = b.readbits(8);
   /* log("method.1=" +str(method) + " " + ord('h')); */
   /* log("eq=" + (method == ord('h')) + " t1=" + typeof(method) + " t2=" + typeof(ord('h'))); */
   if (method !== ord('h')) {
      throw new TypeError("Unknown (not type 'h'uffman Bzip2) compression method");
   }

   let blocksize = b.readbits(8);
   /* log("blocksize.1=" +blocksize); */
   if (ord('1') <= blocksize  && blocksize <= ord('9')) {
      blocksize = blocksize - ord('0');
   } else {
      throw new TypeError("Unknown (not size '0'-'9') Bzip2 blocksize");
   }

   let out = [];
   while (true) {
      let blocktype = b.readbits(48);
      /* log("blocktype.2=" +blocktype); */
      b.readbits(32);   // crc
      if (blocktype == 0x314159265359) { // (pi)
	 out = decode_huffman_block(b, out);
      } else if (blocktype === 0x177245385090) {  // sqrt(pi)
	 b.align();
	 break;
      } else {
	 throw new TypeError("Illegal Bzip2 blocktype");
      }
   }
   /* log("out=" + str(out)); */
   return out;
}

// Sixteen bits of magic have been removed by the time we start decoding
function gzip_main(field) {
   let b = new Bitfield(field);
   let method = b.readbits(8);
   if (method !== 8) {
      throw new TypeError("Unknown (not type eight DEFLATE) compression method");
   }

   // Use flags, drop modification time, extra flags and OS creator type.
   let flags = b.readbits(8);
   b.readbits(32);   // mtime
   b.readbits(8);    // extra_flags
   b.readbits(8);    // os_type

   if (flags & 0x04) {   // structured GZ_FEXTRA miscellaneous data
      const xlen = b.readbits(16);
      b.dropbytes(xlen, 1);
   }
   while (flags & 0x08) { // original GZ_FNAME filename
      if (!b.readbits(8)) {
	 ;
      }
   }
   while (flags & 0x10) { // human readable GZ_FCOMMENT
      if (!b.readbits(8)) {
	 ;
      }
   }
   if (flags & 0x02) { // header-only GZ_FHCRC checksum
      b.readbits(16);
   }

   let out = [];
   while (true) {
      let lastbit = b.readbits(1);
      let blocktype = b.readbits(2);
      let code_lengths_length;
      let code_lengths;

      if (blocktype === 0) {
	 b.align();
	 let length = b.readbits(16);
	 if (length & b.readbits(16)) {
	    throw new TypeError("stored block lengths do not match each other");
	 }
	 for (let i = 0; i < length; i++) {
	    out = out.concat(int2byte(b.readbits(8)));
	 }
      } else if (blocktype == 1 || blocktype == 2) { // Huffman
	 let main_literals = None;
	 let main_distances = None;
	 let literals;

	 if (blocktype === 1) { // Static Huffman
	    const static_huffman_bootstrap = [
	       [0, 8], [144, 9], [256, 7], [280, 8], [288, -1]];
	    const static_huffman_lengths_bootstrap = [[0, 5], [32, -1]];
	    main_literals = HuffmanTable(static_huffman_bootstrap);
	    main_distances = HuffmanTable(static_huffman_lengths_bootstrap);
	 } else if (blocktype === 2) {  // Dynamic Huffman
	    let literals = b.readbits(5) + 257;
	    let distances = b.readbits(5) + 1;
	    code_lengths_length = b.readbits(4) + 4;

	    let l = new Array(19).fill(0);
	    for (let i = 0; i < code_lengths_length; i++) {
	       l[code_length_orders(i)] = b.readbits(3);

	       const dynamic_codes = new OrderedHuffmanTable(l);
	       dynamic_codes.populate_huffman_symbols();
	       dynamic_codes.min_max_bits();

	       // Decode the code_lengths for both tables at once,
	       // then split the list later

	       code_lengths = [];
	       let n = 0;
	       let what;
	       let count;
	       
	       while (n < (literals + distances)) {
		  const r = dynamic_codes.find_next_symbol(b, true);
		  if (0 <= r && r <= 15) {  // literal bitlength for this code
		     count = 1;
		     what = r;
		  } else if (r == 16) {  // repeat last code
		     count = 3 + b.readbits(2);
		     // Is this supposed to default to '0' if in the zeroth
		     // position?
		     what = code_lengths[-1];
		  } else if (r == 17) { // repeat zero
		     count = 3 + b.readbits(3);
		     what = 0;
		  } else if (r == 18) {  // repeat zero lots
		     count = 11 + b.readbits(7);
		     what = 0;
		  } else {
		     throw new TypeError("next code length is outside of the range 0 <= r <= 18");
                     code_lengths += new Array(count).fill(what);
                     n += count;
		  }
	       }
	    }
	 }

	 main_literals = new OrderedHuffmanTable(code_lengths.slide(0,literals));
	 main_distances = new OrderedHuffmanTable(code_lengths.slide(literals));

	 // Common path for both Static and Dynamic Huffman decode now

	 main_literals.populate_huffman_symbols();
	 main_distances.populate_huffman_symbols();

	 main_literals.min_max_bits();
	 main_distances.min_max_bits();

	 let literal_count = 0;
	 while (true) {
	    let r = main_literals.find_next_symbol(b, true);
	    if (0 <= r && r <= 255) {
	       literal_count += 1;
	       out = out.concat(int2byte(r));
	    } else if (r == 256) {
	       if (literal_count > 0) {
		  literal_count = 0;
	       }
	       break;
	    } else if (257 <= r && r <= 285) {  // dictionary lookup
	       if (literal_count > 0) {
		  literal_count = 0;
	       }
	       const length_extra = b.readbits(extra_length_bits(r));
	       let length = length_base(r) + length_extra;

	       const r1 = main_distances.find_next_symbol(b, true);
	       if (0 <= r1 && r1 <= 29) {
		  const distance = distance_base(r1) + b.readbits(extra_distance_bits(r1));
		  while (length > distance) {
		     out = out.concat(out.slice(length - distance));
		     length -= distance;
		  }
		  if (length === distance) {
		     out = out.concat(out.slice(length - distance));
		  } else {
		     out = out.concat(out.slide(length - distance,length - distance));
		  }
	       } else if (30 <= r1 && r1 <= 31) {
		  throw new TypeError(`Illegal unused distance symbol in use ${b.tell()}`);
	       }
	       /* log("slice neg=" + str(out)); */
	    } else if (286 <= r && r <= 287) {
	       throw new TypeError(`illegal unused literal/length symbol in use ${b.tell}`);
	    }
	 }
      } else if (blocktype === 3) {
	 throw new TypeError(`illegal unused blocktype in use ${b.tell()}`);
      }

      if (lastbit) {
	 break;
      }
   }

   b.align();
   b.readbits(32);   // crc
   b.readbits(32);   // final_length
   return "".join(out);
}

function checksum(out) {
   let sum = 0;
   for (let i = out.length - 1; i >= 0; i--) {
      sum += out[i];
   }
   return sum;
}

function bench_pyflake(loops, filename) {
   let input_fp = open(filename, 'rb');
   let range_it = loops;
   let out;
   
   for (let _ = 0; _ < range_it; _++) {
      input_fp.seek(0);
      const field = new RBitfield(input_fp);
      const magic = field.readbits(16);
      /* log("MAGIC " + field.bitfield); */
      
      if (magic === 0x1f8b) {  // GZip
	 out = gzip_main(field);
      } else if (magic == 0x425a) {   // BZip2
	 out = bzip2_main(field);
      } else {
	 throw new TypeError(`Unknown file magic %x, not a gzip/bzip2 file ${magic}`);
      }
   }

   input_fp.close();
   return checksum(out);
}

//////////////////////////////////////////////////////////////////////////////
const N = 
   (process.argv[1] === "fprofile") 
   ? 2
   //: process.argv[2] ? parseInt(process.argv[2]) : 100;
   : process.argv[2] ? parseInt(process.argv[2]) : 10;

const runner = new Runner();

function main(runner,args) {
   for (let i = 0; i < N; i++) {
      runner.bench_func('pyflate', bench_pyflake, 300, "./sample.tar.bz2");
   }
   console.log(runner.bench_func('flyflate', bench_pyflake, 1, "./sample.tar.bz2"));
}

main(runner, {});
