var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

var selenium = require('selenium-standalone')
var lib = require('../lib/helpers/selenium')

describe('Selenium Helper', function () {
  beforeEach(function () {
    var sandbox = this.sandbox = sinon.sandbox.create()
    sandbox.stub(selenium, 'start')
    selenium.start.callsArgAsync(1)
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  describe('#setup', function () {
    it('calls selenium start', function () {
      var result = lib.setup({})
      expect(selenium.start).to.have.been.calledOnce
    })

    context('When given options', function () {
      it('calls selenium start with options', function () {
        var options = { test: true }
        var result = lib.setup(options)
        return result.then(function () {
          expect(selenium.start).to.have.been.calledWithMatch(options)
        })
      })
    })

    context('When not given options', function () {
      it('calls selenium start with default options', function () {
        return lib.setup().then(function () {
          expect(selenium.start).to.have.been.calledWith({})
        })
      })
    })

    context('When selenium start succeeds', function () {
      beforeEach(function () {
        var childProcess = this.childProcess = { kill: true }
        selenium.start.callsArgWithAsync(1, null, childProcess)
      })

      it('returns fulfilled promise of process', function () {
        var childProcess = this.childProcess
        return lib.setup().then(function (child) {
          expect(child).to.eql(childProcess)
        })
      })
    })

    context('When selenium start fails', function () {
      beforeEach(function () {
        var error = this.error = { error: true }
        selenium.start.callsArgWithAsync(1, error)
      })

      it('returns rejected promise of error', function () {
        lib.setup().catch(function (error) {
          expect(error).to.eql(this.error)
        })
      })
    })
  })
})
