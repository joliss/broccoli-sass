var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var quickTemp = require('quick-temp')
var mapSeries = require('promise-map-series')
var sass = require('node-sass')
var _ = require('lodash')


module.exports = SassCompiler
function SassCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(sourceTrees, inputFile, outputFile, options)
  this.sourceTrees = sourceTrees
  this.inputFile = inputFile
  this.outputFile = outputFile
  options = options || {}
  this.sassOptions = {
    imagePath: options.imagePath,
    outputStyle: options.outputStyle,
    sourceComments: options.sourceComments,
    sourceMap: options.sourceMap
  }
}

SassCompiler.prototype.read = function (readTree) {
  var self = this
  quickTemp.makeOrRemake(this, '_tmpDestDir')
  var destFile = this._tmpDestDir + '/' + this.outputFile
  mkdirp.sync(path.dirname(destFile))
  return mapSeries(this.sourceTrees, readTree)
    .then(function (includePaths) {
      var sassOptions = {
        file: includePathSearcher.findFileSync(self.inputFile, includePaths),
        includePaths: includePaths
      }
      _.merge(sassOptions, self.sassOptions)
      var css = sass.renderSync(sassOptions)
      fs.writeFileSync(destFile, css, { encoding: 'utf8' })
      return self._tmpDestDir
    })
}

SassCompiler.prototype.cleanup = function () {
  quickTemp.remove(this, '_tmpDestDir')
}
