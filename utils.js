// @flow
import find from 'find';
import { readFileSync } from 'fs';
import { Project } from "./api/types";

export const commandCallback = (error: string, stdout: string, stderr: string) => {
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

/**
 * Return a list of project within a specific directory
 * @param directory
 * @returns Project[]
 */
export const findProjects = (directory: string): Project[] => {
  return find.fileSync(/package.json/, directory)
    .filter(file => !file.match('node_modules'))
    .map((file, i) => {
      const { name } = JSON.parse(readFileSync(file));
      const prjPath = file.split('package.json')[0];
      return {
        name: name || `project${i}`,
        path: prjPath,
        port: 8580 + i,
      };
    });
};

/**
 * Provide options object that will be used to create a proxy for a specific project
 * @param project
 * @returns needed options to create a proxy
 */
export const proxyOptions = (project: Project) => {
  const { name, port } = project;
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
