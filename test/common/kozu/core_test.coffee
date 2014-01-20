expect = require("chai").expect
core = require("../../../../../lib/kozu/core")

describe "kozu.core.functionalize", ->
  it "takes a function and returns a function", ->
    expect(core.functionalize(->)).to.be.a('function')
  it "takes a method-style function (one which uses `this`) and returns a function which wraps it by rotating `this` into the argument list", ->
    person =
      name: "Jim"
      nameWithSuffix: (suffix) -> @name + suffix
    nameWithSuffixFunction = core.functionalize(person.nameWithSuffix)
    expect(nameWithSuffixFunction(person, "!")).to.equal("Jim!")
