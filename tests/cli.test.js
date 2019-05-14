/*global jest*/
const fs = require('fs');
const base = require('path').resolve(__dirname, '../');

/**
 * NOTE
 * In case you are wandering why cli and capsula are two suites
 * The test not working in the suite
 *
 * cli suit running capsula as bash command
 * Why run as bash? Can`t do it in another way
 * capsula running capsula as node js require
 * Why to run as node js require - easy for debug
 *
 */

describe('Capsula cli test suite 1', () => {
  describe.each([['fixture'], ['lerna']])('testing fixtures', (fixture) => {
    process.chdir(`${base}/tests/${fixture}`);

    if (!fs.existsSync('./node_modules/.bin/cmd')) {
      if (!fs.existsSync('./node_modules')) {
        fs.mkdirSync('./node_modules');
      }
      if (!fs.existsSync('./node_modules/.bin')) {
        fs.mkdirSync('./node_modules/.bin');
      }
      fs.symlinkSync('../src/cmd/cli.js', './node_modules/.bin/cmd');
    }
    it('capsula should be found', (done) => {
      expect.assertions(1);
      const run = require('../src/cmd/run');

      process.chdir(`${base}/tests/${fixture}`);
      expect(() => run.runSync('capsula')).toThrowError(
        'Command failed: capsula\nusage: capsula cmd [command] [args]\n'
      );

      done();
    });
    it('When cmd contain capsula cmd should run properly', () => {
      expect.assertions(1);
      const run = require('../src/cmd/run');

      process.chdir(`${base}/tests/${fixture}`);
      expect(run.runSync('capsula cmd do').toString()).toMatch('uniqe string qwer1234');
    });
    it('should exit with error code if different from 0', () => {
      expect.assertions(1);
      const run = require('../src/cmd/run');

      process.chdir(`${base}/tests/${fixture}`);
      expect(() => run.runSync('capsula cmd failed')).toThrowError('exit with status 1');
    });
  });
});
