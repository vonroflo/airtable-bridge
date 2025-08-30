import { AirtableRateLimiter } from '../../../src/services/airtable/rateLimiter';

// Simple test to verify the class can be instantiated
describe('AirtableRateLimiter', () => {
  it('should be able to create an instance', () => {
    // Mock the dependencies
    const mockRedis = {
      eval: jest.fn(),
      llen: jest.fn(),
      hget: jest.fn(),
      del: jest.fn()
    } as any;

    const mockPrisma = {
      airtableBase: {
        findUnique: jest.fn()
      },
      apiMetric: {
        create: jest.fn(),
        findMany: jest.fn()
      }
    } as any;

    const rateLimiter = new AirtableRateLimiter(mockRedis, mockPrisma);
    
    expect(rateLimiter).toBeDefined();
    expect(typeof rateLimiter.acquireToken).toBe('function');
    expect(typeof rateLimiter.getQueueDepth).toBe('function');
    expect(typeof rateLimiter.getMetrics).toBe('function');
  });

  it('should have the expected interface', () => {
    const mockRedis = {} as any;
    const mockPrisma = {} as any;
    
    const rateLimiter = new AirtableRateLimiter(mockRedis, mockPrisma);
    
    // Check that all expected methods exist
    expect(rateLimiter).toHaveProperty('acquireToken');
    expect(rateLimiter).toHaveProperty('getQueueDepth');
    expect(rateLimiter).toHaveProperty('getMetrics');
    expect(rateLimiter).toHaveProperty('addToQueue');
    expect(rateLimiter).toHaveProperty('processQueue');
    expect(rateLimiter).toHaveProperty('resetRateLimit');
  });
});
