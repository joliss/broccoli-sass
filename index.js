var fs = require('fs');
var path = require('path');
var RSVP = require('rsvp');
var mkdirp = RSVP.denodeify(require('mkdirp'));
var writeFile = RSVP.denodeify(fs.writeFile);
var sass = require('node-sass');
var extend = require('extend');
var broccoli = require('broccoli');
var Transform = require('broccoli-transform');

module.exports = SassCompiler;

SassCompiler.prototype = Object.create(Transform.prototype);
SassCompiler.prototype.constructor = SassCompiler;

function SassCompiler(inputTree, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(inputTree, options);
  Transform.call(this, inputTree);
  this.options = extend({ inputFiles: ["**/*.scss"] }, options);
}

SassCompiler.prototype.transform = function (srcDir, destDir) {
  var that = this;
  var paths = (that.options.includePaths || []).concat(srcDir);
  var files = broccoli.helpers.multiGlob(that.options.inputFiles , { cwd: srcDir });
  var compiledFiles = files.map(function(file) {
    if(!file.match(/(\/|^)_[^\/]+$/)) {
      return new RSVP.Promise(function(resolve, reject) {
        sass.render(extend({}, that.options, {
          file: file,
          success: resolve,
          error: reject,
          includePaths: paths
        }));
      }).then(function(css) {
        var outputFile = path.join(destDir, file.replace(/scss$/, "css"));
        return mkdirp(path.dirname(outputFile)).then(function() {
          return writeFile(outputFile, css);
        });
      });
    }
  });
  return RSVP.all(compiledFiles);
};
