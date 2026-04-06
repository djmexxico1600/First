# Developer Experience Guide

Excellent developer experience is critical for rapid iteration, code quality, and team satisfaction. This guide covers local development setup, testing tools, code generation, and productivity improvements.

## Quick Start

### Prerequisites
- Node.js 22.16.0+
- npm 10.9.2+
- PostgreSQL 15+ (or use Docker)
- Git 2.40+

### Local Development Setup (5 minutes)

```bash
# Clone repository
git clone https://github.com/djmexxico1600/First.git
cd First

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

### Docker Setup

```bash
# Start PostgreSQL container
docker run -d \
  --name first-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=first \
  -p 5432:5432 \
  postgres:15

# Run migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed
```

## Development Scripts

### Server & Build
```bash
npm run dev           # Start dev server with hot reload
npm run build         # Build for production
npm run start         # Start production server
npm run preview       # Preview production build locally
```

### Testing
```bash
npm run test:unit     # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e      # Run end-to-end tests (if available)
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues
npm run type-check    # Run TypeScript type checking
npm run format        # Format code with Prettier
```

### Database
```bash
npm run db:migrate    # Run migrations
npm run db:rollback   # Rollback latest migration
npm run db:seed       # Seed database with test data
npm run db:reset      # Full reset (drop & recreate)
npm run db:studio     # Open Drizzle Studio
```

## Project Structure

```
First/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── api/       # API routes
│   │   ├── (pages)/   # Page components
│   │   └── layout.tsx # Root layout
│   ├── components/    # Reusable React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   │   ├── api-middleware.ts
│   │   ├── cache-utils.ts
│   │   ├── db-scaling.ts
│   │   ├── error-handler.ts
│   │   ├── logger.ts
│   │   └── performance-profiler.ts
│   ├── types/         # TypeScript type definitions
│   │   └── api.ts     # API request/response types
│   ├── middleware.ts  # Next.js middleware
│   └── styles/        # Global styles
├── tests/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── e2e/          # End-to-end tests
├── docs/              # Documentation
├── .env.example       # Environment template
├── eslintrc.json      # ESLint configuration
├── next.config.ts     # Next.js configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies and scripts
```

## API Development

### Creating a New API Endpoint

**Step 1: Define Types**
```typescript
// src/types/api.ts
export interface GetBeatsRequest {
  genre?: string;
  limit?: number;
  offset?: number;
}

export interface Beat {
  id: string;
  title: string;
  genre: string;
  price: number;
}

export interface GetBeatsResponse {
  beats: Beat[];
  total: number;
}
```

**Step 2: Create Route Handler**
```typescript
// src/app/api/beats/route.ts
import { withErrorHandler } from '@/lib/api-middleware';
import { getCacheControl, CACHE_PRESETS } from '@/lib/cache-utils';

export async function GET(req: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(req.url);
    
    const beats = await db.query.beats.findMany({
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    });
    
    const response = new Response(JSON.stringify(beats), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    return setCacheControl(response, CACHE_PRESETS.MEDIUM);
  });
}
```

**Step 3: Add Tests**
```typescript
// tests/unit/api/beats.test.ts
describe('GET /api/beats', () => {
  it('should return beats with pagination', async () => {
    const res = await GET(
      new Request('http://localhost:3000/api/beats?limit=10&offset=0')
    );
    
    const data = await res.json();
    expect(data).toHaveProperty('beats');
    expect(Array.isArray(data.beats)).toBe(true);
  });
});
```

### Using the API

**Client-side Usage**
```typescript
// Hook for fetching beats
const useBeats = (genre?: string) => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    
    fetch(`/api/beats?${params}`)
      .then(r => r.json())
      .then(({ beats }) => setBeats(beats))
      .finally(() => setLoading(false));
  }, [genre]);
  
  return { beats, loading };
};
```

## Testing

### Unit Testing Examples

```typescript
import { describe, it, expect } from 'vitest';
import { ErrorFactory } from '@/lib/error-handler';

describe('ErrorFactory', () => {
  it('should create NotFound error', () => {
    const error = ErrorFactory.NotFound('Beat not found');
    
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Beat not found');
  });
});
```

### Test Utilities

```typescript
import { testUtils } from '@/tests/test-utils';

// Use factory functions for test data
const testUser = testUtils.validUser;
const testBeat = testUtils.validBeat;

// Mock database calls
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      beats: {
        findMany: vi.fn().mockResolvedValue([testBeat])
      }
    }
  }
}));
```

## Performance Tips

### 1. Development Performance

**Enable filesystem caching**
```bash
npm run dev -- --turbo  # Use Turbopack for faster builds
```

**Monitor bundle size**
```bash
npm run build -- --analyze  # Analyze bundle size
```

### 2. Testing Performance

**Run tests in watch mode**
```bash
npm run test:watch      # Auto-rerun changed tests
```

**Run specific test file**
```bash
npm run test:unit -- logger.test.ts
```

### 3. Database Performance

**Use query profiler in development**
```typescript
import { timeAsync } from '@/lib/performance-profiler';

const beats = await timeAsync(
  () => db.query.beats.findMany(),
  'fetch-beats'
);
```

## Code Style & Standards

### ESLint Rules

The project uses strict ESLint configuration with:
- Next.js recommended rules
- TypeScript type checking
- React hooks best practices
- Import sorting

**Auto-fix on save:**
Add to VS Code `.vscode/settings.json`:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### TypeScript Configuration

- Strict mode enabled
- No implicit any
- No implicit returns
- Strict null checks

### Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// Classes: PascalCase
class ErrorFactory { }
class DatabaseRouter { }

// Functions: camelCase
function getCacheControl() { }
const fetchBeats = async () => { };

// Files: 
// - Components: PascalCase (MyComponent.tsx)
// - Utilities: camelCase (utils.ts)
// - Types: camelCase with .d.ts or in types/ (api.ts)
```

## Debugging

### VS Code Debugging

**Create `.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Run with debugging:**
```bash
NODE_OPTIONS='--inspect' npm run dev
```

### Request Logging

The logger automatically tracks:
- Request IDs (unique per request)
- Response times
- Database queries
- External API calls
- Error stack traces

Access logs in development:
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: 'user123' });
logger.warn('Cache miss detected', { operation: 'fetch-beats' });
logger.error('Database query failed', { sql: '...' });
```

## Contributing

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Test additions/updates
- `chore`: Build/dependency updates

**Examples:**
```
feat(cache): Add Redis support for distributed caching
fix(api): Handle concurrent requests correctly
docs(scaling): Add database replication guide
perf(bundle): Reduce initial JS by 15KB
```

### Pull Request Process

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit: `git commit -m "feat(scope): message"`
3. Run tests: `npm run test:unit && npm run test:coverage`
4. Run linter: `npm run lint:fix`
5. Push to GitHub: `git push origin feat/my-feature`
6. Open pull request with description
7. Address review comments
8. Merge when approved

## IDE Extensions (VS Code)

**Recommended Extensions:**
- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin
- Thunder Client (API testing)
- PostgreSQL Explorer
- GitLens

**Settings Override** (`.vscode/settings.json`):
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Environment Variables

**Development (`.env.local`):**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/first"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
LOG_LEVEL="debug"
NODE_ENV="development"
```

**Production:**
```bash
DATABASE_URL="postgresql://user:password@prod.db:5432/first"
NEXT_PUBLIC_API_URL="https://api.example.com"
LOG_LEVEL="info"
NODE_ENV="production"
```

## Common Tasks

### Add a New Library

```bash
# Install package
npm install new-package

# Save type definitions (if needed)
npm install --save-dev @types/new-package

# Update package.json automatically
npm update
```

### Run Database Migrations

```bash
# Create new migration
npm run db:migrate:create -- --name add_beats_table

# Run all pending migrations
npm run db:migrate

# View migration status
npm run db:migrate:status
```

### Generate API Documentation

```bash
# Auto-generate from route handlers
npm run generate:api-docs

# Output to API_DOCS.md
```

## Troubleshooting

### ESLint Errors After Git Merge

```bash
npm run lint:fix    # Auto-fix all issues
git add -A
git commit -m "fix: resolve linting issues from merge"
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres

# Verify connection string
DATABASE_URL

# Run test query
npm run db:test-connection
```

### Module Not Found Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Vitest Documentation](https://vitest.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last Updated**: Phase 6 - Developer Experience
**Maintenance**: Review with team feedback
