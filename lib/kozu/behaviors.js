var core = require("./core");

// A "behavior" is a function which wraps another function,
// returning a new version which adds something new but presumably
// still calls the original at some point
var behaviors = exports;

var protoslice = Array.prototype.slice;

// this one isn't actually a behavior itself, but it returns one
behaviors.extractsKeys = function extractsKeys(/* ... keys */) {
  var keys = arguments;
  return function(func) {
    return function(object) {
      return func.apply(null, core.multiGet(object, keys));
    };
  };
};

behaviors.functionalize = function functionalize(method) {
  return function(ctx /*, args */) {
    return method.apply(ctx, protoslice.call(arguments, 1));
  };
};
behaviors.rotatesThisOutOfArguments = behaviors.functionalize;

behaviors.methodize = function methodize(func) {
  return function() {
    return func.apply(null, core.cons(this, arguments));
  };
};
behaviors.rotatesThisIntoArguments = behaviors.methodize;

behaviors.congealed = function congealed(func) {
  return function(args) {
    return func.apply(this, args);
  };
};
behaviors.spreadsArrayArgument = behaviors.congealed;

behaviors.variadic = function variadic(func) {
  return function() {
    return func.call(this, protoslice.call(arguments));
  };
};
behaviors.gathersArguments = behaviors.variadic;

behaviors.flip2 = function flip2(func) {
  return function(a, b) {
    return func.call(this, b, a);
  };
};

behaviors.debugging = function debugging(func) {
  return function() {
    /*jshint -W087 */
    debugger;
    return func.apply(this, arguments);
  };
};

behaviors.mergesReturnValueOntoArgument = function mergesReturnValueOntoArgument(func) {
  return function(obj) {
    return core.merge(obj, func.apply(this, arguments));
  };
};

behaviors.gathersThisAndArguments = core.compose(behaviors.rotatesThisIntoArguments, behaviors.gathersArguments);
behaviors.spreadsThisAndArguments = core.compose(behaviors.spreadsArrayArgument, behaviors.rotatesThisOutOfArguments);

behaviors.transformsArgumentWith = core.partial(core.partialRest, core.compose);
behaviors.transformsReturnValueWith = core.partial(core.partial, core.compose);

