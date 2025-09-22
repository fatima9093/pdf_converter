// Jest setup file for backend tests

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  // Uncomment to hide logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = 'file:./test.db';

// Set test timeout
jest.setTimeout(10000);

// Clean up after tests
afterAll(async () => {
  // Add any cleanup logic here if needed
});
