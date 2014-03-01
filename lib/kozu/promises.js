var promises = exports;
var core = require('./core');
var transformers = require('./transformers');

function isThenable(x) {
  /*jshint eqnull:true */
  return x != null && typeof x.then === 'function';
}

function then(promise, onResolve, onReject) {
  return Promise.cast(promise).then(onResolve, onReject);
}

function whenever(x, onResolve, onReject) {
  if (isThenable(x)) {
    return Promise.cast(x).then(onResolve, onReject);
  } else {
    try {
      return onResolve(x);
    } catch(e) {
      return Promise.reject(e).catch(onReject);
    }
  }
}

function allArrayItems(items) {
  if (isThenable(items)) { return Promise.cast(items); }
  var length = items.length;
  var result = new Array(length);
  if (length === 0) { return result; }
  var index = -1;
  var promiseCount = 0;
  var item, resultPromise, resolveResultPromise, rejectResultPromise;

  function makeResultPromise() {
    return new Promise(function(resolve, reject) {
      resolveResultPromise = resolve;
      rejectResultPromise = reject;
    });
  }

  function itemResolver(index) {
    return function(value) {
      promiseCount--;
      result[index] = value;
      if (promiseCount === 0) {
        resolveResultPromise(result);
      }
    };
  }

  while (++index < length) {
    item = items[index];
    result[index] = item;
    if (isThenable(item)) {
      resultPromise = resultPromise || makeResultPromise();
      promiseCount++;
      item.then(itemResolver(index), rejectResultPromise);
    }
  }

  return resultPromise || result;
}

function allObjectValues(object) {
  if (isThenable(object)) { return Promise.cast(object); }
  var result = {};
  var promiseCount = 0;
  var key, item, resultPromise, resolveResultPromise, rejectResultPromise;

  function makeResultPromise() {
    return new Promise(function(resolve, reject) {
      resolveResultPromise = resolve;
      rejectResultPromise = reject;
    });
  }

  function itemResolver(key) {
    return function(value) {
      promiseCount--;
      result[key] = value;
      if (promiseCount === 0) {
        resolveResultPromise(result);
      }
    };
  }

  for (key in object) {
    item = object[key];
    result[key] = item;
    if (isThenable(item)) {
      resultPromise = resultPromise || makeResultPromise();
      promiseCount++;
      item.then(itemResolver(key), rejectResultPromise);
    }
  }

  return resultPromise || result;
}

function all(x) {
  if (core.isArray(x) || core.isArguments(x)) {
    return allArrayItems(x);
  } else {
    return allObjectValues(x);
  }
}


promises.executesWhenever = core.partial(core.partialRest, whenever);

function buildAgnosticWrapper(/* inputTransformers... */) {
  var transformer = core.composeArray(core.cons(allArrayItems, arguments).concat(allArrayItems));
  return core.compose(
    core.gathersThisAndArguments,
    core.transformsArgumentWith(transformer),
    promises.executesWhenever,
    core.spreadsThisAndArguments
  );
}

var buildAgnosticArgumentMapper = core.compose(
  buildAgnosticWrapper,
  core.mapper
);

var buildAgnosticArgumentTransformer = core.compose(
  buildAgnosticWrapper,
  transformers.arrayTransformer,
  core.variadic(core.partial(core.cons, null))
);

function ifFunctionThenAgnosticElseIdentity(x) {
  if (core.isFunction(x)) {
    return promises.shallowAgnostic(x);
  } else {
    return x;
  }
}

promises.recursiveHigherOrderAgnostic = buildAgnosticArgumentMapper(function(x) {
  if (core.isFunction(x)) {
    return promises.recursiveHigherOrderAgnostic(x);
  } else if (core.isArray(x) || core.isArguments(x)) {
    return allArrayItems(x);
  } else if (core.isObject(x)) {
    return allObjectValues(x);
  } else {
    return x;
  }
});

promises.shallowAgnostic = buildAgnosticWrapper();
promises.higherOrderAgnostic = buildAgnosticArgumentMapper(ifFunctionThenAgnosticElseIdentity);
promises.iteratorAgnostic = buildAgnosticArgumentMapper(all);
promises.firstArgumentIteratorAgnostic = buildAgnosticArgumentTransformer(all);
promises.firstArgumentObjectAgnostic = buildAgnosticArgumentTransformer(allObjectValues);


// It's powerful to use composition like this, but the code is too hard to
// follow. I might be able to do something useful with properties assigned to
// the functions as metadata which describe how the functions can be made
// promise-aware in a practical way. How can I express the flow of data more
// clearly?
var applySpecialWrappers = transformers.objectPropertyTemplate({
  compose: promises.higherOrderAgnostic,
  pipe: promises.higherOrderAgnostic,
  any: promises.firstArgumentIteratorAgnostic,
  map: promises.firstArgumentIteratorAgnostic,
  mapObjectValues: promises.firstArgumentObjectAgnostic,
  filter: promises.firstArgumentIteratorAgnostic,
  reduce: promises.firstArgumentIteratorAgnostic,
  each: promises.firstArgumentIteratorAgnostic,
  objectTemplate: core.compose(
    promises.firstArgumentObjectAgnostic,
    core.transformsReturnValueWith(promises.firstArgumentObjectAgnostic)
  )
});

promises.agnostic = applySpecialWrappers(core.merge(
  core.mapObjectValues(core, promises.shallowAgnostic),
  core.mapObjectValues(transformers, promises.shallowAgnostic)
));

promises.isThenable = isThenable;
promises.whenever = whenever;
promises.allArrayItems = allArrayItems;
promises.allObjectValues = allObjectValues;
promises.callWhenever = promises.shallowAgnostic(core.call);
