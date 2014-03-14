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
    expect(promises.whenever(Promise.resolve(1), inc)).to.eventually.equal(2)

  it "returns result of onResolve called with x if x is not a promise", ->
    expect(promises.whenever(1, inc)).to.equal(2)

  it "returns a rejection promise handled with onReject when an error is thrown applying onResolve to non-promise x", ->
    expect(promises.whenever(1, -> throw new Error("foo"))).to.be.rejectedWith("foo")

describe "kozu.promises.wait(delay, value)", ->
  it "returns a promise which resolves to `value` after the given `delay` in milliseconds", ->
    expect(promises.wait(1, "something")).to.eventually.equal("something");

describe "kozu.promises.errorTimeout(delay, [msg])", ->
  it "returns a promise which rejects after `delay` milliseconds", ->
    expect(promises.errorTimeout(1)).to.be.rejectedWith("Timed out")
  it "takes an optional error message", ->
    expect(promises.errorTimeout(1, "no more time!")).to.be.rejectedWith("no more time!")

describe "kozu.promises.timeoutAfter(delay, promise)", ->
  it "returns a promise which resolves to the resolved value of `promise` if `promise` resolves before `delay` milliseconds", ->
    promise = promises.timeoutAfter(10, promises.wait(5, "something"))
    expect(promise).to.eventually.equal("something")
  it "returns a promise which reject if `promise` does not resolve before `delay` milliseconds", ->
    promise = promises.timeoutAfter(5, promises.wait(10, "something"))
    expect(promise).to.be.rejectedWith("Timed out")

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
    result = promises.allArrayItems([1, Promise.resolve(2), 3, Promise.resolve(4)])
    expect(result).to.eventually.deep.equal([1,2,3,4])

  it "returns a promise which is rejected if one of the item promises rejects", ->
    result = promises.allArrayItems([1, Promise.resolve(2), Promise.reject(new Error("foo")), Promise.resolve(4)])
    expect(result).to.be.rejectedWith("foo")

describe "kozu.promises.allObjectValues(object)", ->
  it "returns a copy of object when none of the object's values are promises", ->
    nums = {a: 1, b: 2, c: 3}
    result = promises.allObjectValues(nums)
    expect(result).to.deep.equal(nums)
    expect(result).to.not.equal(nums)

  it "returns a promise of the whole result if any of the object's values are promises", ->
    result = promises.allObjectValues({a: 1, b: Promise.resolve(2), c: 3, d: Promise.resolve(4)})
    expect(result).to.eventually.deep.equal({a: 1, b: 2, c: 3, d: 4})

  it "returns a promise which is rejected if one of the value promises rejects", ->
    result = promises.allObjectValues({a: 1, b: Promise.resolve(2), c: Promise.reject(new Error("foo")), d: Promise.resolve(4)})
    expect(result).to.be.rejectedWith("foo")

describe "kozu.promises.shallowAgnostic(func)", ->
  plusMethod = core.methodize(plus)
  it "returns a function which acts like func when its arguments are non-promise values", ->
    result = promises.shallowAgnostic(plusMethod).call(2,3)
    expect(result).to.equal(5)

  it "returns a function which returns a promise when its context is a promise", ->
    result = promises.shallowAgnostic(plusMethod).call(Promise.resolve(2), 3)
    expect(result).to.eventually.equal(5)

  it "returns a function which returns a promise when one of its arguments is a promise", ->
    result = promises.shallowAgnostic(plus)(2, Promise.resolve(3))
    expect(result).to.eventually.equal(5)

describe "kozu.promises.agnostic", ->
  agnosticCompose = promises.agnostic(core.compose)
  it "infects function arguments recursively", ->
    fn = agnosticCompose(
      ((obj) ->
        obj.b + 1),
      ((obj) ->
        Promise.resolve({b: Promise.resolve(obj.a)}))
    )
    expect(fn(a: 1)).to.eventually.equal(2)
  it "returns functions which are agnostic about `this`", ->
    arrayPromise = Promise.resolve(
      [
        Promise.resolve({name: "Jim"}),
        Promise.resolve({name: "Sally"})
      ]
    )
    arrayPromise.map = promises.agnostic(Array.prototype.map || core.methodize(core.map))
    names = arrayPromise.map(core.getter('name'))
    expect(names).to.eventually.deep.equal(["Jim", "Sally"])

describe "kozu.promises.promiseExtender(prototype)", ->
  it "returns a function which takes a promise and extends it with agnostic version's of the prototype's methods", ->
    prototype = {number: 1, getNumber: core.methodize(core.getter("number"))}
    getNumberExtender = promises.promiseExtender(prototype)
    promise = Promise.resolve({number: 2})
    expect(core.keys(getNumberExtender({}))).to.deep.equal(['getNumber'])
    expect(getNumberExtender(promise).getNumber()).to.eventually.equal(2)


