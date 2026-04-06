# DJMEXXICO Platform

High-quality beats marketplace, artist management subscriptions, and 2010 Cadillac CTS build content platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: Neon Postgres + Drizzle ORM
- **Storage**: Cloudflare R2 (presigned URLs)
- **Authentication**: Clerk
- **Payments**: Stripe (one-time + subscriptions)
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required services:
- **Neon Database**: Create PostgreSQL database, get connection URL
- **Clerk**: Sign up, create application, get publishable & secret keys
- **Stripe**: Create account, set up products/prices, get API keys
- **Cloudflare R2**: Create account, bucket, and get credentials
- **Resend**: Sign up, get API key

### 3. Set Up Database

Generate migrations from schema:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

### 4. Configure Webhooks

Set up webhook endpoints in your provider dashboards:

**Clerk Webhooks** (in Clerk Dashboard → Webhooks):
- URL: `https://yourdomain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

**Stripe Webhooks** (in Stripe Dashboard → Webhooks):
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.*`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Public pages: home, beats, management, car
│   ├── (dashboard)/          # Protected artist dashboard
│   ├── (admin)/              # Admin panel (future)
│   ├── api/webhooks/         # Stripe & Clerk webhooks
│   └── layout.tsx            # Root layout with Clerk provider
├── lib/
│   ├── db/                   # Database schema, client, migrations
│   ├── clerk/                # Clerk webhook handler
│   ├── stripe/               # Stripe actions & products config
│   ├── r2/                   # R2 presigned URLs & upload actions
│   ├── email/                # Email templates & Resend service
│   ├── beats/                # Beat queries
│   ├── car/                  # Car post queries
│   └── validators.ts         # Zod schemas
├── components/               # Reusable shadcn/ui components
└── middleware.ts             # Clerk middleware for protected routes
```

## Features

### 🎵 Beats Store
- Browse high-quality production beats
- Lease or exclusive purchase options
- Direct R2 download after purchase
- Audio preview player (coming soon)

### 📊 Management Tiers
- **Basic** ($29.99/mo): 1 SoundCloud repost, 2 IG promos
- **Pro** ($79.99/mo): Unlimited reposts, 4 IG promos, playlist placements
- **VIP** ($199.99/mo): Full management, dedicated account manager, daily IG content

### 🏎️ Car Content
- 2010 Cadillac CTS build showcase
- Specifications & modification tracking
- Build progress gallery
- Newsletter signup

### 🔐 Artist Dashboard
- View purchase history & subscription status
- Upload audio for DistroKid distribution
- Track upload status & fulfillment
- Access to exclusive content

## Core Flows

### Beat Purchase
1. Customer browses beats
2. Selects lease or exclusive option
3. Stripe checkout session
4. Webhook confirms payment → Neon update
5. Resend sends download link + receipt
6. Customer downloads from R2 presigned URL

### Subscription
1. Artist selects management tier
2. Stripe subscription checkout
3. Webhook → subscription created in Neon
4. Clerk webhook → update user tier
5. Discord role assigned (future)
6. Email confirmation sent
7. Artist gains dashboard access

### Artist Upload
1. Artist submits audio file + metadata
2. Server Action → presigned R2 upload URL
3. Client uploads directly to R2
4. Neon records pending upload
5. Admin notified via email
6. Admin reviews & marks fulfilled
7. Artist notified, public release added

## Deployment

### Cloudflare Pages (Recommended)

1. Push repository to GitHub
2. Connect repo to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Add environment variables in Cloudflare dashboard
6. Deploy!

### Environment Variables for Production

Same as `.env.local`, plus:
- `NEXT_PUBLIC_APP_URL`: Your production domain

## Admin Panel (Future)

Protected admin routes at `/admin`:
- Beat management (add/edit/publish)
- Upload queue & fulfillment
- Revenue & analytics dashboard
- Car post management
- User management & tier overrides

## API Endpoints

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment events
- `POST /api/webhooks/clerk` - Clerk user sync

### Server Actions
- `createBeatCheckoutSession(beatId, licenseType)` - Start beat purchase
- `createSubscriptionCheckoutSession(tier)` - Start subscription
- `getUploadUrl(fileName, contentType, type)` - Get R2 presigned URL
- `createArtistUpload(r2Key, metadata)` - Record upload

## Security

- Clerk middleware protects `/dashboard` and `/admin` routes
- Server Actions validate user authentication
- R2 presigned URLs signed with expiration (1 hour default)
- Stripe webhook signature verification
- Clerk webhook SVIX signature verification
- All inputs validated with Zod
- No sensitive credentials on client

## Contributing

This is a personal project. For issues or suggestions, open a GitHub issue.

## License

Proprietary - DJMEXXICO 2026