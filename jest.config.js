module.exports = {
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$'
  ],
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**'],
  resetMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    "<rootDir>/src/setup-tests.ts",
  ],
}
