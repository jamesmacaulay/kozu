"use strict";

var promises = exports;
var core = require('./core');
var transformers = require('./transformers');

function isThenable(x) {
  /*jshint eqnull:true */
  return x != null && typeof x.then === 'function';
}

function when(x, onResolve, onReject) {
  return Promise.resolve(x).then(onResolve, onReject);
}

function whenever(x, onResolve, onReject) {
  if (isThenable(x)) {
    return Promise.resolve(x).then(onResolve, onReject);
  } else {
    try {
      return onResolve(x);
    } catch(e) {
      return Promise.reject(e).catch(onReject);
    }
  }
}

promises.wait = function wait(delay, value) {
  return new Promise(function(fulfill) {
    setTimeout(core.partial(fulfill, value), delay);
  });
};

promises.errorTimeout = function errorTimeout(delay, msg) {
  return new Promise(function(_, reject) {
    setTimeout(core.partial(reject, new Error(msg || "Timed out")), delay);
  });
};

promises.timeoutAfter = function timeoutAfter(delay, promise) {
  return Promise.race([promise, promises.errorTimeout(delay)]);
};

function allArrayItems(items) {
  if (isThenable(items)) { return Promise.resolve(items); }
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
  if (isThenable(object)) { return Promise.resolve(object); }
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


promises.executesWhenever = function executesWhenever(func) {
  return function executingWhenever(x) {
    return promises.whenever(x, func);
  };
};

function buildAgnosticWrapper(inputsTransformer) {
  var transformer = function transformer(inputs) {
    return allArrayItems(inputsTransformer(inputs));
  };
  if (inputsTransformer) {
    inputsTransformer = promises.executesWhenever(inputsTransformer);
  } else {
    transformer = allArrayItems;
  }
  function transformsArgument(func) {
    return function transformingArgument(x) {
      return func(transformer(x));
    };
  }
  return function agnosticWrapper(func) {
    return core.gathersThisAndArguments(
      transformsArgument(
        promises.executesWhenever(
          core.spreadsThisAndArguments(func))));
  };
}

function buildAgnosticArgumentMapper(func) {
  return buildAgnosticWrapper(core.mapper(func));
}

function buildAgnosticInputTransformer(arrayTemplate) {
  return buildAgnosticWrapper(transformers.arrayTransformer(arrayTemplate));
}

function ifFunctionThenAgnosticElseIdentity(x) {
  if (core.isFunction(x)) {
    return promises.shallowAgnostic(x);
  } else {
    return x;
  }
}

function aggressivelyAgnosticInputTransformer(x) {
  if (core.isFunction(x)) {
    return promises.agnostic(x);
  } else if (promises.isThenable(x)) {
    return Promise.resolve(x).then(aggressivelyAgnosticInputTransformer);
  } else if (core.isArray(x) || core.isArguments(x)) {
    return allArrayItems(x);
  } else if (core.isObject(x)) {
    return allObjectValues(x);
  } else {
    return x;
  }
}

promises.agnostic = buildAgnosticWrapper(function(inputs) {
  return core.map(inputs, aggressivelyAgnosticInputTransformer);
});

promises.shallowAgnostic = buildAgnosticWrapper();
promises.higherOrderAgnostic = buildAgnosticArgumentMapper(ifFunctionThenAgnosticElseIdentity);
promises.iteratorAgnostic = buildAgnosticArgumentMapper(all);
promises.firstArgumentIteratorAgnostic = buildAgnosticInputTransformer([null, all]);
promises.firstArgumentObjectAgnostic = buildAgnosticInputTransformer([null, allObjectValues]);

promises.isThenable = isThenable;
promises.whenever = whenever;
promises.allArrayItems = allArrayItems;
promises.allObjectValues = allObjectValues;
promises.callWhenever = promises.shallowAgnostic(core.call);

promises.promiseExtender = function promiseExtender(prototype) {
  var methods = core.mapObjectValues(
    core.pick(prototype, core.isFunction),
    promises.agnostic
  );
  return function extendsPromise(promise) {
    return core.EXTEND(promise, methods);
  };
};
