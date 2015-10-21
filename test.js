'use strict'

var BroccoliSass = require('./');
var fixture = require('broccoli-fixture')
var chai = require('chai'), expect = chai.expect
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('broccoli-sass', function() {
  it('compiles .scss files', function() {
    var inputNode = new fixture.Node({
      'app.scss': 'html { body { font: Helvetica; } }'
    })
    var node = new BroccoliSass([inputNode], 'app.scss', 'assets/app.css')
    return expect(fixture.build(node)).to.eventually.deep.equal({
      'assets': {
        'app.css': 'html body {\n  font: Helvetica; }\n'
      }
    })
  })
})
