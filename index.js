var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var Writer = require('broccoli-writer')
var mapSeries = require('promise-map-series')
var sass = require('node-sass')
var _ = require('lodash')
var rsvp = require('rsvp')


module.exports = SassCompiler
SassCompiler.prototype = Object.create(Writer.prototype)
SassCompiler.prototype.constructor = SassCompiler
function SassCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(sourceTrees, inputFile, outputFile, options)
  if (!Array.isArray(sourceTrees)) throw new Error('Expected array for first argument - did you mean [tree] instead of tree?')
  this.sourceTrees = sourceTrees
  this.inputFile = inputFile
  this.outputFile = outputFile
  options = options || {}

  console.log('SassCompiler: ' + options.sourceMap);
  console.log('SassCompiler.inputFile: ' + this.inputFile);
  console.log('SassCompiler.outputFile: ' + this.outputFile);

  this.sassOptions = {
    imagePath: options.imagePath,
    outputStyle: options.outputStyle,
    sourceComments: options.sourceComments,
    sourceMap: options.sourceMap
  }
}

SassCompiler.prototype.write = function (readTree, destDir) {
  var self = this

  var destFile = destDir + this.outputFile

  console.log('SassCompiler.write destDir' + destDir);
  console.log('SassCompiler.write this.outputFile' + this.outputFile);
  mkdirp.sync(path.dirname(destFile))
  return mapSeries(this.sourceTrees, readTree)
    .then(function (includePaths) {
      var inputFile = includePathSearcher.findFileSync(self.inputFile, includePaths),
          inputFileCopy = destDir+self.inputFile,
          sourceDir = includePaths[0];

      console.log('********************************************************');
      console.log('********************************************************');
      console.log('COMPILE SASS');
      console.log('********************************************************');
      console.log('********************************************************');

      console.log('self.inputFile  ' + self.inputFile);
      console.log('inputFile       ' + inputFile);
      console.log('inputFileCopy   ' + inputFileCopy);
      console.log('destDir         ' + destDir);
      console.log('destFile        ' + destFile);
      console.log('sourceDir       ' + sourceDir);


      console.log('********************************************************');
      var stats = {};
      var deferred = rsvp.defer();
      var sassOptions = {
        file: inputFile,
        includePaths: includePaths,
        outFile: destFile,
        success: function(css, map) {
          var keepUglyPaths = false; // could be made a config option

          var scssOutputDirInfix = 'scss'; // this could be made configurable


          for (var i = 0; i < stats.includedFiles.length; i++) {
            console.log('Import included .scss file');

            // the absolute filepath from which the file was imported
            var filePath = stats.includedFiles[i];

            // path relative to the current working directory
            var relativeFilePath = path.relative(process.cwd(), filePath);


            console.log('filePath               ' + filePath);
            console.log('relativeFilePath       ' + relativeFilePath);

            // this is where the file needs to be placed without the sourcemap being modified
            var originalFileDestination = path.dirname(destFile) + '/' +relativeFilePath;

            var fileDestination;
            if(keepUglyPaths) {
              fileDestination = originalFileDestination;
            } else {
              // if we want a nicer path we need to modify the sourcemap:

              // local path inside the destDir
              var localFilePath = path.relative(includePaths[0], relativeFilePath);
              console.log('localFilePath    ' + localFilePath);
              var patchedFileDestination = path.dirname(destFile) + '/' + scssOutputDirInfix + '/' + localFilePath;

              console.log('originalFileDestination:      ' + originalFileDestination);
              console.log('patchedFileDestination        ' + patchedFileDestination);

              fileDestination = patchedFileDestination;
            }

            console.log('fileDestination        ' + fileDestination);

            // copy file to destination
            mkdirp.sync(path.dirname(fileDestination));
            fs.writeFileSync(fileDestination, fs.readFileSync(filePath));

            console.log('********************************************************');
          }

          if(!keepUglyPaths)  {
            console.log('********************************************************');
            console.log('Patch sourceMap to use not so ugly filepaths!');
            console.log('css: ' + css);
            console.log('map: ' + map);
            var sourceMap = stats.sourceMap;
//                     console.log('sourceMap: ' + sourceMap);
            var relativeSourceDir = path.relative(process.cwd(), sourceDir);
            console.log('relativeSourceDir: ', relativeSourceDir);

            var regex = new RegExp(relativeSourceDir, "g");
            sourceMap = sourceMap.replace(regex, scssOutputDirInfix);

//                     console.log('sourceMap new: ' + sourceMap);
            fs.writeFileSync(map, sourceMap);

            console.log('********************************************************');
          }

            deferred.resolve();
          },
          stats: stats,
          error: function(err) {
            deferred.reject(err);
        }
      }
      _.merge(sassOptions, self.sassOptions)


      sass.renderFile(sassOptions)
      return deferred.promise;
    })
}
