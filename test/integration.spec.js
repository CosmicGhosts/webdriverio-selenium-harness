var assign = require('object-assign')
var seleniumHelper = require('../lib/helpers/selenium')
var pageVisitingBehavior = require('./shared/integration')
var server = require('./helpers/server')
var harness = require('../lib')
var isCI = !!process.env.CI

describe('WebdriverIO Selenium Harness integration', function () {
  before(function (done) {
    var options = this.options = {
      webdriverio: {
        remote: { desiredCapabilities: { browserName: 'phantomjs' } }
      }
    }
    server.listen(9000, done)
  })

  after(function () { server.close() })

  describe('With local selenium', function () {
    before(function () {
      var self = this
      var harnessState = self.harnessState = harness.setup(self.options)
      return harnessState.then(function (state) {
        self.browser = state.browser
        self.selenium = state.selenium
      })
    })

    after(function () {
      return this.harnessState.then(harness.teardown)
    })

    pageVisitingBehavior()
  })

  describe('With remote selenium', function () {
    function getSeleniumPromise (isCI) {
      if (isCI) {
        return Promise.resolve({ kill: function () {} })
      }
      return seleniumHelper.setup({})
    }

    before(function () {
      var self = this
      var options = self.options = assign({}, this.options, {
        custom: { remoteSelenium: true }
      })

      return getSeleniumPromise(isCI).then(function (child) {
        self.selenium = child
        return harness.setup(options).then(function (state) {
          self.browser = state.browser
        })
      })
    })

    after(function () {
      var self = this
      return self.browser.end().then(function () {
        return seleniumHelper.teardown(self.selenium)
      })
    })

    pageVisitingBehavior()
  })
})
