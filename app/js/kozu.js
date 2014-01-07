(function(root){
  var protoSlice = Array.prototype.slice;

  function buildKozu(opts) {
    var kozu = {};
    // ===
    // using underscore temporarily to sketch:
    var extend = kozu.extend = _.extend;
    var any = kozu.any = _.any;
    var map = kozu.map = _.map;
    var filter = kozu.filter = _.filter;
    var reduce = kozu.reduce = _.reduce;
    var toArray = kozu.toArray = _.toArray;
    var isArray =  kozu.isArray = _.isArray;
    var isArguments = kozu.isArguments = _.isArguments;

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
      if (isArguments(items)) { items = slice(items); }
      if (isArray(items)) {
        return any(items, isPromise) ? Promise.all(items) : items;
      } else {
        return items;
      }
    }
    kozu.all = all;

    function cons(head, tail) {
      return [head].concat(toArray(tail));
    }
    kozu.cons = cons;

    // function agnosticApply(func, ctx, args) {
    //   return whenever(all([func, ctx].concat(args)), function(values) {
    //     var func = values[0], ctx = values[1], 
    //   });
    // }


    function transformInputs(ctx, args, func) {
      return func([ctx, func(args)]);
    }
    // transformInputs(this, arguments, all);
    // transformInputs(this, arguments, compose(partial(mapWith, all), all));
    // // map(all([ctx, map(all(args), all)]), all)
    // transformInputs(this, arguments, compose(all, partial(mapWith, all)));
    // // map([ctx, map(args, all)], all)

    function agnostic(func) {
      return (function() {
        return whenever(transformInputs(this, arguments, all), function(ctxAndArgs) {
          return func.apply(ctxAndArgs[0], ctxAndArgs[1]);
        });
      });
    }
    kozu.agnostic = agnostic;

    function deepAll(items) {
      return all(map(items, all));
    }

    function collectionAgnostic(func) {
      return (function() {
        return whenever(transformInputs(this, arguments, deepAll), function(ctxAndArgs) {
          return func.apply(ctxAndArgs[0], ctxAndArgs[1]);
        });
      });
    }
    kozu.collectionAgnostic = collectionAgnostic;

    var agnosticApply = agnostic(apply);

    function higherOrderAgnostic(func) {
      if (isFunction(func)) {
        return agnostic(function() {
          return agnosticApply(func, this, map(arguments, higherOrderAgnostic));
        });
      } else {
        return func;
      }
    }
    kozu.higherOrderAgnostic = higherOrderAgnostic;

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
  // agnosticUnderscore = mapValues(_, agnostic)
  // var myLib = mapValues(kozu.simple, myWrapper);
  // var myComplexLib = mapValues(kozu.simple, compose(middleware1, middleware2));
  root.kozu = buildKozu();
})(this);
