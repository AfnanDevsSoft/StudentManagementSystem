// Global test setup
process.env.NODE_ENV = 'test';

// Set test timeout globally
jest.setTimeout(30000);

// Global test hooks
beforeAll(async () => {
    console.log('🧪 Starting test suite...');
});

afterAll(async () => {
    console.log('✅ Test suite completed');
});
