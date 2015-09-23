var webdriverio = require('webdriverio')
var seleniumHelper = require('./helpers/selenium')

function checkBrowser(opts) {
  return opts.browser
    .then(function () {
      return opts
    })
    .catch(function (err) {
      return exports.teardown(opts)
        .then(function () {
          throw err
        })
    })
}

exports.setup = function (opts) {
  opts = opts || {}
  var seleniumOpts = opts.seleniumOpts || {}
  var webdriverOpts = opts.webdriverio || {}
  var remote = webdriverOpts.remote || {}
  var init = webdriverOpts.init || {}

  return seleniumHelper.setup(seleniumOpts)
    .then(function (child) {
      var browser = webdriverio
        .remote(remote)
        .init(init)
      var results = { browser: browser, selenium: child }
      return checkBrowser(results)
    })
}

exports.teardown = function (opts) {
  return opts.browser
    .end()
    .then(function () {
      return opts.selenium.kill()
    })
}
