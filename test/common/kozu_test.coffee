chai = require("chai")
chai.use(require("chai-as-promised"))
expect = chai.expect
Promise = require('es6-promise').Promise

require("./kozu/core_test")
require("./kozu/behaviors_test")
require("./kozu/promises_test")

kozu = require("../../../../lib/kozu")

plus1 = (n) -> n+1

describe "kozu.joiner(separator)", ->
  it "returns a function which joins an array with the given string", ->
    expect(kozu.joiner("-")(["foo", "bar"])).to.equal("foo-bar")

describe "kozu.argumentMapper(func)", ->
  it "returns a function which maps func onto its arguments", ->
    expect(kozu.argumentMapper(plus1)(1,2,3)).to.deep.equal([2,3,4])

describe "kozu.argumentJoiner(separator)", ->
  it "returns a function which joins its arguments with the given string", ->
    expect(kozu.argumentJoiner("-")("foo", "bar")).to.equal("foo-bar")