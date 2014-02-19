var core = exports;
var protoslice = Array.prototype.slice;
var _ = require("lodash");

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

core.extractsKeys = function extractsKeys(/* ... keys */) {
  var keys = arguments;
  return function(func) {
    return function(object) {
      return func.apply(null, core.multiGet(object, keys));
    };
  };
};

core.castArgumentsAsArray = function castArgumentsAsArray(x) {
  return (core.isArguments(x)) ? protoslice.call(x) : x;
}

core.cons = function cons(x, xs) {
  return [x].concat(core.castArgumentsAsArray(xs));
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
core.spreadsArrayArgument = core.congealed;

core.variadic = function variadic(func) {
  return function() {
    return func.call(this, protoslice.call(arguments));
  };
};
core.gathersArguments = core.variadic;

core.flip2 = function flip2(func) {
  return function(a, b) {
    return func.call(this, b, a);
  };
};

core.debugIdentity = function debugIdentity(x) {
  /*jshint -W087 */
  debugger;
  return x;
};

core.debugging = function debugging(func) {
  return function() {
    /*jshint -W087 */
    debugger;
    return func.apply(this, arguments);
  };
};

core.partialRest = function partialRest(func /*, ... args */) {
  var args = arguments;
  return function(x) {
    return func.apply(this, core.cons(x, protoslice.call(args, 1)));
  };
};

core.arrayTransformer = function arrayTransformer(functionSchemaArray) {
  return function(array) {
    return core.map(array, function(item, i) {
      var schemaElement = functionSchemaArray[i];
      return (schemaElement == null) ? item : schemaElement(item);
    });
  };
};

core.objectTemplate = function objectTemplate(functionSchemaObject) {
  return function(object) {
    return core.mapObjectValues(functionSchemaObject, function(schemaValue) {
      return (core.isFunction(schemaValue) ? schemaValue(object) : schemaValue);
    });
  };
};

core.objectPropertyTemplate = function objectPropertyTemplate(functionSchemaObject) {
  return core.objectTemplate(core.mapObjectValues(functionSchemaObject, function(schemaValue, key) {
    return core.isFunction(schemaValue) ? core.extractsKeys(key)(schemaValue) : schemaValue;
  }));
};

core.merge = function merge(/* ... objects */) {
  return core.EXTEND.apply(null, core.cons({}, arguments));
};

core.mergesReturnValueOntoArgument = function mergesReturnValueOntoArgument(func) {
  return function(obj) {
    return core.merge(obj, func.apply(this, arguments));
  };
};

core.now = function now() {
  return new Date().getTime();
};

core.call = core.functionalize(Function.prototype.call);
core.apply = core.functionalize(Function.prototype.apply);
core.slice = core.functionalize(protoslice);
core.join = core.functionalize(Array.prototype.join);

core.gathersThisAndArguments = core.compose(core.rotatesThisIntoArguments, core.gathersArguments);
core.spreadsThisAndArguments = core.compose(core.spreadsArrayArgument, core.rotatesThisOutOfArguments);

core.composeArray = core.spreadsArrayArgument(core.compose);

core.transformsArgumentWith = core.partial(core.partialRest, core.compose);
core.transformsReturnValueWith = core.partial(core.partial, core.compose);

core.mapper = core.partial(core.partialRest, core.map);
core.joiner = core.partial(core.partialRest, core.join);

core.argumentMapper = core.compose(core.gathersArguments, core.mapper);
core.argumentJoiner = core.compose(core.gathersArguments, core.joiner);


