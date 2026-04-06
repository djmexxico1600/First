# Testing Setup Guide

Welcome to the DJMEXXICO Automated Platform Testing Suite. This guide explains how to use the testing infrastructure for development and CI/CD.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run All Tests
```bash
npm run test:unit          # Fast unit tests (in-memory, < 3s)
npm run test:integration   # Integration tests (requires Postgres)
npm run test:e2e           # E2E tests (requires dev server)
```

### 3. Watch Mode (Recommended for Development)
```bash
npm run test:unit:watch
```
Tests re-run automatically when files change.

---

## 📋 Test Commands

### Unit Tests (Fast, No External Services)
```bash
npm run test:unit              # Run once, exit
npm run test:unit:watch        # Watch mode for development
npm run test:coverage          # Coverage report (HTML in coverage/)
```

### Integration Tests (Requires Postgres)
```bash
npm run test:integration       # Run against test PostgreSQL database
```

**Setup:** Test database must be running at `postgresql://test:test@localhost:5432/djmexxico_test`

### E2E Tests (Requires Dev Server)
```bash
npm run test:e2e               # Headless mode
npm run test:e2e:ui            # Interactive UI dashboard
npm run test:e2e:debug         # Debug mode (inspect browser)
```

**Setup:** Run `npm run dev` in another terminal first.

### All Tests at Once
```bash
npm run test                   # Sequential: unit → integration → e2e
```

---

## 📂 Directory Structure

```
tests/
├── setup.ts                    # Global setup (runs before all tests)
├── factories.ts                # Test data generators
├── unit/
│   ├── validators.test.ts      # Zod schema validation tests
│   └── ...                     # More unit tests (Phase 2)
├── integration/
│   └── ...                     # DB, API integration tests (Phase 3)
└── e2e/
    └── ...                     # Browser-based tests (Phase 4+)
```

---

## 🏭 Using the Test Data Factory

Generate consistent, isolated test data:

```typescript
import {
  createTestUser,
  createTestBeat,
  createTestOrder,
  createTestSubscriber,
} from '@/tests/factories';

describe('My Test', () => {
  it('should process beat purchase', () => {
    const user = createTestUser();
    const beat = createTestBeat();
    const order = createTestOrder({
      userId: user.id,
      beatId: beat.id,
      type: 'beat_lease',
    });

    // Test logic here
  });
});
```

**factories.ts provides:**
- ✅ User types (user, artist, subscriber, admin)
- ✅ Beat types (published, draft)
- ✅ Order types (beats, subscriptions)
- ✅ Stripe events (checkout, payment_intent)
- ✅ File uploads and presigned URLs
- ✅ Email payloads

---

## 📊 Coverage Requirements

**Target:** ≥ 85% on profit-critical paths

Run coverage reports:
```bash
npm run test:coverage
```

Opens `coverage/index.html` in your browser.

**Failing coverage blocks CI/CD.** If tests drop below 85%, CI will reject the PR.

---

## 🔧 GitHub Actions CI

Every push and PR automatically runs:

1. **Unit Tests** (Node 18 + 20)
2. **Type Check** (`tsc --noEmit`)
3. **Integration Tests** (with Postgres service)
4. **E2E Tests** (5 device profiles)
5. **Coverage Upload** (Codecov)

**View results:** Go to PR → "Checks" tab

---

## 🛠️ Configuration

### Vitest Configuration (`vitest.config.ts`)
- Environment: `happy-dom` (fast, lightweight)
- Coverage: 85% target on lines/functions/statements, 80% on branches
- Timeout: 10 seconds per test
- Parallel: 4 workers

### Playwright Configuration (`playwright.config.ts`)
- Projects: Chromium, Firefox, Safari, iOS, Android
- Timeout: 30 seconds per test
- Screenshots/videos: On failure
- Base URL: http://localhost:3000

### Environment Variables (`.env.test`)
For unit tests, defaults are provided (mock keys). For integration/E2E tests, real values override:

```bash
DATABASE_URL="postgresql://test:test@localhost:5432/djmexxico_test"
CLERK_SECRET_KEY="sk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

---

## 🐛 Debugging

### Debug Unit Test
In your test file, add `debugger`:
```typescript
it('should work', () => {
  debugger; // <-- execution pauses here
  expect(1).toBe(1);
});
```

Run with:
```bash
npm run test:unit -- --inspect-brk
```

### Debug E2E Test
```bash
npm run test:e2e:debug
```
Browser opens, inspect elements, slow down playback.

### Check Test Output
```bash
npm run test:unit -- --reporter=verbose
```

---

## ⚠️ Common Issues

### Tests fail with "Missing environment variables"
**Fix:** Copy `.env.test` or set env vars:
```bash
export DATABASE_URL="postgresql://test:test@localhost:5432/djmexxico_test"
npm run test:unit
```

### Playwright tests timeout
**Fix:** Ensure dev server is running:
```bash
npm run dev  # In another terminal
npm run test:e2e
```

### Tests are flaky (sometimes fail, sometimes pass)
**Fix:** Check for:
- Hardcoded `setTimeout()` → use explicit waits instead
- Race conditions → ensure test isolation
- External API calls → mock them with `vi.mock()`

---

## 📚 Resources

- **Testing Charter:** See [`TESTING_CHARTER.md`](./TESTING_CHARTER.md) for full strategy
- **Phase 1 Report:** See [`PHASE_1_REPORT.md`](./PHASE_1_REPORT.md) for setup details
- **Risk Log:** See [`RISK_LOG.md`](./RISK_LOG.md) for identified risks

---

## ❓ Questions?

Refer to the Testing Charter for detailed phase information, acceptance criteria, and sub-agent responsibilities.

