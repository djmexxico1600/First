# Governance & Compliance Guide

Enterprise-grade platforms require clear governance, compliance standards, and quality policies. This guide establishes the frameworks for code governance, legal compliance, and operational standards.

## Code Governance

### 1. Code Review Policy

**Review Requirements**
- Minimum 1 approval required for merge (or 2 for main/production)
- All CI checks must pass
- Code coverage must not decrease by >1%
- No conflicts with base branch
- All conversations must be resolved

**Review Timeline**
- Target review time: 4 business hours
- Maximum pending time: 24 hours
- Blocking issues: Escalate to tech lead

**Reviewers**
- Automatic assignment based on CODEOWNERS
- Minimum 2 reviewers for critical paths (auth, payments, data)
- Primary reviewer must approve
- Secondary reviewer sign-off required

### 2. Branch Management

**Branch Strategy: Git Flow**
```
main (production releases)
├── develop (integration branch)
│   ├── feature/feature-name
│   ├── bugfix/bugfix-name
│   └── hotfix/hotfix-name (from main if production emergency)
```

**Branch Naming Conventions**
```
feature/user-authentication    # New feature
bugfix/payment-processing      # Bug fix
hotfix/critical-security-patch # Emergency fix
refactor/database-layer        # Code refactoring
docs/api-documentation         # Documentation
test/integration-tests         # Test additions
```

**Branch Protection Rules**
- `main`: Production deployments only
  - Require PR reviews: 2 approvals
  - Require status checks to pass
  - Enforce code review stale (dismiss old PRs)
  - Restrict who can push: Release managers only

- `develop`: Integration branch
  - Require PR reviews: 1 approval
  - Require status checks to pass
  - Allow squash merge only

### 3. Commit Standards

**Commit Message Template**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Commit Types**
```
feat    - New feature
fix     - Bug fix
docs    - Documentation
style   - Code style changes (formatting, etc)
refactor - Code refactoring without feature changes
perf    - Performance improvements
test    - Test additions/updates
chore   - Build, CI, dependency updates
```

**Example Commits**
```
feat(auth): add OAuth2 integration

- Implement Google OAuth provider
- Add token refresh mechanism
- Update auth middleware

Closes #523
BREAKING CHANGE: Auth API now requires OAuth integration

---

fix(db): handle concurrent query execution

Prevents race condition in transaction handling
when multiple clients execute queries simultaneously.

Fixes #1245
```

**Commit Best Practices**
- One commit per logical change
- Keep commits atomic and focused
- Write descriptive messages (50 char subject, detailed body)
- Reference issues: `Fixes #123`, `Closes #456`
- Mention breaking changes: `BREAKING CHANGE:`

### 4. Pull Request Standards

**PR Template**
```markdown
## Description
Brief description of changes...

## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Performance
- [ ] Breaking Change

## Related Issues
Fixes #123
Related to #456

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (unless noted)
- [ ] Tests pass locally
```

**PR Size Guidelines**
- Small: < 200 lines (target)
- Medium: 200-500 lines (acceptable)
- Large: > 500 lines (requires justification)
- Limit: Never > 1000 lines in single PR

**Merge Strategy**
```bash
# Squash merges for feature branches (clean history)
git merge --squash feature/my-feature

# No fast-forward for develop/main (preserves branch structure)
git merge --no-ff develop
```

## Compliance & Legal

### 1. GDPR Compliance

**Data Protection Requirements**
- User consent required for data collection
- Clear privacy policy
- Right to data access
- Right to be forgotten
- Data breach notification (72 hours)

**Implementation**
```typescript
// Consent management
const gdprConsent = {
  marketing: false,      // Explicit opt-in
  analytics: true,       // Can default to true
  necessary: true,       // Always required
  timestamp: Date.now(),
};

// Data retention policy
const retentionDays = {
  userActivity: 90,
  analyticsLogs: 365,
  errorLogs: 30,
  userPersonalData: 'until_deleted', // Indefinite until deletion
};
```

**Right to be Forgotten**
```typescript
// Complete user data deletion
const deleteUserData = async (userId: string) => {
  // Remove personal data
  await db.delete(users).where({ id: userId });
  
  // Remove activity logs
  await db.delete(activityLogs).where({ userId });
  
  // Remove from analytics
  await analyticsService.deleteUser(userId);
  
  // Remove from backups (handled by backup policy)
  // Remove from third parties (payment processor, etc)
  
  logger.info('User data deleted', { userId });
};
```

### 2. SOC 2 Compliance

**Access Control**
- MFA required for production access
- Role-based access control (RBAC)
- Principle of least privilege
- Regular access reviews (quarterly)

**Audit Logging**
```typescript
// Every privileged action must be logged
const logAuditEvent = (
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  resource: string,
  changes: Record<string, any>
) => {
  return auditLog.create({
    userId,
    action,
    resource,
    changes,
    timestamp: Date.now(),
    ipAddress: getClientIp(),
  });
};
```

**Encryption**
- TLS 1.3 for all external communication
- At-rest encryption for sensitive data
- Database column encryption for PII
- Regular key rotation (annually)

### 3. Payment Card Industry (PCI) DSS

**Compliance Requirements**
- No direct cardholder data in application
- Use PCI-compliant payment processor (Stripe)
- Regular security testing
- Incident response plan
- Secure network architecture

**Implementation**
```typescript
// Never store card data - use tokenization
const processPayment = async (amount: number, stripeTokenId: string) => {
  // Token comes from Stripe, not raw card
  const charge = await stripe.charges.create({
    amount,
    currency: 'usd',
    source: stripeTokenId,
  });
  
  // Only store transaction ID
  await db.insert(transactions).values({
    transactionId: charge.id,
    amount,
    status: charge.status,
  });
};
```

## Quality Standards

### 1. Code Quality Metrics

**Threshold Requirements**
```
Test Coverage:      > 80%
Code Quality:       A (SonarQube)
Duplication:        < 3%
Maintainability:    < 100 (cyclomatic complexity)
Security Rating:    A
```

**Quality Gates**
- Build fails if coverage drops below threshold
- Code review fails if quality score < A
- Deployment blocks on failing quality gates

### 2. Performance Standards

**Performance Thresholds**
```
API Response Time (p95):  200ms
Page Load Time:           3s
Database Query Time:      50ms
Cache Hit Ratio:          > 80%
```

**Performance Regression Testing**
- Automatic benchmarks on every PR
- Alert if performance regresses > 5%
- Block merge if critical regression

### 3. Security Standards

**Vulnerability Management**
```
- npm audit: No vulnerabilities allowed
- Dependency scanning: Weekly
- Code scanning: Every PR
- Penetration testing: Quarterly
```

**Security Update Policy**
```
Critical:  Patch within 24 hours
High:      Patch within 7 days
Medium:    Patch within 30 days
Low:       Patch within 90 days
```

## Version Management

### 1. Semantic Versioning

**Version Format: MAJOR.MINOR.PATCH**

```
1.2.3
│ │ └─ PATCH: Bug fixes (increment on backward compatible fix)
│ └─── MINOR: New features (increment on new backward compatible feature)
└───── MAJOR: Breaking changes (increment on incompatible API change)
```

**Version Examples**
```
1.0.0    - Initial release
1.1.0    - New feature added
1.1.1    - Bug fix
2.0.0    - Breaking API change
```

### 2. Release Process

**Release Schedule**
- Major: Quarterly or when significant features complete
- Minor: Monthly or as features complete
- Patch: Weekly or as bugs are fixed

**Release Checklist**
- [ ] Update CHANGELOG.md
- [ ] Update version in package.json
- [ ] Update API_DOCS.md if needed
- [ ] Run full test suite
- [ ] Create GitHub Release
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Update release notes

**Release Notes Template**
```markdown
## Version 1.2.0 - 2024-01-15

### ✨ Features
- Add real-time beat updates via WebSocket
- Implement advanced search filters

### 🐛 Bug Fixes
- Fix payment processing race condition
- Resolve memory leak in connection pool

### 🚀 Performance
- Optimize database queries (50% faster)
- Reduce bundle size by 25K

### 📚 Documentation
- Add API authentication guide
- Update database schema documentation

### ⚠️ Breaking Changes
- Authentication endpoint moved from `/auth` to `/api/auth`
- Update API clients accordingly

### 🙏 Thanks
Thank you to @user1, @user2 for contributions!
```

### 3. Deprecation Policy

**Deprecation Timeline**
1. **Announce**: 4 weeks advance notice
2. **Warning**: 4-8 weeks with deprecation warnings in code
3. **Migration**: 4 weeks migration window
4. **Removal**: Remove in next major version

**Deprecation Warning Format**
```typescript
// @deprecated Use fetchBeatsV2 instead. Will be removed in v3.0.0
export async function fetchBeats() {
  logger.warn(
    'fetchBeats is deprecated, use fetchBeatsV2 instead',
    { deprecatedSince: 'v2.0.0', willRemoveIn: 'v3.0.0' }
  );
  // ...
}
```

## Operational Standards

### 1. Incident Response

**Severity Levels**
```
SEV-1 (Critical): Service down, data loss risk
  → Immediate response, all hands
  
SEV-2 (High): Major feature broken
  → Response within 1 hour, escalated team
  
SEV-3 (Medium): Feature degraded
  → Response within 4 hours
  
SEV-4 (Low): Minor issue, workaround exists
  → Response within 24 hours
```

**Incident Process**
1. Declare incident with severity level
2. Page on-call team
3. Open incident channel
4. Implement fix or workaround
5. Post-mortem within 24 hours
6. Document learnings

### 2. Change Management

**Change Classification**
```
Low Risk: Config changes, documentation, non-critical features
Medium Risk: Database migrations, API changes, feature flags
High Risk: Authentication changes, payment processing, data schema
```

**Change Approval**
- Low: 1 review, deploy to production directly
- Medium: 2 reviews, test in staging first
- High: Architecture review, full test suite, change advisory board

### 3. Data Protection

**Data Classification**
```
Public: Metadata, documentation
Internal: Usage metrics, logs
Confidential: User accounts, email addresses
Restricted: Passwords, API keys, payment data
```

**Data Handling**
- Restricted: Encrypted at rest and in transit
- Confidential: Encrypted, limited access
- Internal: Non-encrypted, limited access
- Public: No restrictions

## Audit & Compliance

### 1. Regular Audits

**Schedule**
- Monthly: Code quality review
- Quarterly: Security audit
- Quarterly: Access control review
- Annually: Full SOC 2 audit

### 2. Compliance Checklist

- [ ] Security testing completed
- [ ] Dependency vulnerabilities addressed
- [ ] Access logs reviewed
- [ ] Encryption validated
- [ ] GDPR compliance verified
- [ ] Data retention policies enforced
- [ ] Incident response tested
- [ ] Disaster recovery tested

## References

- [GDPR Official](https://gdpr-info.eu/)
- [PCI DSS Standards](https://www.pcisecuritystandards.org/)
- [SOC 2 Compliance](https://www.aicpa.org/interestareas/informationtechnology/sodp-system-and-organization-controls.html)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Last Updated**: Phase 7 - Governance & Compliance
**Review Frequency**: Quarterly
**Policy Owner**: Technical Leadership
