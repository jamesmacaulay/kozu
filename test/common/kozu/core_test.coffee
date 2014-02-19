expect = require("chai").expect
core = require("../../../../../lib/kozu/core")
behaviors = require("../../../../../lib/kozu/behaviors")

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

describe "partialRest(func, ... args)", ->
  it "returns a partial application of func, starting from the second argument", ->
    makeArray = behaviors.variadic(core.identity)
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

describe "kozu.core.mapper(func)", ->
  it "returns a function which takes an array and maps func onto it", ->
    mapIncrement = core.mapper(plus1)
    expect(mapIncrement([1,2,3])).to.deep.equal([2,3,4])
