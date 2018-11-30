const fs = require('fs');
const path = require('path');

const exists = (file) => {
  try {
    fs.accessSync(file, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

const buildSassValue = (value) => {
  if (Array.isArray(value)) {
    return `(${value.reduce((prev, cur) => prev + `"${cur}",`, '')})`;
  }
  if (typeof value === "object") {
    return `(${buildSassMap(value)})`;
  }
  return `"${value}"`;
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

  if (path.extname(url) !== '.json') return done(null);
  const name = path.basename(url, '.json')
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
