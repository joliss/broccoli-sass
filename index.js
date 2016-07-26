var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var CachingWriter = require('broccoli-caching-writer')
var sass = require('node-sass')

module.exports = SassCompiler
SassCompiler.prototype = Object.create(CachingWriter.prototype)
SassCompiler.prototype.constructor = SassCompiler
function SassCompiler (inputNodes, inputFile, outputFile, options, sassOptions) {
  if (options == null) options = {}
  if (sassOptions == null) sassOptions = {}
  if (!(this instanceof SassCompiler)) return new SassCompiler(inputNodes, inputFile, outputFile, options, sassOptions)
  if (!Array.isArray(inputNodes)) throw new Error('Expected array for first argument - did you mean [node] instead of node?')

  CachingWriter.call(this, inputNodes, {
    annotation: options.annotation
  })

  this.inputFile = inputFile
  this.outputFile = outputFile
  this.options = options
  this.sassOptions = sassOptions
}


SassCompiler.prototype.build = function() {
  var destFile = path.join(this.outputPath, this.outputFile)
  mkdirp.sync(path.dirname(destFile))
  
  if (this.options.imagePath || 
      this.options.outputStyle || 
      this.options.precision || 
      this.options.sourceComments) {
        console.warn("Use the fifth argument for sassOptions")
      }

  var resolvedSassOptions = Object.assign({
    file: path.join(this.inputPaths[0], this.inputFile),
    includePaths: this.inputPaths,

    // backwards compatibility
    imagePath: this.options.imagePath,
    outputStyle: this.options.outputStyle,
    precision: this.options.precision,
    sourceComments: this.options.sourceComments,
  }, sassOptions);

  result = sass.renderSync(resolvedSassOptions)
  fs.writeFileSync(destFile, result.css)
}
