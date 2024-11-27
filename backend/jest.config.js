/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['dist/', 'node_modules/', '.docker/', 'coverage/', 'bruno/', 'uploads/'],
  modulePathIgnorePatterns: ['dist/', 'node_modules/', '.docker/', 'coverage/', 'bruno/', 'uploads/'],
  watchPathIgnorePatterns: ['dist/', 'node_modules/', '.docker/', 'coverage/', 'bruno/', 'uploads/'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 90
    }
  }
};