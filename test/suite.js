var Promise = require('es6-promise').Promise
var webdriverio = require('webdriverio')

var helper = require('./specHelper')
var seleniumHelper = require('../lib/helpers/selenium')
var expect = helper.expect
var sinon = helper.sinon

var lib = require('../lib')


var browser = { end: function () {} }
var childProcess = { kill: function () {} }

describe('WebdriverIO Test Harness', function () {
  describe('#setup', function () {
    beforeEach(function () {
      this.sandbox = sinon.sandbox.create()
      this.sandbox.stub(webdriverio, 'remote')
      this.sandbox.stub(seleniumHelper, 'setup')
      this.initStub = this.sandbox.stub()
      this.initStub.returns(Promise.resolve())
      seleniumHelper.setup.returns(Promise.resolve())
      webdriverio.remote.returns({ init: this.initStub })
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
      it('setups Selenium with defaults', function () {
        return lib.setup().then(function () {
          expect(seleniumHelper.setup).to.be.calledOnce
          expect(seleniumHelper.setup).to.be.calledWithMatch({})
        })
      })
    })

    context('When Selenium succeeds', function () {
      context('and with Webdriver options', function () {
        context('and Webdriverio fails', function () {
          beforeEach(function () {
            this.error = { error: true }
            this.client = Promise.reject(this.error)
            this.initStub.returns(this.client)
            this.sandbox.stub(childProcess, 'kill')
            this.client.end = this.sandbox.stub().returns(Promise.resolve())
            seleniumHelper.setup.returns(Promise.resolve(childProcess))
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
              expect(childProcess.kill).to.have.been.calledOnce
              expect(childProcess.kill).to.have.been.calledAfter(client.end)
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
            var childProcess = { kill: true }
            this.initStub.returns(client)
            seleniumHelper.setup.returns(Promise.resolve(childProcess))

            return lib.setup({}).then(function (value) {
              expect(value).to.eql({
                browser: client,
                selenium: childProcess
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
        this.sandbox = sinon.sandbox.create()
        this.sandbox.stub(browser, 'end')
        this.sandbox.stub(childProcess, 'kill')
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
            expect(childProcess.kill).to.have.been.calledOnce
            expect(childProcess.kill).to.have.been.calledAfter(browser.end)
          })
      })
    })
  })
})
