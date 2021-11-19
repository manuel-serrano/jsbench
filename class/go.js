// Go board game
"use strict";

let M = 0;
function log(m) {
   console.log(M++ + " " + m);
}

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
const SIZE = 9;
//const GAMES = 200;
const GAMES = 1;
const KOMI = 7.5;
const EMPTY = 0, WHITE = 1, BLACK = 2;
const SHOW = {EMPTY: '.', WHITE: 'o', BLACK: 'x'};
const PASS = -1;
const MAXMOVES = SIZE * SIZE * 3;
let TIMESTAMP = 0;
let MOVES = 0;
const None = undefined;

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function to_pos(x, y) {
   return y * SIZE + x;
}

function to_xy(pos) {
   const y = pos / SIZE;
   const x = pos % SIZE;
   return [x, y];
}

// @record
class Square {
   #board;
   pos;
   timestamp;
   #removestamp;
   zobrist_strings;
   neighbours;
   color;
   temp_ledges;
   ledges;
   used;
   #reference;
   
   constructor(board, pos) {
      this.#board = board;
      this.pos = pos;
      this.timestamp = TIMESTAMP;
      this.#removestamp = TIMESTAMP;
      this.zobrist_strings = [random_randrange(2147483647),
			      random_randrange(2147483647),
			      random_randrange(2147483647)];
   }
   
   set_neighbours() {
      let x = this.pos % SIZE;
      let y = Math.floor(this.pos / SIZE);
      this.neighbours = [];
      
      for (let d of DIRECTIONS) {
	 const [dx, dy] = d;
	 const newx = x + dx; 
	 const newy = y + dy;
	 
	 if ((0 <= newx && newx < SIZE) && (0 <= newy && newy < SIZE)) {
	    this.neighbours = this.neighbours.concat(this.#board.squares[to_pos(newx, newy)]);
	 }
      }
   }

   move(color) {
      TIMESTAMP += 1;
      MOVES += 1;
      this.#board.zobrist.update(this, color);
      this.color = color;
      this.#reference = this;
      this.ledges = 0;
      this.used = true;
      for (let neighbour of this.neighbours) {
	 const neighcolor = neighbour.color;
	 if (neighcolor === EMPTY) {
	    this.ledges += 1;
	 } else {
	    const neighbour_ref = neighbour.find(true);
	    if (neighcolor === color) {
	       if (neighbour_ref.#reference.pos !== this.pos) {
		  this.ledges += neighbour_ref.ledges;
		  neighbour_ref.#reference = this;
	       }
	       this.ledges -= 1;
	    } else {
	       neighbour_ref.ledges -= 1;
	       if (neighbour_ref.ledges === 0) {
		  neighbour.remove(neighbour_ref, true);
	       }
	    }
	 }
      }
//      log("add.0")
      this.#board.zobrist.add();
   }

   remove(reference, update) {
      this.#board.zobrist.update(this, EMPTY);
      this.#removestamp = TIMESTAMP;
      if (update) {
	 this.color = EMPTY;
//	 log("add.2")
	 this.#board.emptyset.add(this.pos);
//            if color == BLACK:
//                this.#board.black_dead += 1
//            else:
//                this.#board.white_dead += 1
      }
      for (let neighbour of this.neighbours) {
	 if (neighbour.color !== EMPTY && neighbour.#removestamp !== TIMESTAMP) {
	    let neighbour_ref = neighbour.find(update);
	    if (neighbour_ref.pos === reference.pos) {
	       neighbour.remove(reference, update);
	    } else {
	       if (update) {
		  neighbour_ref.ledges += 1;
	       }
	    }
	 }
      }
   }

   find(update) {
      let reference = this.#reference;
      if (reference.pos !== this.pos) {
	 reference = reference.find(update);
	 if (update) {
	    this.#reference = reference;
	 }
      }
	 
      return reference;
   }

   __repr__() {
      return `<Square(${to_xy(this.pos)})>`;
   }
}


// @record
class EmptySet {
   #board;
   empties;
   #empty_pos;
   
   constructor(board) {
      this.#board = board;
      this.empties = EmptySet.#iota(SIZE * SIZE);
      this.#empty_pos = EmptySet.#iota(SIZE * SIZE);
   }
   
   static #iota(size) {
      const a = new Array(size);
      for (let i = 0; i < size; i++) {
	 a[i] = i;
      }
      return a;
   }

   random_choice() {
      let choices = this.empties.length;
      while (choices) {
//      	 log("random_choice " + choices);
	 let i = Math.floor(Math_random() * choices);
	 let pos = this.empties[i];
//	 log("random_choice " + i + " " + pos);
 	 if (this.#board.useful(pos)) {
//	    log("random_choice, return " + pos);
	    return pos;
	 }
	 choices -= 1;
	 this.#set(i, this.empties[choices]);
	 this.#set(choices, pos);
      }
      return PASS;
   }

   add(pos) {
//      log("add " + pos)
      this.#empty_pos[pos] = this.empties.length;
      this.empties = this.empties.concat(pos);
   }

   remove(pos) {
      this.#set(this.#empty_pos[pos], this.empties[this.empties.length - 1]);
      this.empties.pop();
   }

   #set(i, pos) {
//      log("set " + pos + " " + i)
      this.empties[i] = pos;
      this.#empty_pos[pos] = i;
   }
}

// @record
class ZobristHash {
   #board;
   #hash_set;
   hash;
   zobrist;
   
   constructor(board) {
      this.#board = board;
      this.#hash_set = new Set();
      this.hash = 1;
      for (let square of this.#board.squares) {
	 this.hash = ZobristHash.#xor(this.hash, square.zobrist_strings[EMPTY]);
      }
      this.#hash_set.clear();
//      log("add.3")
      this.#hash_set.add(this.hash);
   }

   static #xor(val1, val2) {
      //log("xor " + val1 + " " + val2 + " " +
	  //(((val1 & ((1<<30)-1)) + (val2 & ((1<<30)-1))) & ((1<<30)-1)));
      return (((val1 & ((1<<30)-1)) + (val2 & ((1<<30)-1))) & ((1<<30)-1));
   }
   
   update(square, color) {
      this.hash = ZobristHash.#xor(this.hash, square.zobrist_strings[square.color]);
      this.hash = ZobristHash.#xor(this.hash, square.zobrist_strings[color]);
   }

   add() {
//      log("set.add " + this.hash)
      this.#hash_set.add(this.hash);
   }

   dupe() {
      return this.#hash_set.has(this.hash);
   }
}

// @record
class Board {
   squares;
   emptyset;
   color;
   finished;
   #lastmove;
   history;
   #white_dead;
   #black_dead;
   zobrist;
   
   constructor() {
      this.squares = new Array(SIZE * SIZE);
      for (let i = 0; i < SIZE * SIZE; i++) {
      	 this.squares[i] = new Square(this, i);
      }
      for (let square of this.squares) {
	 square.set_neighbours();
      }
      this.reset();
   }

   reset() {
      for (let square of this.squares) {
	 square.color = EMPTY;
	 square.used = false;
      }
      
      this.emptyset = new EmptySet(this);
      this.zobrist = new ZobristHash(this);
      this.color = BLACK;
      this.finished = false;
      this.#lastmove = -2;
      this.history = [];
      this.#white_dead = 0;
      this.#black_dead = 0;
   }

   move(pos) {
//      log("move.pos=" + pos);
      let square = this.squares[pos];
      if (pos !== PASS) {
//	 log("move.pos.2=" + pos);
	 square.move(this.color);
	 this.emptyset.remove(square.pos);
      } else if (this.#lastmove === PASS) {
	 this.finished = true;
      } 
      if (this.color === BLACK) {
	 this.color = WHITE;
      } else {
	 this.color = BLACK;
      }
      this.#lastmove = pos;
      this.history = this.history.concat(pos);
   }

   random_move() {
      return this.emptyset.random_choice();
   }

   #useful_fast(square) {
      if (!square.used) {
	 for (let neighbour of square.neighbours) {
	    if (neighbour.color === EMPTY) {
	       return true
	    }
	 }
      }
      return false;
   }

   useful(pos) {
      TIMESTAMP += 1;
      let square = this.squares[pos];
      if (this.#useful_fast(square)) {
	 return true;
      }
      let old_hash = this.zobrist.hash;
      this.zobrist.update(square, this.color);
      let empties = 0;
      let opps = 0;
      let weak_opps = 0;
      let neighs = 0;
      let weak_neighs = 0;
      
      for (let neighbour of square.neighbours) {
	 let neighcolor = neighbour.color;
	 if (neighcolor === EMPTY) {
	    empties += 1;
	    continue;
	 }
	 let neighbour_ref = neighbour.find();
	 if (neighbour_ref.timestamp !== TIMESTAMP) {
	    if (neighcolor === this.color) {
	       neighs += 1;
	    } else {
	       opps += 1;
	    }
	    neighbour_ref.timestamp = TIMESTAMP;
	    neighbour_ref.temp_ledges = neighbour_ref.ledges;
	 }
	 neighbour_ref.temp_ledges -= 1;
	 if (neighbour_ref.temp_ledges === 0) {
	    if (neighcolor === this.color) {
	       weak_neighs += 1;
	    } else {
	       weak_opps += 1;
	       neighbour_ref.remove(neighbour_ref, false);
	    }
	 }
      }
      let dupe = this.zobrist.dupe();
      this.zobrist.hash = old_hash;
      let strong_neighs = neighs - weak_neighs;
      let strong_opps = opps - weak_opps;
//      log("useful dupe=" + dupe + " " + empties + " " +weak_opps + " " 
//	  + strong_neighs + " " + strong_opps + " " + weak_neighs );
      return !dupe && (empties || weak_opps || (strong_neighs && (strong_opps || weak_neighs)));
   }

   useful_moves() {
      return this.emptyset.empties.filter(pos => this.useful(pos));
   }

   replay(history) {
      for (let pos of history) {
	 this.move(pos);
      }
   }

   score(color) {
      let count;
      if (color === WHITE) {
	 count = KOMI + this.#black_dead;
      } else {
	 count = this.#white_dead;
      }
      for (let square of this.squares) {
	 let squarecolor = square.color;
	 if (squarecolor === color) {
	    count += 1;
	 } else if (squarecolor === EMPTY) {
	    let surround = 0;
	    for (let neighbour of square.neighbours) {
	       if (neighbour.color === color) {
		  surround += 1;
	       }
	    }
	    if (surround === square.neighbours.length) {
	       count += 1;
	    }
	 }
      }
      return count;
   }

   __repr__() {
      return "board";
   }
}

// @record
class UCTNode {
   #bestchild;
   #pos;
   wins;
   losses;
   #pos_child;
   #parent;
   unexplored;
   
   constructor() {
      this.#bestchild = None;
      this.#pos = -1;
      this.wins = 0;
      this.losses = 0;
      this.#pos_child = new Array(SIZE * SIZE).fill(None);
      this.#parent = None;
   }

   play(board) {
        // uct tree search
        let color = board.color;
        let node = this;
        let path = [node];
//	log("avant while")
        while (true) {
	   let pos = node.select(board);
//	   log("play.pos=" + pos);
	   if (pos === PASS) {
//	      log("BREAK.1")
	      break;
	   }
//	   log("play.move " + pos);
	   board.move(pos);
	   let child = node.#pos_child[pos];
	   if (!child) {
	      child = new UCTNode();
	      node.#pos_child[pos] = child;
	      child.unexplored = board.useful_moves();
	      child.#pos = pos;
	      child.#parent = node;
	      path = path.concat(child);
//	      log("BREAK.2")
	      break;
	   }
	   path = path.concat(child);
	   node = child;
	}
//	log("apres while")
	this.#random_playout(board);
//	log("apres playout")
	this.#update_path(board, color, path);
//	log("apres update")
   }

   select(board) {
      // select move; unexplored children first, then according to uct value """
      if (this.unexplored) {
	 let i = random_randrange(this.unexplored.length);
	 let pos = this.unexplored[i];
	 this.unexplored[i] = this.unexplored[this.unexplored.length - 1];
	 this.unexplored.pop();
	 return pos;
      } else if (this.#bestchild) {
	 return this.#bestchild.pos;
      } else {
	 return PASS;
      }
   }
	    
   #random_playout(board) {
      // random play until both players pass
      for (let x = 0; x < MAXMOVES; x++) { // XXX while not this.#finished?
	 if (board.finished) {
//	    log("random_playout finished " + x)
	    break;
	 }
	 board.move(board.random_move());
      }
   }

   #update_path(board, color, path) {
      // update win/loss count along path
      let wins = board.score(BLACK) >= board.score(WHITE);
      for (let node of path) {
	 if (color === BLACK) {
	    color = WHITE;
	 } else {
	    color = BLACK;
	 }
	 if (wins == (color === BLACK)) {
	    node.wins += 1;
	 } else {
	    node.losses += 1;
	 }
	 if (node.parent) {
	    node.parent.bestchild = node.parent.best_child();
	 }
      }
   }
	    
   score() {
      let winrate = this.wins / (this.wins + this.losses);
      let parentvisits = this.#parent.wins + this.#parent.losses;
      if (!parentvisits) {
	 return winrate;
      }
      let nodevisits = this.wins + this.losses;
      return winrate + Math.sqrt((Math.log(parentvisits)) / (5 * nodevisits));
   }

   best_child() {
      let maxscore = -1;
      let maxchild = None;
      for (let child of this.#pos_child) {
	 if (child && child.score() > maxscore) {
	    maxchild = child;
	    maxscore = child.score();
	 }
      }
      return maxchild;
   }
   
   best_visited() {
      let maxvisits = -1;
      let maxchild = None;
//      log("best_visited " + this.#pos_child.length);
      for (let child of this.#pos_child) {
	 // if child:
	 // print to_xy(child.pos), child.wins, child.losses, child.score()
	 if (child && (child.wins + child.losses) > maxvisits) {
	    maxvisits = (child.wins + child.losses);
 	    maxchild = child;
	 }
      }
								  
      return maxchild;
   }
}

// def user_move(board):
//     while True:
//         text = input('?').strip()
//         if text == 'p':
//             return PASS
//         if text == 'q':
//             raise EOFError
//         try:
//             x, y = [int(i) for i in text.split()]
//         except ValueError:
//             continue
//         if not (0 <= x < SIZE and 0 <= y < SIZE):
//             continue
//         pos = to_pos(x, y)
//         if board.useful(pos):
//             return pos

function computer_move(board) {
   let pos = board.random_move();
   if (pos === PASS) {
      return PASS;
   }
   let tree = new UCTNode();
   tree.unexplored = board.useful_moves();
   let nboard = new Board();
   for (let game = 0; game < GAMES; game++) {
//      log("for.1");
      let node = tree;
//      log("for.2");
      nboard.reset();
//      log("for.3");
      nboard.replay(board.history);
//      log("for.4");
      node.play(nboard);
//      log("for.5");
   }
   return tree.best_visited().pos;
}

function versus_cpu() {
   random_seed(1);
   const board = new Board();
   return computer_move(board);
}

const N = 
   (process.argv[1] === "fprofile") 
   ? 2
   : process.argv[2] ? parseInt(process.argv[2]) : 25000;

const runner = new Runner();

function main(runner,args) {
   for (let i = 0; i < N; i++) {
      runner.bench_func('go', versus_cpu);
   }
   return runner.bench_func('go', versus_cpu);
}

main(runner, {});
     
