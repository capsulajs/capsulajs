module.exports = {
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
