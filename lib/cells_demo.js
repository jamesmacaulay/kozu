/*jshint -W087 */
var $ = global.$ = global.jQuery = require("jquery");
var Bacon = global.Bacon = require("baconjs");
var _ = global._ = require("lodash");

var kozu = global.kozu = require("./kozu");
var Cell = global.Cell = require("./kozu/cells").Cell;

var sheet = {
  cells: {
    "A1": new Cell(),
    "A2_definition": new Cell(),
    "A2": new Cell()
  },
  get: function get(key) {
    return this.cells[key].value();
  }
};

var gistView = _.template('<ul>'+
  '<% _.each(gists, function(gist) { %>'+
  '<li><a href="<%- gist.html_url %>"><%- gist.description || gist.html_url %></a></li>'+
  '<% }) %>'+
  '</ul>');

$(function(){
  sheet.cells.A1.bind($(".A1"), "change", "val");
  sheet.cells.A2_definition.bind($('.A2_definition'), "change", "val");
  sheet.cells.A2.stream.assign($(".A2"), "text");
  sheet.cells.A2.waiting.filter(_.identity).assign($(".A2_waiting"), "html", '<img src="ajax-loader.gif" />');

  sheet.cells.A1.reset("");
  sheet.cells.A2_definition.reset("");
  sheet.cells.A2.live(function(cell) {
    /*jshint -W054 */
    var def = ""+sheet.get("A2_definition");
    if (def[0] === "=") {
      var func = new Function(def.substring(1));
      return func.call(sheet);
    } else {
      return def;
    }
  });
});

var demo = module.exports;
demo.sheet = sheet;

