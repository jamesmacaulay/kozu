var core = exports;
var slice = Array.prototype.slice;
var _ = require("lodash");

var isArray = _.isArray;
var isArguments = _.isArguments;
var compose = _.compose;

function functionalize(method) {
  return function(ctx /*, args */) {
    return method.apply(ctx, slice.call(arguments, 1));
  };
}

function cons(x, xs) {
  if (isArguments(xs)) {
    return [x].concat(slice.call(xs));
  } else {
    return [x].concat(xs);
  }
}

function methodize(func) {
  return function() {
    return func.apply(null, cons(this, arguments));
  };
}

function isFunction(x) {
  return typeof x === 'function';
}

function unary(func) {
  return function(args) {
    return func.apply(this, args);
  };
}

function variadic(func) {
  return function() {
    return func.call(this, arguments);
  };
}

function flip(func) {
  return function(a, b) {
    return func.call(this, b, a);
  };
}

function debugging(func) {
  return function() {
    /*jshint -W087 */
    debugger;
    return func.apply(this, arguments);
  };
}

function partialRest(func /*, args... */) {
  var args = arguments;
  return function(x) {
    return func.apply(this, cons(x, slice.call(args, 1)));
  };
}

var identity = core.identiy = _.identity;
var each = core.each = _.each;
var map = core.map = _.map;

core.arrayTransformer = function arrayTransformer(template) {
  return function(array) {
    return map(array, function(item, i) {
      return (template[i] || identity)(item);
    });
  };
};

core.functionalize = functionalize;
core.methodize = methodize;
core.isFunction = isFunction;
core.cons = cons;
core.unary = unary;
core.variadic = variadic;
core.flip = flip;
core.isArray = _.isArray;
core.isArguments = _.isArguments;
core.compose = compose;
core.partial = _.partial;
core.any = _.any;
core.debugging = debugging;
core.partialRest = partialRest;
core.pipe = _.pipe;

core.gathersInputs = compose(methodize, variadic);
core.spreadsInputs = compose(unary, functionalize);
core.inputTransformer = core.spreadsInputs(core.arrayTransformer);

core.composedOn = core.partial(partialRest, core.compose);
core.mapper = core.partial(core.partialRest, core.map);
