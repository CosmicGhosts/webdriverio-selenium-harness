var Promise = require('es6-promise').Promise
var webdriverio = require('webdriverio')
var seleniumHelper = require('./helpers/selenium')

function noOp () {}

function validateState (state) {
  return state.browser
    .then(function (err) {
      return state
    })
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
  var custom = opts.custom || {}
  var seleniumOpts = opts.selenium || {}
  var webdriverOpts = opts.webdriverio || {}
  var remote = webdriverOpts.remote || {}
  var init = webdriverOpts.init || {}

  if (custom.remoteSelenium) {
    return Promise.resolve(
      validateState(
      makeHarnessState(
        makeClient(remote, init),
        { kill: noOp }
      )).then(function (state) {
        return state
      }))
  }

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
