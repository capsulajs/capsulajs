const find = require('find');
const { exec } = require('child_process');
const path = require('path');

const commandCallback = (error, stdout, stderr) => {
  if (stderr !== null) {
    console.log('' + stderr);
  }
  if (stdout !== null) {
    console.log('' + stdout);
  }
  if (error !== null) {
    console.log('' + error);
  }
  console.log('FINISHED');
};

const findProjects = (directory) => {
  return find.fileSync(/package.json/, directory)
    .filter(file => !file.match('node_modules'))
    .map((file, i) => {
      const prjPath = file.split('package.json')[0];
      const name = prjPath.split(path.sep);
      return {
        path: prjPath,
        name: name[name.length - 2],
        port: 8580 + i,
      };
    });
};

const proxyOptions = (port, name) => {
  const url = `^/${name}`;
  return {
    target: `http://localhost:${port}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      [url] : '/',
    },
  }
};

module.exports = { findProjects, proxyOptions, commandCallback };
