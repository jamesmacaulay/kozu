expect = require("chai").expect
core = require("../../../../../lib/kozu/core")
behaviors = require("../../../../../lib/kozu/behaviors")

plus1 = (n) -> n+1
times2 = (n) -> n*2

describe "kozu.behaviors.extractsKeys(... keys)", ->
  it "returns a function wrapper which takes a variadic function and returns a function which takes an object and uses the values at the given keys as the arguments for the original", ->
    fooPlusBar = behaviors.extractsKeys('foo', 'bar')((foo, bar) -> foo + bar)
    expect(fooPlusBar({foo: 1, bar: 2, baz: 3})).to.equal(3)

describe "kozu.behaviors.functionalize", ->
  it "wraps a method-style function (one which uses `this`) such that it only uses arguments", ->
    person =
      name: "Jim"
      nameWithSuffix: (suffix) -> @name + suffix
    personNameWithSuffix = behaviors.functionalize(person.nameWithSuffix)
    expect(personNameWithSuffix(person, "!")).to.equal("Jim!")
  it "is aliased as rotatesThisOutOfArguments", ->
    expect(behaviors.rotatesThisOutOfArguments).to.equal(behaviors.functionalize)

describe "kozu.behaviors.methodize", ->
  it "wraps a function which does not rely on `this`, turning it into a method-style function such that the original's first argument is supplied as `this` by the caller", ->
    personNameWithSuffix = (person, suffix) -> person.name + suffix
    person =
      name: "Jim"
      nameWithSuffix: behaviors.methodize(personNameWithSuffix)
    expect(person.nameWithSuffix("!")).to.equal("Jim!")
  it "is aliased as rotatesThisIntoArguments", ->
    expect(behaviors.rotatesThisIntoArguments).to.equal(behaviors.methodize)

describe "kozu.behaviors.congealed", ->
  it "takes a variadic function and returns a unary version which spreads a single array argument to the original", ->
    arrayToArgs = behaviors.congealed(core.args)
    expect(arrayToArgs([1,2,3])).to.deep.equal(core.args(1,2,3))
  it "is aliased as spreadsArrayArgument", ->
    expect(behaviors.spreadsArrayArgument).to.equal(behaviors.congealed)

describe "kozu.behaviors.variadic", ->
  it "takes a function which takes a single array argument and returns a variadic version which passes a slice of its arguments as a single argument to the original", ->
    makeArray = behaviors.variadic(core.identity)
    expect(makeArray(1,2,3)).to.deep.equal([1,2,3])
  it "is aliased as gathersArguments", ->
    expect(behaviors.gathersArguments).to.equal(behaviors.variadic)

describe "kozu.behaviors.flip2", ->
  it "takes a function of 2 arguments and returns a new version of the function with its arguments flipped", ->
    divide = (a, b) -> a / b
    expect(behaviors.flip2(divide)(2, 4)).to.equal(2)

describe "kozu.behaviors.mergesReturnValueOntoArgument(func)", ->
  it "wraps func such that the return value is `merge`d onto the first argument before being returned", ->
    f = behaviors.mergesReturnValueOntoArgument(-> {ctx: this, args: core.castArgumentsAsArray(arguments), return: "return"})
    expect(f.call({a: 1}, {b: 2, foo: "bar"}, {c: 3})).to.deep.equal
      b: 2
      foo: "bar"
      ctx: {a: 1}
      args: [{b: 2, foo: "bar"}, {c: 3}]
      return: "return"

describe "kozu.behaviors.gathersThisAndArguments", ->
  it "wraps a function such that the new version gathers its many inputs into a single array of [this, ... arguments] which is passed to the wrapped function", ->
    result = behaviors.gathersThisAndArguments(core.identity).call({a: 1}, 1, 2, 3)
    expect(result).to.deep.equal [{a: 1}, 1, 2, 3]

describe "kozu.behaviors.spreadsThisAndArguments", ->
  it "wraps a function such that the new version spreads its single array argument of [this, ... arguments] into `this` and `arguments` for the wrapped function", ->
    result = behaviors.spreadsThisAndArguments(-> [this, arguments])([{a: 1}, 1, 2, 3])
    expect(result).to.deep.equal([{a: 1}, core.args(1, 2, 3)])

describe "kozu.behaviors.transformsArgumentWith(func)", ->
  it "returns a function wrapper which transforms the wrapped function's argument with func", ->
    plus1wrapper = behaviors.transformsArgumentWith(plus1)
    expect(plus1wrapper(times2)(5)).to.equal(12)

describe "kozu.behaviors.transformsReturnValueWith(func)", ->
  it "returns a function wrapper which transforms the wrapped function's return value with func", ->
    plus1wrapper = behaviors.transformsReturnValueWith(plus1)
    expect(plus1wrapper(times2)(5)).to.equal(11)
