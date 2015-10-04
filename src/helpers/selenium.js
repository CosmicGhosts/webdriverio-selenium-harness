var Promise = require('es6-promise').Promise
var selenium = require('selenium-standalone')

function setup (opts) {
  opts = opts || {}
  return new Promise(function (resolve, reject) {
    selenium.start(opts, function (err, child) {
      if (err) { return reject(err) }
      return resolve(child)
    })
  })
}

function teardown (selenium) {
  selenium.kill()
  return Promise.resolve()
}

exports.setup = setup
exports.teardown = teardown
