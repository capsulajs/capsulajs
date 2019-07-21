#!/usr/bin/env node

const cmd = require('./cmd').cmd;
const { runSync } = require('./run');
const fs = require('fs');
const path = require('path');

function findConfig(cfgName) {
  if (fs.existsSync(cfgName)) {
    const SEPARATOR = process.platform === 'win32' ? ';' : ':';
    // tslint:disable-next-line:no-console
    console.log(`config found: ${cfgName}`);
    // eslint-disable-next-line
    const config = require(cfgName);
    config.path = path.dirname(cfgName);
    process.env.PATH = path.resolve(config.path, './node_modules/.bin') + SEPARATOR + process.env.PATH;
    return config;
  }
  const next = path.join(path.dirname(cfgName), '../capsularc.js');
  if (next === cfgName) {
    return {};
  } else {
    return findConfig(next);
  }
}

function getPackages(config) {
  if (config.packages) {
    return fs
      .readdirSync(path.join(config.path, config.packages))
      .map((i) => path.resolve(path.join(config.path, config.packages, i)));
  }
  return runSync('lerna --sort exec pwd')
    .toString()
    .split('\n')
    .filter((i) => i !== '' && fs.lstatSync(path.resolve(i)).isDirectory());
}

function start() {
  if (!process.argv[2] || !process.argv[3]) {
    // tslint:disable-next-line:no-console
    console.error('usage: capsula cmd [command] [args]');
    process.exit(1);
  }
  if (process.argv[2] !== 'cmd') {
    // tslint:disable-next-line:no-console
    console.error(`${process.argv[2]} not supported; usage: capsula cmd [command] [args]`);
    process.exit(1);
  }

  const config = findConfig(path.join(process.cwd(), 'capsularc.js'));
  const packages = getPackages(config);

  cmd(process.argv.slice(3).join(' '), config, packages);
}
if (!process.env.CAPSULA_SKIP_CLI_START) {
  start();
}
module.exports = { start };
