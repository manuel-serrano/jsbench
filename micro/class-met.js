"use strict";

// see init at the bottom of the file
let glob = 3.4;

// @sealed
class baseclass {
   x; y;
   a0;
   constructor(a0) {
      this.a0 = a0;
      this.x = a0;
      this.y = -a0;
   }
   sum() {
      // long useless prelude to avoid method inlining
      if (glob !== 0) {
	 if (this.a0 > 0) {
	    glob += 1;
	 }
	 if (this.x > this.y) { 
	    glob = 23;
	 }
	 if (this.a0 + this.x + this.y > 32) {
	    glob *= 2.1;
	 }
	 if (this.y & 3 === 45) {
	    glob = 4.5
	 }
	 if (this.x + this.y & 127 !== 0) {
	    glob = 3.22;
	 }
	 if (this.a0 & 65535 !== 3) {
	    glob = 2.22;
	 } else {
	    glob = 5.5;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
      }
      return glob;
   }
   test() {
      let res1 = 0, res2 = 0;
      for (let m = 0; m < 500; m++) {
	 res1 = this.sum();
	 glob = -glob;
	 res2 = this.sum();
      }
      return res1 - res2;
   }
}
   
// @sealed
class subclass1 extends baseclass {
   a1;
   constructor(a0, a1) {
      super(a0);
      this.a1 = a1;
   }
   sum() {
     if (glob !== 0) {
	 if (this.a0 > 0) {
	    glob += 1;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass2 extends subclass1 {
   a2;
   constructor(a0, a1, a2) {
      super(a0, a1);
      this.a2 = a2;
   }
   sum() {
     if (glob !== 0) {
	 if (this.x > 0) {
	    glob += 1;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass3 extends subclass2 {
   a3;
   constructor(a0, a1, a2, a3) {
      super(a0, a1, a2);
      this.a3 = a3;
   }
   sum() {
     if (glob !== 0) {
	 if (this.y > 0) {
	    glob = 4.5;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass4 extends subclass3 {
   a4;
   constructor(a0, a1, a2, a3, a4) {
      super(a0, a1, a2, a3);
      this.a4 = a4;
   }
   sum() {
     if (glob !== 0) {
	 if (this.a0 > 1000) {
	    glob = "foo";
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass5 extends subclass4 {
   a5;
   constructor(a0, a1, a2, a3, a4, a5) {
      super(a0, a1, a2, a3, a4);
      this.a5 = a5;
   }
   sum() {
     if (glob !== 0) {
	 if (this.x + this.y > 10000) {
	    glob = [];
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass6 extends baseclass {
   a6;
   constructor(a0, a1, a2, a3, a4, a5, a6) {
      super(a0, a1, a2, a3, a4, a5);
      this.a6 = a6;
   }
   sum() {
     if (glob !== 0) {
	 if (this.x + this.y > 999) {
	    glob = [];
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass7 extends subclass6 {
   a7;
   constructor(a0, a1, a2, a3, a4, a5, a6, a7) {
      super(a0, a1, a2, a3, a4, a5, a6);
      this.a7 = a7;
   }
   sum() {
     if (glob !== 0) {
	if (this.x !== this.y) {
	    glob = 234;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass8 extends subclass7 {
   a8;
   constructor(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
      super(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      this.a8 = a8;
   }
   sum() {
     if (glob !== 0) {
	if (this.x > this.y) {
	    glob = 4.4;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}
   
// @sealed
class subclass9 extends subclass8 {
   a9;
   constructor(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      super(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      this.a9 = a9;
   }
   sum() {
     if (glob !== 0) {
	 if (this.x + this.y & 45 !== 0) {
	    glob = 1.0;
	 }
	 if (glob < 100000) {
	    glob = 0;
	 }
     }
     return glob;
   }
}

function classmet(CNT, nbobj) {
   const K = CNT / 10;
   let res = 0;
   
   const os = [new baseclass(10),
	       new subclass1(1,1),
	       new subclass2(2,2,2),
	       new subclass3(3,3,3,3),
	       new subclass4(4,4,4,4,4),
	       new subclass5(5,5,5,5,5,5),
	       new subclass6(6,6,6,6,6,6,6),
	       new subclass7(7,7,7,7,7,7,7,7),
	       new subclass8(8,8,8,8,8,8,8,8,8),
	       new subclass9(9,9,9,9,9,9,9,9,9,9)];

   for (let o of os) {
      o.sum();
   }
      
   for (let j = 0, i = 0; j < CNT; j++, i++) {
      if (i === K) { 
	 console.log(j);
	 i = 0;
      }
      
      for (let m = 0, n = 0; m < 100; m++) {
	 const o = os[n];
	 res += o.test();
	 n++;
	 if (n === nbobj) n = 0;
      }
   }

   return res;
}

const N = ((process.argv[2] === "fprofile") ? 100 : ((process.argv[2] === "nbobj") ? 10000 : (process.argv[2] ? parseInt(process.argv[2]) : 10000)));
const nbobj = (process.argv[2] === "nbobj") ? parseInt(process.argv[3]) : 4;

if (nbobj >= 0) {
   glob = 1;
}

console.log("classmet(", N, ",", nbobj, ")..." );
console.log(classmet(N, nbobj));

