var helper = require('./specHelper')
var expect = helper.expect
var sinon = helper.sinon
var server = require('./helpers/server')
var harness = require('../lib')

var options = {
  webdriverio: {
    remote: {
      desiredCapabilities: { browserName: 'phantomjs' }
    }
  }
}

describe('WebdriverIO Selenium Harness integration', function () {
  before(function (done) {
    var self = this
    this.harnessState = harness.setup(options)
    return this.harnessState.then(function (state) {
      self.browser = state.browser
      self.selenium = state.selenium
      server.listen(9000, done)
    })
  })

  after(function () {
    return this.harnessState
      .then(harness.teardown)
      .then(function () { server.close() })
  })

  describe('Feature: Test Page', function () {
    context('When I visit the Test Page', function () {
      it('contains proper title', function () {
        var client = this.browser
        return client
          .url('http://localhost:9000')
          .getTitle()
          .then(function (title) {
            expect(title).to.equal('Test Page')
          })
      })
    })
  })
})
