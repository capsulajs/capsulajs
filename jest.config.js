module.exports = {
  setupFiles: [],
  transform: {
    '\\.ts$': 'ts-jest',
  },
  testRegex: '.*\\.test\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['src', 'node_modules'],
  testEnvironment: 'node',
};
