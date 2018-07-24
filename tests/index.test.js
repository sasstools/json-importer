const path = require('path');
const sass = require('node-sass');
const importer = require('../');

const generate = (file) => `
@import "${file}";
output { contents: inspect($${path.basename(file, '.json')}) }
`;

const compile = function(data, options = {}) {
  return new Promise((yeah, nah) => {
    return sass.render(
      Object.assign({ data, importer }, options),
      (err, results) => err ? nah(err) : yeah(results.css.toString()),
    );
  });
}

const compileSync = function(data, options = {}) {
  return new Promise((yeah, nah) => {
    try {
      const results = sass.renderSync(Object.assign({ data, importer }, options));
      yeah(results.css.toString());
    } catch (err) {
      nah(err);
    }
  });
}

describe('json-importer', () => {
  [[ 'async', compile ], [ 'sync', compileSync ]].forEach(([ label, func ]) => {
    describe(label, () => {
      it('should resolve flat json strings as Sass map', () => (
        func(generate('tests/fixtures/flat.json'))
          .then(result => expect(result).toMatchSnapshot())
      ));
      it('should resolve nested json strings as Sass map', () => (
        func(generate('tests/fixtures/nested.json'))
          .then(result => expect(result).toMatchSnapshot())
      ));
      it('should resolve json array values as Sass lists', () => (
        func(generate('tests/fixtures/list.json'))
          .then(result => expect(result).toMatchSnapshot())
      ));
      it('should not resolve Sass values to quoted strings', () => (
        func(generate('tests/fixtures/values.json'))
          .then(result => expect(result).toMatchSnapshot())
      ));
      it('should resolve json files in includePaths', () => (
        func(generate('fixtures/flat.json'), { includePaths: ['tests']})
          .then(result => expect(result).toMatchSnapshot())
      ));
    });
  });
});
