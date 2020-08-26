//! moment.js
//! version : 2.27.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

'use strict';

const debugOn = process.env[ "DEBUG_MOMENT" ];
let verbOn = process.env[ "VERB_MOMENT" ];

function assertEqual( x, y, msg ) {
   if( x !== y ) {
      console.error( "*** ASSERT EQUAL ERROR:", msg );
      process.exit( 0 );
   }
   
   return true;
}

function assertNotEqual( x, y, msg ) {
   if( x === y ) {
      console.error( "*** ASSERT NOT EQUAL ERROR:", msg );
      process.exit( 0 );
   }
   
   return true;
}

function assertOk( x, msg ) {
   if( !x ) {
      console.error( "*** ASSERT OK ERROR:", msg );
      process.exit( 0 );
   }
   
   return true;
}

function assertDeepEqual( x, y, msg ) {
   if( x.length !== y.length ) {
      console.error( "*** ASSERT DEEP EQUAL ERROR:", msg );
      process.exit( 0 );
   }
   
   for( let i = x.length - 1; i >= 0; i-- ) {
      if( x[ i ] !== y[ i ] ) {
      	 console.error( "*** ASSERT DEEP EQUAL ERROR:", msg );
      	 process.exit( 0 );
      }
   }
	
   return true;
}

function verb( msg ) { 
   if( verbOn ) { 
      console.log( msg );
   }
}

function debug() {
   if( debugOn ) {
      console.log.apply( console, arguments );
   }
}

var hookCallback;

function moment() {
   return hookCallback.apply(null, arguments);
}

// This is done to register the method called with moment()
// without creating circular dependencies.
function setHookCallback(callback) {
   hookCallback = callback;
}

function isArray(input) {
   return (
      input instanceof Array ||
      Object.prototype.toString.call(input) === '[object Array]'
      );
}

function isObject(input) {
   // IE8 will treat undefined and null as object if it wasn't for
   // input != null
   return (
      input != null &&
      Object.prototype.toString.call(input) === '[object Object]'
      );
}

function hasOwnProp(a, b) {
   return Object.prototype.hasOwnProperty.call(a, b);
}

function isObjectEmpty(obj) {
   if (Object.getOwnPropertyNames) {
      return Object.getOwnPropertyNames(obj).length === 0;
   } else {
      var k;
      for (k in obj) {
	 if (hasOwnProp(obj, k)) {
	    return false;
	 }
      }
      return true;
   }
}

function isUndefined(input) {
   return input === void 0;
}

function isNumber(input) {
   return (
      typeof input === 'number' ||
      Object.prototype.toString.call(input) === '[object Number]'
      );
}

function isDate(input) {
   return (
      input instanceof Date ||
      Object.prototype.toString.call(input) === '[object Date]'
      );
}

function map(arr, fn) {
   var res = [],
      i;
   for (i = 0; i < arr.length; ++i) {
      res.push(fn(arr[i], i));
   }
   return res;
}

function extend(a, b) {
   for (var i in b) {
      if (hasOwnProp(b, i)) {
	 a[i] = b[i];
      }
   }
   
   if (hasOwnProp(b, 'toString')) {
      a.toString = b.toString;
   }
   
   if (hasOwnProp(b, 'valueOf')) {
      a.valueOf = b.valueOf;
   }
   
   return a;
}

function createUTC(input, format, locale, strict) {
   return createLocalOrUTC(input, format, locale, strict, true).utc();
}

function defaultParsingFlags() {
   // We need to deep clone this object.
   return {
      empty: false,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: false,
      invalidEra: null,
      invalidMonth: null,
      invalidFormat: false,
      userInvalidated: false,
      iso: false,
      parsedDateParts: [],
      era: null,
      meridiem: null,
      rfc2822: false,
      weekdayMismatch: false,
   };
}

function getParsingFlags(m) {
   if (m._pf == null) {
      m._pf = defaultParsingFlags();
   }
   return m._pf;
}

var some;
if (Array.prototype.some) {
   some = Array.prototype.some;
} else {
   some = function (fun) {
      var t = Object(this),
	 len = t.length >>> 0,
                	    i;
			    
            		    for (i = 0; i < len; i++) {
                	       if (i in t && fun.call(this, t[i], i, t)) {
                    		  return true;
                	       }
            		    }
			    
            		    return false;
   };
}

function isValid(m) {
   if (m._isValid == null) {
      var flags = getParsingFlags(m);
      var parsedParts = some.call(flags.parsedDateParts, function (i) {
	    return i != null;
	 }),
	 isNowValid =
	    !isNaN(m._d.getTime()) &&
	 flags.overflow < 0 &&
	 !flags.empty &&
	 !flags.invalidEra &&
	 !flags.invalidMonth &&
	 !flags.invalidWeekday &&
	 !flags.weekdayMismatch &&
	 !flags.nullInput &&
	 !flags.invalidFormat &&
	 !flags.userInvalidated &&
	 (!flags.meridiem || (flags.meridiem && parsedParts));
	 
	 if (m._strict) {
	    isNowValid =
	       isNowValid &&
	    flags.charsLeftOver === 0 &&
	    flags.unusedTokens.length === 0 &&
	    flags.bigHour === undefined;
	 }
	 
	 if (Object.isFrozen == null || !Object.isFrozen(m)) {
	    m._isValid = isNowValid;
	 } else {
	    return isNowValid;
	 }
   }
   return m._isValid;
}

function createInvalid(flags) {
   var m = createUTC(NaN);
   if (flags != null) {
      extend(getParsingFlags(m), flags);
   } else {
      getParsingFlags(m).userInvalidated = true;
   }
   
   return m;
}

// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var momentProperties = (moment.momentProperties = []),
   updateInProgress = false;

function copyConfig(to, from) {
   var i, prop, val;
   
   if (!isUndefined(from._isAMomentObject)) {
      to._isAMomentObject = from._isAMomentObject;
   }
   if (!isUndefined(from._i)) {
      to._i = from._i;
   }
   if (!isUndefined(from._f)) {
      to._f = from._f;
   }
   if (!isUndefined(from._l)) {
      to._l = from._l;
   }
   if (!isUndefined(from._strict)) {
      to._strict = from._strict;
   }
   if (!isUndefined(from._tzm)) {
      to._tzm = from._tzm;
   }
   if (!isUndefined(from._isUTC)) {
      to._isUTC = from._isUTC;
   }
   if (!isUndefined(from._offset)) {
      to._offset = from._offset;
   }
   if (!isUndefined(from._pf)) {
      to._pf = getParsingFlags(from);
   }
   if (!isUndefined(from._locale)) {
      to._locale = from._locale;
   }
   
   if (momentProperties.length > 0) {
      for (i = 0; i < momentProperties.length; i++) {
	 prop = momentProperties[i];
	 val = from[prop];
	 if (!isUndefined(val)) {
	    to[prop] = val;
	 }
      }
   }
   
   return to;
}

// Moment prototype object
function Moment(config) {
   copyConfig(this, config);
   this._d = new Date(config._d != null ? config._d.getTime() : NaN);
   if (!this.isValid()) {
      this._d = new Date(NaN);
   }
   // Prevent infinite loop in case updateOffset creates new moment
   // objects.
   if (updateInProgress === false) {
      updateInProgress = true;
      moment.updateOffset(this);
      updateInProgress = false;
   }
}

function isMoment(obj) {
   return (
      obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
         );
}

function warn(msg) {
   if (
      moment.suppressDeprecationWarnings === false &&
      typeof console !== 'undefined' &&
      console.warn
         ) {
      console.warn('Deprecation warning: ' + msg);
   }
}

function deprecate(msg, fn) {
   var firstTime = true;
   
   return extend(function () {
      if (moment.deprecationHandler != null) {
	 moment.deprecationHandler(null, msg);
      }
      if (firstTime) {
	 var args = [],
	    arg,
	    i,
	    key;
	 for (i = 0; i < arguments.length; i++) {
	    arg = '';
	    if (typeof arguments[i] === 'object') {
	       arg += '\n[' + i + '] ';
	       for (key in arguments[0]) {
		  if (hasOwnProp(arguments[0], key)) {
		     arg += key + ': ' + arguments[0][key] + ', ';
		  }
	       }
	       arg = arg.slice(0, -2); // Remove trailing comma and space
	    } else {
	       arg = arguments[i];
	    }
	    args.push(arg);
	 }
	 warn(
	    msg +
	    '\nArguments: ' +
	    Array.prototype.slice.call(args).join('') +
	    '\n' +
	    new Error().stack
	       );
	 firstTime = false;
      }
      return fn.apply(this, arguments);
   }, fn);
}

var deprecations = {};

function deprecateSimple(name, msg) {
   if (moment.deprecationHandler != null) {
      moment.deprecationHandler(name, msg);
   }
   if (!deprecations[name]) {
      warn(msg);
      deprecations[name] = true;
   }
}

moment.suppressDeprecationWarnings = true;
moment.deprecationHandler = null;

function isFunction(input) {
   return (
      (typeof Function !== 'undefined' && input instanceof Function) ||
      Object.prototype.toString.call(input) === '[object Function]'
      );
}

function set(config) {
   var prop, i;
   for (i in config) {
      if (hasOwnProp(config, i)) {
	 prop = config[i];
	 if (isFunction(prop)) {
	    this[i] = prop;
	 } else {
	    this['_' + i] = prop;
	 }
      }
   }
   this._config = config;
   // Lenient ordinal parsing accepts just a number in addition to
   // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
   // TODO: Remove "ordinalParse" fallback in next major release.
   this._dayOfMonthOrdinalParseLenient = new RegExp(
      (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
      '|' +
/\d{1,2}/.source
      );
}

function mergeConfigs(parentConfig, childConfig) {
   var res = extend({}, parentConfig),
      prop;
   for (prop in childConfig) {
      if (hasOwnProp(childConfig, prop)) {
	 if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
	    res[prop] = {};
	    extend(res[prop], parentConfig[prop]);
	    extend(res[prop], childConfig[prop]);
	 } else if (childConfig[prop] != null) {
	    res[prop] = childConfig[prop];
	 } else {
	    delete res[prop];
	 }
      }
   }
   for (prop in parentConfig) {
      if (
	 hasOwnProp(parentConfig, prop) &&
	 !hasOwnProp(childConfig, prop) &&
	 isObject(parentConfig[prop])
            ) {
	 // make sure changes to properties don't modify parent config
	 res[prop] = extend({}, res[prop]);
      }
   }
   return res;
}

function Locale(config) {
   if (config != null) {
      this.set(config);
   }
}

var keys;

if (Object.keys) {
   keys = Object.keys;
} else {
   keys = function (obj) {
      var i,
	 res = [];
      for (i in obj) {
	 if (hasOwnProp(obj, i)) {
	    res.push(i);
	 }
      }
      return res;
   };
}

var defaultCalendar = {
   sameDay: '[Today at] LT',
   nextDay: '[Tomorrow at] LT',
   nextWeek: 'dddd [at] LT',
   lastDay: '[Yesterday at] LT',
   lastWeek: '[Last] dddd [at] LT',
   sameElse: 'L',
};

function calendar(key, mom, now) {
   var output = this._calendar[key] || this._calendar['sameElse'];
   return isFunction(output) ? output.call(mom, now) : output;
}

function zeroFill(number, targetLength, forceSign) {
   var absNumber = '' + Math.abs(number),
      zerosToFill = targetLength - absNumber.length,
      sign = number >= 0;
   return (
      (sign ? (forceSign ? '+' : '') : '-') +
      Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
      absNumber
         );
}

var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
formatFunctions = {},
formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function addFormatToken(token, padded, ordinal, callback) {
   var func = callback;
   if (typeof callback === 'string') {
      func = function () {
	 return this[callback]();
      };
   }
   if (token) {
      formatTokenFunctions[token] = func;
   }
   if (padded) {
      formatTokenFunctions[padded[0]] = function () {
	 return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
      };
   }
   if (ordinal) {
      formatTokenFunctions[ordinal] = function () {
	 return this.localeData().ordinal(
	    func.apply(this, arguments),
	    token
	       );
      };
   }
}

function removeFormattingTokens(input) {
   if (input.match(/\[[\s\S]/)) {
      return input.replace(/^\[|\]$/g, '');
   }
   return input.replace(/\\/g, '');
}

function makeFormatFunction(format) {
   var array = format.match(formattingTokens),
      i,
      length;
   
   for (i = 0, length = array.length; i < length; i++) {
      if (formatTokenFunctions[array[i]]) {
	 array[i] = formatTokenFunctions[array[i]];
      } else {
	 array[i] = removeFormattingTokens(array[i]);
      }
   }
   
   return function (mom) {
      var output = '',
	 i;
      for (i = 0; i < length; i++) {
	 output += isFunction(array[i])
	    ? array[i].call(mom, format)
	    : array[i];
      }
      return output;
   };
}

// format date using native date object
function formatMoment(m, format) {
   if (!m.isValid()) {
      return m.localeData().invalidDate();
   }
   
   format = expandFormat(format, m.localeData());
   formatFunctions[format] =
      formatFunctions[format] || makeFormatFunction(format);
   
   return formatFunctions[format](m);
}

function expandFormat(format, locale) {
   var i = 5;
   
   function replaceLongDateFormatTokens(input) {
      return locale.longDateFormat(input) || input;
   }
   
   localFormattingTokens.lastIndex = 0;
   while (i >= 0 && localFormattingTokens.test(format)) {
      format = format.replace(
	 localFormattingTokens,
	 replaceLongDateFormatTokens
            );
      localFormattingTokens.lastIndex = 0;
      i -= 1;
   }
   
   return format;
}

var defaultLongDateFormat = {
   LTS: 'h:mm:ss A',
   LT: 'h:mm A',
   L: 'MM/DD/YYYY',
   LL: 'MMMM D, YYYY',
   LLL: 'MMMM D, YYYY h:mm A',
   LLLL: 'dddd, MMMM D, YYYY h:mm A',
};

function longDateFormat(key) {
   var format = this._longDateFormat[key],
      formatUpper = this._longDateFormat[key.toUpperCase()];
   
   if (format || !formatUpper) {
      return format;
   }
   
   this._longDateFormat[key] = formatUpper
   .match(formattingTokens)
      .map(function (tok) {
	 if (
	    tok === 'MMMM' ||
	    tok === 'MM' ||
	    tok === 'DD' ||
	    tok === 'dddd'
	    ) {
	    return tok.slice(1);
	 }
	 return tok;
      })
      .join('');
   
   return this._longDateFormat[key];
}

var defaultInvalidDate = 'Invalid date';

function invalidDate() {
   return this._invalidDate;
}

var defaultOrdinal = '%d',
defaultDayOfMonthOrdinalParse = /\d{1,2}/;

function ordinal(number) {
   return this._ordinal.replace('%d', number);
}

var defaultRelativeTime = {
   future: 'in %s',
   past: '%s ago',
   s: 'a few seconds',
   ss: '%d seconds',
   m: 'a minute',
   mm: '%d minutes',
   h: 'an hour',
   hh: '%d hours',
   d: 'a day',
   dd: '%d days',
   w: 'a week',
   ww: '%d weeks',
   M: 'a month',
   MM: '%d months',
   y: 'a year',
   yy: '%d years',
};

function relativeTime(number, withoutSuffix, string, isFuture) {
   var output = this._relativeTime[string];
   return isFunction(output)
             ? output(number, withoutSuffix, string, isFuture)
      : output.replace(/%d/i, number);
}

function pastFuture(diff, output) {
   var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
   return isFunction(format) ? format(output) : format.replace(/%s/i, output);
}

var aliases = {};

function addUnitAlias(unit, shorthand) {
   var lowerCase = unit.toLowerCase();
   aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
}

function normalizeUnits(units) {
   return typeof units === 'string'
             ? aliases[units] || aliases[units.toLowerCase()]
      : undefined;
}

function normalizeObjectUnits(inputObject) {
   var normalizedInput = {},
      normalizedProp,
      prop;
   
   for (prop in inputObject) {
      if (hasOwnProp(inputObject, prop)) {
	 normalizedProp = normalizeUnits(prop);
	 if (normalizedProp) {
	    normalizedInput[normalizedProp] = inputObject[prop];
	 }
      }
   }
   
   return normalizedInput;
}

var priorities = {};

function addUnitPriority(unit, priority) {
   priorities[unit] = priority;
}

function getPrioritizedUnits(unitsObj) {
   var units = [],
      u;
   for (u in unitsObj) {
      if (hasOwnProp(unitsObj, u)) {
	 units.push({ unit: u, priority: priorities[u] });
      }
   }
   units.sort(function (a, b) {
      return a.priority - b.priority;
   });
   return units;
}

function isLeapYear(year) {
   return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function absFloor(number) {
   if (number < 0) {
      // -0 -> 0
      return Math.ceil(number) || 0;
   } else {
      return Math.floor(number);
   }
}

function toInt(argumentForCoercion) {
   var coercedNumber = +argumentForCoercion,
            		value = 0;
   
   if (coercedNumber !== 0 && isFinite(coercedNumber)) {
      value = absFloor(coercedNumber);
   }
   
   return value;
}

function makeGetSet(unit, keepTime) {
   return function (value) {
      if (value != null) {
	 set$1(this, unit, value);
	 moment.updateOffset(this, keepTime);
	 return this;
      } else {
	 return get(this, unit);
      }
   };
}

function get(mom, unit) {
   return mom.isValid()
             ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
      : NaN;
}

function set$1(mom, unit, value) {
   if (mom.isValid() && !isNaN(value)) {
      if (
	 unit === 'FullYear' &&
	 isLeapYear(mom.year()) &&
	 mom.month() === 1 &&
	 mom.date() === 29
	 ) {
	 value = toInt(value);
	 mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
		   value,
		   mom.month(),
		   daysInMonth(value, mom.month())
                      );
      } else {
	 mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
      }
   }
}

// MOMENTS

function stringGet(units) {
   units = normalizeUnits(units);
   if (isFunction(this[units])) {
      return this[units]();
   }
   return this;
}

function stringSet(units, value) {
   if (typeof units === 'object') {
      units = normalizeObjectUnits(units);
      var prioritized = getPrioritizedUnits(units),
	 i;
      for (i = 0; i < prioritized.length; i++) {
	 this[prioritized[i].unit](units[prioritized[i].unit]);
      }
   } else {
      units = normalizeUnits(units);
      if (isFunction(this[units])) {
	 return this[units](value);
      }
   }
   return this;
}

var match1 = /\d/, //       0 - 9
match2 = /\d\d/, //      00 - 99
match3 = /\d{3}/, //     000 - 999
match4 = /\d{4}/, //    0000 - 9999
match6 = /[+-]?\d{6}/, // -999999 - 999999
match1to2 = /\d\d?/, //       0 - 99
match3to4 = /\d\d\d\d?/, //     999 - 9999
match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
match1to3 = /\d{1,3}/, //       0 - 999
match1to4 = /\d{1,4}/, //       0 - 9999
match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
matchUnsigned = /\d+/, //       0 - inf
matchSigned = /[+-]?\d+/, //    -inf - inf
matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        							       matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
        																			matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
regexes;

regexes = {};

function addRegexToken(token, regex, strictRegex) {
   regexes[token] = isFunction(regex)
      ? regex
      : function (isStrict, localeData) {
      return isStrict && strictRegex ? strictRegex : regex;
   };
}

function getParseRegexForToken(token, config) {
   if (!hasOwnProp(regexes, token)) {
      return new RegExp(unescapeFormat(token));
   }
   
   return regexes[token](config._strict, config._locale);
}

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s) {
   return regexEscape(
      s
	 .replace('\\', '')
	 .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                    					    matched,
                    					    p1,
                    					    p2,
                    					    p3,
                    					    p4
                					       ) {
	    return p1 || p2 || p3 || p4;
	 })
         );
}

function regexEscape(s) {
   return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var tokens = {};

function addParseToken(token, callback) {
   var i,
      func = callback;
   if (typeof token === 'string') {
      token = [token];
   }
   if (isNumber(callback)) {
      func = function (input, array) {
	 array[callback] = toInt(input);
      };
   }
   for (i = 0; i < token.length; i++) {
      tokens[token[i]] = func;
   }
}

function addWeekParseToken(token, callback) {
   addParseToken(token, function (input, array, config, token) {
      config._w = config._w || {};
      callback(input, config._w, config, token);
   });
}

function addTimeToArrayFromToken(token, input, config) {
   if (input != null && hasOwnProp(tokens, token)) {
      tokens[token](input, config._a, config, token);
   }
}

var YEAR = 0,
   MONTH = 1,
   DATE = 2,
   HOUR = 3,
   MINUTE = 4,
   SECOND = 5,
   MILLISECOND = 6,
   WEEK = 7,
   WEEKDAY = 8;

function mod(n, x) {
   return ((n % x) + x) % x;
}

var indexOf;

if (Array.prototype.indexOf) {
   indexOf = Array.prototype.indexOf;
} else {
   indexOf = function (o) {
      // I know
      var i;
      for (i = 0; i < this.length; ++i) {
	 if (this[i] === o) {
	    return i;
	 }
      }
      return -1;
   };
}

function daysInMonth(year, month) {
   if (isNaN(year) || isNaN(month)) {
      return NaN;
   }
   var modMonth = mod(month, 12);
   year += (month - modMonth) / 12;
   return modMonth === 1
             ? isLeapYear(year)
	     ? 29
      : 28
      : 31 - ((modMonth % 7) % 2);
}

// FORMATTING

addFormatToken('M', ['MM', 2], 'Mo', function () {
   return this.month() + 1;
});

addFormatToken('MMM', 0, 0, function (format) {
   return this.localeData().monthsShort(this, format);
});

addFormatToken('MMMM', 0, 0, function (format) {
   return this.localeData().months(this, format);
});

// ALIASES

addUnitAlias('month', 'M');

// PRIORITY

addUnitPriority('month', 8);

// PARSING

addRegexToken('M', match1to2);
addRegexToken('MM', match1to2, match2);
addRegexToken('MMM', function (isStrict, locale) {
   return locale.monthsShortRegex(isStrict);
});
addRegexToken('MMMM', function (isStrict, locale) {
   return locale.monthsRegex(isStrict);
});

addParseToken(['M', 'MM'], function (input, array) {
   array[MONTH] = toInt(input) - 1;
});

addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
   var month = config._locale.monthsParse(input, token, config._strict);
   // if we didn't find a month name, mark the date as invalid.
   if (month != null) {
      array[MONTH] = month;
   } else {
      getParsingFlags(config).invalidMonth = input;
   }
});

// LOCALES

var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
   '_'
   ),
defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
   '_'
   ),
MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
defaultMonthsShortRegex = matchWord,
defaultMonthsRegex = matchWord;

function localeMonths(m, format) {
   if (!m) {
      return isArray(this._months)
                ? this._months
	 : this._months['standalone'];
   }
   return isArray(this._months)
             ? this._months[m.month()]
      : this._months[
	   (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
	      ? 'format'
	   : 'standalone'
	  ][m.month()];
}

function localeMonthsShort(m, format) {
   if (!m) {
      return isArray(this._monthsShort)
                ? this._monthsShort
	 : this._monthsShort['standalone'];
   }
   return isArray(this._monthsShort)
             ? this._monthsShort[m.month()]
      : this._monthsShort[
	   MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
               ][m.month()];
}

function handleStrictParse(monthName, format, strict) {
   var i,
      ii,
      mom,
      llc = monthName.toLocaleLowerCase();
   if (!this._monthsParse) {
      // this is not used
      this._monthsParse = [];
      this._longMonthsParse = [];
      this._shortMonthsParse = [];
      for (i = 0; i < 12; ++i) {
	 mom = createUTC([2000, i]);
	 this._shortMonthsParse[i] = this.monthsShort(
	    mom,
	    ''
	    ).toLocaleLowerCase();
	 this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
      }
   }
   
   if (strict) {
      if (format === 'MMM') {
	 ii = indexOf.call(this._shortMonthsParse, llc);
	 return ii !== -1 ? ii : null;
      } else {
	 ii = indexOf.call(this._longMonthsParse, llc);
	 return ii !== -1 ? ii : null;
      }
   } else {
      if (format === 'MMM') {
	 ii = indexOf.call(this._shortMonthsParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._longMonthsParse, llc);
	 return ii !== -1 ? ii : null;
      } else {
	 ii = indexOf.call(this._longMonthsParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._shortMonthsParse, llc);
	 return ii !== -1 ? ii : null;
      }
   }
}

function localeMonthsParse(monthName, format, strict) {
   var i, mom, regex;
   
   if (this._monthsParseExact) {
      return handleStrictParse.call(this, monthName, format, strict);
   }
   
   if (!this._monthsParse) {
      this._monthsParse = [];
      this._longMonthsParse = [];
      this._shortMonthsParse = [];
   }
   
   // TODO: add sorting
   // Sorting makes sure if one month (or abbr) is a prefix of another
   // see sorting in computeMonthsParse
   for (i = 0; i < 12; i++) {
      // make the regex if we don't have it already
      mom = createUTC([2000, i]);
      if (strict && !this._longMonthsParse[i]) {
	 this._longMonthsParse[i] = new RegExp(
	    '^' + this.months(mom, '').replace('.', '') + '$',
	    'i'
	    );
	 this._shortMonthsParse[i] = new RegExp(
	    '^' + this.monthsShort(mom, '').replace('.', '') + '$',
	    'i'
	    );
      }
      if (!strict && !this._monthsParse[i]) {
	 regex =
	    '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	 this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
      }
      // test the regex
      if (
	 strict &&
	 format === 'MMMM' &&
	 this._longMonthsParse[i].test(monthName)
            ) {
	 return i;
      } else if (
                strict &&
                format === 'MMM' &&
                this._shortMonthsParse[i].test(monthName)
            	   ) {
	 return i;
      } else if (!strict && this._monthsParse[i].test(monthName)) {
	 return i;
      }
   }
}

// MOMENTS

function setMonth(mom, value) {
   var dayOfMonth;
   
   if (!mom.isValid()) {
      // No op
      return mom;
   }
   
   if (typeof value === 'string') {
      if (/^\d+$/.test(value)) {
	 value = toInt(value);
      } else {
	 value = mom.localeData().monthsParse(value);
	 // TODO: Another silent failure?
	 if (!isNumber(value)) {
	    return mom;
	 }
      }
   }
   
   debug( "d=" + mom.date(), "y=" + mom.year(), "v=" + value,
      "dim=" + daysInMonth(mom.year(), value) );
   dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
   debug( "dom=", dayOfMonth, mom._isUTC, value, dayOfMonth );
   debug( ">> mom._d=" + mom._d, mom._d.getMonth() );
   debug( 'set' + (mom._isUTC ? 'UTC' : '') + 'Month' + "(" + value + "," + dayOfMonth + ")" );
   mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
   debug( "<< mom._d=" + mom._d, mom._d.getMonth() );
   return mom;
}

function getSetMonth(value) {
   if (value != null) {
      setMonth(this, value);
      moment.updateOffset(this, true);
      return this;
   } else {
      return get(this, 'Month');
   }
}

function getDaysInMonth() {
   return daysInMonth(this.year(), this.month());
}

function monthsShortRegex(isStrict) {
   if (this._monthsParseExact) {
      if (!hasOwnProp(this, '_monthsRegex')) {
	 computeMonthsParse.call(this);
      }
      if (isStrict) {
	 return this._monthsShortStrictRegex;
      } else {
	 return this._monthsShortRegex;
      }
   } else {
      if (!hasOwnProp(this, '_monthsShortRegex')) {
	 this._monthsShortRegex = defaultMonthsShortRegex;
      }
      return this._monthsShortStrictRegex && isStrict
                ? this._monthsShortStrictRegex
	 : this._monthsShortRegex;
   }
}

function monthsRegex(isStrict) {
   if (this._monthsParseExact) {
      if (!hasOwnProp(this, '_monthsRegex')) {
	 computeMonthsParse.call(this);
      }
      if (isStrict) {
	 return this._monthsStrictRegex;
      } else {
	 return this._monthsRegex;
      }
   } else {
      if (!hasOwnProp(this, '_monthsRegex')) {
	 this._monthsRegex = defaultMonthsRegex;
      }
      return this._monthsStrictRegex && isStrict
                ? this._monthsStrictRegex
	 : this._monthsRegex;
   }
}

function computeMonthsParse() {
   function cmpLenRev(a, b) {
      return b.length - a.length;
   }
   
   var shortPieces = [],
      longPieces = [],
      mixedPieces = [],
      i,
      mom;
   for (i = 0; i < 12; i++) {
      // make the regex if we don't have it already
      mom = createUTC([2000, i]);
      shortPieces.push(this.monthsShort(mom, ''));
      longPieces.push(this.months(mom, ''));
      mixedPieces.push(this.months(mom, ''));
      mixedPieces.push(this.monthsShort(mom, ''));
   }
   // Sorting makes sure if one month (or abbr) is a prefix of another it
   // will match the longer piece.
   shortPieces.sort(cmpLenRev);
   longPieces.sort(cmpLenRev);
   mixedPieces.sort(cmpLenRev);
   for (i = 0; i < 12; i++) {
      shortPieces[i] = regexEscape(shortPieces[i]);
      longPieces[i] = regexEscape(longPieces[i]);
   }
   for (i = 0; i < 24; i++) {
      mixedPieces[i] = regexEscape(mixedPieces[i]);
   }
   
   this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
   this._monthsShortRegex = this._monthsRegex;
   this._monthsStrictRegex = new RegExp(
      '^(' + longPieces.join('|') + ')',
      'i'
      );
   this._monthsShortStrictRegex = new RegExp(
      '^(' + shortPieces.join('|') + ')',
      'i'
      );
}

// FORMATTING

addFormatToken('Y', 0, 0, function () {
   var y = this.year();
   return y <= 9999 ? zeroFill(y, 4) : '+' + y;
});

addFormatToken(0, ['YY', 2], 0, function () {
   return this.year() % 100;
});

addFormatToken(0, ['YYYY', 4], 0, 'year');
addFormatToken(0, ['YYYYY', 5], 0, 'year');
addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

// ALIASES

addUnitAlias('year', 'y');

// PRIORITIES

addUnitPriority('year', 1);

// PARSING

addRegexToken('Y', matchSigned);
addRegexToken('YY', match1to2, match2);
addRegexToken('YYYY', match1to4, match4);
addRegexToken('YYYYY', match1to6, match6);
addRegexToken('YYYYYY', match1to6, match6);

addParseToken(['YYYYY', 'YYYYYY'], YEAR);
addParseToken('YYYY', function (input, array) {
   array[YEAR] =
      input.length === 2 ? moment.parseTwoDigitYear(input) : toInt(input);
});
addParseToken('YY', function (input, array) {
   array[YEAR] = moment.parseTwoDigitYear(input);
});
addParseToken('Y', function (input, array) {
   array[YEAR] = parseInt(input, 10);
});

// HELPERS

function daysInYear(year) {
   return isLeapYear(year) ? 366 : 365;
}

// MOMENT

moment.parseTwoDigitYear = function (input) {
   return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
};

// MOMENTS

var getSetYear = makeGetSet('FullYear', true);

function getIsLeapYear() {
   return isLeapYear(this.year());
}

function createDate(y, m, d, h, M, s, ms) {
   // can't just apply() to create a date:
   // https://stackoverflow.com/q/181348
   var date;
   // the date constructor remaps years 0-99 to 1900-1999
   if (y < 100 && y >= 0) {
      // preserve leap years using a full 400 year cycle, then reset
      date = new Date(y + 400, m, d, h, M, s, ms);
      if (isFinite(date.getFullYear())) {
	 date.setFullYear(y);
      }
   } else {
      date = new Date(y, m, d, h, M, s, ms);
   }
   
   return date;
}

function createUTCDate(y) {
   var date, args;
   // the Date.UTC function remaps years 0-99 to 1900-1999
   if (y < 100 && y >= 0) {
      args = Array.prototype.slice.call(arguments);
      // preserve leap years using a full 400 year cycle, then reset
      args[0] = y + 400;
      date = new Date(Date.UTC.apply(null, args));
      if (isFinite(date.getUTCFullYear())) {
	 date.setUTCFullYear(y);
      }
   } else {
      date = new Date(Date.UTC.apply(null, arguments));
   }
   
   return date;
}

// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
   var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
   fwd = 7 + dow - doy,
   // first-week day local weekday -- which local weekday is fwd
   fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
   
   return -fwdlw + fwd - 1;
}

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
   var localWeekday = (7 + weekday - dow) % 7,
      weekOffset = firstWeekOffset(year, dow, doy),
      dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
      resYear,
      resDayOfYear;
   
   if (dayOfYear <= 0) {
      resYear = year - 1;
      resDayOfYear = daysInYear(resYear) + dayOfYear;
   } else if (dayOfYear > daysInYear(year)) {
      resYear = year + 1;
      resDayOfYear = dayOfYear - daysInYear(year);
   } else {
      resYear = year;
      resDayOfYear = dayOfYear;
   }
   
   return {
      year: resYear,
      dayOfYear: resDayOfYear,
   };
}

function weekOfYear(mom, dow, doy) {
   var weekOffset = firstWeekOffset(mom.year(), dow, doy),
      week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
      resWeek,
      resYear;
   
   if (week < 1) {
      resYear = mom.year() - 1;
      resWeek = week + weeksInYear(resYear, dow, doy);
   } else if (week > weeksInYear(mom.year(), dow, doy)) {
      resWeek = week - weeksInYear(mom.year(), dow, doy);
      resYear = mom.year() + 1;
   } else {
      resYear = mom.year();
      resWeek = week;
   }
   
   return {
      week: resWeek,
      year: resYear,
   };
}

function weeksInYear(year, dow, doy) {
   var weekOffset = firstWeekOffset(year, dow, doy),
      weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
   return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
}

// FORMATTING

addFormatToken('w', ['ww', 2], 'wo', 'week');
addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES

addUnitAlias('week', 'w');
addUnitAlias('isoWeek', 'W');

// PRIORITIES

addUnitPriority('week', 5);
addUnitPriority('isoWeek', 5);

// PARSING

addRegexToken('w', match1to2);
addRegexToken('ww', match1to2, match2);
addRegexToken('W', match1to2);
addRegexToken('WW', match1to2, match2);

addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
        				     input,
        				     week,
        				     config,
        				     token
    						) {
   week[token.substr(0, 1)] = toInt(input);
});

// HELPERS

// LOCALES

function localeWeek(mom) {
   return weekOfYear(mom, this._week.dow, this._week.doy).week;
}

var defaultLocaleWeek = {
   dow: 0, // Sunday is the first day of the week.
   doy: 6, // The week that contains Jan 6th is the first week of the year.
};

function localeFirstDayOfWeek() {
   return this._week.dow;
}

function localeFirstDayOfYear() {
   return this._week.doy;
}

// MOMENTS

function getSetWeek(input) {
   var week = this.localeData().week(this);
   return input == null ? week : this.add((input - week) * 7, 'd');
}

function getSetISOWeek(input) {
   var week = weekOfYear(this, 1, 4).week;
   return input == null ? week : this.add((input - week) * 7, 'd');
}

// FORMATTING

addFormatToken('d', 0, 'do', 'day');

addFormatToken('dd', 0, 0, function (format) {
   return this.localeData().weekdaysMin(this, format);
});

addFormatToken('ddd', 0, 0, function (format) {
   return this.localeData().weekdaysShort(this, format);
});

addFormatToken('dddd', 0, 0, function (format) {
   return this.localeData().weekdays(this, format);
});

addFormatToken('e', 0, 0, 'weekday');
addFormatToken('E', 0, 0, 'isoWeekday');

// ALIASES

addUnitAlias('day', 'd');
addUnitAlias('weekday', 'e');
addUnitAlias('isoWeekday', 'E');

// PRIORITY
addUnitPriority('day', 11);
addUnitPriority('weekday', 11);
addUnitPriority('isoWeekday', 11);

// PARSING

addRegexToken('d', match1to2);
addRegexToken('e', match1to2);
addRegexToken('E', match1to2);
addRegexToken('dd', function (isStrict, locale) {
   return locale.weekdaysMinRegex(isStrict);
});
addRegexToken('ddd', function (isStrict, locale) {
   return locale.weekdaysShortRegex(isStrict);
});
addRegexToken('dddd', function (isStrict, locale) {
   return locale.weekdaysRegex(isStrict);
});

addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
   var weekday = config._locale.weekdaysParse(input, token, config._strict);
   // if we didn't get a weekday name, mark the date as invalid
   if (weekday != null) {
      week.d = weekday;
   } else {
      getParsingFlags(config).invalidWeekday = input;
   }
});

addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
   week[token] = toInt(input);
});

// HELPERS

function parseWeekday(input, locale) {
   if (typeof input !== 'string') {
      return input;
   }
   
   if (!isNaN(input)) {
      return parseInt(input, 10);
   }
   
   input = locale.weekdaysParse(input);
   if (typeof input === 'number') {
      return input;
   }
   
   return null;
}

function parseIsoWeekday(input, locale) {
   if (typeof input === 'string') {
      return locale.weekdaysParse(input) % 7 || 7;
   }
   return isNaN(input) ? null : input;
}

// LOCALES
function shiftWeekdays(ws, n) {
   return ws.slice(n, 7).concat(ws.slice(0, n));
}

var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
   '_'
   ),
defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
defaultWeekdaysRegex = matchWord,
defaultWeekdaysShortRegex = matchWord,
defaultWeekdaysMinRegex = matchWord;

function localeWeekdays(m, format) {
   var weekdays = isArray(this._weekdays)
      ? this._weekdays
      : this._weekdays[
		m && m !== true && this._weekdays.isFormat.test(format)
		   ? 'format'
		: 'standalone'
       ];
        return m === true
            	  ? shiftWeekdays(weekdays, this._week.dow)
	   : m
            	  ? weekdays[m.day()]
	   : weekdays;
}

function localeWeekdaysShort(m) {
   return m === true
             ? shiftWeekdays(this._weekdaysShort, this._week.dow)
      : m
             ? this._weekdaysShort[m.day()]
      : this._weekdaysShort;
}

function localeWeekdaysMin(m) {
   return m === true
             ? shiftWeekdays(this._weekdaysMin, this._week.dow)
      : m
             ? this._weekdaysMin[m.day()]
      : this._weekdaysMin;
}

function handleStrictParse$1(weekdayName, format, strict) {
   var i,
      ii,
      mom,
      llc = weekdayName.toLocaleLowerCase();
   if (!this._weekdaysParse) {
      this._weekdaysParse = [];
      this._shortWeekdaysParse = [];
      this._minWeekdaysParse = [];
      
      for (i = 0; i < 7; ++i) {
	 mom = createUTC([2000, 1]).day(i);
	 this._minWeekdaysParse[i] = this.weekdaysMin(
	    mom,
	    ''
	    ).toLocaleLowerCase();
	 this._shortWeekdaysParse[i] = this.weekdaysShort(
	    mom,
	    ''
	    ).toLocaleLowerCase();
	 this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
      }
   }
   
   if (strict) {
      if (format === 'dddd') {
	 ii = indexOf.call(this._weekdaysParse, llc);
	 return ii !== -1 ? ii : null;
      } else if (format === 'ddd') {
	 ii = indexOf.call(this._shortWeekdaysParse, llc);
	 return ii !== -1 ? ii : null;
      } else {
	 ii = indexOf.call(this._minWeekdaysParse, llc);
	 return ii !== -1 ? ii : null;
      }
   } else {
      if (format === 'dddd') {
	 ii = indexOf.call(this._weekdaysParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._shortWeekdaysParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._minWeekdaysParse, llc);
	 return ii !== -1 ? ii : null;
      } else if (format === 'ddd') {
	 ii = indexOf.call(this._shortWeekdaysParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._weekdaysParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._minWeekdaysParse, llc);
	 return ii !== -1 ? ii : null;
      } else {
	 ii = indexOf.call(this._minWeekdaysParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._weekdaysParse, llc);
	 if (ii !== -1) {
	    return ii;
	 }
	 ii = indexOf.call(this._shortWeekdaysParse, llc);
	 return ii !== -1 ? ii : null;
      }
   }
}

function localeWeekdaysParse(weekdayName, format, strict) {
   var i, mom, regex;
   
   if (this._weekdaysParseExact) {
      return handleStrictParse$1.call(this, weekdayName, format, strict);
   }
   
   if (!this._weekdaysParse) {
      this._weekdaysParse = [];
      this._minWeekdaysParse = [];
      this._shortWeekdaysParse = [];
      this._fullWeekdaysParse = [];
   }
   
   for (i = 0; i < 7; i++) {
      // make the regex if we don't have it already
      
      mom = createUTC([2000, 1]).day(i);
      if (strict && !this._fullWeekdaysParse[i]) {
	 this._fullWeekdaysParse[i] = new RegExp(
	    '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
	    'i'
	    );
	 this._shortWeekdaysParse[i] = new RegExp(
	    '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
	    'i'
	    );
	 this._minWeekdaysParse[i] = new RegExp(
	    '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
	    'i'
	    );
      }
      if (!this._weekdaysParse[i]) {
	 regex =
	    '^' +
	 this.weekdays(mom, '') +
	 '|^' +
	 this.weekdaysShort(mom, '') +
	 '|^' +
	 this.weekdaysMin(mom, '');
	 this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
      }
      // test the regex
      if (
	 strict &&
	 format === 'dddd' &&
	 this._fullWeekdaysParse[i].test(weekdayName)
            ) {
	 return i;
      } else if (
                strict &&
                format === 'ddd' &&
                this._shortWeekdaysParse[i].test(weekdayName)
            	   ) {
	 return i;
      } else if (
                strict &&
                format === 'dd' &&
                this._minWeekdaysParse[i].test(weekdayName)
            	   ) {
	 return i;
      } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
	 return i;
      }
   }
}

// MOMENTS

function getSetDayOfWeek(input) {
   if (!this.isValid()) {
      return input != null ? this : NaN;
   }
   var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
   if (input != null) {
      input = parseWeekday(input, this.localeData());
      return this.add(input - day, 'd');
   } else {
      return day;
   }
}

function getSetLocaleDayOfWeek(input) {
   if (!this.isValid()) {
      return input != null ? this : NaN;
   }
   var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
   return input == null ? weekday : this.add(input - weekday, 'd');
}

function getSetISODayOfWeek(input) {
   if (!this.isValid()) {
      return input != null ? this : NaN;
   }
   
   // behaves the same as moment#day except
   // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
   // as a setter, sunday should belong to the previous week.
   
   if (input != null) {
      var weekday = parseIsoWeekday(input, this.localeData());
      return this.day(this.day() % 7 ? weekday : weekday - 7);
   } else {
      return this.day() || 7;
   }
}

function weekdaysRegex(isStrict) {
   if (this._weekdaysParseExact) {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
	 computeWeekdaysParse.call(this);
      }
      if (isStrict) {
	 return this._weekdaysStrictRegex;
      } else {
	 return this._weekdaysRegex;
      }
   } else {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
	 this._weekdaysRegex = defaultWeekdaysRegex;
      }
      return this._weekdaysStrictRegex && isStrict
                ? this._weekdaysStrictRegex
	 : this._weekdaysRegex;
   }
}

function weekdaysShortRegex(isStrict) {
   if (this._weekdaysParseExact) {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
	 computeWeekdaysParse.call(this);
      }
      if (isStrict) {
	 return this._weekdaysShortStrictRegex;
      } else {
	 return this._weekdaysShortRegex;
      }
   } else {
      if (!hasOwnProp(this, '_weekdaysShortRegex')) {
	 this._weekdaysShortRegex = defaultWeekdaysShortRegex;
      }
      return this._weekdaysShortStrictRegex && isStrict
                ? this._weekdaysShortStrictRegex
	 : this._weekdaysShortRegex;
   }
}

function weekdaysMinRegex(isStrict) {
   if (this._weekdaysParseExact) {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
	 computeWeekdaysParse.call(this);
      }
      if (isStrict) {
	 return this._weekdaysMinStrictRegex;
      } else {
	 return this._weekdaysMinRegex;
      }
   } else {
      if (!hasOwnProp(this, '_weekdaysMinRegex')) {
	 this._weekdaysMinRegex = defaultWeekdaysMinRegex;
      }
      return this._weekdaysMinStrictRegex && isStrict
                ? this._weekdaysMinStrictRegex
	 : this._weekdaysMinRegex;
   }
}

function computeWeekdaysParse() {
   function cmpLenRev(a, b) {
      return b.length - a.length;
   }
   
   var minPieces = [],
      shortPieces = [],
      longPieces = [],
      mixedPieces = [],
      i,
      mom,
      minp,
      shortp,
      longp;
   for (i = 0; i < 7; i++) {
      // make the regex if we don't have it already
      mom = createUTC([2000, 1]).day(i);
      minp = regexEscape(this.weekdaysMin(mom, ''));
      shortp = regexEscape(this.weekdaysShort(mom, ''));
      longp = regexEscape(this.weekdays(mom, ''));
      minPieces.push(minp);
      shortPieces.push(shortp);
      longPieces.push(longp);
      mixedPieces.push(minp);
      mixedPieces.push(shortp);
      mixedPieces.push(longp);
   }
   // Sorting makes sure if one weekday (or abbr) is a prefix of another it
   // will match the longer piece.
   minPieces.sort(cmpLenRev);
   shortPieces.sort(cmpLenRev);
   longPieces.sort(cmpLenRev);
   mixedPieces.sort(cmpLenRev);
   
   this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
   this._weekdaysShortRegex = this._weekdaysRegex;
   this._weekdaysMinRegex = this._weekdaysRegex;
   
   this._weekdaysStrictRegex = new RegExp(
      '^(' + longPieces.join('|') + ')',
      'i'
      );
   this._weekdaysShortStrictRegex = new RegExp(
      '^(' + shortPieces.join('|') + ')',
      'i'
      );
   this._weekdaysMinStrictRegex = new RegExp(
      '^(' + minPieces.join('|') + ')',
      'i'
      );
}

// FORMATTING

function hFormat() {
   return this.hours() % 12 || 12;
}

function kFormat() {
   return this.hours() || 24;
}

addFormatToken('H', ['HH', 2], 0, 'hour');
addFormatToken('h', ['hh', 2], 0, hFormat);
addFormatToken('k', ['kk', 2], 0, kFormat);

addFormatToken('hmm', 0, 0, function () {
   return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
});

addFormatToken('hmmss', 0, 0, function () {
   return (
      '' +
      hFormat.apply(this) +
      zeroFill(this.minutes(), 2) +
      zeroFill(this.seconds(), 2)
         );
});

addFormatToken('Hmm', 0, 0, function () {
   return '' + this.hours() + zeroFill(this.minutes(), 2);
});

addFormatToken('Hmmss', 0, 0, function () {
   return (
      '' +
      this.hours() +
      zeroFill(this.minutes(), 2) +
      zeroFill(this.seconds(), 2)
         );
});

function meridiem(token, lowercase) {
   addFormatToken(token, 0, 0, function () {
      return this.localeData().meridiem(
	 this.hours(),
	 this.minutes(),
	 lowercase
            );
   });
}

meridiem('a', true);
meridiem('A', false);

// ALIASES

addUnitAlias('hour', 'h');

// PRIORITY
addUnitPriority('hour', 13);

// PARSING

function matchMeridiem(isStrict, locale) {
   return locale._meridiemParse;
}

addRegexToken('a', matchMeridiem);
addRegexToken('A', matchMeridiem);
addRegexToken('H', match1to2);
addRegexToken('h', match1to2);
addRegexToken('k', match1to2);
addRegexToken('HH', match1to2, match2);
addRegexToken('hh', match1to2, match2);
addRegexToken('kk', match1to2, match2);

addRegexToken('hmm', match3to4);
addRegexToken('hmmss', match5to6);
addRegexToken('Hmm', match3to4);
addRegexToken('Hmmss', match5to6);

addParseToken(['H', 'HH'], HOUR);
addParseToken(['k', 'kk'], function (input, array, config) {
   var kInput = toInt(input);
   array[HOUR] = kInput === 24 ? 0 : kInput;
});
addParseToken(['a', 'A'], function (input, array, config) {
   config._isPm = config._locale.isPM(input);
   config._meridiem = input;
});
addParseToken(['h', 'hh'], function (input, array, config) {
   array[HOUR] = toInt(input);
   getParsingFlags(config).bigHour = true;
});
addParseToken('hmm', function (input, array, config) {
   var pos = input.length - 2;
   array[HOUR] = toInt(input.substr(0, pos));
   array[MINUTE] = toInt(input.substr(pos));
   getParsingFlags(config).bigHour = true;
});
addParseToken('hmmss', function (input, array, config) {
   var pos1 = input.length - 4,
      pos2 = input.length - 2;
   array[HOUR] = toInt(input.substr(0, pos1));
   array[MINUTE] = toInt(input.substr(pos1, 2));
   array[SECOND] = toInt(input.substr(pos2));
   getParsingFlags(config).bigHour = true;
});
addParseToken('Hmm', function (input, array, config) {
   var pos = input.length - 2;
   array[HOUR] = toInt(input.substr(0, pos));
   array[MINUTE] = toInt(input.substr(pos));
});
addParseToken('Hmmss', function (input, array, config) {
   var pos1 = input.length - 4,
      pos2 = input.length - 2;
   array[HOUR] = toInt(input.substr(0, pos1));
   array[MINUTE] = toInt(input.substr(pos1, 2));
   array[SECOND] = toInt(input.substr(pos2));
});

// LOCALES

function localeIsPM(input) {
   // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
   // Using charAt should be more compatible.
   return (input + '').toLowerCase().charAt(0) === 'p';
}

var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
// Setting the hour should keep the time, because the user explicitly
// specified which hour they want. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
getSetHour = makeGetSet('Hours', true);

function localeMeridiem(hours, minutes, isLower) {
   if (hours > 11) {
      return isLower ? 'pm' : 'PM';
   } else {
      return isLower ? 'am' : 'AM';
   }
}

var baseConfig = {
   calendar: defaultCalendar,
   longDateFormat: defaultLongDateFormat,
   invalidDate: defaultInvalidDate,
   ordinal: defaultOrdinal,
   dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
   relativeTime: defaultRelativeTime,
   
   months: defaultLocaleMonths,
   monthsShort: defaultLocaleMonthsShort,
   
   week: defaultLocaleWeek,
   
   weekdays: defaultLocaleWeekdays,
   weekdaysMin: defaultLocaleWeekdaysMin,
   weekdaysShort: defaultLocaleWeekdaysShort,
   
   meridiemParse: defaultLocaleMeridiemParse,
};

// internal storage for locale config files
var locales = {},
   localeFamilies = {},
   globalLocale;

function commonPrefix(arr1, arr2) {
   var i,
      minl = Math.min(arr1.length, arr2.length);
   for (i = 0; i < minl; i += 1) {
      if (arr1[i] !== arr2[i]) {
	 return i;
      }
   }
   return minl;
}

function normalizeLocale(key) {
   return key ? key.toLowerCase().replace('_', '-') : key;
}

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function chooseLocale(names) {
   var i = 0,
      j,
      next,
      locale,
      split;
   
   while (i < names.length) {
      split = normalizeLocale(names[i]).split('-');
      j = split.length;
      next = normalizeLocale(names[i + 1]);
      next = next ? next.split('-') : null;
      while (j > 0) {
	 locale = loadLocale(split.slice(0, j).join('-'));
	 if (locale) {
	    return locale;
	 }
	 if (
	    next &&
	    next.length >= j &&
	    commonPrefix(split, next) >= j - 1
	    ) {
	    //the next array item is better than a shallower substring of this one
	    break;
	 }
	 j--;
      }
      i++;
   }
   return globalLocale;
}

function loadLocale(name) {
   var oldLocale = null,
      aliasedRequire;
   // TODO: Find a better way to register and load all the locales in Node
   if (
      locales[name] === undefined &&
      typeof module !== 'undefined' &&
      module &&
      module.exports
         ) {
      try {
	 oldLocale = globalLocale._abbr;
	 aliasedRequire = require;
	 aliasedRequire('./locale/' + name);
	 getSetGlobalLocale(oldLocale);
      } catch (e) {
	 // mark as not found to avoid repeating expensive file require call causing high CPU
	 // when trying to find en-US, en_US, en-us for every format call
	 locales[name] = null; // null means not found
      }
   }
   return locales[name];
}

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function getSetGlobalLocale(key, values) {
   var data;
   if (key) {
      if (isUndefined(values)) {
	 data = getLocale(key);
      } else {
	 data = defineLocale(key, values);
      }
      
      if (data) {
	 // moment.duration._locale = moment._locale = data;
	 globalLocale = data;
      } else {
	 if (typeof console !== 'undefined' && console.warn) {
	    //warn user if arguments are passed but the locale could not be set
	    console.warn(
	       'Locale ' + key + ' not found. Did you forget to load it?'
	       );
	 }
      }
   }
   
   return globalLocale._abbr;
}

function defineLocale(name, config) {
   if (config !== null) {
      var locale,
	 parentConfig = baseConfig;
      config.abbr = name;
      if (locales[name] != null) {
	 deprecateSimple(
	    'defineLocaleOverride',
	    'use moment.updateLocale(localeName, config) to change ' +
	    'an existing locale. moment.defineLocale(localeName, ' +
	    'config) should only be used for creating a new locale ' +
	    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
	    );
	 parentConfig = locales[name]._config;
      } else if (config.parentLocale != null) {
	 if (locales[config.parentLocale] != null) {
	    parentConfig = locales[config.parentLocale]._config;
	 } else {
	    locale = loadLocale(config.parentLocale);
	    if (locale != null) {
	       parentConfig = locale._config;
	    } else {
	       if (!localeFamilies[config.parentLocale]) {
		  localeFamilies[config.parentLocale] = [];
	       }
	       localeFamilies[config.parentLocale].push({
                            				   name: name,
                            				   config: config,
                        				});
	       return null;
	    }
	 }
      }
      locales[name] = new Locale(mergeConfigs(parentConfig, config));
      
      if (localeFamilies[name]) {
	 localeFamilies[name].forEach(function (x) {
	    defineLocale(x.name, x.config);
	 });
      }
      
      // backwards compat for now: also set the locale
      // make sure we set the locale AFTER all child locales have been
      // created, so we won't end up with the child locale set.
      getSetGlobalLocale(name);
      
      return locales[name];
   } else {
      // useful for testing
      delete locales[name];
      return null;
   }
}

function updateLocale(name, config) {
   if (config != null) {
      var locale,
	 tmpLocale,
	 parentConfig = baseConfig;
      
      if (locales[name] != null && locales[name].parentLocale != null) {
	 // Update existing child locale in-place to avoid memory-leaks
	 locales[name].set(mergeConfigs(locales[name]._config, config));
      } else {
	 // MERGE
	 tmpLocale = loadLocale(name);
	 if (tmpLocale != null) {
	    parentConfig = tmpLocale._config;
	 }
	 config = mergeConfigs(parentConfig, config);
	 if (tmpLocale == null) {
	    // updateLocale is called for creating a new locale
	    // Set abbr so it will have a name (getters return
	    // undefined otherwise).
	    config.abbr = name;
	 }
	 locale = new Locale(config);
	 locale.parentLocale = locales[name];
	 locales[name] = locale;
      }
      
      // backwards compat for now: also set the locale
      getSetGlobalLocale(name);
   } else {
      // pass null for config to unupdate, useful for tests
      if (locales[name] != null) {
	 if (locales[name].parentLocale != null) {
	    locales[name] = locales[name].parentLocale;
	    if (name === getSetGlobalLocale()) {
	       getSetGlobalLocale(name);
	    }
	 } else if (locales[name] != null) {
	    delete locales[name];
	 }
      }
   }
   return locales[name];
}

// returns locale data
function getLocale(key) {
   var locale;
   
   if (key && key._locale && key._locale._abbr) {
      key = key._locale._abbr;
   }
   
   if (!key) {
      return globalLocale;
   }
   
   if (!isArray(key)) {
      //short-circuit everything else
      locale = loadLocale(key);
      if (locale) {
	 return locale;
      }
      key = [key];
   }
   
   return chooseLocale(key);
}

function listLocales() {
   return keys(locales);
}

function checkOverflow(m) {
   var overflow,
      a = m._a;
   
   if (a && getParsingFlags(m).overflow === -2) {
      overflow =
	 a[MONTH] < 0 || a[MONTH] > 11
	    ? MONTH
	    : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
		 ? DATE
		 : a[HOUR] < 0 ||
		   a[HOUR] > 24 ||
		   (a[HOUR] === 24 &&
		    (a[MINUTE] !== 0 ||
		     a[SECOND] !== 0 ||
		     a[MILLISECOND] !== 0))
                      ? HOUR
                      : a[MINUTE] < 0 || a[MINUTE] > 59
                    	   ? MINUTE
                    	   : a[SECOND] < 0 || a[SECOND] > 59
                    		? SECOND
                    		: a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                    		     ? MILLISECOND
                    		     : -1;
				  
            			  if (
                		     getParsingFlags(m)._overflowDayOfYear &&
                		     (overflow < YEAR || overflow > DATE)
            				) {
                		     overflow = DATE;
            			  }
            			  if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                		     overflow = WEEK;
            			  }
            			  if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                		     overflow = WEEKDAY;
            			  }
				  
            			  getParsingFlags(m).overflow = overflow;
   }
   
   return m;
}

// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
isoDates = [
   ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
   ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
   ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
   ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
   ['YYYY-DDD', /\d{4}-\d{3}/],
   ['YYYY-MM', /\d{4}-\d\d/, false],
   ['YYYYYYMMDD', /[+-]\d{10}/],
   ['YYYYMMDD', /\d{8}/],
   ['GGGG[W]WWE', /\d{4}W\d{3}/],
   ['GGGG[W]WW', /\d{4}W\d{2}/, false],
   ['YYYYDDD', /\d{7}/],
   ['YYYYMM', /\d{6}/, false],
   ['YYYY', /\d{4}/, false],
   ],
// iso time formats and regexes
isoTimes = [
   ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
   ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
   ['HH:mm:ss', /\d\d:\d\d:\d\d/],
   ['HH:mm', /\d\d:\d\d/],
   ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
   ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
   ['HHmmss', /\d\d\d\d\d\d/],
   ['HHmm', /\d\d\d\d/],
   ['HH', /\d\d/],
   ],
aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
// RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
obsOffsets = {
   UT: 0,
   GMT: 0,
   EDT: -4 * 60,
   EST: -5 * 60,
   CDT: -5 * 60,
   CST: -6 * 60,
   MDT: -6 * 60,
   MST: -7 * 60,
   PDT: -7 * 60,
   PST: -8 * 60,
};

// date from iso format
function configFromISO(config) {
   var i,
      l,
      string = config._i,
      match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
      allowTime,
      dateFormat,
      timeFormat,
      tzFormat;

   if (match) {
      getParsingFlags(config).iso = true;
      
      for (i = 0, l = isoDates.length; i < l; i++) {
	 if (isoDates[i][1].exec(match[1])) {
	    dateFormat = isoDates[i][0];
	    allowTime = isoDates[i][2] !== false;
	    break;
	 }
      }
      if (dateFormat == null) {
	 config._isValid = false;
	 return;
      }
      if (match[3]) {
	 for (i = 0, l = isoTimes.length; i < l; i++) {
	    if (isoTimes[i][1].exec(match[3])) {
	       // match[2] should be 'T' or space
	       timeFormat = (match[2] || ' ') + isoTimes[i][0];
	       break;
	    }
	 }
	 if (timeFormat == null) {
	    config._isValid = false;
	    return;
	 }
      }
      if (!allowTime && timeFormat != null) {
	 config._isValid = false;
	 return;
      }
      if (match[4]) {
	 if (tzRegex.exec(match[4])) {
	    tzFormat = 'Z';
	 } else {
	    config._isValid = false;
	    return;
	 }
      }
      config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
      configFromStringAndFormat(config);
   } else {
      config._isValid = false;
   }
}

function extractFromRFC2822Strings(
   yearStr,
   monthStr,
   dayStr,
   hourStr,
   minuteStr,
   secondStr
      ) {
   var result = [
      untruncateYear(yearStr),
defaultLocaleMonthsShort.indexOf(monthStr),
parseInt(dayStr, 10),
parseInt(hourStr, 10),
parseInt(minuteStr, 10),
];
   
   if (secondStr) {
      result.push(parseInt(secondStr, 10));
   }
   
   return result;
}

function untruncateYear(yearStr) {
   var year = parseInt(yearStr, 10);
   if (year <= 49) {
      return 2000 + year;
   } else if (year <= 999) {
      return 1900 + year;
   }
   return year;
}

function preprocessRFC2822(s) {
   // Remove comments and folding whitespace and replace multiple-spaces with a single space
   return s
      .replace(/\([^)]*\)|[\n\t]/g, ' ')
      .replace(/(\s\s+)/g, ' ')
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
}

function checkWeekday(weekdayStr, parsedInput, config) {
   if (weekdayStr) {
      // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
      var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
	 weekdayActual = new Date(
	    parsedInput[0],
	    parsedInput[1],
	    parsedInput[2]
	       ).getDay();
      if (weekdayProvided !== weekdayActual) {
	 getParsingFlags(config).weekdayMismatch = true;
	 config._isValid = false;
	 return false;
      }
   }
   return true;
}

function calculateOffset(obsOffset, militaryOffset, numOffset) {
   if (obsOffset) {
      return obsOffsets[obsOffset];
   } else if (militaryOffset) {
      // the only allowed military tz is Z
      return 0;
   } else {
      var hm = parseInt(numOffset, 10),
	 m = hm % 100,
	 h = (hm - m) / 100;
      return h * 60 + m;
   }
}

// date and time from ref 2822 format
function configFromRFC2822(config) {
   var match = rfc2822.exec(preprocessRFC2822(config._i)),
      parsedArray;
   if (match) {
      parsedArray = extractFromRFC2822Strings(
	 match[4],
	 match[3],
	 match[2],
	 match[5],
	 match[6],
	 match[7]
            );
      if (!checkWeekday(match[1], parsedArray, config)) {
	 return;
      }
      
      config._a = parsedArray;
      config._tzm = calculateOffset(match[8], match[9], match[10]);
      
      config._d = createUTCDate.apply(null, config._a);
      config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
      
      getParsingFlags(config).rfc2822 = true;
   } else {
      config._isValid = false;
   }
}

// date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
function configFromString(config) {
   var matched = aspNetJsonRegex.exec(config._i);

   if (matched !== null) {
      config._d = new Date(+matched[1]);
      return;
   }
   configFromISO(config);
   if (config._isValid === false) {
      delete config._isValid;
   } else {
      return;
   }
   
   configFromRFC2822(config);
   if (config._isValid === false) {
      delete config._isValid;
   } else {
      return;
   }
   
   if (config._strict) {
      config._isValid = false;
   } else {
      // Final attempt, use Input Fallback
      moment.createFromInputFallback(config);
   }
}

moment.createFromInputFallback = deprecate(
   'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
   'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
   'discouraged and will be removed in an upcoming major release. Please refer to ' +
   'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
   function (config) {
      config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
   }
   );

// Pick the first defined of two or three arguments.
function defaults(a, b, c) {
   if (a != null) {
      return a;
   }
   if (b != null) {
      return b;
   }
   return c;
}

function currentDateArray(config) {
   // moment is actually the exported moment object
   var nowValue = new Date(moment.now());
   if (config._useUTC) {
      return [
	 nowValue.getUTCFullYear(),
	 nowValue.getUTCMonth(),
	 nowValue.getUTCDate(),
	 ];
   }
   return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
}

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function configFromArray(config) {
   var i,
      date,
      input = [],
      currentDate,
      expectedWeekday,
      yearToUse;
   
   if (config._d) {
      return;
   }
   
   currentDate = currentDateArray(config);

   //compute day of the year from weeks and weekdays
   if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
      dayOfYearFromWeekInfo(config);
   }

   //if the day of the year is set, figure out what it is
   if (config._dayOfYear != null) {
      yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
      
      if (
	 config._dayOfYear > daysInYear(yearToUse) ||
	 config._dayOfYear === 0
	 ) {
	 getParsingFlags(config)._overflowDayOfYear = true;
      }
      
      date = createUTCDate(yearToUse, 0, config._dayOfYear);
      config._a[MONTH] = date.getUTCMonth();
      config._a[DATE] = date.getUTCDate();
   }

   // Default to current date.
   // * if no year, month, day of month are given, default to today
   // * if day of month is given, default month and year
   // * if month is given, default only year
   // * if year is given, don't default anything
   for (i = 0; i < 3 && config._a[i] == null; ++i) {
      config._a[i] = input[i] = currentDate[i];
   }
   
   // Zero out whatever was not defaulted, including time
   for (; i < 7; i++) {
      config._a[i] = input[i] =
	 config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
   }

   // Check for 24:00:00.000
   if (
      config._a[HOUR] === 24 &&
      config._a[MINUTE] === 0 &&
      config._a[SECOND] === 0 &&
      config._a[MILLISECOND] === 0
      ) {
      config._nextDay = true;
      config._a[HOUR] = 0;
   }
   
   config._d = (config._useUTC ? createUTCDate : createDate).apply(
      null,
      input
         );
   expectedWeekday = config._useUTC
      ? config._d.getUTCDay()
      : config._d.getDay();
      
      // Apply timezone offset from input. The actual utcOffset can be changed
      // with parseZone.
      if (config._tzm != null) {
	 config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
      }
      
      if (config._nextDay) {
	 config._a[HOUR] = 24;
      }
      
      // check for mismatching day of week
      if (
	 config._w &&
	 typeof config._w.d !== 'undefined' &&
	 config._w.d !== expectedWeekday
            ) {
	 getParsingFlags(config).weekdayMismatch = true;
      }
}

function dayOfYearFromWeekInfo(config) {
   var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;
   
   w = config._w;
   if (w.GG != null || w.W != null || w.E != null) {
      dow = 1;
      doy = 4;
      
      // TODO: We need to take the current isoWeekYear, but that depends on
      // how we interpret now (local, utc, fixed offset). So create
      // a now version of current config (take local/utc/offset flags, and
      // create now).
      weekYear = defaults(
	 w.GG,
	 config._a[YEAR],
	 weekOfYear(createLocal(), 1, 4).year
            );
      week = defaults(w.W, 1);
      weekday = defaults(w.E, 1);
      if (weekday < 1 || weekday > 7) {
	 weekdayOverflow = true;
      }
   } else {
      dow = config._locale._week.dow;
      doy = config._locale._week.doy;
      
      curWeek = weekOfYear(createLocal(), dow, doy);
      
      weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
      
      // Default to current week.
      week = defaults(w.w, curWeek.week);
      
      if (w.d != null) {
	 // weekday -- low day numbers are considered next week
	 weekday = w.d;
	 if (weekday < 0 || weekday > 6) {
	    weekdayOverflow = true;
	 }
      } else if (w.e != null) {
	 // local weekday -- counting starts from beginning of week
	 weekday = w.e + dow;
	 if (w.e < 0 || w.e > 6) {
	    weekdayOverflow = true;
	 }
      } else {
	 // default to beginning of week
	 weekday = dow;
      }
   }
   if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
      getParsingFlags(config)._overflowWeeks = true;
   } else if (weekdayOverflow != null) {
      getParsingFlags(config)._overflowWeekday = true;
   } else {
      temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
      config._a[YEAR] = temp.year;
      config._dayOfYear = temp.dayOfYear;
   }
}

// constant that refers to the ISO standard
moment.ISO_8601 = function () {};

// constant that refers to the RFC 2822 form
moment.RFC_2822 = function () {};

// date from string and format string
function configFromStringAndFormat(config) {
   // TODO: Move this to another part of the creation flow to prevent circular deps
   if (config._f === moment.ISO_8601) {
      configFromISO(config);
      return;
   }
   if (config._f === moment.RFC_2822) {
      configFromRFC2822(config);
      return;
   }
   config._a = [];
   getParsingFlags(config).empty = true;
   
   // This array is used to make a Date, either with `new Date` or `Date.UTC`
   var string = '' + config._i,
      i,
      parsedInput,
      tokens,
      token,
      skipped,
      stringLength = string.length,
      totalParsedInputLength = 0,
      era;
   
   tokens =
      expandFormat(config._f, config._locale).match(formattingTokens) || [];
   
   for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                     [])[0];
      if (parsedInput) {
	 skipped = string.substr(0, string.indexOf(parsedInput));
	 if (skipped.length > 0) {
	    getParsingFlags(config).unusedInput.push(skipped);
	 }
	 string = string.slice(
	    string.indexOf(parsedInput) + parsedInput.length
	       );
	 totalParsedInputLength += parsedInput.length;
      }
      // don't parse if it's not a known token
      if (formatTokenFunctions[token]) {
	 if (parsedInput) {
	    getParsingFlags(config).empty = false;
	 } else {
	    getParsingFlags(config).unusedTokens.push(token);
	 }
	 addTimeToArrayFromToken(token, parsedInput, config);
      } else if (config._strict && !parsedInput) {
	 getParsingFlags(config).unusedTokens.push(token);
      }
   }
   
   // add remaining unparsed input length to the string
   getParsingFlags(config).charsLeftOver =
      stringLength - totalParsedInputLength;
   if (string.length > 0) {
      getParsingFlags(config).unusedInput.push(string);
   }
   
   // clear _12h flag if hour is <= 12
   if (
      config._a[HOUR] <= 12 &&
      getParsingFlags(config).bigHour === true &&
      config._a[HOUR] > 0
      ) {
      getParsingFlags(config).bigHour = undefined;
   }
   
   getParsingFlags(config).parsedDateParts = config._a.slice(0);
   getParsingFlags(config).meridiem = config._meridiem;
   // handle meridiem
   config._a[HOUR] = meridiemFixWrap(
      config._locale,
      config._a[HOUR],
      config._meridiem
         );
   
   // handle era
   era = getParsingFlags(config).era;
   if (era !== null) {
      config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
   }

   configFromArray(config);
   checkOverflow(config);
}

function meridiemFixWrap(locale, hour, meridiem) {
   var isPm;
   
   if (meridiem == null) {
      // nothing to do
      return hour;
   }
   if (locale.meridiemHour != null) {
      return locale.meridiemHour(hour, meridiem);
   } else if (locale.isPM != null) {
      // Fallback
      isPm = locale.isPM(meridiem);
      if (isPm && hour < 12) {
	 hour += 12;
      }
      if (!isPm && hour === 12) {
	 hour = 0;
      }
      return hour;
   } else {
      // this is not supposed to happen
      return hour;
   }
}

// date from string and array of format strings
function configFromStringAndArray(config) {
   var tempConfig,
      bestMoment,
      scoreToBeat,
      i,
      currentScore,
      validFormatFound,
      bestFormatIsValid = false;
   
   if (config._f.length === 0) {
      getParsingFlags(config).invalidFormat = true;
      config._d = new Date(NaN);
      return;
   }
   
   for (i = 0; i < config._f.length; i++) {
      currentScore = 0;
      validFormatFound = false;
      tempConfig = copyConfig({}, config);
      if (config._useUTC != null) {
	 tempConfig._useUTC = config._useUTC;
      }
      tempConfig._f = config._f[i];
      configFromStringAndFormat(tempConfig);
      
      if (isValid(tempConfig)) {
	 validFormatFound = true;
      }
      
      // if there is any input that was not parsed add a penalty for that format
      currentScore += getParsingFlags(tempConfig).charsLeftOver;
      
      //or tokens
      currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
      
      getParsingFlags(tempConfig).score = currentScore;
      
      if (!bestFormatIsValid) {
	 if (
	    scoreToBeat == null ||
	    currentScore < scoreToBeat ||
	    validFormatFound
	       ) {
	    scoreToBeat = currentScore;
	    bestMoment = tempConfig;
	    if (validFormatFound) {
	       bestFormatIsValid = true;
	    }
	 }
      } else {
	 if (currentScore < scoreToBeat) {
	    scoreToBeat = currentScore;
	    bestMoment = tempConfig;
	 }
      }
   }
   
   extend(config, bestMoment || tempConfig);
}

function configFromObject(config) {
   if (config._d) {
      return;
   }
   
   var i = normalizeObjectUnits(config._i),
      dayOrDate = i.day === undefined ? i.date : i.day;
   config._a = map(
      [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
      function (obj) {
	 return obj && parseInt(obj, 10);
      }
      );
   
   configFromArray(config);
}

function createFromConfig(config) {
   var res = new Moment(checkOverflow(prepareConfig(config)));
   if (res._nextDay) {
      // Adding is smart enough around DST
      res.add(1, 'd');
      res._nextDay = undefined;
   }
   
   return res;
}

function prepareConfig(config) {
   var input = config._i,
      format = config._f;
   
   config._locale = config._locale || getLocale(config._l);
   
   if (input === null || (format === undefined && input === '')) {
      return createInvalid({ nullInput: true });
   }
   
   if (typeof input === 'string') {
      config._i = input = config._locale.preparse(input);
   }
   
   if (isMoment(input)) {
      return new Moment(checkOverflow(input));
   } else if (isDate(input)) {
      config._d = input;
   } else if (isArray(format)) {
      configFromStringAndArray(config);
   } else if (format) {
      configFromStringAndFormat(config);
   } else {
      configFromInput(config);
   }
   
   if (!isValid(config)) {
      config._d = null;
   }
   
   return config;
}

function configFromInput(config) {
   var input = config._i;
   if (isUndefined(input)) {
      config._d = new Date(moment.now());
   } else if (isDate(input)) {
      config._d = new Date(input.valueOf());
   } else if (typeof input === 'string') {
      configFromString(config);
   } else if (isArray(input)) {
      config._a = map(input.slice(0), function (obj) {
	 return parseInt(obj, 10);
      });
      configFromArray(config);
   } else if (isObject(input)) {
      configFromObject(config);
   } else if (isNumber(input)) {
      // from milliseconds
      config._d = new Date(input);
   } else {
      moment.createFromInputFallback(config);
   }
}

function createLocalOrUTC(input, format, locale, strict, isUTC) {
   var c = {};
   
   if (format === true || format === false) {
      strict = format;
      format = undefined;
   }
   
   if (locale === true || locale === false) {
      strict = locale;
      locale = undefined;
   }
   
   if (
      (isObject(input) && isObjectEmpty(input)) ||
      (isArray(input) && input.length === 0)
         ) {
      input = undefined;
   }
   // object construction must be done this way.
   // https://github.com/moment/moment/issues/1423
   c._isAMomentObject = true;
   c._useUTC = c._isUTC = isUTC;
   c._l = locale;
   c._i = input;
   c._f = format;
   c._strict = strict;
   
   return createFromConfig(c);
}

function createLocal(input, format, locale, strict) {
   return createLocalOrUTC(input, format, locale, strict, false);
}

var prototypeMin = deprecate(
   'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
   function () {
      var other = createLocal.apply(null, arguments);
      if (this.isValid() && other.isValid()) {
	 return other < this ? this : other;
      } else {
	 return createInvalid();
      }
   }
   ),
   prototypeMax = deprecate(
      'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
      function () {
	 var other = createLocal.apply(null, arguments);
	 if (this.isValid() && other.isValid()) {
	    return other > this ? this : other;
	 } else {
	    return createInvalid();
	 }
      }
      );

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function pickBy(fn, moments) {
   var res, i;
   if (moments.length === 1 && isArray(moments[0])) {
      moments = moments[0];
   }
   if (!moments.length) {
      return createLocal();
   }
   res = moments[0];
   for (i = 1; i < moments.length; ++i) {
      if (!moments[i].isValid() || moments[i][fn](res)) {
	 res = moments[i];
      }
   }
   return res;
}

// TODO: Use [].sort instead?
function min() {
   var args = [].slice.call(arguments, 0);
   
   return pickBy('isBefore', args);
}

function max() {
   var args = [].slice.call(arguments, 0);
   
   return pickBy('isAfter', args);
}

var now = function () {
   return Date.now ? Date.now() : +new Date();
};

var ordering = [
   'year',
   'quarter',
   'month',
   'week',
   'day',
   'hour',
   'minute',
   'second',
   'millisecond',
   ];

function isDurationValid(m) {
   var key,
      unitHasDecimal = false,
      i;
   for (key in m) {
      if (
	 hasOwnProp(m, key) &&
	 !(
	    indexOf.call(ordering, key) !== -1 &&
	    (m[key] == null || !isNaN(m[key]))
	       )
            ) {
	 return false;
      }
   }
   
   for (i = 0; i < ordering.length; ++i) {
      if (m[ordering[i]]) {
	 if (unitHasDecimal) {
	    return false; // only allow non-integers for smallest unit
	 }
	 if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
	    unitHasDecimal = true;
	 }
      }
   }
   
   return true;
}

function isValid$1() {
   return this._isValid;
}

function createInvalid$1() {
   return createDuration(NaN);
}

function Duration(duration) {
   var normalizedInput = normalizeObjectUnits(duration),
      years = normalizedInput.year || 0,
      quarters = normalizedInput.quarter || 0,
      months = normalizedInput.month || 0,
      weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
      days = normalizedInput.day || 0,
      hours = normalizedInput.hour || 0,
      minutes = normalizedInput.minute || 0,
      seconds = normalizedInput.second || 0,
      milliseconds = normalizedInput.millisecond || 0;
   
   this._isValid = isDurationValid(normalizedInput);
   
   // representation for dateAddRemove
   this._milliseconds =
+milliseconds +
 seconds * 1e3 + // 1000
 minutes * 6e4 + // 1000 * 60
 hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
 // Because of dateAddRemove treats 24 hours as different from a
 // day when working around DST, we need to store them separately
 this._days = +days + weeks * 7;
 // It is impossible to translate months into days without knowing
 // which months you are are talking about, so we have to store
 // it separately.
 this._months = +months + quarters * 3 + years * 12;
 
 this._data = {};
 
 this._locale = getLocale();
 
 this._bubble();
}

function isDuration(obj) {
   return obj instanceof Duration;
}

function absRound(number) {
   if (number < 0) {
      return Math.round(-1 * number) * -1;
   } else {
      return Math.round(number);
   }
}

// compare two arrays, return the number of differences
function compareArrays(array1, array2, dontConvert) {
   var len = Math.min(array1.length, array2.length),
      lengthDiff = Math.abs(array1.length - array2.length),
      diffs = 0,
      i;
   for (i = 0; i < len; i++) {
      if (
	 (dontConvert && array1[i] !== array2[i]) ||
	 (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
            ) {
	 diffs++;
      }
   }
   return diffs + lengthDiff;
}

// FORMATTING

function offset(token, separator) {
   addFormatToken(token, 0, 0, function () {
      var offset = this.utcOffset(),
	 sign = '+';
      if (offset < 0) {
	 offset = -offset;
	 sign = '-';
      }
      return (
	 sign +
	 zeroFill(~~(offset / 60), 2) +
	 separator +
	 zeroFill(~~offset % 60, 2)
            );
   });
}

offset('Z', ':');
offset('ZZ', '');

// PARSING

addRegexToken('Z', matchShortOffset);
addRegexToken('ZZ', matchShortOffset);
addParseToken(['Z', 'ZZ'], function (input, array, config) {
   config._useUTC = true;
   config._tzm = offsetFromString(matchShortOffset, input);
});

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var chunkOffset = /([\+\-]|\d\d)/gi;

function offsetFromString(matcher, string) {
   var matches = (string || '').match(matcher),
      chunk,
      parts,
      minutes;
   
   if (matches === null) {
      return null;
   }
   
   chunk = matches[matches.length - 1] || [];
   parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
   minutes = +(parts[1] * 60) + toInt(parts[2]);
   
   return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
}

// Return a moment from input, that is local/utc/zone equivalent to model.
function cloneWithOffset(input, model) {
   var res, diff;
   if (model._isUTC) {
      res = model.clone();
      diff =
	 (isMoment(input) || isDate(input)
	     ? input.valueOf()
	     : createLocal(input).valueOf()) - res.valueOf();
      // Use low-level api, because this fn is low-level api.
      res._d.setTime(res._d.valueOf() + diff);
      moment.updateOffset(res, false);
      return res;
   } else {
      return createLocal(input).local();
   }
}

function getDateOffset(m) {
   // On Firefox.24 Date#getTimezoneOffset returns a floating point.
   // https://github.com/moment/moment/pull/1871
   return -Math.round(m._d.getTimezoneOffset());
}

// MOMENT

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
moment.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function getSetOffset(input, keepLocalTime, keepMinutes) {
   var offset = this._offset || 0,
      localAdjust;
   if (!this.isValid()) {
      return input != null ? this : NaN;
   }
   if (input != null) {
      if (typeof input === 'string') {
	 input = offsetFromString(matchShortOffset, input);
	 if (input === null) {
	    return this;
	 }
      } else if (Math.abs(input) < 16 && !keepMinutes) {
	 input = input * 60;
      }
      if (!this._isUTC && keepLocalTime) {
	 localAdjust = getDateOffset(this);
      }
      this._offset = input;
      this._isUTC = true;
      if (localAdjust != null) {
	 this.add(localAdjust, 'm');
      }
      if (offset !== input) {
	 if (!keepLocalTime || this._changeInProgress) {
	    addSubtract(
	       this,
	       createDuration(input - offset, 'm'),
	       1,
	       false
		  );
	 } else if (!this._changeInProgress) {
	    this._changeInProgress = true;
	    moment.updateOffset(this, true);
	    this._changeInProgress = null;
	 }
      }
      return this;
   } else {
      return this._isUTC ? offset : getDateOffset(this);
   }
}

function getSetZone(input, keepLocalTime) {
   if (input != null) {
      if (typeof input !== 'string') {
	 input = -input;
      }
      
      this.utcOffset(input, keepLocalTime);
      
      return this;
   } else {
      return -this.utcOffset();
   }
}

function setOffsetToUTC(keepLocalTime) {
   return this.utcOffset(0, keepLocalTime);
}

function setOffsetToLocal(keepLocalTime) {
   if (this._isUTC) {
      this.utcOffset(0, keepLocalTime);
      this._isUTC = false;
      
      if (keepLocalTime) {
	 this.subtract(getDateOffset(this), 'm');
      }
   }
   return this;
}

function setOffsetToParsedOffset() {
   if (this._tzm != null) {
      this.utcOffset(this._tzm, false, true);
   } else if (typeof this._i === 'string') {
      var tZone = offsetFromString(matchOffset, this._i);
      if (tZone != null) {
	 this.utcOffset(tZone);
      } else {
	 this.utcOffset(0, true);
      }
   }
   return this;
}

function hasAlignedHourOffset(input) {
   if (!this.isValid()) {
      return false;
   }
   input = input ? createLocal(input).utcOffset() : 0;
   
   return (this.utcOffset() - input) % 60 === 0;
}

function isDaylightSavingTime() {
   return (
      this.utcOffset() > this.clone().month(0).utcOffset() ||
      this.utcOffset() > this.clone().month(5).utcOffset()
         );
}

function isDaylightSavingTimeShifted() {
   if (!isUndefined(this._isDSTShifted)) {
      return this._isDSTShifted;
   }
   
   var c = {},
      other;
   
   copyConfig(c, this);
   c = prepareConfig(c);
   
   if (c._a) {
      other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
      this._isDSTShifted =
	 this.isValid() && compareArrays(c._a, other.toArray()) > 0;
   } else {
      this._isDSTShifted = false;
   }
   
   return this._isDSTShifted;
}

function isLocal() {
   return this.isValid() ? !this._isUTC : false;
}

function isUtcOffset() {
   return this.isValid() ? this._isUTC : false;
}

function isUtc() {
   return this.isValid() ? this._isUTC && this._offset === 0 : false;
}

// ASP.NET json date format regex
var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

function createDuration(input, key) {
   var duration = input,
      // matching against regexp is expensive, do it on demand
      match = null,
      sign,
      ret,
      diffRes;
      
      if (isDuration(input)) {
	 duration = {
	    ms: input._milliseconds,
	    d: input._days,
	    M: input._months,
	 };
      } else if (isNumber(input) || !isNaN(+input)) {
	 duration = {};
	 if (key) {
	    duration[key] = +input;
	 } else {
	    duration.milliseconds = +input;
	 }
      } else if ((match = aspNetRegex.exec(input))) {
	 sign = match[1] === '-' ? -1 : 1;
	 duration = {
	    y: 0,
	    d: toInt(match[DATE]) * sign,
	    h: toInt(match[HOUR]) * sign,
	    m: toInt(match[MINUTE]) * sign,
	    s: toInt(match[SECOND]) * sign,
	    ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
	 };
      } else if ((match = isoRegex.exec(input))) {
	 sign = match[1] === '-' ? -1 : 1;
	 duration = {
	    y: parseIso(match[2], sign),
	    M: parseIso(match[3], sign),
	    w: parseIso(match[4], sign),
	    d: parseIso(match[5], sign),
	    h: parseIso(match[6], sign),
	    m: parseIso(match[7], sign),
	    s: parseIso(match[8], sign),
	 };
      } else if (duration == null) {
	 // checks for null or undefined
	 duration = {};
      } else if (
            	typeof duration === 'object' &&
            	('from' in duration || 'to' in duration)
        	   ) {
	 diffRes = momentsDifference(
	    createLocal(duration.from),
	    createLocal(duration.to)
               );
	 
	 duration = {};
	 duration.ms = diffRes.milliseconds;
	 duration.M = diffRes.months;
      }
      
      ret = new Duration(duration);
      
      if (isDuration(input) && hasOwnProp(input, '_locale')) {
	 ret._locale = input._locale;
      }
      
      if (isDuration(input) && hasOwnProp(input, '_isValid')) {
	 ret._isValid = input._isValid;
      }
      
      return ret;
}

createDuration.fn = Duration.prototype;
createDuration.invalid = createInvalid$1;

function parseIso(inp, sign) {
   // We'd normally use ~~inp for this, but unfortunately it also
   // converts floats to ints.
   // inp may be undefined, so careful calling replace on it.
   var res = inp && parseFloat(inp.replace(',', '.'));
   // apply sign while we're at it
   return (isNaN(res) ? 0 : res) * sign;
}

function positiveMomentsDifference(base, other) {
   var res = {};
   
   res.months =
      other.month() - base.month() + (other.year() - base.year()) * 12;
   if (base.clone().add(res.months, 'M').isAfter(other)) {
--res.months;
   }
   
   res.milliseconds = +other - +base.clone().add(res.months, 'M');
				
        			return res;
}

function momentsDifference(base, other) {
   var res;
   if (!(base.isValid() && other.isValid())) {
      return { milliseconds: 0, months: 0 };
   }
   
   other = cloneWithOffset(other, base);
   if (base.isBefore(other)) {
      res = positiveMomentsDifference(base, other);
   } else {
      res = positiveMomentsDifference(other, base);
      res.milliseconds = -res.milliseconds;
      res.months = -res.months;
   }
   
   return res;
}

// TODO: remove 'name' arg after deprecation is removed
function createAdder(direction, name) {
   return function (val, period) {
      var dur, tmp;
      //invert the arguments, but complain about it
      if (period !== null && !isNaN(+period)) {
	 deprecateSimple(
	    name,
	    'moment().' +
	    name +
	    '(period, number) is deprecated. Please use moment().' +
	    name +
	    '(number, period). ' +
	    'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
	    );
	 tmp = val;
	 val = period;
	 period = tmp;
      }
      
      dur = createDuration(val, period);
      addSubtract(this, dur, direction);
      return this;
   };
}

function addSubtract(mom, duration, isAdding, updateOffset) {
   var milliseconds = duration._milliseconds,
      days = absRound(duration._days),
      months = absRound(duration._months);
   
   if (!mom.isValid()) {
      // No op
      return;
   }
   debug( "addSubtract.1 mom=", mom, " dur=", duration, "is=", isAdding,
      "uo=", updateOffset );
   updateOffset = updateOffset == null ? true : updateOffset;
   
   if (months) {
      debug( "m...", get(mom, 'Month'), months, isAdding);
      setMonth(mom, get(mom, 'Month') + months * isAdding);
      debug( "addSubtract.2 mom=", mom );
   }
   if (days) {
      debug( "d...", get(mom, 'Date'), days, isAdding);
      set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
      debug( "addSubtract.3 mom=", mom );
   }
   if (milliseconds) {
      mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
   }
   if (updateOffset) {
      moment.updateOffset(mom, days || months);
   }
}

var add = createAdder(1, 'add'),
   subtract = createAdder(-1, 'subtract');

function isString(input) {
   return typeof input === 'string' || input instanceof String;
}

// type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
function isMomentInput(input) {
   return (
      isMoment(input) ||
      isDate(input) ||
      isString(input) ||
      isNumber(input) ||
      isNumberOrStringArray(input) ||
      isMomentInputObject(input) ||
      input === null ||
      input === undefined
         );
}

function isMomentInputObject(input) {
   var objectTest = isObject(input) && !isObjectEmpty(input),
      propertyTest = false,
      properties = [
	 'years',
	 'year',
	 'y',
	 'months',
	 'month',
	 'M',
	 'days',
	 'day',
	 'd',
	 'dates',
	 'date',
	 'D',
	 'hours',
	 'hour',
	 'h',
	 'minutes',
	 'minute',
	 'm',
	 'seconds',
	 'second',
	 's',
	 'milliseconds',
	 'millisecond',
	 'ms',
	 ],
      i,
      property;
   
   for (i = 0; i < properties.length; i += 1) {
      property = properties[i];
      propertyTest = propertyTest || hasOwnProp(input, property);
   }
   
   return objectTest && propertyTest;
}

function isNumberOrStringArray(input) {
   var arrayTest = isArray(input),
      dataTypeTest = false;
   if (arrayTest) {
      dataTypeTest =
	 input.filter(function (item) {
	    return !isNumber(item) && isString(input);
	 }).length === 0;
   }
   return arrayTest && dataTypeTest;
}

function isCalendarSpec(input) {
   var objectTest = isObject(input) && !isObjectEmpty(input),
      propertyTest = false,
      properties = [
	 'sameDay',
	 'nextDay',
	 'lastDay',
	 'nextWeek',
	 'lastWeek',
	 'sameElse',
	 ],
      i,
      property;
   
   for (i = 0; i < properties.length; i += 1) {
      property = properties[i];
      propertyTest = propertyTest || hasOwnProp(input, property);
   }
   
   return objectTest && propertyTest;
}

function getCalendarFormat(myMoment, now) {
   var diff = myMoment.diff(now, 'days', true);
   return diff < -6
             ? 'sameElse'
      : diff < -1
	   ? 'lastWeek'
      : diff < 0
	   ? 'lastDay'
      : diff < 1
	   ? 'sameDay'
      : diff < 2
	   ? 'nextDay'
      : diff < 7
	   ? 'nextWeek'
      : 'sameElse';
}

function calendar$1(time, formats) {
   // Support for single parameter, formats only overload to the calendar function
   if (arguments.length === 1) {
      if (isMomentInput(arguments[0])) {
	 time = arguments[0];
	 formats = undefined;
      } else if (isCalendarSpec(arguments[0])) {
	 formats = arguments[0];
	 time = undefined;
      }
   }
   // We want to compare the start of today, vs this.
   // Getting start-of-today depends on whether we're local/utc/offset or not.
   var now = time || createLocal(),
      sod = cloneWithOffset(now, this).startOf('day'),
      format = moment.calendarFormat(this, sod) || 'sameElse',
      output =
	 formats &&
      (isFunction(formats[format])
	  ? formats[format].call(this, now)
	  : formats[format]);
///
   return this.format(
      output || this.localeData().calendar(format, this, createLocal(now))
	 );
}

function clone() {
   return new Moment(this);
}

function isAfter(input, units) {
   var localInput = isMoment(input) ? input : createLocal(input);
   if (!(this.isValid() && localInput.isValid())) {
      return false;
   }
   units = normalizeUnits(units) || 'millisecond';
   if (units === 'millisecond') {
      return this.valueOf() > localInput.valueOf();
   } else {
      return localInput.valueOf() < this.clone().startOf(units).valueOf();
   }
}

function isBefore(input, units) {
   var localInput = isMoment(input) ? input : createLocal(input);
   if (!(this.isValid() && localInput.isValid())) {
      return false;
   }
   units = normalizeUnits(units) || 'millisecond';
   if (units === 'millisecond') {
      return this.valueOf() < localInput.valueOf();
   } else {
      return this.clone().endOf(units).valueOf() < localInput.valueOf();
   }
}

function isBetween(from, to, units, inclusivity) {
   var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (
            (inclusivity[0] === '('
                ? this.isAfter(localFrom, units)
                : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')'
                ? this.isBefore(localTo, units)
                : !this.isAfter(localTo, units))
        );
    }

function isSame(input, units) {
   var localInput = isMoment(input) ? input : createLocal(input),
      inputMs;
   if (!(this.isValid() && localInput.isValid())) {
      return false;
   }
   units = normalizeUnits(units) || 'millisecond';
   if (units === 'millisecond') {
      return this.valueOf() === localInput.valueOf();
   } else {
      inputMs = localInput.valueOf();
      return (
	 this.clone().startOf(units).valueOf() <= inputMs &&
	 inputMs <= this.clone().endOf(units).valueOf()
            );
   }
}

function isSameOrAfter(input, units) {
   return this.isSame(input, units) || this.isAfter(input, units);
}

function isSameOrBefore(input, units) {
   return this.isSame(input, units) || this.isBefore(input, units);
}

function diff(input, units, asFloat) {
   var that, zoneDelta, output;
   
   if (!this.isValid()) {
      return NaN;
   }
   
   that = cloneWithOffset(input, this);

   if (!that.isValid()) {
      return NaN;
   }
   
   zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
   
   units = normalizeUnits(units);
   
   switch (units) {
      case 'year':
	 output = monthDiff(this, that) / 12;
	 break;
      case 'month':
	 output = monthDiff(this, that);
	 break;
      case 'quarter':
	 output = monthDiff(this, that) / 3;
	 break;
      case 'second':
	 output = (this - that) / 1e3;
	 break; // 1000
      case 'minute':
	 output = (this - that) / 6e4;
	 break; // 1000 * 60
      case 'hour':
	 output = (this - that) / 36e5;
	 break; // 1000 * 60 * 60
      case 'day':
	 output = (this - that - zoneDelta) / 864e5;
	 break; // 1000 * 60 * 60 * 24, negate dst
      case 'week':
	 output = (this - that - zoneDelta) / 6048e5;
	 break; // 1000 * 60 * 60 * 24 * 7, negate dst
      default:
	 output = this - that;
   }
   
   return asFloat ? output : absFloor(output);
}

function monthDiff(a, b) {
   if (a.date() < b.date()) {
      // end-of-month calculations work correct when the start month has more
      // days than the end month.
      return -monthDiff(b, a);
   }
   // difference in months
   var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
      // b is in (anchor - 1 month, anchor + 1 month)
      anchor = a.clone().add(wholeMonthDiff, 'months'),
      anchor2,
      adjust;
      
      if (b - anchor < 0) {
	 anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	 // linear across the month
	 adjust = (b - anchor) / (anchor - anchor2);
      } else {
	 anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	 // linear across the month
	 adjust = (b - anchor) / (anchor2 - anchor);
      }
      
      //check for negative zero, return zero if negative zero
      return -(wholeMonthDiff + adjust) || 0;
}

moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
moment.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

function toString() {
   return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
}

function toISOString(keepOffset) {
   if (!this.isValid()) {
      return null;
   }
   var utc = keepOffset !== true,
      m = utc ? this.clone().utc() : this;
   if (m.year() < 0 || m.year() > 9999) {
      return formatMoment(
	 m,
	 utc
	    ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
	 : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
	 );
   }
   if (isFunction(Date.prototype.toISOString)) {
      // native implementation is ~50x faster, use it when we can
      if (utc) {
	 return this.toDate().toISOString();
      } else {
	 return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
	    .toISOString()
	    .replace('Z', formatMoment(m, 'Z'));
      }
   }
   return formatMoment(
      m,
      utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
      );
}

/**
* Return a human readable representation of a moment that can
     							  * also be evaluated to get a new moment which is the same
     													       *
* @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
*/
function inspect() {
   if (!this.isValid()) {
      return 'moment.invalid(/* ' + this._i + ' */)';
   }
   var func = 'moment',
      zone = '',
      prefix,
      year,
      datetime,
      suffix;
   if (!this.isLocal()) {
      func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
      zone = 'Z';
   }
   prefix = '[' + func + '("]';
   year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
   datetime = '-MM-DD[T]HH:mm:ss.SSS';
   suffix = zone + '[")]';
   
   return this.format(prefix + year + datetime + suffix);
}

function format(inputString) {
   if (!inputString) {
      inputString = this.isUtc()
	 ? moment.defaultFormatUtc
	 : moment.defaultFormat;
   }
   var output = formatMoment(this, inputString);
   return this.localeData().postformat(output);
}

function from(time, withoutSuffix) {
if (
   this.isValid() &&
   ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
      ) {
   return createDuration({ to: this, from: time })
      .locale(this.locale())
      .humanize(!withoutSuffix);
} else {
   return this.localeData().invalidDate();
}
}

function fromNow(withoutSuffix) {
   return this.from(createLocal(), withoutSuffix);
}

function to(time, withoutSuffix) {
   if (
      this.isValid() &&
      ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
         ) {
      return createDuration({ from: this, to: time })
	 .locale(this.locale())
	 .humanize(!withoutSuffix);
   } else {
      return this.localeData().invalidDate();
   }
}

function toNow(withoutSuffix) {
   return this.to(createLocal(), withoutSuffix);
}

// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function locale(key) {
   var newLocaleData;
   
   if (key === undefined) {
      return this._locale._abbr;
   } else {
      newLocaleData = getLocale(key);
      if (newLocaleData != null) {
	 this._locale = newLocaleData;
      }
      return this;
   }
}

var lang = deprecate(
   'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
   function (key) {
      if (key === undefined) {
	 return this.localeData();
      } else {
	 return this.locale(key);
      }
   }
   );

function localeData() {
   return this._locale;
}

var MS_PER_SECOND = 1000,
   MS_PER_MINUTE = 60 * MS_PER_SECOND,
   MS_PER_HOUR = 60 * MS_PER_MINUTE,
   MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

// actual modulo - handles negative numbers (for dates before 1970):
function mod$1(dividend, divisor) {
   return ((dividend % divisor) + divisor) % divisor;
}

function localStartOfDate(y, m, d) {
   // the date constructor remaps years 0-99 to 1900-1999
   if (y < 100 && y >= 0) {
      // preserve leap years using a full 400 year cycle, then reset
      return new Date(y + 400, m, d) - MS_PER_400_YEARS;
   } else {
      return new Date(y, m, d).valueOf();
   }
}

function utcStartOfDate(y, m, d) {
   // Date.UTC remaps years 0-99 to 1900-1999
   if (y < 100 && y >= 0) {
      // preserve leap years using a full 400 year cycle, then reset
      return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
   } else {
      return Date.UTC(y, m, d);
   }
}

function startOf(units) {
   var time, startOfDate;
   units = normalizeUnits(units);
   if (units === undefined || units === 'millisecond' || !this.isValid()) {
      return this;
   }
   
   startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
   
   switch (units) {
      case 'year':
	 time = startOfDate(this.year(), 0, 1);
	 break;
      case 'quarter':
	 time = startOfDate(
	    this.year(),
	    this.month() - (this.month() % 3),
	    1
	    );
	 break;
      case 'month':
	 time = startOfDate(this.year(), this.month(), 1);
	 break;
      case 'week':
	 time = startOfDate(
	    this.year(),
	    this.month(),
	    this.date() - this.weekday()
	       );
	 break;
      case 'isoWeek':
	 time = startOfDate(
	    this.year(),
	    this.month(),
	    this.date() - (this.isoWeekday() - 1)
	       );
	 break;
      case 'day':
      case 'date':
	 time = startOfDate(this.year(), this.month(), this.date());
	 break;
      case 'hour':
	 time = this._d.valueOf();
	 time -= mod$1(
	    time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
	    MS_PER_HOUR
	       );
	 break;
      case 'minute':
	 time = this._d.valueOf();
	 time -= mod$1(time, MS_PER_MINUTE);
	 break;
      case 'second':
	 time = this._d.valueOf();
	 time -= mod$1(time, MS_PER_SECOND);
	 break;
   }
   
   this._d.setTime(time);
   moment.updateOffset(this, true);
   return this;
}

function endOf(units) {
   var time, startOfDate;
   units = normalizeUnits(units);
   if (units === undefined || units === 'millisecond' || !this.isValid()) {
      return this;
   }
   
   startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
   
   switch (units) {
      case 'year':
	 time = startOfDate(this.year() + 1, 0, 1) - 1;
	 break;
      case 'quarter':
	 time =
	    startOfDate(
	       this.year(),
	       this.month() - (this.month() % 3) + 3,
	       1
	       ) - 1;
                    break;
      case 'month':
	 time = startOfDate(this.year(), this.month() + 1, 1) - 1;
	 break;
      case 'week':
	 time =
	    startOfDate(
	       this.year(),
	       this.month(),
	       this.date() - this.weekday() + 7
	       ) - 1;
                 break;
      case 'isoWeek':
	 time =
	    startOfDate(
	       this.year(),
	       this.month(),
	       this.date() - (this.isoWeekday() - 1) + 7
	       ) - 1;
                    break;
      case 'day':
      case 'date':
	 time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
	 break;
      case 'hour':
	 time = this._d.valueOf();
	 time +=
	    MS_PER_HOUR -
	 mod$1(
	    time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
	    MS_PER_HOUR
	       ) -
	    1;
	 break;
      case 'minute':
	 time = this._d.valueOf();
	 time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
	 break;
      case 'second':
	 time = this._d.valueOf();
	 time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
	 break;
   }
   
   this._d.setTime(time);
   moment.updateOffset(this, true);
   return this;
}

function valueOf() {
   return this._d.valueOf() - (this._offset || 0) * 60000;
}

function unix() {
   return Math.floor(this.valueOf() / 1000);
}

function toDate() {
   return new Date(this.valueOf());
}

function toArray() {
   var m = this;
   return [
      m.year(),
      m.month(),
      m.date(),
      m.hour(),
      m.minute(),
      m.second(),
      m.millisecond(),
      ];
}

function toObject() {
   var m = this;
   return {
      years: m.year(),
      months: m.month(),
      date: m.date(),
      hours: m.hours(),
      minutes: m.minutes(),
      seconds: m.seconds(),
      milliseconds: m.milliseconds(),
   };
}

function toJSON() {
   // new Date(NaN).toJSON() === null
   return this.isValid() ? this.toISOString() : null;
}

function isValid$2() {
   return isValid(this);
}

function parsingFlags() {
   return extend({}, getParsingFlags(this));
}

function invalidAt() {
   return getParsingFlags(this).overflow;
}

function creationData() {
   return {
      input: this._i,
      format: this._f,
      locale: this._locale,
      isUTC: this._isUTC,
      strict: this._strict,
   };
}

addFormatToken('N', 0, 0, 'eraAbbr');
addFormatToken('NN', 0, 0, 'eraAbbr');
addFormatToken('NNN', 0, 0, 'eraAbbr');
addFormatToken('NNNN', 0, 0, 'eraName');
addFormatToken('NNNNN', 0, 0, 'eraNarrow');

addFormatToken('y', ['y', 1], 'yo', 'eraYear');
addFormatToken('y', ['yy', 2], 0, 'eraYear');
addFormatToken('y', ['yyy', 3], 0, 'eraYear');
addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

addRegexToken('N', matchEraAbbr);
addRegexToken('NN', matchEraAbbr);
addRegexToken('NNN', matchEraAbbr);
addRegexToken('NNNN', matchEraName);
addRegexToken('NNNNN', matchEraNarrow);

addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
        					      input,
        					      array,
        					      config,
        					      token
    							 ) {
   var era = config._locale.erasParse(input, token, config._strict);
   if (era) {
      getParsingFlags(config).era = era;
   } else {
      getParsingFlags(config).invalidEra = input;
   }
});

addRegexToken('y', matchUnsigned);
addRegexToken('yy', matchUnsigned);
addRegexToken('yyy', matchUnsigned);
addRegexToken('yyyy', matchUnsigned);
addRegexToken('yo', matchEraYearOrdinal);

addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
addParseToken(['yo'], function (input, array, config, token) {
   var match;
   if (config._locale._eraYearOrdinalRegex) {
      match = input.match(config._locale._eraYearOrdinalRegex);
   }
   
   if (config._locale.eraYearOrdinalParse) {
      array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
   } else {
      array[YEAR] = parseInt(input, 10);
   }
});

function localeEras(m, format) {
   var i,
      l,
      date,
      eras = this._eras || getLocale('en')._eras;
   for (i = 0, l = eras.length; i < l; ++i) {
      switch (typeof eras[i].since) {
	 case 'string':
	    // truncate time
	    date = moment(eras[i].since).startOf('day');
	    eras[i].since = date.valueOf();
	    break;
      }
      
      switch (typeof eras[i].until) {
	 case 'undefined':
	    eras[i].until = +Infinity;
                    	 break;
	 case 'string':
	    // truncate time
	    date = moment(eras[i].until).startOf('day').valueOf();
	    eras[i].until = date.valueOf();
	    break;
      }
   }
   return eras;
}

function localeErasParse(eraName, format, strict) {
   var i,
      l,
      eras = this.eras(),
      name,
      abbr,
      narrow;
   eraName = eraName.toUpperCase();
   
   for (i = 0, l = eras.length; i < l; ++i) {
      name = eras[i].name.toUpperCase();
      abbr = eras[i].abbr.toUpperCase();
      narrow = eras[i].narrow.toUpperCase();
      
      if (strict) {
	 switch (format) {
	    case 'N':
	    case 'NN':
	    case 'NNN':
	       if (abbr === eraName) {
		  return eras[i];
	       }
	       break;
	       
	    case 'NNNN':
	       if (name === eraName) {
		  return eras[i];
	       }
	       break;
	       
	    case 'NNNNN':
	       if (narrow === eraName) {
		  return eras[i];
	       }
	       break;
	 }
      } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
	 return eras[i];
      }
   }
}

function localeErasConvertYear(era, year) {
   var dir = era.since <= era.until ? +1 : -1;
   if (year === undefined) {
      return moment(era.since).year();
   } else {
      return moment(era.since).year() + (year - era.offset) * dir;
   }
}

function getEraName() {
   var i,
      l,
      val,
      eras = this.localeData().eras();
   for (i = 0, l = eras.length; i < l; ++i) {
      // truncate time
      val = this.startOf('day').valueOf();
      
      if (eras[i].since <= val && val <= eras[i].until) {
	 return eras[i].name;
      }
      if (eras[i].until <= val && val <= eras[i].since) {
	 return eras[i].name;
      }
   }
   
   return '';
}

function getEraNarrow() {
   var i,
      l,
      val,
      eras = this.localeData().eras();
   for (i = 0, l = eras.length; i < l; ++i) {
      // truncate time
      val = this.startOf('day').valueOf();
      
      if (eras[i].since <= val && val <= eras[i].until) {
	 return eras[i].narrow;
      }
      if (eras[i].until <= val && val <= eras[i].since) {
	 return eras[i].narrow;
      }
   }
   
   return '';
}

function getEraAbbr() {
   var i,
      l,
      val,
      eras = this.localeData().eras();
   for (i = 0, l = eras.length; i < l; ++i) {
      // truncate time
      val = this.startOf('day').valueOf();
      
      if (eras[i].since <= val && val <= eras[i].until) {
	 return eras[i].abbr;
      }
      if (eras[i].until <= val && val <= eras[i].since) {
	 return eras[i].abbr;
      }
   }
   
   return '';
}

function getEraYear() {
   var i,
      l,
      dir,
      val,
      eras = this.localeData().eras();
   for (i = 0, l = eras.length; i < l; ++i) {
      dir = eras[i].since <= eras[i].until ? +1 : -1;
      
      // truncate time
      val = this.startOf('day').valueOf();
      
      if (
	 (eras[i].since <= val && val <= eras[i].until) ||
	 (eras[i].until <= val && val <= eras[i].since)
            ) {
	 return (
	    (this.year() - moment(eras[i].since).year()) * dir +
	    eras[i].offset
	       );
      }
   }
   
   return this.year();
}

function erasNameRegex(isStrict) {
   if (!hasOwnProp(this, '_erasNameRegex')) {
      computeErasParse.call(this);
   }
   return isStrict ? this._erasNameRegex : this._erasRegex;
}

function erasAbbrRegex(isStrict) {
   if (!hasOwnProp(this, '_erasAbbrRegex')) {
      computeErasParse.call(this);
   }
   return isStrict ? this._erasAbbrRegex : this._erasRegex;
}

function erasNarrowRegex(isStrict) {
   if (!hasOwnProp(this, '_erasNarrowRegex')) {
      computeErasParse.call(this);
   }
   return isStrict ? this._erasNarrowRegex : this._erasRegex;
}

function matchEraAbbr(isStrict, locale) {
   return locale.erasAbbrRegex(isStrict);
}

function matchEraName(isStrict, locale) {
   return locale.erasNameRegex(isStrict);
}

function matchEraNarrow(isStrict, locale) {
   return locale.erasNarrowRegex(isStrict);
}

function matchEraYearOrdinal(isStrict, locale) {
   return locale._eraYearOrdinalRegex || matchUnsigned;
}

function computeErasParse() {
   var abbrPieces = [],
      namePieces = [],
      narrowPieces = [],
      mixedPieces = [],
      i,
      l,
      eras = this.eras();
   
   for (i = 0, l = eras.length; i < l; ++i) {
      namePieces.push(regexEscape(eras[i].name));
      abbrPieces.push(regexEscape(eras[i].abbr));
      narrowPieces.push(regexEscape(eras[i].narrow));
      
      mixedPieces.push(regexEscape(eras[i].name));
      mixedPieces.push(regexEscape(eras[i].abbr));
      mixedPieces.push(regexEscape(eras[i].narrow));
   }
   
   this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
   this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
   this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
   this._erasNarrowRegex = new RegExp(
      '^(' + narrowPieces.join('|') + ')',
      'i'
      );
}

// FORMATTING

addFormatToken(0, ['gg', 2], 0, function () {
   return this.weekYear() % 100;
});

addFormatToken(0, ['GG', 2], 0, function () {
   return this.isoWeekYear() % 100;
});

function addWeekYearFormatToken(token, getter) {
   addFormatToken(0, [token, token.length], 0, getter);
}

addWeekYearFormatToken('gggg', 'weekYear');
addWeekYearFormatToken('ggggg', 'weekYear');
addWeekYearFormatToken('GGGG', 'isoWeekYear');
addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES

addUnitAlias('weekYear', 'gg');
addUnitAlias('isoWeekYear', 'GG');

// PRIORITY

addUnitPriority('weekYear', 1);
addUnitPriority('isoWeekYear', 1);

// PARSING

addRegexToken('G', matchSigned);
addRegexToken('g', matchSigned);
addRegexToken('GG', match1to2, match2);
addRegexToken('gg', match1to2, match2);
addRegexToken('GGGG', match1to4, match4);
addRegexToken('gggg', match1to4, match4);
addRegexToken('GGGGG', match1to6, match6);
addRegexToken('ggggg', match1to6, match6);

addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
        						 input,
        						 week,
        						 config,
        						 token
    							    ) {
   week[token.substr(0, 2)] = toInt(input);
});

addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
   week[token] = moment.parseTwoDigitYear(input);
});

// MOMENTS

function getSetWeekYear(input) {
   return getSetWeekYearHelper.call(
      this,
      input,
      this.week(),
      this.weekday(),
      this.localeData()._week.dow,
      this.localeData()._week.doy
         );
}

function getSetISOWeekYear(input) {
   return getSetWeekYearHelper.call(
      this,
      input,
      this.isoWeek(),
      this.isoWeekday(),
      1,
      4
      );
}

function getISOWeeksInYear() {
   return weeksInYear(this.year(), 1, 4);
}

function getISOWeeksInISOWeekYear() {
   return weeksInYear(this.isoWeekYear(), 1, 4);
}

function getWeeksInYear() {
   var weekInfo = this.localeData()._week;
   return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
}

function getWeeksInWeekYear() {
   var weekInfo = this.localeData()._week;
   return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
}

function getSetWeekYearHelper(input, week, weekday, dow, doy) {
   var weeksTarget;
   if (input == null) {
      return weekOfYear(this, dow, doy).year;
   } else {
      weeksTarget = weeksInYear(input, dow, doy);
      if (week > weeksTarget) {
	 week = weeksTarget;
      }
      return setWeekAll.call(this, input, week, weekday, dow, doy);
   }
}

function setWeekAll(weekYear, week, weekday, dow, doy) {
   var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
      date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
   
   this.year(date.getUTCFullYear());
   this.month(date.getUTCMonth());
   this.date(date.getUTCDate());
   return this;
}

// FORMATTING

addFormatToken('Q', 0, 'Qo', 'quarter');

// ALIASES

addUnitAlias('quarter', 'Q');

// PRIORITY

addUnitPriority('quarter', 7);

// PARSING

addRegexToken('Q', match1);
addParseToken('Q', function (input, array) {
   array[MONTH] = (toInt(input) - 1) * 3;
});

// MOMENTS

function getSetQuarter(input) {
   return input == null
             ? Math.ceil((this.month() + 1) / 3)
      : this.month((input - 1) * 3 + (this.month() % 3));
}

// FORMATTING

addFormatToken('D', ['DD', 2], 'Do', 'date');

// ALIASES

addUnitAlias('date', 'D');

// PRIORITY
addUnitPriority('date', 9);

// PARSING

addRegexToken('D', match1to2);
addRegexToken('DD', match1to2, match2);
addRegexToken('Do', function (isStrict, locale) {
   // TODO: Remove "ordinalParse" fallback in next major release.
   return isStrict
             ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
      : locale._dayOfMonthOrdinalParseLenient;
});

addParseToken(['D', 'DD'], DATE);
addParseToken('Do', function (input, array) {
   array[DATE] = toInt(input.match(match1to2)[0]);
});

// MOMENTS

var getSetDayOfMonth = makeGetSet('Date', true);

// FORMATTING

addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

// ALIASES

addUnitAlias('dayOfYear', 'DDD');

// PRIORITY
addUnitPriority('dayOfYear', 4);

// PARSING

addRegexToken('DDD', match1to3);
addRegexToken('DDDD', match3);
addParseToken(['DDD', 'DDDD'], function (input, array, config) {
   config._dayOfYear = toInt(input);
});

// HELPERS

// MOMENTS

function getSetDayOfYear(input) {
   var dayOfYear =
      Math.round(
	 (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
	 ) + 1;
   return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
}

// FORMATTING

addFormatToken('m', ['mm', 2], 0, 'minute');

// ALIASES

addUnitAlias('minute', 'm');

// PRIORITY

addUnitPriority('minute', 14);

// PARSING

addRegexToken('m', match1to2);
addRegexToken('mm', match1to2, match2);
addParseToken(['m', 'mm'], MINUTE);

// MOMENTS

var getSetMinute = makeGetSet('Minutes', false);

// FORMATTING

addFormatToken('s', ['ss', 2], 0, 'second');

// ALIASES

addUnitAlias('second', 's');

// PRIORITY

addUnitPriority('second', 15);

// PARSING

addRegexToken('s', match1to2);
addRegexToken('ss', match1to2, match2);
addParseToken(['s', 'ss'], SECOND);

// MOMENTS

var getSetSecond = makeGetSet('Seconds', false);

// FORMATTING

addFormatToken('S', 0, 0, function () {
   return ~~(this.millisecond() / 100);
});

addFormatToken(0, ['SS', 2], 0, function () {
   return ~~(this.millisecond() / 10);
});

addFormatToken(0, ['SSS', 3], 0, 'millisecond');
addFormatToken(0, ['SSSS', 4], 0, function () {
   return this.millisecond() * 10;
});
addFormatToken(0, ['SSSSS', 5], 0, function () {
   return this.millisecond() * 100;
});
addFormatToken(0, ['SSSSSS', 6], 0, function () {
   return this.millisecond() * 1000;
});
addFormatToken(0, ['SSSSSSS', 7], 0, function () {
   return this.millisecond() * 10000;
});
addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
   return this.millisecond() * 100000;
});
addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
   return this.millisecond() * 1000000;
});

// ALIASES

addUnitAlias('millisecond', 'ms');

// PRIORITY

addUnitPriority('millisecond', 16);

// PARSING

addRegexToken('S', match1to3, match1);
addRegexToken('SS', match1to3, match2);
addRegexToken('SSS', match1to3, match3);

var token, getSetMillisecond;
for (token = 'SSSS'; token.length <= 9; token += 'S') {
   addRegexToken(token, matchUnsigned);
}

function parseMs(input, array) {
   array[MILLISECOND] = toInt(('0.' + input) * 1000);
}

for (token = 'S'; token.length <= 9; token += 'S') {
   addParseToken(token, parseMs);
}

getSetMillisecond = makeGetSet('Milliseconds', false);

// FORMATTING

addFormatToken('z', 0, 0, 'zoneAbbr');
addFormatToken('zz', 0, 0, 'zoneName');

// MOMENTS

function getZoneAbbr() {
   return this._isUTC ? 'UTC' : '';
}

function getZoneName() {
   return this._isUTC ? 'Coordinated Universal Time' : '';
}

var proto = Moment.prototype;

proto.add = add;
proto.calendar = calendar$1;
proto.clone = clone;
proto.diff = diff;
proto.endOf = endOf;
proto.format = format;
proto.from = from;
proto.fromNow = fromNow;
proto.to = to;
proto.toNow = toNow;
proto.get = stringGet;
proto.invalidAt = invalidAt;
proto.isAfter = isAfter;
proto.isBefore = isBefore;
proto.isBetween = isBetween;
proto.isSame = isSame;
proto.isSameOrAfter = isSameOrAfter;
proto.isSameOrBefore = isSameOrBefore;
proto.isValid = isValid$2;
proto.lang = lang;
proto.locale = locale;
proto.localeData = localeData;
proto.max = prototypeMax;
proto.min = prototypeMin;
proto.parsingFlags = parsingFlags;
proto.set = stringSet;
proto.startOf = startOf;
proto.subtract = subtract;
proto.toArray = toArray;
proto.toObject = toObject;
proto.toDate = toDate;
proto.toISOString = toISOString;
proto.inspect = inspect;
if (typeof Symbol !== 'undefined' && Symbol.for != null) {
   proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
      return 'Moment<' + this.format() + '>';
   };
}
proto.toJSON = toJSON;
proto.toString = toString;
proto.unix = unix;
proto.valueOf = valueOf;
proto.creationData = creationData;
proto.eraName = getEraName;
proto.eraNarrow = getEraNarrow;
proto.eraAbbr = getEraAbbr;
proto.eraYear = getEraYear;
proto.year = getSetYear;
proto.isLeapYear = getIsLeapYear;
proto.weekYear = getSetWeekYear;
proto.isoWeekYear = getSetISOWeekYear;
proto.quarter = proto.quarters = getSetQuarter;
proto.month = getSetMonth;
proto.daysInMonth = getDaysInMonth;
proto.week = proto.weeks = getSetWeek;
proto.isoWeek = proto.isoWeeks = getSetISOWeek;
proto.weeksInYear = getWeeksInYear;
proto.weeksInWeekYear = getWeeksInWeekYear;
proto.isoWeeksInYear = getISOWeeksInYear;
proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
proto.date = getSetDayOfMonth;
proto.day = proto.days = getSetDayOfWeek;
proto.weekday = getSetLocaleDayOfWeek;
proto.isoWeekday = getSetISODayOfWeek;
proto.dayOfYear = getSetDayOfYear;
proto.hour = proto.hours = getSetHour;
proto.minute = proto.minutes = getSetMinute;
proto.second = proto.seconds = getSetSecond;
proto.millisecond = proto.milliseconds = getSetMillisecond;
proto.utcOffset = getSetOffset;
proto.utc = setOffsetToUTC;
proto.local = setOffsetToLocal;
proto.parseZone = setOffsetToParsedOffset;
proto.hasAlignedHourOffset = hasAlignedHourOffset;
proto.isDST = isDaylightSavingTime;
proto.isLocal = isLocal;
proto.isUtcOffset = isUtcOffset;
proto.isUtc = isUtc;
proto.isUTC = isUtc;
proto.zoneAbbr = getZoneAbbr;
proto.zoneName = getZoneName;
proto.dates = deprecate(
   'dates accessor is deprecated. Use date instead.',
   getSetDayOfMonth
      );
proto.months = deprecate(
   'months accessor is deprecated. Use month instead',
   getSetMonth
      );
proto.years = deprecate(
   'years accessor is deprecated. Use year instead',
   getSetYear
      );
proto.zone = deprecate(
   'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
   getSetZone
      );
proto.isDSTShifted = deprecate(
   'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
   isDaylightSavingTimeShifted
      );

function createUnix(input) {
   return createLocal(input * 1000);
}

function createInZone() {
   return createLocal.apply(null, arguments).parseZone();
}

function preParsePostFormat(string) {
   return string;
}

var proto$1 = Locale.prototype;

proto$1.calendar = calendar;
proto$1.longDateFormat = longDateFormat;
proto$1.invalidDate = invalidDate;
proto$1.ordinal = ordinal;
proto$1.preparse = preParsePostFormat;
proto$1.postformat = preParsePostFormat;
proto$1.relativeTime = relativeTime;
proto$1.pastFuture = pastFuture;
proto$1.set = set;
proto$1.eras = localeEras;
proto$1.erasParse = localeErasParse;
proto$1.erasConvertYear = localeErasConvertYear;
proto$1.erasAbbrRegex = erasAbbrRegex;
proto$1.erasNameRegex = erasNameRegex;
proto$1.erasNarrowRegex = erasNarrowRegex;

proto$1.months = localeMonths;
proto$1.monthsShort = localeMonthsShort;
proto$1.monthsParse = localeMonthsParse;
proto$1.monthsRegex = monthsRegex;
proto$1.monthsShortRegex = monthsShortRegex;
proto$1.week = localeWeek;
proto$1.firstDayOfYear = localeFirstDayOfYear;
proto$1.firstDayOfWeek = localeFirstDayOfWeek;

proto$1.weekdays = localeWeekdays;
proto$1.weekdaysMin = localeWeekdaysMin;
proto$1.weekdaysShort = localeWeekdaysShort;
proto$1.weekdaysParse = localeWeekdaysParse;

proto$1.weekdaysRegex = weekdaysRegex;
proto$1.weekdaysShortRegex = weekdaysShortRegex;
proto$1.weekdaysMinRegex = weekdaysMinRegex;

proto$1.isPM = localeIsPM;
proto$1.meridiem = localeMeridiem;

function get$1(format, index, field, setter) {
   var locale = getLocale(),
      utc = createUTC().set(setter, index);
   return locale[field](utc, format);
}

function listMonthsImpl(format, index, field) {
   if (isNumber(format)) {
      index = format;
      format = undefined;
   }
   
   format = format || '';
   
   if (index != null) {
      return get$1(format, index, field, 'month');
   }
   
   var i,
      out = [];
   for (i = 0; i < 12; i++) {
      out[i] = get$1(format, i, field, 'month');
   }
   return out;
}

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function listWeekdaysImpl(localeSorted, format, index, field) {
   if (typeof localeSorted === 'boolean') {
      if (isNumber(format)) {
	 index = format;
	 format = undefined;
      }
      
      format = format || '';
   } else {
      format = localeSorted;
      index = format;
      localeSorted = false;
      
      if (isNumber(format)) {
	 index = format;
	 format = undefined;
      }
      
      format = format || '';
   }
   
   var locale = getLocale(),
      shift = localeSorted ? locale._week.dow : 0,
      i,
      out = [];
   
   if (index != null) {
      return get$1(format, (index + shift) % 7, field, 'day');
   }
   
   for (i = 0; i < 7; i++) {
      out[i] = get$1(format, (i + shift) % 7, field, 'day');
   }
   return out;
}

function listMonths(format, index) {
   return listMonthsImpl(format, index, 'months');
}

function listMonthsShort(format, index) {
   return listMonthsImpl(format, index, 'monthsShort');
}

function listWeekdays(localeSorted, format, index) {
   return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
}

function listWeekdaysShort(localeSorted, format, index) {
   return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
}

function listWeekdaysMin(localeSorted, format, index) {
   return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
}

getSetGlobalLocale('en', {
   eras: [
      {
	 since: '0001-01-01',
	 until: +Infinity,
	 offset: 1,
	 name: 'Anno Domini',
	 narrow: 'AD',
	 abbr: 'AD',
      },
      {
	 since: '0000-12-31',
	 until: -Infinity,
	 offset: 1,
	 name: 'Before Christ',
	 narrow: 'BC',
	 abbr: 'BC',
      },
      ],
   dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
   ordinal: function (number) {
      var b = number % 10,
	 output =
	    toInt((number % 100) / 10) === 1
	       ? 'th'
	    : b === 1
		 ? 'st'
	    : b === 2
		 ? 'nd'
	    : b === 3
		 ? 'rd'
	    : 'th';
              return number + output;
   },
});

// Side effect imports

moment.lang = deprecate(
   'moment.lang is deprecated. Use moment.locale instead.',
   getSetGlobalLocale
      );
moment.langData = deprecate(
   'moment.langData is deprecated. Use moment.localeData instead.',
   getLocale
      );

var mathAbs = Math.abs;

function abs() {
   var data = this._data;
   
   this._milliseconds = mathAbs(this._milliseconds);
   this._days = mathAbs(this._days);
   this._months = mathAbs(this._months);
   
   data.milliseconds = mathAbs(data.milliseconds);
   data.seconds = mathAbs(data.seconds);
   data.minutes = mathAbs(data.minutes);
   data.hours = mathAbs(data.hours);
   data.months = mathAbs(data.months);
   data.years = mathAbs(data.years);
   
   return this;
}

function addSubtract$1(duration, input, value, direction) {
   var other = createDuration(input, value);
   
   duration._milliseconds += direction * other._milliseconds;
   duration._days += direction * other._days;
   duration._months += direction * other._months;
   
   return duration._bubble();
}

// supports only 2.0-style add(1, 's') or add(duration)
function add$1(input, value) {
   return addSubtract$1(this, input, value, 1);
}

// supports only 2.0-style subtract(1, 's') or subtract(duration)
function subtract$1(input, value) {
   return addSubtract$1(this, input, value, -1);
}

function absCeil(number) {
   if (number < 0) {
      return Math.floor(number);
   } else {
      return Math.ceil(number);
   }
}

function bubble() {
   var milliseconds = this._milliseconds,
      days = this._days,
      months = this._months,
      data = this._data,
      seconds,
      minutes,
      hours,
      years,
      monthsFromDays;
   
   // if we have a mix of positive and negative values, bubble down first
   // check: https://github.com/moment/moment/issues/2166
   if (
      !(
	 (milliseconds >= 0 && days >= 0 && months >= 0) ||
	 (milliseconds <= 0 && days <= 0 && months <= 0)
            )
         ) {
      milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
      days = 0;
      months = 0;
   }
   
   // The following code bubbles up values, see the tests for
   // examples of what that means.
   data.milliseconds = milliseconds % 1000;
   
   seconds = absFloor(milliseconds / 1000);
   data.seconds = seconds % 60;
   
   minutes = absFloor(seconds / 60);
   data.minutes = minutes % 60;
   
   hours = absFloor(minutes / 60);
   data.hours = hours % 24;
   
   days += absFloor(hours / 24);
   
   // convert days to months
   monthsFromDays = absFloor(daysToMonths(days));
   months += monthsFromDays;
   days -= absCeil(monthsToDays(monthsFromDays));
   
   // 12 months -> 1 year
   years = absFloor(months / 12);
   months %= 12;
   
   data.days = days;
   data.months = months;
   data.years = years;
   
   return this;
}

function daysToMonths(days) {
   // 400 years have 146097 days (taking into account leap year rules)
   // 400 years have 12 months === 4800
   return (days * 4800) / 146097;
}

function monthsToDays(months) {
   // the reverse of daysToMonths
   return (months * 146097) / 4800;
}

function as(units) {
   if (!this.isValid()) {
      return NaN;
   }
   var days,
      months,
      milliseconds = this._milliseconds;
   
   units = normalizeUnits(units);
   
   if (units === 'month' || units === 'quarter' || units === 'year') {
      days = this._days + milliseconds / 864e5;
      months = this._months + daysToMonths(days);
      switch (units) {
	 case 'month':
	    return months;
	 case 'quarter':
	    return months / 3;
	 case 'year':
	    return months / 12;
      }
   } else {
      // handle milliseconds separately because of floating point math errors (issue #1867)
      days = this._days + Math.round(monthsToDays(this._months));
      switch (units) {
	 case 'week':
	    return days / 7 + milliseconds / 6048e5;
	 case 'day':
	    return days + milliseconds / 864e5;
	 case 'hour':
	    return days * 24 + milliseconds / 36e5;
	 case 'minute':
	    return days * 1440 + milliseconds / 6e4;
	 case 'second':
	    return days * 86400 + milliseconds / 1000;
	    // Math.floor prevents floating point math errors here
	 case 'millisecond':
	    return Math.floor(days * 864e5) + milliseconds;
	 default:
	    throw new Error('Unknown unit ' + units);
      }
   }
}

// TODO: Use this.as('ms')?
function valueOf$1() {
   if (!this.isValid()) {
      return NaN;
   }
   return (
      this._milliseconds +
      this._days * 864e5 +
      (this._months % 12) * 2592e6 +
      toInt(this._months / 12) * 31536e6
      );
}

function makeAs(alias) {
   return function () {
      return this.as(alias);
   };
}

var asMilliseconds = makeAs('ms'),
   asSeconds = makeAs('s'),
   asMinutes = makeAs('m'),
   asHours = makeAs('h'),
   asDays = makeAs('d'),
   asWeeks = makeAs('w'),
   asMonths = makeAs('M'),
   asQuarters = makeAs('Q'),
   asYears = makeAs('y');

function clone$1() {
   return createDuration(this);
}

function get$2(units) {
   units = normalizeUnits(units);
   return this.isValid() ? this[units + 's']() : NaN;
}

function makeGetter(name) {
   return function () {
      return this.isValid() ? this._data[name] : NaN;
   };
}

var milliseconds = makeGetter('milliseconds'),
   seconds = makeGetter('seconds'),
   minutes = makeGetter('minutes'),
   hours = makeGetter('hours'),
   days = makeGetter('days'),
   months = makeGetter('months'),
   years = makeGetter('years');

function weeks() {
   return absFloor(this.days() / 7);
}

var round = Math.round,
   thresholds = {
      ss: 44, // a few seconds to seconds
      s: 45, // seconds to minute
      m: 45, // minutes to hour
      h: 22, // hours to day
      d: 26, // days to month/week
      w: null, // weeks to month
      M: 11, // months to year
   };

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
   return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
}

function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
   var duration = createDuration(posNegDuration).abs(),
      seconds = round(duration.as('s')),
      minutes = round(duration.as('m')),
      hours = round(duration.as('h')),
      days = round(duration.as('d')),
      months = round(duration.as('M')),
      weeks = round(duration.as('w')),
      years = round(duration.as('y')),
      a =
	 (seconds <= thresholds.ss && ['s', seconds]) ||
      (seconds < thresholds.s && ['ss', seconds]) ||
	 (minutes <= 1 && ['m']) ||
      (minutes < thresholds.m && ['mm', minutes]) ||
	 (hours <= 1 && ['h']) ||
      (hours < thresholds.h && ['hh', hours]) ||
	 (days <= 1 && ['d']) ||
      (days < thresholds.d && ['dd', days]);
	 
         if (thresholds.w != null) {
            a =
	       a ||
	    (weeks <= 1 && ['w']) ||
	       (weeks < thresholds.w && ['ww', weeks]);
         }
         a = a ||
	 (months <= 1 && ['M']) ||
	 (months < thresholds.M && ['MM', months]) ||
	 (years <= 1 && ['y']) || ['yy', years];
	 
         a[2] = withoutSuffix;
         a[3] = +posNegDuration > 0;
         a[4] = locale;
         return substituteTimeAgo.apply(null, a);
}

// This function allows you to set the rounding function for relative time strings
function getSetRelativeTimeRounding(roundingFunction) {
   if (roundingFunction === undefined) {
      return round;
   }
   if (typeof roundingFunction === 'function') {
      round = roundingFunction;
      return true;
   }
   return false;
}

// This function allows you to set a threshold for relative time strings
function getSetRelativeTimeThreshold(threshold, limit) {
   if (thresholds[threshold] === undefined) {
      return false;
   }
   if (limit === undefined) {
      return thresholds[threshold];
   }
   thresholds[threshold] = limit;
   if (threshold === 's') {
      thresholds.ss = limit - 1;
   }
   return true;
}

function humanize(argWithSuffix, argThresholds) {
   if (!this.isValid()) {
      return this.localeData().invalidDate();
   }
   
   var withSuffix = false,
      th = thresholds,
      locale,
      output;
   
   if (typeof argWithSuffix === 'object') {
      argThresholds = argWithSuffix;
      argWithSuffix = false;
   }
   if (typeof argWithSuffix === 'boolean') {
      withSuffix = argWithSuffix;
   }
   if (typeof argThresholds === 'object') {
      th = Object.assign({}, thresholds, argThresholds);
      if (argThresholds.s != null && argThresholds.ss == null) {
	 th.ss = argThresholds.s - 1;
      }
   }
   
   locale = this.localeData();
   output = relativeTime$1(this, !withSuffix, th, locale);
   
   if (withSuffix) {
      output = locale.pastFuture(+this, output);
   }
   
   return locale.postformat(output);
}

var abs$1 = Math.abs;

function sign(x) {
   return (x > 0) - (x < 0) || +x;
}

function toISOString$1() {
   // for ISO strings we do not use the normal bubbling rules:
   //  * milliseconds bubble up until they become hours
   //  * days do not bubble at all
   //  * months bubble up until they become years
   // This is because there is no context-free conversion between hours and days
   // (think of clock changes)
   // and also not between days and months (28-31 days per month)
   if (!this.isValid()) {
      return this.localeData().invalidDate();
   }
   
   var seconds = abs$1(this._milliseconds) / 1000,
      days = abs$1(this._days),
      months = abs$1(this._months),
      minutes,
      hours,
      years,
      s,
      total = this.asSeconds(),
      totalSign,
      ymSign,
      daysSign,
      hmsSign;
   
   if (!total) {
      // this is the same as C#'s (Noda) and python (isodate)...
      // but not other JS (goog.date)
      return 'P0D';
   }
   
   // 3600 seconds -> 60 minutes -> 1 hour
   minutes = absFloor(seconds / 60);
   hours = absFloor(minutes / 60);
   seconds %= 60;
   minutes %= 60;
   
   // 12 months -> 1 year
   years = absFloor(months / 12);
   months %= 12;
   
   // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
   s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
   
   totalSign = total < 0 ? '-' : '';
   ymSign = sign(this._months) !== sign(total) ? '-' : '';
   daysSign = sign(this._days) !== sign(total) ? '-' : '';
   hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';
   
   return (
      totalSign +
      'P' +
      (years ? ymSign + years + 'Y' : '') +
      (months ? ymSign + months + 'M' : '') +
      (days ? daysSign + days + 'D' : '') +
      (hours || minutes || seconds ? 'T' : '') +
      (hours ? hmsSign + hours + 'H' : '') +
      (minutes ? hmsSign + minutes + 'M' : '') +
      (seconds ? hmsSign + s + 'S' : '')
         );
}

var proto$2 = Duration.prototype;

proto$2.isValid = isValid$1;
proto$2.abs = abs;
proto$2.add = add$1;
proto$2.subtract = subtract$1;
proto$2.as = as;
proto$2.asMilliseconds = asMilliseconds;
proto$2.asSeconds = asSeconds;
proto$2.asMinutes = asMinutes;
proto$2.asHours = asHours;
proto$2.asDays = asDays;
proto$2.asWeeks = asWeeks;
proto$2.asMonths = asMonths;
proto$2.asQuarters = asQuarters;
proto$2.asYears = asYears;
proto$2.valueOf = valueOf$1;
proto$2._bubble = bubble;
proto$2.clone = clone$1;
proto$2.get = get$2;
proto$2.milliseconds = milliseconds;
proto$2.seconds = seconds;
proto$2.minutes = minutes;
proto$2.hours = hours;
proto$2.days = days;
proto$2.weeks = weeks;
proto$2.months = months;
proto$2.years = years;
proto$2.humanize = humanize;
proto$2.toISOString = toISOString$1;
proto$2.toString = toISOString$1;
proto$2.toJSON = toISOString$1;
proto$2.locale = locale;
proto$2.localeData = localeData;

proto$2.toIsoString = deprecate(
   'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
   toISOString$1
      );
proto$2.lang = lang;

// FORMATTING

addFormatToken('X', 0, 0, 'unix');
addFormatToken('x', 0, 0, 'valueOf');

// PARSING

addRegexToken('x', matchSigned);
addRegexToken('X', matchTimestamp);
addParseToken('X', function (input, array, config) {
   config._d = new Date(parseFloat(input) * 1000);
});
addParseToken('x', function (input, array, config) {
   config._d = new Date(toInt(input));
});

//! moment.js

moment.version = '2.27.0';

setHookCallback(createLocal);

moment.fn = proto;
moment.min = min;
moment.max = max;
moment.now = now;
moment.utc = createUTC;
moment.unix = createUnix;
moment.months = listMonths;
moment.isDate = isDate;
moment.locale = getSetGlobalLocale;
moment.invalid = createInvalid;
moment.duration = createDuration;
moment.isMoment = isMoment;
moment.weekdays = listWeekdays;
moment.parseZone = createInZone;
moment.localeData = getLocale;
moment.isDuration = isDuration;
moment.monthsShort = listMonthsShort;
moment.weekdaysMin = listWeekdaysMin;
moment.defineLocale = defineLocale;
moment.updateLocale = updateLocale;
moment.locales = listLocales;
moment.weekdaysShort = listWeekdaysShort;
moment.normalizeUnits = normalizeUnits;
moment.relativeTimeRounding = getSetRelativeTimeRounding;
moment.relativeTimeThreshold = getSetRelativeTimeThreshold;
moment.calendarFormat = getCalendarFormat;
moment.prototype = proto;

// currently HTML5 input type only supports 24-hour formats
moment.HTML5_FMT = {
   DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
   DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
   DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
   DATE: 'YYYY-MM-DD', // <input type="date" />
   TIME: 'HH:mm', // <input type="time" />
   TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
   TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
   WEEK: 'GGGG-[W]WW', // <input type="week" />
   MONTH: 'YYYY-MM', // <input type="month" />
};

function test( msg, proc ) {
   verb( "   " + msg );
   proc( undefined );
}

function each(array, callback) {
    var i;
    for (i = 0; i < array.length; i++) {
        callback(array[i], i, array);
    }
}

function eachOwnProp(object, callback) {
    each(Object.keys(object), callback);
}

test.expectedDeprecations = function( msg ) { }

function testAddSubtract() {
   verb( "add_substract.js..." );
   
   test('add short reverse args', function (assert) {
      var a = moment(),
         b,
         c,
         d;
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);
      
      assertEqual(a.add({ ms: 50 }).milliseconds(), 550, 'Add milliseconds');
      assertEqual(a.add({ s: 1 }).seconds(), 9, 'Add seconds');
      assertEqual(a.add({ m: 1 }).minutes(), 8, 'Add minutes');
      assertEqual(a.add({ h: 1 }).hours(), 7, 'Add hours');
      assertEqual(a.add({ d: 1 }).date(), 13, 'Add date');
      assertEqual(a.add({ w: 1 }).date(), 20, 'Add week');
      assertEqual(a.add({ M: 1 }).month(), 10, 'Add month');
      assertEqual(a.add({ y: 1 }).year(), 2012, 'Add year');
      assertEqual(a.add({ Q: 1 }).month(), 1, 'Add quarter');

      b = moment([2010, 0, 31]).add({ M: 1 });
      c = moment([2010, 1, 28]).subtract({ M: 1 });
      d = moment([2010, 1, 28]).subtract({ Q: 1 });

      assertEqual(b.month(), 1, 'add month, jan 31st to feb 28th');
      assertEqual(b.date(), 28, 'add month, jan 31st to feb 28th');
      assertEqual(c.month(), 0, 'subtract month, feb 28th to jan 28th');
      assertEqual(c.date(), 28, 'subtract month, feb 28th to jan 28th');
      assertEqual(
         d.month(),
         10,
         'subtract quarter, feb 28th 2010 to nov 28th 2009'
    	 );
      assertEqual(
         d.date(),
         28,
         'subtract quarter, feb 28th 2010 to nov 28th 2009'
    	 );
      assertEqual(
         d.year(),
         2009,
         'subtract quarter, feb 28th 2010 to nov 28th 2009'
    	 );
   });

   test('add long reverse args', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(
         a.add({ milliseconds: 50 }).milliseconds(),
         550,
         'Add milliseconds'
    	 );
      assertEqual(a.add({ seconds: 1 }).seconds(), 9, 'Add seconds');
      assertEqual(a.add({ minutes: 1 }).minutes(), 8, 'Add minutes');
      assertEqual(a.add({ hours: 1 }).hours(), 7, 'Add hours');
      assertEqual(a.add({ days: 1 }).date(), 13, 'Add date');
      assertEqual(a.add({ weeks: 1 }).date(), 20, 'Add week');
      assertEqual(a.add({ months: 1 }).month(), 10, 'Add month');
      assertEqual(a.add({ years: 1 }).year(), 2012, 'Add year');
      assertEqual(a.add({ quarters: 1 }).month(), 1, 'Add quarter');
   });

   test('add long singular reverse args', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(
         a.add({ millisecond: 50 }).milliseconds(),
         550,
         'Add milliseconds'
    	 );
      assertEqual(a.add({ second: 1 }).seconds(), 9, 'Add seconds');
      assertEqual(a.add({ minute: 1 }).minutes(), 8, 'Add minutes');
      assertEqual(a.add({ hour: 1 }).hours(), 7, 'Add hours');
      assertEqual(a.add({ day: 1 }).date(), 13, 'Add date');
      assertEqual(a.add({ week: 1 }).date(), 20, 'Add week');
      assertEqual(a.add({ month: 1 }).month(), 10, 'Add month');
      assertEqual(a.add({ year: 1 }).year(), 2012, 'Add year');
      assertEqual(a.add({ quarter: 1 }).month(), 1, 'Add quarter');
   });

   test('add string long reverse args', function (assert) {
      var a = moment(),
         b;

      test.expectedDeprecations('moment().add(period, number)');

      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      b = a.clone();

      assertEqual(
         a.add('millisecond', 50).milliseconds(),
         550,
         'Add milliseconds'
    	 );
      assertEqual(a.add('second', 1).seconds(), 9, 'Add seconds');
      assertEqual(a.add('minute', 1).minutes(), 8, 'Add minutes');
      assertEqual(a.add('hour', 1).hours(), 7, 'Add hours');
      assertEqual(a.add('day', 1).date(), 13, 'Add date');
      assertEqual(a.add('week', 1).date(), 20, 'Add week');
      assertEqual(a.add('month', 1).month(), 10, 'Add month');
      assertEqual(a.add('year', 1).year(), 2012, 'Add year');
      assertEqual(b.add('day', '01').date(), 13, 'Add date');
      assertEqual(a.add('quarter', 1).month(), 1, 'Add quarter');
   });

   test('add string long singular reverse args', function (assert) {
      var a = moment(),
         b;

      test.expectedDeprecations('moment().add(period, number)');

      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      b = a.clone();

      assertEqual(
         a.add('milliseconds', 50).milliseconds(),
         550,
         'Add milliseconds'
    	 );
      assertEqual(a.add('seconds', 1).seconds(), 9, 'Add seconds');
      assertEqual(a.add('minutes', 1).minutes(), 8, 'Add minutes');
      assertEqual(a.add('hours', 1).hours(), 7, 'Add hours');
      assertEqual(a.add('days', 1).date(), 13, 'Add date');
      assertEqual(a.add('weeks', 1).date(), 20, 'Add week');
      assertEqual(a.add('months', 1).month(), 10, 'Add month');
      assertEqual(a.add('years', 1).year(), 2012, 'Add year');
      assertEqual(b.add('days', '01').date(), 13, 'Add date');
      assertEqual(a.add('quarters', 1).month(), 1, 'Add quarter');
   });

   test('add string short reverse args', function (assert) {
      var a = moment();
      test.expectedDeprecations('moment().add(period, number)');

      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(a.add('ms', 50).milliseconds(), 550, 'Add milliseconds');
      assertEqual(a.add('s', 1).seconds(), 9, 'Add seconds');
      assertEqual(a.add('m', 1).minutes(), 8, 'Add minutes');
      assertEqual(a.add('h', 1).hours(), 7, 'Add hours');
      assertEqual(a.add('d', 1).date(), 13, 'Add date');
      assertEqual(a.add('w', 1).date(), 20, 'Add week');
      assertEqual(a.add('M', 1).month(), 10, 'Add month');
      assertEqual(a.add('y', 1).year(), 2012, 'Add year');
      assertEqual(a.add('Q', 1).month(), 1, 'Add quarter');
   });

   test('add string long', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(
         a.add(50, 'millisecond').milliseconds(),
         550,
         'Add milliseconds'
    	 );
      assertEqual(a.add(1, 'second').seconds(), 9, 'Add seconds');
      assertEqual(a.add(1, 'minute').minutes(), 8, 'Add minutes');
      assertEqual(a.add(1, 'hour').hours(), 7, 'Add hours');
      assertEqual(a.add(1, 'day').date(), 13, 'Add date');
      assertEqual(a.add(1, 'week').date(), 20, 'Add week');
      assertEqual(a.add(1, 'month').month(), 10, 'Add month');
      assertEqual(a.add(1, 'year').year(), 2012, 'Add year');
      assertEqual(a.add(1, 'quarter').month(), 1, 'Add quarter');
   });

   test('add string long singular', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(
         a.add(50, 'milliseconds').milliseconds(),
         550,
         'Add milliseconds'
    	 );
      assertEqual(a.add(1, 'seconds').seconds(), 9, 'Add seconds');
      assertEqual(a.add(1, 'minutes').minutes(), 8, 'Add minutes');
      assertEqual(a.add(1, 'hours').hours(), 7, 'Add hours');
      assertEqual(a.add(1, 'days').date(), 13, 'Add date');
      assertEqual(a.add(1, 'weeks').date(), 20, 'Add week');
      assertEqual(a.add(1, 'months').month(), 10, 'Add month');
      assertEqual(a.add(1, 'years').year(), 2012, 'Add year');
      assertEqual(a.add(1, 'quarters').month(), 1, 'Add quarter');
   });

   test('add string short', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(a.add(50, 'ms').milliseconds(), 550, 'Add milliseconds');
      assertEqual(a.add(1, 's').seconds(), 9, 'Add seconds');
      assertEqual(a.add(1, 'm').minutes(), 8, 'Add minutes');
      assertEqual(a.add(1, 'h').hours(), 7, 'Add hours');
      assertEqual(a.add(1, 'd').date(), 13, 'Add date');
      assertEqual(a.add(1, 'w').date(), 20, 'Add week');
      assertEqual(a.add(1, 'M').month(), 10, 'Add month');
      assertEqual(a.add(1, 'y').year(), 2012, 'Add year');
      assertEqual(a.add(1, 'Q').month(), 1, 'Add quarter');
   });

   test('add strings string short reversed', function (assert) {
      var a = moment();
      test.expectedDeprecations('moment().add(period, number)');

      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(a.add('ms', '50').milliseconds(), 550, 'Add milliseconds');
      assertEqual(a.add('s', '1').seconds(), 9, 'Add seconds');
      assertEqual(a.add('m', '1').minutes(), 8, 'Add minutes');
      assertEqual(a.add('h', '1').hours(), 7, 'Add hours');
      assertEqual(a.add('d', '1').date(), 13, 'Add date');
      assertEqual(a.add('w', '1').date(), 20, 'Add week');
      assertEqual(a.add('M', '1').month(), 10, 'Add month');
      assertEqual(a.add('y', '1').year(), 2012, 'Add year');
      assertEqual(a.add('Q', '1').month(), 1, 'Add quarter');
   });

   test('subtract strings string short reversed', function (assert) {
      var a = moment();
      test.expectedDeprecations('moment().subtract(period, number)');

      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(
         a.subtract('ms', '50').milliseconds(),
         450,
         'Subtract milliseconds'
    	 );
      assertEqual(a.subtract('s', '1').seconds(), 7, 'Subtract seconds');
      assertEqual(a.subtract('m', '1').minutes(), 6, 'Subtract minutes');
      assertEqual(a.subtract('h', '1').hours(), 5, 'Subtract hours');
      assertEqual(a.subtract('d', '1').date(), 11, 'Subtract date');
      assertEqual(a.subtract('w', '1').date(), 4, 'Subtract week');
      assertEqual(a.subtract('M', '1').month(), 8, 'Subtract month');
      assertEqual(a.subtract('y', '1').year(), 2010, 'Subtract year');
      assertEqual(a.subtract('Q', '1').month(), 5, 'Subtract quarter');
   });

   test('add strings string short', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(a.add('50', 'ms').milliseconds(), 550, 'Add milliseconds');
      assertEqual(a.add('1', 's').seconds(), 9, 'Add seconds');
      assertEqual(a.add('1', 'm').minutes(), 8, 'Add minutes');
      assertEqual(a.add('1', 'h').hours(), 7, 'Add hours');
      assertEqual(a.add('1', 'd').date(), 13, 'Add date');
      assertEqual(a.add('1', 'w').date(), 20, 'Add week');
      assertEqual(a.add('1', 'M').month(), 10, 'Add month');
      assertEqual(a.add('1', 'y').year(), 2012, 'Add year');
      assertEqual(a.add('1', 'Q').month(), 1, 'Add quarter');
   });

   test('add no string with milliseconds default', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(a.add(50).milliseconds(), 550, 'Add milliseconds');
   });

   test('subtract strings string short', function (assert) {
      var a = moment();
      a.year(2011);
      a.month(9);
      a.date(12);
      a.hours(6);
      a.minutes(7);
      a.seconds(8);
      a.milliseconds(500);

      assertEqual(
         a.subtract('50', 'ms').milliseconds(),
         450,
         'Subtract milliseconds'
    	 );
      assertEqual(a.subtract('1', 's').seconds(), 7, 'Subtract seconds');
      assertEqual(a.subtract('1', 'm').minutes(), 6, 'Subtract minutes');
      assertEqual(a.subtract('1', 'h').hours(), 5, 'Subtract hours');
      assertEqual(a.subtract('1', 'd').date(), 11, 'Subtract date');
      assertEqual(a.subtract('1', 'w').date(), 4, 'Subtract week');
      assertEqual(a.subtract('1', 'M').month(), 8, 'Subtract month');
      assertEqual(a.subtract('1', 'y').year(), 2010, 'Subtract year');
      assertEqual(a.subtract('1', 'Q').month(), 5, 'Subtract quarter');
   });

   test('add across DST', function (assert) {
      // Detect Safari bug and bail. Hours on 13th March 2011 are shifted
      // with 1 ahead.
      if (new Date(2011, 2, 13, 5, 0, 0).getHours() !== 5) {
         assert.expect(0);
         return;
      }

      var a = moment(new Date(2011, 2, 12, 5, 0, 0)),
         b = moment(new Date(2011, 2, 12, 5, 0, 0)),
         c = moment(new Date(2011, 2, 12, 5, 0, 0)),
         d = moment(new Date(2011, 2, 12, 5, 0, 0)),
         e = moment(new Date(2011, 2, 12, 5, 0, 0));
      a.add(1, 'days');
      b.add(24, 'hours');
      c.add(1, 'months');
      e.add(1, 'quarter');

      assertEqual(
         a.hours(),
         5,
         'adding days over DST difference should result in the same hour'
    	 );
      if (b.isDST() && !d.isDST()) {
         assertEqual(
            b.hours(),
            6,
            'adding hours over DST difference should result in a different hour'
            );
      } else if (!b.isDST() && d.isDST()) {
         assertEqual(
            b.hours(),
            4,
            'adding hours over DST difference should result in a different hour'
            );
      } else {
         assertEqual(
            b.hours(),
            5,
            'adding hours over DST difference should result in a same hour if the timezone does not have daylight savings time'
            );
      }
      assertEqual(
         c.hours(),
         5,
         'adding months over DST difference should result in the same hour'
    	 );
      assertEqual(
         e.hours(),
         5,
         'adding quarters over DST difference should result in the same hour'
    	 );
   });

   test('add decimal values of days and months', function (assert) {
      assertEqual(
         moment([2016, 3, 3]).add(1.5, 'days').date(),
         5,
         'adding 1.5 days is rounded to adding 2 day'
    	 );
      assertEqual(
         moment([2016, 3, 3]).add(-1.5, 'days').date(),
         1,
         'adding -1.5 days is rounded to adding -2 day'
    	 );
      assertEqual(
         moment([2016, 3, 1]).add(-1.5, 'days').date(),
         30,
         'adding -1.5 days on first of month wraps around'
    	 );
      assertEqual(
         moment([2016, 3, 3]).add(1.5, 'months').month(),
         5,
         'adding 1.5 months adds 2 months'
    	 );
      assertEqual(
         moment([2016, 3, 3]).add(-1.5, 'months').month(),
         1,
         'adding -1.5 months adds -2 months'
    	 );
      assertEqual(
         moment([2016, 0, 3]).add(-1.5, 'months').month(),
         10,
         'adding -1.5 months at start of year wraps back'
    	 );
      assertEqual(
         moment([2016, 3, 3]).subtract(1.5, 'days').date(),
         1,
         'subtract 1.5 days is rounded to subtract 2 day'
    	 );
      assertEqual(
         moment([2016, 3, 2]).subtract(1.5, 'days').date(),
         31,
         'subtract 1.5 days subtracts 2 days'
    	 );
      assertEqual(
         moment([2016, 1, 1]).subtract(1.1, 'days').date(),
         31,
         'subtract 1.1 days wraps to previous month'
    	 );
      assertEqual(
         moment([2016, 3, 3]).subtract(-1.5, 'days').date(),
         5,
         'subtract -1.5 days is rounded to subtract -2 day'
    	 );
      assertEqual(
         moment([2016, 3, 30]).subtract(-1.5, 'days').date(),
         2,
         'subtract -1.5 days on last of month wraps around'
    	 );
      assertEqual(
         moment([2016, 3, 3]).subtract(1.5, 'months').month(),
         1,
         'subtract 1.5 months subtract 2 months'
    	 );
      assertEqual(
         moment([2016, 3, 3]).subtract(-1.5, 'months').month(),
         5,
         'subtract -1.5 months subtract -2 month'
    	 );
      assertEqual(
         moment([2016, 11, 31]).subtract(-1.5, 'months').month(),
         1,
         'subtract -1.5 months at end of year wraps back'
    	 );
      assertEqual(
         moment([2016, 0, 1]).add(1.5, 'years').format('YYYY-MM-DD'),
         '2017-07-01',
         'add 1.5 years adds 1 year six months'
    	 );
      assertEqual(
         moment([2016, 0, 1]).add(1.6, 'years').format('YYYY-MM-DD'),
         '2017-08-01',
         'add 1.6 years becomes 1.6*12 = 19.2, round, 19 months'
    	 );
      assertEqual(
         moment([2016, 0, 1]).add(1.1, 'quarters').format('YYYY-MM-DD'),
         '2016-04-01',
         'add 1.1 quarters 1.1*3=3.3, round, 3 months'
    	 );
   });

   test('add/subtract ISO week', function (assert) {
      assertEqual(
         moment([2016, 3, 15]).subtract(1, 'W').date(),
         8,
         'subtract 1 iso week short'
    	 );
      assertEqual(
         moment([2016, 3, 15]).subtract(1, 'isoweek').date(),
         8,
         'subtract 1 iso week long singular'
    	 );
      assertEqual(
         moment([2016, 3, 15]).subtract(1, 'isoweeks').date(),
         8,
         'subtract 1 iso weeks long'
    	 );

      assertEqual(
         moment([2016, 3, 15]).add(1, 'W').date(),
         22,
         'add 1 iso week short'
    	 );
      assertEqual(
         moment([2016, 3, 15]).add(1, 'isoweek').date(),
         22,
         'add 1 week long singular'
    	 );
      assertEqual(
         moment([2016, 3, 15]).add(1, 'isoweeks').date(),
         22,
         'add 1 weeks long'
    	 );
   });
}

function testCalendar() {
   verb( "calendar.js" );
   
   test('passing a function', function (assert) {
      var a = moment().hours(13).minutes(0).seconds(0);
      assertEqual(
         moment(a).calendar(null, {
            sameDay: function () {
	       return 'h:mmA';
            },
         }),
         '1:00PM',
         'should equate'
    	 );
   });

   test('extending calendar options', function (assert) {
      var calendarFormat = moment.calendarFormat,
         a,
         b;

      moment.calendarFormat = function (myMoment, now) {
         var diff = myMoment.diff(now, 'days', true),
            nextMonth = now.clone().add(1, 'month'),
            retVal =
	       diff < -6
		  ? 'sameElse'
	       : diff < -1
                    ? 'lastWeek'
	       : diff < 0
                    ? 'lastDay'
	       : diff < 1
                    ? 'sameDay'
	       : diff < 2
                    ? 'nextDay'
	       : diff < 7
                    ? 'nextWeek'
	       : myMoment.month() === now.month() &&
		 myMoment.year() === now.year()
                    ? 'thisMonth'
		 : nextMonth.month() === myMoment.month() &&
		   nextMonth.year() === myMoment.year()
                      ? 'nextMonth'
		   : 'sameElse';
		   
        	   return retVal;
      };

      moment.updateLocale('en', {
         calendar: {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            thisMonth: '[This month on the] Do',
            nextMonth: '[Next month on the] Do',
            sameElse: 'L',
         },
      });

      a = moment('2016-01-01').add(28, 'days');
      b = moment('2016-01-01').add(1, 'month');

      try {
         assertEqual(
            a.calendar('2016-01-01'),
            'This month on the 29th',
            'Ad hoc calendar format for this month'
            );
         assertEqual(
            b.calendar('2016-01-01'),
            'Next month on the 1st',
            'Ad hoc calendar format for next month'
            );
/*          assertEqual(                                              */
/*             a.locale('fr').calendar('2016-01-01'),                  */
/*             a.locale('fr').format('L'),                             */
/*             'French falls back to default because thisMonth is not defined in that locale' */
/*             );                                                      */
      } finally {
         moment.calendarFormat = calendarFormat;
         moment.updateLocale('en', null);
      }
   });

   test('calendar overload time - passing one parameter - a Moment', function (assert) {
      var a = moment().hours(13).minutes(23).seconds(45),
         b = moment().add(1, 'd');
      assertEqual(a.calendar(b), 'Yesterday at 1:23 PM', 'moment, should equate');
   });

   test('calendar overload time - passing one parameter - a Date', function (assert) {
      var a = moment().hours(13).minutes(23).seconds(45).subtract(1, 'd'),
         d = new Date();
      assertEqual(a.calendar(d), 'Yesterday at 1:23 PM', 'date, should equate');
   });

   test('calendar overload time - passing one parameter - a string', function (assert) {
      var a = moment([2808, 11, 1]);
      assertEqual(a.calendar('1999-12-31'), '12/01/2808', 'string, should equate');
   });

   test('calendar overload time - passing one parameter - a number', function (assert) {
      var a = moment([2808, 11, 1]);
      assertEqual(a.calendar(Date.now()), '12/01/2808', 'number, should equate');
   });

   test('calendar overload time - passing one parameter - an array of numbers', function (assert) {
      var a = moment()
         .year(2808)
         .month(11)
         .date(1)
         .hours(13)
         .minutes(23)
         .seconds(45);
      assertEqual(
         a.calendar([2808, 11, 1, 13, 23, 45]),
         'Today at 1:23 PM',
         'should equate'
    	 );
   });

   test('calendar overload time - passing one parameter - an array of strings', function (assert) {
      var a = moment()
         .year(2808)
         .month(11)
         .date(1)
         .hours(13)
         .minutes(23)
         .seconds(45);
      assertEqual(
         a.calendar(['2808', '11', '1', '13', '23', '45']),
         'Today at 1:23 PM',
         'should equate'
    	 );
   });

   test('calendar overload time - passing one parameter - a moment input object', function (assert) {
      var a = moment(),
         todayTime = new Date(),
         month = todayTime.getMonth() + 1,
         day = todayTime.getDate(),
         year = todayTime.getFullYear(),
         expectedString;

      month = month < 10 ? '0' + month.toString() : month;
      day = day < 10 ? '0' + day.toString() : day;

      expectedString = month + '/' + day + '/' + year;

      assertEqual(
         a.calendar({
            	       month: 12,
            	       day: 1,
            	       year: 2808,
        	    }),
         expectedString,
         'should equate'
    	 );
   });

   test('calendar overload format - passing one parameter - object w/ sameDay as a string', function (assert) {
      var a = moment().hours(13).minutes(23).seconds(45);
      assertEqual(
         a.calendar({ sameDay: 'h:mm:ssA' }),
         '1:23:45PM',
         'should equate'
    	 );
   });

   test('calendar overload format - passing one parameter - object w/ sameDay as function returning a string', function (assert) {
      var a = moment().hours(13).minutes(23).seconds(45);
      assertEqual(
         a.calendar({
            	       sameDay: function () {
                	  return 'h:mm:ssA';
            	       },
        	    }),
         '1:23:45PM',
         'should equate'
    	 );
   });
}

function testCreate() {
   verb( "create.js" );
   
   test('array', function (assert) {
      assertOk(moment([2010]).toDate() instanceof Date, '[2010]');
      assertOk(moment([2010, 1]).toDate() instanceof Date, '[2010, 1]');
      assertOk(moment([2010, 1, 12]).toDate() instanceof Date, '[2010, 1, 12]');
      assertOk(
         moment([2010, 1, 12, 1]).toDate() instanceof Date,
         '[2010, 1, 12, 1]'
    	 );
      assertOk(
         moment([2010, 1, 12, 1, 1]).toDate() instanceof Date,
         '[2010, 1, 12, 1, 1]'
    	 );
      assertOk(
         moment([2010, 1, 12, 1, 1, 1]).toDate() instanceof Date,
         '[2010, 1, 12, 1, 1, 1]'
    	 );
      assertOk(
         moment([2010, 1, 12, 1, 1, 1, 1]).toDate() instanceof Date,
         '[2010, 1, 12, 1, 1, 1, 1]'
    	 );
      assertEqual(
      +moment(new Date(2010, 1, 14, 15, 25, 50, 125)),
+moment([2010, 1, 14, 15, 25, 50, 125]),
 'constructing with array === constructing with new Date()'
 );
   });

   test('array with invalid arguments', function (assert) {
      assertOk(!moment([2010, null, null]).isValid(), '[2010, null, null]');
      assertOk(
         !moment([1945, null, null]).isValid(),
         '[1945, null, null] (pre-1970)'
    	 );
   });

   test('array copying', function (assert) {
      var importantArray = [2009, 11];
      moment(importantArray);
      assertDeepEqual(
         importantArray,
         [2009, 11],
         'initializer should not mutate the original array'
    	 );
   });

   test('object', function (assert) {
      var fmt = 'YYYY-MM-DD HH:mm:ss.SSS',
         tests = [
            [{ year: 2010 }, '2010-01-01 00:00:00.000'],
            [{ year: 2010, month: 1 }, '2010-02-01 00:00:00.000'],
            [{ year: 2010, month: 1, day: 12 }, '2010-02-12 00:00:00.000'],
            [{ year: 2010, month: 1, date: 12 }, '2010-02-12 00:00:00.000'],
            [
	       { year: 2010, month: 1, day: 12, hours: 1 },
	       '2010-02-12 01:00:00.000',
            ],
            [
	       { year: 2010, month: 1, date: 12, hours: 1 },
	       '2010-02-12 01:00:00.000',
            ],
            [
	       { year: 2010, month: 1, day: 12, hours: 1, minutes: 1 },
	       '2010-02-12 01:01:00.000',
            ],
            [
	       { year: 2010, month: 1, date: 12, hours: 1, minutes: 1 },
	       '2010-02-12 01:01:00.000',
            ],
            [
	       {
		  year: 2010,
		  month: 1,
		  day: 12,
		  hours: 1,
		  minutes: 1,
		  seconds: 1,
	       },
	       '2010-02-12 01:01:01.000',
            ],
            [
	       {
		  year: 2010,
		  month: 1,
		  day: 12,
		  hours: 1,
		  minutes: 1,
		  seconds: 1,
		  milliseconds: 1,
	       },
	       '2010-02-12 01:01:01.001',
            ],
            [
	       {
		  years: 2010,
		  months: 1,
		  days: 14,
		  hours: 15,
		  minutes: 25,
		  seconds: 50,
		  milliseconds: 125,
	       },
	       '2010-02-14 15:25:50.125',
            ],
            [
	       {
		  year: 2010,
		  month: 1,
		  day: 14,
		  hour: 15,
		  minute: 25,
		  second: 50,
		  millisecond: 125,
	       },
	       '2010-02-14 15:25:50.125',
            ],
            [
	       { y: 2010, M: 1, d: 14, h: 15, m: 25, s: 50, ms: 125 },
	       '2010-02-14 15:25:50.125',
            ],
            ],
         i;
      for (i = 0; i < tests.length; ++i) {
         assertEqual(moment(tests[i][0]).format(fmt), tests[i][1]);
      }
   });

   test('invalid date for object with zero value date or day keys', function (assert) {
      assertEqual(moment({ date: '0' }).format(), 'Invalid date');
      assertEqual(moment({ date: 0 }).format(), 'Invalid date');
      assertEqual(moment({ day: '0' }).format(), 'Invalid date');
      assertEqual(moment({ day: 0 }).format(), 'Invalid date');
   });

   test('multi format array copying', function (assert) {
      var importantArray = ['MM/DD/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY'];
      moment('1999-02-13', importantArray);
      assertDeepEqual(
         importantArray,
         ['MM/DD/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY'],
         'initializer should not mutate the original array'
    	 );
   });

   test('number', function (assert) {
      assertOk(moment(1000).toDate() instanceof Date, '1000');
      assertEqual(moment(1000).valueOf(), 1000, 'asserting valueOf');
      assertEqual(moment.utc(1000).valueOf(), 1000, 'asserting valueOf');
   });

   test('unix', function (assert) {
      assertEqual(
         moment.unix(1).valueOf(),
         1000,
         '1 unix timestamp == 1000 Date.valueOf'
    	 );
      assertEqual(
         moment(1000).unix(),
         1,
         '1000 Date.valueOf == 1 unix timestamp'
    	 );
      assertEqual(
         moment.unix(1000).valueOf(),
         1000000,
         '1000 unix timestamp == 1000000 Date.valueOf'
    	 );
      assertEqual(
         moment(1500).unix(),
         1,
         '1500 Date.valueOf == 1 unix timestamp'
    	 );
      assertEqual(
         moment(1900).unix(),
         1,
         '1900 Date.valueOf == 1 unix timestamp'
    	 );
      assertEqual(
         moment(2100).unix(),
         2,
         '2100 Date.valueOf == 2 unix timestamp'
    	 );
      assertEqual(
         moment(1333129333524).unix(),
         1333129333,
         '1333129333524 Date.valueOf == 1333129333 unix timestamp'
    	 );
      assertEqual(
         moment(1333129333524000).unix(),
         1333129333524,
         '1333129333524000 Date.valueOf == 1333129333524 unix timestamp'
    	 );
   });

   test('date', function (assert) {
      assertOk(moment(new Date()).toDate() instanceof Date, 'new Date()');
      assertEqual(
         moment(new Date(2016, 0, 1), 'YYYY-MM-DD').format('YYYY-MM-DD'),
         '2016-01-01',
         'If date is provided, format string is ignored'
    	 );
   });

   test('date with a format as an array', function (assert) {
      var tests = [
	 new Date(2016, 9, 27),
	 new Date(2016, 9, 28),
	 new Date(2016, 9, 29),
	 new Date(2016, 9, 30),
	 new Date(2016, 9, 31),
             ],
         i;

      for (i = 0; i < tests.length; i++) {
         assertEqual(
            moment(tests[i]).format(),
            moment(tests[i], ['MM/DD/YYYY'], false).format(),
            'Passing date with a format array should still return the correct date'
            );
      }
   });

   test('date mutation', function (assert) {
      var a = new Date();
      assertOk(
         moment(a).toDate() !== a,
         'the date moment uses should not be the date passed in'
    	 );
   });

   test('moment', function (assert) {
      assertOk(moment(moment()).toDate() instanceof Date, 'moment(moment())');
      assertOk(
         moment(moment(moment())).toDate() instanceof Date,
         'moment(moment(moment()))'
    	 );
   });

   test('cloning moment should only copy own properties', function (assert) {
      assertOk(
         !hasOwnProp(moment().clone(), 'month'),
         'Should not clone prototype methods'
    	 );
   });

   test('cloning moment works with weird clones', function (assert) {
      var extend = function (a, b) {
	 var i;
	 for (i in b) {
	    a[i] = b[i];
	 }
	 return a;
      },
        	   now = moment(),
        	   nowu = moment.utc();

      assertEqual(
      +extend({}, now).clone(),
+now,
 'cloning extend-ed now is now'
 );
      assertEqual(
      +extend({}, nowu).clone(),
+nowu,
 'cloning extend-ed utc now is utc now'
 );
   });

   test('cloning respects moment.momentProperties', function (assert) {
      var m = moment();

      assertEqual(
         m.clone()._special,
         undefined,
         'cloning ignores extra properties'
    	 );
      m._special = 'bacon';
      moment.momentProperties.push('_special');
      assertEqual(
         m.clone()._special,
         'bacon',
         'cloning respects momentProperties'
    	 );
      moment.momentProperties.pop();
   });

   test('undefined', function (assert) {
      assertOk(moment().toDate() instanceof Date, 'undefined');
   });

   test('iso with bad input', function (assert) {
      assertOk(
         !moment('a', moment.ISO_8601).isValid(),
         'iso parsing with invalid string'
    	 );
      assertOk(
         !moment('a', moment.ISO_8601, true).isValid(),
         'iso parsing with invalid string, strict'
    	 );
   });

   test('iso format 24hrs', function (assert) {
      assertEqual(
         moment('2014-01-01T24:00:00.000').format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
         '2014-01-02T00:00:00.000',
         'iso format with 24:00 localtime'
    	 );
      assertEqual(
         moment
            .utc('2014-01-01T24:00:00.000')
            .format('YYYY-MM-DD[T]HH:mm:ss.SSS'),
         '2014-01-02T00:00:00.000',
         'iso format with 24:00 utc'
    	 );
   });

   test('string without format - json', function (assert) {
      assertEqual(
         moment('Date(1325132654000)').valueOf(),
         1325132654000,
         'Date(1325132654000)'
    	 );
      assertEqual(
         moment('Date(-1325132654000)').valueOf(),
-1325132654000,
'Date(-1325132654000)'
);
      assertEqual(
         moment('/Date(1325132654000)/').valueOf(),
         1325132654000,
         '/Date(1325132654000)/'
    	 );
      assertEqual(
         moment('/Date(1325132654000+0700)/').valueOf(),
         1325132654000,
         '/Date(1325132654000+0700)/'
    	 );
      assertEqual(
         moment('/Date(1325132654000-0700)/').valueOf(),
         1325132654000,
         '/Date(1325132654000-0700)/'
    	 );
   });

   test('string without format - strict parsing', function (assert) {
      assertEqual(
         moment('Date(1325132654000)', false).valueOf(),
         1325132654000,
         'Date(1325132654000)'
    	 );
      assertEqual(
         moment('Date(1325132654000)', true).valueOf(),
         1325132654000,
         'Date(1325132654000)'
    	 );
      assertEqual(
         moment('/Date(1325132654000)/', true).valueOf(),
         1325132654000,
         '/Date(1325132654000)/'
    	 );
      assertEqual(moment('1/1/2001', true).isValid(), false, '1/1/2001');
      assertEqual(moment.utc('1/1/2001', true).isValid(), false, '1/1/2001 utc');
   });

   test('string with format dropped am/pm bug', function (assert) {
      moment.locale('en');

      assertEqual(
         moment('05/1/2012 12:25:00', 'MM/DD/YYYY h:m:s a').format('MM/DD/YYYY'),
         '05/01/2012',
         'should not break if am/pm is left off from the parsing tokens'
    	 );
      assertEqual(
         moment('05/1/2012 12:25:00 am', 'MM/DD/YYYY h:m:s a').format(
            'MM/DD/YYYY'
            ),
         '05/01/2012',
         'should not break if am/pm is left off from the parsing tokens'
    	 );
      assertEqual(
         moment('05/1/2012 12:25:00 pm', 'MM/DD/YYYY h:m:s a').format(
            'MM/DD/YYYY'
            ),
         '05/01/2012',
         'should not break if am/pm is left off from the parsing tokens'
    	 );

      assertOk(moment('05/1/2012 12:25:00', 'MM/DD/YYYY h:m:s a').isValid());
      assertOk(moment('05/1/2012 12:25:00 am', 'MM/DD/YYYY h:m:s a').isValid());
      assertOk(moment('05/1/2012 12:25:00 pm', 'MM/DD/YYYY h:m:s a').isValid());
   });

   test('empty string with formats', function (assert) {
      assertEqual(
         moment('', 'MM').format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );
      assertEqual(
         moment(' ', 'MM').format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );
      assertEqual(
         moment(' ', 'DD').format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );
      assertEqual(
         moment(' ', ['MM', 'DD']).format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );

      assertOk(!moment('', 'MM').isValid());
      assertOk(!moment(' ', 'MM').isValid());
      assertOk(!moment(' ', 'DD').isValid());
      assertOk(!moment(' ', ['MM', 'DD']).isValid());
   });

   test('undefined argument with formats', function (assert) {
      assertEqual(
         moment(undefined, 'MM').format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );
      assertEqual(
         moment(undefined, 'DD').format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );
      assertEqual(
         moment(undefined, ['MM', 'DD']).format('YYYY-MM-DD HH:mm:ss'),
         'Invalid date'
    	 );

      assertOk(!moment(undefined, 'MM').isValid());
      assertOk(!moment(undefined, 'MM').isValid());
      assertOk(!moment(undefined, 'DD').isValid());
      assertOk(!moment(undefined, ['MM', 'DD']).isValid());
   });

   test('defaulting to current date', function (assert) {
      var now = moment();
      assertEqual(
         moment('12:13:14', 'hh:mm:ss').format('YYYY-MM-DD hh:mm:ss'),
         now
            .clone()
            .hour(12)
            .minute(13)
            .second(14)
            .format('YYYY-MM-DD hh:mm:ss'),
         'given only time default to current date'
    	 );
      assertEqual(
         moment('05', 'DD').format('YYYY-MM-DD'),
         now.clone().date(5).format('YYYY-MM-DD'),
         'given day of month default to current month, year'
    	 );
      assertEqual(
         moment('05', 'MM').format('YYYY-MM-DD'),
         now.clone().month(4).date(1).format('YYYY-MM-DD'),
         'given month default to current year'
    	 );
      assertEqual(
         moment('1996', 'YYYY').format('YYYY-MM-DD'),
         now.clone().year(1996).month(0).date(1).format('YYYY-MM-DD'),
         'given year do not default'
    	 );
   });

   test('matching am/pm', function (assert) {
      assertEqual(
         moment('2012-09-03T03:00PM', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00PM',
         'am/pm should parse correctly for PM'
    	 );
      assertEqual(
         moment('2012-09-03T03:00P.M.', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00PM',
         'am/pm should parse correctly for P.M.'
    	 );
      assertEqual(
         moment('2012-09-03T03:00P', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00PM',
         'am/pm should parse correctly for P'
    	 );
      assertEqual(
         moment('2012-09-03T03:00pm', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00PM',
         'am/pm should parse correctly for pm'
    	 );
      assertEqual(
         moment('2012-09-03T03:00p.m.', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00PM',
         'am/pm should parse correctly for p.m.'
    	 );
      assertEqual(
         moment('2012-09-03T03:00p', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00PM',
         'am/pm should parse correctly for p'
    	 );

      assertEqual(
         moment('2012-09-03T03:00AM', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00AM',
         'am/pm should parse correctly for AM'
    	 );
      assertEqual(
         moment('2012-09-03T03:00A.M.', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00AM',
         'am/pm should parse correctly for A.M.'
    	 );
      assertEqual(
         moment('2012-09-03T03:00A', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00AM',
         'am/pm should parse correctly for A'
    	 );
      assertEqual(
         moment('2012-09-03T03:00am', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00AM',
         'am/pm should parse correctly for am'
    	 );
      assertEqual(
         moment('2012-09-03T03:00a.m.', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00AM',
         'am/pm should parse correctly for a.m.'
    	 );
      assertEqual(
         moment('2012-09-03T03:00a', 'YYYY-MM-DDThh:mmA').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-09-03T03:00AM',
         'am/pm should parse correctly for a'
    	 );

      assertEqual(
         moment('5:00p.m.March 4 2012', 'h:mmAMMMM D YYYY').format(
            'YYYY-MM-DDThh:mmA'
            ),
         '2012-03-04T05:00PM',
         'am/pm should parse correctly before month names'
    	 );
   });

   test('string with format', function (assert) {
      moment.locale('en');
      var a = [
	 ['YYYY-Q', '2014-4'],
	 ['MM-DD-YYYY', '12-02-1999'],
	 ['DD-MM-YYYY', '12-02-1999'],
	 ['DD/MM/YYYY', '12/02/1999'],
	 ['DD_MM_YYYY', '12_02_1999'],
	 ['DD:MM:YYYY', '12:02:1999'],
	 ['D-M-YY', '2-2-99'],
	 ['YY', '99'],
	 ['DDD-YYYY', '300-1999'],
	 ['DD-MM-YYYY h:m:s', '12-02-1999 2:45:10'],
	 ['DD-MM-YYYY h:m:s a', '12-02-1999 2:45:10 am'],
	 ['DD-MM-YYYY h:m:s a', '12-02-1999 2:45:10 pm'],
	 ['h:mm a', '12:00 pm'],
	 ['h:mm a', '12:30 pm'],
	 ['h:mm a', '12:00 am'],
	 ['h:mm a', '12:30 am'],
	 ['HH:mm', '12:00'],
	 ['kk:mm', '12:00'],
	 ['YYYY-MM-DDTHH:mm:ss', '2011-11-11T11:11:11'],
	 ['MM-DD-YYYY [M]', '12-02-1999 M'],
	 ['ddd MMM DD HH:mm:ss YYYY', 'Tue Apr 07 22:52:51 2009'],
	 ['HH:mm:ss', '12:00:00'],
	 ['HH:mm:ss', '12:30:00'],
	 ['HH:mm:ss', '00:00:00'],
	 ['HH:mm:ss S', '00:30:00 1'],
	 ['HH:mm:ss SS', '00:30:00 12'],
	 ['HH:mm:ss SSS', '00:30:00 123'],
	 ['HH:mm:ss S', '00:30:00 7'],
	 ['HH:mm:ss SS', '00:30:00 78'],
	 ['HH:mm:ss SSS', '00:30:00 789'],
	 ['kk:mm:ss', '12:00:00'],
	 ['kk:mm:ss', '12:30:00'],
	 ['kk:mm:ss', '24:00:00'],
	 ['kk:mm:ss S', '24:30:00 1'],
	 ['kk:mm:ss SS', '24:30:00 12'],
	 ['kk:mm:ss SSS', '24:30:00 123'],
	 ['kk:mm:ss S', '24:30:00 7'],
	 ['kk:mm:ss SS', '24:30:00 78'],
	 ['kk:mm:ss SSS', '24:30:00 789'],
	 ['X', '1234567890'],
	 ['x', '1234567890123'],
	 ['LT', '12:30 AM'],
	 ['LTS', '12:30:29 AM'],
	 ['L', '09/02/1999'],
	 ['l', '9/2/1999'],
	 ['LL', 'September 2, 1999'],
	 ['ll', 'Sep 2, 1999'],
	 ['LLL', 'September 2, 1999 12:30 AM'],
	 ['lll', 'Sep 2, 1999 12:30 AM'],
	 ['LLLL', 'Thursday, September 2, 1999 12:30 AM'],
	 ['llll', 'Thu, Sep 2, 1999 12:30 AM'],
         ],
         m,
         i;

      for (i = 0; i < a.length; i++) {
         m = moment(a[i][1], a[i][0]);
         assertOk(m.isValid());
         assertEqual(m.format(a[i][0]), a[i][1], a[i][0] + ' ---> ' + a[i][1]);
      }
   });

   test('2 digit year with YYYY format', function (assert) {
      assertEqual(
         moment('9/2/99', 'D/M/YYYY').format('DD/MM/YYYY'),
         '09/02/1999',
         'D/M/YYYY ---> 9/2/99'
    	 );
      assertEqual(
         moment('9/2/1999', 'D/M/YYYY').format('DD/MM/YYYY'),
         '09/02/1999',
         'D/M/YYYY ---> 9/2/1999'
    	 );
      assertEqual(
         moment('9/2/68', 'D/M/YYYY').format('DD/MM/YYYY'),
         '09/02/2068',
         'D/M/YYYY ---> 9/2/68'
    	 );
      assertEqual(
         moment('9/2/69', 'D/M/YYYY').format('DD/MM/YYYY'),
         '09/02/1969',
         'D/M/YYYY ---> 9/2/69'
    	 );
   });

   test('unix timestamp format', function (assert) {
      var formats = ['X', 'X.S', 'X.SS', 'X.SSS'],
         i,
         format;

      for (i = 0; i < formats.length; i++) {
         format = formats[i];
         assertEqual(
            moment('1234567890', format).valueOf(),
            1234567890 * 1000,
            format + ' matches timestamp without milliseconds'
            );
         assertEqual(
            moment('1234567890.1', format).valueOf(),
            1234567890 * 1000 + 100,
            format + ' matches timestamp with deciseconds'
            );
         assertEqual(
            moment('1234567890.12', format).valueOf(),
            1234567890 * 1000 + 120,
            format + ' matches timestamp with centiseconds'
            );
         assertEqual(
            moment('1234567890.123', format).valueOf(),
            1234567890 * 1000 + 123,
            format + ' matches timestamp with milliseconds'
            );
      }
   });

   test('unix offset milliseconds', function (assert) {
      assertEqual(
         moment('1234567890123', 'x').valueOf(),
         1234567890123,
         'x matches unix offset in milliseconds'
    	 );
   });

   test('milliseconds format', function (assert) {
      assertEqual(moment('1', 'S').get('ms'), 100, 'deciseconds');
      // assertEqual(moment('10', 'S', true).isValid(), false, 'deciseconds with two digits');
      // assertEqual(moment('1', 'SS', true).isValid(), false, 'centiseconds with one digits');
      assertEqual(moment('12', 'SS').get('ms'), 120, 'centiseconds');
      // assertEqual(moment('123', 'SS', true).isValid(), false, 'centiseconds with three digits');
      assertEqual(moment('123', 'SSS').get('ms'), 123, 'milliseconds');
      assertEqual(
         moment('1234', 'SSSS').get('ms'),
         123,
         'milliseconds with SSSS'
    	 );
      assertEqual(
         moment('123456789101112', 'SSSS').get('ms'),
         123,
         'milliseconds with SSSS'
    	 );
   });

   test('string with format no separators', function (assert) {
      moment.locale('en');
      var a = [
	 ['MMDDYYYY', '12021999'],
	 ['DDMMYYYY', '12021999'],
	 ['YYYYMMDD', '19991202'],
	 ['DDMMMYYYY', '10Sep2001'],
         ],
         i;

      for (i = 0; i < a.length; i++) {
         assertEqual(
            moment(a[i][1], a[i][0]).format(a[i][0]),
            a[i][1],
            a[i][0] + ' ---> ' + a[i][1]
               );
      }
   });

   test('string with format (timezone)', function (assert) {
      assertEqual(
         moment('5 -0700', 'H ZZ').toDate().getUTCHours(),
         12,
         "parse hours '5 -0700' ---> 'H ZZ'"
    	 );
      assertEqual(
         moment('5 -07:00', 'H Z').toDate().getUTCHours(),
         12,
         "parse hours '5 -07:00' ---> 'H Z'"
    	 );
      assertEqual(
         moment('5 -0730', 'H ZZ').toDate().getUTCMinutes(),
         30,
         "parse hours '5 -0730' ---> 'H ZZ'"
    	 );
      assertEqual(
         moment('5 -07:30', 'H Z').toDate().getUTCMinutes(),
         30,
         "parse hours '5 -07:0' ---> 'H Z'"
    	 );
      assertEqual(
         moment('5 +0100', 'H ZZ').toDate().getUTCHours(),
         4,
         "parse hours '5 +0100' ---> 'H ZZ'"
    	 );
      assertEqual(
         moment('5 +01:00', 'H Z').toDate().getUTCHours(),
         4,
         "parse hours '5 +01:00' ---> 'H Z'"
    	 );
      assertEqual(
         moment('5 +0130', 'H ZZ').toDate().getUTCMinutes(),
         30,
         "parse hours '5 +0130' ---> 'H ZZ'"
    	 );
      assertEqual(
         moment('5 +01:30', 'H Z').toDate().getUTCMinutes(),
         30,
         "parse hours '5 +01:30' ---> 'H Z'"
    	 );
   });

   test('string with format (timezone offset)', function (assert) {
      var a, b, c, d, e, f;
      a = new Date(Date.UTC(2011, 0, 1, 1));
      b = moment('2011 1 1 0 -01:00', 'YYYY MM DD HH Z');
      assertEqual(
         a.getHours(),
         b.hours(),
         'date created with utc == parsed string with timezone offset'
    	 );
      assertEqual(
      +a,
+b,
 'date created with utc == parsed string with timezone offset'
 );
      c = moment('2011 2 1 10 -05:00', 'YYYY MM DD HH Z');
      d = moment('2011 2 1 8 -07:00', 'YYYY MM DD HH Z');
      assertEqual(
         c.hours(),
         d.hours(),
         '10 am central time == 8 am pacific time'
    	 );
      e = moment.utc('20 07 2012 17:15:00', 'DD MM YYYY HH:mm:ss');
      f = moment.utc('20 07 2012 10:15:00 -0700', 'DD MM YYYY HH:mm:ss ZZ');
      assertEqual(e.hours(), f.hours(), 'parse timezone offset in utc');
   });

   test('string with timezone around start of year', function (assert) {
      assertEqual(
         moment('2000-01-01T00:00:00.000+01:00').toISOString(),
         '1999-12-31T23:00:00.000Z',
         '+1:00 around 2000'
    	 );
      assertEqual(
         moment('2000-01-01T00:00:00.000-01:00').toISOString(),
         '2000-01-01T01:00:00.000Z',
         '-1:00 around 2000'
    	 );
      assertEqual(
         moment('1970-01-01T00:00:00.000+01:00').toISOString(),
         '1969-12-31T23:00:00.000Z',
         '+1:00 around 1970'
    	 );
      assertEqual(
         moment('1970-01-01T00:00:00.000-01:00').toISOString(),
         '1970-01-01T01:00:00.000Z',
         '-1:00 around 1970'
    	 );
      assertEqual(
         moment('1200-01-01T00:00:00.000+01:00').toISOString(),
         '1199-12-31T23:00:00.000Z',
         '+1:00 around 1200'
    	 );
      assertEqual(
         moment('1200-01-01T00:00:00.000-01:00').toISOString(),
         '1200-01-01T01:00:00.000Z',
         '-1:00 around 1200'
    	 );
   });

   test('string with array of formats', function (assert) {
      var thursdayForCurrentWeek = moment().day(4).format('YYYY MM DD');

      assertEqual(
         moment('11-02-1999', ['MM-DD-YYYY', 'DD-MM-YYYY']).format('MM DD YYYY'),
         '11 02 1999',
         'switching month and day'
    	 );
      assertEqual(
         moment('02-11-1999', ['MM/DD/YYYY', 'YYYY MM DD', 'MM-DD-YYYY']).format(
            'MM DD YYYY'
            ),
         '02 11 1999',
         'year last'
    	 );
      assertEqual(
         moment('1999-02-11', ['MM/DD/YYYY', 'YYYY MM DD', 'MM-DD-YYYY']).format(
            'MM DD YYYY'
            ),
         '02 11 1999',
         'year first'
    	 );

      assertEqual(
         moment('02-11-1999', ['MM/DD/YYYY', 'YYYY MM DD']).format('MM DD YYYY'),
         '02 11 1999',
         'year last'
    	 );
      assertEqual(
         moment('1999-02-11', ['MM/DD/YYYY', 'YYYY MM DD']).format('MM DD YYYY'),
         '02 11 1999',
         'year first'
    	 );
      assertEqual(
         moment('02-11-1999', ['YYYY MM DD', 'MM/DD/YYYY']).format('MM DD YYYY'),
         '02 11 1999',
         'year last'
    	 );
      assertEqual(
         moment('1999-02-11', ['YYYY MM DD', 'MM/DD/YYYY']).format('MM DD YYYY'),
         '02 11 1999',
         'year first'
    	 );

      assertEqual(
         moment('13-11-1999', ['MM/DD/YYYY', 'DD/MM/YYYY']).format('MM DD YYYY'),
         '11 13 1999',
         'second must be month'
    	 );
      assertEqual(
         moment('11-13-1999', ['MM/DD/YYYY', 'DD/MM/YYYY']).format('MM DD YYYY'),
         '11 13 1999',
         'first must be month'
    	 );
      assertEqual(
         moment('01-02-2000', ['MM/DD/YYYY', 'DD/MM/YYYY']).format('MM DD YYYY'),
         '01 02 2000',
         'either can be a month, month first format'
    	 );
      assertEqual(
         moment('02-01-2000', ['DD/MM/YYYY', 'MM/DD/YYYY']).format('MM DD YYYY'),
         '01 02 2000',
         'either can be a month, day first format'
    	 );

      assertEqual(
         moment('11-02-10', ['MM/DD/YY', 'YY MM DD', 'DD-MM-YY']).format(
            'MM DD YYYY'
            ),
         '02 11 2010',
         'all unparsed substrings have influence on format penalty'
    	 );
      assertEqual(
         moment('11-02-10', ['MM-DD-YY HH:mm', 'YY MM DD']).format('MM DD YYYY'),
         '02 10 2011',
         'prefer formats without extra tokens'
    	 );
      assertEqual(
         moment('11-02-10 junk', ['MM-DD-YY', 'YY.MM.DD [junk]']).format(
            'MM DD YYYY'
            ),
         '02 10 2011',
         'prefer formats that dont result in extra characters'
    	 );
      assertEqual(
         moment('11-22-10', ['YY-MM-DD', 'YY-DD-MM']).format('MM DD YYYY'),
         '10 22 2011',
         'prefer valid results'
    	 );

      assertEqual(
         moment('gibberish', ['YY-MM-DD', 'YY-DD-MM']).format('MM DD YYYY'),
         'Invalid date',
         'doest throw for invalid strings'
    	 );
      assertEqual(
         moment('gibberish', []).format('MM DD YYYY'),
         'Invalid date',
         'doest throw for an empty array'
    	 );

      // https://github.com/moment/moment/issues/1143
      assertEqual(
         moment(
            'System Administrator and Database Assistant (7/1/2011), System Administrator and Database Assistant (7/1/2011), Database Coordinator (7/1/2011), Vice President (7/1/2011), System Administrator and Database Assistant (5/31/2012), Database Coordinator (7/1/2012), System Administrator and Database Assistant (7/1/2013)',
            ['MM/DD/YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ']
               ).format('YYYY-MM-DD'),
         '2011-07-01',
         'Works for long strings'
    	 );

      assertEqual(
         moment('11-02-10', ['MM.DD.YY', 'DD-MM-YY']).format('MM DD YYYY'),
         '02 11 2010',
         'escape RegExp special characters on comparing'
    	 );

      assertEqual(
         moment('13-10-98', ['DD MM YY', 'DD MM YYYY'])._f,
         'DD MM YY',
         'use two digit year'
    	 );
      assertEqual(
         moment('13-10-1998', ['DD MM YY', 'DD MM YYYY'])._f,
         'DD MM YYYY',
         'use four digit year'
    	 );

      assertEqual(
         moment('01', ['MM', 'DD'])._f,
         'MM',
         'Should use first valid format'
    	 );

      assertEqual(
         moment('Thursday 8:30pm', ['dddd h:mma']).format(
            'YYYY MM DD dddd h:mma'
            ),
         thursdayForCurrentWeek + ' Thursday 8:30pm',
         'Default to current week'
    	 );
   });

   test('string with array of formats + ISO', function (assert) {
      assertEqual(
         moment('1994', [moment.ISO_8601, 'MM', 'HH:mm', 'YYYY']).year(),
         1994,
         'iso: assert parse YYYY'
    	 );
      assertEqual(
         moment('17:15', [moment.ISO_8601, 'MM', 'HH:mm', 'YYYY']).hour(),
         17,
         'iso: assert parse HH:mm (1)'
    	 );
      assertEqual(
         moment('24:15', [moment.ISO_8601, 'MM', 'kk:mm', 'YYYY']).hour(),
         0,
         'iso: assert parse kk:mm'
    	 );
      assertEqual(
         moment('17:15', [moment.ISO_8601, 'MM', 'HH:mm', 'YYYY']).minutes(),
         15,
         'iso: assert parse HH:mm (2)'
    	 );
      assertEqual(
         moment('06', [moment.ISO_8601, 'MM', 'HH:mm', 'YYYY']).month(),
         6 - 1,
         'iso: assert parse MM'
    	 );
      assertEqual(
         moment('2012-06-01', [
            		       moment.ISO_8601,
            		       'MM',
            		       'HH:mm',
            		       'YYYY',
        		       ]).parsingFlags().iso,
         true,
         'iso: assert parse iso'
    	 );
      assertEqual(
         moment('2014-05-05', [moment.ISO_8601, 'YYYY-MM-DD']).parsingFlags()
            .iso,
         true,
         'iso: edge case array precedence iso'
    	 );
      assertEqual(
         moment('2014-05-05', ['YYYY-MM-DD', moment.ISO_8601]).parsingFlags()
            .iso,
         false,
         'iso: edge case array precedence not iso'
    	 );
   });

   test('strict parsing invalid date against array of formats', function (assert) {
      var b = moment(
         '2/30/2019 7:00pm',
         [
            		      'M/DD/YYYY h:mma", "MM/DD/YYYY h:mma", "M-D-YYYY h:mma", "MM-D-YYYY h:mma',
        ],
         true
    	    );
      assertDeepEqual(
         b.parsingFlags().parsedDateParts,
         [2019, 1, 30, 7, 0],
         'strict parsing multiple formats should still select the best format even if the date is invalid'
    	 );
   });

   test('string with format - years', function (assert) {
      assertEqual(moment('67', 'YY').format('YYYY'), '2067', '67 > 2067');
      assertEqual(moment('68', 'YY').format('YYYY'), '2068', '68 > 2068');
      assertEqual(moment('69', 'YY').format('YYYY'), '1969', '69 > 1969');
      assertEqual(moment('70', 'YY').format('YYYY'), '1970', '70 > 1970');
   });

   test('implicit cloning', function (assert) {
      var momentA = moment([2011, 10, 10]),
         momentB = moment(momentA);
      momentA.month(5);
      assertNotEqual(
         momentA.month(),
         momentB.month(),
         'Calling moment() on a moment will create a clone'
    	 );
   });

   test('explicit cloning', function (assert) {
      var momentA = moment([2011, 10, 10]),
         momentB = momentA.clone();
      momentA.month(5);
      assertNotEqual(
         momentA.month(),
         momentB.month(),
         'Calling clone() on a moment will create a clone'
    	 );
   });

   test('cloning carrying over utc mode', function (assert) {
      assertEqual(
         moment().local().clone()._isUTC,
         false,
         'An explicit cloned local moment should have _isUTC == false'
    	 );
      assertEqual(
         moment().utc().clone()._isUTC,
         true,
         'An cloned utc moment should have _isUTC == true'
    	 );
      assertEqual(
         moment().clone()._isUTC,
         false,
         'An explicit cloned local moment should have _isUTC == false'
    	 );
      assertEqual(
         moment.utc().clone()._isUTC,
         true,
         'An explicit cloned utc moment should have _isUTC == true'
    	 );
      assertEqual(
         moment(moment().local())._isUTC,
         false,
         'An implicit cloned local moment should have _isUTC == false'
    	 );
      assertEqual(
         moment(moment().utc())._isUTC,
         true,
         'An implicit cloned utc moment should have _isUTC == true'
    	 );
      assertEqual(
         moment(moment())._isUTC,
         false,
         'An implicit cloned local moment should have _isUTC == false'
    	 );
      assertEqual(
         moment(moment.utc())._isUTC,
         true,
         'An implicit cloned utc moment should have _isUTC == true'
    	 );
   });

   test('parsing RFC 2822', function (assert) {
      var testCases = {
         'Tue, 01 Nov 2016 01:23:45 UT': [2016, 10, 1, 1, 23, 45, 0],
         'Sun, 12 Apr 2015 05:06:07 GMT': [2015, 3, 12, 5, 6, 7, 0],
         'Tue, 01 Nov 2016 01:23:45 +0000': [2016, 10, 1, 1, 23, 45, 0],
         'Tue, 01 Nov 16 04:23:45 Z': [2016, 10, 1, 4, 23, 45, 0],
         '01 Nov 2016 05:23:45 z': [2016, 10, 1, 5, 23, 45, 0],
         '(Init Comment) Tue,\n 1 Nov              2016 (Split\n Comment)  07:23:45 +0000 (GMT)': [
            2016,
            10,
            1,
            7,
            23,
            45,
            0,
            ],
         'Mon, 02 Jan 2017 06:00:00 -0800': [2017, 0, 2, 6, 0, 0, -8 * 60],
         'Mon, 02 Jan 2017 06:00:00 +0800': [2017, 0, 2, 6, 0, 0, +8 * 60],
         'Mon, 02 Jan 2017 06:00:00 +0330': [
            2017,
            0,
            2,
            6,
            0,
            0,
+(3 * 60 + 30),
            ],
         'Mon, 02 Jan 2017 06:00:00 -0330': [
            2017,
            0,
            2,
            6,
            0,
            0,
-(3 * 60 + 30),
            ],
         'Mon, 02 Jan 2017 06:00:00 PST': [2017, 0, 2, 6, 0, 0, -8 * 60],
         'Mon, 02 Jan 2017 06:00:00 PDT': [2017, 0, 2, 6, 0, 0, -7 * 60],
         'Mon, 02 Jan 2017 06:00:00 MST': [2017, 0, 2, 6, 0, 0, -7 * 60],
         'Mon, 02 Jan 2017 06:00:00 MDT': [2017, 0, 2, 6, 0, 0, -6 * 60],
         'Mon, 02 Jan 2017 06:00:00 CST': [2017, 0, 2, 6, 0, 0, -6 * 60],
         'Mon, 02 Jan 2017 06:00:00 CDT': [2017, 0, 2, 6, 0, 0, -5 * 60],
         'Mon, 02 Jan 2017 06:00:00 EST': [2017, 0, 2, 6, 0, 0, -5 * 60],
         'Mon, 02 Jan 2017 06:00:00 EDT': [2017, 0, 2, 6, 0, 0, -4 * 60],
      };

      eachOwnProp(testCases, function (inp) {
         var tokens = testCases[inp],
            parseResult = moment(inp, moment.RFC_2822, true).parseZone(),
            expResult = moment
	       .utc(tokens.slice(0, 6))
	       .utcOffset(tokens[6], true);
         assertOk(parseResult.isValid(), inp);
         assertOk(
            parseResult.parsingFlags().rfc2822,
            inp + ' - rfc2822 parsingFlag'
            );
         assertEqual(
            parseResult.utcOffset(),
            expResult.utcOffset(),
            inp + ' - zone'
            );
         assertEqual(
            parseResult.valueOf(),
            expResult.valueOf(),
            inp + ' - correctness'
            );
      });
   });

   test('non RFC 2822 strings', function (assert) {
      var testCases = {
         'RFC2822 datetime with all options but invalid day delimiter':
            		 'Tue. 01 Nov 2016 01:23:45 GMT',
         'RFC2822 datetime with mismatching Day (weekday v date)':
            'Mon, 01 Nov 2016 01:23:45 GMT',
      };

      eachOwnProp(testCases, function (testCase) {
         var testResult = moment(testCases[testCase], moment.RFC_2822, true);
         assertOk(
            !testResult.isValid(),
            testCase + ': ' + testResult + ' - is invalid rfc2822'
            );
         assertOk(
            !testResult.parsingFlags().rfc2822,
            testCase + ': ' + testResult + ' - rfc2822 parsingFlag'
            );
      });
   });

   test('parsing RFC 2822 in a different locale', function (assert) {
      var testCases = {
         'clean RFC2822 datetime with all options':
            		 'Tue, 01 Nov 2016 01:23:45 UT',
         'clean RFC2822 datetime without comma': 'Tue 01 Nov 2016 02:23:45 GMT',
         'clean RFC2822 datetime without seconds':
            'Tue, 01 Nov 2016 03:23 +0000',
         'clean RFC2822 datetime without century': 'Tue, 01 Nov 16 04:23:45 Z',
         'clean RFC2822 datetime without day': '01 Nov 2016 05:23:45 z',
         'clean RFC2822 datetime with single-digit day-of-month':
            'Tue, 1 Nov 2016 06:23:45 GMT',
         'RFC2822 datetime with CFWSs':
            '(Init Comment) Tue,\n 1 Nov              2016 (Split\n Comment)  07:23:45 +0000 (GMT)',
      };

      try {
         moment.locale('ru');
         eachOwnProp(testCases, function (testCase) {
            var testResult = moment(testCases[testCase], moment.RFC_2822, true);
            assertOk(testResult.isValid(), testResult);
            assertOk(
	       testResult.parsingFlags().rfc2822,
	       testResult + ' - rfc2822 parsingFlag'
               );
         });
      } finally {
         moment.locale('en');
      }
   });

   test('non RFC 2822 strings in a different locale', function (assert) {
      var testCases = {
         'RFC2822 datetime with all options but invalid day delimiter':
            		 'Tue. 01 Nov 2016 01:23:45 GMT',
         'RFC2822 datetime with mismatching Day (week v date)':
            'Mon, 01 Nov 2016 01:23:45 GMT',
      };

      try {
         moment.locale('ru');
         eachOwnProp(testCases, function (testCase) {
            var testResult = moment(testCases[testCase], moment.RFC_2822, true);
            assertOk(!testResult.isValid(), testResult);
            assertOk(
	       !testResult.parsingFlags().rfc2822,
	       testResult + ' - rfc2822 parsingFlag'
               );
         });
      } finally {
         moment.locale('en');
      }
   });

/*    test('parsing iso', function (assert) {                          */
/*       var offset = moment([2011, 9, 8]).utcOffset(),                */
/*          pad = function (input) {                                   */
/*             if (input < 10) {                                       */
/* 	       return '0' + input;                                     */
/*             }                                                       */
/*             return '' + input;                                      */
/*          },                                                         */
/*                offStr = function (offset) {                         */
/*             	  var hourOffset =                                     */
/*                      offset > 0                                     */
/*                         ? Math.floor(offset / 60)                   */
/* 		     : Math.ceil(offset / 60),                         */
/*                        minOffset = offset - hourOffset * 60;        */
/*             	     return offset >= 0                                */
/*                 	       ? '+' + pad(hourOffset) + ':' + pad(minOffset) */
/*                 	: '-' + pad(-hourOffset) + ':' + pad(-minOffset); */
/*                },                                                   */
/*         		tz = offStr(offset),                           */
/*         		tz0 = offStr(moment([2011, 0, 1]).utcOffset()), */
/*         		tz2 = tz.replace(':', ''),                     */
/*         		tz3 = tz2.slice(0, 3),                         */
/*         		//Tz3 removes minutes digit so will break the tests when parsed if they all use the same minutes digit */
/*         		hourOffset =                                   */
/*             		   offset > 0 ? Math.floor(offset / 60) : Math.ceil(offset / 60), */
/*         		      minOffset = offset - hourOffset * 60,    */
/*         		      minutesForTz3 = pad((4 + minOffset) % 60), */
/*         		      // minute = pad(4 + minOffset),          */
/*                                                                     */
/*         		      formats = [                              */
/*             			 ['2011', '2011-01-01T00:00:00.000' + tz0], */
/*             			 ['2011-10', '2011-10-01T00:00:00.000' + tz], */
/*             			 ['2011-10-08', '2011-10-08T00:00:00.000' + tz], */
/*             			 ['2011-10-08T18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011-10-08T18:04', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-10-08T18:04:20', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-10-08T18:04' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-10-08T18:04:20' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-10-08T18:04' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-10-08T18:04:20' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011-10-08T18:04' + tz3,          */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011-10-08T18:04:20' + tz3,       */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011-10-08T18:04:20.1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011-10-08T18:04:20.11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011-10-08T18:04:20.111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011-10-08 18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011-10-08 18:04', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-10-08 18:04:20', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-10-08 18:04' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-10-08 18:04:20' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-10-08 18:04' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-10-08 18:04:20' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011-10-08 18:04' + tz3,          */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011-10-08 18:04:20' + tz3,       */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011-10-08 18:04:20.1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011-10-08 18:04:20.11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011-10-08 18:04:20.111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011-W40', '2011-10-03T00:00:00.000' + tz], */
/*             			 ['2011-W40-6', '2011-10-08T00:00:00.000' + tz], */
/*             			 ['2011-W40-6T18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011-W40-6T18:04', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-W40-6T18:04:20', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-W40-6T18:04' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-W40-6T18:04:20' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-W40-6T18:04' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-W40-6T18:04:20' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011-W40-6T18:04' + tz3,          */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011-W40-6T18:04:20' + tz3,       */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011-W40-6T18:04:20.1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011-W40-6T18:04:20.11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011-W40-6T18:04:20.111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011-W40-6 18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011-W40-6 18:04', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-W40-6 18:04:20', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-W40-6 18:04' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-W40-6 18:04:20' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-W40-6 18:04' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-W40-6 18:04:20' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011-W40-6 18:04' + tz3,          */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011-W40-6 18:04:20' + tz3,       */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011-W40-6 18:04:20.1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011-W40-6 18:04:20.11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011-W40-6 18:04:20.111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011-281', '2011-10-08T00:00:00.000' + tz], */
/*             			 ['2011-281T18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011-281T18:04', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-281T18:04:20', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-281T18:04' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-281T18:04:20' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-281T18:04' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-281T18:04:20' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011-281T18:04' + tz3,            */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011-281T18:04:20' + tz3,         */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011-281T18:04:20.1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011-281T18:04:20.11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011-281T18:04:20.111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011-281 18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011-281 18:04', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-281 18:04:20', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-281 18:04' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-281 18:04:20' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011-281 18:04' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011-281 18:04:20' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011-281 18:04' + tz3,            */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011-281 18:04:20' + tz3,         */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011-281 18:04:20.1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011-281 18:04:20.11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011-281 18:04:20.111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['20111008T18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['20111008T1804', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['20111008T180420', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['20111008T1804' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['20111008T180420' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['20111008T1804' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['20111008T180420' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '20111008T1804' + tz3,             */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '20111008T180420' + tz3,           */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['20111008T180420,1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['20111008T180420,11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['20111008T180420,111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['20111008 18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['20111008 1804', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['20111008 180420', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['20111008 1804' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['20111008 180420' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['20111008 1804' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['20111008 180420' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '20111008 1804' + tz3,             */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '20111008 180420' + tz3,           */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['20111008 180420,1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['20111008 180420,11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['20111008 180420,111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011W40', '2011-10-03T00:00:00.000' + tz], */
/*             			 ['2011W406', '2011-10-08T00:00:00.000' + tz], */
/*             			 ['2011W406T18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011W406T1804', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011W406T180420', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011W406 1804' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011W406T1804' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011W406T180420' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011W406T1804' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011W406T180420' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011W406T1804' + tz3,             */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011W406T180420' + tz3,           */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011W406T180420,1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011W406T180420,11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011W406T180420,111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011W406 18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011W406 1804', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011W406 180420', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011W406 1804' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011W406 180420' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011W406 180420' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011W406 1804' + tz3,             */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011W406 180420' + tz3,           */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011W406 180420,1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011W406 180420,11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011W406 180420,111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011281', '2011-10-08T00:00:00.000' + tz], */
/*             			 ['2011281T18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011281T1804', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011281T180420', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011281T1804' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011281T180420' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011281T1804' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011281T180420' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011281T1804' + tz3,              */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011281T180420' + tz3,            */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011281T180420,1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011281T180420,11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011281T180420,111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*             			 ['2011281 18', '2011-10-08T18:00:00.000' + tz], */
/*             			 ['2011281 1804', '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011281 180420', '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011281 1804' + tz, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011281 180420' + tz, '2011-10-08T18:04:20.000' + tz], */
/*             			 ['2011281 1804' + tz2, '2011-10-08T18:04:00.000' + tz], */
/*             			 ['2011281 180420' + tz2, '2011-10-08T18:04:20.000' + tz], */
/*             			 [                                     */
/*                 		    '2011281 1804' + tz3,              */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':00.000' + tz, */
/*             			 ],                                    */
/*             			 [                                     */
/*                 		    '2011281 180420' + tz3,            */
/*                 		    '2011-10-08T18:' + minutesForTz3 + ':20.000' + tz, */
/*             			 ],                                    */
/*             			 ['2011281 180420,1' + tz2, '2011-10-08T18:04:20.100' + tz], */
/*             			 ['2011281 180420,11' + tz2, '2011-10-08T18:04:20.110' + tz], */
/*             			 ['2011281 180420,111' + tz2, '2011-10-08T18:04:20.111' + tz], */
/*         			 ],                                    */
/*         		      i;                                       */
/*     			      for (i = 0; i < formats.length; i++) {   */
/*         			 assertEqual(                          */
/*             			    moment(formats[i][0]).format('YYYY-MM-DDTHH:mm:ss.SSSZ'), */
/*             			    formats[i][1],                     */
/*             			    'moment should be able to parse ISO ' + formats[i][0] */
/*         			       );                              */
/*         			 assertEqual(                          */
/*             			    moment(formats[i][0], moment.ISO_8601).format( */
/*                 		       'YYYY-MM-DDTHH:mm:ss.SSSZ'      */
/*             			       ),                              */
/*             			    formats[i][1],                     */
/*             			    'moment should be able to parse specified ISO ' + formats[i][0] */
/*         			       );                              */
/*         			 assertEqual(                          */
/*             			    moment(formats[i][0], moment.ISO_8601, true).format( */
/*                 		       'YYYY-MM-DDTHH:mm:ss.SSSZ'      */
/*             			       ),                              */
/*             			    formats[i][1],                     */
/*             			    'moment should be able to parse specified strict ISO ' + */
/*                 		    formats[i][0]                      */
/*         			       );                              */
/*     			      }                                        */
/*    });                                                              */

   test('non iso 8601 strings', function (assert) {
      assertOk(
         !moment('2015-10T10:15', moment.ISO_8601, true).isValid(),
         'incomplete date with time'
    	 );
      assertOk(
         !moment('2015-W10T10:15', moment.ISO_8601, true).isValid(),
         'incomplete week date with time'
    	 );
      assertOk(
         !moment('2015W10T1015', moment.ISO_8601, true).isValid(),
         'incomplete week date with time (basic)'
    	 );
      assertOk(
         !moment('2015-10-08T1015', moment.ISO_8601, true).isValid(),
         'mixing extended and basic format'
    	 );
      assertOk(
         !moment('20151008T10:15', moment.ISO_8601, true).isValid(),
         'mixing basic and extended format'
    	 );
      assertOk(
         !moment('2015-10-1', moment.ISO_8601, true).isValid(),
         'missing zero padding for day'
    	 );
   });

   test('parsing iso week year/week/weekday', function (assert) {
      assertEqual(
         moment.utc('2007-W01').format(),
         '2007-01-01T00:00:00Z',
         '2008 week 1 (1st Jan Mon)'
    	 );
      assertEqual(
         moment.utc('2008-W01').format(),
         '2007-12-31T00:00:00Z',
         '2008 week 1 (1st Jan Tue)'
    	 );
      assertEqual(
         moment.utc('2003-W01').format(),
         '2002-12-30T00:00:00Z',
         '2008 week 1 (1st Jan Wed)'
    	 );
      assertEqual(
         moment.utc('2009-W01').format(),
         '2008-12-29T00:00:00Z',
         '2009 week 1 (1st Jan Thu)'
    	 );
      assertEqual(
         moment.utc('2010-W01').format(),
         '2010-01-04T00:00:00Z',
         '2010 week 1 (1st Jan Fri)'
    	 );
      assertEqual(
         moment.utc('2011-W01').format(),
         '2011-01-03T00:00:00Z',
         '2011 week 1 (1st Jan Sat)'
    	 );
      assertEqual(
         moment.utc('2012-W01').format(),
         '2012-01-02T00:00:00Z',
         '2012 week 1 (1st Jan Sun)'
    	 );
   });

   test('parsing weekdays verifies the day', function (assert) {
      // string with format
      assertOk(
         !moment('Wed 08-10-2017', 'ddd MM-DD-YYYY').isValid(),
         'because day of week is incorrect for the date'
    	 );
      assertOk(
         moment('Thu 08-10-2017', 'ddd MM-DD-YYYY').isValid(),
         'because day of week is correct for the date'
    	 );
   });

   test('parsing weekday on utc dates verifies day according to utc time', function (assert) {
      assertOk(moment.utc('Mon 03:59', 'ddd HH:mm').isValid(), 'Monday 03:59');
   });

   test('parsing weekday on local dates verifies day according to local time', function (assert) {
      // this doesn't do much useful if you're not in the US or at least close to it
      assertOk(moment('Mon 03:59', 'ddd HH:mm').isValid(), 'Monday 03:59');
   });

   test('parsing weekday on utc dates with specified offsets verifies day according to that offset', function (assert) {
      assertOk(
         moment.utc('Mon 03:59 +12:00', 'ddd HH:mm Z', true).isValid(),
         'Monday 03:59'
    	 );
   });

   test('parsing weekday on local dates with specified offsets verifies day according to that offset', function (assert) {
      // if you're in the US, these times will all be sometime Sunday, but they should parse as Monday
      assertOk(
         moment('Mon 03:59 +12:00', 'ddd HH:mm Z', true).isValid(),
         'Monday 03:59'
    	 );
   });

   test('parsing week year/week/weekday (dow 1, doy 4)', function (assert) {
      moment.locale('dow:1,doy:4', { week: { dow: 1, doy: 4 } });

      assertEqual(
         moment.utc('2007-01', 'gggg-ww').format(),
         '2007-01-01T00:00:00Z',
         '2007 week 1 (1st Jan Mon)'
    	 );
      assertEqual(
         moment.utc('2008-01', 'gggg-ww').format(),
         '2007-12-31T00:00:00Z',
         '2008 week 1 (1st Jan Tue)'
    	 );
      assertEqual(
         moment.utc('2003-01', 'gggg-ww').format(),
         '2002-12-30T00:00:00Z',
         '2003 week 1 (1st Jan Wed)'
    	 );
      assertEqual(
         moment.utc('2009-01', 'gggg-ww').format(),
         '2008-12-29T00:00:00Z',
         '2009 week 1 (1st Jan Thu)'
    	 );
      assertEqual(
         moment.utc('2010-01', 'gggg-ww').format(),
         '2010-01-04T00:00:00Z',
         '2010 week 1 (1st Jan Fri)'
    	 );
      assertEqual(
         moment.utc('2011-01', 'gggg-ww').format(),
         '2011-01-03T00:00:00Z',
         '2011 week 1 (1st Jan Sat)'
    	 );
      assertEqual(
         moment.utc('2012-01', 'gggg-ww').format(),
         '2012-01-02T00:00:00Z',
         '2012 week 1 (1st Jan Sun)'
    	 );

      moment.defineLocale('dow:1,doy:4', null);
   });

   test('parsing week year/week/weekday (dow 1, doy 7)', function (assert) {
      moment.locale('dow:1,doy:7', { week: { dow: 1, doy: 7 } });

      assertEqual(
         moment.utc('2007-01', 'gggg-ww').format(),
         '2007-01-01T00:00:00Z',
         '2007 week 1 (1st Jan Mon)'
    	 );
      assertEqual(
         moment.utc('2008-01', 'gggg-ww').format(),
         '2007-12-31T00:00:00Z',
         '2008 week 1 (1st Jan Tue)'
    	 );
      assertEqual(
         moment.utc('2003-01', 'gggg-ww').format(),
         '2002-12-30T00:00:00Z',
         '2003 week 1 (1st Jan Wed)'
    	 );
      assertEqual(
         moment.utc('2009-01', 'gggg-ww').format(),
         '2008-12-29T00:00:00Z',
         '2009 week 1 (1st Jan Thu)'
    	 );
      assertEqual(
         moment.utc('2010-01', 'gggg-ww').format(),
         '2009-12-28T00:00:00Z',
         '2010 week 1 (1st Jan Fri)'
    	 );
      assertEqual(
         moment.utc('2011-01', 'gggg-ww').format(),
         '2010-12-27T00:00:00Z',
         '2011 week 1 (1st Jan Sat)'
    	 );
      assertEqual(
         moment.utc('2012-01', 'gggg-ww').format(),
         '2011-12-26T00:00:00Z',
         '2012 week 1 (1st Jan Sun)'
    	 );
      moment.defineLocale('dow:1,doy:7', null);
   });

   test('parsing week year/week/weekday (dow 0, doy 6)', function (assert) {
      moment.locale('dow:0,doy:6', { week: { dow: 0, doy: 6 } });

      assertEqual(
         moment.utc('2007-01', 'gggg-ww').format(),
         '2006-12-31T00:00:00Z',
         '2007 week 1 (1st Jan Mon)'
    	 );
      assertEqual(
         moment.utc('2008-01', 'gggg-ww').format(),
         '2007-12-30T00:00:00Z',
         '2008 week 1 (1st Jan Tue)'
    	 );
      assertEqual(
         moment.utc('2003-01', 'gggg-ww').format(),
         '2002-12-29T00:00:00Z',
         '2003 week 1 (1st Jan Wed)'
    	 );
      assertEqual(
         moment.utc('2009-01', 'gggg-ww').format(),
         '2008-12-28T00:00:00Z',
         '2009 week 1 (1st Jan Thu)'
    	 );
      assertEqual(
         moment.utc('2010-01', 'gggg-ww').format(),
         '2009-12-27T00:00:00Z',
         '2010 week 1 (1st Jan Fri)'
    	 );
      assertEqual(
         moment.utc('2011-01', 'gggg-ww').format(),
         '2010-12-26T00:00:00Z',
         '2011 week 1 (1st Jan Sat)'
    	 );
      assertEqual(
         moment.utc('2012-01', 'gggg-ww').format(),
         '2012-01-01T00:00:00Z',
         '2012 week 1 (1st Jan Sun)'
    	 );
      moment.defineLocale('dow:0,doy:6', null);
   });

   test('parsing week year/week/weekday (dow 6, doy 12)', function (assert) {
      moment.locale('dow:6,doy:12', { week: { dow: 6, doy: 12 } });

      assertEqual(
         moment.utc('2007-01', 'gggg-ww').format(),
         '2006-12-30T00:00:00Z',
         '2007 week 1 (1st Jan Mon)'
    	 );
      assertEqual(
         moment.utc('2008-01', 'gggg-ww').format(),
         '2007-12-29T00:00:00Z',
         '2008 week 1 (1st Jan Tue)'
    	 );
      assertEqual(
         moment.utc('2003-01', 'gggg-ww').format(),
         '2002-12-28T00:00:00Z',
         '2003 week 1 (1st Jan Wed)'
    	 );
      assertEqual(
         moment.utc('2009-01', 'gggg-ww').format(),
         '2008-12-27T00:00:00Z',
         '2009 week 1 (1st Jan Thu)'
    	 );
      assertEqual(
         moment.utc('2010-01', 'gggg-ww').format(),
         '2009-12-26T00:00:00Z',
         '2010 week 1 (1st Jan Fri)'
    	 );
      assertEqual(
         moment.utc('2011-01', 'gggg-ww').format(),
         '2011-01-01T00:00:00Z',
         '2011 week 1 (1st Jan Sat)'
    	 );
      assertEqual(
         moment.utc('2012-01', 'gggg-ww').format(),
         '2011-12-31T00:00:00Z',
         '2012 week 1 (1st Jan Sun)'
    	 );
      moment.defineLocale('dow:6,doy:12', null);
   });

   test('parsing ISO with Z', function (assert) {
      var i,
         mom,
         formats = [
            ['2011-10-08T18:04', '2011-10-08T18:04:00.000'],
            ['2011-10-08T18:04:20', '2011-10-08T18:04:20.000'],
            ['2011-10-08T18:04:20.1', '2011-10-08T18:04:20.100'],
            ['2011-10-08T18:04:20.11', '2011-10-08T18:04:20.110'],
            ['2011-10-08T18:04:20.111', '2011-10-08T18:04:20.111'],
            ['2011-W40-6T18', '2011-10-08T18:00:00.000'],
            ['2011-W40-6T18:04', '2011-10-08T18:04:00.000'],
            ['2011-W40-6T18:04:20', '2011-10-08T18:04:20.000'],
            ['2011-W40-6T18:04:20.1', '2011-10-08T18:04:20.100'],
            ['2011-W40-6T18:04:20.11', '2011-10-08T18:04:20.110'],
            ['2011-W40-6T18:04:20.111', '2011-10-08T18:04:20.111'],
            ['2011-281T18', '2011-10-08T18:00:00.000'],
            ['2011-281T18:04', '2011-10-08T18:04:00.000'],
            ['2011-281T18:04:20', '2011-10-08T18:04:20.000'],
            ['2011-281T18:04:20', '2011-10-08T18:04:20.000'],
            ['2011-281T18:04:20.1', '2011-10-08T18:04:20.100'],
            ['2011-281T18:04:20.11', '2011-10-08T18:04:20.110'],
            ['2011-281T18:04:20.111', '2011-10-08T18:04:20.111'],
            ];

      for (i = 0; i < formats.length; i++) {
         mom = moment(formats[i][0] + 'Z').utc();
         assertEqual(
            mom.format('YYYY-MM-DDTHH:mm:ss.SSS'),
            formats[i][1],
            'moment should be able to parse ISO in UTC ' + formats[i][0] + 'Z'
            );

         mom = moment(formats[i][0] + ' Z').utc();
         assertEqual(
            mom.format('YYYY-MM-DDTHH:mm:ss.SSS'),
            formats[i][1],
            'moment should be able to parse ISO in UTC ' + formats[i][0] + ' Z'
            );
      }
   });

   test('parsing iso with T', function (assert) {
      assertEqual(
         moment('2011-10-08T18')._f,
         'YYYY-MM-DDTHH',
         "should include 'T' in the format"
    	 );
      assertEqual(
         moment('2011-10-08T18:20')._f,
         'YYYY-MM-DDTHH:mm',
         "should include 'T' in the format"
    	 );
      assertEqual(
         moment('2011-10-08T18:20:13')._f,
         'YYYY-MM-DDTHH:mm:ss',
         "should include 'T' in the format"
    	 );
      assertEqual(
         moment('2011-10-08T18:20:13.321')._f,
         'YYYY-MM-DDTHH:mm:ss.SSSS',
         "should include 'T' in the format"
    	 );

      assertEqual(
         moment('2011-10-08 18')._f,
         'YYYY-MM-DD HH',
         "should not include 'T' in the format"
    	 );
      assertEqual(
         moment('2011-10-08 18:20')._f,
         'YYYY-MM-DD HH:mm',
         "should not include 'T' in the format"
    	 );
      assertEqual(
         moment('2011-10-08 18:20:13')._f,
         'YYYY-MM-DD HH:mm:ss',
         "should not include 'T' in the format"
    	 );
      assertEqual(
         moment('2011-10-08 18:20:13.321')._f,
         'YYYY-MM-DD HH:mm:ss.SSSS',
         "should not include 'T' in the format"
    	 );
   });

   test('parsing iso Z timezone', function (assert) {
      var i,
         formats = [
            ['2011-10-08T18:04Z', '2011-10-08T18:04:00.000+00:00'],
            ['2011-10-08T18:04:20Z', '2011-10-08T18:04:20.000+00:00'],
            ['2011-10-08T18:04:20.111Z', '2011-10-08T18:04:20.111+00:00'],
            ];
      for (i = 0; i < formats.length; i++) {
         assertEqual(
            moment.utc(formats[i][0]).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            formats[i][1],
            'moment should be able to parse ISO ' + formats[i][0]
               );
      }
   });

   test('parsing iso Z timezone into local', function (assert) {
      var m = moment('2011-10-08T18:04:20.111Z');

      assertEqual(
         m.utc().format('YYYY-MM-DDTHH:mm:ss.SSS'),
         '2011-10-08T18:04:20.111',
         'moment should be able to parse ISO 2011-10-08T18:04:20.111Z'
    	 );
   });

   test('parsing iso with more subsecond precision digits', function (assert) {
      assertEqual(
         moment.utc('2013-07-31T22:00:00.0000000Z').format(),
         '2013-07-31T22:00:00Z',
         'more than 3 subsecond digits'
    	 );
   });

   test('null or empty', function (assert) {
      assertEqual(moment('').isValid(), false, "moment('') is not valid");
      assertEqual(moment(null).isValid(), false, 'moment(null) is not valid');
      assertEqual(
         moment(null, 'YYYY-MM-DD').isValid(),
         false,
         "moment('', 'format') is not valid"
    	 );
      assertEqual(
         moment('', 'YYYY-MM-DD').isValid(),
         false,
         "moment('', 'format') is not valid"
    	 );
      assertEqual(
         moment.utc('').isValid(),
         false,
         "moment.utc('') is not valid"
    	 );
      assertEqual(
         moment.utc(null).isValid(),
         false,
         'moment.utc(null) is not valid'
    	 );
      assertEqual(
         moment.utc(null, 'YYYY-MM-DD').isValid(),
         false,
         'moment.utc(null) is not valid'
    	 );
      assertEqual(
         moment.utc('', 'YYYY-MM-DD').isValid(),
         false,
         "moment.utc('', 'YYYY-MM-DD') is not valid"
    	 );
   });

   test('first century', function (assert) {
      assertEqual(
         moment([0, 0, 1]).format('YYYY-MM-DD'),
         '0000-01-01',
         'Year AD 0'
    	 );
      assertEqual(
         moment([99, 0, 1]).format('YYYY-MM-DD'),
         '0099-01-01',
         'Year AD 99'
    	 );
      assertEqual(
         moment([999, 0, 1]).format('YYYY-MM-DD'),
         '0999-01-01',
         'Year AD 999'
    	 );
      assertEqual(
         moment('0 1 1', 'YYYY MM DD').format('YYYY-MM-DD'),
         '0000-01-01',
         'Year AD 0'
    	 );
      assertEqual(
         moment('999 1 1', 'YYYY MM DD').format('YYYY-MM-DD'),
         '0999-01-01',
         'Year AD 999'
    	 );
      assertEqual(
         moment('0 1 1', 'YYYYY MM DD').format('YYYYY-MM-DD'),
         '00000-01-01',
         'Year AD 0'
    	 );
      assertEqual(
         moment('99 1 1', 'YYYYY MM DD').format('YYYYY-MM-DD'),
         '00099-01-01',
         'Year AD 99'
    	 );
      assertEqual(
         moment('999 1 1', 'YYYYY MM DD').format('YYYYY-MM-DD'),
         '00999-01-01',
         'Year AD 999'
    	 );
   });

/*    test('six digit years', function (assert) {                      */
/*       console.log(                                                  */
/*       assertEqual(                                                 */
/*          moment([-270000, 0, 1]).format('YYYYY-MM-DD'),             */
/*          '-270000-01-01',                                           */
/*          'format BC 270,001'                                        */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment([270000, 0, 1]).format('YYYYY-MM-DD'),              */
/*          '270000-01-01',                                            */
/*          'format AD 270,000'                                        */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('-270000-01-01', 'YYYYY-MM-DD').toDate().getFullYear(), */
/* -270000,                                                            */
/* 'parse BC 270,001'                                                  */
/* );                                                                  */
/*       assertEqual(                                                 */
/*          moment('270000-01-01', 'YYYYY-MM-DD').toDate().getFullYear(), */
/*          270000,                                                    */
/*          'parse AD 270,000'                                         */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('+270000-01-01', 'YYYYY-MM-DD').toDate().getFullYear(), */
/*          270000,                                                    */
/*          'parse AD +270,000'                                        */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment.utc('-270000-01-01', 'YYYYY-MM-DD').toDate().getUTCFullYear(), */
/* -270000,                                                            */
/* 'parse utc BC 270,001'                                              */
/* );                                                                  */
/*       assertEqual(                                                 */
/*          moment.utc('270000-01-01', 'YYYYY-MM-DD').toDate().getUTCFullYear(), */
/*          270000,                                                    */
/*          'parse utc AD 270,000'                                     */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment.utc('+270000-01-01', 'YYYYY-MM-DD').toDate().getUTCFullYear(), */
/*          270000,                                                    */
/*          'parse utc AD +270,000'                                    */
/*     	 );                                                            */
/*    });                                                              */
/*                                                                     */
/*    test('negative four digit years', function (assert) {            */
/*       assertEqual(                                                 */
/*          moment('-1000-01-01', 'YYYYY-MM-DD').toDate().getFullYear(), */
/* -1000,                                                              */
/* 'parse BC 1,001'                                                    */
/* );                                                                  */
/*       assertEqual(                                                 */
/*          moment.utc('-1000-01-01', 'YYYYY-MM-DD').toDate().getUTCFullYear(), */
/* -1000,                                                              */
/* 'parse utc BC 1,001'                                                */
/* );                                                                  */
/*    });                                                              */

   test('strict parsing', function (assert) {
      assertEqual(
         moment('2014-', 'YYYY-Q', true).isValid(),
         false,
         'fail missing quarter'
    	 );

      assertEqual(
         moment('2012-05', 'YYYY-MM', true).format('YYYY-MM'),
         '2012-05',
         'parse correct string'
    	 );
      assertEqual(
         moment(' 2012-05', 'YYYY-MM', true).isValid(),
         false,
         'fail on extra whitespace'
    	 );
      assertEqual(
         moment('foo 2012-05', '[foo] YYYY-MM', true).format('YYYY-MM'),
         '2012-05',
         'handle fixed text'
    	 );
      assertEqual(
         moment('2012 05', 'YYYY-MM', true).isValid(),
         false,
         'fail on different separator'
    	 );
      assertEqual(
         moment('2012 05', 'YYYY MM DD', true).isValid(),
         false,
         'fail on too many tokens'
    	 );

      assertEqual(
         moment('05 30 2010', ['DD MM YYYY', 'MM DD YYYY'], true).format(
            'MM DD YYYY'
            ),
         '05 30 2010',
         'array with bad date'
    	 );
      assertEqual(
         moment('05 30 2010', ['', 'MM DD YYYY'], true).format('MM DD YYYY'),
         '05 30 2010',
         'array with invalid format'
    	 );
      assertEqual(
         moment('05 30 2010', [' DD MM YYYY', 'MM DD YYYY'], true).format(
            'MM DD YYYY'
            ),
         '05 30 2010',
         'array with non-matching format'
    	 );

      assertEqual(
         moment('2010.*...', 'YYYY.*', true).isValid(),
         false,
         'invalid format with regex chars'
    	 );
      assertEqual(
         moment('2010.*', 'YYYY.*', true).year(),
         2010,
         'valid format with regex chars'
    	 );
      assertEqual(
         moment('.*2010.*', '.*YYYY.*', true).year(),
         2010,
         'valid format with regex chars on both sides'
    	 );

      //strict tokens
/*       assertEqual(                                                 */
/*          moment('-5-05-25', 'YYYY-MM-DD', true).isValid(),          */
/*          false,                                                     */
/*          'invalid negative year'                                    */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('2-05-25', 'YYYY-MM-DD', true).isValid(),           */
/*          false,                                                     */
/*          'invalid one-digit year'                                   */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('20-05-25', 'YYYY-MM-DD', true).isValid(),          */
/*          false,                                                     */
/*          'invalid two-digit year'                                   */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('201-05-25', 'YYYY-MM-DD', true).isValid(),         */
/*          false,                                                     */
/*          'invalid three-digit year'                                 */
/*     	 );                                                            */
      assertEqual(
         moment('2010-05-25', 'YYYY-MM-DD', true).isValid(),
         true,
         'valid four-digit year'
    	 );
      assertEqual(
         moment('22010-05-25', 'YYYY-MM-DD', true).isValid(),
         false,
         'invalid five-digit year'
    	 );

      assertEqual(
         moment('12-05-25', 'YY-MM-DD', true).isValid(),
         true,
         'valid two-digit year'
    	 );
      assertEqual(
         moment('2012-05-25', 'YY-MM-DD', true).isValid(),
         false,
         'invalid four-digit year'
    	 );

/*       assertEqual(                                                 */
/*          moment('-5-05-25', 'Y-MM-DD', true).isValid(),             */
/*          true,                                                      */
/*          'valid negative year'                                      */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('2-05-25', 'Y-MM-DD', true).isValid(),              */
/*          true,                                                      */
/*          'valid one-digit year'                                     */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('20-05-25', 'Y-MM-DD', true).isValid(),             */
/*          true,                                                      */
/*          'valid two-digit year'                                     */
/*     	 );                                                            */
/*       assertEqual(                                                 */
/*          moment('201-05-25', 'Y-MM-DD', true).isValid(),            */
/*          true,                                                      */
/*          'valid three-digit year'                                   */
/*     	 );                                                            */
/*                                                                     */
      assertEqual(
         moment('2012-5-25', 'YYYY-M-DD', true).isValid(),
         true,
         'valid one-digit month'
    	 );
      assertEqual(
         moment('2012-5-25', 'YYYY-MM-DD', true).isValid(),
         false,
         'invalid one-digit month'
    	 );
      assertEqual(
         moment('2012-05-25', 'YYYY-M-DD', true).isValid(),
         true,
         'valid one-digit month'
    	 );
      assertEqual(
         moment('2012-05-25', 'YYYY-MM-DD', true).isValid(),
         true,
         'valid one-digit month'
    	 );

      assertEqual(
         moment('2012-05-2', 'YYYY-MM-D', true).isValid(),
         true,
         'valid one-digit day'
    	 );
      assertEqual(
         moment('2012-05-2', 'YYYY-MM-DD', true).isValid(),
         false,
         'invalid one-digit day'
    	 );
      assertEqual(
         moment('2012-05-02', 'YYYY-MM-D', true).isValid(),
         true,
         'valid two-digit day'
    	 );
      assertEqual(
         moment('2012-05-02', 'YYYY-MM-DD', true).isValid(),
         true,
         'valid two-digit day'
    	 );

      assertEqual(
         moment('+002012-05-25', 'YYYYY-MM-DD', true).isValid(),
         true,
         'valid six-digit year'
    	 );
      assertEqual(
         moment('+2012-05-25', 'YYYYY-MM-DD', true).isValid(),
         false,
         'invalid four-digit year'
    	 );

      //thse are kinda pointless, but they should work as expected
      assertEqual(
         moment('1', 'S', true).isValid(),
         true,
         'valid one-digit milisecond'
    	 );
      assertEqual(
         moment('12', 'S', true).isValid(),
         false,
         'invalid two-digit milisecond'
    	 );
      assertEqual(
         moment('123', 'S', true).isValid(),
         false,
         'invalid three-digit milisecond'
    	 );

      assertEqual(
         moment('1', 'SS', true).isValid(),
         false,
         'invalid one-digit milisecond'
    	 );
      assertEqual(
         moment('12', 'SS', true).isValid(),
         true,
         'valid two-digit milisecond'
    	 );
      assertEqual(
         moment('123', 'SS', true).isValid(),
         false,
         'invalid three-digit milisecond'
    	 );

      assertEqual(
         moment('1', 'SSS', true).isValid(),
         false,
         'invalid one-digit milisecond'
    	 );
      assertEqual(
         moment('12', 'SSS', true).isValid(),
         false,
         'invalid two-digit milisecond'
    	 );
      assertEqual(
         moment('123', 'SSS', true).isValid(),
         true,
         'valid three-digit milisecond'
    	 );

      // strict parsing respects month length
      assertOk(
         moment('1 January 2000', 'D MMMM YYYY', true).isValid(),
         'capital long-month + MMMM'
    	 );
      assertOk(
         !moment('1 January 2000', 'D MMM YYYY', true).isValid(),
         'capital long-month + MMM'
    	 );
      assertOk(
         !moment('1 Jan 2000', 'D MMMM YYYY', true).isValid(),
         'capital short-month + MMMM'
    	 );
      assertOk(
         moment('1 Jan 2000', 'D MMM YYYY', true).isValid(),
         'capital short-month + MMM'
    	 );
      assertOk(
         moment('1 january 2000', 'D MMMM YYYY', true).isValid(),
         'lower long-month + MMMM'
    	 );
      assertOk(
         !moment('1 january 2000', 'D MMM YYYY', true).isValid(),
         'lower long-month + MMM'
    	 );
      assertOk(
         !moment('1 jan 2000', 'D MMMM YYYY', true).isValid(),
         'lower short-month + MMMM'
    	 );
      assertOk(
         moment('1 jan 2000', 'D MMM YYYY', true).isValid(),
         'lower short-month + MMM'
    	 );
   });

   test('parsing into a locale', function (assert) {
      moment.defineLocale('parselocale', {
         months: 'one_two_three_four_five_six_seven_eight_nine_ten_eleven_twelve'.split(
            '_'
            ),
         monthsShort: 'one_two_three_four_five_six_seven_eight_nine_ten_eleven_twelve'.split(
            '_'
            ),
      });

      moment.locale('en');

      assertEqual(
         moment('2012 seven', 'YYYY MMM', 'parselocale').month(),
         6,
         'should be able to parse in a specific locale'
    	 );

      moment.locale('parselocale');

      assertEqual(
         moment('2012 july', 'YYYY MMM', 'en').month(),
         6,
         'should be able to parse in a specific locale'
    	 );

      moment.defineLocale('parselocale', null);
   });

   function getVerifier(test) {
      return function (input, format, expected, description, asymetrical) {
         var m = moment(input, format);
         assertEqual(m.format('YYYY MM DD'), expected, 'compare: ' + description);

         //test round trip
         if (!asymetrical) {
            assertEqual(m.format(format), input, 'round trip: ' + description);
         }
      };
   }

   test('parsing week and weekday information', function (assert) {
      var ver = getVerifier(),
         currentWeekOfYear = moment().weeks(),
         expectedDate2012 = moment([2012, 0, 1])
            .day(0)
            .add(currentWeekOfYear - 1, 'weeks')
            .format('YYYY MM DD'),
         expectedDate1999 = moment([1999, 0, 1])
            .day(0)
            .add(currentWeekOfYear - 1, 'weeks')
            .format('YYYY MM DD');

      // year
      ver('12', 'gg', expectedDate2012, 'week-year two digits');
      ver('2012', 'gggg', expectedDate2012, 'week-year four digits');
      ver('99', 'gg', expectedDate1999, 'week-year two digits previous year');
      ver(
         '1999',
         'gggg',
         expectedDate1999,
         'week-year four digits previous year'
    	 );

      ver('99', 'GG', '1999 01 04', 'iso week-year two digits');
      ver('1999', 'GGGG', '1999 01 04', 'iso week-year four digits');

      ver('13', 'GG', '2012 12 31', 'iso week-year two digits previous year');
      ver(
         '2013',
         'GGGG',
         '2012 12 31',
         'iso week-year four digits previous year'
    	 );

      // year + week
      ver('1999 37', 'gggg w', '1999 09 05', 'week');
      ver('1999 37', 'gggg ww', '1999 09 05', 'week double');
      ver('1999 37', 'GGGG W', '1999 09 13', 'iso week');
      ver('1999 37', 'GGGG WW', '1999 09 13', 'iso week double');

      ver('1999 37 4', 'GGGG WW E', '1999 09 16', 'iso day');
      ver('1999 37 04', 'GGGG WW E', '1999 09 16', 'iso day wide', true);

      ver('1999 37 4', 'gggg ww e', '1999 09 09', 'day');
      ver('1999 37 04', 'gggg ww e', '1999 09 09', 'day wide', true);

      // year + week + day
      ver('1999 37 4', 'gggg ww d', '1999 09 09', 'd');
      ver('1999 37 Th', 'gggg ww dd', '1999 09 09', 'dd');
      ver('1999 37 Thu', 'gggg ww ddd', '1999 09 09', 'ddd');
      ver('1999 37 Thursday', 'gggg ww dddd', '1999 09 09', 'dddd');

      // lower-order only
      assertEqual(moment('22', 'ww').week(), 22, 'week sets the week by itself');
      assertEqual(
         moment('22', 'ww').weekYear(),
         moment().weekYear(),
         'week keeps this year'
    	 );
      assertEqual(
         moment('2012 22', 'YYYY ww').weekYear(),
         2012,
         'week keeps parsed year'
    	 );

      assertEqual(
         moment('22', 'WW').isoWeek(),
         22,
         'iso week sets the week by itself'
    	 );
      assertEqual(
         moment('2012 22', 'YYYY WW').weekYear(),
         2012,
         'iso week keeps parsed year'
    	 );
      assertEqual(
         moment('22', 'WW').isoWeekYear(),
         moment().isoWeekYear(),
         'iso week keeps this year'
    	 );

      // order
      ver('6 2013 2', 'e gggg w', '2013 01 12', "order doesn't matter");
      ver('6 2013 2', 'E GGGG W', '2013 01 12', "iso order doesn't matter");

      //can parse other stuff too
      assertEqual(
         moment('1999-W37-4 3:30', 'GGGG-[W]WW-E HH:mm').format(
            'YYYY MM DD HH:mm'
            ),
         '1999 09 16 03:30',
         'parsing weeks and hours'
    	 );

      // In safari, all years before 1300 are shifted back with one day.
      // http://stackoverflow.com/questions/20768975/safari-subtracts-1-day-from-dates-before-1300
      if (new Date('1300-01-01').getUTCFullYear() === 1300) {
         // Years less than 100
         ver('0098-06', 'GGGG-WW', '0098 02 03', 'small years work', true);
      }
   });

   test('parsing localized weekdays', function (assert) {
      var ver = getVerifier();
      try {
         moment.locale('dow:1,doy:4', {
            weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split(
	       '_'
               ),
            weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
            week: { dow: 1, doy: 4 },
         });
         ver('1999 37 4', 'GGGG WW E', '1999 09 16', 'iso ignores locale');
         ver('1999 37 7', 'GGGG WW E', '1999 09 19', 'iso ignores locale');

         ver(
            '1999 37 0',
            'gggg ww e',
            '1999 09 13',
            'localized e uses local doy and dow: 0 = monday'
            );
         ver(
            '1999 37 4',
            'gggg ww e',
            '1999 09 17',
            'localized e uses local doy and dow: 4 = friday'
            );

         ver(
            '1999 37 1',
            'gggg ww d',
            '1999 09 13',
            'localized d uses 0-indexed days: 1 = monday'
            );
         ver(
            '1999 37 Lu',
            'gggg ww dd',
            '1999 09 13',
            'localized d uses 0-indexed days: Mo'
            );
         ver(
            '1999 37 lun.',
            'gggg ww ddd',
            '1999 09 13',
            'localized d uses 0-indexed days: Mon'
            );
         ver(
            '1999 37 lundi',
            'gggg ww dddd',
            '1999 09 13',
            'localized d uses 0-indexed days: Monday'
            );
         ver(
            '1999 37 4',
            'gggg ww d',
            '1999 09 16',
            'localized d uses 0-indexed days: 4'
            );

         //sunday goes at the end of the week
         ver(
            '1999 37 0',
            'gggg ww d',
            '1999 09 19',
            'localized d uses 0-indexed days: 0 = sund'
            );
         ver(
            '1999 37 Di',
            'gggg ww dd',
            '1999 09 19',
            'localized d uses 0-indexed days: 0 = sund'
            );
      } finally {
         moment.defineLocale('dow:1,doy:4', null);
         moment.locale('en');
      }
   });

   test('parsing with customized two-digit year', function (assert) {
      var original = moment.parseTwoDigitYear;
      try {
         assertEqual(moment('68', 'YY').year(), 2068);
         assertEqual(moment('69', 'YY').year(), 1969);
         moment.parseTwoDigitYear = function (input) {
            return +input + (+input > 30 ? 1900 : 2000);
         };
         assertEqual(moment('68', 'YY').year(), 1968);
         assertEqual(moment('67', 'YY').year(), 1967);
         assertEqual(moment('31', 'YY').year(), 1931);
         assertEqual(moment('30', 'YY').year(), 2030);
      } finally {
         moment.parseTwoDigitYear = original;
      }
   });

   test('array with strings', function (assert) {
      assertEqual(
         moment(['2014', '7', '31']).isValid(),
         true,
         'string array + isValid'
    	 );
   });

   test('object with strings', function (assert) {
      assertEqual(
         moment({ year: '2014', month: '7', day: '31' }).isValid(),
         true,
         'string object + isValid'
    	 );
   });

   test('utc with array of formats', function (assert) {
      assertEqual(
         moment.utc('2014-01-01', ['YYYY-MM-DD', 'YYYY-MM']).format(),
         '2014-01-01T00:00:00Z',
         'moment.utc works with array of formats'
    	 );
   });

   test('parsing invalid string weekdays', function (assert) {
      assertEqual(
         false,
         moment('a', 'dd').isValid(),
         'dd with invalid weekday, non-strict'
    	 );
      assertEqual(
         false,
         moment('a', 'dd', true).isValid(),
         'dd with invalid weekday, strict'
    	 );
      assertEqual(
         false,
         moment('a', 'ddd').isValid(),
         'ddd with invalid weekday, non-strict'
    	 );
      assertEqual(
         false,
         moment('a', 'ddd', true).isValid(),
         'ddd with invalid weekday, strict'
    	 );
      assertEqual(
         false,
         moment('a', 'dddd').isValid(),
         'dddd with invalid weekday, non-strict'
    	 );
      assertEqual(
         false,
         moment('a', 'dddd', true).isValid(),
         'dddd with invalid weekday, strict'
    	 );
   });

   test('milliseconds', function (assert) {
      assertEqual(moment('1', 'S').millisecond(), 100);
      assertEqual(moment('12', 'SS').millisecond(), 120);
      assertEqual(moment('123', 'SSS').millisecond(), 123);
      assertEqual(moment('1234', 'SSSS').millisecond(), 123);
      assertEqual(moment('12345', 'SSSSS').millisecond(), 123);
      assertEqual(moment('123456', 'SSSSSS').millisecond(), 123);
      assertEqual(moment('1234567', 'SSSSSSS').millisecond(), 123);
      assertEqual(moment('12345678', 'SSSSSSSS').millisecond(), 123);
      assertEqual(moment('123456789', 'SSSSSSSSS').millisecond(), 123);
   });

   test('hmm', function (assert) {
      assertEqual(
         moment('123', 'hmm', true).format('HH:mm:ss'),
         '01:23:00',
         '123 with hmm'
    	 );
      assertEqual(
         moment('123a', 'hmmA', true).format('HH:mm:ss'),
         '01:23:00',
         '123a with hmmA'
    	 );
      assertEqual(
         moment('123p', 'hmmA', true).format('HH:mm:ss'),
         '13:23:00',
         '123p with hmmA'
    	 );

      assertEqual(
         moment('1234', 'hmm', true).format('HH:mm:ss'),
         '12:34:00',
         '1234 with hmm'
    	 );
      assertEqual(
         moment('1234a', 'hmmA', true).format('HH:mm:ss'),
         '00:34:00',
         '1234a with hmmA'
    	 );
      assertEqual(
         moment('1234p', 'hmmA', true).format('HH:mm:ss'),
         '12:34:00',
         '1234p with hmmA'
    	 );

      assertEqual(
         moment('12345', 'hmmss', true).format('HH:mm:ss'),
         '01:23:45',
         '12345 with hmmss'
    	 );
      assertEqual(
         moment('12345a', 'hmmssA', true).format('HH:mm:ss'),
         '01:23:45',
         '12345a with hmmssA'
    	 );
      assertEqual(
         moment('12345p', 'hmmssA', true).format('HH:mm:ss'),
         '13:23:45',
         '12345p with hmmssA'
    	 );
      assertEqual(
         moment('112345', 'hmmss', true).format('HH:mm:ss'),
         '11:23:45',
         '112345 with hmmss'
    	 );
      assertEqual(
         moment('112345a', 'hmmssA', true).format('HH:mm:ss'),
         '11:23:45',
         '112345a with hmmssA'
    	 );
      assertEqual(
         moment('112345p', 'hmmssA', true).format('HH:mm:ss'),
         '23:23:45',
         '112345p with hmmssA'
    	 );

      assertEqual(
         moment('023', 'Hmm', true).format('HH:mm:ss'),
         '00:23:00',
         '023 with Hmm'
    	 );
      assertEqual(
         moment('123', 'Hmm', true).format('HH:mm:ss'),
         '01:23:00',
         '123 with Hmm'
    	 );
      assertEqual(
         moment('1234', 'Hmm', true).format('HH:mm:ss'),
         '12:34:00',
         '1234 with Hmm'
    	 );
      assertEqual(
         moment('1534', 'Hmm', true).format('HH:mm:ss'),
         '15:34:00',
         '1234 with Hmm'
    	 );
      assertEqual(
         moment('12345', 'Hmmss', true).format('HH:mm:ss'),
         '01:23:45',
         '12345 with Hmmss'
    	 );
      assertEqual(
         moment('112345', 'Hmmss', true).format('HH:mm:ss'),
         '11:23:45',
         '112345 with Hmmss'
    	 );
      assertEqual(
         moment('172345', 'Hmmss', true).format('HH:mm:ss'),
         '17:23:45',
         '112345 with Hmmss'
    	 );
   });

   test('Y token', function (assert) {
      assertEqual(moment('1-1-2010', 'M-D-Y', true).year(), 2010, 'parsing Y');
   });

   test('parsing flags retain parsed date parts', function (assert) {
      var a = moment('10 p', 'hh:mm a'),
         b;
      assertEqual(
         a.parsingFlags().parsedDateParts[3],
         10,
         'parsed 10 as the hour'
    	 );
      assertEqual(
         a.parsingFlags().parsedDateParts[0],
         undefined,
         'year was not parsed'
    	 );
      assertEqual(a.parsingFlags().meridiem, 'p', 'meridiem flag was added');
      b = moment('10:30', ['MMDDYY', 'HH:mm']);
      assertEqual(
         b.parsingFlags().parsedDateParts[3],
         10,
         'multiple format parshing matched hour'
    	 );
      assertEqual(
         b.parsingFlags().parsedDateParts[0],
         undefined,
         'array is properly copied, no residual data from first token parse'
    	 );
   });

   test('parsing only meridiem results in invalid date', function (assert) {
      assertOk(
         !moment('alkj', 'hh:mm a').isValid(),
         'because an a token is used, a meridiem will be parsed but nothing else was so invalid'
    	 );
      assertOk(
         moment('02:30 p more extra stuff', 'hh:mm a').isValid(),
         'because other tokens were parsed, date is valid'
    	 );
      assertOk(
         moment('1/1/2016 extra data', ['a', 'M/D/YYYY']).isValid(),
         'took second format, does not pick up on meridiem parsed from first format (good copy)'
    	 );
   });

   test('invalid dates return invalid for methods that access the _d prop', function (assert) {
      var momentAsDate = moment(['2015', '12', '1']).toDate();
      assertOk(momentAsDate instanceof Date, 'toDate returns a Date object');
      assertOk(
         isNaN(momentAsDate.getTime()),
         'toDate returns an invalid Date invalid'
    	 );
   });

   test('k, kk', function (assert) {
      var i, kVal, kkVal;
      for (i = -1; i <= 24; i++) {
         kVal = i + ':15:59';
         kkVal = (i < 10 ? '0' : '') + i + ':15:59';
         if (i !== 24) {
            assertOk(
	       moment(kVal, 'k:mm:ss').isSame(moment(kVal, 'H:mm:ss')),
	       kVal + ' k parsing'
               );
            assertOk(
	       moment(kkVal, 'kk:mm:ss').isSame(moment(kkVal, 'HH:mm:ss')),
	       kkVal + ' kk parsing'
               );
         } else {
            assertEqual(
	       moment(kVal, 'k:mm:ss').format('k:mm:ss'),
	       kVal,
	       kVal + ' k parsing'
               );
            assertEqual(
	       moment(kkVal, 'kk:mm:ss').format('kk:mm:ss'),
	       kkVal,
	       kkVal + ' skk parsing'
               );
         }
      }
   });
}   

function testAll( verb ) {
   verbOn = verb;
   testAddSubtract();
   testCalendar();
   testCreate();
}

function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   testAll( true );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      testAll( false );
   }
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 100;

main( "moment", N ); 
