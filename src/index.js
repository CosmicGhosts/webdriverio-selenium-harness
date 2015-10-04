var Promise = require('es6-promise').Promise
var webdriverio = require('webdriverio')
var seleniumHelper = require('./helpers/selenium')
var seleniumStub = { kill: function () {}}

function formatOptions (opts) {
  opts = opts || {}
  opts.custom = opts.custom || {}
  opts.selenium = opts.selenium || {}
  opts.webdriverio = opts.webdriverio || {}
  opts.webdriverio.remote = opts.webdriverio.remote || {}
  opts.webdriverio.init = opts.webdriverio.init || {}
  return opts
}

function makeClient (remote, init) {
  return webdriverio
    .remote(remote)
    .init(init)
}

function makeHarnessState (client, child) {
  return { browser: client, selenium: child }
}

function build (opts, child) {
  var client = makeClient(opts.remote, opts.init)
  var state = makeHarnessState(client, child)
  return state.browser
    .then(function () { return state })
    .catch(function (err) {
      return teardown(state)
        .then(function () { Promise.reject(err) })
    })
}

function setup (opts) {
  opts = formatOptions(opts)
  var remoteSelenium = opts.custom.remoteSelenium

  if (remoteSelenium) {
    return build(opts.webdriverio, seleniumStub)
  }

  return seleniumHelper
    .setup(opts.selenium)
    .then(function (child) { return build(opts.webdriverio, child) })
}

function teardown (state) {
  return state.browser.end().then(function () {
    return seleniumHelper.teardown(state.selenium)
  })
}

exports.setup = setup
exports.teardown = teardown
