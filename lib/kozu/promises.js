var promises = exports;
var core = require('./core');

function isThenable(x) {
  /*jshint eqnull:true */
  return x != null && typeof x.then === 'function';
}

function whenever(x, onResolve, onReject) {
  if (isThenable(x)) {
    return x.then(onResolve, onReject);
  } else {
    try {
      return onResolve(x);
    } catch(e) {
      return Promise.reject(e).catch(onReject);
    }
  }
}

function allArrayItems(items) {
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


var calledWhenever = core.partial(core.partialRest, whenever);

function buildAgnosticWrapper(/* inputTransformers... */) {
  var waitsForInputs = core.composedOn.apply(null, core.cons(allArrayItems, arguments));
  return core.compose(
    core.gathersInputs,
    waitsForInputs,
    calledWhenever,
    core.spreadsInputs
  );
}

var buildAgnosticArgumentMapper = core.compose(
  buildAgnosticWrapper,
  core.mapper
);

var buildAgnosticArgumentTransformer = core.compose(
  buildAgnosticWrapper,
  core.arrayTransformer,
  core.variadic(core.partial(core.cons, null))
);

function ifFunctionThenAgnosticElseIdentity(x) {
  if (core.isFunction(x)) {
    return promises.shallowAgnostic(x);
  } else {
    return x;
  }
}

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
var specialAgnosticFunctionsTemplate = core.objectPropertyTemplate({
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
    core.wrapReturnedValue(promises.firstArgumentObjectAgnostic)
  )
});

promises.agnostic = core.merge(
  core.mapObjectValues(core, promises.shallowAgnostic),
  specialAgnosticFunctionsTemplate(core)
);

promises.isThenable = isThenable;
promises.whenever = whenever;
promises.allArrayItems = allArrayItems;
promises.allObjectValues = allObjectValues;
