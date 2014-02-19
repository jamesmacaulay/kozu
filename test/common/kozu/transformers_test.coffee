expect = require("chai").expect
core = require("../../../../../lib/kozu/core")
behaviors = require("../../../../../lib/kozu/transformers")

describe "kozu.core.arrayTransformer(functions)", ->

describe "kozu.transformers.arrayTransformer(functionSchemaArray)", ->
  it "returns a function which takes an array and maps its items with corresponding functions", ->
    tmpl = transformers.arrayTransformer([plus1, times2, exclaim])
    expect(tmpl([1, 2, 3])).to.deep.equal([2, 4, "3!"])
  it "uses identity as default when schema element is null or undefined", ->
    trans = transformers.arrayTransformer([null, plus1, times2])
    expect(trans([1,2,3,4])).to.deep.equal([1,3,6,4])
  it "explodes with non-function schema elements", ->
    trans = transformers.arrayTransformer([plus1, 0])
    expect(-> trans([1, 2])).to.throw(/number is not a function/)

describe "kozu.transformers.objectTemplate(functionSchemaObject)", ->
  it "returns a function which applies function values of the given schema to its argument", ->
    tmpl = transformers.objectTemplate
      name: behaviors.extractsKeys('first', 'last')(core.argumentJoiner(' '))
    expect(tmpl(first: "Larry", last: "Zozo")).to.deep.equal(name: "Larry Zozo")
  it "treats non-function values as constants which end up untouched in the output", ->
    tmpl = transformers.objectTemplate
      type: "person"
      nothing: null
      name: behaviors.extractsKeys('first', 'last')(core.argumentJoiner(' '))
    expect(tmpl(first: "Larry", last: "Zozo")).to.deep.equal(type: "person", nothing: null, name: "Larry Zozo")

describe "kozu.transformers.objectPropertyTemplate(functionSchemaObject)", ->
  it "returns a function which applies function values of the given schema to the corresponding properties of its argument", ->
    tmpl = transformers.objectPropertyTemplate(name: exclaim)
    expect(tmpl(name: "Larry Zozo", extra: "unused")).to.deep.equal(name: "Larry Zozo!")
  it "treats non-function values as constants which end up untouched in the output", ->
    tmpl = transformers.objectPropertyTemplate
      type: "person"
      nothing: null
      name: exclaim
    expect(tmpl(name: "Larry Zozo")).to.deep.equal(type: "person", nothing: null, name: "Larry Zozo!")
