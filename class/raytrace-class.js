// The ray tracer code in this file is written by Adam Burmister. It
// is available in its original form from:
//
//   http://labs.nz.co/raytracer/
//
// It has been modified slightly by Google to work as a standalone
// benchmark, but the all the computational code remains
// untouched. This file also contains a copy of parts of the Prototype
// JavaScript framework which is used by the ray tracer.

//var RayTrace = new BenchmarkSuite('RayTrace', 739989, [
//  new Benchmark('RayTrace', renderScene)
//]);

// Variable used to hold a number that can be used to verify that
// the scene was ray traced correctly.
"use strict";

let checkNumber=0;

// @record
class Color {
   #red;
   #green;
   #blue;
   
   constructor(red, green, blue) {
      this.#red = 0.0;
      this.#green = 0.0;
      this.#blue = 0.0;
   }

   static add(c1, c2) {
      var result = new Color(0, 0, 0);

      result.#red = c1.#red + c2.#red;
      result.#green = c1.#green + c2.#green;
      result.#blue = c1.#blue + c2.#blue;

      return result;
   }

   static addScalar(c1, s) {
      var result = new Color(0, 0, 0);

      result.#red = c1.#red + s;
      result.#green = c1.#green + s;
      result.#blue = c1.#blue + s;

      result.limit();

      return result;
   }


   static subtract(c1, c2) {
      var result = new Color(0, 0, 0);

      result.#red = c1.#red - c2.#red;
      result.#green = c1.#green - c2.#green;
      result.#blue = c1.#blue - c2.#blue;

      return result;
   }

   static multiply(c1, c2) {
      var result = new Color(0, 0, 0);

      result.#red = c1.#red * c2.#red;
      result.#green = c1.#green * c2.#green;
      result.#blue = c1.#blue * c2.#blue;

      return result;
   }

   static multiplyScalar(c1, f) {
      var result = new Color(0, 0, 0);

      result.#red = c1.#red * f;
      result.#green = c1.#green * f;
      result.#blue = c1.#blue * f;

      return result;
   }


   static divideFactor(c1, f) {
      var result = new Color(0, 0, 0);

      result.#red = c1.#red / f;
      result.#green = c1.#green / f;
      result.#blue = c1.#blue / f;

      return result;
   }

   limit() {
      this.#red = (this.#red > 0.0) ? ((this.#red > 1.0) ? 1.0 : this.#red) : 0.0;
      this.#green = (this.#green > 0.0) ? ((this.#green > 1.0) ? 1.0 : this.#green) : 0.0;
      this.#blue = (this.#blue > 0.0) ? ((this.#blue > 1.0) ? 1.0 : this.#blue) : 0.0;
   }

   distance(color) {
      const d = Math.abs(this.#red - color.#red) 
	 + Math.abs(this.#green - color.#green) 
	 + Math.abs(this.#blue - color.#blue);
      	 return d;
   }

   static blend(c1, c2, w) {
      var result = new Color(0, 0, 0);
      result = Color.add(
	 Color.multiplyScalar(c1, 1 - w),
	 Color.multiplyScalar(c2, w));
      return result;
   }

   brightness() {
      var r = Math.floor(this.#red * 255);
      var g = Math.floor(this.#green * 255);
      var b =  Math.floor(this.#blue * 255);
      return (r * 77 + g * 150 + b * 29) >> 8;
   }

   toString() {
      var r = Math.floor(this.#red * 255);
      var g = Math.floor(this.#green * 255);
      var b = Math.floor(this.#blue * 255);

      return "rgb(" + r + "," + g + "," + b + ")";
   }
}

// @record
class Light {
   position;
   color;
   intensity;
   
   constructor(position, color, intensity) {
      this.position = position ;
      this.color = color;
      this.intensity = intensity;
   }

   toString() {
      return 'Light [' + this.position.x + ',' + this.position.y + ',' + this.position.z + ']';
	  }
}

// @record
class Vector {
   x;
   y;
   z;
   
   constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
   }

   copy(vector) {
      this.x = vector.x;
      this.y = vector.y;
      this.z = vector.z;
   }

   normalize() {
      var m =this.magnitude();
      return new Vector(this.x / m, this.y / m, this.z / m);
   }

   magnitude() {
      return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
   }

   cross(w) {
      return new Vector(
	 -this.z * w.y + this.y * w.z,
	 this.z * w.x - this.x * w.z,
-this.y * w.x + this.x * w.y);
   }

   dot(w) {
      return this.x * w.x + this.y * w.y + this.z * w.z;
   }

   static add(v, w) {
      return new Vector(w.x + v.x, w.y + v.y, w.z + v.z);
   }

   static subtract(v, w) {
      if (!w || !v) throw 'Vectors must be defined [' + v + ',' + w + ']';
      return new Vector(v.x - w.x, v.y - w.y, v.z - w.z);
   }

   static multiplyVector(v, w) {
      return new Vector(v.x * w.x, v.y * w.y, v.z * w.z);
   }

   static multiplyScalar(v, w) {
      return new Vector(v.x * w, v.y * w, v.z * w);
   }

   toString() {
      return 'Vector [' + this.x + ',' + this.y + ',' + this.z + ']';
   }
}

// @record
class Ray {
   position;
   direction;
   
   constructor(position, direction) {
      this.position = position;
      this.direction = direction;
   }

   toString() {
      return 'Ray [' + this.position + ',' + this.direction + ']';
   }
}

// @record
class Scene {
   camera = null;
   shapes = [];
   lights = [];
   background;

   constructor() {
      this.camera = new Camera(
	 new Vector(0, 0, -5),
	 new Vector(0, 0, 1),
	 new Vector(0, 1, 0)
	    );
      this.background = new Background(new Color(0, 0, 0.5), 0.2);
   }
}

// @record
class BaseMaterial {
   reflection;
   refraction;
   transparency;
   gloss;
   
   constructor(gloss = 2.0,             // [0...infinity] 0 = matt
      transparency = 0.0,      // 0=opaque
      reflection = 0.0,       // [0...infinity] 0 = no reflection
      refraction = 0.50,
      hasTexture = false) {
   }

   getColor(u, v) {
      throw "Abstract method";
   }

   wrapUp(t) {
      t = t % 2.0;
      if (t < -1) t += 2.0;
      if (t >= 1) t -= 2.0;
      return t;
   }

   toString() {
      return 'Material [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture + ']';
   }
}

// @record
class Solid extends BaseMaterial {
   color;
   
   constructor(color, reflection, refraction, transparency, gloss) {
      super(gloss, transparency, reflection, refraction);
      this.color = color;
   }

   getColor(u, v) {
      return this.color;
   }

   toString() {
      return 'SolidMaterial [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture + ']';
   }
}

// @record
class Chessboard extends BaseMaterial {
   colorEven;
   colorOdd;
   
   constructor(colorEven, colorOdd, 
      reflection, 
      transparency, 
      gloss, 
      density) {
      super(gloss, transparency, reflection, 0.50, true);
      this.colorEven = colorEven;
      this.colorOdd = colorOdd;
   }

   getColor(u, v) {
      const t =this.wrapUp(u * this.density) * this.wrapUp(v * this.density);

      if (t < 0.0)
	 return this.colorEven;
      else
      return this.colorOdd;
   }

   toString() {
      return 'ChessMaterial [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture + ']';
   }
}

// @record
class Shape {
   position;
   material;
      
   constructor(position, material) {
      this.position = position;
      this.material = material;
   }

   intersect(ray) {
      throw "Abstract method";
   }
}

// @record
class Sphere extends Shape {
   constructor(position, radius, material) {
      super(position, material);
   }

   intersect(ray) {
      var info = new IntersectionInfo();
      info.shape = this;

      var dst = Vector.subtract(ray.position, this.position);

      var B = dst.dot(ray.direction);
      var C = dst.dot(dst) - (this.radius * this.radius);
      var D = (B * B) - C;

      if (D > 0) { // intersection!
	 info.isHit = true;
	 info.distance = (-B) - Math.sqrt(D);
	 info.position = Vector.add(
	    ray.position,
	    Vector.multiplyScalar(
	       ray.direction,
	       info.distance
		  )
	       );
	 info.normal = Vector.subtract(
	    info.position,
	    this.position
	       ).normalize();
	 
	 info.color = this.material.getColor(0, 0);
      } else {
	 info.isHit = false;
      }
      return info;
   }

   toString() {
      return 'Sphere [position=' + this.position + ', radius=' + this.radius + ']';
   }
}

// @record
class Plane extends Shape {
   constructor(position, d, material) {
      super(position, material);
   }

   intersect(ray) {
      var info = new IntersectionInfo();

      var Vd = this.position.dot(ray.direction);
      if (Vd == 0) return info; // no intersection

      var t = ( -(this.position.dot(ray.position) + this.d) / Vd);
      if (t <= 0) return info;

      info.shape = this;
      info.isHit = true;
      info.position = Vector.add(
	 ray.position,
	 Vector.multiplyScalar(
	    ray.direction,
	    t
	       )
	    );
      info.normal = this.position;
      info.distance = t;

      if (this.material.hasTexture) {
	 var vU = new Vector(this.position.y, this.position.z, -this.position.x);
	 var vV = vU.cross(this.position);
	 var u = info.position.dot(vU);
	 var v = info.position.dot(vV);
	 info.color = this.material.getColor(u, v);
      } else {
	 info.color = this.material.getColor(0, 0);
      }

      return info;
   }

   toString() {
      return 'Plane [' + this.position + ', d=' + this.d + ']';
   }
}

// @record
class IntersectionInfo {
   isHit;
   hitCount;
   shape;
   position;
   normal;
   color;
   distance;
   
   constructor(isHit, hitCount, shape,
      position, normal, color, distance) { 
      this.isHit = isHit;
      this.hitCount = hitCount;
      this.shape = shape;
      this.position = position;
      this.normal = normal;
      this.color = color;
      this.distance = distance;
   }

   initialize() {
      this.color = new Color(0, 0, 0);
   }

   toString() {
      return 'Intersection [' + this.position + ']';
   }
}

// @record
class Camera {
   equator = null;
   screen = null;
   position;
   lookAt;
   up;

   constructor(position, lookAt, up) {
      this.position = position;
      this.lookAt = lookAt;
      this.up = up;
      this.equator = this.lookAt.normalize().cross(this.up);
      this.screen = Vector.add(this.position, this.lookAt);
   }

   getRay(vx, vy) {
      var pos = Vector.subtract(
	 this.screen,
	 Vector.subtract(
	    Vector.multiplyScalar(this.equator, vx),
	    Vector.multiplyScalar(this.up, vy)
	       )
	    );
      pos.y = pos.y * -1;
      var dir = Vector.subtract(
	 pos,
	 this.position
	    );

      var ray = new Ray(pos, dir.normalize());

      return ray;
   }

   toString() {
      return 'Ray []';
   }
}

// @record
class Background {
   color;
   ambience;
   
   constructor(color, ambience) {
      this.color = color;
      this.ambience = ambience;
   }
}

// @record
class Options {
   canvasWidth;
   canvasHeight;
   pixelWidth;
   pixelHeight;
   renderDiffuse;
   renderHighlights;
   renderShadows;
   renderReflections;
   rayDepth;
   
   constructor(canvasWidth,
      canvasHeight,
      pixelWidth,
      pixelHeight,
      renderDiffuse,
      renderHighlights,
      renderShadows,
      renderReflections,
      rayDepth) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.pixelWidth = pixelWidth;
      this.pixelHeight = pixelHeight;
      this.renderDiffuse = renderDiffuse;
      this.renderHighlights = renderHighlights;
      this.renderShadows = renderShadows;
      this.renderReflections = renderReflections;
      this.rayDepth = rayDepth;     
   }
}

// @record
class Engine {
   canvas = null; /* 2d context we can render to */
   options = null;

   constructor(options) {
      var newOptions = new Options( 100, 100, 2, 2,
                    false, false, false, false, 2 );
      if (options === null || options === undefined) {
	 options = newOptions;
      }
      this.options = options;

      this.options.canvasHeight /= this.options.pixelHeight;
      this.options.canvasWidth /= this.options.pixelWidth;

      /* TODO: dynamically include other scripts */
   }

   setPixel(x, y, color) {
      var pxW, pxH;
      pxW = this.options.pixelWidth;
      pxH = this.options.pixelHeight;

      if (this.canvas) {
	 this.canvas.fillStyle = color.toString();
	 this.canvas.fillRect(x * pxW, y * pxH, pxW, pxH);
      } else {
	 if (x === y) {
	    checkNumber += color.brightness();
	 }
	 // print(x * pxW, y * pxH, pxW, pxH);
      }
   }

   renderScene(scene, canvas) {
      checkNumber = 0;
      /* Get canvas */
      if (canvas) {
	 this.canvas = canvas.getContext("2d");
      } else {
	 this.canvas = null;
      }

      var canvasHeight = this.options.canvasHeight;
      var canvasWidth = this.options.canvasWidth;

      for (var y = 0; y < canvasHeight; y++) {
	 for (var x = 0; x < canvasWidth; x++) {
	    var yp = y * 1.0 / canvasHeight * 2 - 1;
	    var xp = x * 1.0 / canvasWidth * 2 - 1;

	    var ray = scene.camera.getRay(xp, yp);

	    var color = this.getPixelColor(ray, scene);

	    this.setPixel(x, y, color);
	 }
      }
      return (checkNumber !== 2321);
   }

   getPixelColor(ray, scene) {
      var info = this.testIntersection(ray, scene, null);
      if (info.isHit) {
	 var color = this.rayTrace(info, ray, scene, 0);
	 return color;
      }
      return scene.background.color;
   }

   testIntersection(ray, scene, exclude) {
      var hits = 0;
      var best = new IntersectionInfo();
      best.distance = 2000;

      for (var i = 0; i < scene.shapes.length; i++) {
	 var shape = scene.shapes[i];

	 if (shape != exclude) {
	    var info = shape.intersect(ray);
	    if (info.isHit && info.distance >= 0 && info.distance < best.distance) {
	       best = info;
	       hits++;
	    }
	 }
      }
      best.hitCount = hits;
      return best;
   }

   getReflectionRay(P, N, V) {
      var c1 = -N.dot(V);
      var R1 = Vector.add(
	 Vector.multiplyScalar(N, 2 * c1),
	 V
	    );
      return new Ray(P, R1);
   }

   rayTrace(info, ray, scene, depth) {
      // Calc ambient
      var color = Color.multiplyScalar(info.color, scene.background.ambience);
      var oldColor = color;
      var shininess = ( Math.pow(10, info.shape.material.gloss + 1));

      for (var i = 0; i < scene.lights.length; i++) {
	 var light = scene.lights[i];

	 // Calc diffuse lighting
	 var v = Vector.subtract(
	    light.position,
	    info.position
	       ).normalize();

	 if (this.options.renderDiffuse) {
	    var L = ( v.dot(info.normal));
	    if (L > 0.0) {
	       color = Color.add(
		  color,
		  Color.multiply(
		     info.color,
		     Color.multiplyScalar(
			light.color,
			L
			   )
			)
		     );
	    }
	 }

	 // The greater the depth the more accurate the colours, but
	 // this is exponentially (!) expensive
	 if (depth <= this.options.rayDepth) {
	    // calculate reflection ray
	    if (this.options.renderReflections && info.shape.material.reflection > 0) {
	       var reflectionRay = this.getReflectionRay(info.position, info.normal, ray.direction);
	       var refl = this.testIntersection(reflectionRay, scene, info.shape);

	       if (refl.isHit && refl.distance > 0) {
		  refl.color = this.rayTrace(refl, reflectionRay, scene, depth + 1);
	       } else {
		  refl.color = scene.background.color;
	       }

	       color = Color.blend(
		  color,
		  refl.color,
		  info.shape.material.reflection
		     );
	    }

	    // Refraction
	    /* TODO */
	 }

	 /* Render shadows and highlights */

	 var shadowInfo = new IntersectionInfo();

	 if (this.options.renderShadows) {
	    var shadowRay = new Ray(info.position, v);

	    shadowInfo = this.testIntersection(shadowRay, scene, info.shape);
	    if (shadowInfo.isHit && shadowInfo.shape != info.shape /*&& shadowInfo.shape.type != 'PLANE'*/) {
	       var vA = Color.multiplyScalar(color, 0.5);
	       var dB = ( (0.5 * Math.pow(shadowInfo.shape.material.transparency, 0.5)));
	       color = Color.addScalar(vA, dB);
	    }
	 }

	 // Phong specular highlights
	 if (this.options.renderHighlights && !shadowInfo.isHit && info.shape.material.gloss > 0) {
	    var Lv = Vector.subtract(
	       info.shape.position,
	       light.position
		  ).normalize();

	    var E = Vector.subtract(
	       scene.camera.position,
	       info.shape.position
		  ).normalize();

	    var H = Vector.subtract(
	       E,
	       Lv
		  ).normalize();

	    var glossWeight = ( Math.pow(Math.max(info.normal.dot(H), 0), shininess));
	    color = Color.add(
	       Color.multiplyScalar(light.color, glossWeight),
	       color
		  );
	 }
      }
      color.limit();
      return color;
   }
}

function renderScene() {
   var scene = new Scene();

   scene.camera = new Camera(
      new Vector(0, 0, -15),
      new Vector(-0.2, 0, 5),
      new Vector(0, 1, 0)
	 );

   scene.background = new Background(
      new Color(0.5, 0.5, 0.5),
      0.4
      );

   var sphere = new Sphere(
      new Vector(-1.5, 1.5, 2),
      1.5,
      new Solid(
	 new Color(0, 0.5, 0.5),
	 0.3,
	 0.0,
	 0.0,
	 2.0
	 )
	 );

   var sphere1 = new Sphere(
      new Vector(1, 0.25, 1),
      0.5,
      new Solid(
	 new Color(0.9, 0.9, 0.9),
	 0.1,
	 0.0,
	 0.0,
	 1.5
	 )
	 );

   var plane = new Plane(
      new Vector(0.1, 0.9, -0.5).normalize(),
      1.2,
      new Chessboard(
	 new Color(1, 1, 1),
	 new Color(0, 0, 0),
	 0.2,
	 0.0,
	 1.0,
	 0.7
	 )
	 );

   scene.shapes.push(plane);
   scene.shapes.push(sphere);
   scene.shapes.push(sphere1);

   var light = new Light(
      new Vector(5, 10, -1),
      new Color(0.8, 0.8, 0.8)
	 );

   var light1 = new Light(
      new Vector(-3, 5, -15),
      new Color(0.8, 0.8, 0.8),
      100
      );

   scene.lights.push(light);
   scene.lights.push(light1);

   var imageWidth = 100; // $F('imageWidth');
   var imageHeight = 100; // $F('imageHeight');
   var pixelSize = [5,5];//"5,5".split(','); //  $F('pixelSize').split(',');
   var renderDiffuse = true; // $F('renderDiffuse');
   var renderShadows = true; // $F('renderShadows');
   var renderHighlights = true; // $F('renderHighlights');
   var renderReflections = true; // $F('renderReflections');
   var rayDepth = 2;//$F('rayDepth');

   var raytracer = new Engine(
      new Options(
	 imageWidth,
	 imageHeight,
	 pixelSize[0],
	 pixelSize[1],
	 renderDiffuse,
	 renderHighlights,
	 renderShadows,
	 renderReflections,
	 rayDepth
	    )
	 );
   return raytracer.renderScene(scene, null);
}

// Benchmark execution
var go;

function Benchmark( name, opt1, opt2, it, go ) {
   return { go: go, iteration: it };
}

function BenchmarkSuite( name, val, benchs ) {
   go = function() {
      let num = benchs[ 0 ].iteration;
      let n = Math.round( num / 10 ), i = 1;
      console.log( name + " (" + num + ")" );
      while( num-- > 0 ) {
	 if( num % n == 0 ) { console.log( i++ ); }
	 benchs[ 0 ].go()
      };
   }
}  

const NNN = (process.argv[ 1 ] === "fprofile") 
      ? 200
      : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000;

var DeltaBlue = new BenchmarkSuite('raytrace', [66118], [
  new Benchmark('raytrace', true, false, NNN, renderScene)
]);

go();
