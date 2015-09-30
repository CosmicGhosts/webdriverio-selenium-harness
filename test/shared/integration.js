var helper = require('../helpers')
var expect = helper.expect

module.exports = function () {
  describe('Feature: Test Page', function () {
    context('When I visit the Test Page', function () {
      it('contains proper title', function () {
        var client = this.browser
        return client
          .url('http://localhost:9000')
          .getTitle()
          .then(function (title) {
            expect(title).to.equal('Test Page')
          })
      })
    })
  })
}
