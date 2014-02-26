# broccoli-sass

The `SassCompiler` processes `.scss` files with [libsass](https://github.com/hcatlin/libsass).

## Usage

```js
var compileSass = require('broccoli-sass');

compileSass(someTree, {
  inputFiles: ["**/*.scss"], // the default
  includePaths: ["some/extra/include/path"],
  outputStyle: "compressed"
})
```
