"use strict";

/*---------------------------------------------------------------------*/
/*    builtin requires                                                 */
/*---------------------------------------------------------------------*/
const requires = {
};

/*---------------------------------------------------------------------*/
/*    fake _require system                                             */
/*---------------------------------------------------------------------*/
function _require( packet ) {
   return requires[ packet ];
}


function _module( name, fun ) {
   let module = { exports: {} };
   
   fun( module, module.exports );
   
   requires[ name ] = module.exports;
}

/*---------------------------------------------------------------------*/
/*    underscore ...                                                   */
/*---------------------------------------------------------------------*/
const underscore = function( module, exports ) {
//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  
  // Current version.
  _.VERSION = '1.9.1';

  
  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we’re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".
  var restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating assigner functions.
  var createAssigner2 = function(keysFunc, defaults) {
    return function(obj) {
/*        #:tprint( "assigner2 ...." );                                */
/*        #:js-debug-object( obj, ">>> obj ");                         */
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
/*        #:js-debug-object( obj, "<<< obj ");                         */
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);
  _.extend2 = createAssigner2(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  function dup( obj ) {
/*      #:tprint( ">>> dup...." );                                     */
     var o = _.extend2({}, obj);
/*      #:tprint( "--- dup...." );                                     */
/*      #:js-debug-object( obj, "OBJ=" );                              */
/* 		      #:js-debug-object( o, "DUP=" );                  */
/*      #:tprint( "<<< dup...." );                                     */
				       return o;
  }
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : dup( obj );
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
     return (obj === void 0);
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());
}

_module( "underscore", underscore );

/*---------------------------------------------------------------------*/
/*    callsite                                                         */
/*---------------------------------------------------------------------*/
function callsite( module, exports ) {

/* module.exports = function(){                                        */
/*   var orig = Error.prepareStackTrace;                               */
/*   Error.prepareStackTrace = function(_, stack){ return stack; };    */
/*   var err = new Error;                                              */
/*   Error.captureStackTrace(err, arguments.callee);                   */
/*   var stack = err.stack;                                            */
/*   Error.prepareStackTrace = orig;                                   */
/*   return stack;                                                     */
/* };                                                                  */
module.exports = function(){
/*   var orig = Error.prepareStackTrace;                               */
/*   Error.prepareStackTrace = function(_, stack){ return stack; };    */
/*   var err = new Error;                                              */
/*   Error.captureStackTrace(err, arguments.callee);                   */
  var stack = [];
  return stack;
};
}

_module( "callsite", callsite );

/*---------------------------------------------------------------------*/
/*    contract.imp.js                                                  */
/*---------------------------------------------------------------------*/
function contractimp( module, exports ) {
"use strict";

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint eqeqeq:true, bitwise:true, forin:true, immed:true, latedef: true, newcap: true undef: true, strict: true */
/*global exports, _require */

var __ = _require('underscore'); // '__' because node already binds '_' 
var grabStack = _require('callsite');

exports.privates = {};

// Throughout this file, `var self = this` indicates that the function is
// intended to be called (and thought of) as a method (regardless of whether 
// `self` is actually used within the body of the function.



//--
//
// Helper Functions
//

function isMissing(v) { 
  return __.isUndefined(v) || v === null;
}

function clone(obj) {
  var other = __.clone(obj);
  other.__proto__ = obj.__proto__;
  return other;
}

function gentleUpdate(obj, spec) { // aka, not an imperative update. aka, no bang.
  var other = clone(obj);
  __.each(spec, function(v, k) { other[k] = v; });
  return other;
}

function ith(i) {
  i++;
  switch (i % 10) {
  case 1: return i+"st";
  case 2: return i+"nd";
  case 3: return i+"rd";
  default: return i+"th";
  }
}

function stringify(v) {
   return v.toString();
}

//--
//
// Stack context items
//

var stackContextItems = {
  argument: function (arg) {
    return { short: (__.isNumber(arg) ? ".arg("+arg+")" : "."+arg),
             long: "for the " + (__.isNumber(arg) ? ith(arg) : "`"+arg+"`") + " argument of the call." };
  },
  
  this: { short: ".this",
          long: "for this `this` argument of the call."},
  
  result: { short: ".result",
            long: "for the return value of the call." },
  
  extraArguments: { short: ".extraArguments",
                    long: "for the extra argument array of the call" },
  
  and: function(i) { 
    return { short: ".and("+i+")",
             long: "for the " + ith(i) + " branch of the `and` contract." }; 
  },
  
  or: function(i) { 
    return { short: ".or" }; 
  },
  
  arrayItem: function (i) {
    return { short: "["+i+"]",
             long: "for the " + ith(i) + " element of the array.",
             i: i };
  },
  
  tupleItem: function (i) {
    return { short: "["+i+"]",
             long: "for the " + ith(i) + " element of the tuple." };
  },
  
  hashItem: function (k) {
    return { short: "." + k,
             long: "for the key `" + k + "` of the hash." };
  },
  
  objectField: function (f) {
    return { short: "." + f,
             long: "for the field `" + f + "` of the object." };
  },
  
  silent: { short: "", long: "" } // .silent is special, tested with === in `checkWContext` 
  
};

//--
//
// Error classes
//

var errorMessageInspectionDepth = null;
exports.setErrorMessageInspectionDepth = function(depth) {
  errorMessageInspectionDepth = depth;
}

function cleanStack(stack) {
  var stack = clone(stack);
  stack.shift();
  var irrelevantFileNames = [ /\/contract.face.js$/, /\/contract.impl.js$/, /\/underscore.js$/, 
                              /^native array.js$/, /^module.js$/, /^native messages.js$/, /^undefined$/ ];
  while(!__.isEmpty(stack)) {
    if (__.any(irrelevantFileNames, function (r) { 
      return r.test(stack[0].getFileName()); })) {
      stack.shift();
    } else {
      break;
    }
  }
  return stack;
}

function captureCleanStack() { 
  return cleanStack(grabStack() || []);
}

function prettyPrintStack(stack) {
  return __.map(stack, function(callsite) {
    return "  at " + callsite.getFunctionName() +
          " (" + callsite.getFileName() + ":" + callsite.getLineNumber() + ":" + callsite.getColumnNumber() + ")";
  }).join('\n')
}

function ContractError(/*opt*/ context, /*opt*/ msg) { 
  var self = Error.prototype.constructor.apply(this, [msg]);

  self.constructor = ContractError;
  self.name = 'ContractError';
  self.context = context;
  self.message = '';
  self.stack = null;

  var hasBlame = self.context && self.context.thingName;
  if (hasBlame) self.blame(context);
  if (hasBlame && msg) self.message += ' ';
  if (msg) self.message += msg;
  if (hasBlame || msg) self.message += "\n";

  if (self.context && self.context.wrappedAt && self.context.wrappedAt[0]) {
    var callsite = self.context.wrappedAt[0];
    self.message += "(contract was wrapped at: " + callsite.getFileName() +":"+callsite.getLineNumber() +")\n";
  }

  return self;
}
exports.ContractError = ContractError;

ContractError.prototype = __.extend(Error.prototype, {  

  captureStack: function () {
    var self = this;
    self.renderedStack = prettyPrintStack(cleanStack(grabStack() || []))
    Object.defineProperty(self, 'stack', {
      get: function () {
        return this.name + ": " + this.message + "\n" + self.renderedStack;
      }
    });
  },

  blame: function(context) {
    var self = this; 
    
    self.context = context || self.context;

    var thingNameWithParens = self.context.thingName + (self.context.contract.isFunctionContract ? "()" : "");
  
    if (!self.context.wrapping) {
      self.message += "check on `" + thingNameWithParens + "` failed";
    } else if (self.context.blameMe) {
      self.message += "`" + thingNameWithParens + "` broke its contract";
    } else {
      self.message += "on `" + thingNameWithParens + "`";
    }
  },

  expected: function(expected, data, /*opt*/ context) {
    var self = this; 
    
    self.context = context || self.context;
    self.expected = expected;
    self.data = data;
    self.message += "Expected " + expected + ", but got " + stringify(data) + "\n";
    return this;
  },
  
  fullValue: function(/*opt*/ context) {
    var self = this; 
    
    self.context = context || self.context;
    if (!__.isFunction(self.context.data))    // Don't bother printing functions,
      if (!self.expected ||                   // if expected() has not already printed the value
          !__.isEmpty(self.context.stack))    // or there is a stack, so expected() has printed only 
        //                                       a small piece of the value.
        self.message += "The full value being checked was:\n" + stringify(self.context.data) + "\n";
    return this;
  },
  
  fullContract: function (/*opt*/ context) {
    var self = this; 
    
    self.context = context || self.context;
    
    if (!__.isEmpty(self.context.stack)) {
      var stack = self.context.stack;
      var immediateContext = __.last(stack);

      if (stack[stack.length-2] === stackContextItems.extraArguments) {
        // Special case for error messages of extra arguments
        // Invariant: the immediate context is always a stackContextItems.arrayItem, 
        // which always hash a `i` field

        self.message += "for the " + ith(immediateContext.i) + " extra argument of the call.\n"
        stack = stack.slice(0, -2);

      } else if (immediateContext.long) {
        self.message += immediateContext.long +"\n";
        stack = stack.slice(0, -1);
      }

      if (!__.isEmpty(stack)) {
        var stackStrings = __.map(stack, function(i) { return (i.short ? i.short : i); });
        self.message += ("at position " + stackStrings.join("") +"\n"+
                         "in contract:\n" + self.context.contract.toString() + "\n");
      }
    }
    return this;
  },
  
  fullContractAndValue: function (/*opt*/ context) {
    var self = this;
    
    self.fullContract(context);
    self.fullValue(context);
    return this;
  }
});
                                    
exports.ContractError = ContractError;

function ContractLibraryError(fnName, /*opt*/ context, /*opt*/ msg) { 
  var self = ContractError.call(this, context, msg);
  self.name = 'ContractLibraryError';
  self.functionName = fnName;
  self.message = fnName + ": " + self.message;
  return self;
}
ContractLibraryError.prototype = ContractError.prototype;

exports.privates.ContractLibraryError = ContractLibraryError;


//--
//
// Basic recursive checking with path tracking
//

var toContract;

function checkWContext(contract, data, context) { 
  if (contract.isOptional && !data) {
    // ok
  } else {
     if( !contract.firstChecker(data) ) {
      context.fail(new ContractError(context).expected(contract.contractName, data).fullContractAndValue());
    }
    if (contract.needsWrapping && !context.wrapping) {
      throw new ContractLibraryError("check", context, "This contract requires wrapping. Call wrap() instead and retain the wrapped result.").fullContract()
    }
    
    contract.nestedChecker(data, function(nextContract, nextV, nextContext) {
      if (nextContext !== stackContextItems.silent) { context.stack.push(nextContext);}
      checkWContext(toContract(nextContract), nextV, context);
      if (nextContext !== stackContextItems.silent) { context.stack.pop();}
    }, context);
  }
}

function wrapWContext(contract, data, context) {
  if (contract.isOptional && !data) {
    return data;
  } else {
    return contract.wrapper(data, function (nextContract, nextV, nextContext) {
      if (nextContext !== stackContextItems.silent) { context.stack.push(nextContext);}
      var c = toContract(nextContract);
      var subWrap = (!c.needsWrapping ? nextV : wrapWContext(c, nextV, context));
      if (nextContext !== stackContextItems.silent) { context.stack.pop();}
      return subWrap;
    }, context);
  }
}

function checkWrapWContext(contract, data, context) { 
  var c = toContract(contract);
  checkWContext(c, data, context);
  if (!contract.needsWrapping) 
    return data;
  else {
    if (!context.wrappedAt) {
      context.wrappedAt = captureCleanStack();
    }
    return wrapWContext(c, data, context);
  }
}

function newContext(thingName, data, contract, wrapping) {
   return { thingName: thingName, 
           blameMe: true, 
           data: data, 
           stack: [], 
           fail: function (e) { e.captureStack(); throw e },
           contract: contract, 
           wrapping: wrapping };
}

//--
//
// Base class for contracts
//


// State for the documentation mechanisms:
var builtInContractNames = [];
var collectingBuiltInContractNames = true;
var currentCategory = false;


function Contract(name, // name: the name of the contract as it should appear in the error messages 
                  spec) {
/*    #:tprint( "this.contractName..." );                              */
/*    #:js-debug-object( this );                                       */
  this.contractName = name;
  if (collectingBuiltInContractNames && !__.contains(builtInContractNames, name)) builtInContractNames.push(name);
  __.extend(this, spec || {});
}

Contract.prototype = { 
  theDoc: [],
  category: false,
  needsWrapping: false,
  location: false,
  thingName: false, // thingName: Only used for generating documentation, 
  // and for passing as the `name` argument of `check`.
  isOptional: false,

  needsWrappingIfAny: function (contracts) {
    var self = this;
    if (__.any(contracts, function (c) { return c.needsWrapping; }))
      self.needsWrapping = true;
  },

  firstChecker: function (data) { var self = this; return true; },
  nestedChecker: function (data, next) { var self = this; },
  wrapper: function (data, next, context) { 
    var self = this; 
    throw new ContractLibraryError(wrap, context, "called on a contract that does not implements wrapping")
      .fullContract(); 
  },
  check: function (data, /* opt */ name) { 
    var self = this;
    checkWContext(this, data, newContext(name || self.thingName, data, this, false));
    return data;
  },
  wrap: function (data, name) { 
    var self = this;
    var context = newContext(name || self.thingName, data, this, true);
    return checkWrapWContext(this, data, context);
  },
  toString: function () { var self = this; return "c." + self.contractName + '(' + self.subToString().join(", ") + ')'; },
  subToString: function () { var self = this; return []; },
  rename: function (name) {
    var self = this; 
    if (collectingBuiltInContractNames && !__.contains(builtInContractNames, name)) builtInContractNames.push(name);
/*     #:tprint( "create literal..." );                                */
    return gentleUpdate(this, { contractName: name, toString: function(){return "c."+name;} }); 
  },
  
  optional: function () { 
    var self = this; 
    var oldToString = self.toString;
    return gentleUpdate(this, { isOptional: true,
                                toString: function () { var self = this; return 'c.optional(' + oldToString.call(self) + ')'; }
                              }); 
  },

  doc: function (/*...*/) { 
    var self = this;
    return gentleUpdate(this, { theDoc: __.toArray(arguments), category: currentCategory }); }
};

exports.Contract = Contract;


//--
//
// Elementary contract functions
//

var pred, value, array, object;

function toContract (v) {
  if (v instanceof Contract) {
    return v;
  } else if (__.isFunction(v)) {
    return pred(v);
  }
  else if (__.isArray(v)) {
    if (__.isUndefined(v[0])) throw new ContractLibraryError('toContract', false, "the element contract missing. " + v);
    if (__.size(v) > 1) throw new ContractLibraryError('toContract', false, "the given array has more than one element: " + v);
    return array(v[0]);
  }
  else if (__.isObject(v)) {
    return object(v);
  } else {
    return value(v);
  }
}
exports.toContract = toContract;

function check(contract, data, /* opt */ name) {
  toContract(contract).check(data, name);
  return data;
}
exports.check = check;

function wrap(contract, data, name) {
  return toContract(contract).wrap(data, name);
}
exports.wrap = wrap;

function optional(contract) {
  return contract.optional();
}
exports.optional = optional;

var any = new Contract('any');
exports.any = any;

function pred(fn) { return new Contract('unamed-pred', { firstChecker: fn }); }
exports.pred = pred;

var nothing = pred(function (data) { return false; }).rename('nothing');
exports.nothing = nothing;

/*
function not(c) { return 

*/
var falsy = pred(function (data) { return !data; }).rename('falsy');
exports.falsy = falsy;

var truthy = pred(function (data) { return !!data; }).rename('truthy');
exports.truthy = truthy;

function oneOf(/*...*/) {
  return new Contract('oneOf('+__.toArray(arguments).join(', ')+')', 
                      { firstChecker: function (vv) { var self = this; return __.contains(self.values, vv); },
                        values: __.toArray(arguments),
                        toString: function () { var self = this; return 'c.'+self.contractName; }});
}
exports.oneOf = oneOf;

function value(v) { return oneOf(v).rename('value('+v+')'); }
exports.value = value;


var string = pred(__.isString).rename('string');
exports.string = string;

var number = pred(__.isNumber).rename('number');
exports.number = number;

var integer = 
  pred(function (v) { return Math.floor(v) === v; })
  .rename('integer');
exports.integer = integer;

var bool = pred(__.isBoolean).rename('bool');
exports.bool = bool;

var regexp = pred(__.isRegExp).rename('regexp');
exports.regexp = regexp;

var anyFunction = pred(__.isFunction).rename('fun(...)');
exports.anyFunction = anyFunction;

var isA = function(parent, name) {
  return pred(function (v) { return v instanceof parent; }).rename('isA('+(name||"...")+')');
};
exports.isA = isA;

var contract = pred(function (v) { return !__.isUndefined(v); }).rename('contract');
exports.contract = contract;

var fromExample;

var quacksLike = function(parent, name) {
  return fromExample(parent).rename('quacksLike('+(name||"...")+')');
};
exports.quacksLike = quacksLike;


//--
//
// Contract combiners
//

function checkMany(silent, contracts, data, next) {
  __(contracts).each(function (c, i) {
    if (silent) next(c, data, stackContextItems.silent);
    else next(c, data, stackContextItems.and(i));
  });
}

function makeAnd(silent) {
  return function(/* ... */) {
    var self = new Contract('and');
    self.contracts = __.toArray(arguments);
    self.nestedChecker = function (data, next) { var self = this; checkMany(silent, self.contracts, data, next); };
    self.wrapper = function (data, next, context) { 
      var self = this; 
      throw new ContractLibraryError('wrap', context, "Cannot wrap an `and` contract").fullContract();
    };
    self.needsWrappingIfAny(self.contracts);
    self.subToString = function () { var self = this; return self.contracts; };
    return self;
  };
}
var silentAnd = makeAnd(true);
var and = makeAnd(false);
exports.silentAnd = silentAnd;
exports.and = and;

function matches (r) {
  var name = 'matches('+r+')'
  return pred(function (v) { return r.test(v); }).rename(name)
}
exports.matches = matches;

function or (/* ... */) {
  var self = new Contract('or');
  self.contracts = __.filter(arguments, function (c) { var self = this; return !c.needsWrapping; });
  self.wrappingContracts = __.difference(arguments, self.contracts);
  
  if (__.size(self.wrappingContracts) > 1)
    throw new ContractLibraryError('or', false, 
                                   "Or-contracts can only take at most one wrapping contracts, got " + 
                                   self.wrappingContracts);

  self.nestedChecker = function (data, next, context) {
    var self = this; 
    var allContracts = __.union(self.contracts, self.wrappingContracts);
    var exceptions = [];

    var oldFail = context.fail;
    var success = false;

    __(allContracts).each(function (contract) {
      var failed = false;
      if (!success) {
        context.fail = function (e) { exceptions.push({ c: contract, e: e }); failed = true; }
        next(contract, data, stackContextItems.silent);
        if (!failed) success =  contract;
      }
    });
    context.fail = oldFail;

    if (!success) {
      var msg = 
        "none of the contracts passed:\n" +
        __(allContracts).map(function(c) {return " - " + c.toString();}).join("\n") +
        "\n\nThe failures were:\n" +
        __(exceptions).map(function(c_e, i) {return "["+ (i+1) + "] --\n" + c_e.c.toString() + ": " + c_e.e.message;}).join("\n\n") + '\n';

      context.fail(new ContractError(context, msg)
                   .fullContractAndValue(context));
    }
    return success; // return the successful contract to self.wrapper
  };
  self.wrapper = function (data, next, context) {
    var self = this; 
    var c = self.nestedChecker(data, function () { }, context); // this is a bit of a hack.
    return next(c, data, stackContextItems.or);
  };
  self.needsWrappingIfAny(__.union(self.contracts, self.wrappingContracts));
  return self;
}
exports.or = or;


function cyclic(/*opt*/ needsWrapping) {
  var self = new Contract('cyclic');
  self.needsWrapping = (__.isUndefined(needsWrapping) ? true : false);
  self.closeCycle = function (c) { 
    var self = this;
    if (self.needsWrapping !== c.needsWrapping)
        throw new ContractLibraryError(self.contractName, false, "A " + self.contractName + "() was started with needsWrapping="+self.needsWrapping+
                                     ", but it was closed with a contract that has needsWrapping="+c.needsWrapping+":\n"+ c);

    __.each(c, function(v, k) {
      self[k] = v;
    });
    return self;
  };
  return self;
}
exports.cyclic = cyclic;

function forwardRef(/*opt*/ needsWrapping) { 
  var result = cyclic(__.isUndefined(needsWrapping) ? false : true).rename('forwardRef');
  result.setRef = result.closeCycle;
  delete result.closeCycle;
  return result;
}
exports.forwardRef = forwardRef;


//--
//
// Data structure contracts
//

function array(itemContract) {
  var self = new Contract('array');
  self.itemContract = itemContract;
  self.firstChecker = __.isArray;
  self.nestedChecker = function (data, next) { 
    var self = this; 
    __.each(data, function (item, i) {
      next(self.itemContract, item, stackContextItems.arrayItem(i));
    });
  };
  self.wrapper = function (data, next) {
    var self = this; 
    var result =  __.map(data, function (item, i) {
      return next(self.itemContract, item, stackContextItems.arrayItem(i));
    });
    return result;
  };
  self.needsWrappingIfAny([itemContract]);
  self.subToString = function () { var self = this; return [self.itemContract];};
  return self;
}
exports.array = array;

function tuple(/* ... */) {
  var self = new Contract('tuple');
  self.contracts = __.toArray(arguments);
  self.firstChecker = __.isArray;
  self.nestedChecker = function (data, next, context) {
    var self = this; 
    if (__.size(data) < __.size(self.contracts)) {
      context.fail(new ContractError(context).expected("tuple of size " + __.size(self.contracts), data));
    }

    __.zip(self.contracts, data.slice(0, __.size(self.contracts))).forEach(function (pair, i) {
      next(pair[0], pair[1], stackContextItems.tupleItem(i));
    });

  };
  self.wrapper = function (data, next) {
    var self = this; 
    return __.map(__.zip(self.contracts, data.slice(0, __.size(self.contracts))),
                  function (pair, i) {
                    return next(pair[0], pair[1], stackContextItems.tupleItem(i));
                  });
  };

  self.strict = function () {
    var self = this;
    var oldNestedChecker = self.nestedChecker;
    var result = gentleUpdate(self, { 
      nestedChecker: function (data, next, context) {
        var self = this;
        if (__.size(data) !== __.size(self.contracts)) {
          context.fail(new ContractError(context)
                       .expected("tuple of exactly size " + __.size(self.contracts), data)
                       .fullContractAndValue());
        }
        return oldNestedChecker.call(self, data, next, context);
      },

      strict: function () { var self = this; return self; }
    });

    return result.rename('tuple.strict');
  };

  self.needsWrappingIfAny(self.contracts);
  self.subToString = function () { var self = this; return self.contracts; };
  return self;
}
exports.tuple = tuple;

function hash(valueContract) {
  var self = new Contract('hash');
  self.valueContract = valueContract;
  self.firstChecker = __.isObject;
  self.nestedChecker = function (data, next, context) {
    var self = this; 
    __.each(data, function (v, k) { 
      next(self.valueContract, v, stackContextItems.hashItem(k));
    });
  };
  self.wrapper = function (data, next, context) {
    var self = this;
    var result = clone(data);
    __.each(result, function (v, k) {
      result[k] = next(self.valueContract, v, stackContextItems.hashItem(k));
    });
    return result;
  };
  self.needsWrappingIfAny([self.valueContract]);
  self.subToString = function () { var self = this; return [self.valueContract]; };
  return self;
}
exports.hash = hash;

function object(/*opt*/ fieldContracts) {
  var self = new Contract('object');
  self.fieldContracts = fieldContracts || {};
  self.firstChecker = __.isObject;
  self.nestedChecker = function (data, next, context) {
    var self = this;

    __(self.fieldContracts).each(function (contract, field) {
      if (!contract.isOptional && isMissing(data[field])) {
        context.fail(new ContractError(context, "Field `" + field + "` _required, got " + stringify(data)).fullContractAndValue());
      }
      if (!isMissing(data[field])) next(contract, data[field], stackContextItems.objectField(field));
    });
  };
  self.wrapper = function (data, next) {
    var self = this;
    var result = clone(data);

    __(self.fieldContracts).each(function (contract, field) {
      if (__.has(data, field)) result[field] = next(gentleUpdate(contract, { thingName: field }), 
                                                    data[field], 
                                                    stackContextItems.objectField(field));
    });
    var extra = __.difference(__.keys(data), __.keys(self.fieldContracts)); 
    __(extra).each(function(f) { result[f] = data[f]; });
    
    return result;
  };

  self.extend = function (newFields) {
    var self = this;
    var oldToString = self.toString;
    return gentleUpdate(self, { fieldContracts: gentleUpdate(self.fieldContracts, newFields) }); // TODO: toString when being renamed
  };

  self.strict = function () {
    var self = this;
    var oldNestedChecker = self.nestedChecker;
    var result = gentleUpdate(self, {
      nestedChecker: function (data, next, context) {
        var self = this;
        var extra = __.difference(__.keys(data), __.keys(self.fieldContracts));
        if (!__.isEmpty(extra)) {
          var extraStr = __.map(extra, function(k) { return '`'+k+'`'; }).join(', ');

          context.fail(new ContractError
                       (context, 
                        "Found the extra field" + (__.size(extra) === 1 ? " " : "s ") + extraStr + " in " + 
                        stringify(data) + "\n")
                       .fullContractAndValue());
        }
        return true;
      },

      strict: function () { var self = this; return self; }
    });
    return result.rename('object.strict');
  };

  self.needsWrappingIfAny(__.values(fieldContracts));
  self.toString = function () {
    var self = this;
    return "c.object({"+ __.map(self.fieldContracts, function(v, k) { return k+": "+v; }).join(", ") + "})";
  };
  return self;
}
exports.object = object;


//--
//
// Function contracts
//

function checkOptionalArgumentFormals(who, argumentContracts) {
  var optionsOnly = false;
  __.each(argumentContracts, function (c, i) {
    if (optionsOnly && !c.isOptional) {
      throw new ContractLibraryError('fun', false, "The non-optional "+i+"th arguments cannot follow an optional arguments.");
    }

    optionsOnly = optionsOnly || c.isOptional;
  });
}

function checkOptionalArgumentCount(argumentContracts, extraArgumentContract, actuals, context) {
  var nOptional = __.size(__.filter(argumentContracts, function (c) { return c.isOptional; }));
  var n_required = __.size(argumentContracts) - nOptional;

  if (nOptional === 0 && !extraArgumentContract) {
    
    if (actuals.length !== n_required) {
      context.fail(new ContractError
                   (context, "Wrong number of arguments, expected " + n_required + " but got " + actuals.length)
                   .fullContract());
    }
    
  } else if (actuals.length < n_required) {
    context.fail(new ContractError
                 (context, "Too few arguments, expected at least " + n_required + " but got " + actuals.length)
                 .fullContract());

  } else if (!extraArgumentContract && 
             actuals.length > n_required + nOptional) {
    context.fail(new ContractError
                 (context, "Too many arguments, expected at most " + (n_required + nOptional) + " but got " + actuals.length)
                 .fullContract());
  }
}

function fnHelper(who, argumentContracts) {
  var self = new Contract(who);
  self.argumentContracts = argumentContracts;
  checkOptionalArgumentFormals(who, self.argumentContracts);

  self.isFunctionContract = true;
  self.extraArgumentContract = false;
  self.thisContract = any;
  self.resultContract = any;
  self.firstChecker = function (data) { var self = this; return __.isFunction(data); };
  
  self.wrapper = function (fn, next, context) {
    var self = this;

    var r = function (/* ... */) {
      var contextHere = clone(context);
      contextHere.stack = clone(context.stack);
      contextHere.thingName = self.thingName || contextHere.thingName;
      var reverseBlame = function(r) { if (r) contextHere.blameMe = !contextHere.blameMe; }

      reverseBlame(true);
      checkOptionalArgumentCount(self.argumentContracts, self.extraArgumentContract, arguments, contextHere);
      reverseBlame(true);
      var next = function(nextContract, nextV, nextContext, rb) {
        contextHere.stack.push(nextContext);
        reverseBlame(rb);
        var result = checkWrapWContext(nextContract, nextV, contextHere);
        reverseBlame(rb);
        contextHere.stack.pop();
        return result;
      };

      var wrappedThis = next(self.thisContract, this, stackContextItems.this, true);
      var wrappedArgs = 
        __.map(__.zip(self.argumentContracts, __.toArray(arguments).slice(0, self.argumentContracts.length)), function(pair, i) {
          return next(pair[0], pair[1], stackContextItems.argument(pair[0].thingName ? pair[0].thingName : i), true);
        });
      var extraArgs = (!self.extraArgumentContract ? [] :
                       next(self.extraArgumentContract, __.toArray(arguments).slice(self.argumentContracts.length), 
                            stackContextItems.extraArguments, true));

      var result = fn.apply(wrappedThis, wrappedArgs.concat(extraArgs));
      return next(self.resultContract, result, stackContextItems.result, false);
    };
    return r;


  };
  self.extraArgs = function(c) { 
    c = c || exports.any;
    var self = this; return gentleUpdate(self, { extraArgumentContract: c }); 
  };
  self.needsWrapping = true;
  self.ths = function (c) { var self = this; return gentleUpdate(self, { thisContract: c }); };
  self.returns = function (c) { var self = this; return gentleUpdate(self, { resultContract: c}); };
  self.toString = function () { 
    var self = this; 
    return "c." + self.contractName + "(" +
      (self.thisContract !== any ? "this: " + self.thisContract + ", " : "") +
      self.argumentContracts.join(", ") + 
      (self.extraArgumentContract ? "..." + self.extraArgumentContract : "") +
      " -> " + self.resultContract + ")";
  };
  return self;
}

function fn(/* ... */) {
  return fnHelper('fn', __.toArray(arguments));
}
exports.fn = fn;


function funHelper(who, argumentContracts) {

  __.each(argumentContracts, function (argSpec, i) {
    if (!__.isObject(argSpec)) 
      throw new ContractLibraryError
    (who, false,
     "expected an object with exactly one field to specify the name of the " +ith(i)+
     " argument, but got " + stringify(argSpec));

    if (argSpec instanceof Contract)
      throw new ContractLibraryError
    (who, false, 
     "expected a one-field object specifying the name and the contract of the "+ith(i)+
     " argument, but got a contract " + argSpec);
      
    var s = __.size(__.keys(argSpec));
    if (s !== 1) 
      throw new ContractLibraryError(who, false, "expected exactly one key to specify the name of the "+ith(i)+
                                     " arguments, but got " + stringify(s));
    
  });
  var contracts = __.map(argumentContracts, function(singleton) {
    var name = __.keys(singleton)[0];
    var contract = singleton[name];
    
    return gentleUpdate(contract, { thingName: name });
  });

  var toString = function () { 
    var self = this; 

    var argumentStrings =
      __.map(self.argumentContracts, function (c) {
        return '{ ' + c.thingName + ': ' + c.toString() + ' }';
      });

    return "c." + self.contractName + "(" +
      (self.thisContract !== any ? "this: " + self.thisContract + ", " : "") +
      argumentStrings.join(', ') +
      (self.extraArgumentContract ? "..." + self.extraArgumentContract : "") +
      " -> " + self.resultContract + ")";
  };

/*   #:tprint( "literal2" );                                           */
  return gentleUpdate(fnHelper('fun', contracts), { contractName: 'fun', 
                                                    toString: toString
                                                  });

}

function fun(/*...*/) {
  return funHelper('fun', __.toArray(arguments));
}
exports.fun = fun;

function method(ths /* ... */) {
  if (!(ths instanceof Contract))
    throw new ContractLibraryError('method', false, "expected a Contract for the `this` argument, by got " + stringify(ths));
/*   #:tprint( "literal3" );                                           */
  return gentleUpdate(funHelper('method', __.toArray(arguments).slice(1)).ths(ths),
                      { contractName: 'method' });
}
exports.method = method;


//---
//
// Relevant utility functions
//

function fromExample(v, withQuestionMark) {
  if (__.isArray(v)) {
    return array(fromExample(v[0]));

  } else if (__.isObject(v)) {
    var result = {};
    __.each(v, function(vv, k) { 
      var c = fromExample(vv);
      if (withQuestionMark && /^\?/.test(k)) {
      } else {
        result[k] = c;
      }
    });
    return object(result);

  } else if (__.isString(v)) {
    return string;
    
  } else if (__.isNumber(v)) {
    return number;

  } else if (__.isBoolean(v)) {
    return bool;

  } else if (__.isRegExp(v)) {
    regexp(v);

  } else if (__.isFunction(v)) {
    return anyFunction;

  } else {
    throw new ContractLibraryError('fromExample', false, "can't create a contract from " + v);
  }

}
exports.fromExample = fromExample;

var documentationTable = {};

exports.documentationTable = documentationTable;

function ensureDocumentationTable(moduleName) {
  moduleName = (__.isUndefined(moduleName) ? false : moduleName);

  if (!documentationTable[moduleName]) 
    documentationTable[moduleName] = { doc: [], categories: [], types: {}, values: {}};

  return moduleName;
}

function documentModule(moduleName /* ... */) {
  moduleName = ensureDocumentationTable(moduleName);

  documentationTable[moduleName].doc =
    documentationTable[moduleName].doc.concat(__.toArray(arguments).slice(1));
} 
exports.documentModule = documentModule;

function documentCategory(moduleName, category /*...*/) {
  moduleName = ensureDocumentationTable(moduleName);

  currentCategory = category;
  documentationTable[moduleName].categories.push = { name: category, doc: __.toArray(arguments).slice(2) };
}
exports.documentCategory = documentCategory;

function documentType(moduleName, contract) {
  if (__.contains(builtInContractNames, contract.contractName))
    throw new ContractLibraryError('`documentType` called on a contract that still has its built-in name.');

  moduleName = ensureDocumentationTable(moduleName);

  if (documentationTable[moduleName].types[contract.contractName]) 
    throw new ContractLibraryError('`documentType` called with a contract whose name that is already documented: ' + contract);

  documentationTable[moduleName].types[contract.contractName] = contract;
}
exports.documentType = documentType;

function publish(moduleName, self, contracts, /*opt*/ additionalExports) {
  moduleName = ensureDocumentationTable(moduleName);

  var result = (additionalExports ? clone(additionalExports) : {});
  __.each(contracts, function (c, n) {
    if (!__.has(self, n))
      throw new ContractLibraryError('publish', false, n + " is missing in the implementation");
    documentationTable[moduleName].values[n] = c;
    result[n] = c.wrap(self[n], n);
  });
  return result;
}
exports.publish = publish;

exports.c = exports;

collectingBuiltInContractNames = false;
}

_module( "./contract.impl", contractimp );

/*---------------------------------------------------------------------*/
/*    rhow-contracts-fork                                              */
/*---------------------------------------------------------------------*/
function rhocontractsfork( module, exports ) {
"use strict";

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint eqeqeq:true, bitwise:true, forin:true, immed:true, latedef: true, newcap: true undef: true, strict: true */
/*global exports, _require */

var c = _require('./contract.impl');

var thisModuleName = 'Contracts';

c.documentModule(thisModuleName,
    "Example of how to use the contract library",
    "--------------------------------------------",
    "    ",
    "    var contracts = {",
    "    ",
    "      join: c.fun({ strings: c.array(c.string)         .doc('The strings to join') }, ",
    "                  { separator: c.optional().string     .doc('The separator to be used. If omitted, the elements are separated with a comma') })",
    "        .returns(c.string                              .doc('All the `strings` concatenated in sequence, separated by the `separators`'))",
    "      ",
    "    ",
    "      push: fun().extraArgs({ items: array(c.a)        .doc('The items to add to the end of the array') })",
    "        .returns(c.array(c.a))",
    "    }",
    "    ",
    "    var implementation = {",
    "      join: function (...) { ... },",
    "      push: function (...) { ... }",
    "    }",
    "    ",
    "    module.exports = c.publish(implementation, contracts);", 
    "",
    "In general, contracts are any values that can be promoted to a",
    "`contractObject` by `toContract`. However, `contractObject` have additional useful",
    "functionality.",
    "",
    "Functions provided by the contract module that return contracts always return `contractObject`s.");


// ----

var contractObject = c.cyclic();

contractObject.closeCycle
(c.object({
  check: c.method(contractObject, { value: c.any }, { name: c.optional(c.string) }).returns(c.any)
    .doc("See: `check`"),
  
  wrap: c.method(contractObject, { value: c.any }, { name: c.optional(c.string) }).returns(c.any)
    .doc("See: `wrap`"),
  
  rename: c.method(contractObject, { name: c.string }).returns(contractObject)
    .doc("Returns `this` with the name `name`. The new name will be used by `toString`",
         "and in error messages."),
  
  optional: c.method(contractObject).returns(contractObject)
    .doc("See: `optional`"),
  
  doc: c.method(contractObject).extraArgs([c.string]).returns(contractObject)
    .doc("Returns `this` with zero or more strings set as the `theDoc` array.",
         "",
         "This is useful to document the function or argument `this` contract is",
         "being attached to with `publish` "),
  
  theDoc: c.array(c.string)
    .doc("An array of strings which will be used by `publish` to document the",
         "values being published.")
}).rename('contractObject')
 .doc("Contracts having following methods. Many values can be promoted to a `contractObject`",
      "with `toContract`. Functions in the contract library automatically promote their",
      "arguments."));

c.documentType(thisModuleName, contractObject);

// Contracts on tuples have one extra method:

var strictExtension = {
  strict: c.method(c.contract).returns(contractObject)
    .doc("Given a tuple contract or a object contract, returns a version of that",
         "contract which refuses tuples with extra elements or objects with",
         "extra fields. ")
};

var tupleContractObject = contractObject.extend(strictExtension).rename('tupleContractObject');


var objectContractObject = c.cyclic();

objectContractObject.closeCycle
(contractObject.extend({
  extend: c.method(objectContractObject, { fieldSpec: c.hash(c.contract)}).returns(contractObject)
    .doc("Returns a contract like `this` that in addition checks that the fields",
         "mentionned in `fieldSpec` match their contracts.")
})
 .extend(strictExtension)
 .rename('objectContractObject')
 .doc("Contracts on objects have two extra method, `extend` and `strict`"));
                                
c.documentType(thisModuleName, objectContractObject);


var functionContract = c.cyclic();

functionContract.closeCycle(
  contractObject.extend({
    extraArgs: c.method(functionContract, { extraArgContract: c.optional(c.contract) }).returns(functionContract)
    .doc("Returns a contract like `this` that accepts a variable number of",
         "additional arguments. `extraArgContract` will be checked against an",
         "array containing the extra arugments, so it should be an array contract or a",
         "tuple contract."),

  ths: c.method(functionContract, { thisContract: c.contract }).returns(functionContract)
    .doc("Returns a contract like `this` that accepts only calls where the",
         "implicit `this` argument passes `thisContract`."),

  returns: c.method(functionContract, { resultContract: c.contract}).returns(functionContract)
    .doc("Returns a contract like `this` that accepts only calls that returns a",
         "value that passes `resultContract`.")
  }).rename('functionContract')
    .doc("Contracts on functions have three extra methods."));

c.documentType(thisModuleName, functionContract);

var contextContract = c.object({ thingName: c.string,
                                 data: c.any,
                                 stack: c.array(c.any),
                                 contract: c.contract
                               });

var contracts = {
  check: c.fun({contract: c.contract}, {data: c.any}, { name: c.optional(c.string) })
    .doc("Verifies that `data` satisfies `contract`, if it doesn't, throws a `ContractError`,", 
         "otherwise it returns `data` unchanged.",
         "`check` throws an error if `contract` contains a function contract or any other contract",
         "that cannot be wrapped."),
  
  wrap: c.fun({contract: c.contract}, {data: c.any}, { name: c.optional(c.string) })
    .doc("Like `check`, verifies that `data` satisfies `contract`, if it doesn't, throws a `ContractError`.",
         "If `data` does not contains any function contracts (nor any custom contract types that _require wrapping),",
         "`wrap` returns `data` unchanged. Otherwise, it returns `data` wrapped with the machinery",
         "necessary for further contract checking."),
  
  optional: c.fun({contract: c.contract}).returns(contractObject)
    .doc("Returns an optional version of `contract`. It will accept all falsy values in",
         "addition to all the values accepted by `this`. ",
         "",
         "When an optional contract is a field specification in `object`",
         "that field is optional, and the contract check on the object will not",
         "complain if the field is missing. When an optional contract is used as an",
         "argument in `fn`, `fun`, or `method`, that argument is",
         "optional. Optional arguments cannot have non-optional arguments to",
         "their right.",
         "",
         "See also: `contractObject.optional`"),
  
  any: c.contract
    .doc("Accepts any value."),
  
  pred: c.fun({pred: c.fn(c.any).returns(c.any)}).returns(contractObject)
    .doc("Given a function `pred`, accepts all values for which `pred` returns truthy."),
  
  nothing: c.contract
    .doc("Rejects all values."),
  
  falsy: c.contract
    .doc("Accepts only `false`, `null`, `undefined`, the empty string, the",
         "number 0, and the value NaN."),
  
  truthy: c.contract
    .doc("Accepts all values except `false`, `null`, `undefined`, the empty string, the",
         "number 0, and the value NaN."),
  
  value: c.fn(c.any).returns(contractObject)
    .doc("Returns a contract that accepts only the given value."),
  
  oneOf: c.fn().extraArgs().returns(contractObject)
    .doc("Return a contract that accepts any on of the given values."),

  string: c.contract
    .doc("Accepts strings."),
  
  number: c.contract
    .doc("Accepts numbers"),
  
  integer: c.contract
    .doc("Accepts integers"),
  
  bool: c.contract
    .doc("Accepts only the values `true` and `false`."),
  
  regexp: c.contract
    .doc("Accept regexps"),
  
  anyFunction: c.contract
    .doc("Accepts any function. To put contract on the argument and return",
         "value, use `fn`, `fun`, or `method`."),
  
  isA: c.fun({parent: c.any}, {name: c.string}).returns(contractObject)
    .doc("Accepts only values `v` for which `v instanceof parent` returns",
         "true. `name` is used to describe the contract by `toString` and in error messages."),
  
  contract: c.contract
    .doc("Accept contract object and any values which can be promoted to a",
         "contract object by `toContract`."),
  
  toContract: c.fn(c.any).returns(contractObject)
    .doc("Promote the given value to a contract object. Arrays are promoted to an",
         "`array` contract. The array needs to have exactly one element specifying the",
         "contract on the items. Objects are promoted to an `object` contract. Functions",
         "are promoted to a `pred` contract. All other values (except undefined) are prototed to a",
         "`value` contract. The given value is promoted to a contract recursively."),
  
  quacksLike: c.fun({parent: c.any}, {name: c.string}).returns(contractObject)
    .doc("Accepts any object which has at least the same fields as `parent`, with the same",
         "types, as determined by `fromExample`. `name` is used to describe the",
         "contract by `toString` and in error messages."),
  
  and: c.fun().extraArgs([c.contract]).returns(contractObject)
    .doc("Accepts value which passes all the given contracts."),
  
  silentAnd: c.fun().extraArgs([c.contract]).returns(contractObject)
    .doc("Like `and`, but does not mention the presence of the `and` contract in",
         "the error messages."),
  
  matches: c.fn(c.regexp).returns(contractObject)
    .doc("Accepts strings which match the given regexp."),
  
  or: c.fun().extraArgs([c.contract]).returns(contractObject)
    .doc("Accepts values which passes at least one of the given contracts.",
         "`or` accepts at most one wrapping contract. `or` will test each of the",
         "contracts in the order they were given, except for the wrapping",
         "contract, which will be tested last. If the wrapping contract is the",
         "only contract that passes, the `or` contract will wrap its value."),
  
  cyclic: c.fun({needsWrapping: c.optional(c.bool)}).returns(contractObject)
    .doc("Returns an empty placeholder contract which can later be populated with .closeCycle(c).",
         "",
         "This is useful to create a forward reference when contructing a contract that refers to itself.",
         "This occurs, for instance, when describing the type of the `this` argument for methods.",
         "the `this` argument on methods on Class A is A, but the straitforward expression",
         "does not work because of the self reference:",
         "",
         "    var A = c.object({fn: c.fn().ths(A)})",
         "",
         "Instead, do:",
         "",
         "    var A = c.cyclic();",
         "    A.closeCycle(c.object({fn: c.fn().ths(A)}))",
         "",
         "`needsWrapping` much match the value of the `needsWrapping` in the contract used to",
         "close the cycle (defaults to `true`), otherwise `closeCycle` throws an error."),

  forwardRef: c.fun({needsWrapping: c.optional(c.bool)}).returns(contractObject)
    .doc("Synonym for cyclic(), with `needsWrapping` defaulting to `false`. Uses `setRef` instead of `closeCycle`"),

  array: c.fun({itemContract: c.contract}).returns(contractObject)
    .doc("Accepts arrays of any size whose elements are all accepted by `itemContract`."),

  tuple: c.fun().extraArgs([c.contract]).returns(tupleContractObject)
    .doc("Accepts array with as many elements as the number of given contract",
         "(or more) if the array's element are accepted by the corresponding",
         "contract. If the array has more element, they are accepted without any check.",
         "",
         "See also: `strict`"),

  object: c.fun({fieldContracts: c.optional(c.hash(c.contract))}).returns(objectContractObject)
    .doc("Accepts objects that have at least all the fields specified in",
         "`fieldContracts`, so long as the fields' value are accepted by the corresponding contract in",
         "`fieldContracts`. If the field contract was made optional by `optional`, the",
         "object will be accepted even if that field is missing.",
         "",
         "If `fieldContracts` is missing, `object` returns a contract that accepts",
         "any object",
         "",
         "See also: `strict`"),

  hash: c.fun({fieldContract: c.contract}).returns(contractObject)
    .doc("Accept objects whose fields are all accepted by `fieldContract`."),

  fn: c.fun().extraArgs([c.contract]).returns(functionContract)
    .doc("Accepts function that accepts as many arguments as the number of",
         "contracts given, so long as the argument passes the corresponding contract.",
         "Arguments can be optional, so long as there are no non-optional",
         "argument on the right of optional arguments",
         "",
         "See also: `fun`, `method`, `optional`, `returns`, `extraArgs`"),

  fun: c.fun().extraArgs([c.hash(c.contract)]).returns(functionContract)
    .doc("Accepts function that accepts as many arguments as the number of",
         "contracts given, so long as the argument passes the corresponding contract.",
         "",
         "Each arguments is specified with a one-field object. The name of the field",
         "will be used as the name of the argument in error messages.",
         "",
         "See also: `fn`, `method`, `returns`, `extraArgs`"),

  method: c.fun({ths: c.contract}).extraArgs([c.hash(c.contract)]).returns(functionContract)
    .doc("Accepts functions that accepts as many arguments as the number of",
         "contracts given in addition to the `ths` contract, so long as the argument",
         "passes the corresponding contract.",
         "", 
         "Calls only passes if the `this` implicit argument passes the `ths` contract.",
         "",
         "Each non-this arguments is specified with a one-field object. The name of the field",
         "will be used as the name of the argument in error messages.",
         "",
         "See also: `fn, `fun`, `returns`, `extraArgs`"),

  /*
  ContractError: c.fun({ context: contextContract }, { message: c.string })
    .returns(c.object({ name: c.string, 
                        context: contextContract,
                        message: c.string,
                        expected: c.optional(c.any) }))
    .doc("The errors thrown by the contract library"),
    */                        

  setErrorMessageInspectionDepth: c.fun({ depth : c.integer })
    .doc("Set a depth to pass to `util.inspect()` to limit the size of the data presented in",
         "the error messages. Default to `null` (unlimited)."),

  //--
  //
  // Functionality to write documentation 
  //

  fromExample: c.fun({value: c.any}, { withQuestionMark: c.optional(c.bool) }).returns(contractObject)
    .doc("Returns a contract that accepts values of the same type as `value`.",
         "",
         "An array `value` will result in a contract that accepts arrays whose",
         "elements passes the contract obtained by calling `fromExample` on the array's",
         "first value.",
         "",
         "An object `value` will result in a contract that accepts objects",
         "whose fields passes the contract obtained by calling `fromExample` on all",
         "the fields. If `withQuestionsMark` is true, fields whose name begin with a",
         "question mark will be turned into optional fields with the question",
         "mark removed.",
         "",
         "When given a function, `fromExample` returns the `anyFunction` contract."),

  documentModule: c.fun({moduleName: c.string}).extraArgs(c.array(c.string))
    .doc("Documents the given module in the `documentationTable`.",
         "",
         "Use `documentModule` to give an overview of the module. Individual function",
         "should be documented with `doc` and `publish`.",
         "",
         "`documentModule` adds to the previous documentation, if any."),

  documentCategory: c.fun({moduleName: c.string}, {category: c.string}).extraArgs(c.array(c.string))
    .doc("Store the additional arguments in the `documentationTable` for `moduleName` and `category`,",
         "overwriting existing strings, if any. Sets the current category. All invocations for `doc`",
         "until the next call to `documentCategory` will be filled under this category. The default",
         "category is `false`."),

  documentType: c.fun({moduleName: c.string}, {contract: contractObject})
    .doc("Stores the content of the `theDoc` field of `contract` in the `documentationTable`",
         "for `contract.contractName` in `moduleName`. The given contract should have a been given",
         "a unique name, otherwise `documentType` throws an exception."),

  publish: c.fun({ moduleName: c.string }, {self: c.any}, {contracts: c.hash(c.contract)}, 
                 { additionalExports: c.optional(c.object()) }
                )
    .doc("Returns an object like `self` where each element is wrapped using the",
         "correspoding contract in `contracts`.",
         "",
         "`publish` records the names of the items being wrapped in the wrapper. The names",
         "are then used to produce better error messages when the contracts fail.",
         "",
         "`publish` also records the value of the `theDoc` fields of the",
         "`contracts` in the `documentationTable`.",
         "`moduleName` specifies which subtable of `documentationTable` to send the",
         "documentation to.",
         "",
         "If `additionalExports` is provided, the keys in the given object",
         "are copied to the return value."),

  documentationTable: c.hash(c.object({ doc: c.array(c.string), 
                                        categories: c.array(c.object({name: c.string, doc: c.array(c.string)})),
                                        types: c.hash(contractObject),
                                        values: c.hash(contractObject) }))
    .doc("A table of module names containing the documentation and contracts of",
         "all items published with `publish`, all the types documented with `documentType`,",
         "and all the module documentation provide with `documentModule`."),

  // ---

  privates: c.any // private variables, to grant access to the test module
  
};

module.exports = c.publish(thisModuleName, c, contracts, 
                           {
                             functionContract: functionContract,
                             contractObject: contractObject,
                             strictExtension: strictExtension,
                             tupleContractObject: tupleContractObject,
                             objectContractObject: objectContractObject,
                             Contract: c.Contract,
                             ContractError: c.ContractError
                           });

}

_module( "./rho-contracts-fork", rhocontractsfork );

/*---------------------------------------------------------------------*/
/*    client code                                                      */
/*---------------------------------------------------------------------*/
var c = _require('./rho-contracts-fork')
   
// derive: returns a function that is the numerically-computed derivative
//         of the given function.
var derive =
  /* This is the specification: */ 
  c.fun( { fn:     c.fun( { x: c.number } ).returns(c.number) },
         { deltaX: c.number                                   } )
   .wrap(
         /* And the implementation goes here: */ 
         function(fn, deltaX) { 
           return function(x) { 
            return (fn(x+deltaX/2) - fn(x-deltaX/2))/deltaX
           }
         } )
     
function quadratic(x) { return 5*x*x + 3*x + 2 }

var linear = derive(quadratic, 1.0);

var funvec = 
   c.fun( { x: c.array(c.integer) } )
   .returns( c.number ) 
   .wrap( function( y ) { 
      y[ 2 ] = 3.5;
      return y.length } );

for( let i = 0; i < 50000; i++ ) {
   if( i % 5000 === 0 ) console.log( i );
   linear(0);
   linear(1);
   linear(10);

   funvec( [1, 2, 34] );
}
