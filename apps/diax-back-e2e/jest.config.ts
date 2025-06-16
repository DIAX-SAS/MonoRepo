import type { Config } from 'jest';
const config: Config = {
  displayName: 'diax-back-e2e',
  preset: '../../jest.preset.js',
  setupFiles: ['<rootDir>/src/support/test-setup.ts', "dotenv/config"],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/diax-back-e2e',
};
export default config;
