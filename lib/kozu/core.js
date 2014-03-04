"use strict";

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

core.merge = function merge(/* ... objects */) {
  return core.EXTEND.apply(null, core.cons({}, arguments));
};

core.now = function now() {
  return new Date().getTime();
};

core.partialRest = function partialRest(func /*, ... args */) {
  var args = arguments;
  return function(x) {
    return func.apply(this, core.cons(x, protoslice.call(args, 1)));
  };
};

core.functionalize = function functionalize(method) {
  return function(ctx /*, args */) {
    return method.apply(ctx, protoslice.call(arguments, 1));
  };
};
core.rotatesThisOutOfArguments = core.functionalize;

core.methodize = function methodize(func) {
  return function() {
    return func.apply(null, core.cons(this, arguments));
  };
};
core.rotatesThisIntoArguments = core.methodize;

core.congealed = function congealed(func) {
  return function(args) {
    return func.apply(this, args);
  };
};
core.spreadsArguments = core.congealed;

core.variadic = function variadic(func) {
  return function() {
    return func.call(this, protoslice.call(arguments));
  };
};
core.gathersArguments = core.variadic;


// adapted from CoffeeScript's variadic constructor code
// takes a constructor function and returns a variadic
// function which returns `new ctor(... args)`
core.factory = function factory(ctor) {
  return function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor(), result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(ctor, arguments, function(){});
  };
};

core.flip2 = function flip2(func) {
  return function(a, b) {
    return func.call(this, b, a);
  };
};

core.debugging = function debugging(func) {
  return function() {
    /*jshint -W087 */
    debugger;
    return func.apply(this, arguments);
  };
};

core.mergesReturnValueOntoArgument = function mergesReturnValueOntoArgument(func) {
  return function(obj) {
    return core.merge(obj, func.apply(this, arguments));
  };
};

core.gathersThisAndArguments = core.compose(
  core.rotatesThisIntoArguments,
  core.gathersArguments
);
core.spreadsThisAndArguments = core.compose(
  core.spreadsArguments,
  core.rotatesThisOutOfArguments
);

core.extractsKeys = function extractsKeys(/* ... keys */) {
  var keys = arguments;
  return function(func) {
    return function(object) {
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

core.mapper = core.partial(core.partialRest, core.map);
core.joiner = core.partial(core.partialRest, core.join);

core.composeArray = core.spreadsArguments(core.compose);

core.argumentMapper = core.compose(core.gathersArguments, core.mapper);
core.argumentJoiner = core.compose(core.gathersArguments, core.joiner);