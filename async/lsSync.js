/*=====================================================================*/
/*    .../diffusion/article/jsasync/bench/jsbench/async/lsSync.js      */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Sun Jan  8 13:54:48 2023                          */
/*    Last change :  Fri Jun 16 11:48:07 2023 (serrano)                */
/*    Copyright   :  2023 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    LS implementation using the Node fs api.                         */
/*=====================================================================*/
"use strict";

/*---------------------------------------------------------------------*/
/*    The module                                                       */
/*---------------------------------------------------------------------*/
const fs = require("fs");
const path = require("path");

/*---------------------------------------------------------------------*/
/*    EntryDiff ...                                                    */
/*---------------------------------------------------------------------*/
// @sealed
class EntryDiff {
   kind;
   a;
   b;

   constructor(kind, a, b) {
      this.kind = kind;
      this.a = a;
      this.b = b;
   }

   update() {
   }
}

/*---------------------------------------------------------------------*/
/*    Entry ...                                                        */
/*---------------------------------------------------------------------*/
// @sealed
class Entry {
   host;
   path;
   relpath;
   mode;
   diff;

   constructor(path, mode) {
      this.path = path;
      this.relpath = "";
      this.mode = mode;
   }

   dup(diff) {
      return this;
   }

   count() {
      return 0;
   }
   
   rebase(base) {
      // Rebase a directory, i.e., remove the base prefix from
      // all entries and assign the the relpath property.
      this.relpath = this.path.substring(base.length + 1);
   }

   toJSON() {
      return "";
   }
}

/*---------------------------------------------------------------------*/
/*    Ghost ...                                                        */
/*---------------------------------------------------------------------*/
// @sealed
class Ghost extends Entry {
   constructor(path) {
      super(path, 0);
   }
}

/*---------------------------------------------------------------------*/
/*    File ...                                                         */
/*---------------------------------------------------------------------*/
// @sealed
class File extends Entry {
   size;
   ctime;
   
   constructor(path, mode, size, ctime) {
      super(path, mode);
      this.size = size;
      this.ctime = ctime;
   }

   dup(diff) {
      const n = new File(this.path, this.mode, this.size, this.ctime);
      n.diff = diff;
      return n;
   }
   
   count() {
      return 1;
   }

   extern() {
      return "";
   }
   
   toJSON() {
      return `{"F":"${this.relpath}","m":${this.mode},"s":${this.size},"c":${this.ctime}}`;
   }
}

/*---------------------------------------------------------------------*/
/*    Directory ...                                                    */
/*---------------------------------------------------------------------*/
// @sealed
class Directory extends Entry {
   entries;
   
   constructor(path, mode, entries) {
      super(path, mode);
      this.entries = entries;
   }

   dup(diff) {
      const n = new Directory(this.path, this.mode, []);
      n.diff = diff;
      return n;
   }
   
   count() {
      return this.entries.reduce((acc, cur) => acc + cur.count(), 1);
   }
   
   rebase(base) {
      super.rebase(base);
      this.entries.forEach(e => e.rebase(base));
   }
   
   toJSON() {
      return `{"D":"${this.path}","m":${this.mode},"e":[${this.entries.map(e=>e.toJSON()).join(",")}]}`;
   }
}

/*---------------------------------------------------------------------*/
/*    MMASK ...                                                        */
/*---------------------------------------------------------------------*/
const MMASK = (1 << 16) -1;

/*---------------------------------------------------------------------*/
/*    pathJoin ...                                                     */
/*---------------------------------------------------------------------*/
function pathJoin(base, file) {
   return base + "/" + file;
}
   
/*---------------------------------------------------------------------*/
/*    statToFile ...                                                   */
/*---------------------------------------------------------------------*/
function statToFile(name, stat) {
   return new File(name, stat.mode & MMASK, stat.size, Math.round(stat.mtimeMs));
}

/*---------------------------------------------------------------------*/
/*    statToDir ...                                                    */
/*---------------------------------------------------------------------*/
function statToDir(name, stat, entries) {
   return new Directory(name, stat.mode & MMASK, entries);
}

/*---------------------------------------------------------------------*/
/*    directoryEntries ...                                             */
/*---------------------------------------------------------------------*/
function directoryEntries(dirname) {
   const entries = fs.readdirSync(dirname);

   if (!entries) {
      throw new Error(`readdir error ${dirname}`);
   } else {
      const sorted = entries.sort((x, y) => x.localeCompare(y));

      return sorted.map(filename => {
	 const apath = pathJoin(dirname, filename);
	 const stat = fs.lstatSync(apath);
	 if (!stat) {
	    return new Ghost(apath);
	 } else if (stat.isDirectory()) {
	    return statToDir(apath, stat, directoryEntries(apath));
	 } else {
	    return statToFile(apath, stat);
	 }
      });
   }
}

/*---------------------------------------------------------------------*/
/*    nodelsSync ...                                                   */
/*---------------------------------------------------------------------*/
function nodelsSync(name) {
   return new Promise((res, rej) => {
      const stat = fs.lstatSync(name);
      if (!stat) {
	 rej(stat);
      } else if (stat.isDirectory()) {
	 res(statToDir(name, stat, directoryEntries(name)));
      } else {
	 res(statToFile(name, stat));
      }
   });
}


/*---------------------------------------------------------------------*/
/*    root                                                             */
/*---------------------------------------------------------------------*/
const root = path.dirname(path.dirname(module.filename));

/*---------------------------------------------------------------------*/
/*    main                                                             */
/*---------------------------------------------------------------------*/
async function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      res = await nodelsSync(root);
   }

   console.log("res=", res.count());
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 200;

main("lsSync", N); 
