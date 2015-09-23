var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

var selenium = require('selenium-standalone')
var lib = require('../lib/helpers/selenium')

describe('Selenium Helper', function () {
  beforeEach(function () {
    this.sandbox = sinon.sandbox.create()
    this.sandbox.stub(selenium, 'start')
    selenium.start.callsArgAsync(1)
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  describe('#setup', function () {
    it('calls selenium start', function () {
      lib.setup({})
      expect(selenium.start).to.have.been.calledOnce
    })

    context('When given options', function () {
      it('calls selenium start with options', function () {
        var options = { test: true }
        return lib.setup(options).then(function () {
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
        this.childProcess = { kill: true }
        selenium.start.callsArgWithAsync(1, null, this.childProcess)
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
        this.error = { error: true }
        selenium.start.callsArgWithAsync(1, this.error)
      })

      it('returns rejected promise of error', function () {
        var error = this.error
        return lib.setup().catch(function (err) {
          expect(err).to.eql(error)
        })
      })
    })
  })

  describe('#teardown', function () {
    context('When given a child process', function () {
      it('kills it', function () {
        var childProcess = { kill: sinon.spy() }
        return lib.teardown(childProcess).then(function () {
          expect(childProcess.kill).to.be.calledOnce
        })
      })
    })
  })
})
