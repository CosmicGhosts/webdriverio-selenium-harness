var Promise = require('es6-promise').Promise
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)


var webdriverio = require('webdriverio')
var lib = require('../lib')
var seleniumHelper = require('../lib/helpers/selenium')

var browser = { end: function () {} }
var process = { kill: function () {} }

describe('WebdriverIO Test Harness', function () {
  describe('#setup', function () {
    beforeEach(function () {
      var sandbox = this.sandbox = sinon.sandbox.create()
      sandbox.stub(webdriverio, 'remote')
      sandbox.stub(seleniumHelper, 'setup')

      var initStub = this.initStub = sinon.stub()
      initStub.returns(Promise.resolve())
      seleniumHelper.setup.returns(Promise.resolve())
      var api = { init: initStub }
      webdriverio.remote.returns(api)
    })

    afterEach(function () {
      this.sandbox.restore()
    })

    context('With Selenium options', function () {
      it('setups Selenium', function () {
        var options = { seleniumOpts: { seleniumArgs: [] } }
        return lib.setup(options).then(function () {
          expect(seleniumHelper.setup).to.be.calledOnce
          expect(seleniumHelper.setup).to.be.calledWithMatch(options.seleniumOpts)
        })
      })
    })

    context('Without Selenium options', function () {
      it('setups Selenium', function () {
        return lib.setup().then(function () {
          expect(seleniumHelper.setup).to.be.calledOnce
          expect(seleniumHelper.setup).to.be.calledWithMatch({})
        })
      })
    })

    context('When Selenium succeeds', function () {
      beforeEach(function () {
        seleniumHelper.setup.returns(Promise.resolve())
      })

      context('and with Webdriver options', function () {
        context('and Webdriverio fails', function () {
          beforeEach(function () {
            var error = this.error = { error: true }
            var client = this.client  = Promise.reject(error)
            var endPromise = Promise.resolve()
            client.end = this.sandbox.stub().returns(endPromise)
            this.initStub.returns(client)
            this.sandbox.stub(process, 'kill')
            seleniumHelper.setup.returns(Promise.resolve(process))
          })

          it('closes the browser client', function () {
            var client = this.client
            return lib.setup({}).catch(function () {
              expect(client.end).to.have.been.called
            })
          })

          it('kills the selenium process', function () {
            var client = this.client
            return lib.setup({}).catch(function () {
              expect(process.kill).to.have.been.calledOnce
              expect(process.kill).to.have.been.calledAfter(client.end)
            })
          })

          it('propagates errors', function () {
            var error = this.error
            return lib.setup({}).catch(function (err) {
              expect(err).to.eql(error)
            })
          })
        })

        context('and Webdriverio succeeds', function () {
          beforeEach(function () {
            var error = this.error = { error: true }
            this.initStub.returns(Promise.resolve())
          })

          it('calls WebdriverIO remote', function () {
            var options = {
              webdriverio: {
                remote: { desiredCapabilities: { browserName: 'chrome' } }
              }
            }

            return lib.setup(options).then(function () {
              expect(webdriverio.remote).to.have.been.calledOnce
              expect(webdriverio.remote)
                .to.have.been.calledWithMatch(options.webdriverio.remote)
            })
          })

          it('calls WebdriverIO init', function () {
            var options = {
              webdriverio: {
                init: { desiredCapabilities: { browserName: 'chrome' } }
              }
            }
            var initStub = this.initStub

            return lib.setup(options).then(function () {
              expect(initStub).to.have.been.calledOnce
              expect(initStub).to.have.been.calledAfter(webdriverio.remote)
              expect(initStub).to.have.been.calledWithMatch(options.webdriverio.init)
            })
          })

          it('returns WebdriverIO client and Selenium process', function () {
            var client = Promise.resolve(client)
            var process = { kill: true }
            this.initStub.returns(client)
            seleniumHelper.setup.returns(Promise.resolve(process))

            return lib.setup({}).then(function (value) {
              expect(value).to.eql({
                browser: client,
                selenium: process
              })
            })
          })
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
        var sandbox = this.sandbox = sinon.sandbox.create()
        sandbox.stub(browser, 'end')
        sandbox.stub(process, 'kill')
        browser.end.returns(Promise.resolve())
      })

      afterEach(function () {
        this.sandbox.restore()
      })

      it('ends Webdriverio client', function () {
        var options = {
          browser: browser,
          selenium: process
        }

        return lib.teardown(options)
          .then(function () {
            expect(browser.end).to.have.been.calledOnce
          })
      })

      it('kills Selenium process', function () {
        var options = {
          browser: browser,
          selenium: process
        }

        return lib.teardown(options)
          .then(function () {
            expect(process.kill).to.have.been.calledOnce
            expect(process.kill).to.have.been.calledAfter(browser.end)
          })
      })
    })
  })
})
