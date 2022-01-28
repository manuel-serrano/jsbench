"use strict";

// @sealed
class class0 {
   x; y; a0;
   constructor(a0) {
      this.a0 = a0;
      this.x = a0;
      this.y = -a0;
   }
   getSUM() {
      return this.x + this.y;
   }
}
   
// @sealed
class class1 extends class0 {
   a1;
   constructor(a0, a1) {
      super(a0);
      this.a1 = a1;
   }
}
   
// @sealed
class class2 extends class1 {
   a2;
   constructor(a0, a1, a2) {
      super(a0, a1);
      this.a2 = a2;
   }
}
   
// @sealed
class class3 extends class2 {
   a3;
   constructor(a0, a1, a2, a3) {
      super(a0, a1, a2);
      this.a3 = a3;
   }
}
   
// @sealed
class class4 extends class3 {
   a4;
   constructor(a0, a1, a2, a3, a4) {
      super(a0, a1, a2, a3);
      this.a4 = a4;
   }
}
   
// @sealed
class class5 extends class4 {
   a5;
   constructor(a0, a1, a2, a3, a4, a5) {
      super(a0, a1, a2, a3, a4);
      this.a5 = a5;
   }
}
   
// @sealed
class class6 extends class5 {
   a6;
   constructor(a0, a1, a2, a3, a4, a5, a6) {
      super(a0, a1, a2, a3, a4, a5);
      this.a6 = a6;
   }
}
   
// @sealed
class class7 extends class6 {
   a7;
   constructor(a0, a1, a2, a3, a4, a5, a6, a7) {
      super(a0, a1, a2, a3, a4, a5, a6);
      this.a7 = a7;
   }
}
   
// @sealed
class class8 extends class7 {
   a8;
   constructor(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
      super(a0, a1, a2, a3, a4, a5, a6, a7, a8);
      this.a8 = a8;
   }
}
   
// @sealed
class class9 extends class8 {
   a9;
   constructor(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      super(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      this.a9 = a9;
   }
}

function classpoly(CNT, nbobj) {
   const K = CNT / 10;
   let res = 0;
   
   const os = [new class0(10),
	       new class1(1,1),
	       new class2(2,2,2),
	       new class3(3,3,3,3),
	       new class4(4,4,4,4,4),
	       new class5(5,5,5,5,5,5),
	       new class6(6,6,6,6,6,6,6),
	       new class7(7,7,7,7,7,7,7,7),
	       new class8(8,8,8,8,8,8,8,8,8),
	       new class9(9,9,9,9,9,9,9,9,9,9)];
   
   for (let j = 0, i = 0; j < CNT; j++, i++) {
      if (i === K) { 
	 console.log(j);
	 i = 0;
      }
      
      for (let m = 0, k = 0; m < 50000; m++) {
	 const o = os[k];
	 res += (o.x - o.y);
	 k++;
	 if (k === nbobj) k = 0;
      }
   }

   return res;
}

console.log(process.argv);
const N = ((process.argv[2] === "fprofile") ? 100 : ((process.argv[2] === "nbobj") ? 10000 : (process.argv[2] ? parseInt(process.argv[2]) : 10000)));
const nbobj = (process.argv[2] === "nbobj") ? parseInt(process.argv[3]) : 4;

console.log("class-poly(", N, ",", nbobj, ")..." );
console.log(classpoly(N, nbobj));

