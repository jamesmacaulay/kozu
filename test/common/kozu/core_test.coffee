expect = require("chai").expect
core = require("../../../../../lib/kozu/core")
_ = require("lodash")

plus1 = (n) -> n+1
times2 = (n) -> n*2
exclaim = (x) -> "#{x}!"

describe "kozu.core.functionalize", ->
  it "takes a function and returns a function", ->
    expect(core.functionalize(->)).to.be.a('function')
  it "takes a method-style function (one which uses `this`) and returns a function which wraps it by rotating `this` into the argument list", ->
    person =
      name: "Jim"
      nameWithSuffix: (suffix) -> @name + suffix
    nameWithSuffixFunction = core.functionalize(person.nameWithSuffix)
    expect(nameWithSuffixFunction(person, "!")).to.equal("Jim!")

describe "kozu.core.compose", ->
  it "calls from right to left", ->
    times2plus1 = core.compose(plus1, times2)
    expect(times2plus1(3)).to.equal(7)

describe "kozu.core.partialRest(func, args...)", ->
  it "partial application of func with args as the rest of the args after the first", ->
    mathy = core.partialRest(core.compose, plus1, times2)
    expect(mathy(exclaim) 3).to.equal("7!")

describe "kozu.core.arrayTransformer(functions)", ->
  it "returns a function which takes an array and maps its items with corresponding functions", ->
    tmpl = core.arrayTransformer([plus1, times2, exclaim])
    expect(tmpl([1, 2, 3])).to.deep.equal([2, 4, "3!"])