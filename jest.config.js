// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const path = require('path');

module.exports = {
  verbose: true,
  rootDir: path.resolve(__dirname, '.'),
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(spec|test)\\.(ts|js)x?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/examples/',
    '<rootDir>/src/generated/'
  ],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js']
};
