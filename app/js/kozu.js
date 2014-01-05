(function(root){
  var protoSlice = Array.prototype.slice;

  function buildKozu(opts) {
    var kozu = {};
    // ===
    // using underscore temporarily to sketch:
    var extend = kozu.extend = _.extend;
    var some = kozu.some = _.some;
    var map = kozu.map = _.map;
    var filter = kozu.filter = _.filter;
    var reduce = kozu.reduce = _.reduce;

    function merge() {
      return _.extend({}, arguments);
    }
    kozu.merge = merge;
    // ===

    function identity(x) {
      return x;
    }
    kozu.identity = identity;

    function args() {
      return arguments;
    }
    kozu.args = args;

    function functionalize(method) {
      return function(ctx /*, args */) {
        return method.apply(ctx, protoSlice.call(arguments, 1));
      };
    }
    kozu.functionalize = functionalize;

    var call = kozu.call = functionalize(Function.prototype.call);

    var apply = kozu.apply = functionalize(Function.prototype.apply);

    var slice = kozu.slice = functionalize(protoSlice);

    // constructing(Array)(1,2,3) => [1,2,3]
    // generated from CoffeeScript: (klass) -> new klass(arguments...)
    function constructing(klass) {
      return (function(func, args, Ctor) {
        Ctor.prototype = func.prototype;
        var child = new Ctor(), result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(klass, arguments, function(){});
    }
    kozu.constructing = constructing;

    function isFunction(x) {
      return typeof x === 'function';
    }
    kozu.isFunction = isFunction;

    // "has a .then method"
    function isThenable(x) {
      return x != null && kozu.isFunction(x.then);
    }
    kozu.isThenable = isThenable;
    var isPromise = kozu.isPromise = isThenable;

    var makePromise = kozu.makePromise = function makePromise(resolver) {
      return new Promise(resolver);
    };

    // TODO: try/catch and return rejecting promise on error
    function whenever(value, func) {
      return isPromise(value) ? value.then(func) : func(value);
    }
    kozu.whenever = whenever;

    function all(items) {
      return some(items, isPromise) ? Promise.all(items) : results;
    }
    kozu.all = all;

    function cons(head, tail) {
      return [head].concat(tail);
    }

    // function agnosticApply(func, ctx, args) {
    //   return whenever(all([func, ctx].concat(args)), function(values) {
    //     var func = values[0], ctx = values[1], 
    //   });
    // }

    function agnostic(func) {
      return (function() {
        return whenever(all(cons(this, arguments)), function(ctxAndArgs) {
          func.apply(ctxAndArgs[0], ctxAndArgs[1]);
        });
      });
    }
    kozu.agnostic = agnostic;

    var agnosticApply = agnostic(apply);

    // what would a generalized deep* function look like?
    function deepAgnostic(func) {
      if (isFunction(func)) {
        return (function() {
          // this isn't quite right:
          // return agnosticApply(func, this, map(arguments, deepAgnostic));
        });
      } else {
        return func;
      }
    }
    kozu.deepAgnostic = deepAgnostic;

    // 
    // function infect(func, mod) {};

    // override object properties
    extend(kozu, opts);

    // override just a few locals
    isPromise = kozu.isPromise;
    makePromise = kozu.makePromise;

    return kozu;
  }

  // var simple = {
  //   apply: function() {},
  //   call: function() {},
  //   map: function() {},
  //   filter: function() {},
  //   compose: function() {},
  // }
  // var kozu = merge(simple, {
  //   simple: simple,
  //   agnostic: mapValues(simple, agnostic),
  //   deepAgnostic: mapValues(simple, deepAgnostic),
  //   forced: mapValues(simple, forced)
  // });
  // var myLib = mapValues(kozu.simple, myWrapper);
  // var myComplexLib = mapValues(kozu.simple, compose(middleware1, middleware2));
  root.kozu = buildKozu();
})(this);
