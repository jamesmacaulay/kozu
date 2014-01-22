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
  /*jshint validthis:true */
  if (!core.isArray(items) && !core.isArguments(items)) {
    throw new TypeError('You must pass an array or arguments object to all.');
  }

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
  /*jshint validthis:true */
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


// var calledWhenever = core.partial(core.partial, core.flip(whenever));
// var calledWithAllArrayItems = core.partial(core.flip(core.compose), allArrayItems);

function calledWhenever(func) {
  return core.partial(core.flip(whenever), func);
}

function calledWithAllArrayItems(func) {
  return core.compose(func, allArrayItems);
}

var agnostic = core.compose(
  core.disperse,
  calledWithAllArrayItems,
  calledWhenever,
  core.congeal
);

promises.isThenable = isThenable;
promises.whenever = whenever;
promises.allArrayItems = allArrayItems;
promises.allObjectValues = allObjectValues;
promises.agnostic = agnostic;
