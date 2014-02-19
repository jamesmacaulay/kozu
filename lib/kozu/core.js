var _ = require("lodash");

var core = exports;

var protoslice = Array.prototype.slice;

core.isArray = _.isArray;
core.isArguments = _.isArguments;
core.isObject = _.isObject;
core.compose = _.compose;
core.identity = _.identity;
core.each = _.each;
core.map = _.map;
core.isArray = _.isArray;
core.isArguments = _.isArguments;
core.partial = _.partial;
core.any = _.any;
core.pipe = _.pipe;
core.reduce = _.reduce;
core.filter = _.filter;
core.mapObjectValues = _.mapValues;
core.EXTEND = _.extend;

core.isFunction = function isFunction(x) {
  return typeof x === 'function';
};

core.get = function get(x, key) {
  return x[key];
};

core.getter = function getter(key) {
  return function(x) {
    return x[key];
  };
};

core.args = function args() {
  return arguments;
};

// adapted from CoffeeScript's variadic constructor code
core.factory = function factory(ctor) {
  return function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor(), result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(ctor, arguments, function(){});
  };
};

core.multiGet = function multiGet(object, keys) {
  return core.map(keys, core.partial(core.get, object));
};

core.castArgumentsAsArray = function castArgumentsAsArray(x) {
  return core.isArguments(x) ? protoslice.call(x) : x;
};

core.cons = function cons(x, xs) {
  return [x].concat(core.castArgumentsAsArray(xs));
};

core.debugIdentity = function debugIdentity(x) {
  /*jshint -W087 */
  debugger;
  return x;
};

core.partialRest = function partialRest(func /*, ... args */) {
  var args = arguments;
  return function(x) {
    return func.apply(this, core.cons(x, protoslice.call(args, 1)));
  };
};

core.merge = function merge(/* ... objects */) {
  return core.EXTEND.apply(null, core.cons({}, arguments));
};

core.now = function now() {
  return new Date().getTime();
};

core.mapper = core.partial(core.partialRest, core.map);

