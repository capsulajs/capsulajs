module.exports = {
  packages: 'packages',
  default: {
    scripts: {
      pwd: 'basename $(pwd)',
    },
  },
  myTemplate: {
    scripts: {
      pwd: 'echo myTemplate `basename $(pwd)`',
    },
  },
};
