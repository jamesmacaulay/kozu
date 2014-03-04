expect = require("chai").expect
c = require("../../../../../lib/kozu/core")
t = require("../../../../../lib/kozu/transformers")

plus1 = (n) -> n+1
times2 = (n) -> n*2
exclaim = (x) -> "#{x}!"

describe "kozu.transformers.arrayTransformer(functionSchemaArray)", ->
  it "returns a function which takes an array and maps its items with corresponding functions", ->
    tmpl = t.arrayTransformer([plus1, times2, exclaim])
    expect(tmpl([1, 2, 3])).to.deep.equal([2, 4, "3!"])
  it "uses identity as default when definition element is null or undefined", ->
    trans = t.arrayTransformer([null, plus1, times2])
    expect(trans([1,2,3,4])).to.deep.equal([1,3,6,4])
  it "explodes with non-function definition elements", ->
    trans = t.arrayTransformer([plus1, 0])
    expect(-> trans([1, 2])).to.throw(/number is not a function/)

describe "kozu.transformers.transformsArgumentsWithSchema(functionSchemaArray)", ->
  it "returns a wrapper function which returns a function that transforms its arguments with the given definition as per `arrayTransformer`", ->
    wrapper = t.transformsArgumentsWithSchema([plus1, times2, exclaim])
    expect(wrapper(c.args)(1, 2, 3)).to.deep.equal(c.args(2, 4, "3!"))

describe "kozu.transformers.objectTemplate(functionSchemaObject)", ->
  it "returns a function which applies function values of the given definition to its argument", ->
    tmpl = t.objectTemplate
      name: c.extractsKeys('first', 'last')(c.argumentJoiner(' '))
    expect(tmpl(first: "Larry", last: "Zozo")).to.deep.equal(name: "Larry Zozo")
  it "treats non-function values as constants which end up untouched in the output", ->
    tmpl = t.objectTemplate
      type: "person"
      nothing: null
      name: c.extractsKeys('first', 'last')(c.argumentJoiner(' '))
    expect(tmpl(first: "Larry", last: "Zozo")).to.deep.equal(type: "person", nothing: null, name: "Larry Zozo")

describe "kozu.transformers.objectPropertyTemplate(functionSchemaObject)", ->
  it "returns a function which applies function values of the given definition to the corresponding properties of its argument", ->
    tmpl = t.objectPropertyTemplate(name: exclaim)
    expect(tmpl(name: "Larry Zozo", extra: "unused")).to.deep.equal(name: "Larry Zozo!")
  it "treats non-function values as constants which end up untouched in the output", ->
    tmpl = t.objectPropertyTemplate
      type: "person"
      nothing: null
      name: exclaim
    expect(tmpl(name: "Larry Zozo")).to.deep.equal(type: "person", nothing: null, name: "Larry Zozo!")

describe "kozu.transformers.middleware(definition)", ->
  it "returns a function which applies function values of the given definition to the corresponding properties of its argument", ->
    middleware = t.middleware({
      num: c.constantly(2),
      name: c.transformsReturnValueWith(exclaim)
    })
    result = middleware({
      name: c.constantly("Jim"),
      handle: c.constantly("jimmm")
    })
    expect(result.num).to.equal(2)
    expect(result.name()).to.equal("Jim!")
    expect(result.handle()).to.equal("jimmm")
