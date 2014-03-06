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

console.log(
  '=\n'+
  'var user = this.get("A1");\n'+
  'if (user) {\n'+
  '  var data = $.get("https://api.github.com/users/"+user+"/gists");\n'+
  '  return data.then(function(items) {\n'+
  '    return _.pluck(items, "html_url").join("\\n");\n'+
  '  });\n'+
  '}\n'
);

$(function(){
  sheet.cells.A1.bind($(".A1"), "change", "val");
  sheet.cells.A2_definition.bind($('.A2_definition'), "change", "val");
  sheet.cells.A2.stream.assign($(".A2"), "text");
  sheet.cells.A2.waiting.filter(_.identity).assign($(".A2_waiting"), "html", '<img src="ajax-loader.gif" />');
  sheet.cells.A2.waiting.filter(function(x) {return !x;}).assign($(".A2_waiting"), "html", '');

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

