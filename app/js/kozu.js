(function(root){
  var slice = Array.prototype.slice;

  function isFunction(x) {
    return typeof x === 'function';
  }

  function isThenable(x) {
    return x != null && isFunction(x.then);
  }

  function promise(resolver) {
    new Promise(resolver);
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

  function buildKozu(deps) {
    var isPromise = (deps && deps.isPromise) || isThenable;

    function whenever(value, func) {
      return isPromise(value) ?
        value.then(func) :
        func(value);
    }

    function applyWhenever(func, ctx, args) {
      return func.apply(ctx, args);
    }

    function map(items, func) {
      var i, len, results, item, promise, promises, promiseIndexes;
      len = items.length;
      results = new Array(len);
      promises = [];
      promiseIndexes = [];
      for (i=0; i<len; i++) {
        item = items[i];
        if (isPromise(item)) {
          promise = item.then(func);
          results[i] = promise;
          promises.push(promise);
          promiseIndexes.push(i);
        } else {
          results[i] = func(item);
        }
      }
      len = promises.length;
      if (len) {
        return Promise.all(promises).then(function(promiseResults) {
          for (i=0; i<len; i++) {
            results[promiseIndexes[i]] = promiseResults[i];
          }
          return results;
        });
      } else {
        return results;
      }
    }

    return({
      whenever: whenever,
      map: map,
      applyWhenever: applyWhenever,
      buildKozu: buildKozu
    });
  }


  root.kozu = buildKozu();
})(this);
