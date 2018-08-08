#!/usr/bin/env node

var program = require('commander');

program.version('0.0.1', '-v, --version');
program.option('-s, --start', 'Capsula start...').action(function() { console.log('Capsula start...') });
program.option('-t, --test', 'Capsula test...').action(function() { console.log('Capsula start...') });
program.parse(process.argv);
