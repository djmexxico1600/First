# Contributing Guide

## Welcome!

This guide will help you contribute to the DJMEXXICO platform and maintain our world-class standards.

## Getting Started

### Prerequisites
- Node.js 22.16.0+
- npm 10.9.2+
- PostgreSQL (or Neon account)
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/djmexxico1600/First.git
cd First
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```bash
cp .env.example .env.local
# Add your credentials
```

4. Start development server:
```bash
npm run dev
```

Open http://localhost:3000

## Code Standards

### TypeScript

- **Strict mode**: All code must pass TypeScript strict checks
- **No `any`types**: Use proper typing (describe specifics)
- **Interfaces for contracts**: Public functions need types

✅ Good:
```typescript
interface User {
  id: string;
  email: string;
  tier: 'basic' | 'pro' | 'vip';
}

async function getUser(id: string): Promise<User> {
  // ...
}
```

❌ Bad:
```typescript
async function getUser(id: any): any {
  // ...
}
```

### Error Handling

All API endpoints must handle errors properly:

✅ Good:
```typescript
try {
  const user = await db.query.users.findUnique(id);
  if (!user) {
    throw ErrorFactory.notFound('User');
  }
  return apiResponse(user);
} catch (error) {
  logger.error('Failed to fetch user', error, { id });
  return apiError(error);
}
```

❌ Bad:
```typescript
async function getUser(id) {
  const user = await db.query.users.findUnique(id);
  return user; // No error handling!
}
```

### Logging

Log important operations for observability:

✅ Good:
```typescript
logger.info('User purchase', { userId, beatId, amount }, requestId);
logger.error('Payment failed', error, { orderId, gateway }, requestId);
```

❌ Bad:
```typescript
console.log('payment result:', result); // Won't go to external service
// No request ID to trace the issue
```

## Testing Requirements

All code changes must include tests:

- Unit tests for utilities, validators, formatters
- Integration tests for database operations  
- API tests for endpoints

### Run Tests

```bash
npm run test:unit         # Unit tests
npm run test:unit:watch  # Watch mode
npm run test:coverage    # Coverage report
```

**Minimum Coverage**: 80% for new code

### Test Template

```typescript
import { describe, it, expect  } from 'vitest';
import { myFunction } from '@/lib/my-function';

describe('myFunction', () => {
  it('should work for valid input', () => {
    const result = myFunction('test');
    expect(result).toBe('expected');
  });

  it('should throw for invalid input', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## API Design

### Response Format

All APIs must use standardized response:

```json
{
  "success": true,
  "data": { /* response */ },
  "timestamp": "2026-04-06T21:00:00.000Z"
}
```

Errors:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description",
    "requestId": "trace-id"
  }
}
```

### Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Auth failed
- `403 Forbidden`: No permission
- `404 Not Found`: Resource missing
- `409 Conflict`: Resource exists
- `429 Too Many Requests`: Rate limited
- `402 Payment Required`: Payment issue
- `500 Internal Error`: Server error
- `503 Service Unavailable`: Dependency down

## Validation

Always validate input:

✅ Good:
```typescript
const data = validateInput(beatPurchaseSchema, req.body);
// data is guaranteed valid
```

❌ Bad:
```typescript
const beatId = req.body.beatId; // No validation!
```

## Database Changes

For schema changes:

1. Update `src/lib/db/schema.ts`
2. Generate migration:
```bash
npm run db:generate
```

3. Review migration file
4. Test locally
5. Push to repository

Always write migrations, never script schema changes.

## Commit Messages

Follow conventional commits:

```
type(scope): short description

- Detailed point 1
- Detailed point 2

Fixes #123
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`

Examples:
```
feat(beats): Add beat filtering by genre
fix(stripe): Handle payment retry correctly  
docs(api): Update endpoint documentation
test(auth): Add Clerk webhook tests
```

## Pull Request Process

1. Create feature branch:
```bash
git checkout -b feature/my-feature
```

2. Make changes & commit:
```bash
git add .
git commit -m "feat(scope): description"
```

3. Push branch:
```bash
git push origin feature/my-feature
```

4. Create Pull Request on GitHub
5. Ensure CI passes (tests, linting)
6. Request review
7. Address feedback
8. Merge when approved

## Before You Submit

1. **Build passes**: `npm run build`
2. **Tests pass**: `npm run test:unit`
3. **No lint errors**: `npm run lint`
4. **Types check**: `npm run type-check`
5. **Code is documented**: Add comments for complex logic
6. **Tests included**: New features have test coverage
7. **Commit message clear**: Descriptive message

## Common Workflows

### Adding a New API Endpoint

1. Create route file: `src/app/api/[resource]/route.ts`
2. Add validation schema to `src/lib/validators.ts`
3. Implement handler with error handling
4. Add tests in `tests/unit/[resource].test.ts`
5. Document in `API_DOCS.md`
6. Update CHANGELOG

### Adding Database Table

1. Add table to `src/lib/db/schema.ts`
2. Define TypeScript types in `src/types/database.ts`
3. Run `npm run db:generate`
4. Review migration file
5. Add queries to `src/lib/[model]/actions.ts`
6. Add tests

### Adding Validation Rule

1. Create schema in `src/lib/validators.ts`
2. Add tests to `tests/unit/validators.test.ts`
3. Use in API handler: `const data = validateInput(schema, req.body)`
4. Document error cases

## Troubleshooting

### TypeScript Errors
```bash
npm run type-check  # Find all issues
npx tsc --noEmit   # Detailed output
```

### Test Failures
```bash
npm run test:unit -- --reporter=verbose  # Detailed output
```

### Build Failures
```bash
npm run build  # See full error
rm -rf .next   # Clear cache
npm run build  # Try again
```

## Performance Guidelines

- Keep bundle size min: Use dynamic imports
- API response < 200ms: Optimize DB queries
- Cache static content: Use CDN
- Monitor metrics: Review MONITORING.md

## Security Guidelines

- Never commit secrets: Use environment variables
- Validate all input: Use validators
- Escape output: React handles this
- Check auth: Use `currentUser()` from Clerk
- Rate limit endpoints: Prevents abuse

## Documentation

- Comment complex logic
- Document parameters: `@param`, `@returns`
- Keep README updated
- Update API_DOCS.md when adding endpoints
- Update ARCHITECTURE.md for major changes

## Questions?

- Check documentation in `/docs`
- Review existing code for patterns
- Ask in team Slack
- File issue on GitHub

Thank you for contributing! 🎉
