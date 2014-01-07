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
  protoSlice = Array.prototype.slice

  describe ".call(func, ctx, [args...])", ->
    it "acts like Function.prototype.call", ->
      sliced = kozu.call(protoSlice, [1,2,3], 1, 2)
      expect(sliced).toEqual([2])

  describe ".agnostic(func)", ->
    agnosticCall = kozu.agnostic(kozu.call)

    describe "returns a new version of the function which", ->
      it "acts like the original function when its context and arguments are free of promises", ->
        sliced = agnosticCall(protoSlice, [1,2,3], 1, 2)
        expect(sliced).toEqual([2])
        
      async.it "returns a promise when its context is a promise", (done) ->
        sliced = agnosticCall(protoSlice, Promise.cast([1,2,3]), 1, 2)
        sliced.then (result) ->
          expect(result).toEqual([2])
          done()

      async.it "returns a promise when any of its arguments are promises", (done) ->
        sliced = agnosticCall(protoSlice, [1,2,3], 1, Promise.cast(2))
        sliced.then (result) ->
          expect(result).toEqual([2])
          done()

  describe ".higherOrderAgnostic(func)", ->
    higherOrderAgnosticCall = kozu.collectionAgnostic(kozu.call)
    higherOrderAgnosticMap = kozu.collectionAgnostic(_.map)

    describe "returns a new version of the function which", ->
      it "acts like the original function when its context and arguments are free of promises", ->
        sliced = higherOrderAgnosticCall(protoSlice, [1,2,3], 1, 2)
        expect(sliced).toEqual([2])
        
      async.it "returns a promise when its context is a promise", (done) ->
        sliced = higherOrderAgnosticCall(protoSlice, Promise.cast([1,2,3]), 1, 2)
        sliced.then (result) ->
          expect(result).toEqual([2])
          done()

      async.it "returns a promise when any of its arguments are promises", (done) ->
        sliced = higherOrderAgnosticCall(protoSlice, [1,2,3], 1, Promise.cast(2))
        sliced.then (result) ->
          expect(result).toEqual([2])
          done()

      async.it "wraps any function arguments with `higherOrderAgnostic`", (done) ->
        mapped = higherOrderAgnosticMap([1, Promise.cast(2), 3], double)
        mapped.then (result) ->
          expect(result).toEqual([2,4,6])
          done()

      async.it "infects any function arguments with agnosticism", (done) ->
        mapped = higherOrderAgnosticMap([1, Promise.cast(2), 3], double)
        mapped.then (result) ->
          expect(result).toEqual([2,4,6])
          done()

  describe "agnostic _.filter", ->
    agnosticFilter = kozu.collectionAgnostic(_.filter)

    async.it "filters promises", (done) ->
      filtered = agnosticFilter([1, Promise.cast(2), 3, 3], (n) -> n is 3)
      filtered.then (result) ->
        expect(result).toEqual([3,3])
        done()





