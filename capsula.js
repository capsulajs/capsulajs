//@flow
import { CapsulaJS } from "./api/CapsulaJS";
import { commandCallback, findProjects, proxyOptions } from "./utils";
import express from "express";
import { exec }from 'child_process';
import proxy from "http-proxy-middleware";

export class Capsula implements CapsulaJS {
  run(directory) {
    const projects = findProjects(directory);
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

    projects.forEach((project) => {
      const options = proxyOptions(project);
      const newProxy = proxy(options);
      app.use(`/${project.name}`, newProxy);
    });

    app.listen(3000);
  }
}
