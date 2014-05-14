# broccoli-sass

The broccoli-sass plugin compiles `.scss` files with
[libsass](https://github.com/hcatlin/libsass).

## Installation

```bash
npm install --save-dev broccoli-sass
```

## Usage

```js
var compileSass = require('broccoli-sass');

var outputTree = compileSass(inputTrees, inputFile, outputFile, options);
```

* **`inputTrees`**: An array of trees that act as the include paths for
  libsass. If you have a single tree, pass `[tree]`.

* **`inputFile`**: Relative path of the main `.scss` file to compile. This
  file must exist in one of the `inputTrees`.

* **`outputFile`**: Relative path of the output CSS file.

* **`options`**: A hash of options for `node-sass`. 
  See [the docs](https://github.com/andrew/node-sass)
  for more info about available options. The
  `file`, `data`, `success` and `error` options are not supported.

### Example

```js
var appCss = compileSass(sourceTrees, 'myapp/app.scss', 'assets/app.css');
```
