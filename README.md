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

## 📚 Documentation

Start here based on your needs:

| Document | Purpose |
|----------|---------|
| [**QUICK_START.md**](./QUICK_START.md) | Get running locally in 30 minutes (TL;DR) |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | Step-by-step production deployment guide |
| [**FEATURES.md**](./FEATURES.md) | Complete feature list and capabilities |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Technical design, data flows, and patterns |
| [**API_REFERENCE.md**](./API_REFERENCE.md) | All Server Actions, webhooks, and types |

## Quick Start (TL;DR)

See [QUICK_START.md](./QUICK_START.md) for the fastest path to local development.

```bash
npm install && npm run db:generate && npm run db:migrate && npm run dev
```

Then configure your `.env.local` with credentials from:
- **Neon** (PostgreSQL)
- **Clerk** (Authentication)  
- **Stripe** (Payments)
- **Cloudflare R2** (Storage)
- **Resend** (Email)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Complete system design and data flows
- Database schema with relations
- Security layers and best practices
- Performance optimizations
- Scaling considerations
- Monitoring & observability
- Code organization philosophy

### System Overview

```
React 19 Client → Next.js 15 Backend → External APIs
├─ Server Components (zero JS)
├─ Client Components (sparse)
├─ Server Actions (type-safe mutations)
├─ Route Handlers (webhooks)
└─ Middleware (Clerk auth)

↓

Database (Neon Postgres)
├─ 7 tables with relations
├─ Auto-migrations (Drizzle)
└─ Type-safe queries

↓

Services
├─ Clerk (auth)
├─ Stripe (payments)
├─ R2 (storage)
├─ Resend (email)
└─ Cloudflare Pages (hosting)
```

## Features Implemented

See [FEATURES.md](./FEATURES.md) for complete feature list including:
- ✅ Beats marketplace (lease + exclusive licensing)
- ✅ Tiered artist management (Basic/Pro/VIP)
- ✅ Car build content gallery
- ✅ Artist dashboard with upload forms
- ✅ Admin fulfillment interface
- ✅ Error handling & recovery
- ✅ Component library & accessibility
- ✅ Analytics & monitoring infrastructure
- ✅ Toast notifications
- ✅ Rate limiting
- ✅ Production-grade logging

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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions including:
- Service setup (Neon, Clerk, Stripe, R2, Resend)
- Webhook configuration
- Local testing
- Production deployment to Cloudflare Pages
- Monitoring and maintenance

### Quick Deploy

```bash
git push origin main  # Automatic Cloudflare Pages deployment
```

## Admin Interface

Protected admin routes at `/admin` (role-based access):
- ✅ Dashboard with quick stats
- ✅ Upload queue with approve/reject
- 🔄 Beat management (add/edit/publish)
- 🔄 Revenue & analytics dashboard
- 🔄 User management & tier overrides

## API Documentation

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation of:
- **Server Actions**: Type-safe mutation functions
- **Webhooks**: Stripe & Clerk event handlers
- **Database Types**: Auto-generated from Drizzle schema
- **Error Codes**: Response formats and error handling
- **Rate Limiting**: Protecting endpoints
- **Testing**: Local webhook testing with Stripe CLI

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