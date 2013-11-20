describe 'kozu', ->
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

  describe ".whenever(value, func)", ->
    it "returns func called with value immediately if value is not a promise", ->
      picked = kozu.whenever({a: 1, b: 2}, picks('a'))
      expect(picked).toEqual({a: 1})
    async.it "returns a promise of the function application if value is a promise", (done) ->
      picked = kozu.whenever(Promise.cast({a: 1, b: 2}), picks('a'))
      picked.then (value) ->
        expect(value).toEqual({a: 1})
        done()

  describe ".map(items, func)", ->
    it "acts like regular map with an array of non-promises", ->
      expect(kozu.map([1,2,3], double)).toEqual([2,4,6])
    async.it "returns a promise of an array if items contains any promises", (done) ->
      doubled = kozu.map([1,Promise.cast(2),3,Promise.cast(4)], double)
      doubled.then (items) ->
        expect(items).toEqual([2,4,6,8])
        done()

  describe ".applyWhenever(func, ctx, args)", ->
    it "acts like `apply` when working with non-promises", ->
      picked = kozu.applyWhenever([].slice, [0,1,2], [1,2])
      expect(picked).toEqual([1])
    it "returns a promise if any of the arguments are promises", ->
      # waiting for kozu.all

  describe 'some other things', ->
    whenever = (value, func) ->
      if kozu.dependencies.isPromise(value)
        value.then(func)
      else
        func(value)

    doWhenever = (func) ->
      (value) -> whenever(value, func)

    reduce = (func, items) ->
      result = items[0]
      for item in Array.prototype.slice.call(items, 1)
        result = func(result, item)
      result

    compose2 = (f, g) ->
      (x) ->
        f.call(this, g.apply(this, arguments))

    compose = () ->
      reduce(compose2, arguments)

    identity = (x) -> x


    composeWhenever = () ->
      reduce(compose2, map(doWhenever, arguments))

    it 'does something', ->
      appending = (suffix) ->
        (x) -> "#{x}#{suffix}"

      f = compose(appending(4), appending(3), appending(2), appending(1))
      expect(f("foo")).toBe("foo1234")
