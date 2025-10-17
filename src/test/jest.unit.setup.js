// Unit test setup - no database or AWS connection needed
// Just set timeout for tests
jest.setTimeout(30 * 1000); // 30 seconds is enough for unit tests

// Mock console methods to reduce noise in test output (optional)
global.console = {
    ...console,
    // Uncomment to suppress console.log in tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
