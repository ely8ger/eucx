import type { Config } from "jest";

const config: Config = {
  preset:          "ts-jest",
  testEnvironment: "node",
  rootDir:         ".",
  testMatch:       ["src/__tests__/**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$":    "<rootDir>/src/$1",
    "^decimal.js$": "<rootDir>/node_modules/decimal.js/decimal.js",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "./tsconfig.json",
      diagnostics: false,
    }],
  },
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageReporters: ["text", "text-summary"],
  testTimeout: 10_000,
  verbose: true,
};

export default config;
