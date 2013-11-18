(function(root){
  var slice = Array.prototype.slice;

  function isFunction(x) {
    return typeof x === 'function';
  }

  function isThenable(x) {
    return x != null && isFunction(x.then);
  }

  function process(context, state, nextState, isDone) {
    function handleLater(value) {
      return process(context, value, nextState, isDone);
    }
    while (!isDone(state)) {
      state = nextState(context, state);
      if (!isDone(state) && isThenable(state)) {
        return state.then(handleLater);
      }
    }
    return state;
  }

  function compose(/* [funcs] */) {
    var funcs = arguments,
        length = funcs.length;
    return function composition() {
      var i = length-1;
      function nextState(context, state) {
        if (i === length-1) {
          return funcs[i--].apply(context, state);
        } else {
          return funcs[i--].call(context, state);
        }
      }
      function isDone() {
        return i < 0;
      }
      return process(this, arguments, nextState, isDone);
    };
  }

  function pipe(input /*, funcs */) {
    var args = arguments,
        argLength = args.length;
        i = 1; // skip the input value
    function nextState(context, state) {
      return args[i++].call(context, state);
    }
    function isDone() {
      return i >= argLength;
    }
    return process(this, input, nextState, isDone);
  }

  function reduce(func, ary) {
    var i = 0
        length = ary.length;
    function nextState(context, state) {
      return func.call(context, state, ary[++i]);
    }
    function isDone() {
      return i >= length-1;
    }
    return process(this, ary[0], nextState, isDone)
  }

  root.Kozu = {
    compose: compose,
    pipe: pipe,
    reduce: reduce
  };
})(this);
