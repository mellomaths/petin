/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  testPathIgnorePatterns: ["dist"],
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "node_modules",
    "test-config",
    "interfaces",
    "jestGlobalMocks.ts",
    ".module.ts",
    "<rootDir>/src/app/main.ts",
    ".mock.ts",
  ],
  coverageDirectory: "<rootDir>/coverage/",
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 50,
      statements: 50,
    },
  }
};
