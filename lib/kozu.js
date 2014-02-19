var kozu = exports;

kozu.core = require("./kozu/core");
kozu.behaviors = require("./kozu/behaviors");
kozu.transformers = require("./kozu/transformers");
kozu.promises = require("./kozu/promises");

kozu.core.EXTEND(kozu,
  kozu.core,
  kozu.behaviors,
  kozu.transformers,
  kozu.promises
);

kozu.call = kozu.functionalize(Function.prototype.call);
kozu.apply = kozu.functionalize(Function.prototype.apply);
kozu.slice = kozu.functionalize(Array.prototype.slice);
kozu.join = kozu.functionalize(Array.prototype.join);

kozu.joiner = kozu.partial(kozu.partialRest, kozu.join);

kozu.composeArray = kozu.spreadsArrayArgument(kozu.compose);

kozu.argumentMapper = kozu.compose(kozu.gathersArguments, kozu.mapper);
kozu.argumentJoiner = kozu.compose(kozu.gathersArguments, kozu.joiner);
