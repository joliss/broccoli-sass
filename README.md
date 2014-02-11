# broccoli-sass

**Work in progress. Not usable yet.**

The `SassCompiler` processes `.scss` files with
[libsass](https://github.com/hcatlin/libsass).

## Usage

```js
var SassCompiler = require('broccoli-sass')(broccoli);
compilerCollection.addCompiler(new SassCompiler({
  inputFile: '/todomvc/application.scss',
  outputFile: '/assets/application.css'
})
```
