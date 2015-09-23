var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var server = require('./server')
var expect = chai.expect
chai.use(sinonChai)

exports.expect = expect
exports.sinon = sinon
exports.server = server
