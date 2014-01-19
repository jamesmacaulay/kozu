chai = require("chai")
chai.use(require("chai-as-promised"))
expect = chai.expect
Promise = require('es6-promise').Promise

describe "Promise", ->
  it "should be present", ->
    expect(Promise.cast(1)).to.eventually.equal(1)
    false
