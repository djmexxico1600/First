# DJMEXXICO Automated Platform — Production-Grade Testing Charter

**Status:** Ready for Phase 1  
**Last Updated:** 2026-04-06  
**Owner:** Senior QA Architect + Orchestrator Agent  
**Target:** Zero-manual-intervention revenue automation

---

## I. MISSION STATEMENT

Build an **automated testing suite that catches 95%+ of profit-critical bugs before production**, enabling DJMEXXICO to operate with near-zero manual intervention. Every test written must directly protect revenue, user trust, or operational reliability.

---

## II. EXECUTIVE TESTING PRINCIPLES

### 2.1 Profit-First Design
- **Every test must answer:** "Does this test prevent lost revenue, refunds, or customer churn?"
- Tests ranked by **Financial Impact Score (FIS)**: Revenue Risk ÷ Implementation Cost
  - **FIS ≥ 10:** Critical (Stripe, auth, R2)
  - **FIS 5–10:** High (webhooks, automation)
  - **FIS 1–5:** Medium (UI, performance)
  - **FIS < 1:** Low (nice-to-have, polish)

### 2.2 Automation Reliability First
- **Zero manual fulfillment** is the north star:
  - Beat purchase → instant R2 signed URL delivery (no manual steps)
  - Subscription created → webhook → Discord role + dashboard access (automated)
  - Artist upload → admin queue notification (no lost uploads)

### 2.3 Trust & Transparency
- All test code is **readable by DJMEXXICO** (comments, clear naming, modular)
- Every phase outputs a **public test report** (pass/fail, logs, screenshots)
- Failed tests block production; skipped tests require explicit sign-off

---

## III. REVISED PRIORITY MATRIX (10 Testing Areas)

| Priority | Area | FIS | Why | What Breaks | Owner |
|----------|------|-----|-----|-------------|-------|
| **P0** | Stripe Checkout → DB → R2 Download | 15 | 100% of beat revenue | User loses access, refund claim, account dormant | E2E Agent |
| **P0** | Subscription Webhook → Discord Role | 14 | Retention + engagement | Users lose access, support tickets spike | Payments Agent |
| **P0** | Presigned R2 URL Expiry & Revoke | 13 | Security + compliance | Leaked tracks, legal exposure | R2 Agent |
| **P1** | Clerk Auth + Protected Routes | 12 | User data safety | Data leak, account takeover | Auth Agent |
| **P1** | Admin Queue → Artist Upload Tracking | 11 | Operations, DJMEXXICO sanity | Lost uploads, unfulfilled orders | E2E Agent |
| **P2** | Webhook Failure Handling & Retry Logic | 10 | Automation robustness | Silent payment failures, orphaned subscriptions | Payments Agent |
| **P2** | Email Delivery (Resend sequences) | 8 | Conversion, LTV | Users don't know order status, unsubscribe rate ↑ | Automation Agent |
| **P3** | Mobile Responsiveness (3 sections) | 7 | Mobile-first followers | 20% less mobile engagement | UI Agent |
| **P3** | Performance (Core Web Vitals) | 6 | SEO → organic reach | Lower rankings, lower IG-to-site traffic | Perf Agent |
| **P4** | Referral Discounts & Tracking | 5 | Viral loops | Miscalculated discounts, lost affiliate revenue | E2E Agent |

---

## IV. SUB-AGENT CHARTER (Updated)

### 4.1 Main Orchestrator (You, here)
**Responsibilities:**
- Maintain master test plan & risk log
- Spawn/oversee sub-agents for each phase
- Enforce acceptance criteria per phase
- Unblock dependencies, manage test data + environments
- Compile final test report with fix priorities

**Success Criteria:**
- No critical tests skip without sign-off
- Phase completion time < 5 business days
- Test coverage ≥ 85% on revenue paths

---

### 4.2 E2E Journey Sub-Agent
**Specialization:** Complete user flows (visitor → purchase → fulfillment → repeat)

**Required Test Cases:**
```
1. Public visitor → browse beats/subs → checkout guest (if allowed)
2. New user → Clerk signup → beat purchase → instant download verify
3. Subscriber → Discord role applied → /dashboard access → promo applied
4. Artist → upload beat → admin queue → DJMEXXICO fulfill → artist notified
5. Subscriber renewal → webhook success → email confirmation → dashboard updated
6. Churn: subscriber → cancel → Discord role revoked → email sent
```

**Success Criteria:**
- All 6 journeys pass with < 2s end-to-end latency (excluding download)
- 0 missing notifications (email, Discord, dashboard)
- All timestamps in Neon match webhook receipt (within 5s)

---

### 4.3 Payments & Stripe Webhook Sub-Agent
**Specialization:** Checkout, subscriptions, webhooks, failure handling

**Required Test Cases:**
```
1. Stripe Checkout Session → Success → webhook payment_intent.succeeded
2. Recurring sub → charge succeeds → Neon subscription.next_renewal updated
3. Webhook failure → retry logic → max 5 attempts over 72h
4. Refund request → Stripe webhook → subscription.status = canceled + R2 revoke
5. Failed charge → retry email sent → dashboard alert visible
6. Webhook signature validation → invalid → rejected (security)
```

**Success Criteria:**
- All webhook event types processed within 5s
- 0 orphaned subscriptions (created in Stripe, missing in Neon)
- Refund path completes end-to-end in < 1 min
- Invalid webhook signatures rejected 100% of time

---

### 4.4 R2 & Data Persistence Sub-Agent
**Specialization:** Cloudflare R2 uploads, presigned URLs, Neon Drizzle sync

**Required Test Cases:**
```
1. Artist upload (beat/track) → R2 store → Neon record created
2. Beat purchase → presigned URL generated → download before expiry (24h)
3. Presigned URL after expiry → 403 Forbidden + email retry sent
4. Bulk artist uploads (10 concurrent) → all succeed, no corruption
5. Neon schema validation → all R2 keys stored correctly + accessible
6. R2 file organization → /artists/{artistId}/{beatId} path correct
7. Car media upload → R2 → dashboard preview loads
```

**Success Criteria:**
- Presigned URLs valid for exactly 24h (not 23h59m, not 24h1m)
- 0 orphaned R2 files (file exists in R2 but no Neon record)
- Concurrent uploads: 10 simultaneous = 10 successful + 0 corrupted
- All R2 keys queryable from Neon within 2s

---

### 4.5 Security & Auth Sub-Agent
**Specialization:** Clerk, protected routes, role-based access, vulnerabilities

**Required Test Cases:**
```
1. Unauthenticated → /dashboard → 302 redirect to login
2. Subscriber (Basic) → /admin → 403 forbidden (only DJMEXXICO)
3. Expired session → protected route → Clerk refresh → auto-resume
4. Presigned URL after revoke (refund) → 403 Forbidden
5. Direct R2 URL (unsigned) → 403 Forbidden
6. Rate limit: 100 requests/min from same IP → 429 after limit
7. Invalid form input (beat price = "abc") → validation error, no DB write
8. CORS: cross-origin request from localhost:3001 → rejected
```

**Success Criteria:**
- All protected routes enforce Clerk auth
- Role-based gating: non-admin cannot access /admin
- Presigned URL revocation immediate (< 1s propagation)
- Rate limits enforced without data loss
- All form inputs validated server-side + client-side

---

### 4.6 UI/UX & Responsive Sub-Agent
**Specialization:** Visual quality, mobile experience, 3-section navigation

**Required Test Cases:**
```
1. Desktop (1920px) → all 3 sections fully responsive, no horizontal scroll
2. Mobile (375px iPhone) → touch-friendly, no overlapping elements
3. Tablet (768px) → navigation accessible, images scale properly
4. Dark mode (if supported) → contrast ≥ 4.5:1
5. Navigation: Music → Management → Car → back → all sections load correctly
6. Open Graph tags populated → social share preview shows beat/sub art
7. Form accessibility: screen reader → all fields labeled, placeholders clear
8. Performance: Lighthouse score ≥ 80 (mobile), ≥ 90 (desktop)
```

**Success Criteria:**
- All sections pass responsive checks at 5 breakpoints
- Lighthouse scores ≥ target thresholds
- Touch targets ≥ 44px²
- 0 layout shift (CLS < 0.1)
- Dark mode (if exists): ≥ 4.5:1 contrast ratio

---

### 4.7 Edge Cases & Performance Sub-Agent
**Specialization:** Stress testing, error handling, speed, scalability

**Required Test Cases:**
```
1. Simulate 100 concurrent beat downloads → all serve < 3s
2. Simulate 50 concurrent artist uploads → all succeed, queue tracked
3. Webhook handler: 1000 events/sec → all processed, none lost
4. Missing env var → graceful error, no startup crash
5. Neon connection timeout → retry + user-facing error (not 500)
6. R2 rate limit hit → graceful degrade + notify admin
7. Large beat file (500MB) → upload progress tracked, not timeout
8. Memory leak test: 1h load test → memory stable (< 10% drift)
```

**Success Criteria:**
- All stress tests complete without data loss
- Error messages user-friendly (not technical stack traces)
- No silent failures (all errors logged + monitored)
- Memory remains stable under sustained load
- Page load time p95 < 2.5s

---

## V. MASTER TEST PLAN (10 Phases)

### Phase 1: Test Environment Setup + Charter
**Deliverables:**
- [ ] `.env.test` with Stripe test keys, test Clerk credentials
- [ ] Vitest + Playwright config files
- [ ] Test data factory (user accounts, stripe test products)
- [ ] CI/CD skeleton for GitHub Actions
- [ ] This charter + acceptance criteria
- [ ] Risk log (tracked throughout)

**Success Criteria:** Environment ready, first unit test runs locally

---

### Phase 2: Unit Tests (Components, Actions, Utilities)
**Scope:**
- Component tests (BeatCard, ArtistUploadForm, etc.) — snapshot + interaction
- Action tests (stripe/actions.ts, r2/actions.ts) — mock DB + API
- Validator tests — valid/invalid inputs
- Schema tests (Drizzle) — constraint validation

**Target Coverage:** ≥ 85% on revenue paths

---

### Phase 3: Integration Tests (Neon, R2, Stripe Actions)
**Scope:**
- Stripe test mode: create product, checkout session, webhook simulation
- R2 test bucket: upload, presigned URL, download, expiry
- Neon test DB: transaction rollback, concurrent writes, schema integrity
- Email (Resend): mock send, verify template rendering

**Target Coverage:** All critical actions + edge cases

---

### Phase 4: E2E Critical Business Flows (Playwright)
**Scope:**
- Beat browse → purchase → download (P0)
- Subscribe → Discord role (P0)
- Artist upload → admin queue (P0)
- Unsubscribe → role revoke (P1)

**Success Criteria:** All P0 flows end-to-end, < 3s per transaction

---

### Phase 5: Stripe Webhooks + Automation Testing
**Scope:**
- Webhook arrival → Neon update → 5s SLA
- Retry logic: simulate failure, verify 5 retries over 72h
- Discord role sync: webhook → member.add in < 10s
- Email notifications: verify Resend chain execution

**Success Criteria:** 100% webhook delivery, 0 orphaned records

---

### Phase 6: Security & Authorization Testing
**Scope:**
- Auth bypass attempts
- Role-based access gating
- Presigned URL expiry + revocation
- Rate limiting
- Input validation (XSS, SQL injection, etc.)

**Success Criteria:** 0 security findings (P0/P1), all validation server-side

---

### Phase 7: UI/UX + Responsive + Performance Testing
**Scope:**
- Mobile (5 breakpoints) + dark mode
- Lighthouse ≥ 80 mobile, ≥ 90 desktop
- Core Web Vitals (LCP, FID, CLS)
- Touch accessibility + keyboard nav
- Social share preview (Open Graph)

**Success Criteria:** All sections responsive, Lighthouse targets met

---

### Phase 8: Edge Cases + Full Regression Suite
**Scope:**
- Stress tests (concurrent uploads/downloads/webhooks)
- Error handling (missing env, timeouts, rate limits)
- Memory & resource leaks
- Large file handling (500MB+)
- All previous phases re-run (regression)

**Success Criteria:** Memory stable, no data loss, all prior tests pass

---

### Phase 9: CI/CD GitHub Actions Workflow
**Scope:**
- Automated test runs on every PR (unit + integration + E2E)
- Test report generation (HTML + summary)
- Coverage tracking (fail if < 85%)
- Slack notifications (pass/fail + FIS breakdown)
- Production deployment checklist

**Success Criteria:** All tests automated, PR blocks on failure

---

### Phase 10: Final Test Report + Production Readiness
**Deliverables:**
- [ ] Pass/fail matrix (all 10 priority areas)
- [ ] FIS breakdown (sorted by revenue impact)
- [ ] Security findings + remediation
- [ ] Performance report (Lighthouse, Core Web Vitals)
- [ ] Known limitations + workarounds
- [ ] Runbook for DJMEXXICO: "If X breaks, do Y"
- [ ] Monitoring alerts set up (Stripe, R2, webhooks, errors)

**Success Criteria:** DJMEXXICO signs off, ready for production

---

## VI. ENVIRONMENT ISOLATION & TEST DATA STRATEGY

### 6.1 Three-Tier Test Environment
```
Tier 1: LOCAL (developer machine)
├─ Vitest in-memory SQLite (instant resets)
├─ Stripe test mode (publishable key)
├─ Cloudflare Workers local simulator (optional)
└─ Playwright headed mode (debug)

Tier 2: CI (GitHub Actions)
├─ PostgreSQL test database (Neon)
├─ Stripe test mode (full webhook simulation)
├─ Playwright headless (screenshots on failure)
└─ Reports → GitHub Actions artifacts

Tier 3: STAGING (optional, pre-production mirror)
├─ Full Neon replica (test DB)
├─ Stripe test mode
├─ Full R2 bucket replica
└─ Smoke tests only (15 min run)
```

### 6.2 Test Data Factory
```typescript
// factories.ts
export function createTestBeat() { ... }
export function createTestSubscriber() { ... }
export function createTestStripeCustomer() { ... }
export function seedAdminUser() { ... }
export function teardownTestData() { ... }
```

**Principle:** Every test cleans up after itself (no test pollution)

---

## VII. ACCEPTANCE CRITERIA PER PHASE

| Phase | Must-Have | Nice-to-Have | Blocker Removal |
|-------|-----------|-------------|-----------------|
| 1 | Env ready, charter signed | Doc complete | DJMEXXICO approval |
| 2 | 85%+ coverage revenue paths | 90%+ all code | Coverage report |
| 3 | All actions tested | Edge cases mocked | Action owner sign-off |
| 4 | P0 flows green | P1+ flows green | 0 flaky tests |
| 5 | Webhook 100% delivery | Retry logic tested | Finance team review |
| 6 | 0 P0/P1 sec findings | 0 P2 findings | Sec audit |
| 7 | Mobile responsive | Dark mode | Design team approval |
| 8 | No data loss, mem stable | All edge cases pass | Stress test report |
| 9 | CI/CD automated | Slack notifications | DevOps sign-off |
| 10 | Production ready | Monitoring live | DJMEXXICO go/no-go |

---

## VIII. RISK LOG (Ongoing)

| Risk | Impact | Mitigation | Owner | Status |
|------|--------|-----------|-------|--------|
| Stripe test mode doesn't match prod | P0 broken in prod | Parallel prod webhook tests before go-live | Payments Agent | 🟡 Pending Phase 5 |
| Neon connection pool exhaustion | Cascade failure | Load test pool limits, set max 20 | R2 Agent | 🟡 Pending Phase 8 |
| Presigned URL timing off by 1h | Users locked out | UTC zone verification, 24h ± 1min tolerance | R2 Agent | 🟡 Pending Phase 5 |
| Rate limit too strict | Users blocked legitimately | Set limits via config, monitor for false positives | Sec Agent | 🟡 Pending Phase 8 |
| Webhook handler timeout > 5s | Orders delayed | Async webhook processing, investigate latency | Payments Agent | 🟡 Pending Phase 5 |

---

## IX. MEASUREMENT & REPORTING

### 9.1 Test Quality Metrics
- **Coverage:** Lines of code tested (target ≥ 85%)
- **Flakiness:** Tests that fail intermittently (target 0)
- **Execution Time:** Total test run (target < 15 min local, < 30 min CI)
- **FIS Breakdown:** Revenue risk prevented per phase

### 9.2 Defect Metrics
- **Bug Escape Rate:** Bugs discovered post-prod ÷ total bugs (target < 1%)
- **Critical Defects:** P0/P1 bugs found (should be 0 at Phase 10)
- **Remediation Time:** Time to fix if found (tracked but target N/A)

### 9.3 Phase Reporting Template
```markdown
## Phase X Report

**Status:** ✅ PASS | 🟡 IN PROGRESS | ❌ FAILED

**Coverage:** X% (target Y%)
**Tests Run:** N passed, M failed, K skipped
**Execution Time:** Z minutes
**Critical Findings:** 0 P0/P1, N P2+

**Blockers:** [list or "none"]
**Next Phase Ready:** Yes | No

**Sign-offs:**
- [ ] Orchestrator Agent
- [ ] Respective Sub-Agent
- [ ] DJMEXXICO (P0 findings)
```

---

## X. PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production, verify:

```
SECURITY (Phase 6)
  ✅ No auth bypass vectors
  ✅ All protected routes gated
  ✅ Presigned URLs verified expiring
  ✅ Rate limits operational
  ✅ Input validation server-side

REVENUE PATHS (Phases 4–5)
  ✅ Beat purchase E2E green
  ✅ Subscription + webhooks green
  ✅ Artist upload + admin queue green
  ✅ Stripe webhook retry logic tested
  ✅ All 10 priority areas P0/P1 green

OPERATIONS (Phase 1–3)
  ✅ Error monitoring live (Sentry/etc)
  ✅ Webhook alerting live
  ✅ Admin queue notifications working
  ✅ R2 file health verified
  ✅ Database backups configured

PERFORMANCE (Phase 7–8)
  ✅ Lighthouse ≥ 80 (mobile), ≥ 90 (desktop)
  ✅ Core Web Vitals passing
  ✅ Load test (100 concurrent) ✅
  ✅ Memory stable over 1h

TEAM READINESS
  ✅ DJMEXXICO reviewed all test reports
  ✅ Runbook created (if X, do Y)
  ✅ Stripe + Discord + Resend credits loaded
  ✅ Customer support team briefed
  ✅ Rollback plan documented

On failure: Roll back, fix, re-test Phase 1–5 min.
```

---

## XI. RUNNING TESTS LOCALLY (Quick Reference)

```bash
# Install
npm install --save-dev vitest playwright @playwright/test

# Unit tests only (fast)
npm run test:unit

# Integration tests (medium)
npm run test:integration

# E2E tests (slow, requires servers)
npm run test:e2e

# Full suite (all three, sequential)
npm run test

# Coverage report
npm run test:coverage

# Watch mode (dev friendly)
npm run test:watch
```

---

## XII. TIMELINE & RESOURCE ALLOCATION

| Phase | Days | Sub-Agent(s) | Effort |
|-------|------|-------------|--------|
| 1 | 1 | Orchestrator | 4h |
| 2 | 2 | All | 24h |
| 3 | 2 | Payments, R2, Auth | 24h |
| 4 | 2 | E2E | 16h |
| 5 | 2 | Payments | 16h |
| 6 | 2 | Auth | 16h |
| 7 | 2 | UI/UX, Perf | 16h |
| 8 | 2 | Perf, Edge Cases | 20h |
| 9 | 1 | Orchestrator | 8h |
| 10 | 1 | Orchestrator | 4h |
| **TOTAL** | **17 days** | — | **148h** |

---

## XIII. ESCALATION & SIGN-OFF

**If Phase X blocks → escalate immediately to DJMEXXICO with:**
1. Exact blocking test case
2. Reproduction steps
3. Recommended fix (with code sample)
4. Impact on downstream phases

**DJMEXXICO approval required before:**
- Phase 5 launch (affects revenue)
- Phase 9 deployment (goes live)
- Any critical security finding

---

## XIV. POST-LAUNCH MONITORING

After production deployment:

```
🔴 CRITICAL ALERTS
  • Stripe webhook failure rate > 5% (5 min)
  • R2 file access > 1s latency (10 min)
  • Error rate > 1% (real users)
  • Discord role sync failure (immediate)

🟡 NON-URGENT ALERTS
  • Lighthouse drop > 10 points (daily)
  • Rate limit false positives (daily)
  • Memory creep > 20% (daily)

📊 DASHBOARDS (weekly review)
  • Revenue tracked → orders
  • Refund rate (target < 1%)
  • Subscriber churn (target < 5%/mo)
  • Customer support tickets (target < 5/day)
```

---

## XV. CONCLUSION

This is a **comprehensive, profit-focused testing strategy** that:
- ✅ Prioritizes revenue protection (FIS-ranked)
- ✅ Ensures automation reliability (0 manual work)
- ✅ Scales with confidence (phases, risk log, metrics)
- ✅ Respects DJMEXXICO's time (clear deliverables, 17-day timeline)
- ✅ Maintains code quality (modular, maintainable tests)

**Next Step:** Confirm you're ready, then say **"Begin with Phase 1"** and I'll generate the exact files, setup commands, and code.

---

**Signed Off By:** [Awaiting DJMEXXICO approval]
