var core = exports;
var pSlice = Array.prototype.slice;

function functionalize(method) {
  return function(ctx /*, args */) {
    return method.apply(ctx, pSlice.call(arguments, 1));
  };
}

function isFunction(x) {
  return typeof x === 'function';
}

core.functionalize = functionalize;
core.isFunction = isFunction;
