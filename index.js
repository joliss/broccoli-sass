var Filter = require('broccoli-filter')

module.exports = SassFilter
SassFilter.prototype = Object.create(Filter.prototype)
SassFilter.prototype.constructor = SassFilter
function SassFilter (inputTree, options) {
  if (!(this instanceof SassFilter)) return new SassFilter(inputTree, options)
  this.inputTree = inputTree
  this.options = options || {}
}

SassFilter.prototype.extensions = ['scss']
SassFilter.prototype.targetExtension = 'css'

SassFilter.prototype.processString = function (string) {
  var options = {
    data: string
  }

  for (var key in this.options) {
    if (this.options.hasOwnProperty(key)) {
      options[key] = this.options[key];
    }
  }

  try {
    return require('node-sass').renderSync(options)
  } catch (err) {
    err.line = err.location && err.location.first_line
    err.column = err.location && err.location.first_column
    throw err
  }
}
