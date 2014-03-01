expect = require("chai").expect
core = require("../../../../../lib/kozu/core")

plus1 = (n) -> n+1
times2 = (n) -> n*2
exclaim = (x) -> "#{x}!"

describe "kozu.core.compose", ->
  it "calls from right to left", ->
    times2plus1 = core.compose(plus1, times2)
    expect(times2plus1(3)).to.equal(7)

describe "kozu.core.partialRest(func, args...)", ->
  it "partial application of func with args as the rest of the args after the first", ->
    mathy = core.partialRest(core.compose, plus1, times2)
    expect(mathy(exclaim) 3).to.equal("7!")

describe "kozu.core.get(obj, key)", ->
  it "returns obj[key]", ->
    expect(core.get({foo: 2}, "foo")).to.equal(2)

describe "kozu.core.getter(key)", ->
  it "returns a function which takes an object and returns obj[key]", ->
    fooGetter = core.getter('foo')
    expect(fooGetter({foo: 2})).to.equal(2)

describe "kozu.core.args", ->
  it "returns its arguments object", ->
    expect(Object::toString.call(core.args(1,2,3))).to.equal("[object Arguments]")

describe "kozu.core.factory(constructor)", ->
  it "returns a variadic function which returns a new instance of the constructor with the given arguments", ->
    class Foo
      constructor: (@a, @b) ->
    fooFactory = core.factory(Foo)
    foo = fooFactory(1,2)
    expect(foo.a).to.equal(1)
    expect(foo.b).to.equal(2)
    expect(foo.constructor).to.equal(Foo)

describe "kozu.core.multiGet(obj, keys)", ->
  it "returns an array of the values in obj at keys", ->
    expect(core.multiGet({foo: 1, bar: 2, baz: 3}, ['bar', 'foo'])).to.deep.equal([2,1])

describe "kozu.core.castArgumentsAsArray(x)", ->
  it "returns a new array copy when x is an Arguments object", ->
    ary = core.castArgumentsAsArray(core.args(1,2,3))
    expect(ary).to.deep.equal([1,2,3])
    expect(core.isArray(ary)).to.equal(true)
  it "returns x when x is not an Arguments object", ->
    ary = [1,2,3]
    expect(core.castArgumentsAsArray(ary)).to.equal(ary)

describe "kozu.core.cons(x, xs)", ->
  it "returns a new array with x prepended before xs", ->
    expect(core.cons(1, [2, 3])).to.deep.equal([1,2,3])

describe "kozu.core.partialRest(func, ... args)", ->
  it "returns a partial application of func, starting from the second argument", ->
    makeArray = core.variadic(core.identity)
    somethingTwoThree = core.partialRest(makeArray, 2, 3)
    expect(somethingTwoThree(1)).to.deep.equal([1,2,3])

describe "kozu.core.merge(... objects)", ->
  it "returns a new object which merges the given objects, with the keys of later objects overwriting those of previous ones", ->
    a = {foo: 1, bar: 2}
    b = {bar: 3, baz: 4}
    c = {baz: 5, qux: 6}
    result = core.merge(a, b, c)
    expect(result).to.deep.equal({foo: 1, bar: 3, baz: 5, qux: 6})
    expect(result).to.not.equal(a)
    expect(result).to.not.equal(b)
    expect(result).to.not.equal(c)

describe "kozu.core.functionalize", ->
  it "wraps a method-style function (one which uses `this`) such that it only uses arguments", ->
    person =
      name: "Jim"
      nameWithSuffix: (suffix) -> @name + suffix
    personNameWithSuffix = core.functionalize(person.nameWithSuffix)
    expect(personNameWithSuffix(person, "!")).to.equal("Jim!")
  it "is aliased as rotatesThisOutOfArguments", ->
    expect(core.rotatesThisOutOfArguments).to.equal(core.functionalize)

describe "kozu.core.methodize", ->
  it "wraps a function which does not rely on `this`, turning it into a method-style function such that the original's first argument is supplied as `this` by the caller", ->
    personNameWithSuffix = (person, suffix) -> person.name + suffix
    person =
      name: "Jim"
      nameWithSuffix: core.methodize(personNameWithSuffix)
    expect(person.nameWithSuffix("!")).to.equal("Jim!")
  it "is aliased as rotatesThisIntoArguments", ->
    expect(core.rotatesThisIntoArguments).to.equal(core.methodize)

describe "kozu.core.congealed", ->
  it "takes a variadic function and returns a unary version which spreads a single array argument to the original", ->
    arrayToArgs = core.congealed(core.args)
    expect(arrayToArgs([1,2,3])).to.deep.equal(core.args(1,2,3))
  it "is aliased as spreadsArguments", ->
    expect(core.spreadsArguments).to.equal(core.congealed)

describe "kozu.core.variadic", ->
  it "takes a function which takes a single array argument and returns a variadic version which passes a slice of its arguments as a single argument to the original", ->
    makeArray = core.variadic(core.identity)
    expect(makeArray(1,2,3)).to.deep.equal([1,2,3])
  it "is aliased as gathersArguments", ->
    expect(core.gathersArguments).to.equal(core.variadic)

describe "kozu.core.flip2", ->
  it "takes a function of 2 arguments and returns a new version of the function with its arguments flipped", ->
    divide = (a, b) -> a / b
    expect(core.flip2(divide)(2, 4)).to.equal(2)

describe "kozu.core.mergesReturnValueOntoArgument(func)", ->
  it "wraps func such that the return value is `merge`d onto the first argument before being returned", ->
    f = core.mergesReturnValueOntoArgument(-> {ctx: this, args: core.castArgumentsAsArray(arguments), return: "return"})
    expect(f.call({a: 1}, {b: 2, foo: "bar"}, {c: 3})).to.deep.equal
      b: 2
      foo: "bar"
      ctx: {a: 1}
      args: [{b: 2, foo: "bar"}, {c: 3}]
      return: "return"

describe "kozu.core.gathersThisAndArguments", ->
  it "wraps a function such that the new version gathers its many inputs into a single array of [this, ... arguments] which is passed to the wrapped function", ->
    result = core.gathersThisAndArguments(core.identity).call({a: 1}, 1, 2, 3)
    expect(result).to.deep.equal [{a: 1}, 1, 2, 3]

describe "kozu.core.spreadsThisAndArguments", ->
  it "wraps a function such that the new version spreads its single array argument of [this, ... arguments] into `this` and `arguments` for the wrapped function", ->
    result = core.spreadsThisAndArguments(-> [this, arguments])([{a: 1}, 1, 2, 3])
    expect(result).to.deep.equal([{a: 1}, core.args(1, 2, 3)])

describe "kozu.core.extractsKeys(... keys)", ->
  it "returns a function wrapper which takes a variadic function and returns a function which takes an object and uses the values at the given keys as the arguments for the original", ->
    fooPlusBar = core.extractsKeys('foo', 'bar')((foo, bar) -> foo + bar)
    expect(fooPlusBar({foo: 1, bar: 2, baz: 3})).to.equal(3)

describe "kozu.core.transformsArgumentWith(func)", ->
  it "returns a function wrapper which transforms the wrapped function's argument with func", ->
    plus1wrapper = core.transformsArgumentWith(plus1)
    expect(plus1wrapper(times2)(5)).to.equal(12)

describe "kozu.core.transformsReturnValueWith(func)", ->
  it "returns a function wrapper which transforms the wrapped function's return value with func", ->
    plus1wrapper = core.transformsReturnValueWith(plus1)
    expect(plus1wrapper(times2)(5)).to.equal(11)

describe "kozu.core.mapper(func)", ->
  it "returns a function which takes an array and maps func onto it", ->
    mapIncrement = core.mapper(plus1)
    expect(mapIncrement([1,2,3])).to.deep.equal([2,3,4])

describe "kozu.core.joiner(separator)", ->
  it "returns a function which joins an array with the given string", ->
    expect(core.joiner("-")(["foo", "bar"])).to.equal("foo-bar")

describe "kozu.core.argumentMapper(func)", ->
  it "returns a function which maps func onto its arguments", ->
    expect(core.argumentMapper(plus1)(1,2,3)).to.deep.equal([2,3,4])

describe "kozu.core.argumentJoiner(separator)", ->
  it "returns a function which joins its arguments with the given string", ->
    expect(core.argumentJoiner("-")("foo", "bar")).to.equal("foo-bar")