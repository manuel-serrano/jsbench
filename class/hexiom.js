// Solver of Hexiom board game.
// 
// Benchmark from Laurent Vaucher.
// 
// Source: https://github.com/slowfrog/hexiom : hexiom2.py, level36.txt
// 
// (Main function tweaked by Armin Rigo.)
"use strict";

let M = 0;
function log(m) {
   console.log(M++ + " " + m);
}

const None = undefined;

const rnd = [0.8770995586538219, 0.7467351610524278, 0.23249549103551334,
             0.8231245166729784, 0.318460008277772, 0.2765477273038345,
             0.15513674037304556, 0.5188230101572456, 0.8788570276828749,
             0.2771601105468162, 0.9700492755370445, 0.8001550435089296,
             0.7591487382348389, 0.7128849223781772, 0.2847622862480405,
             0.3495062563333224, 0.350737326476135, 0.37827307050035947,
             0.40377484699886984, 0.7561712012422137, 0.05001545140986119,
             0.19141191672133837, 0.7972550777705643, 0.7261414251877654,
             0.49509481270569133, 0.3870731798871761, 0.3420524761742225,
             0.614596488706114, 0.06691072791205287, 0.8160151489153575,
             0.2524686736299045, 0.9440102865658748, 0.562750309502124,
             0.4849641646654178, 0.767134802773192, 0.881210317779896,
             0.7615118924349136, 0.9222715431462375, 0.4000333274714804,
             0.6403689196521272, 0.19943165322739242, 0.3700826030085248,
             0.44052396269539557, 0.9585803914622313, 0.08296752492104076,
             0.7252862489434361, 0.3080866477955536, 0.43370485139717574,
             0.10355931897813422, 0.7118614947944235, 0.18987605217372816,
             0.1535747708536567, 0.9032734115157618, 0.9871311299442924,
             0.879716196041422, 0.3983682242214532, 0.37420430936580723,
             0.2217686717499833, 0.012964712461905887, 0.4411150372778601,
             0.0377838201996795, 0.2654333860918104, 0.38512532337807365,
             0.6005341297018035, 0.7503975512228894, 0.15226012615126563,
             0.4817444474816995, 0.5119094431921418, 0.07453166883184187,
             0.8817777749531799, 0.15227836237860767, 0.2739633225248956,
             0.2518603774960434, 0.5928023250740032, 0.23254371352146552,
             0.33482790241708416, 0.3180885740174393, 0.5406303613170191,
             0.7685327538142599, 0.42164789299557354, 0.2524918556457813,
             0.9584088059879881, 0.5752226638492303, 0.15576526716154315,
             0.9455399359322805, 0.454938859424991, 0.5541334913829963,
             0.3197442448324264, 0.6767075316406356, 0.5670982038449022,
             0.7608592825759478, 0.7144913518403151, 0.8325315899367126,
             0.1459846054883602, 0.31502548154211857, 0.5829291406939408,
             0.29824473163962584, 0.796769929023818, 0.09483858342042127,
             0.372776400937129, 0.6785477035113366, 0.24711694579902893,
             0.6467397234620246, 0.9304080814730413, 0.8399192713386935,
             0.8792834369834901, 0.26523598342446425, 0.15800784489047148,
             0.41991379830050923, 0.03376873723872413, 0.579655737886045,
             0.6724056539462906, 0.9921775432267121, 0.15487840173527523,
             0.8281709211078337, 0.9377174786933313, 0.6098172611602662,
             0.38230441202516874, 0.25746172352575775, 0.28652479233524053,
             0.9494026158700709, 0.018321005636044316, 0.0010161441755556241,
             0.7819342058067835, 0.16430561112440453, 0.3160416257176742,
             0.364863346035063, 0.4625503432296917]; 
let rndi = 0;
function Math_random() {
   const r = rnd[rndi++];
   if (rndi === rnd.length) rndi = 0;
   //log("Math_random " + r + " " + rndi);
   return r;
}

function random_randrange(rng) {
   const r = Math.floor(Math_random() * rng);
   //log( "randrange r=" + r + " rng="+ rng + " " + rndi);
   return r;
}

function random_seed(seed) {
   rndi = seed;
}

function iota(size) {
   const a = new Array(size);
   for (let i = 0; i < size; i++) {
      a[i] = i;
   }
   return a;
}

function str(tiles) {
   return "[" + tiles.join(", ") + "]";
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
   
//////////////////////////////////////////////////////////////////////////////
const DEFAULT_LEVEL = 25;

//##################################
// @record
class Dir {
   x;
   y;
   
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
}

const DIRS = [new Dir(1, 0), 
	      new Dir(-1, 0),
	      new Dir(0, 1),
	      new Dir(0, -1),
	      new Dir(1, 1),
	      new Dir(-1, -1)];

const EMPTY = 7;

//##################################


// @record
class Done {
   count;
   cells;
   
   static MIN_CHOICE_STRATEGY = 0;
   static MAX_CHOICE_STRATEGY = 1;
   static HIGHEST_VALUE_STRATEGY = 2;
   static FIRST_STRATEGY = 3;
   static MAX_NEIGHBORS_STRATEGY = 4;
   static MIN_NEIGHBORS_STRATEGY = 5;
   
   constructor(count, empty) {
      this.count = count;
      if (empty) {
      	 this.cells = None;
      } else {
	 const arr = new Array(count);
	 for (let i = 0; i < count; i++) {
	    arr[i] = [0, 1, 2, 3, 4, 5, 6, EMPTY];
	 }
	 this.cells = arr;
      }
   }

   clone() {
      const ret = newDone(this.count, true);
      ret.cells = new Array(this.count);
      for (let i = 0; i < this.count; i++) {
	 ret.cells[i] = this.cells[i].concat();
      }
      return ret;
   }

   __getitem__(i) {
      /* log("__getitem__ " + i); */
      return this.cells[i];
   }

   set_done(i, v) {
      /* log("set_done i=" + i + " v=" + v); */
      this.cells[i] = [v];
   }

   already_done(i) {
      /* log("already_done i=" + i + " => " + this.cells[i].length); */
      return this.cells[i].length === 1;
   }

   remove(i, v) {
      /* log(">>> remove " + i + " " + v + " " + this.cells[i].length ); */
      const j = this.cells[i].indexOf(v);
      if (j >= 0) {
	 this.cells[i].splice(j, 1);
      	 /* log("<<< remove " + this.cells[i].length); */
	 return true;
      } else {
	 return false;
      }
   }

   remove_all(v) {
      for (let i = 0; i < this.count; i++) {
	 this.remove(i, v);
      }
   }

   remove_unfixed(v) {
      let changed = false;
      for (let i = 0; i < this.count; i++) {
	 if (!this.already_done(i)) {
	    /* log("remove_unfixed " + i + " " + v); */
	    if (this.remove(i, v)) {
	       changed = true;
	    }
	 }
      }
      return changed;
   }

   filter_tiles(tiles) {
      for (let v = 0; v < 8; v++) {
	 if (tiles[v] === 0) {
	    this.remove_all(v);
	 }
      }
      /* log("filter_tiles " + str(tiles)); */
   }

   next_cell_min_choice() {
      let minlen = 10;
      let mini = -1;
      for (let i = 0; i < this.count; i++) {
	 const cil = this.cells[i].length;
	 if (1 < cil && cil < minlen) {
	    minlen = cil;
	    mini = i;
	 }
      }
      return mini;
   }

   next_cell_max_choice() {
      let maxlen = 1;
      let maxi = -1;
      for (let i = 0; i < this.count; i++) {
	 const cil = this.cells[i].length;
	 if (maxlen < cil) {
	    maxlen = cil;
	    maxi = i;
	 }
      }
      return maxi;
   }

   next_cell_highest_value() {
      let maxval = -1;
      let maxi = -1;
      for (let i = 0; i < this.count; i++) {
	 if (!this.already_done(i)) {
	    let maxvali = maxval;
	    for (let k of this.cells[i]) {
	       if (k !== EMPTY && k > maxvali) {
		  maxvali = k;
	       }
	    }

	    if (maxval < maxvali) {
	       maxval = maxvali;
	       maxi = i;
	    }
	 }
      }
		  
      return maxi;
   }

   next_cell_first() {
      for (let i = 0; i < this.count; i++) {
	 if (!this.already_done(i)) {
	    return i;
	 }
      }
      return -1;
   }

   next_cell_max_neighbors(pos) {
      let maxn = -1;
      let maxi = -1;
      for (let i = 0; i < this.count; i++) {
	 if (!this.already_done(i)) {
	    const cells_around = pos.hex.get_by_id(i).links;
	    let n = 0;
	    
	    for (let nid of cells_around) {
	       if (this.already_done(nid) && this[nid][0] !== EMPTY) {
		  n++
	       }
	    }
	    
	    if (n > maxn) {
	       maxn = n;
	       maxi = i;
	    }
	 }
      }
      return maxi;
   }

   next_cell_min_neighbors(pos) {
      let minn = 7;
      let mini = -1;
      for (let i = 0; i < this.count; i++) {
	 if (!this.already_done(i)) {
	    let cells_around = pos.hex.get_by_id(i).links;
	    let n = 0;
	    
	    for (let nid of cells_around) {
	       if (this.already_done(nid) && this[nid][0] !== EMPTY) {
		  n++
	       }
	    }
	    
	    if (n < minn) {
	       minn = n;
	       mini = i;
	    }
	 }
      }
      return mini;
   }

   next_cell(pos, strategy) {
      switch(strategy) {
      	 case Done.HIGHEST_VALUE_STRATEGY:
            return this.next_cell_highest_value();
	 case Done.MIN_CHOICE_STRATEGY:
            return this.next_cell_min_choice();
	 case Done.MAX_CHOICE_STRATEGY:
            return this.next_cell_max_choice();
	 case Done.FIRST_STRATEGY:
	    return this.next_cell_first();
	 case Done.MAX_NEIGHBORS_STRATEGY:
            return this.next_cell_max_neighbors(pos);
        case Done.MIN_NEIGHBORS_STRATEGY:
	   return this.next_cell_min_neighbors(pos);
        default:
	   throw new TypeError(`Wrong strategy: ${strategy}`);
      }
   }
}

function newDone(count, empty) {
   var o = new Done(count, empty);
   return new Proxy(o, {
      get: (target, prop) => prop in target ? target[prop] : target.__getitem__(prop)
   });
}

//##################################


// @record
class Node {
   pos;
   id;
   links;
   
   constructor(pos, id, links) {
      this.pos = pos;
      this.id = id;
      this.links = links;
   }
}

// ##################################

// @record
class Matrix {
   #values;
   
   constructor() {
      this.#values = {};
   }
   
   ref(pos) {
      return this.#values[`${pos[0]}-${pos[1]}`];
   }
   
   set(pos, val) {
      this.#values[`${pos[0]}-${pos[1]}`] = val;
   }
}

// @record
class Hex {
   size;
   count;
   nodes_by_id;
   nodes_by_pos;

   constructor(size) {
      this.size = size;
      this.count = 3 * size * (size - 1) + 1;
      this.nodes_by_id = new Array(this.count).fill(None);
      this.nodes_by_pos = new Matrix(undefined);
      let id = 0;
      for (let y = 0; y < size; y++) {
	 for (let x = 0; x < size + y; x++) {
	    const pos = [x, y];
	    const node = new Node(pos, id, []);
	    /* log("node_by_pos1.set " + pos[0] + " " + pos[1]); */
	    this.nodes_by_pos.set(pos, node);
	    this.nodes_by_id[node.id] = node;
	    id += 1;
	 }
      }
      for (let y = 1; y < size; y++) {
	 for (let x = y; x < size * 2 - 1; x++) {
	    const ry = size + y - 1;
	    const pos = [x, ry];
	    const node = new Node(pos, id, []);
	    /* log("node_by_pos2.set " + pos[0] + " " + pos[1]); */
	    this.nodes_by_pos.set(pos, node);
	    this.nodes_by_id[node.id] = node;
	    id += 1;
	 }
      }
   }

   link_nodes() {
      for (let node of this.nodes_by_id) {
	 const [x, y] = node.pos;
	 /* log("link_nodes x=" + x + " y=" + y); */
	 for (let dir of DIRS) {
	    const nx = x + dir.x;
	    const ny = y + dir.y;
	    /* log("link_nodes.2 nx=" + nx + " ny=" + ny); */
	    if (this.contains_pos([nx, ny])) {
	       /* log("links_nodes.3 " + this.nodes_by_pos.ref([nx, ny]).id); */
	       node.links = node.links.concat(this.nodes_by_pos.ref([nx, ny]).id);
	    }
	 }
      }
   }

   contains_pos(pos) {
      return this.nodes_by_pos.ref(pos) !== undefined;
   }

   get_by_pos(pos) {
      return this.nodes_by_pos.ref(pos);
   }

   get_by_id(id) {
      return this.nodes_by_id[id];
   }
}


// ##################################
// @record
class Pos {
   hex;
   tiles;
   done;
   
   constructor(hex, tiles, done) {
      this.hex = hex;
      this.tiles = tiles;
      this.done = done || newDone(hex.count);
      /* log("new pos " + str(tiles)); */
   }

   clone() {
      return new Pos(this.hex, this.tiles, this.done.clone());
   }
}

// ##################################


function constraint_pass(pos, last_move) {
   /* log("constraint_pass"); */
   let changed = false;
   let left = pos.tiles.concat();
   let done = pos.done;

   /* log("constraint_pass left=" + str(left)); */
   /* log("constraint_pass pos.tiles.0=" + str(pos.tiles)); */
   
    // Remove impossible values from free cells
    let free_cells = (last_move === None)
       ? iota(done.count) 
       : pos.hex.get_by_id(last_move).links;
    for (let i of free_cells) {
       if (!done.already_done(i)) {
	  /* log("constraint_pass i=" + i); */
	  let vmax = 0;
	  let vmin = 0;
	  let cells_around = pos.hex.get_by_id(i).links;
	  for (let nid of cells_around) {
	     /* log("constraint_pass nid=" + nid); */
	     if (done.already_done(nid)) {
		if (done[nid][0] !== EMPTY) {
		   vmin += 1;
		   vmax += 1;
		}
	     } else {
		vmax += 1;
	     }
	  }

	  /* log("constraint_pass vmin=" + vmin + " vmax=" + vmax); */
	  for (let num = 0; num < 7; num++) {
	     if ((num < vmin) || (num > vmax)) {
		/* log("constraint_pass, remove " + i + " " + num); */
		if (done.remove(i, num)) {
		   changed = true;
		}
	     }
	  }
       }
    }

    
    // Computes how many of each value is still free
    for (let cell of done.cells) {
       if (cell.length === 1) {
	  /* log("constraint_pass -=1"); */
	  left[cell[0]] -= 1;
       }
    }

    /* log("constraint_pass left.2=" + str(left)); */
    /* log("constraint_pass pos.tiles.1=" + str(pos.tiles)); */
    
    for (let v = 0; v < 8; v++) {
        // If there is none, remove the possibility from all tiles
        if ((pos.tiles[v] > 0) && (left[v] === 0)) {
	   if (done.remove_unfixed(v)) {
	      /* log("constraint_pass changed"); */
	      changed = true;
	   }
	} else {
	   let possible = 0;
	   for (let cell of done.cells) {
	      if (cell.indexOf(v) >= 0) possible++;
	   }
	   /* log("constraint_pass sum=" + possible); */
	   // If the number of possible cells for a value is exactly the number of available tiles
	   // put a tile in each cell
	   if (pos.tiles[v] === possible) {
	      for (let i = 0; i < done.count; i++) {
		 let cell = done.cells[i];
		 if ((!done.already_done(i)) && (cell.indexOf(v) >= 0)) {
		    /* log("constraint_pass !done && has " + i + " " + v); */
		    done.set_done(i, v);
		    changed = true;
		 }
	      }
	   }
	}
    }

    // Force empty or non-empty around filled cells
    let filled_cells = last_move === None ? iota(done.count) : [last_move];
    for (let i of filled_cells) {
       if (done.already_done(i)) {
	  let num = done[i][0];
	  let empties = 0;
	  let filled = 0;
	  let unknown = [];
	  let cells_around = pos.hex.get_by_id(i).links;
	  /* log("constraint_pass num=" + num); */
	  for (let nid of cells_around) {
	     if (done.already_done(nid)) {
		if (done[nid][0] === EMPTY) {
		   empties += 1;
		} else { 
		   filled += 1;
		}
	     } else {
		unknown = unknown.concat(nid);
	     }
	  }
	  /* log("constraint_pass empties=" + empties + " " + filled + " " + unknown.length)
 */	  if (unknown.length > 0) {
	     if (num === filled) {
		for (let u of unknown) {
		   if (done[u].indexOf(EMPTY) >= 0) {
		      done.set_done(u, EMPTY);
		      changed = true;
		      // else:
		      //   raise Exception("Houston, we've got a problem")
		   }
		}
	     } else if (num == filled + unknown.length) {
		for (let u of unknown) {
		   if (done.remove(u, EMPTY)) {
		      changed = true;
		   }
		}
	     }
	  }
       }
    }

    /* log("constraint_pass " + changed); */
    return changed;
}

const ASCENDING = 1;
const DESCENDING = -1;


function find_moves(pos, strategy, order) {
   /* log("find_moves " + strategy); */
   let done = pos.done;
   let cell_id = done.next_cell(pos, strategy);
   /* log("find_move " + cell_id); */
   if (cell_id < 0) {
      return [];
   }

   if (order === ASCENDING) {
      return done[cell_id].map(v => [cell_id, v]);
   } else { 
        // Try higher values first and EMPTY last
	let moves = done[cell_id]
	   .filter(v => v !== EMPTY)
	   .map(v => [cell_id, v])
	   .reverse();
	/* log("--- find_move " + moves.length); */
	if (done[cell_id].indexOf(EMPTY) >= 0) {
	   moves = moves.concat([[cell_id, EMPTY]]);
	}
	/* log("<<< find_move " + moves.length); */
	return moves;
   }
}


function play_move(pos, move) {
   const [cell_id, i] = move;
   pos.done.set_done(cell_id, i);
}

const CHAR = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function print_pos(pos, output) {
   let hex = pos.hex;
   let done = pos.done;
   let size = hex.size;
   let buffer = "";
   let c;

   output.buffer += "\n";
   
   for (let y = 0; y < size; y++) {
      buffer += new Array(size - y - 1).fill(" ").join("");
      for (let x = 0; x < size + y; x++) {
	 const pos2 = [x, y];
	 const id = hex.get_by_pos(pos2).id;
	 if (done.already_done(id)) {
	    c = (done[id][0] !== EMPTY) ? CHAR[done[id][0]] : ".";
	 } else {
	    c = "?";
	 }
	 buffer += c;
	 if (x < size + y - 1) buffer += " ";
      }
      buffer += "\n";
   }
   for (let y = 1; y < size; y++) {
      buffer += new Array(y).fill(" ").join("");
      for (let x = y; x < size * 2 - 1; x++) {
	 const ry = size + y - 1;
	 const pos2 = [x, ry];
	 const id = hex.get_by_pos(pos2).id;
	 if (done.already_done(id)) {
	    c = done[id][0] !== EMPTY ? CHAR[done[id][0]] : ".";
	 } else {
	    c = "?";
	 }
	 buffer += c;
	 if (x < size * 2 - 2) buffer += " ";
      }
      buffer += "\n";
   }
   
   /* log("print_pos buffer=[" + buffer + "]"); */
   return output.buffer += buffer;
}

const OPEN = 0;
const SOLVED = 1;
const IMPOSSIBLE = -1;


function solved(pos, output, verbose) {
   const hex = pos.hex;
   const tiles = pos.tiles.concat();
   let done = pos.done;
   let exact = true;
   let all_done = true;
   
   /* log("solved hex=" + hex.count); */
   /* log("solved tiles=" + str(tiles)); */
   for (let i = 0; i < hex.count; i++) {
      if (done[i].length === 0) {
	 /* log("solve.1"); */
	 return IMPOSSIBLE;
      } else if (done.already_done(i)) {
	 const num = done[i][0];
	 tiles[num] -= 1;
	 /* log("solve.2 " + num + " " + tiles[num]); */
	 if (tiles[num] < 0) {
	 /* log("solve.3"); */
	    return IMPOSSIBLE;
	 }
	 let vmax = 0;
	 let vmin = 0;
	 if (num !== EMPTY) {
	 /* log("solve.4"); */
	    const cells_around = hex.get_by_id(i).links;
	    for (let nid of cells_around) {
	       if (done.already_done(nid)) {
	 /* log("solve.5"); */
		  if (done[nid][0] !== EMPTY) {
	 /* log("solve.6"); */
		     vmin += 1;
		     vmax += 1;
		  }
	       } else {
	 /* log("solve.7"); */
		  vmax += 1;
	       }
	    }

	    if ((num < vmin) || (num > vmax)) {
	 /* log("solve.8"); */
	       return IMPOSSIBLE;
	    }
	    if (num !== vmin) {
	 /* log("solve.9"); */
	       exact = false;
	    }
	 }
      } else {
	 /* log("solve.10"); */
	 all_done = false;
      }
   }

   if (!all_done || !exact) {
	 /* log("solve.11"); */
      return OPEN;
   }

   print_pos(pos, output);
	 /* log("solve.12"); */
   return SOLVED;
}


function solve_step(prev, strategy, order, output, first) {
   let pos;
   if (first) {
      /* log("solve_step first"); */
      pos = prev.clone();
      while (constraint_pass(pos)) {
	 /* log("solve_step.while0"); */
	 ;
      }
   } else {
      /* log("solve_step pas first"); */
      pos = prev;
   }

   let moves = find_moves(pos, strategy, order);
   /* log("solve_step " + moves.length); */
   /* log("solve_step output=" + output); */
   if (moves.length === 0) {
      return solved(pos, output);
   } else {
      for (let move of moves) {
	 // print("Trying (%d, %d)" % (move[0], move[1]))
	 let ret = OPEN;
	 let new_pos = pos.clone();
	 /* log("solve_step.2 move=" + move); */
	 play_move(new_pos, move);
	 /* log("solve_step.3 move=" + move); */
	 // print_pos(new_pos)
	 while (constraint_pass(new_pos, move[0])) {
	    /* log("solve_step.while"); */
	    ;
	 }
	 /* log("avant solved"); */
	 let cur_status = solved(new_pos, output);
	 /* log("cur_status=" + cur_status); */
	 if (cur_status !== OPEN) {
	    ret = cur_status;
	 } else {
	    ret = solve_step(new_pos, strategy, order, output, false);
	 }
	 /* log("ret=" + ret); */
	 if (ret == SOLVED) {
	    return SOLVED;
	 }
      }
   }
   return IMPOSSIBLE;
}


function check_valid(pos) {
   let hex = pos.hex;
   let tiles = pos.tiles;
   // fill missing entries in tiles
   let tot = 0;
   for (let i = 0; i < 8; i++) {
      /* log("check_valid i=" + i + " " + tiles[i]); */
      if (tiles[i] > 0) {
	 tot += tiles[i];
      } else {
	 /* log("check_valid reset tiles " + i); */
	 tiles[i] = 0;
      }
   }
   /* log("check_valid " + str(tiles)); */
   // check total
   if (tot !== hex.count) {
      throw new TypeError(
	 `Invalid input. Expected ${hex.count} tiles, got ${tot}`);
   }
}


function solve(pos, strategy, order, output) {
   /* log("solve output=" + output); */
   check_valid(pos);
   return solve_step(pos, strategy, order, output, true);
}


// TODO Write an 'iterator' to go over all x,y positions

function read_file(file) {
   let lines = file.split("\n").map(s => s.replaceAll("\r\n", ""));
   let size = parseInt(lines[0]);
   let hex = new Hex(size);
   let linei = 1;
   let tiles = new Array(8).fill(0);
   let done = newDone(hex.count);
   let inctile;
   /* log("read_file size=" + size); */
   for (let y = 0; y < size; y++) {
      /* log("read_file line0=[" + lines[linei] + "]"); */
      let line = lines[linei].substring(size - y - 1);
      /* log("read_file line=[" + line + "]"); */
      let p = 0;
      for (let x = 0; x < size + y; x++) {
	 let tile = line.substring(p,p + 2);
	 /* log("read_file.1 tile={" + tile + "}"); */
	 p += 2;
	 if (tile[1] === ".") {
	    inctile = EMPTY;
	 } else {
	    inctile = parseInt(tile);
	 }
	 tiles[inctile] += 1;
	 /* log("tiles=" + tiles[inctile] + " " + inctile); */
	 // Look for locked tiles
	 if (tile[0] === "+") {
	    // print("Adding locked tile: %d at pos %d, %d, id=%d" %
	    //      (inctile, x, y, hex.get_by_pos((x, y)).id))
	    done.set_done(hex.get_by_pos([x, y]).id, inctile);
	 }
      }

      linei += 1;
   }
   /* log("read_file tiles.1="+ str(tiles)); */
      
   for (let y = 1; y < size; y++) {
      let ry = size - 1 + y;
      let line = lines[linei].substring(y);
      /* log("read_file line.2=" + line); */
      let p = 0;
      for (let x = y; x < size * 2 - 1; x++) {
	 let tile = line.substring(p,p + 2);
      	 /* log("read_file tile.2=" + tile); */
	 p += 2;
	 if (tile[1] === ".") {
	    inctile = EMPTY;
	 } else {
	    inctile = parseInt(tile);
	 }
	 tiles[inctile] += 1;
	 /* log("tiles.2=" + tiles[inctile] + " " + inctile); */
	 // Look for locked tiles
	 if (tile[0] === "+") {
	    // print("Adding locked tile: %d at pos %d, %d, id=%d" %
	    //      (inctile, x, ry, hex.get_by_pos((x, ry)).id))
	    done.set_done(hex.get_by_pos([x, ry]).id, inctile);
	 }
      }
      linei += 1;
   }
   /* log("read_file tiles.2="+ str(tiles)); */
   hex.link_nodes();
   done.filter_tiles(tiles);
   return new Pos(hex, tiles, done);
}

function solve_file(file, strategy, order, output) {
   const pos = read_file(file);
   return solve(pos, strategy, order, output);
}

const LEVELS = [];

LEVELS[2] = [`
2
  . 1
 . 1 1
  1 .
`, `
 1 1
. . .
 1 1
`];

LEVELS[10] = [`
3
  +.+. .
 +. 0 . 2
 . 1+2 1 .
  2 . 0+.
   .+.+.
`, `
  . . 1
 . 1 . 2
0 . 2 2 .
 . . . .
  0 . .
`];

LEVELS[20] = [`
3
   . 5 4
  . 2+.+1
 . 3+2 3 .
 +2+. 5 .
   . 3 .
`, `
  3 3 2
 4 5 . 1
3 5 2 . .
 2 . . .
  . . .
`];

LEVELS[25] = [`
3
   4 . .
  . . 2 .
 4 3 2 . 4
  2 2 3 .
   4 2 4
`, `
  3 4 2
 2 4 4 .
. . . 4 2
 . 2 4 3
  . 2 .
`];

LEVELS[30] = [`
4
    5 5 . .
   3 . 2+2 6
  3 . 2 . 5 .
 . 3 3+4 4 . 3
  4 5 4 . 5 4
   5+2 . . 3
    4 . . .
`, `
   3 4 3 .
  4 6 5 2 .
 2 5 5 . . 2
. . 5 4 . 4 3
 . 3 5 4 5 4
  . 2 . 3 3
   . . . .
`];

LEVELS[36] = [`
4
    2 1 1 2
   3 3 3 . .
  2 3 3 . 4 .
 . 2 . 2 4 3 2
  2 2 . . . 2
   4 3 4 . .
    3 2 3 3
`, `
   3 4 3 2
  3 4 4 . 3
 2 . . 3 4 3
2 . 1 . 3 . 2
 3 3 . 2 . 2
  3 . 2 . 2
   2 2 . 1
`];


function main_hexiom(loops, level) {
   let [board, solution] = LEVELS[level];
   const order = DESCENDING;
   const strategy = Done.FIRST_STRATEGY;
   let output = {buffer: ""};

   board = board.trim();
   const expected = solution;

   for (let _ = 0; _ < loops; _++) {
      output.buffer = "";
      solve_file(board, strategy, order, output);
   }

   let res = output.buffer;
   if (res !== expected) {
      throw new TypeError(`got a wrong answer: [${res}]\nexpected: [${expected}]`);
   }
   return res;
}

//////////////////////////////////////////////////////////////////////////////
const N = 
   (process.argv[1] === "fprofile") 
   ? 2
   //: process.argv[2] ? parseInt(process.argv[2]) : 100;
   : process.argv[2] ? parseInt(process.argv[2]) : 100;

const runner = new Runner();

function main(runner,args) {
   for (let i = 0; i < N; i++) {
      runner.bench_func('hexiom', main_hexiom, 10, DEFAULT_LEVEL);
   }
   console.log(runner.bench_func('hexiom', main_hexiom, 1, DEFAULT_LEVEL));
}

main(runner, {});
     
