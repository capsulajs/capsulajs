/*global jest*/
const root = process.cwd();
const path = require('path');
process.env.CAPSULA_SKIP_CLI_START = true;
const capsula = require('../src/cmd/cli');
process.env.CAPSULA_SKIP_CLI_START = false;

process.chdir(path.resolve(__dirname, './fixture'));

/**
 * NOTE
 * In case you are wondering why cli and capsula are two suites
 * The test not working in the suite
 *
 * cli suit running capsula as bash command
 * Why run as bash? Can't do it in another way
 * capsula running capsula as node js require
 * Why to run as node js require - easy for debug
 *
 */

describe('Capsula test suite', () => {
  global.process.exit = jest.fn((c) => {
    throw Error(`exit with ${c}`);
  });
  it('command should run on all packages', (done) => {
    expect.assertions(3);

    process.argv = ['path', 'capsula', 'cmd', 'pwd'];
    const log = jest.spyOn(global.console, 'log');
    capsula.start();

    setTimeout(() => {
      expect(log).toHaveBeenCalledWith('pkg1\n');
      expect(log).toHaveBeenCalledWith('myTemplate pkg2\n');
      expect(log).toHaveBeenCalledWith('custom pkg3\n');
      done();
    }, 2000);
  });
  it('command pipe with &&', (done) => {
    expect.assertions(1);

    process.argv = ['path', 'capsula', 'cmd', 'and'];
    const log = jest.spyOn(global.console, 'log');
    log.mockClear();
    process.chdir(path.join(root, 'tests/fixture'));
    capsula.start();

    setTimeout(() => {
      expect(log).toHaveBeenCalledWith('cmd1\ncmd2\n');
      done();
    }, 2000);
  });
  it('When in package dir, command should run only on package', (done) => {
    process.argv = ['path', 'capsula', 'cmd', 'pwd'];
    const log = jest.spyOn(global.console, 'log');
    log.mockClear();
    process.chdir(path.join(root, 'tests/fixture/packages/pkg1'));
    capsula.start();

    setTimeout(() => {
      expect(log).toHaveBeenCalledWith('pkg1\n');
      expect(log.mock.calls).not.toContain('pkg2\n');
      expect(log.mock.calls).not.toContain('custom pkg3\n');
      done();
    }, 2000);
  });
});
