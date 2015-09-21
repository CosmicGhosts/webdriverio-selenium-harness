var expect = require('expect')
var lib = require('../lib')
var seleniumHelper = require('../lib/helpers/selenium')

var mochaContext = {
  before: function () {},
  after: function () {}
}

var boundContext = {
  before: function () {
    if (!this.__special) {
      throw new Error('Before not bound to context')
    }
  },
  after: function () {
    if (!this.__special) {
      throw new Error('After not bound to context')
    }
  },
  '__special': true
}


describe('WebdriverIO Test Harness', function () {
  beforeEach(function () {
    this.beforeSpy = expect.spyOn(mochaContext, 'before')
    this.afterSpy = expect.spyOn(mochaContext, 'after')
  })

  afterEach(function () {
    this.beforeSpy.restore()
    this.afterSpy.restore()
  })

  context('Without spec runner functions', function () {
    beforeEach(function () {
      lib.call(mochaContext)
    })

    it('calls global before', function () {
      var spyCalls = this.beforeSpy.calls.length
      expect(spyCalls).toEqual(1)
    })

    it('calls global after', function () {
      var spyCalls = this.afterSpy.calls.length
      expect(spyCalls).toEqual(1)
    })
  })

  context('Without spec runner functions and with bound context', function () {
    beforeEach(function () {
      this.thunk = function () { lib.call(boundContext) }
    })

    it('calls global before and after with context', function () {
      expect(this.thunk).toNotThrow()
    })
  })

  context('With spec runner functions', function () {
    beforeEach(function () {
      lib(mochaContext)
    })

    it('calls passed before', function () {
      var spyCalls = this.beforeSpy.calls.length
      expect(spyCalls).toEqual(1)
    })

    it('calls passed after', function () {
      var spyCalls = this.afterSpy.calls.length
      expect(spyCalls).toEqual(1)
    })
  })
})
