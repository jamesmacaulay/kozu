describe "kozu", ->
  async = new AsyncSpec(this)
  promises = (f) ->
    throw TypeError unless typeof f is 'function'
    (args...) ->
      new Promise (resolve, reject) =>
        try
          resolve(f.apply(this, args))
        catch e
          reject(e)
  picks = (keys...) ->
    (obj) ->
      _.pick.apply(this, _.cons(obj, keys))
  throws = (error) ->
    ->
      throw error
  args = -> arguments
  double = _.partial(_.mul, 2)

  describe ".call", ->
    it "acts like Function.prototype.call", ->
      sliced = kozu.call(Array.prototype.slice, [1,2,3], 1, 2)
      expect(sliced).toEqual([2])
