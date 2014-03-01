var core = require("./core");

// These functions return transformers. A "transformer" is a function which takes
// some data structure and returns one of the same type transformed in some way
// based on a schema.
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

transformers.transformsArgumentsWithSchema =
function transformsArgumentsWithSchema(functionSchemaArray) {
  var transformer = transformers.arrayTransformer(functionSchemaArray);
  return core.compose(
    core.gathersArguments,
    core.transformsArgumentWith(transformers.arrayTransformer(functionSchemaArray)),
    core.spreadsArguments
  );
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
    return core.isFunction(schemaValue) ? core.extractsKeys(key)(schemaValue) : schemaValue;
  }));
};
