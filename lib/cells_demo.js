var $ = global.$ = global.jQuery = require("jquery");
var Bacon = global.Bacon = require("baconjs");
var _ = global._ = require("lodash");

var kozu = global.kozu = require("./kozu");
var Cell = global.Cell = require("./kozu/cells").Cell;


var username = Cell.withValue("");

var gists = Cell.computed(function() {
  var user = username.value();
  if (user) {
    return $.get("https://api.github.com/users/"+user+"/gists");
  }
});

var gistView = _.template('<ul>'+
  '<% _.each(gists, function(gist) { %>'+
  '<li><a href="<%- gist.html_url %>"><%- gist.description || gist.html_url %></a></li>'+
  '<% }) %>'+
  '</ul>');

$(function(){
  username.bind($(".username"), "change", "val");
  gists.stream.map(function(gists){
    return gistView({gists: gists});
  }).assign($(".gists"), "html");
  gists.waiting.filter(_.identity).assign($(".gists"), "html", '<img src="ajax-loader.gif" />');
});

var demo = module.exports;
demo.username = username;
demo.gists = gists;

