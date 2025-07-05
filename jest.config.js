module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/__tests__/**", "!src/__mocks__/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
