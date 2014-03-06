var kozu = exports;

kozu.core = require("./kozu/core");
kozu.transformers = require("./kozu/transformers");
kozu.promises = require("./kozu/promises");
kozu.cells = require("./kozu/cells");

kozu.core.EXTEND(kozu,
  kozu.core,
  kozu.transformers,
  kozu.promises
);

global.kozu = kozu;
