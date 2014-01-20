chai = require("chai")
chai.use(require("chai-as-promised"))
expect = chai.expect
Promise = require('es6-promise').Promise

require("./kozu/core_test")
require("./kozu/promises_test")
