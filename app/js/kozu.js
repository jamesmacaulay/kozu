(function(root){
  var slice = Array.prototype.slice;

  function isFunction(x) {
    return typeof x === 'function';
  }

  // "has a .then method"
  function isThenable(x) {
    return x != null && isFunction(x.then);
  }

  // build a promise
  function promise(resolver) {
    return new Promise(resolver);
  }

  function buildKozu(deps) {
    // default isPromise
    var isPromise = (deps && deps.isPromise) || isThenable;

    // ...
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
  root.kozu = kozu;
})(this);
