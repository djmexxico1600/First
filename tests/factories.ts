/**
 * Test Data Factories
 * Generate consistent, predictable test data for all tests
 * Principle: Every test cleans up after itself (isolation)
 */

import { nanoid } from 'nanoid';

// ==================== USER FACTORIES ====================

export interface TestUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  discordId?: string;
  stripeCustomerId?: string;
  currentTier: 'none' | 'basic' | 'pro' | 'vip';
  role: 'user' | 'artist' | 'admin';
  referralCode?: string;
}

export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  const id = nanoid();
  const clerkId = `clerk_${nanoid()}`;
  const email = `test-${nanoid()}@example.com`;

  return {
    id,
    clerkId,
    email,
    name: 'Test User',
    currentTier: 'none',
    role: 'user',
    ...overrides,
  };
}

export function createTestSubscriber(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    currentTier: 'basic',
    role: 'user',
    discordId: `discord_${nanoid()}`,
    stripeCustomerId: `cus_test${nanoid()}`,
    ...overrides,
  });
}

export function createTestArtist(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    role: 'artist',
    name: 'Test Artist',
    ...overrides,
  });
}

export function createTestAdmin(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    role: 'admin',
    currentTier: 'vip',
    ...overrides,
  });
}

// ==================== BEAT FACTORIES ====================

export interface TestBeat {
  id: string;
  title: string;
  description?: string;
  genre: string;
  bpm: number;
  leasePrice: number;
  exclusivePrice: number;
  previewUrl?: string;
  previewR2Key?: string;
  fullR2Key?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string;
}

export function createTestBeat(overrides?: Partial<TestBeat>): TestBeat {
  const id = `beat_${nanoid()}`;

  return {
    id,
    title: 'Test Beat',
    description: 'A test beat for unit testing',
    genre: 'Hip-Hop',
    bpm: 95,
    leasePrice: 24.99,
    exclusivePrice: 99.99,
    previewR2Key: `beats/${id}/preview.mp3`,
    fullR2Key: `beats/${id}/full.mp3`,
    status: 'published',
    ...overrides,
  };
}

export function createTestDraftBeat(overrides?: Partial<TestBeat>): TestBeat {
  return createTestBeat({
    status: 'draft',
    ...overrides,
  });
}

// ==================== ORDER FACTORIES ====================

export interface TestOrder {
  id: string;
  userId: string;
  beatId?: string;
  stripeSessionId?: string;
  stripeInvoiceId?: string;
  type: 'beat_lease' | 'beat_exclusive' | 'subscription';
  tier?: 'basic' | 'pro' | 'vip';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: string;
}

export function createTestOrder(overrides?: Partial<TestOrder>): TestOrder {
  const id = `order_${nanoid()}`;
  const userId = `user_${nanoid()}`;

  return {
    id,
    userId,
    type: 'beat_lease',
    amount: 24.99,
    currency: 'usd',
    status: 'pending',
    stripeSessionId: `cs_test_${nanoid()}`,
    ...overrides,
  };
}

export function createTestBeatPurchaseOrder(
  overrides?: Partial<TestOrder>
): TestOrder {
  return createTestOrder({
    type: 'beat_lease',
    amount: 24.99,
    ...overrides,
  });
}

export function createTestSubscriptionOrder(
  tierLevel: 'basic' | 'pro' | 'vip',
  overrides?: Partial<TestOrder>
): TestOrder {
  const prices: Record<string, number> = {
    basic: 9.99,
    pro: 19.99,
    vip: 49.99,
  };

  return createTestOrder({
    type: 'subscription',
    tier: tierLevel,
    amount: prices[tierLevel],
    status: 'completed',
    ...overrides,
  });
}

// ==================== SUBSCRIPTION FACTORIES ====================

export interface TestSubscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  tier: 'basic' | 'pro' | 'vip';
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
}

export function createTestSubscription(
  overrides?: Partial<TestSubscription>
): TestSubscription {
  const id = `sub_${nanoid()}`;

  return {
    id,
    userId: `user_${nanoid()}`,
    stripeSubscriptionId: `sub_test_${nanoid()}`,
    tier: 'basic',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    ...overrides,
  };
}

// ==================== STRIPE EVENT FACTORIES ====================

export interface TestStripeCheckoutSession {
  id: string;
  object: string;
  customer: string;
  customer_email: string;
  payment_status: string;
  status: string;
  metadata: Record<string, string>;
}

export function createTestStripeCheckoutSession(
  overrides?: Partial<TestStripeCheckoutSession>
): TestStripeCheckoutSession {
  return {
    id: `cs_test_${nanoid()}`,
    object: 'checkout.session',
    customer: `cus_test${nanoid()}`,
    customer_email: `test-${nanoid()}@example.com`,
    payment_status: 'unpaid',
    status: 'open',
    metadata: {},
    ...overrides,
  };
}

export interface TestStripePaymentIntent {
  id: string;
  object: string;
  amount: number;
  currency: string;
  customer: string;
  status: string;
  metadata: Record<string, string>;
}

export function createTestStripePaymentIntent(
  overrides?: Partial<TestStripePaymentIntent>
): TestStripePaymentIntent {
  return {
    id: `pi_test_${nanoid()}`,
    object: 'payment_intent',
    amount: 2499,
    currency: 'usd',
    customer: `cus_test${nanoid()}`,
    status: 'succeeded',
    metadata: {},
    ...overrides,
  };
}

// ==================== FILE UPLOAD FACTORIES ====================

export interface TestFileUpload {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  metadata?: string;
}

export function createTestFileUpload(
  overrides?: Partial<TestFileUpload>
): TestFileUpload {
  const id = `upload_${nanoid()}`;

  return {
    id,
    userId: `user_${nanoid()}`,
    fileName: 'test-beat.mp3',
    fileType: 'audio/mpeg',
    fileSize: 5242880, // 5MB
    r2Key: `uploads/${id}/test-beat.mp3`,
    status: 'pending',
    ...overrides,
  };
}

// ==================== PRESIGNED URL FACTORIES ====================

export interface TestPresignedUrl {
  url: string;
  expiresAt: Date;
  r2Key: string;
}

export function createTestPresignedUrl(
  overrides?: Partial<TestPresignedUrl>
): TestPresignedUrl {
  return {
    url: `https://r2.example.com/test-${nanoid()}?signature=test`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    r2Key: `beats/test-${nanoid()}/full.mp3`,
    ...overrides,
  };
}

// ==================== EMAIL FACTORIES ====================

export interface TestEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export function createTestEmailPayload(
  overrides?: Partial<TestEmailPayload>
): TestEmailPayload {
  return {
    to: `test-${nanoid()}@example.com`,
    subject: 'Test Email',
    html: '<p>Test email content</p>',
    ...overrides,
  };
}

// ==================== CLEANUP ====================

/**
 * BatchDeleteTestData
 * Call this in afterEach() to clean up test data
 * In a real scenario, you'd delete from DB using Drizzle/transactions
 */
export async function cleanupTestData(_testResources?: {
  beatIds?: string[];
  userIds?: string[];
  orderIds?: string[];
}) {
  // In real implementation, delete from Neon DB
  // await db.delete(beats).where(inArray(beats.id, beatIds));
  // await db.delete(users).where(inArray(users.id, userIds));
  // etc.
  
  // For now, this is a placeholder
  return;
}
