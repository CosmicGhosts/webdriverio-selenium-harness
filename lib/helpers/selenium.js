var Promise = require('es6-promise').Promise
var selenium = require('selenium-standalone')

exports.setup = function (opts) {
  opts = opts || {}
  return new Promise(function (resolve, reject) {
    selenium.start(opts, function (err, child) {
      if (err) { return reject(err) }
      return resolve(child)
    })
  })
}
