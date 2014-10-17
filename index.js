var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var CachingWriter = require('broccoli-caching-writer')
var sass = require('node-sass')
var _ = require('lodash')
var Promise = require('rsvp').Promise

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
    sourceMap: options.sourceMap,
    precision: options.precision
  }
}

SassCompiler.prototype.updateCache = function(includePaths, destDir) {
  var self = this

  return new Promise(function(resolve, reject) {
    var destFile = path.join(destDir, self.outputFile)
    mkdirp.sync(path.dirname(destFile))

    var sassOptions = {
      file: includePathSearcher.findFileSync(self.inputFile, includePaths),
      includePaths: includePaths,
      outFile: destFile,
      success: function() {
        if (!isAbsolutePath(self.sassOptions.sourceMap)) {
          // node-sass uses a relative path for sourceMappingURL that breaks
          // when the file is moved from broccoli's temporary directory
          self.fixSourceMappingURL(destFile);
        }
        resolve()
      },
      error: function(err) {
        reject(err)
      }
    }
    _.merge(sassOptions, self.sassOptions)
    sass.renderFile(sassOptions)
  })
}

SassCompiler.prototype.fixSourceMappingURL = function(destFile) {
  var css = String(fs.readFileSync(destFile));
  css = css.replace(
    new RegExp('/\\*# sourceMappingURL=.* \\*/'),
    '/*# sourceMappingURL=' + this.sassOptions.sourceMap + ' */'
  );
  fs.writeFileSync(destFile, css);
};

function isAbsolutePath(file) {
  return path.resolve(file) === path.normalize(file).replace(RegExp(path.sep+'$'), '');
}
