# DJMEXXICO Platform - Architecture Documentation

Comprehensive technical design document for the DJMEXXICO SaaS platform.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Browser (React 19)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Server Components (Zero JS by default)                │   │
│  │  ├─ Marketing Pages (beats, management, car)           │   │
│  │  ├─ Dashboard Pages (protected, Clerk auth)            │   │
│  │  ├─ Admin Pages (role-based access)                    │   │
│  │  └─ Dynamic Content (Suspense + Skeleton fallbacks)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Client Components ('use client' sparse)               │   │
│  │  ├─ BeatCard (purchase flow, license selection)        │   │
│  │  ├─ ArtistUploadForm (R2 presigned URL upload)         │   │
│  │  ├─ ToastProvider (notifications)                      │   │
│  │  ├─ ErrorBoundary (React error catching)               │   │
│  │  └─ UI Components (Button, Input, Select, etc.)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS (TLS 1.3)
          ┌────────────┴────────────────────┐
          │                                 │
     ┌────▼──────────┐         ┌───────────▼────────┐
     │ API Routes    │         │ Servers Actions    │
     │ (Webhooks)    │         │ (Mutations)        │
     │ /api/*        │         │ No client secrets  │
     └────┬──────────┘         └───────────┬────────┘
          │                                │
     ┌────┴────────────────────────────────┤
     │                                     │
┌────▼──────────────────────────────────────▼─────────────────────┐
│                    Next.js 15 Backend                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Middleware Layer                                          │  │
│  │ ├─ Clerk Auth (protected routes: /dashboard, /admin)     │  │
│  │ ├─ CORS handling                                         │  │
│  │ ├─ Rate limiting                                         │  │
│  │ └─ Request logging                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Route Handlers (API)                                      │  │
│  │ ├─ /api/webhooks/clerk (user sync)                       │  │
│  │ ├─ /api/webhooks/stripe (payment processing)             │  │
│  │ └─ /api/events (analytics endpoint)                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Server Actions (src/lib/*/actions.ts)                     │  │
│  │ ├─ Beat checkout (createBeatCheckoutSession)             │  │
│  │ ├─ Subscription checkout (createSubscriptionCheckoutSession)  │
│  │ ├─ R2 upload URL (getUploadUrl)                          │  │
│  │ ├─ Upload recording (createArtistUpload)                 │  │
│  │ └─ Admin actions (approveUpload, rejectUpload)           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Database Layer (src/lib/db)                               │  │
│  │ ├─ Drizzle ORM (type-safe queries)                       │  │
│  │ ├─ Schema (7 tables with relations)                      │  │
│  │ └─ Migrations (auto-generated)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Utilities (src/lib)                                       │  │
│  │ ├─ Clerk webhook handlers                                │  │
│  │ ├─ Stripe product config & webhook                       │  │
│  │ ├─ R2 presigned URL generation                           │  │
│  │ ├─ Resend email integration                              │  │
│  │ ├─ Analytics event tracking                              │  │
│  │ ├─ Error handling & custom errors                        │  │
│  │ ├─ Structured logging                                    │  │
│  │ ├─ Rate limiting                                         │  │
│  │ └─ Zod validation schemas                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┬───────────────┐
    │                 │                 │               │
┌───▼───┐         ┌───▼────┐       ┌────▼──┐       ┌───▼──┐
│ Neon  │         │Stripe  │       │Clerk  │       │R2    │
│Postgres        │Payments │       │OAuth  │       │Files │
└───────┘         └────────┘       └───────┘       └──────┘
    │                 │                 │               │
    └─────────────────┼─────────────────┴───────────────┘
                      │ webhooks
                      │
                  ┌───▼──────┐
                  │ Resend   │
                  │Email     │
                  └──────────┘
```

---

## Technology Stack

### Frontend
- **React 19**: Latest UI library with Server Components
- **Next.js 15 (App Router)**: Server-centric framework
- **Tailwind CSS**: Utility-first styling with dark mode
- **Framer Motion**: Smooth animations (ready)
- **React Hook Form + Zod**: Form validation

### Backend
- **Node.js Runtime**: Cloudflare Workers compatible
- **Server Actions**: Mutation framework (type-safe)
- **Middleware**: Route protection (Clerk auth)

### Data & Storage
- **Neon PostgreSQL**: Managed database
- **Drizzle ORM**: Type-safe database queries
- **Cloudflare R2**: S3-compatible object storage

### Services
- **Clerk**: Authentication & authorization
- **Stripe**: Payment processing
- **Resend**: Transactional email
- **Cloudflare Pages**: Hosting & CDN

### Utilities
- **Zod**: Runtime validation
- **Nanoid**: Unique ID generation
- **TypeScript**: Type safety

---

## Database Schema

### 7 Core Tables

#### `users`
```sql
id UUID PRIMARY KEY
clerk_id VARCHAR UNIQUE
email VARCHAR UNIQUE
name VARCHAR
role ENUM(user, admin)  -- Default: user
tier ENUM(free, basic, pro, vip)  -- Subscription level
avatar_url VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Indexes**: clerk_id (auth lookup), email (auth), tier (subscription queries)

#### `beats`
```sql
id UUID PRIMARY KEY
artist_id UUID REFERENCES users
title VARCHAR
genre VARCHAR
bpm INTEGER
lease_price DECIMAL(10,2)        -- $24.99
exclusive_price DECIMAL(10,2)    -- $99.99
file_url VARCHAR (R2 presigned)
waveform_data JSON (for preview)
created_at TIMESTAMP
status ENUM(draft, published, archived)
```

**Indexes**: artist_id (my beats), status (store queries)

#### `orders`
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users
beat_id UUID REFERENCES beats
license_type ENUM(lease, exclusive)
amount DECIMAL(10,2)
stripe_session_id VARCHAR
stripe_payment_intent_id VARCHAR
download_url VARCHAR (R2 presigned)
created_at TIMESTAMP
expires_at TIMESTAMP  -- Download link expiry (30 days)
status ENUM(completed)
```

**Indexes**: user_id (my purchases), beat_id (beat sales), stripe_session_id (webhook lookup)

#### `subscriptions`
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users
tier VARCHAR (basic, pro, vip)
stripe_subscription_id VARCHAR
stripe_customer_id VARCHAR
amount DECIMAL(10,2)
billing_period_start TIMESTAMP
billing_period_end TIMESTAMP
status ENUM(active, past_due, unpaid, canceled)
created_at TIMESTAMP
updated_at TIMESTAMP
cancels_at TIMESTAMP  -- Explicit churn date
```

**Indexes**: user_id (my subscription), stripe_subscription_id (webhook lookup), status (active subs)

#### `artist_uploads`
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users
title VARCHAR
artist VARCHAR
genre VARCHAR
upc VARCHAR
upc_verified BOOLEAN
file_url VARCHAR (R2)
file_size INTEGER
duration INTEGER  -- Seconds
status ENUM(pending, approved, fulfilled, rejected)
rejection_reason VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Indexes**: user_id (my uploads), status (admin queue)

#### `car_posts`
```sql
id UUID PRIMARY KEY
title VARCHAR
description TEXT
year INTEGER
make VARCHAR
model VARCHAR
engine VARCHAR
horsepower INTEGER
torque INTEGER
modifications VARCHAR[]
media_urls VARCHAR[]
published_at TIMESTAMP
```

**Indexes**: published_at (featured first)

#### `referrals`
```sql
id UUID PRIMARY KEY
referrer_id UUID REFERENCES users
referred_id UUID REFERENCES users
referred_email VARCHAR
status ENUM(pending, completed)
bonus_amount DECIMAL(10,2)
created_at TIMESTAMP
completed_at TIMESTAMP
```

**Indexes**: referrer_id (my referrals), status (pending rewards)

---

## Data Flow Patterns

### Pattern 1: Beat Purchase (One-Time Payment)

```
User clicks "Purchase" on beat
    ↓
BeatCard component (use client)
    ↓
User selects license type: lease OR exclusive
    ↓
Triggers Server Action: createBeatCheckoutSession()
    ├─ Clerk auth verified
    ├─ Zod validation (beatId, licenseType)
    ├─ Stripe API: create checkout session
    ├─ Redirect to Stripe checkout
    ↓
User completes Stripe payment
    ↓
Stripe webhook → /api/webhooks/stripe
    ├─ Verify webhook signature (SVIX)
    ├─ Extract: stripe_session_id, user.metadata.clerkId
    ├─ Create order in Neon:
    │  INSERT INTO orders (user_id, beat_id, license_type, amount, status)
    ├─ Generate presigned R2 download URL (1 hour expiry)
    ├─ Send email via Resend (download link + receipt)
    └─ Track event: analytics.trackBeatPurchase()
    ↓
User receives email with download link
    ↓
Click link → Direct download from R2 (presigned URL)
```

### Pattern 2: Subscription Purchase (Recurring)

```
User clicks "Subscribe" on tier card
    ↓
Triggers Server Action: createSubscriptionCheckoutSession(tier)
    ├─ Clerk auth verified
    ├─ Stripe API: create checkout session
    │  (with recurring price_id)
    ├─ Redirect to Stripe checkout
    ↓
User enters payment info & completes
    ↓
Stripe webhook: checkout.session.completed
    ├─ Create subscription in Neon
    ├─ Update user.tier = tier
    ├─ Trigger: analytics.trackSubscriptionPurchase()
    ├─ Send confirmation email
    └─ (ready) Trigger Discord role sync
    ↓
Stripe webhook: invoice.paid (monthly)
    ├─ Log to analytics
    ├─ Check tier still valid
    └─ (ready) Track LTV/churn metrics

Stripe webhook: customer.subscription.deleted
    ├─ Update subscription.status = canceled
    ├─ Update user.tier = free
    ├─ Send cancellation email
    └─ (ready) Trigger churn analysis
```

### Pattern 3: Artist Upload (File + Metadata)

```
Artist logs in → Dashboard → Uploads
    ↓
ArtistUploadForm component (use client)
    ├─ React Hook Form + Zod validation
    │  (title, artist, genre, upc, file)
    ├─ Max file size: 50MB
    ├─ File types: .wav, .mp3, .flac
    ↓
User selects file & submits form
    ↓
Server Action: getUploadUrl()
    ├─ Clerk auth verified
    ├─ Generate R2 presigned URL (30 min expiry)
    ├─ Return signed URL to client
    ↓
Client XHR upload to R2 directly
    ├─ File sent to: r2://djmexxico-beats/[userId]/[date]/[filename]
    ├─ Track upload progress (0-100%)
    ├─ Show progress bar in real-time
    ↓
On upload success, trigger Server Action: createArtistUpload()
    ├─ Clerk auth verified
    ├─ Zod validation (metadata)
    ├─ Insert into artist_uploads table (status=pending)
    ├─ Send admin notification email
    ├─ Track: analytics.trackUpload()
    └─ Show success toast
    ↓
Admin dashboard → Upload Queue
    ├─ Clerk middleware confirmed admin role
    ├─ Fetches pending uploads from Neon
    ├─ Shows approve/reject buttons
    ↓
Admin clicks "Approve" or "Reject"
    ├─ Server Action: approveUpload(uploadId)
    │  OR rejectUpload(uploadId, reason)
    ├─ Update upload.status in Neon
    ├─ Send email to artist (approved/rejected)
    └─ (ready) Handle file distribution (DistroKid API)
```

### Pattern 4: Authentication & Authorization

```
User visits homepage
    ├─ No authentication required
    ├─ Clerk middleware skips (public route)
    ↓
User clicks "Sign Up"
    ├─ Clerk login modal opens
    ├─ User creates account via email/password/OAuth
    ↓
Clerk triggers webhook: user.created
    ├─ /api/webhooks/clerk verifies signature
    ├─ Extract: clerkId, email, firstName, lastName
    ├─ Insert into users table (role=user, tier=free)
    ├─ Subscribe user to newsletter (ready)
    └─ Send welcome email
    ↓
User tries to access /dashboard
    ├─ Middleware checks Clerk session
    ├─ If valid: allow access
    ├─ If invalid: redirect to sign-in
    ↓
User lands on dashboard
    ├─ Clerk useUser() hook retrieves current user
    ├─ Components conditionally render based on tier
    ├─ Download links only visible to order/subscription owners
    ↓
Admin tries to access /admin
    ├─ Middleware checks email in ADMIN_EMAILS list
    ├─ If not admin: show 403 error
    ├─ If admin: load admin dashboard
    └─ Show admin-only controls (approve uploads, etc.)
```

---

## API Design

### Server Actions (Mutations)

Since Server Actions are type-safe, no request/response objects:

```typescript
// src/lib/stripe/actions.ts
export async function createBeatCheckoutSession(
  beatId: string,
  licenseType: 'lease' | 'exclusive'
): Promise<{ sessionId: string }> {
  // No request body parsing needed
  // Clerk auth automatic
  // Zod validation inline
  // Direct database access
  // Returns typed response
}
```

**Benefits:**
- No HTTP overhead (direct function call)
- Full TypeScript type-safety
- No accidental client secrets exposure
- Automatic Clerk context

### Webhook Handlers (POST API Routes)

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  // Verify webhook signature with Stripe
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    STRIPE_WEBHOOK_SECRET
  );
  
  // Type-safe event handling
  switch (event.type) {
    case 'checkout.session.completed':
      // Create order, send email, update analytics
      break;
    case 'invoice.paid':
      // Track recurring revenue
      break;
    case 'customer.subscription.deleted':
      // Handle churn
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

**Signature Verification:**
All webhooks verified before processing:
- **Clerk**: SVIX signature library
- **Stripe**: Stripe's built-in verification

### Response Format (Consistent)

From `src/lib/apiResponse.ts`:

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;  // ISO 8601
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

---

## Error Handling Strategy

### Error Hierarchy

```
Custom Errors (src/lib/errors.ts)
├─ AppError (abstract base)
│  ├─ ValidationError (400)
│  │  └─ Example: form input validation fails
│  ├─ NotFoundError (404)
│  │  └─ Example: beat not found
│  ├─ UnauthorizedError (401)
│  │  └─ Example: Clerk auth check fails
│  ├─ ForbiddenError (403)
│  │  └─ Example: user not admin
│  └─ RateLimitError (429)
│     └─ Example: too many requests

Native Errors (preserved)
├─ StripeError
├─ PostgresError
├─ TypeError
└─ SyntaxError
```

### Error Flow

```
User action triggers
    ↓
Try/catch wrapper (handleAsync)
    ├─ If AppError → createErrorResponse(error)
    ├─ If other → wrap in AppError
    ├─ Log to logger.ts
    └─ Send to analytics
    ↓
Return typed error response
    ├─ Frontend parses response.error
    ├─ Displays user-friendly message
    └─ Toast notification
    ↓
(Optional) React ErrorBoundary catches uncaught errors
    ├─ Renders fallback UI
    ├─ Provides "Try Again" button
    └─ Logs for debugging
```

### Error Logging

```typescript
// Central logger with context
logger.error('Payment processing failed', {
  orderId: order.id,
  userId: user.id,
  stripeError: error.message,
  requestId: context.requestId,  // For tracing
  timestamp: new Date().toISOString()
});

// Sent to analytics endpoint for aggregation
// Alerting based on error volume/patterns
```

---

## Security Layers

### Authentication (Clerk)
```
┌─ Browser has sessionToken in httpOnly cookie
├─ Each request validated by Clerk middleware
├─ Invalid: redirect to sign-in
└─ Valid: attach userId and user metadata to context
```

### Presigned URLs (R2)
```
┌─ Server generates signed URL with:
│  ├─ Specific user ID in path
│  ├─ Short expiration (1 hour for downloads)
│  ├─ HMAC signature preventing tampering
│  └─ Content-type restrictions
├─ Browser receives URL (not credentials)
├─ Direct upload/download via presigned URL
└─ After expiry: link becomes invalid (403 Forbidden)
```

### Input Validation (Zod)
```
┌─ All inputs validated before database access
├─ Coercion rules prevent type confusion
├─ String length limits prevent DOS
└─ Enum values prevent invalid states
```

### Webhook Verification
```
┌─ Clerk uses SVIX signature verification
├─ Stripe uses HMAC-SHA256 verification
├─ Server rejects unsigned webhooks (signature mismatch)
└─ Prevents unauthorized action triggers
```

### Server Actions (No Client Secrets)
```
┌─ Clerk auth automatic (verified at runtime)
├─ Database credentials hidden from client
├─ Stripe secret key never sent to browser
├─ R2 secret access key server-side only
└─ All sensitive operations happen server-only
```

### Rate Limiting
```
┌─ In-memory limiter for development
├─ Upstash-ready for production (Redis)
├─ Limits per IP + user ID
├─ Returns 429 Too Many Requests when exceeded
└─ Prevents brute force, DOS attacks
```

---

## Performance Optimizations

### Frontend
- **Server Components by default** (zero JavaScript overhead)
- **Route-based code splitting** (automatic with App Router)
- **Image optimization** (Next.js Image + R2)
- **Suspense boundaries** (skeleton fallbacks while loading)
- **CSS-in-JS** (Tailwind, zero runtime)

### Backend
- **Indexed queries** (Drizzle generates optimal SQL)
- **Connection pooling** (Neon handles automatically)
- **Presigned URLs** (client-side uploads, no server bandwidth)
- **Webhook idempotency** (retry-safe with session IDs)

### Data
- **Selective serialization** (only send needed fields)
- **Pagination ready** (schema supports LIMIT/OFFSET)
- **Caching headers** (ready for CDN integration)

---

## Scaling Considerations

### Current Limits
- Neon: Auto-scales to handle millions of queries
- R2: Unlimited storage and bandwidth
- Stripe: Production-ready, scales automatically
- Cloudflare Pages: Handles millions of requests

### Bottleneck Mitigation
| Potential Bottleneck | Solution |
|---------------------|----------|
| Database connection pool exhausted | Neon's implicit pooling handles this |
| Large file uploads (>100MB) | Chunked upload via Tus (future) |
| Webhook lag (Stripe processing queue) | Idempotent handlers, retry safe |
| Burst traffic (flash sale) | Cloudflare's global CDN + edge caching |
| Admin dashboard (many concurrent uploads) | Pagination, real-time updates via SSE (future) |

---

## Monitoring & Observability

### Built-in Instrumentation
```typescript
// src/lib/logger.ts
logger.info('Beat purchased', {
  beatId, userId, amount, licenseType
});
// Sent to NEXT_PUBLIC_LOG_ENDPOINT

// src/lib/analytics.ts
analytics.trackBeatPurchase(beatId, licenseType, amount);
// Sent to /api/events or external service
```

### Sentry Integration (Ready)
```typescript
// src/instrumentation.ts
// Configure Sentry on app startup
// Auto-captures uncaught errors
// Tracks performance metrics
```

### Webhook Monitoring
- **Clerk**: Webhook logs in Clerk dashboard
- **Stripe**: Webhook logs in Stripe dashboard
- **Application**: Event handler errors logged to logger

### Key Metrics to Monitor
- Beat purchase conversion rate
- Subscription churn rate
- Payment success/failure ratio
- Upload approval latency
- API response times
- Database query performance
- Error rate and types

---

## Deployment Architecture

```
Git Push to GitHub
    ↓
Cloudflare Pages detects push
    ↓
Trigger build: npm run build
    ├─ Compile TypeScript
    ├─ Generate static pages
    ├─ Optimize bundle
    ↓
Deploy to Cloudflare CDN
    ├─ Edge nodes worldwide
    ├─ Automatic HTTPS/TLS
    ├─ DDoS protection
    ↓
API requests route to:
├─ Neon (database)
├─ Stripe (payments)
├─ Clerk (auth)
├─ R2 (storage)
└─ Resend (email)
    ↓
Static assets cached at edge
    ├─ 60-second TTL on pages
    ├─ Cache headers set automatically
    ↓
Webhooks received by application
    ├─ Clerk webhook → sync users
    ├─ Stripe webhook → process payments
    └─ All in serverless functions
```

---

## Code Organization Philosophy

### Layers
1. **Pages** (`src/app/**/*.tsx`)
   - Receive user input
   - Render UI
   - Call Server Actions

2. **Components** (`src/components/`)
   - Reusable UI chunks
   - Accept props
   - Server or Client ("use client")

3. **Server Actions** (`src/lib/**/actions.ts`)
   - Handle mutations
   - Validate input (Zod)
   - Query database
   - Call external APIs
   - Return typed data

4. **Database** (`src/lib/db/`)
   - Schema definition
   - Migration files
   - Query builder

5. **Utilities** (`src/lib/`)
   - Validation schemas
   - Error classes
   - Logger
   - Analytics
   - Helper functions

### Naming Conventions
- **Component files**: PascalCase (Button.tsx)
- **Utility files**: camelCase (logger.ts, analytics.ts)
- **Actions**: Named exports with action suffix (getUploadUrl, createBeatCheckoutSession)
- **Types**: PascalCase with descriptive names (Beat, Order, Subscription)
- **Variables**: camelCase (userId, beatTitle)

---

## Future Enhancements

### Phase 2 (High Priority)
- Beat audio preview player (wavesurfer.js)
- Admin beat management (CRUD forms)
- Advanced search and filtering
- Email preference center
- Two-factor authentication (Clerk ready)

### Phase 3 (Medium Priority)
- Referral system activation
- Discord role sync
- Weekly digest emails
- Video tutorials
- Artist analytics dashboard

### Phase 4 (Nice to Have)
- Mobile app (React Native)
- Marketplace ratings & reviews
- Real-time chat support (Socket.io)
- Advanced reporting (BI dashboard)
- API for third-party integrations

---

## Testing Strategy

### Unit Tests (Jest)
- Error class behaviors
- Zod schema validation
- Logger formatting
- Analytics event tracking

### Integration Tests (Playwright/Cypress)
- Beat purchase flow end-to-end
- Subscription signup and renewal
- Upload and approval workflow
- Admin dashboard functionality

### Webhook Tests
- Stripe: Use stripe-cli for local testing
- Clerk: Use signing secret to simulate webhooks
- Verify database state changes
- Verify email sending

---

## Reference Documentation

- [Next.js Official Docs](https://nextjs.org)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Drizzle ORM Guide](https://orm.drizzle.team)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Last Updated**: April 6, 2026  
**Architecture Version**: 1.0
