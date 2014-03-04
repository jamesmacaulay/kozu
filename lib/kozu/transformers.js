"use strict";

var c = require("./core");

// These are factory functions which return "transformer" and "template" functions.
// The argument to a transformer or template factory is a "definition" in the form
// of either an array of functions or an object with function values.
// 
// The returned transformers and templates each take a single data structure of the
// same type as the definition. The values of that array/object argument
// are individually transformed by the functions found at the corresponding
// indexes/keys of the definition, and a new value of the same type is returned with
// the results in right places.
// 
// "Transformers" return a structure that has all the same keys/indexes as the
// passed argument. Any properties in the transformer's argument that are not found
// in the factory definition are passed straight through to the returned array/object.
// If a property does not appear in the transformer argument then it will not appear
// in the return value.
// 
// Meanwhile, "templates" favour the factory definition and use its indexes/keys
// in the return value. Any corresponding values missing in the template's argument
// are left undefined and passed to whichever function lives at the corresponding
// index/key.
var t = module.exports;

t.arrayTransformer = function arrayTransformer(definition) {
  return function(array) {
    return c.map(array, function(item, i) {
      /* jshint -W116 */
      var func = definition[i];
      return (func == null) ? item : func(item);
    });
  };
};

t.transformsArgumentsWithSchema =
function transformsArgumentsWithSchema(definition) {
  var transformer = t.arrayTransformer(definition);
  return c.compose(
    c.gathersArguments,
    c.transformsArgumentWith(t.arrayTransformer(definition)),
    c.spreadsArguments
  );
};

t.objectTemplate = function objectTemplate(definition) {
  return function(object) {
    return c.mapObjectValues(definition, function(func) {
      return (c.isFunction(func) ? func(object) : func);
    });
  };
};

t.objectPropertyTemplate = function objectPropertyTemplate(definition) {
  return t.objectTemplate(c.mapObjectValues(definition, function(func, key) {
    return c.isFunction(func) ? c.extractsKeys(key)(func) : func;
  }));
};


t.middleware = c.transformsReturnValueWith(
  c.mergesReturnValueOntoArgument
)(t.objectPropertyTemplate);
