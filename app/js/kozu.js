(function(root){
  var pSlice = Array.prototype.slice;

  function buildKozu(opts) {
    var kozu = {};

    // =====================
    // generic utility functions
    // =====================

    var functionalize = kozu.functionalize = function functionalize(method) {
      return function(ctx /*, args */) {
        return method.apply(ctx, pSlice.call(arguments, 1));
      };
    };

    var call = kozu.call = functionalize(Function.prototype.call);

    var apply = kozu.apply = functionalize(Function.prototype.apply);

    var slice = kozu.slice = functionalize(pSlice);

    var isFunction = kozu.isFunction = function isFunction(x) {
      return typeof x === 'function';
    };

    var mapper = kozu.mapper = function mapper(func) {
      return (function mapResult(items) {
        return _.map(items, func);
      });
    };
    // ======================


    // "has a .then method"
    var isThenable = kozu.isThenable = function isThenable(x) {
      return x != null && kozu.isFunction(x.then);
    };
    var isPromise = kozu.isPromise = isThenable;

    var whenever = kozu.whenever = function whenever(valueOrPromise, onResolve, onReject) {
      if (isPromise(valueOrPromise)) {
        return valueOrPromise.then(onResolve, onReject);
      } else {
        try {
          return onResolve(valueOrPromise);
        } catch(e) {
          return Promise.reject(e).catch(onReject);
        }
      }
    };

    var catching = kozu.catching = function catching(valueOrPromise, onReject) {
      if (isPromise(valueOrPromise)) {
        return valueOrPromise.catch(onReject);
      } else {
        return valueOrPromise;
      }
    };

    var all = kozu.all = function all(items) {
      if (_.isArguments(items)) { items = slice(items); }
      if (_.isArray(items) && _.any(items, isPromise)) {
        return Promise.all(items);
      } else {
        return items;
      }
    };

    var allValues = kozu.allValues = (function allValues(object) {
      var values = _.values(object);
      if (_.any(values, isPromise)) {
        return whenever(Promise.all(values), function(settledValues) {
          return _.object(_.keys(object), settledValues);
        });
      } else {
        return _.clone(object);
      }
    });

    function transformInputs(ctx, args, func) {
      return func([ctx, func(args)]);
    }

    function inputTransformer(func) {
      return function() {
        var thisAndArgs = transformInputs(this, arguments);
        return func.apply(thisAndArgs[0], thisAndArgs[1]);
      };
    }

    function handlingWheneverWith(onResolve, onReject) {
      return (function(valueOrPromise) {
        return whenever(valueOrPromise, onResolve, onReject);
      });
    }

    function applySplat(func, thisAndArgs) {
      return func.apply(thisAndArgs[0], thisAndArgs[1]);
    }

    function packingInputs(func) {
      return (function() {
        return func([this, arguments]);
      });
    }

    function unpackingInputs(func) {
      return (function(thisAndArgs) {
        return func.apply(thisAndArgs[0], thisAndArgs[1]);
      });
    }

    function buildAgnosticHOF(inputTransformer) {
      return (function (func) {
        if (!isFunction(func)) {return func;}
        return (function() {
          var inputs = transformInputs(this, arguments, inputTransformer);
          var inputsHandler = unpackingInputs(func);
          return whenever(inputs, inputsHandler);
        });
      });
    }

    // function buildAgnosticHOF(inputTransformer) {
    //   return (function (func) {
    //     if (!isFunction(func)) {return func;}
    //     return (function() {
    //       return whenever(transformInputs(this, arguments, inputTransformer), function(thisAndArgs) {
    //         return func.apply(thisAndArgs[0], thisAndArgs[1]);
    //       });
    //     });
    //   });
    // }

    function buildHOF(inputTransformer) {
      return (function (func) {
        if (!isFunction(func)) {return func;}
        return (function() {
          return whenever(transformInputs(this, arguments, inputTransformer), function(thisAndArgs) {
            return func.apply(thisAndArgs[0], thisAndArgs[1]);
          });
        });
      });
    }

    var agnostic = kozu.agnostic = buildAgnosticHOF(all);
    kozu.collectionAgnostic = buildAgnosticHOF(
      _.compose(all, mapper(all))
    );
    kozu.objectAgnostic = buildAgnosticHOF(
      _.compose(all, mapper(allValues))
    );
    kozu.functionWrappingAgnostic = buildAgnosticHOF(
      _.compose(all, mapper(agnostic))
    );
    kozu.functionWrappingCollectionAgnostic = buildAgnosticHOF(
      _.compose(all, mapper(_.compose(agnostic, all)))
    );

    var agnosticApply = agnostic(apply);



    var transformer = kozu.transformer = agnostic(function transformer(templateObject) {
      return (function(inputObject) {
        var result = {};
        for (var key in templateObject) {
          result[key] = templateObject[key](inputObject);
        }
        return result;
      });
    });


    // function collectionAgnostic(func) {
    //   return (function() {
    //     return whenever(transformInputs(this, arguments, allNested1), function(thisAndArgs) {
    //       return func.apply(thisAndArgs[0], thisAndArgs[1]);
    //     });
    //   });
    // }
    // kozu.collectionAgnostic = collectionAgnostic;


    // function higherOrderAgnostic(func) {
    //   if (isFunction(func)) {
    //     return agnostic(function() {
    //       return agnosticApply(func, this, _.map(arguments, higherOrderAgnostic));
    //     });
    //   } else {
    //     return func;
    //   }
    // }
    // kozu.higherOrderAgnostic = higherOrderAgnostic;

    // what would a generalized deep* function look like?
    function deepAgnostic(func) {
      if (isFunction(func)) {
        return (function() {
          // this isn't quite right:
          // return agnosticApply(func, this, _.map(arguments, deepAgnostic));
        });
      } else {
        return func;
      }
    }
    kozu.deepAgnostic = deepAgnostic;

    return kozu;
  }

  root.kozu = buildKozu();
})(this);
