var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var CachingWriter = require('broccoli-caching-writer')
var sass = require('node-sass')
var _ = require('lodash')

module.exports = SassCompiler
SassCompiler.prototype = Object.create(CachingWriter.prototype)
SassCompiler.prototype.constructor = SassCompiler
function SassCompiler (inputTrees, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(inputTrees, inputFile, outputFile, options)
  if (!Array.isArray(inputTrees)) throw new Error('Expected array for first argument - did you mean [tree] instead of tree?')

  CachingWriter.call(this, inputTrees, options)

  this.inputFile = inputFile
  this.outputFile = outputFile
  options = options || {}
  this.sassOptions = {
    imagePath: options.imagePath,
    outputStyle: options.outputStyle,
    sourceComments: options.sourceComments,
    precision: options.precision
  }
}


SassCompiler.prototype.updateCache = function(includePaths, destDir) {
  var self = this

  var destFile = path.join(destDir, self.outputFile)
  mkdirp.sync(path.dirname(destFile))

  var sassOptions = {
    file: includePathSearcher.findFileSync(self.inputFile, includePaths),
    includePaths: includePaths,
  }
  _.merge(sassOptions, self.sassOptions)
  result = sass.renderSync(sassOptions)
  // libsass emits `@charset "UTF-8";`, so we must encode with UTF-8; see also
  // https://github.com/sass/node-sass/issues/711
  fs.writeFileSync(destFile, result.css, { encoding: 'utf8' })
}
