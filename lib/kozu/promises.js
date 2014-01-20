/*jshint eqnull:true */
var promises = exports;
var core = require('./core');

function isThenable(x) {
  return x != null && typeof x.then === 'function';
}

var isPromise = isThenable;

function whenever(x, onResolve, onReject) {
  if (isPromise(x)) {
    return x.then(onResolve, onReject);
  } else {
    try {
      return onResolve(x);
    } catch(e) {
      return Promise.reject(e).catch(onReject);
    }
  }
}

promises.isThenable = isThenable;
promises.isPromise = isPromise;
promises.whenever = whenever;
