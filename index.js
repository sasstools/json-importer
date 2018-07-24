const fs = require('fs');
const path = require('path');
const csscolors = require('css-color-names');

const exists = (file) => {
  try {
    fs.accessSync(file, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

const reValue = new RegExp([
  // ---- hex colors
  '^#[0-9a-z]{3}$',                       // #def
  '^#[0-9a-z]{4}$',                       // #def0
  '^#[0-9a-z]{6}$',                       // #ddeeff
  '^#[0-9a-z]{8}$',                       // #ddeeff00
  // ---- numbers
  '^[0-9]+(?:\\.[0-9]+)?(?:%|[a-z]+)?$',  // 12.34 + unit
  // ---- function calls
  '^[a-z][a-z0-9-_]*\\(',                 // foo(...)
].join('|'), 'i');

const looksLikeString = (value) => {
  return !reValue.test(value) || csscolors[value];
}

const buildSassValue = (value) => {
  if (Array.isArray(value)) {
    return `(${value.reduce((prev, cur) => prev + `${buildSassValue(cur)},`, '')})`;
  }
  if (typeof value === "object") {
    return `(${buildSassMap(value)})`;
  }
  if (looksLikeString(value)) {
    return `"${value}"`;
  }
  return value;
}

const buildSassMap = (json) => {
  return Object.keys(json).reduce((prev, cur) => {
    return prev + `"${cur}": ${buildSassValue(json[cur])},`;
  }, '');
}

const end = (done) => (value) => {
  return done ? done(value) : value;
}

module.exports = function(url, prev, done) {
  done = end(done);
  if (!url) return done(null);

  const parts = url.split('/');
  const name = path.basename(parts.pop(), '.json');
  const cwd = process.cwd();


  const includePaths = this.options.includePaths.split(':')
    .map(p => path.resolve(cwd, p));

  try {
    let resolved = path.join(cwd, url);
    if (exists(resolved)) {
      var json = require(resolved);
    } else {
      for (let i = 0; i < includePaths.length; i++ ) {
        resolved = path.join(includePaths[i], url);

        if (exists(resolved)) {
          var json = require(resolved);
        }
      }
    }
  } catch(err) {
    return done(err);
  }

  if (json) {
    return done({ contents: `$${name}: (${buildSassMap(json)});` });
  }

  return done(null);
};
