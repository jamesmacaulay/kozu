"use strict";

var _ = require("lodash");

var core = exports;

var protoslice = Array.prototype.slice;

core.isArray = _.isArray;
core.isArguments = _.isArguments;
core.isObject = _.isObject;
core.compose = _.compose;
core.each = _.each;
core.map = _.map;
core.isArray = _.isArray;
core.isArguments = _.isArguments;
core.partial = _.partial;
core.any = _.any;
core.reduce = _.reduce;
core.filter = _.filter;
core.mapObjectValues = _.mapValues;
core.contains = _.contains;
core.EXTEND = _.extend;

core.identity = function identity(x) {
  return x;
};

core.constant = function constant(x) {
  return function constantFunction() {
    return x;
  };
};

core.doTo = function doTo(x, func) {
  func(x);
  return x;
};

core.pipe = function pipe(x /*, ... funcs */) {
  /*jshint -W087 */
  var funcs = protoslice.call(arguments, 1).reverse();
  return core.composeArray(funcs)(x);
};

core.isFunction = function isFunction(x) {
  return typeof x === 'function';
};

core.get = function get(obj, key) {
  return obj[key];
};

core.getter = function getter(key) {
  return function getting(obj) {
    return obj[key];
  };
};

core.args = function args() {
  return arguments;
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

core.debugsArguments = function debugsArguments(func) {
  return function debuggingArguments(a, b, c) {
    /*jshint -W087 */
    debugger;
    return func.apply(this, arguments);
  };
};

core.merge = function merge(/* ... objects */) {
  return core.EXTEND.apply(null, core.cons({}, arguments));
};

core.now = function now() {
  return new Date().getTime();
};

core.partialRest = function partialRest(func /*, ... args */) {
  var args = arguments;
  return function partiallyAppliedWithRest(x) {
    return func.apply(this, core.cons(x, protoslice.call(args, 1)));
  };
};

core.rotatesThisOutOfArguments = function rotatesThisOutOfArguments(method) {
  return function rotatingThisOutOfArguments(ctx /*, args */) {
    return method.apply(ctx, protoslice.call(arguments, 1));
  };
};
core.functionalize = core.rotatesThisOutOfArguments;

core.rotatesThisIntoArguments = function rotatesThisIntoArguments(func) {
  return function rotatingThisIntoArguments() {
    return func.apply(null, core.cons(this, arguments));
  };
};
core.methodize = core.rotatesThisIntoArguments;

core.spreadsArguments = function spreadsArguments(func) {
  return function spreadingArguments(args) {
    return func.apply(this, args);
  };
};
core.congealed = core.spreadsArguments;

core.gathersArguments = function gathersArguments(func) {
  return function gatheringArguments() {
    return func.call(this, protoslice.call(arguments));
  };
};
core.variadic = core.gathersArguments;


// adapted from CoffeeScript's variadic constructor code
// takes a constructor function and returns a variadic
// function which returns `new ctor(... args)`
core.factory = function factory(ctor) {
  return function factoryFunction() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor(), result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(ctor, arguments, function(){});
  };
};

core.flip2 = function flip2(func) {
  return function flipping2Arguments(a, b) {
    return func.call(this, b, a);
  };
};

core.mergesReturnValueOntoArgument = function mergesReturnValueOntoArgument(func) {
  return function mergingReturnValueOntoArguments(obj) {
    return core.merge(obj, func.apply(this, arguments));
  };
};

core.gathersThisAndArguments = function gathersThisAndArguments(func) {
  return function gatheringThisAndArguments() {
    return func.call(null, [this].concat(protoslice.call(arguments)));
  };
};

core.spreadsThisAndArguments = function spreadsThisAndArguments(func) {
  return function spreadingThisAndArguments(inputs) {
    return func.apply(inputs[0], protoslice.call(inputs, 1));
  };
};

core.extractsKeys = function extractsKeys(/* ... keys */) {
  var keys = arguments;
  return function extractsKeysFunction(func) {
    return function extractingKeys(object) {
      return func.apply(null, core.multiGet(object, keys));
    };
  };
};

core.transformsArgumentWith = core.partial(core.partialRest, core.compose);
core.transformsReturnValueWith = core.partial(core.partial, core.compose);

core.call = core.functionalize(Function.prototype.call);
core.apply = core.functionalize(Function.prototype.apply);
core.slice = core.functionalize(Array.prototype.slice);
core.join = core.functionalize(Array.prototype.join);
core.toString = core.functionalize(Object.prototype.toString);

core.mapper = core.partial(core.partialRest, core.map);
core.joiner = core.partial(core.partialRest, core.join);

core.composeArray = core.spreadsArguments(core.compose);

core.argumentMapper = core.compose(core.gathersArguments, core.mapper);
core.argumentJoiner = core.compose(core.gathersArguments, core.joiner);