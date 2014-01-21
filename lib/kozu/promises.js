var promises = exports;
var core = require('./core');
var _ = require('lodash');

function isThenable(x) {
  /*jshint eqnull:true */
  return x != null && typeof x.then === 'function';
}

var isArray = _.isArray;
var isArguments = _.isArguments;

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
  if (!isArray(items) && !isArguments(items)) {
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
      Promise.cast(item).then(itemResolver(index), rejectResultPromise);
    }
  }

  return resultPromise || result;
}

promises.isThenable = isThenable;
promises.whenever = whenever;
promises.allArrayItems = allArrayItems;
