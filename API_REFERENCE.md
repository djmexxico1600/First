# DJMEXXICO Platform - API Reference

Complete documentation of all Server Actions, Route Handlers, and integration endpoints.

---

## Server Actions

Server Actions are type-safe functions that handle mutations on the server. Call them from the client—Clerk auth is automatic.

### Stripe Payments

#### `createBeatCheckoutSession()`
**File**: `src/lib/stripe/actions.ts`

Create a Stripe checkout session for a beat purchase.

```typescript
function createBeatCheckoutSession(
  beatId: string,
  licenseType: 'lease' | 'exclusive'
): Promise<{ url: string }>
```

**Parameters**:
- `beatId` (string): UUID of the beat
- `licenseType` (string): 'lease' or 'exclusive'

**Returns**:
- `url`: Stripe checkout URL to redirect user to

**Throws**:
- `ValidationError`: Invalid beatId or licenseType
- `NotFoundError`: Beat not found
- `UnauthorizedError`: User not authenticated (Clerk)

**Example**:
```typescript
const { url } = await createBeatCheckoutSession(beatId, 'exclusive');
window.location.href = url;  // Redirect to Stripe
```

---

#### `createSubscriptionCheckoutSession()`
**File**: `src/lib/stripe/actions.ts`

Create a Stripe checkout session for a subscription tier.

```typescript
function createSubscriptionCheckoutSession(
  tier: 'basic' | 'pro' | 'vip'
): Promise<{ url: string }>
```

**Parameters**:
- `tier` (string): 'basic', 'pro', or 'vip'

**Returns**:
- `url`: Stripe checkout URL

**Throws**:
- `ValidationError`: Invalid tier
- `UnauthorizedError`: Not authenticated

**Example**:
```typescript
const { url } = await createSubscriptionCheckoutSession('pro');
window.location.href = url;
```

---

### Cloudflare R2 Storage

#### `getUploadUrl()`
**File**: `src/lib/r2/actions.ts`

Get a presigned URL for direct upload to R2.

```typescript
function getUploadUrl(
  fileName: string,
  fileType: string
): Promise<{ url: string; expiresIn: number }>
```

**Parameters**:
- `fileName` (string): Original filename (e.g., "my-beat.wav")
- `fileType` (string): MIME type (e.g., "audio/wav")

**Returns**:
- `url`: Presigned URL for PUT request
- `expiresIn`: Expiration time in seconds (1800 = 30 min)

**Throws**:
- `ValidationError`: Invalid file type or size
- `UnauthorizedError`: Not authenticated

**Example**:
```typescript
const { url } = await getUploadUrl('my-beat.wav', 'audio/wav');

// Client-side upload
const response = await fetch(url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'audio/wav' }
});
```

---

#### `createArtistUpload()`
**File**: `src/lib/r2/actions.ts`

Record an artist upload in the database.

```typescript
function createArtistUpload(
  title: string,
  artist: string,
  genre: string,
  upc?: string,
  fileUrl?: string
): Promise<{ id: string; status: string }>
```

**Parameters**:
- `title` (string): Beat/track title
- `artist` (string): Artist name
- `genre` (string): Genre (e.g., "Hip-Hop")
- `upc` (string, optional): UPC code
- `fileUrl` (string, optional): R2 file URL

**Returns**:
- `id`: Upload record ID (UUID)
- `status`: 'pending' (awaiting admin review)

**Throws**:
- `ValidationError`: Invalid input
- `UnauthorizedError`: Not authenticated

**Example**:
```typescript
const { id } = await createArtistUpload(
  'My Beats',
  'John Doe',
  'Hip-Hop',
  '1234567890123',
  'https://r2-url/my-beat.wav'
);
console.log('Upload pending review:', id);
```

---

### Admin Actions

#### `approveUpload()`
**File**: `src/lib/admin/actions.ts`

Approve a pending artist upload (admin only).

```typescript
function approveUpload(uploadId: string): Promise<{ status: string }>
```

**Parameters**:
- `uploadId` (string): UUID of the upload to approve

**Returns**:
- `status`: 'approved'

**Throws**:
- `UnauthorizedError`: User is not admin
- `NotFoundError`: Upload not found
- `ValidationError`: Upload already reviewed

**Example**:
```typescript
const { status } = await approveUpload(uploadId);
// Status is now 'approved'
// Email sent to artist
// (Ready for DistroKid/fulfillment integration)
```

---

#### `rejectUpload()`
**File**: `src/lib/admin/actions.ts`

Reject a pending artist upload (admin only).

```typescript
function rejectUpload(
  uploadId: string,
  reason: string
): Promise<{ status: string }>
```

**Parameters**:
- `uploadId` (string): UUID of the upload
- `reason` (string): Reason for rejection (e.g., "Audio quality too low")

**Returns**:
- `status`: 'rejected'

**Throws**:
- `UnauthorizedError`: Not admin
- `NotFoundError`: Upload not found
- `ValidationError`: Upload already reviewed

**Example**:
```typescript
const { status } = await rejectUpload(
  uploadId,
  'Audio is below quality requirements'
);
// Email sent to artist with reason
```

---

## Route Handlers

Route Handlers are HTTP endpoints that handle webhook events and other I/O.

### Webhooks

#### Clerk User Webhook
**File**: `src/app/api/webhooks/clerk/route.ts`

Endpoint: `POST /api/webhooks/clerk`

Receives Clerk user lifecycle events and syncs to Neon.

**Listens for**:
- `user.created`: New user registration
- `user.updated`: Profile changes
- `user.deleted`: Account deletion

**Response**:
```json
{
  "success": true,
  "data": { "userId": "user_123", "synced": true },
  "timestamp": "2026-04-06T12:34:56.000Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "message": "Invalid signature",
    "code": "WEBHOOK_SIGNATURE_INVALID"
  },
  "timestamp": "2026-04-06T12:34:56.000Z"
}
```

**Security**: Verifies SVIX signature header before processing.

---

#### Stripe Payment Webhook
**File**: `src/app/api/webhooks/stripe/route.ts`

Endpoint: `POST /api/webhooks/stripe`

Receives Stripe payment events and updates database.

**Listens for**:

##### `checkout.session.completed`
- Creates order in `orders` table
- Generates presigned download URL (1-hour expiry)
- Sends confirmation email via Resend
- Tracks: `analytics.trackBeatPurchase()`

**Neon Record Created**:
```sql
INSERT INTO orders (
  user_id,
  beat_id,
  license_type,
  amount,
  stripe_session_id,
  stripe_payment_intent_id,
  download_url,
  status,
  expires_at
)
```

---

##### `invoice.paid`
- Updates subscription billing period
- Tracks recurring revenue
- Verifies subscription still active

**Neon Update**:
```sql
UPDATE subscriptions
SET billing_period_start = now(),
    billing_period_end = now() + interval '1 month',
    status = 'active',
    updated_at = now()
WHERE stripe_subscription_id = ...
```

---

##### `customer.subscription.updated`
- Updates subscription status (active, past_due, unpaid)
- Notifies admin if payment fails
- Processes subscription quantity changes (future)

**Neon Update**:
```sql
UPDATE subscriptions
SET status = event.status, updated_at = now()
WHERE stripe_subscription_id = ...

UPDATE users
SET tier = subscription.tier
WHERE stripe_customer_id = ...
```

---

##### `customer.subscription.deleted`
- Sets subscription status = 'canceled'
- Resets user tier to 'free'
- Sends cancellation confirmation email
- Logs churn event for analytics

**Neon Update**:
```sql
UPDATE subscriptions
SET status = 'canceled',
    cancels_at = now(),
    updated_at = now()
WHERE stripe_subscription_id = ...

UPDATE users
SET tier = 'free',
    updated_at = now()
WHERE stripe_customer_id = ...
```

---

**Response**:
```json
{
  "received": true,
  "timestamp": "2026-04-06T12:34:56.000Z"
}
```

**Error Response**:
```json
{
  "error": "Webhook signature verification failed",
  "statusCode": 401
}
```

**Security**: Verifies Stripe signature with HMAC-SHA256 before processing.

---

### Analytics Endpoint

#### Event Tracking
**File**: `src/app/api/events/route.ts` (ready to implement)

Endpoint: `POST /api/events`

Receives analytics events from client and aggregates/forwards to PostHog/Mixpanel.

**Request Body**:
```json
{
  "event": "beat_purchase",
  "properties": {
    "beatId": "beat_123",
    "licensType": "exclusive",
    "amount": 99.99,
    "userId": "user_456"
  },
  "timestamp": "2026-04-06T12:34:56.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "stored": true
}
```

**Supported Events** (from `src/lib/analytics.ts`):
- `page_view`: User visited page
- `beat_play`: User played beat preview
- `beat_purchase`: Beat purchased
- `subscription_view`: User viewed subscription tiers
- `subscription_purchase`: Subscription purchased
- `subscription_cancel`: Subscription canceled
- `upload_start`: Artist started uploading
- `upload_success`: Upload completed
- `signup`: New user registered
- `login`: User logged in
- `conversion`: Revenue-generating event

---

## Database Queries

### User Lookup
```typescript
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const user = await db.query.users.findFirst({
  where: eq(users.clerkId, clerkId)
});
```

### Beat Browsing
```typescript
const beats = await db.select()
  .from(beatTable)
  .where(eq(beats.status, 'published'))
  .limit(20)
  .offset(0);
```

### Order History
```typescript
const orders = await db.query.orders.findMany({
  where: eq(orders.userId, userId),
  orderBy: desc(orders.createdAt),
  with: { beat: true }  // Include related beat
});
```

### Pending Uploads (Admin)
```typescript
const pending = await db.query.artistUploads.findMany({
  where: eq(artistUploads.status, 'pending'),
  orderBy: asc(artistUploads.createdAt)
});
```

### Active Subscriptions
```typescript
const subscriptions = await db.select()
  .from(subscriptions)
  .where(eq(subscriptions.status, 'active'));
```

---

## Type Definitions

All types auto-generated from Drizzle schema for type safety.

### User
```typescript
interface User {
  id: string;  // UUID
  clerkId: string;  // From Clerk
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  tier: 'free' | 'basic' | 'pro' | 'vip';
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Beat
```typescript
interface Beat {
  id: string;
  artistId: string;  // User UUID
  title: string;
  genre: string;
  bpm: number;
  leasePrice: Decimal;  // 24.99
  exclusivePrice: Decimal;  // 99.99
  fileUrl: string;  // R2 presigned URL
  waveformData: unknown | null;  // JSON
  createdAt: Date;
  status: 'draft' | 'published' | 'archived';
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  beatId: string;
  licenseType: 'lease' | 'exclusive';
  amount: Decimal;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  downloadUrl: string;  // R2 presigned
  createdAt: Date;
  expiresAt: Date;  // Download link expiry
  status: 'completed';  // Only completed orders stored
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  userId: string;
  tier: 'basic' | 'pro' | 'vip';
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  amount: Decimal;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
  cancelsAt: Date | null;
}
```

### ArtistUpload
```typescript
interface ArtistUpload {
  id: string;
  userId: string;
  title: string;
  artist: string;
  genre: string;
  upc: string | null;
  upcVerified: boolean;
  fileUrl: string;  // R2 location
  fileSize: number;  // Bytes
  duration: number;  // Seconds
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Codes

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "User-friendly message",
    "code": "ERROR_CODE",
    "details": {
      "field": "fieldName",
      "reason": "why this field is invalid"
    }
  }
}
```

### Common Error Codes

| Code | HTTP | Meaning | Solution |
|------|------|---------|----------|
| `INVALID_INPUT` | 400 | Validation failed (Zod) | Check request body matches schema |
| `UNAUTHORIZED` | 401 | Not logged in (Clerk) | Redirect to sign-in |
| `FORBIDDEN` | 403 | Not admin or insufficient permissions | Contact admin |
| `NOT_FOUND` | 404 | Resource doesn't exist | Verify ID is correct |
| `CONFLICT` | 409 | Resource already exists | Check for duplicates |
| `UNPROCESSABLE_ENTITY` | 422 | Business logic violated | E.g., beat already published |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Retry after delay |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Check logs, contact support |
| `WEBHOOK_SIGNATURE_INVALID` | 401 | Webhook signature mismatch | Verify webhook secret |
| `STRIPE_ERROR` | 402 | Stripe API error | Check Stripe dashboard |

---

## Environment Variables

### Public (Safe in Browser)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_BEAT_LEASE_PRICE_ID
NEXT_PUBLIC_STRIPE_BEAT_EXCLUSIVE_PRICE_ID
NEXT_PUBLIC_STRIPE_SUB_BASIC_PRICE_ID
NEXT_PUBLIC_STRIPE_SUB_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_SUB_VIP_PRICE_ID
NEXT_PUBLIC_R2_ACCOUNT_ID
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LOG_ENDPOINT (optional)
```

### Secret (Server-Side Only)
```
DATABASE_URL
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
RESEND_API_KEY
```

---

## Rate Limiting

Implemented in `src/lib/rateLimit.ts`:

**Default Limits** (per endpoint):
- Beat checkout: 10 requests per minute (prevent duplicate orders)
- Upload: 5 requests per minute (prevent spam)
- Webhook: No limit (idempotent, can retry safely)

**Usage**:
```typescript
import { createRateLimitMiddleware } from '@/lib/rateLimit';

const limiter = createRateLimitMiddleware({
  limit: 10,
  windowMs: 60000  // 1 minute
});

export async function POST(req: NextRequest) {
  const limited = limiter('user-id-or-ip');
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // Process request
}
```

---

## Testing

### Local Webhook Testing (Stripe)

```bash
# 1. Download Stripe CLI
# https://stripe.com/docs/stripe-cli

# 2. Authenticate
stripe login

# 3. Listen for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the signing secret from output, set in .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_...

# 4. In another terminal, trigger events
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

### Local Webhook Testing (Clerk)

```typescript
// From Clerk dashboard, manually send test webhook
// Or use Clerk's testing endpoint in development
```

---

## Rate Limiting for Deployment

**Development**: In-memory rate limiter

**Production**: Use Upstash Redis

```typescript
// src/lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});

export async function limiter(key: string) {
  const { success } = await ratelimit.limit(key);
  return !success;
}
```

---

## Monitoring & Logging

### Log Levels
```typescript
logger.debug('Detailed debugging info');
logger.info('General information');
logger.warn('Warning messages');
logger.error('Error with context', { userId, beatId });
```

### Logs Sent To
- **Development**: Console output
- **Production**: Sent to `NEXT_PUBLIC_LOG_ENDPOINT` (if configured)

### Analytics Events Sent To
- **Development**: Console
- **Production**: `/api/events` endpoint or external service (PostHog, Mixpanel)

---

## Support & Troubleshooting

For specific API issues:
1. Check error code and message
2. Review this documentation
3. Check logs in development terminal
4. Check relevant dashboard (Stripe, Clerk, Neon)
5. File issue on GitHub with error details

---

**Last Updated**: April 6, 2026  
**API Version**: 1.0  
**Status**: Production-Ready
