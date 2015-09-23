var webdriverio = require('webdriverio')
var seleniumHelper = require('./helpers/selenium')

function validateState (state) {
  return state.browser
    .then(function () { return state })
    .catch(function (err) {
      return teardown(state)
        .then(function () { throw err })
    })
}

function makeClient (remote, init) {
  return webdriverio
    .remote(remote)
    .init(init)
}

function makeHarnessState (client, child) {
  return { browser: client, selenium: child }
}

function setup (opts) {
  opts = opts || {}
  var seleniumOpts = opts.seleniumOpts || {}
  var webdriverOpts = opts.webdriverio || {}
  var remote = webdriverOpts.remote || {}
  var init = webdriverOpts.init || {}

  return seleniumHelper
    .setup(seleniumOpts)
    .then(function (child) {
      var client = makeClient(remote, init)
      var state = makeHarnessState(client, child)
      return validateState(state)
    })
}

function teardown (state) {
  return state.browser.end().then(function () {
    return seleniumHelper.teardown(state.selenium)
  })
}

exports.setup = setup
exports.teardown = teardown
