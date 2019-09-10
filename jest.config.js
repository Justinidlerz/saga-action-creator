module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!**/node_modules/**",
    "!**/build/**"
  ],
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/tests/**/*.spec.ts'
  ],
  testURL: 'http://localhost/',
  testEnvironmentOptions: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
  }
};
