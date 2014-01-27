var core = exports;
var protoslice = Array.prototype.slice;
var _ = require("lodash");

core.isArray = _.isArray;
core.isArguments = _.isArguments;
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

core.get = function get(x, key) {
  return x[key];
};

core.getter = function getter(key) {
  return function(x) {
    return x[key];
  };
};

core.pickValues = function pickValues(object, keys) {
  return core.map(keys, core.partial(core.get, object));
};

core.joiner = function joiner(separator) {
  return function() {
    return protoslice.call(arguments).join(separator);
  };
};

core.extracting = function extracting(/* keys... */) {
  var keys = arguments;
  return function(func) {
    return function(object) {
      return func.apply(null, core.pickValues(object, keys));
    };
  };
};

core.functionalize = function functionalize(method) {
  return function(ctx /*, args */) {
    return method.apply(ctx, protoslice.call(arguments, 1));
  };
};

core.cons = function cons(x, xs) {
  if (core.isArguments(xs)) {
    return [x].concat(protoslice.call(xs));
  } else {
    return [x].concat(xs);
  }
};

core.methodize = function methodize(func) {
  return function() {
    return func.apply(null, core.cons(this, arguments));
  };
};

core.isFunction = function isFunction(x) {
  return typeof x === 'function';
};

core.unary = function unary(func) {
  return function(args) {
    return func.apply(this, args);
  };
};

core.variadic = function variadic(func) {
  return function() {
    return func.call(this, arguments);
  };
};

core.flip = function flip(func) {
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

core.partialRest = function partialRest(func /*, args... */) {
  var args = arguments;
  return function(x) {
    return func.apply(this, core.cons(x, protoslice.call(args, 1)));
  };
};

core.arrayTransformer = function arrayTransformer(functionSchemaArray) {
  return function(array) {
    return core.map(array, function(item, i) {
      return (functionSchemaArray[i] || core.identity)(item);
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
    return core.isFunction(schemaValue) ? core.extracting(key)(schemaValue) : schemaValue;
  }));
};

core.merge = function merge() {
  return core.EXTEND.apply(null, core.cons({}, arguments));
};

core.gathersInputs = core.compose(core.methodize, core.variadic);
core.spreadsInputs = core.compose(core.unary, core.functionalize);

core.composedOn = core.partial(core.partialRest, core.compose);
core.mapper = core.partial(core.partialRest, core.map);
core.call = core.functionalize(Function.prototype.call);
core.apply = core.functionalize(Function.prototype.apply);
core.slice = core.functionalize(protoslice);

core.wrapReturnedValue = core.partial(core.partial, core.compose);
