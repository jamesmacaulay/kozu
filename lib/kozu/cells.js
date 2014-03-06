"use strict";

var cells = module.exports;

var Bacon = global.Bacon = require("baconjs");
var _ = global._ = require("lodash");

var c = require("./core");
var t = require("./transformers");
var p = require("./promises");


var Cell = ((function(){
  var stack = [];
  function currentTracker() {
    if (stack.length) {
      return stack[stack.length-1];
    }
  }
  function registerSource(source) {
    var tracker = currentTracker();
    if (tracker && !c.contains(tracker, source)) {
      tracker.push(source);
    }
  }
  function pushTracker(tracker) {
    stack.push(tracker);
  }
  function newTracker() {
    var tracker = [];
    stack.push(tracker);
    return tracker;
  }
  function popCurrentTracker() {
    return stack.pop();
  }

  function Cell() {
    var currentValue, nextSources, unpluggers, getter, assigned;
    var cell = this;
    var assignments = new Bacon.Bus();
    var sourceChanges = new Bacon.Bus();
    var computed = sourceChanges.map(function(){
      return getter(cell);
    }).filter(function(){
      return !assigned;
    });
    var rawValues = assignments.filter(function(){
      return assigned;
    }).merge(computed);
    var streamWithResolvedPromises = rawValues.flatMap(function(x) {
      if (p.isThenable(x)) {
        return Bacon.fromPromise(x);
      } else {
        return x;
      }
    });
    streamWithResolvedPromises.onValue(function(x) {
      currentValue = x;
    });
    var stream = this.stream = streamWithResolvedPromises.skipDuplicates();
    var property = this.property = stream.toProperty();
    
    function unplugSources() {
      if (unpluggers) {
        _.each(unpluggers, c.call);
        unpluggers = null;
      }
    }

    function setSources(newSources) {
      unplugSources();
      unpluggers = _.map(newSources, function(sourceCell) {
        return sourceChanges.plug(sourceCell.stream);
      });
    }

    function tracking(func) {
      return function trackingSources() {
        var isFirstTrackingContext;
        if (nextSources) {
          pushTracker(nextSources);
        } else {
          isFirstTrackingContext = true;
          nextSources = newTracker();
        }

        var ret = func.apply(this, arguments);

        popCurrentTracker();

        p.whenever(ret, function() {
          if (isFirstTrackingContext) {
            setSources(nextSources);
            nextSources = null;
          }
        }, function(err) {
          nextSources = null;
          throw err;
        });

        return ret;
      };
    }
    this.tracking = tracking;

    this.value = function value() {
      registerSource(cell);
      return currentValue;
    };

    this.reset = function reset(newVal) {
      assigned = true;
      unplugSources();
      assignments.push(newVal);
    };

    this.live = function live(func) {
      assigned = false;
      unplugSources();
      getter = tracking(func);
      sourceChanges.push();
    };
  }
  Cell.withValue = function valueCell(value) {
    var cell = new Cell();
    cell.reset(value);
    return cell;
  };
  Cell.computed = function computedCell(func) {
    var cell = new Cell();
    cell.live(func);
    return cell;
  };
  return Cell;
}()));

/*

var c1 = Cell.withValue(0);
var c2 = Cell.computed(function() {
  return "c2: " + (c1.value() + 1);
});
var c3 = Cell.computed(function(cell) {
  return promises.timeout(1000, cell.tracking(function() {
    return "c3: " + (c1.value() + 2);
  }));
})
c2.property.onValue(console.log.bind(console));
c3.property.onValue(console.log.bind(console));

*/

