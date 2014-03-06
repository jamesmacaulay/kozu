"use strict";

var cells = module.exports;

var Bacon = require("baconjs");
var _ = require("lodash");
var $ = require("jquery");

var c = require("./core");
var t = require("./transformers");
var p = require("./promises");


var Cell = ((function(){
  /*jshint -W087 */
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
    var stream = this.stream = streamWithResolvedPromises.skipDuplicates().withHandler(function(event) {
      if (event.isNext()) {
        currentValue = event.value();
      }
      return this.push(event);
    });
    var property = this.property = stream.toProperty();
    var waiting = this.waiting = rawValues.awaiting(streamWithResolvedPromises);
    
    function unplugSources() {
      if (unpluggers) {
        _.each(unpluggers, c.call);
        unpluggers = null;
      }
    }

    function setSources(newSources) {
      unplugSources();
      unpluggers = _.map(newSources, function(sourceCell) {
        return sourceChanges.plug(sourceCell.stream.log());
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
      getter = tracking(func);
      this.refresh();
    };

    this.refresh = function refresh() {
      unplugSources();
      if (!assigned) {
        sourceChanges.push();
      }
    };

    this.bind = function bind(selector, event, method) {
      var nodes = $(selector);
      var nodeChanges = nodes.asEventStream(event, function(event) {
        assigned = true;
        return $(event.target)[method]();
      }).log();
      assignments.plug(nodeChanges);
      property.assign(nodes, method);
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
cells.Cell = Cell;

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

