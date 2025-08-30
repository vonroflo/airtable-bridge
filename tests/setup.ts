// Global test setup
(global as any).beforeAll(async () => {
  // Set test environment
  process.env['NODE_ENV'] = 'test';
  process.env['DATABASE_URL'] = 'postgresql://postgres:password@localhost:5432/airtable_bridge_test';
  process.env['REDIS_URL'] = 'redis://localhost:6379/1'; // Use database 1 for tests
});

// Global test teardown
(global as any).afterAll(async () => {
  // Clean up any global resources
});

// Mock console methods to reduce noise in tests
(global as any).console = {
  ...console,
  log: (global as any).jest.fn(),
  debug: (global as any).jest.fn(),
  info: (global as any).jest.fn(),
  warn: (global as any).jest.fn(),
  error: (global as any).jest.fn(),
};
