module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.js'],
    collectCoverage: true,
    collectCoverageFrom: [
      "src/**/*.{ts,js}",
      "!src/**/*.d.ts",  // Exclude type definition files
      "!src/**/swagger.{ts,js}",  // Exclude swagger config file
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    coverageDirectory: "coverage",
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    testMatch: ['**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleNameMapper: {
      '^@src/(.*)$': '<rootDir>/src/$1',
    },
  };
  