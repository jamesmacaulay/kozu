expect = require("chai").expect
promises = require("../../../../../lib/kozu/promises")

inc = (x) -> 1 + x
args = -> arguments

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

  # rejectedWith from chai-as-promised seems to be broken
  it "returns a rejection promise handled with onReject when an error is thrown applying onResolve to non-promise x", ->
    expect(promises.whenever(1, -> throw new Error)).to.be.rejected

describe "kozu.promises.allArrayItems(items)", ->
  it "returns a copy of items when items is an array of non-promise values", ->
    nums = [1,2,3]
    result = promises.allArrayItems([1,2,3])
    expect(result).to.deep.equal([1,2,3])
    expect(result).to.not.equal(nums)
  it "works with Arguments objects", ->
    nums = args(1,2,3)
    result = promises.allArrayItems(args(1,2,3))
    expect(result).to.deep.equal([1,2,3])
    expect(result).to.not.equal(nums)
  it "returns a promise of the whole result if any of the items are promises", ->
    result = promises.allArrayItems([1, Promise.cast(2), 3, Promise.cast(4)])
    expect(result).to.eventually.deep.equal([1,2,3,4])
  it "casts thenables as real promises", ->
    # ...

