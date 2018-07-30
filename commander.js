#!/usr/bin/env node
// @flow
import program from 'commander';
import { exec }from 'child_process';
import { existsSync } from 'fs';
import { Capsula } from './capsula';

const capsula = new Capsula();

program
  .version('0.0.1')
  .command('run <directory>')
  .description('Run all projects inside the specified directory')
  .action(dir => existsSync(dir) ? capsula.run(dir) : console.log('Directory doesn\'t exist'));

program.parse(process.argv);