/** @type {import("jest").Config} */
const config = {
  preset:          "ts-jest",
  testEnvironment: "node",
  rootDir:         ".",
  testMatch:       ["<rootDir>/src/__tests__/**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        strict:           false,
        esModuleInterop:  true,
        allowSyntheticDefaultImports: true,
      },
      diagnostics: false,
    }],
  },
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageReporters: ["text", "text-summary"],
  testTimeout: 10_000,
  verbose:     true,
};

module.exports = config;
