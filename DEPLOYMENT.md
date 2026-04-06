# DJMEXXICO Platform - Deployment Guide

## Overview

This guide walks you through setting up all required services and deploying the DJMEXXICO platform to production.

---

## Phase 1: Prerequisites

### Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/djmexxico1600/First.git
cd First

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local
```

### Required Accounts
Before proceeding, create accounts at:
- [ ] [Neon](https://neon.tech/) - Database
- [ ] [Clerk](https://clerk.com/) - Authentication
- [ ] [Stripe](https://stripe.com/) - Payments
- [ ] [Cloudflare](https://www.cloudflare.com/) - R2 + Pages
- [ ] [Resend](https://resend.com/) - Email
- [ ] [GitHub](https://github.com/) - Repo (already have)

---

## Phase 2: Service Configuration

### 1. Neon PostgreSQL Setup (15 min)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create new project: **DJMEXXICO**
3. Select region closest to users
4. Copy connection string:
   ```
   postgresql://[user]:[password]@[host]/[database]
   ```

5. Update `.env.local`:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
   ```

6. Initialize database:
   ```bash
   npm run db:generate  # Creates migration files
   npm run db:migrate   # Applies schema
   ```

**Verify:**
```bash
npm run db:migrate  # Should succeed with "Applying 1 migration"
```

---

### 2. Clerk Authentication Setup (20 min)

1. Go to [clerk.com](https://clerk.com) → Sign up
2. Create new application
3. Go to **Settings → API Keys**
4. Copy and set in `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

5. Go to **Webhooks** → Create **New Endpoint**
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: Select `user.created`, `user.updated`, `user.deleted`
   - Copy **Signing Secret**:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

6. OAuth Setup (optional for social login)
   - Go to **Social Connections**
   - Enable: Google, Discord (or platforms you want)
   - Follow provider setup instructions

**Verify Locally:**
```bash
npm run dev
# Visit http://localhost:3000
# Click "Sign Up"
# Complete signup and verify user appears in Neon: 
# SELECT * FROM users WHERE clerk_id = '...';
```

---

### 3. Stripe Payment Setup (30 min)

1. Go to [stripe.com](https://stripe.com) → Sign in
2. Go to **Products** → **Create Product**

#### Beat Licenses
Create 2 products:

**Product 1: Beat Lease**
- Name: "Beat Lease"
- Price: $24.99 (one-time)
- Copy **Price ID**: `price_...`

**Product 2: Beat Exclusive**
- Name: "Beat Exclusive"  
- Price: $99.99 (one-time)
- Copy **Price ID**: `price_...`

#### Subscriptions
Create 3 products with monthly recurring billing:

**Product 3: Basic Artist Membership**
- Name: "Basic Artist Membership"
- Price: $29.99/month
- Copy **Price ID**: `price_...`

**Product 4: Pro Artist Membership**
- Name: "Pro Artist Membership"
- Price: $79.99/month
- Copy **Price ID**: `price_...`

**Product 5: VIP Artist Membership**
- Name: "VIP Artist Membership"
- Price: $199.99/month
- Copy **Price ID**: `price_...`

#### Environment Variables
Update `.env.local`:
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_BEAT_LEASE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BEAT_EXCLUSIVE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SUB_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SUB_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SUB_VIP_PRICE_ID=price_...
```

#### Webhook Setup
1. Go to **Webhooks** → **Add endpoint**
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy **Signing Secret**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Test Locally with Stripe CLI:**
```bash
# Download Stripe CLI from stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy signing secret from Stripe CLI output:
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Test Payment:**
1. Visit http://localhost:3000/beats
2. Click "Purchase" on a beat
3. Use test card: `4242 4242 4242 4242` (expiry: 12/25, CVC: any 3 digits)
4. Verify webhook triggers: Check logs and Neon for new order record

---

### 4. Cloudflare R2 Storage Setup (20 min)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **R2** (Storage) → **Create Bucket**
3. Bucket name: `djmexxico-beats` 
4. Choose region (US recommended)
5. Create bucket

#### Configuration
1. Go to **R2 Settings** → **API Tokens**
2. Create API token:
   - Token name: "DJMEXXICO"
   - Permission: Edit (all R2)
   - TTL: None (no expiration)
3. Copy credentials and update `.env.local`:
   ```
   NEXT_PUBLIC_R2_ACCOUNT_ID=1234567890abcdef
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   ```

4. Go back to buckets → Select bucket → **CORS**
   - Add CORS rule:
   ```json
   {
     "AllowedOrigins": ["https://yourdomain.com"],
     "AllowedMethods": ["GET", "PUT", "POST"],
     "AllowedHeaders": ["*"],
     "ExposeHeaders": ["ETag"]
   }
   ```

**Verify Locally:**
```bash
npm run dev
# Visit http://localhost:3000/dashboard/uploads
# Select a file and upload
# Verify file appears in R2 console
```

---

### 5. Resend Email Setup (5 min)

1. Go to [resend.com](https://resend.com)
2. Sign up and verify email
3. Go to **API Keys** → **Create API Key**
4. Copy key and update `.env.local`:
   ```
   RESEND_API_KEY=re_...
   ```

**Verify:**
```bash
# Trigger a purchase email locally
# Check Resend dashboard for sent emails
```

---

## Phase 3: Local Testing

```bash
# Start development server
npm run dev

# Test public pages
# - http://localhost:3000 (hero)
# - http://localhost:3000/beats (store)
# - http://localhost:3000/management (subscriptions)
# - http://localhost:3000/car (gallery)

# Test authentication
# - Sign up via Clerk
# - Verify user in Neon: SELECT * FROM users;

# Test beat purchase
# - Select beat → buy with test Stripe card
# - Check order created in Neon
# - Verify email sent (Resend dashboard)

# Test subscription
# - Select membership tier
# - Complete checkout
# - Check Neon for subscription record
# - Verify user tier updated
```

---

## Phase 4: Production Deployment

### Deploy to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Pages** → **Connect Repository**
3. Select GitHub repo: `djmexxico1600/First`
4. **Deploy Site**

#### Build Configuration
- Framework: Next.js
- Build command: `npm run build`
- Build output directory: `.next`

#### Environment Variables
Add all variables from `.env.local`:
```
DATABASE_URL=...
CLERK_SECRET_KEY=...
STRIPE_SECRET_KEY=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
RESEND_API_KEY=...
CLERK_WEBHOOK_SECRET=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_STRIPE_BEAT_LEASE_PRICE_ID=...
NEXT_PUBLIC_STRIPE_BEAT_EXCLUSIVE_PRICE_ID=...
NEXT_PUBLIC_STRIPE_SUB_BASIC_PRICE_ID=...
NEXT_PUBLIC_STRIPE_SUB_PRO_PRICE_ID=...
NEXT_PUBLIC_STRIPE_SUB_VIP_PRICE_ID=...
NEXT_PUBLIC_R2_ACCOUNT_ID=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Update Webhooks for Production

1. **Clerk Webhooks**
   - Go to Clerk → Webhooks
   - Update endpoint URL: `https://yourdomain.com/api/webhooks/clerk`

2. **Stripe Webhooks**
   - Go to Stripe → Webhooks
   - Update endpoint URL: `https://yourdomain.com/api/webhooks/stripe`

### Custom Domain (Optional)
1. In Cloudflare Pages settings → **Custom Domain**
2. Add your domain: `djmexxico.com` (or your domain)
3. Follow DNS setup instructions

**Deploy!**
```bash
git push origin main
# Cloudflare Pages will automatically build and deploy
# Live at https://yourdomain.pages.dev or custom domain
```

---

## Phase 5: Post-Deployment

### Monitoring
- [ ] Visit homepage and verify loads
- [ ] Test purchase flow with real Stripe
- [ ] Check error logs in Cloudflare
- [ ] Verify database writes in Neon
- [ ] Monitor webhook delivery (Clerk, Stripe dashboards)

### Analytics
- Set up PostHog or Mixpanel (optional)
- Update analytics endpoint in `src/lib/analytics.ts`
- Configure Sentry for error tracking (optional)

### Scaling
- Neon auto-scales
- Cloudflare Pages handles traffic
- R2 unlimited storage
- Add caching headers as needed

---

## Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check Neon IP whitelist (should auto-configure)
- Run `npm run db:migrate` locally first

### "Clerk webhook not processing"
- Verify webhook URL matches Cloudflare domain exactly
- Check `CLERK_WEBHOOK_SECRET` matches
- Review Clerk webhook logs for errors

### "Stripe webhook returning 401"
- Verify `STRIPE_WEBHOOK_SECRET` matches
- Check webhook signature verification code in route

### "R2 upload failing"
- Verify `NEXT_PUBLIC_R2_ACCOUNT_ID` is correct
- Check R2 API token hasn't expired
- Verify CORS is configured

### "Emails not sending"
- Check `RESEND_API_KEY` is correct
- Verify sender email in templates is verified in Resend

---

## Maintenance

### Weekly
- Check Neon query performance
- Monitor error rates in logs
- Review failed webhook deliveries

### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Check Stripe and Clerk changelogs

### Quarterly
- Review analytics trends
- Optimize database indexes if needed
- Update pricing if warranted

---

## Security Checklist

- [ ] All environment variables set in Cloudflare Pages
- [ ] No secrets in GitHub (use .gitignore for .env.local)
- [ ] Webhook signatures verified
- [ ] HTTPS enforced (automatic on Cloudflare)
- [ ] Database backups enabled (Neon default)
- [ ] Rate limiting active on API endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Input validation with Zod everywhere
- [ ] Server Actions handle auth checks

---

## Rollback Procedure

If deployment has issues:

1. **Revert GitHub Commit**
   ```bash
   git revert HEAD  # Create new commit undoing changes
   git push origin main
   ```

2. **Immediate Rollback**
   ```bash
   git reset --hard [previous-commit-hash]
   git push origin main --force
   ```

3. **Cloudflare will auto-deploy the previous version**

---

## Support

For issues:
1. Check [Next.js Docs](https://nextjs.org)
2. Check [Clerk Docs](https://clerk.com/docs)
3. Check [Stripe Docs](https://stripe.com/docs)
4. Check [Cloudflare Docs](https://developers.cloudflare.com)

---

**Last Updated**: April 6, 2026  
**Estimated Setup Time**: 2-3 hours (first time)
