/*global jest*/
const fs = require('fs');
const base = require('path').resolve(__dirname, '../');
const path = require('path');

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
  describe.each([['fixture'], ['lerna']])('testing %j', (fixture) => {
    process.chdir(`${base}/tests/${fixture}`);

    if (!fs.existsSync('./node_modules/.bin/cmd')) {
      if (!fs.existsSync('./node_modules')) {
        fs.mkdirSync('./node_modules');
      }
      if (!fs.existsSync('./node_modules/.bin')) {
        fs.mkdirSync('./node_modules/.bin');
      }
      try {
        fs.symlinkSync(path.resolve('../../src/cli.js'), path.resolve('./node_modules/.bin/capsula'));
      } catch (e) {
      }
    }
    it('cmd should be found', (done) => {
      expect.assertions(1);
      const run = require('../src/run');

      process.chdir(`${base}/tests/${fixture}`);
      expect(() => run.runSync('capsula')).toThrowError(
        'Command failed: capsula\nusage: capsula cmd [command] [args]\n'
      );

      done();
    });
    it('When cmd contain capsula cmd should run properly', () => {
      expect.assertions(1);
      const run = require('../src/run');

      process.chdir(`${base}/tests/${fixture}`);
      expect(run.runSync('capsula cmd do').toString()).toMatch('uniqe string qwer1234');
    });
    it('should exit with error code if different from 0', () => {
      expect.assertions(1);
      const run = require('../src/run');

      process.chdir(`${base}/tests/${fixture}`);
      expect(() => run.runSync('capsula cmd failed')).toThrowError('exit with status 1');
    });
  });
});
