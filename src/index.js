var Promise = require('es6-promise').Promise
var webdriverio = require('webdriverio')
var seleniumHelper = require('./helpers/selenium')
var seleniumStub = { kill: function(){} }

function formatOptions (opts) {
  var method = 'remote'
  if (opts.webdriverio && opts.webdriverio.multiremote) {
    method = 'multiremote'
  }

  opts = opts || {}
  opts.custom = opts.custom || {}
  opts.selenium = opts.selenium || {}
  opts.webdriverio = opts.webdriverio || {}
  opts.webdriverio.remote = opts.webdriverio.remote || {}
  opts.webdriverio.multiremote = opts.webdriverio.multiremote || {}
  opts.webdriverio.init = opts.webdriverio.init || {}
  opts.webdriverio.method = method
  return opts
}

function makeClient (opts) {
  var webdriverioFn = webdriverio[opts.method]
  var options = opts[opts.method]
  return webdriverioFn(options).init(init)
}

function makeHarnessState (client, child) {
  return { browser: client, selenium: child }
}

function build (opts, child) {
  var client = makeClient(opts)
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
