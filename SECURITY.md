# Security Best Practices Guide

## Overview

Security is a shared responsibility. This guide covers best practices for the DJMEXXICO platform.

## Authentication & Authorization

### Clerk Integration

All authentication handled by Clerk:

✅ Good:
```typescript
'use server';
import { currentUser } from '@clerk/nextjs/server';

export async function getMyData() {
  const user = await currentUser();
  if (!user) {
    throw ErrorFactory.unauthorized();
  }
  return getDb().query.users.findUnique(user.id);
}
```

❌ Bad:
```typescript
// Don't verify tokens manually!
const token = req.headers.get('authorization');
const decoded = jwt.decode(token); // Wrong - Clerk does this
```

### Protected Routes

Use Clerk middleware to protect routes:

✅ Good:
```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const protectedRoutes = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  if (protectedRoutes(req)) {
    auth().protect();
  }
});
```

### Role-Based Access

For admin routes:

```typescript
const user = await currentUser();
if (user?.publicMetadata?.role !== 'admin') {
  throw ErrorFactory.forbidden();
}
```

## Input Validation

### Always Validate

Never trust user input:

✅ Good:
```typescript
const data = validateInput(beatPurchaseSchema, req.body);
// data is guaranteed valid
```

❌ Bad:
```typescript
const { beatId, licenseType } = req.body;
// What if beatId is an array? Or null?
```

### Sanitize Strings

Remove potentially dangerous characters:

```typescript
const title = sanitizeString(req.body.title);
// Removes <script>, onload handlers, etc.
```

### Validate File Uploads

```typescript
if (!req.body.fileType.startsWith('audio/')) {
  throw ErrorFactory.invalidInput('File must be audio');
}
if (fileSize > 100 * 1024 * 1024) { // 100MB max
  throw ErrorFactory.invalidInput('File too large');
}
```

## Database Security

### Use Parameterized Queries

Drizzle ORM prevents SQL injection automatically:

✅ Good:
```typescript
// Parameterized - safe from SQL injection
getDb().query.users.findUnique(userId);
```

❌ Bad:
```typescript
// Never concatenate user input!
getDb().raw(`SELECT * FROM users WHERE id = '${userId}'`);
```

### Least Privilege

Database credentials should:
- Only access necessary schemas/tables
- Have minimum required permissions
- Be rotated regularly
- Never hardcoded in code

### Sensitive Data

Encrypt sensitive data at rest:
- API keys
- Payment tokens
- Personal information

✅ Good:
```typescript
// Hash passwords before storing
const hashedPassword = await bcrypt.hash(password, 10);
```

## API Security

### CORS Configuration

The platform uses Cloudflare which handles CORS:

✅ Good:
```bash
ALLOWED_ORIGINS=https://djmexxico.com,https://www.djmexxico.com
```

### Rate Limiting

Prevent abuse with rate limits:

✅ Good Limits:
- Public endpoints: 100 req/min
- Authenticated endpoints: 1000 req/min  
- Webhook endpoints: 10000 req/min
- Payment endpoints: 10 req/min (strict)

❌ Bad:
```typescript
// Don't have rate limits!
// Bots can hammer your API
```

### Error Messages

Don't leak sensitive info:

✅ Good:
```typescript
throw ErrorFactory.unauthorized(); // "Access denied"
```

❌ Bad:
```typescript
throw new Error(`No user found with ID: ${userId}`);
// Tells attacker which IDs exist!
```

## Secrets Management

### Environment Variables

All secrets in environment variables:

✅ Good:
```typescript
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not set');
```

❌ Bad:
```typescript
const stripeKey = 'sk_test_abc123'; // Hardcoded!
export default stripeKey;
```

### Never Commit Secrets

```bash
# .gitignore
.env.local           # Development
.env.*.local        # All local env files
```

### Rotation

Rotate secrets:
- Monthly for API keys
- Immediately if compromised
- Use Cloudflare or platform secret management
- Never store old secrets in git history

## Payment Security

### PCI Compliance

Never handle raw card data:

✅ Good:
```typescript
// Stripe handles PCI compliance
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  // Stripe tokenizes card
});
```

❌ Bad:
```typescript
// Never collect raw card data!
const card = req.body.cardNumber; // PCI violation!
```

### Webhook Verification

Verify Stripe webhooks are authentic:

✅ Good:
```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
// Only process verified events
```

❌ Bad:
```typescript
// Don't trust webhook data without verification!
const event = JSON.parse(req.body);
```

## External Services

### Secure API Calls

Use HTTPS and validate certificates:

✅ Good:
```typescript
// fetch() uses HTTPS by default
const response = await fetch('https://api.stripe.com/...');
```

### Credential Storage

Never pass secrets in URLs:

✅ Good:
```typescript
fetch('https://api.service.com/data', {
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
});
```

❌ Bad:
```typescript
fetch(`https://api.service.com/data?key=${process.env.API_KEY}`);
// Key visible in logs and referrer!
```

## Logging Security

### Don't Log Secrets

✅ Good:
```typescript
logger.info('Payment processed', { orderId, amount }, requestId);
```

❌ Bad:
```typescript
logger.info('Payment', { cardNumber, cvv, amount }, requestId);
// Secrets in logs!
```

### Redact Sensitive Data

```typescript
function redactSensitive(data) {
  return {
    ...data,
    email: data.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    phoneNumber: data.phoneNumber?.replace(/(.{2}).*(.{2})/, '$1***$2'),
  };
}

logger.info('User updated', redactSensitive(user), requestId);
```

## Infrastructure Security

### HTTPS Everywhere

All traffic encrypted:
- Cloudflare enforces HTTPS
- API uses HTTPS only
- No HTTP fallback

### Database Connection

```typescript
// Neon provides encrypted connections
const db = postgres(process.env.DATABASE_URL);
// DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
```

### Dependency Security

Keep dependencies updated:
```bash
npm audit           # Find vulnerabilities
npm audit fix       # Auto-fix when possible
npm update          # Update packages safely
```

Review security advisories for critical issues.

## Incident Response

### If Compromised

1. **Contact security team immediately**
2. **Revoke all secrets/tokens**
3. **Begin incident investigation**
4. **Notify affected users if needed**
5. **Document lessons learned**
6. **Update practices to prevent recurrence**

### Responsible Disclosure

If you find a vulnerability:
1. **Don't post publicly**
2. **Email security@djmexxico.com**
3. **Include reproduction steps**
4. **Allow time for patch**
5. **Coordinate disclosure timing**

## Regular Checks

### Weekly
- [ ] Review error logs for suspicious activity
- [ ] Check rate limits are working
- [ ] Verify auth is required on protected routes

### Monthly
- [ ] Audit database access logs
- [ ] Review API token usage
- [ ] Update dependencies
- [ ] Check CORS configuration

### Quarterly
- [ ] Security penetration testing
- [ ] Code security audit
- [ ] Dependency vulnerability scan
- [ ] Credentials rotation

## Security Checklist

Before deploying:
- [ ] No hardcoded secrets
- [ ] All input validated
- [ ] Error messages don't leak info
- [ ] Auth required on protected routes
- [ ] Database credentials encrypted
- [ ] HTTPS only
- [ ] Rate limiting configured
- [ ] Webhooks verified
- [ ] Dependencies up to date
- [ ] Tests include security cases
- [ ] Logging doesn't expose secrets
- [ ] CORS configured properly

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Clerk Security](https://clerk.com/docs/security)
- [Stripe Security](https://stripe.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Questions?

Ask in security channel or email security@djmexxico.com

Thank you for keeping DJMEXXICO secure! 🔒
