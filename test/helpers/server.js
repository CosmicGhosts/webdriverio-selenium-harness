var http = require('http')
var path = require('path')
var connect = require('connect')
var serveStatic = require('serve-static')
var app = connect()

var dir = path.join(__dirname, '..', 'public')
app.use(serveStatic(dir, {'index': ['index.html']}))

module.exports = http.createServer(app)
