// create chaosgame-like fractals
// Copyright (C) 2005 Carl Friedrich Bolz for the Python version
// Copyright (c) 2021 Manuel Serrano for the JavaScript port
"use strict";

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
   return rnd[ rndi++ % rnd.length ];
}

function random_randrange(rng) {
   return Math.floor(Math_random() * rng);
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
      return proc(...args);
   }
}
   
//////////////////////////////////////////////////////////////////////////////
const DEFAULT_THICKNESS = 0.25;
const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 256;
const DEFAULT_ITERATIONS = 5000;
const DEFAULT_RNG_SEED = 1234;


// @record
class GVector {
   x;
   y;
   z;
   
   constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
   }
   
   Mag() {
      return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
   }
   
   dist(other) {
      return Math.sqrt((this.x - other.x) ** 2 
		       + (this.y - other.y) ** 2 
		       + (this.z - other.z) ** 2 );
   }
   
   __add__(other) {
      if (!other instanceof GVector) {
	 throw new TypeError("Can't add GVector to " + other);
      }
      const v = new GVector(this.x + other.x, this.y + other.y, this.z + other.z);
      return v;
   }
   
   __sub__(other) {
      return this.__add__(other.__mul__(-1));
   }
     
   __mul__(other) {
      const v = new GVector(this.x * other, this.y * other, this.z * other);
      return v;
   }
   
   linear_combination(other, l1, l2) {
      const v = new GVector(this.x * l1 + other.x * l2,
	 this.y * l1 + other.y * l2,
	 this.z * l1 + other.z * l2);
      
      return v;
   }
   
   toString() {
      return `<${this.x},${this.y},${this.z}>`;
   }
      
   __repr__() {
      return `new GVector(${this.x},${this.y},${this.z})`;
   }
}

// @record
class Spline {
   // Class for representing B-Splines and NURBS of arbitrary degree
   #knots;
   #points;
   #degree;
   
   constructor(points, degree, knots) {
      // Creates a Spline.
      // points is a list of GVector, degree is the degree of the Spline.
      
      if (points.length > knots.length - degree + 1) {
	 throw new TypeError("too many control points");
      } else if (points.length < knots.legnth - degree + 1) {
	 throw new TypeError("not enough control points");
      }
      
      let last = knots[0];
      
      for (let cur of knots) {
	 if (cur < last) {
	    throw new TypeError("knots not strictly increasing");
	 }
	 last = cur;
      }
      
      this.#knots = knots;
      this.#points = points;
      this.#degree = degree;
   }
   
   GetDomain() {
      // Returns the domain of the B-Spline
      return [this.#knots[this.#degree - 1], this.#knots[this.#knots.length - this.#degree]];
   }
   
   __call__(u) {
      // Calculates a point of the B-Spline using de Boors Algorithm
      const dom = this.GetDomain();

      if (u < dom[0] || u > dom[1]) {
	 throw new TypeError("Function value not in domain");
      }
      if (u === dom[0]) {
	 return this.#points[0];
      }
      if (u === dom[1]) {
	 return this.#points[this.#points.length - 1];
      }
      const I = this.GetIndex(u);

      const d = new Array(this.#degree + 1);
      for (let ii = 0; ii <= this.#degree; ii++) {
	 d[ii] = this.#points[I - this.#degree + 1 + ii];
      }
      const U = this.#knots;
      for (let ik = 1; ik < this.#degree + 1; ik++) {
	 for (let ii = I - this.#degree + ik + 1; ii < I + 2; ii++) {
	    const ua = U[ii + this.#degree - ik];
	    const ub = U[ii - 1];
	    const co1 = (ua - u) / (ua - ub);
	    const co2 = (u - ub) / (ua - ub);
	    const index = ii - I + this.#degree - ik - 1;
	    d[index] = d[index].linear_combination(d[index + 1], co1, co2);
	 }
      }
      return d[0];
   }
   
   GetIndex(u) {
      let I;
      const dom = this.GetDomain();
      
      for (let ii = this.#degree - 1; ii < this.#knots.length - this.#degree; ii++) {
	 if (u >= this.#knots[ii] && u < this.#knots[ii + 1]) {
	    I = ii;
	    break;
	 } else {
            I = dom[1] - 1;
	 }
      }
      return I
   }
   
   get length() {
      return this.#points.length;
   }
   
   __repr__() {
      return `new Spline(${this.#points},${this.#degree},${this.#knots})`;
   }
   
   min(prop) {
      const points = this.#points;
      let min = points[0][prop];
      for (let i = points.length - 1; i > 0; i--) {
	 if (points[i][prop] < min) min = points[i][prop];
      }
      return min;
   }
   
   max(prop) {
      const points = this.#points;
      let max = points[0][prop];
      for (let i = points.length - 1; i > 0; i--) {
	 if (points[i][prop] > max) max = points[i][prop];
      }
      return max;
   }
}

// @record
class open {
   #buffer = "";
   
   constructor(filename) {
   }
   
   write(m) {
      this.#buffer += m;
   }
   
   close() {
      return this.#buffer;
   }
}

function write_ppm(im, filename) {
   const magic = "P6\n";
   const maxval = 255;
   const w = im.length;
   const h = im[0].length;
   const fp = new open(filename);
   
   fp.write(magic);
   fp.write(`${w} ${h}`);
   fp.write("\n");
   fp.write(`${maxval}`);
   fp.write("\n");
   
   for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
	 const val = im[i][j];
	 fp.write(val ? "*" : " ");
      }
      fp.write("\n");
   }
   
   return console.log(fp.close());
}

// @record
class Chaosgame {
   #splines;
   #thickness;
   #minx;
   #miny;
   #maxx;
   #maxy;
   #height;
   #width;
   #num_trafos;
   #num_total;
   
   constructor(splines, thickness) {
      this.#splines = splines;
      this.#thickness = thickness;
      this.#minx = Chaosgame.#min(splines, "x");
      this.#miny = Chaosgame.#min(splines, "y");
      this.#maxx = Chaosgame.#max(splines, "x");
      this.#maxy = Chaosgame.#max(splines, "y");
      this.#height = this.#maxy - this.#miny;
      this.#width = this.#maxx - this.#minx;
      this.#num_trafos = [];
      const maxlength = thickness * this.#width / this.#height;
      for (let spl of splines) {
	 let length = 0;
	 let curr = spl.__call__(0);
	 for (let i = 1; i < 1000; i++) {
	    const last = curr;
	    const t = 1 / 999 * i;
	    curr = spl.__call__(t);
	    length += curr.dist(last);
	 }
	 this.#num_trafos.push(Math.max(1, Math.floor(length / maxlength * 1.5)));
      }
      this.#num_total = this.#num_trafos.reduce((p,c) => p + c, 0);
   }
   
   static #min(splines, prop) {
      let min = splines[0].min(prop);
      for (let i = splines.length - 1; i > 0; i--) {
	 const aux = splines[i].min(prop);
	 if (aux < min) min = aux;
      }
      return min;
   }

   static #max(splines, prop) {
      let max = splines[0].max(prop);
      for (let i = splines.length - 1; i > 0; i--) {
	 const aux = splines[i].max(prop);
	 if (aux > max) max = aux;
      }
      return max;
   }

   #get_random_trafo() {
      const r = random_randrange(this.#num_total+1);
      let l = 0;
      for (let i = 0; i < this.#num_trafos.length; i++) {
	 if (r >= l && r < l + this.#num_trafos[i]) {
	    return [i, random_randrange(this.#num_trafos[i])];
	 }
	 l += this.#num_trafos[i];
      }
      return [this.#num_trafos.length - 1, random_randrange(this.#num_trafos[this.#num_trafos.length-1])];
   }
   
   #transform_point(point) {
      const x = (point.x - this.#minx) / this.#width;
      const y = (point.y - this.#miny) / this.#height;
      const trafo = this.#get_random_trafo();
      let [start, end] = this.#splines[trafo[0]].GetDomain();
      let length = end - start;
      let seg_length = length / this.#num_trafos[trafo[0]];
      let t = start + seg_length * trafo[1] + seg_length * x;
      let basepoint = this.#splines[trafo[0]].__call__(t);
      let derivative;				   
      
      if (t + 1 / 50000 > end) {
	 const neighbour = this.#splines[trafo[0]].__call__(t - 1 / 50000);
         derivative = neighbour.__sub__(basepoint);
      } else {
	 const neighbour = this.#splines[trafo[0]].__call__(t + 1 / 50000);
         derivative = basepoint.__sub__(neighbour);
      }
      if (derivative.Mag() !== 0) {
	 basepoint.x += derivative.y / derivative.Mag() * (y - 0.5) * this.#thickness;
	 basepoint.y += -derivative.x / derivative.Mag() * (y - 0.5) * this.#thickness;
      }
      this.#truncate(basepoint);
      return basepoint;
   }
   
   #truncate(point) {
      if (point.x >= this.#maxx) 
	 point.x = this.#maxx;
      if (point.y >= this.#maxy)
	 point.y = this.#maxy;
      if (point.x < this.#minx)
	 point.x = this.#minx;
      if (point.y < this.#miny)
	 point.y = this.#miny;
   }
   
   create_image_chaos(w, h, iterations, filename, rng_seed) {
      // Always use the same sequence of random numbers
      // to get reproductible benchmark
      random_seed(rng_seed);
      const im = new Array(w);
      for (let i = 0; i < w; i++) {
	 im[i] = new Array(h).fill(true);
      }
      let point = new GVector((this.#maxx + this.#minx) / 2,
	 (this.#maxy + this.#miny) / 2, 
	 0);
      
      for (let _ = 0; _ < iterations; _++) {
	 point = this.#transform_point(point);
         let x = (point.x - this.#minx) / this.#width * w;
         let y = (point.y - this.#miny) / this.#height * h;
	 x = Math.floor(x);
	 y = Math.floor(y);
	 if (x === w)
	    x -= 1;
	 if (y === h) 
	    y -= 1;
	 im[x][h - y - 1] = false;
      }

      if (filename) {
	 write_ppm(im, filename);
      }
   }
}

function main(runner, args) {
   const splines = [
      new Spline([
	 new GVector(1.597350, 3.304460, 0.000000),
	 new GVector(1.575810, 4.123260, 0.000000),
	 new GVector(1.313210, 5.288350, 0.000000),
	 new GVector(1.618900, 5.329910, 0.000000),
	 new GVector(2.889940, 5.502700, 0.000000),
	 new GVector(2.373060, 4.381830, 0.000000),
	 new GVector(1.662000, 4.360280, 0.000000)],
	 3, [0, 0, 0, 1, 1, 1, 2, 2, 2]),
        new Spline([
	   new GVector(2.804500, 4.017350, 0.000000),
	   new GVector(2.550500, 3.525230, 0.000000),
	   new GVector(1.979010, 2.620360, 0.000000),
	   new GVector(1.979010, 2.620360, 0.000000)],
	   3, [0, 0, 0, 1, 1, 1]),
        new Spline([
	   new GVector(2.001670, 4.011320, 0.000000),
	   new GVector(2.335040, 3.312830, 0.000000),
	   new GVector(2.366800, 3.233460, 0.000000),
	   new GVector(2.366800, 3.233460, 0.000000)],
	   3, [0, 0, 0, 1, 1, 1])
   ];
   
   runner.metadata['chaos_thickness'] = args.thickness;
   runner.metadata['chaos_width'] = args.width;
   runner.metadata['chaos_height'] = args.height;
   runner.metadata['chaos_iterations'] = args.iterations;
   runner.metadata['chaos_rng_seed'] = args.rng_seed;
   
   const chaos = new Chaosgame(splines, args.thickness);

   runner.bench_func('chaos', chaos.create_image_chaos.bind(chaos),
      args.width, args.height, args.iterations,
      args.filename, args.rng_seed);
}

const N = 
   (process.argv[1] === "fprofile") 
   ? 2
   : process.argv[2] ? parseInt(process.argv[2]) : 10;

const runner = new Runner();
for (let i = 0; i < N; i++) {
   main( runner, {iterations: 50000, 
	       	  thickness: DEFAULT_THICKNESS, 
	       	  width: DEFAULT_WIDTH,
	       	  height: DEFAULT_HEIGHT,
	       	  rng_seed: DEFAULT_RNG_SEED,
   });   
}
main( runner, {iterations: 50000, 
	       filename: "yes",
	       thickness: DEFAULT_THICKNESS, 
	       width: 60,
	       height: 40,
	       rng_seed: DEFAULT_RNG_SEED,
});    
