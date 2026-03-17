/** @type {import("jest").Config} */
const config = {
  preset:          "ts-jest",
  testEnvironment: "node",
  rootDir:         ".",
  testMatch:       ["<rootDir>/src/**/*.spec.ts", "<rootDir>/test/**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        strict:                       false,
        esModuleInterop:              true,
        allowSyntheticDefaultImports: true,
        emitDecoratorMetadata:        true,
        experimentalDecorators:       true,
      },
      diagnostics: false,
    }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!**/*.d.ts",
  ],
  coverageThresholds: {
    global: { branches: 60, functions: 70, lines: 70, statements: 70 },
  },
  coverageReporters: ["text", "text-summary"],
  testTimeout:       15_000,
  verbose:           true,
};

module.exports = config;
