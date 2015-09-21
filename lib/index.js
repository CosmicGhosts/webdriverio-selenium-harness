var assign = require('object-assign')
var seleniumHelper = require('./helpers/selenium')

var hooks = [
  'before',
  'after'
]

function makeHook (key, opts, context) {
  return opts[key] || context[key].bind(context)
}

function makeHooks (opts, context) {
  return hooks.reduce(function (acc, key) {
    var hook = {}
    hook[key] = makeHook(key, opts, context)
    return assign(acc, hook)
  }, {})
}

module.exports = function (opts) {
  opts = opts || {}
  var hooks = makeHooks(opts, this)
  var before = hooks.before
  var after = hooks.after

  before()
  after()
}
