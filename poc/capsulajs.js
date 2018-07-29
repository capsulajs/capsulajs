#!/usr/bin/env node

const program = require('commander');
const { exec } = require('child_process');
const express = require('express');
const proxy = require('http-proxy-middleware');
const { findProjects, proxyOptions, commandCallback } = require('./utils');

program
  .version('0.0.1')
  .option('i, --install ', 'install packages')
  .parse(process.argv);

if (program.install) {

  const projects = findProjects('projects');
  console.log(projects);

  projects.forEach(({ name, path, port}) => {
    const commands = [
      `cd ${path}`,
      `yarn install`,
      `http-server -p ${port}`,
    ];

    exec(commands.join(' && '), commandCallback);
  });

  const app = express();

  projects.forEach(({ name, path, port}) => {
    const options = proxyOptions(port, name);
    const newProxy = proxy(options);
    app.use(`/${name}`, newProxy);
  });

  app.listen(3000);
}
