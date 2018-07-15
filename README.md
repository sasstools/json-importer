[![Build Status](https://travis-ci.org/sasstools/json-importer.svg?branch=master)](https://travis-ci.org/sasstools/json-importer)

# json-importer

>Node Sass importer for for importing JSON files as maps

## Disclaimer

This is ALPHA software.

It's messy. It's probably slow. It's probably buggy.

Give it a shot. File bugs. Be patient.

## Support

- Node >= 6
- node-sass >= 4.9.0

## Install

This package has a peer dependency on Node Sass for ensure import API compatibility.

```sh
npm install @node-sass/json-importer node-sass
```

## Usage

Create a JSON file you want to import.
```json
// config.json
{
  "colors": {
    "red": "#f00",
    "blue": "#00f"
  },
  "sizes": ["16px", "20px", "24px"],
}
```

When Node Sass parses an `@import` for a `.json` URL it will try load the file from disk. If found the JSON object will be imported as a Sass map named after the `.json` file.

```scss
@import "config.json";

$colors: map-get($config, "colors");
$sizes: map-get($config, "sizes");

.button {
  color: map-get($colors, "red");
  size: nth($sizes, 2);
}
```

Produces the following CSS output

```css
.button {
  color: "#f00";
  size: "medium";
}
```

### Node Sass API

```js
var sass = require('node-sass');
var jsonImporter = require('@node-sass/json-importer');

sass.render({
  file: 'index.scss',
  importer: [jsonImporter],
}, function (err, result) {
  if (err) throw err;
  console.log(result.css.toString());
});
```

### Node Sass CLI

```sh
$ node-sass index.scss --importer node_modules/@node-sass/json-importer/index.js
```

## Caveats

### Everything is a String

Sass has many types. `Number` which represent CSS numbers values with optional unit like `16px`. `Color` which represents CSS colour values like `red`, or `#f00`. These are structurally different from `String` like `"hello"`, `"16px"`, `"red"`, or `"#f00`.

To reduce complexity the values produced by this importer are always `String`. As a result you may need to `unquote()` the values to cast them into their intended types if for example you wanted to do math on them.

## Alternatives

- [node-sass-json-importer][]


[node-sass-json-importer]: https://github.com/Updater/node-sass-json-importer/pull/70/files
