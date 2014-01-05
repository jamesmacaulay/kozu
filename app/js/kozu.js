(function(root){
  var slice = Array.prototype.slice;

  function isFunction(x) {
    return typeof x === 'function';
  }

  function isThenable(x) {
    return x != null && isFunction(x.then);
  }

  function promise(resolver) {
    return new Promise(resolver);
  }

  // // returns f(g(args...)), preserving `this`
  // function compose2LR(g, f) {
  //   return (function() {
  //     return f.call(this, g.apply(this, arguments));
  //   });
  // }

  // function compose() {
  //   return reduce(compose2LR, arguments);
  // }

  function identity(x) { return x; }

  function any(items, func) {
    var i = items.length;
    while (i--) { if (func(items[i])) { return true; } }
    return false;
  }

  function buildKozu(deps) {
    var isPromise = (deps && deps.isPromise) || isThenable;

    function whenever(value, func) {
      if (isPromise(value) || isPromise(func)) {
        return Promise.all([value, func]).then(function(args) {
          return args[0].then(args[1]);
        });
      } else {
        return func(value);
      }
    }

    function applyAgnostic(func, ctx, args) {
      var i;
      if (isPromise(func) || isPromise(ctx) || any(args, isPromise)) {
        return Promise.all([func, ctx, Promise.all(slice.call(args))]);
      } else {
        return func.apply(ctx, args);
      }
    }

    function agnostic(func) {
      return (function() {
        return applyAgnostic(func, this, arguments);
      });
    }

    function deepAgnostic(func) {
      if (isFunction(func)) {
        return (function() {
          return applyAgnostic(func, this, _.map(arguments, deepAgnostic));
        });
      } else {
        return func;
      }
    }

    var map = deepAgnostic(_.map);

    // function map(items, func) {
    //   return whenever(func, function(func) {
    //     var i, len, results, item, promise, hasPromises;
    //     len = items.length;
    //     results = new Array(len);
    //     for (i=0; i<len; i++) {
    //       item = items[i];
    //       if (isPromise(item)) {
    //         hasPromises = true;
    //         results[i] = item.then(func);
    //       } else {
    //         results[i] = func(item);
    //       }
    //     }
    //     return hasPromises ? Promise.all(results) : results;
    //   });
    // }

    return({
      whenever: whenever,
      map: map,
      applyWhenever: applyAgnostic,
      buildKozu: buildKozu
    });
  }


  root.kozu = buildKozu();
})(this);
