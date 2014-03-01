{expect} = require("chai")
sinon = require("sinon")
core = require("../../../../../lib/kozu/core")
promises = require("../../../../../lib/kozu/promises")

inc = (x) -> 1 + x
args = -> arguments
plus = (a,b) -> a + b

describe "kozu.promises.isThenable(x)", ->
  it "returns false if argument is null", ->
    expect(promises.isThenable(null)).to.equal(false)

  it "returns false if argument is undefined", ->
    expect(promises.isThenable(undefined)).to.equal(false)

  it "returns false if argument has no .then property", ->
    expect(promises.isThenable({})).to.equal(false)

  it "returns false if the argument's .then property is not a function", ->
    expect(promises.isThenable({then: 2})).to.equal(false)

  it "returns true if the argument's .then property is a function", ->
    expect(promises.isThenable({then: ->})).to.equal(true)

describe "kozu.promises.whenever(x, onResolve, onReject)", ->
  it "returns x.then(onResolve, onReject) if x is a promise", ->
    expect(promises.whenever(Promise.cast(1), inc)).to.eventually.equal(2)

  it "returns result of onResolve called with x if x is not a promise", ->
    expect(promises.whenever(1, inc)).to.equal(2)

  it "returns a rejection promise handled with onReject when an error is thrown applying onResolve to non-promise x", ->
    expect(promises.whenever(1, -> throw new Error("foo"))).to.be.rejectedWith("foo")

describe "kozu.promises.allArrayItems(items)", ->
  it "returns a copy of items when items is an array of non-promise values", ->
    nums = [1,2,3]
    result = promises.allArrayItems(nums)
    expect(result).to.deep.equal(nums)
    expect(result).to.not.equal(nums)

  it "works with Arguments objects", ->
    nums = args(1,2,3)
    result = promises.allArrayItems(args(1,2,3))
    expect(result).to.deep.equal([1,2,3])
    expect(result).to.not.equal(nums)

  it "returns a promise of the whole result if any of the items are promises", ->
    result = promises.allArrayItems([1, Promise.cast(2), 3, Promise.cast(4)])
    expect(result).to.eventually.deep.equal([1,2,3,4])

  it "returns a promise which is rejected if one of the item promises rejects", ->
    result = promises.allArrayItems([1, Promise.cast(2), Promise.reject(new Error("foo")), Promise.cast(4)])
    expect(result).to.be.rejectedWith("foo")

describe "kozu.promises.allObjectValues(object)", ->
  it "returns a copy of object when none of the object's values are promises", ->
    nums = {a: 1, b: 2, c: 3}
    result = promises.allObjectValues(nums)
    expect(result).to.deep.equal(nums)
    expect(result).to.not.equal(nums)

  it "returns a promise of the whole result if any of the object's values are promises", ->
    result = promises.allObjectValues({a: 1, b: Promise.cast(2), c: 3, d: Promise.cast(4)})
    expect(result).to.eventually.deep.equal({a: 1, b: 2, c: 3, d: 4})

  it "returns a promise which is rejected if one of the value promises rejects", ->
    result = promises.allObjectValues({a: 1, b: Promise.cast(2), c: Promise.reject(new Error("foo")), d: Promise.cast(4)})
    expect(result).to.be.rejectedWith("foo")

describe "kozu.promises.shallowAgnostic(func)", ->
  plusMethod = core.methodize(plus)
  it "returns a function which acts like func when its arguments are non-promise values", ->
    result = promises.shallowAgnostic(plusMethod).call(2,3)
    expect(result).to.equal(5)

  it "returns a function which returns a promise when its context is a promise", ->
    result = promises.shallowAgnostic(plusMethod).call(Promise.cast(2), 3)
    expect(result).to.eventually.equal(5)

  it "returns a function which returns a promise when one of its arguments is a promise", ->
    result = promises.shallowAgnostic(plus)(2, Promise.cast(3))
    expect(result).to.eventually.equal(5)

describe "kozu.promises.agnostic.objectTemplate", ->
  it "is pretty nice", ->
    input =
      first: Promise.cast("Zoe")
      last: "Yodeller"
    namer = promises.agnostic.objectTemplate
      name: core.extractsKeys('first', 'last') ->
        Array::join.call(arguments, ' ')
    expect(namer(input)).to.eventually.deep.equal({name: "Zoe Yodeller"})



