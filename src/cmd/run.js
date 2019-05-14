'use strict';

const path = require('path');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

function getEnv(cwd) {
  const SEPARATOR = process.platform === 'win32' ? ';' : ':';
  const env = Object.assign({}, process.env);

  env.CWD = env.PWD = cwd;
  env.PATH = path.resolve(cwd, './node_modules/.bin') + SEPARATOR + env.PATH;
  return env;
}

function run(cmd, cwd = process.cwd()) {
  let exitCode = 0;
  exec(
    cmd,
    {
      cwd,
      env: getEnv(cwd),
      shell: '/bin/bash',
    },
    (error, std, stdErr) => {
      // tslint:disable-next-line:no-console
      console.log(`command finished\ncommand: ${cmd}\npath: ${cwd}`);
      if (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
      }
      if (stdErr) {
        // tslint:disable-next-line:no-console
        console.error(stdErr);
      }
      // tslint:disable-next-line:no-console
      console.log(std);
      if (exitCode !== 0) {
        // tslint:disable-next-line:no-console
        console.error(`exit with status ${exitCode}`);
        process.exit(exitCode);
      }
    }
  ).on('exit', (code) => {
    exitCode = code;
  });
}

function runSync(cmd, cwd = process.cwd()) {
  return execSync(cmd, {
    cwd,
    env: getEnv(cwd),
    shell: true,
  });
}

module.exports = { run, runSync };
