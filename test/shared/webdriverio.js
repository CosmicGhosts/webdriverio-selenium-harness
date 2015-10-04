var Promise = require('es6-promise').Promise
var webdriverio = require('webdriverio')
var assign = require('object-assign')
var helpers = require('../helpers')
var expect = helpers.expect

module.exports = function (state) {
  var lib = state.lib
  var childProcess = state.childProcess

  context('and WebdriverIO fails', function () {
    beforeEach(function () {
      this.options = this.options || {}
      this.error = { error: true }
      this.client = Promise.reject(this.error)
      this.initStub.returns(this.client)
      this.client.end = this.sandbox.stub().returns(Promise.resolve())
    })

    it('closes the browser client', function () {
      var client = this.client
      var options = this.options
      return lib.setup(options).catch(function () {
        expect(client.end).to.have.been.called
      })
    })

    it('propagates errors', function () {
      var error = this.error
      var options = this.options
      return lib.setup(options).catch(function (err) {
        expect(err).to.eql(error)
      })
    })

    context('When ', function () {
      it('kills the selenium process', function () {
        var client = this.client
        var options = this.options
        options.custom = options.custom || {}
        options.custom.remoteSelenium = options.custom.remoteSelenium || false

        return lib.setup(options)
          .catch(function () {})
          .then(function () {
            if (options.custom.remoteSelenium) {
              expect(childProcess.kill).to.not.have.been.called
            } else {
              expect(childProcess.kill).to.have.been.calledOnce
              expect(childProcess.kill).to.have.been.calledAfter(client.end)
            }
          })
      })
    })
  })

  context('and WebdriverIO succeeds', function () {
    it('calls WebdriverIO remote', function () {
      var opts = {
        webdriverio: {
          remote: { desiredCapabilities: { browserName: 'chrome' } }
        }
      }

      var options = assign({}, this.options, opts)

      return lib.setup(options).then(function () {
        expect(webdriverio.remote).to.have.been.calledOnce
        expect(webdriverio.remote)
          .to.have.been.calledWithMatch(options.webdriverio.remote)
      })
    })

    it('calls WebdriverIO init', function () {
      var opts = {
        webdriverio: {
          init: { desiredCapabilities: { browserName: 'chrome' } }
        }
      }

      var options = assign({}, this.options, opts)
      var initStub = this.initStub

      return lib.setup(options).then(function () {
        expect(initStub).to.have.been.calledOnce
        expect(initStub).to.have.been.calledAfter(webdriverio.remote)
        expect(initStub).to.have.been.calledWithMatch(options.webdriverio.init)
      })
    })

    it('returns WebdriverIO client and Selenium process', function () {
      var client = Promise.resolve()
      var options = this.options
      this.initStub.returns(client)
      return lib.setup(options).then(function (value) {
        expect(value.browser).to.eql(client)
        expect((typeof value.selenium.kill)).to.equal('function')
      })
    })
  })
}
