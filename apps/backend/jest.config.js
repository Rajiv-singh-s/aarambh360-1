/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '(src/.*\\.spec\\.ts$|prisma/seeds/.*\\.spec\\.ts$|test/.*\\.e2e-spec\\.ts$)',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', 'prisma/seeds/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
