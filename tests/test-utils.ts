/**
 * Test Utilities & Factory Functions
 * Create consistent test data and helpers
 */

export const testData = {
  /**
   * Valid user data
   */
  validUser: {
    id: 'clerk_test_user_1',
    clerkId: 'test_user_1',
    email: 'test@example.com',
    name: 'Test User',
    tier: 'basic' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /**
   * Valid beat data
   */
  validBeat: {
    id: 'beat_1',
    title: 'Amazing Beat',
    artist: 'Test Artist',
    genre: 'Hip-Hop',
    price: 29.99,
    leaseCopies: 100,
    exclusiveCopies: 1,
    status: 'published' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /**
   * Valid order data
   */
  validOrder: {
    id: 'order_1',
    userId: 'clerk_test_user_1',
    beatId: 'beat_1',
    licenseType: 'lease' as const,
    amount: 29.99,
    status: 'completed' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /**
   * Valid subscription data
   */
  validSubscription: {
    id: 'sub_1',
    userId: 'clerk_test_user_1',
    tier: 'pro' as const,
    status: 'active' as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /**
   * Valid artist upload data
   */
  validArtistUpload: {
    id: 'upload_1',
    userId: 'clerk_test_user_1',
    title: 'My Great Beat',
    artist: 'Test Artist',
    fileName: 'beat.mp3',
    fileUrl: 's3://bucket/beat.mp3',
    status: 'completed' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /**
   * Valid car post data
   */
  validCarPost: {
    id: 'car_1',
    title: '2024 Tesla Model 3',
    description: 'Beautiful electric car with low mileage',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Create mock Clerk user
 */
export function createMockClerkUser(overrides = {}) {
  return {
    ...testData.validUser,
    ...overrides,
  };
}

/**
 * Create mock beat
 */
export function createMockBeat(overrides = {}) {
  return {
    ...testData.validBeat,
    ...overrides,
  };
}

/**
 * Create mock order
 */
export function createMockOrder(overrides = {}) {
  return {
    ...testData.validOrder,
    ...overrides,
  };
}

/**
 * Create mock API request
 */
export function createMockRequest(options: any = {}) {
  return {
    method: options.method || 'GET',
    url: options.url || 'http://localhost:3000/api/test',
    headers: options.headers || {},
    body: options.body || null,
    json: async () => options.body || {},
    text: async () => JSON.stringify(options.body || {}),
  };
}

/**
 * Assert error has expected properties
 */
export function assertErrorProperties(error: any, expectedCode: string, expectedStatus: number) {
  expect(error).toHaveProperty('code', expectedCode);
  expect(error).toHaveProperty('statusCode', expectedStatus);
  expect(error).toHaveProperty('message');
  expect(error).toHaveProperty('timestamp');
}

/**
 * Assert success response format
 */
export function assertSuccessResponse(response: any, hasData = true) {
  expect(response).toHaveProperty('success', true);
  if (hasData) {
    expect(response).toHaveProperty('data');
  }
  expect(response).toHaveProperty('timestamp');
  expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
}

/**
 * Assert error response format
 */
export function assertErrorResponse(response: any, expectedCode?: string) {
  expect(response).toHaveProperty('success', false);
  expect(response).toHaveProperty('error');
  expect(response.error).toHaveProperty('code');
  expect(response.error).toHaveProperty('message');
  expect(response.error).toHaveProperty('timestamp');
  if (expectedCode) {
    expect(response.error.code).toBe(expectedCode);
  }
}
