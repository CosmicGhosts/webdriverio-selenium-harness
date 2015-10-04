var Promise = require('es6-promise').Promise
var webdriverio = require('webdriverio')

var helper = require('./helpers')
var seleniumHelper = require('../src/helpers/selenium')
var expect = helper.expect
var sinon = helper.sinon
var lib = require('../src')

var browser = { end: function () {} }
var childProcess = { kill: function () {} }
var childPromise = Promise.resolve(childProcess)

var sharedWebdriverIO = require('./shared/webdriverio')

describe('WebdriverIO Test Harness', function () {
  describe('#setup', function () {
    beforeEach(function () {
      this.sandbox = sinon.sandbox.create()
      this.initStub = this.sandbox.stub()

      this.sandbox.stub(webdriverio, 'remote')
      this.sandbox.stub(seleniumHelper, 'setup')
      this.sandbox.stub(childProcess, 'kill')

      this.initStub.returns(Promise.resolve())
      seleniumHelper.setup.returns(childPromise)
      webdriverio.remote.returns({ init: this.initStub })
    })

    afterEach(function () {
      this.sandbox.restore()
    })

    context('With Selenium options', function () {
      beforeEach(function () {
        this.options = { selenium: { seleniumArgs: [] } }
      })

      it('setups Selenium', function () {
        var options = this.options
        return lib.setup(options).then(function () {
          expect(seleniumHelper.setup).to.be.calledOnce
          expect(seleniumHelper.setup).to.be.calledWithMatch(options.selenium)
        })
      })
    })

    context('Without Selenium options', function () {
      it('setups Selenium with defaults', function () {
        return lib.setup().then(function () {
          expect(seleniumHelper.setup).to.be.calledOnce
          expect(seleniumHelper.setup).to.be.calledWithMatch({})
        })
      })
    })

    context('With Custom Options', function () {
      context('and remoteSelenium is true', function () {
        beforeEach(function () {
          this.options = { custom: { remoteSelenium: true } }
        })

        it('does not start selenium', function () {
          var options = this.options
          return lib.setup(options).then(function () {
            expect(seleniumHelper.setup).to.not.be.called
          })
        })

        sharedWebdriverIO({
          lib: lib,
          seleniumHelper: seleniumHelper,
          childProcess: childProcess
        })
      })

      context('and remoteSelenium is false', function () {
        it('setups Selenium', function () {
          var options = this.options
          return lib.setup(options).then(function () {
            expect(seleniumHelper.setup).to.be.calledOnce
            expect(seleniumHelper.setup).to.be.calledWithMatch({})
          })
        })

        sharedWebdriverIO({
          lib: lib,
          seleniumHelper: seleniumHelper,
          childProcess: childProcess
        })
      })
    })

    context('When Selenium succeeds', function () {
      context('and with Webdriver options', function () {
        sharedWebdriverIO({
          lib: lib,
          seleniumHelper: seleniumHelper,
          childProcess: childProcess
        })
      })

      context('and without Webdriver options', function () {
        it('calls WebdriverIO remote', function () {
          return lib.setup({}).then(function () {
            expect(webdriverio.remote).to.have.been.calledOnce
            expect(webdriverio.remote).to.have.been.calledWithMatch({})
          })
        })

        it('calls WebdriverIO init', function () {
          var initStub = this.initStub
          return lib.setup({}).then(function () {
            expect(initStub).to.have.been.calledOnce
            expect(initStub).to.have.been.calledAfter(webdriverio.remote)
            expect(initStub).to.have.been.calledWithMatch({})
          })
        })

        sharedWebdriverIO({
          lib: lib,
          seleniumHelper: seleniumHelper,
          childProcess: childProcess
        })
      })
    })

    context('When Selenium is pending', function () {
      it('doies not setup WebdriverIO', function () {
        lib.setup({})
        expect(webdriverio.remote).to.not.be.called
        expect(this.initStub).to.not.be.called
      })
    })

    context('When Selenium fails', function () {
      it('does not setup WebdriverIO', function () {
        lib.setup({})
        expect(webdriverio.remote).to.not.be.called
        expect(this.initStub).to.not.be.called
      })
    })
  })

  describe('#teardown', function () {
    context('Given a Webdriverio client and Selenium process', function () {
      beforeEach(function () {
        this.sandbox = sinon.sandbox.create()

        this.sandbox.stub(browser, 'end')
        this.sandbox.stub(childProcess, 'kill')
        this.sandbox.stub(seleniumHelper, 'teardown')

        seleniumHelper.teardown.returns(Promise.resolve())
        browser.end.returns(Promise.resolve())
      })

      afterEach(function () {
        this.sandbox.restore()
      })

      it('ends Webdriverio client', function () {
        var options = {
          browser: browser,
          selenium: childProcess
        }

        return lib.teardown(options)
          .then(function () {
            expect(browser.end).to.have.been.calledOnce
          })
      })

      it('kills Selenium process', function () {
        var options = {
          browser: browser,
          selenium: childProcess
        }

        return lib.teardown(options)
          .then(function () {
            expect(seleniumHelper.teardown).to.have.been.calledOnce
            expect(seleniumHelper.teardown).to.have.been.calledWithMatch(childProcess)
            expect(seleniumHelper.teardown).to.have.been.calledAfter(browser.end)
          })
      })
    })
  })
})
