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
  }
}

function isFunction(x) {
  return typeof x === 'function';
}

function unary(func) {
  return function(args) {
    return func.apply(this, args);
  }
}

function variadic(func) {
  return function() {
    return func.call(this, arguments);
  }
}

function flip(func) {
  return function(a, b) {
    return func.call(this, b, a);
  }
}

function debugging(func) {
  return function() {
    debugger;
    return func.apply(this, arguments);
  }
}

var congeal = compose(unary, functionalize);
var disperse = compose(methodize, variadic);

core.functionalize = functionalize;
core.methodize = methodize;
core.isFunction = isFunction;
core.cons = cons;
core.unary = unary;
core.variadic = variadic;
core.congeal = congeal;
core.disperse = disperse;
core.flip = flip;
core.isArray = _.isArray;
core.isArguments = _.isArguments;
core.map = _.map;
core.compose = compose;
core.partial = _.partial;
core.each = _.each;
core.any = _.any;
core.debugging = debugging;
