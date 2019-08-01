/* The Computer Language Benchmarks Game
   http://benchmarksgame.alioth.debian.org/
   contributed by Isaac Gouy 
   *reset* 
*/
"use strict";

const handler = {
   get: function( target, key ) { return target[ key ] },
   set: function( target, key, val ) { target[ key ] = val; return true }
}

function TreeNode(left,right,item){
   this.left = left;
   this.right = right;
}

TreeNode.prototype.itemCheck = function(){
   if (this.left==null) return 1;
   else return 1 + this.left.itemCheck() + this.right.itemCheck();
}

function bottomUpTree(depth){
   if (depth>0){
      return new Proxy( new TreeNode(
          		   bottomUpTree(depth-1)
         		      ,bottomUpTree(depth-1)
      	     			  ), handler );
   }
   else {
      return new Proxy( new TreeNode(null,null), handler );
   }
}


var minDepth = 4;

function binarytree(n) {
   var check = bottomUpTree(stretchDepth).itemCheck();
   var maxDepth = Math.max(minDepth + 2, n);
   var stretchDepth = maxDepth + 1;
   var longLivedTree = bottomUpTree(maxDepth);
   
   console.log("stretch tree of depth " + stretchDepth + "\t check: " + check);
   
   for (var depth=minDepth; depth<=maxDepth; depth+=2){
      var iterations = 1 << (maxDepth - depth + minDepth);

      check = 0;
      for (var i=1; i<=iterations; i++){
	 check += bottomUpTree(depth).itemCheck();
      }
      console.log(iterations + "\t trees of depth " + depth + "\t check: " + check);
   }
   console.log("long lived tree of depth " + maxDepth + "\t check: " 
   + longLivedTree.itemCheck());
}


binarytree(18);
