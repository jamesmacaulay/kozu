var core = require("./core");
var behaviors = require("./behaviors");

// A "transformer" is a function which 
var transformers = exports;

transformers.arrayTransformer = function arrayTransformer(functionSchemaArray) {
  return function(array) {
    return core.map(array, function(item, i) {
      /* jshint -W116 */
      var schemaElement = functionSchemaArray[i];
      return (schemaElement == null) ? item : schemaElement(item);
    });
  };
};

transformers.objectTemplate = function objectTemplate(functionSchemaObject) {
  return function(object) {
    return core.mapObjectValues(functionSchemaObject, function(schemaValue) {
      return (core.isFunction(schemaValue) ? schemaValue(object) : schemaValue);
    });
  };
};

transformers.objectPropertyTemplate = function objectPropertyTemplate(functionSchemaObject) {
  return transformers.objectTemplate(core.mapObjectValues(functionSchemaObject, function(schemaValue, key) {
    return core.isFunction(schemaValue) ? behaviors.extractsKeys(key)(schemaValue) : schemaValue;
  }));
};
