# broccoli-sass

[![Build Status](https://travis-ci.org/joliss/broccoli-sass.svg?branch=master)](https://travis-ci.org/joliss/broccoli-sass)

The broccoli-sass plugin compiles `.scss` and `.sass` files with
[libsass](https://github.com/hcatlin/libsass).

## Installation

```bash
npm install --save-dev broccoli-sass
```

## Usage

```js
var BroccoliSass = require('broccoli-sass');

var outputNode = new BroccoliSass(inputNodes, inputFile, outputFile, options);
```

* **`inputNodes`**: An array of nodes that act as the include paths for
  libsass. If you have a single node, pass `[node]`.

* **`inputFile`**: Relative path of the main `.scss` or `.sass` file to compile.
  Broccoli-sass expects to find this file in the *first* input node
  (`inputNodes[0]`).

* **`outputFile`**: Relative path of the output CSS file.

* **`options`**: A hash of options for libsass. Supported options are
  `imagePath`, `outputStyle`, `precision`, and `sourceComments`.

* **`annotation`**: A human-readable description, to tell multiple instances of
  this plugin apart.

### Example

```js
var appCss = new BroccoliSass(['styles', 'vendor'], 'myapp/app.scss', 'assets/app.css');
```

This will compile `styles/myapp/app.scss` with `vendor` as an additional load
path. The `appCss` node will contain a single `assets` directory with
a large compiled `app.css` file in it.
