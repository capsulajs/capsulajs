/**
 * This utility meant to run command on desire package according to template
 */
'use strict';

const path = require('path');
const { run } = require('./run');

function pathToPackage(pkgPath) {
  return require(path.join(pkgPath, 'package.json'));
}

function runCmd(command, cmds, log, commandPath) {
  if (cmds && cmds[command]) {
    // tslint:disable-next-line:no-console
    console.log(`start command "${cmds[command]}"\n ${log}`);
    process.chdir(commandPath);
    run(cmds[command], commandPath);
    return false;
  }
  return true;
}

function getTemplateCommands(config, pkg) {
  const template = (pkg.capsula && pkg.capsula.template) || 'default';
  return config[template].scripts;
}

function cmd(command, config, packages) {
  packages
    .map((commandPath) => ({
      cwd: commandPath,
      package: pathToPackage(commandPath),
    }))
    .filter((command1) => config.path === process.cwd() || command1.cwd === process.cwd())
    .filter((command2) => typeof command2.package !== 'undefined')
    .filter((command3) =>
      runCmd(command, command3.package.scripts, `local command\n package: ${command3.package.name}\n`, command3.cwd)
    )
    .filter((command4) =>
      runCmd(
        command,
        getTemplateCommands(config, command4.package),
        `template command\n package: ${command4.package.name}\n`,
        command4.cwd
      )
    );
}

module.exports = { cmd };
