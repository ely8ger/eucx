import type { Config } from "jest";

const config: Config = {
  preset:              "ts-jest",
  testEnvironment:     "node",
  rootDir:             ".",
  testMatch:           ["**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "./tsconfig.json",
    }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!**/*.d.ts",
  ],
  coverageThresholds: {
    global: {
      branches:   70,
      functions:  80,
      lines:      80,
      statements: 80,
    },
  },
  coverageReporters: ["text", "text-summary", "lcov"],
  setupFilesAfterFramework: [],
  testTimeout: 15_000,   // 15s — für DB-Tests
  verbose: true,
};

export default config;
