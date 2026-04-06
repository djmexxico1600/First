# DJMEXXICO Platform - Quick Start Guide

Get the platform running locally in 30 minutes.

---

## 🚀 TL;DR (For the Impatient)

```bash
# 1. Install dependencies (2 min)
npm install

# 2. Create environment file (1 min)
cp .env.example .env.local

# 3. Add your service credentials to .env.local
# (See "Service Credentials" below)

# 4. Initialize database (3 min)
npm run db:generate
npm run db:migrate

# 5. Start dev server (automatically)
npm run dev

# 6. Visit http://localhost:3000 and explore!
```

---

## 📋 Service Credentials (Required)

Grab these from the services and paste into `.env.local`:

### Neon (PostgreSQL)
```
1. Visit: https://neon.tech → Sign up
2. Create project "DJMEXXICO"
3. Copy connection string: postgresql://...
4. Set: DATABASE_URL=postgresql://...
```

### Clerk (Auth)
```
1. Visit: https://clerk.com → Sign up
2. Create app "DJMEXXICO"
3. Go to Settings → API Keys
4. Copy both keys and set:
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
```

### Stripe (Payments)
```
1. Visit: https://stripe.com → Create account
2. Create 5 products with these prices:
   - Beat Lease: $24.99 (one-time) → price_...
   - Beat Exclusive: $99.99 (one-time) → price_...
   - Basic: $29.99/mo (recurring) → price_...
   - Pro: $79.99/mo (recurring) → price_...
   - VIP: $199.99/mo (recurring) → price_...
3. Set in .env.local:
   STRIPE_SECRET_KEY=sk_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
   NEXT_PUBLIC_STRIPE_BEAT_LEASE_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_BEAT_EXCLUSIVE_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_SUB_BASIC_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_SUB_PRO_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_SUB_VIP_PRICE_ID=price_...
```

### Cloudflare R2 (File Storage)
```
1. Visit: https://dash.cloudflare.com → Sign up/login
2. Go to R2 → Create bucket "djmexxico-beats"
3. Create API token with Edit permissions
4. Set in .env.local:
   NEXT_PUBLIC_R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
```

### Resend (Email)
```
1. Visit: https://resend.com → Sign up
2. Create API key
3. Set in .env.local:
   RESEND_API_KEY=re_...
```

### Webhook Secrets (Get after setting up webhooks below)
```
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🔗 Set Up Webhooks (Local Testing)

### Clerk Webhook
1. Clerk dashboard → **Webhooks**
2. **New Endpoint**: `http://localhost:3000/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing Secret** → Add to `.env.local` as `CLERK_WEBHOOK_SECRET`

### Stripe Webhook
**Option A: Test with Stripe CLI (Recommended)**
```bash
# Download Stripe CLI: https://stripe.com/docs/stripe-cli

# Run in separate terminal:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the signing secret from output:
# whsec_...

# Set in .env.local as STRIPE_WEBHOOK_SECRET
```

**Option B: Manual (Skip local testing)**
Just use dummy secret for now:
```
STRIPE_WEBHOOK_SECRET=whsec_test123
```

---

## 📂 Project Structure

```
src/
  ├── app/                      # Next.js pages
  │   ├── (marketing)/          # Public pages (hero, beats, management, car)
  │   ├── (dashboard)/          # Artist pages (orders, uploads)
  │   ├── (admin)/              # Admin pages (dashboard, uploads, management)
  │   ├── api/                  # API routes (webhooks, etc.)
  │   └── layout.tsx            # Root layout
  ├── components/               # React components (Button, Input, etc.)
  ├── lib/
  │   ├── db/                   # Database (schema, client, migrations)
  │   ├── clerk/                # Clerk webhook handlers
  │   ├── stripe/               # Stripe products and actions
  │   ├── r2/                   # Cloudflare R2 helpers
  │   ├── email/                # Email templates
  │   ├── analytics.ts          # Event tracking
  │   ├── errors.ts             # Error classes
  │   ├── logger.ts             # Logging
  │   └── ...other utilities
  └── middleware.ts             # Clerk auth middleware
```

---

## ✅ Verify Installation

```bash
# All of these should succeed locally

# 1. Database
npm run db:migrate
# Should output: "Applying 1 migration"

# 2. Types
npm run type-check
# Should pass without errors

# 3. Lint
npm run lint
# Should pass without errors

# 4. Build
npm run build
# Should complete successfully

# 5. Dev server
npm run dev
# Server should start at http://localhost:3000
```

---

## 🧪 Test the Platform

### Public Pages (No login needed)
Visit these and verify they load:
- http://localhost:3000 (Hero homepage)
- http://localhost:3000/beats (Beats store)
- http://localhost:3000/management (Subscriptions)
- http://localhost:3000/car (Car gallery)

### Authentication
1. Click "Sign Up" on navbar
2. Create account via Clerk
3. Should redirect to http://localhost:3000/dashboard
4. Verify user appears in Neon:
   ```bash
   # From Neon console SQL editor:
   SELECT * FROM users WHERE email = 'your-email@example.com';
   ```

### Beat Purchase
1. Click "Purchase" on a beat card
2. Select license type (Lease or Exclusive)
3. Enter Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
4. Click Pay
5. Should see success page
6. Verify order in Neon:
   ```bash
   SELECT * FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');
   ```

### Upload a Beat
1. Login and click "Dashboard" (or go to http://localhost:3000/dashboard)
2. Click "Uploads" in sidebar
3. Fill in beat details and select audio file
4. Click "Upload"
5. Watch progress bar and verify success
6. Verify upload in Neon:
   ```bash
   SELECT * FROM artist_uploads ORDER BY created_at DESC LIMIT 1;
   ```

### Admin Dashboard
1. Login with an admin account (modify Neon manually):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
2. Visit http://localhost:3000/admin
3. Click on "Upload Queue"
4. Verify pending uploads visible with approve/reject buttons

---

## 🎯 Common Workflows

### Fresh Database Reset
```bash
# 1. Drop the database in Neon console
# 2. Run migrations again:
npm run db:migrate

# 3. Reseed (if you have sample data script):
npm run db:seed
```

### Check Database
```bash
# From Neon console, run SQL:
SELECT name, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

# List users:
SELECT id, clerk_id, email, tier FROM users;

# List orders:
SELECT id, user_id, beat_id, license_type, amount, status FROM orders;
```

### View Logs
```bash
# Terminal running "npm run dev" shows all logs
# Look for [INFO], [ERROR], [DEBUG] tags

# Server-side errors will show with full context
```

### Debug Webhook Issues
```bash
# Terminal running "stripe listen" shows webhook deliveries
stripe logs tail  # See webhook history in Stripe CLI

# Check Clerk webhook logs in Clerk dashboard:
# Webhooks → Select endpoint → Logs

# Check request/response in browser DevTools (Network tab)
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATABASE_URL not found` | Run `cp .env.example .env.local` and add your Neon URL |
| `Clerk not initializing` | Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set |
| `Stripe checkout fails` | Verify all 5 `NEXT_PUBLIC_STRIPE_*_PRICE_ID` are set |
| `Upload fails to R2` | Verify R2 credentials and bucket name in code |
| `Email not sending` | Check `RESEND_API_KEY` and verify sender email in Resend dashboard |
| `Webpack build fails` | Delete `node_modules` and `.next`, then run `npm install` again |
| `Port 3000 already in use` | Run `npm run dev -- -p 3001` to use port 3001 |

---

## 📚 Next Steps

After getting it running locally:

1. **Explore the code** - Start in `src/app/(marketing)/page.tsx` (homepage)
2. **Add features** - See `FEATURES.md` for what's possible
3. **Deploy** - See `DEPLOYMENT.md` for production setup
4. **Customize** - Change colors in `tailwind.config.ts`, products in `src/lib/stripe/products.ts`

---

## 📖 Documentation

- [FEATURES.md](./FEATURES.md) - All implemented features
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [README.md](./README.md) - Project overview and architecture

---

## ⏱️ Expected Timelines

| Step | Time |
|------|------|
| Sign up for 5 services | 5 min |
| Create 5 Stripe products | 5 min |
| Gather all credentials | 5 min |
| npm install | 2 min |
| Database setup | 3 min |
| npm run dev | 1 min |
| **Total** | **~21 min** |

Then 10+ more minutes testing features. You'll be live in **30 minutes**!

---

## 🎉 You're Ready!

The DJMEXXICO platform is production-ready. Everything you need is in place - authentication, payments, storage, email, error handling, analytics, and a beautiful UI.

**Happy coding!** 🚀

---

Last Updated: April 6, 2026
