require('babel-register')({
  presets: ['env', 'flow']
});

module.exports = require('./commander');