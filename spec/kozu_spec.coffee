describe 'Kozu', ->
  async = new AsyncSpec(this)
  promising = (f) ->
    throw TypeError unless typeof f is 'function'
    (args...) ->
      new RSVP.Promise (resolve, reject) =>
        try
          resolve(f.apply(this, args))
        catch e
          reject(e)
  picking = (keys...) ->
    (obj) ->
      _.pick.apply(this, _.cons(obj, keys))
  throwing = (error) ->
    ->
      throw error
  double = _.partial(_.mul, 2)

  describe '.compose', ->
    it 'works like _.compose for regular functions', ->
      incDouble = Kozu.compose(double, _.inc)
      expect(incDouble(2)).toBe(6)

    async.it 'composes promise functions and regular functions together', (done) ->
      maxFooBar = Kozu.compose(promising(_.max), _.values, promising(picking('foo', 'bar')))
      obj = {foo:1, bar:2, baz:3}
      maxFooBar(obj).then (n) ->
        expect(n).toBe(2)
        done()

    async.it 'leaves error propagation for the promises to deal with', (done) ->
      errorComposition = Kozu.compose(throwing("an error"), promising(_.identity))
      errorComposition(1).then null, (error) ->
        expect(error).toBe("an error")
        done()

    async.it 'preserves context', (done) ->
      spy = sinon.spy()
      obj = {composition: Kozu.compose(promising(spy), spy)}
      obj.composition(1).then (n) ->
        expect(spy.firstCall.thisValue).toBe(obj)
        expect(spy.secondCall.thisValue).toBe(obj)
        done()

  describe '.pipe', ->
    it 'pipes a value through a series of regular functions', ->
      expect(Kozu.pipe(2, _.inc, double)).toBe(6)

    async.it 'pipes through both promise functions and regular functions', (done) ->
      obj = {foo:1, bar:2, baz:3}
      maxFooBarPromise = Kozu.pipe obj,
        promising(picking('foo', 'bar')),
        _.values,
        promising(_.max)
      maxFooBarPromise.then (n) ->
        expect(n).toBe(2)
        done()

    async.it 'leaves error propagation for the promises to deal with', (done) ->
      errorPromise = Kozu.pipe(1, promising(_.identity), throwing("an error"))
      errorPromise.then null, (error) ->
        expect(error).toBe("an error")
        done()

    async.it 'preserves context', (done) ->
      spy = sinon.spy()
      obj = {composition: (n) -> Kozu.pipe.call(this, n, spy, promising(spy))}
      obj.composition(1).then (n) ->
        expect(spy.firstCall.thisValue).toBe(obj)
        expect(spy.secondCall.thisValue).toBe(obj)
        done()

  describe '.reduce', ->
    it 'reduces an array with a regular function', ->
      result = Kozu.reduce([1,2,3,4], _.mul)
      expect(result).toBe(24)

    async.it 'reduces an array with a promise-returning function', (done) ->
      promise = Kozu.reduce([1,2,3,4], promising(_.mul))
      promise.then (n) ->
        expect(n).toBe(24)
        done()
