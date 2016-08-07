var path = require('path');
var mkdirp = require('mkdirp');
var includePathSearcher = require('include-path-searcher');
var CachingWriter = require('broccoli-caching-writer');
var nodeSass = require('node-sass');
var assign = require('object-assign');
var rsvp = require('rsvp');
var Promise = rsvp.Promise;
var fs = require('fs');
var writeFile = rsvp.denodeify(fs.writeFile);

module.exports = SassCompiler;
SassCompiler.prototype = Object.create(CachingWriter.prototype);
SassCompiler.prototype.constructor = SassCompiler;

function SassCompiler (inputNodes, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) { return new SassCompiler(inputNodes, inputFile, outputFile, options); }
  if (!Array.isArray(inputNodes)) { throw new Error('Expected array for first argument - did you mean [tree] instead of tree?'); }

  CachingWriter.call(this, inputNodes, {
    annotation: options.annotation,
    cacheInclude: options.cacheInclude,
    cacheExclude: options.cacheExclude
  });

  this.inputFile = inputFile;
  this.outputFile = outputFile;
  options = options || {};
  this.options = {
    nodeSass: options.nodeSass
  };

  var sass = this.options.nodeSass || nodeSass;

  this.renderSass = rsvp.denodeify(sass.render);

  this.sassOptions = {
    importer: options.importer,
    functions: options.functions,
    indentedSyntax: options.indentedSyntax,
    omitSourceMapUrl: options.omitSourceMapUrl,
    outputStyle: options.outputStyle,
    precision: options.precision,
    sourceComments: options.sourceComments,
    sourceMap: options.sourceMap,
    sourceMapEmbed: options.sourceMapEmbed,
    sourceMapContents: options.sourceMapContents,
    sourceMapRoot: options.sourceMapRoot
  };
}

SassCompiler.prototype.build = function() {
  var destFile = path.join(this.outputPath, this.outputFile);
  var sourceMapFile = this.sassOptions.sourceMap;

  if (typeof sourceMapFile !== 'string') {
    sourceMapFile = destFile + '.map';
  }

  mkdirp.sync(path.dirname(destFile));

  var sassOptions = {
    file: includePathSearcher.findFileSync(this.inputFile, this.inputPaths),
    includePaths: this.inputPaths,
    outFile: destFile
  };

  assign(sassOptions, this.sassOptions);

  return this.renderSass(sassOptions).then(function(result) {
    var files = [
      writeFile(destFile, result.css)
    ];

    if (this.sassOptions.sourceMap && !this.sassOptions.sourceMapEmbed) {
      files.push(writeFile(sourceMapFile, result.map));
    }

    return Promise.all(files);
  }.bind(this));
};
