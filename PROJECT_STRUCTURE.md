# DJMEXXICO Platform - Complete Project Structure

**Last Updated**: April 6, 2026  
**Status**: Ready for Full Implementation  
**Version**: 1.0 (Complete Reference)

---

## Table of Contents

1. [Root Directory Structure](#root-directory-structure)
2. [Core Configuration Files](#core-configuration-files)
3. [Source Directory (/src)](#source-directory-src)
4. [Implementation Steps](#implementation-steps)

---

## Root Directory Structure

```
djmexxico/
├── .env.example                 # Environment variables template
├── .env.local                   # Local env (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .github/
│   ├── workflows/
│   │   ├── build.yml           # CI/CD pipeline
│   │   ├── lint.yml            # Linting checks
│   │   └── deploy.yml          # Deployment workflow
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── drizzle.config.ts           # Drizzle ORM config
├── instrumentation.ts          # OpenTelemetry setup
├── next.config.ts              # Next.js configuration
├── next-env.d.ts               # Next.js types (auto-generated)
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked versions
├── postcss.config.mjs          # PostCSS config
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── src/
├── public/                      # Static assets
├── docs/
│   ├── ARCHITECTURE.md         # System design
│   ├── API_REFERENCE.md        # API documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── FEATURES.md             # Feature list
│   ├── QUICK_START.md          # Quick start guide
│   └── TROUBLESHOOTING.md      # Common issues
├── README.md
└── BUILD_ASSESSMENT.md         # Build status report
```

---

## Core Configuration Files

### .env.example
```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/djmexxico

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Storage
R2_ACCOUNT_ID=xxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxx
R2_BUCKET_NAME=djmexxico
PUBLIC_R2_URL=https://cdn.djmexxico.com

# Email
RESEND_API_KEY=re_xxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### package.json
```json
{
  "name": "djmexxico",
  "version": "1.0.0",
  "description": "Beats marketplace, artist management, and car build content platform",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push:pg",
    "format": "prettier --write .",
    "analyze": "ANALYZE=true next build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.0.0",
    "@clerk/nextjs": "^5.0.0",
    "@t3-oss/env-nextjs": "^0.8.0",
    "zod": "^3.22.0",
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "pg": "^8.11.0",
    "stripe": "^14.0.0",
    "axios": "^1.6.0",
    "next-superjson-plugin": "^0.6.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "framer-motion": "^10.16.0",
    "react-hot-toast": "^2.4.1",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.0",
    "lucide-react": "^0.294.0",
    "nanoid": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/pg": "^8.11.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "autoprefixer": "^10.4.0",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8.54.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.4.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "ignoreDeprecations": "6.0",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.djmexxico.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
  eslint: {
    dirs: ["src"],
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
```

### .eslintrc.json
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-img-element": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

---

## Source Directory (/src)

### Directory Structure
```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── middleware.ts            # Auth middleware
│   ├── api/
│   │   └── webhooks/
│   │       ├── clerk/
│   │       │   └── route.ts     # Clerk sync webhook
│   │       ├── stripe/
│   │       │   └── route.ts     # Stripe events webhook
│   │       └── events/
│   │           └── route.ts     # Analytics endpoint
│   ├── beats/
│   │   └── page.tsx             # Beats marketplace
│   ├── management/
│   │   └── page.tsx             # Artist management page
│   ├── car/
│   │   └── page.tsx             # Car build gallery
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── page.tsx             # Dashboard home
│   │   ├── uploads/
│   │   │   └── page.tsx         # Upload management
│   │   └── orders/
│   │       └── page.tsx         # Order history
│   └── admin/
│       ├── layout.tsx           # Admin layout
│       ├── page.tsx             # Admin dashboard
│       └── uploads/
│           └── page.tsx         # Upload approval
├── components/                   # Reusable UI components
│   ├── index.tsx               # Component exports
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Dialog.tsx
│   ├── Select.tsx
│   ├── Toast/
│   │   └── Toaster.tsx
│   ├── BeatCard.tsx            # Beat purchase card
│   ├── ArtistUploadForm.tsx    # Upload interface
│   ├── ErrorBoundary.tsx       # Error handling
│   ├── ToastProvider.tsx       # Toast notifications
│   └── Skeleton.tsx            # Loading skeleton
├── lib/
│   ├── env.ts                  # Environment validation
│   ├── errors.ts               # Custom error classes
│   ├── logger.ts               # Structured logging
│   ├── analytics.ts            # Event tracking
│   ├── apiResponse.ts          # Standard API responses
│   ├── validators.ts           # Zod validation schemas
│   ├── rateLimit.ts            # Rate limiting
│   ├── toast.ts                # Toast notifications
│   ├── db/
│   │   ├── client.ts           # Drizzle client
│   │   ├── schema.ts           # Database schema
│   │   └── migrations/         # Auto-generated migrations
│   ├── beats/
│   │   ├── actions.ts          # Beat server actions
│   │   └── products.ts         # Product definitions
│   ├── stripe/
│   │   ├── actions.ts          # Stripe server actions
│   │   ├── products.ts         # Stripe product config
│   │   └── webhook.ts          # Webhook handlers
│   ├── clerk/
│   │   └── webhook.ts          # User sync webhook
│   ├── r2/
│   │   ├── actions.ts          # R2 server actions
│   │   └── client.ts           # R2 SDK client
│   ├── email/
│   │   ├── index.ts            # Resend client
│   │   └── templates.ts        # Email templates
│   ├── management/
│   │   └── actions.ts          # Subscription actions
│   └── car/
│       └── actions.ts          # Car content actions
├── types/                       # Shared TypeScript types
│   ├── index.ts
│   ├── api.ts
│   ├── database.ts
│   └── errors.ts
└── styles/
    ├── globals.css             # Global styles
    └── variables.css           # CSS custom properties
```

---

## Implementation Steps

### Phase 1: Foundation (Project Setup)
**Time**: 1-2 hours  
**Goal**: Configure project basics and database

1. **Initialize Next.js project**
   - Set up package.json with all dependencies
   - Configure TypeScript (tsconfig.json)
   - Set up Next.js config (next.config.ts)
   - Configure Tailwind CSS (tailwind.config.ts)

2. **Configure Environment Variables**
   - Create .env.example template
   - Set up environment variable validation (src/lib/env.ts)
   - Configure local .env.local (gitignored)

3. **Database Setup**
   - Initialize Drizzle ORM (drizzle.config.ts)
   - Create database schema (src/lib/db/schema.ts)
   - Set up database client (src/lib/db/client.ts)
   - Generate and run migrations

4. **Configure External Services**
   - Connect to Neon PostgreSQL
   - Set up Clerk credentials
   - Set up Stripe API keys
   - Configure Cloudflare R2

---

### Phase 2: Core Infrastructure (Backend Utilities)
**Time**: 2-3 hours  
**Goal**: Build foundation libraries and error handling

1. **Error Handling System**
   - Create custom error classes (src/lib/errors.ts)
   - Implement error handling utilities
   - Set up error logging

2. **Logging & Analytics**
   - Set up structured logger (src/lib/logger.ts)
   - Implement event analytics (src/lib/analytics.ts)
   - Set up instrumentation.ts for monitoring

3. **Validation & Response Handling**
   - Create Zod validation schemas (src/lib/validators.ts)
   - Set up standard API response format (src/lib/apiResponse.ts)

4. **Utilities**
   - Rate limiting (src/lib/rateLimit.ts)
   - Toast notifications (src/lib/toast.ts)
   - Helper functions

---

### Phase 3: Authentication & Webhooks
**Time**: 2-3 hours  
**Goal**: Set up authentication and webhook handling

1. **Clerk Integration**
   - Configure Clerk middleware (src/middleware.ts)
   - Implement user sync webhook (src/lib/clerk/webhook.ts)
   - Set up API route (src/app/api/webhooks/clerk/route.ts)

2. **Stripe Configuration**
   - Define Stripe products (src/lib/stripe/products.ts)
   - Implement Stripe webhook (src/lib/stripe/webhook.ts)
   - Set up API route (src/app/api/webhooks/stripe/route.ts)

3. **Analytics Endpoint**
   - Create events API route (src/app/api/webhooks/events/route.ts)
   - Implement event tracking

---

### Phase 4: Service Integrations
**Time**: 2-3 hours  
**Goal**: Connect external services and implement core actions

1. **R2 Storage Integration**
   - Set up R2 client (src/lib/r2/client.ts)
   - Implement presigned URL generation
   - Create upload actions (src/lib/r2/actions.ts)

2. **Email Service**
   - Configure Resend (src/lib/email/index.ts)
   - Create email templates (src/lib/email/templates.ts)

3. **Server Actions**
   - Beats actions (src/lib/beats/actions.ts)
   - Stripe actions (src/lib/stripe/actions.ts)
   - Management actions (src/lib/management/actions.ts)
   - Car actions (src/lib/car/actions.ts)

---

### Phase 5: UI Components
**Time**: 2-3 hours  
**Goal**: Build reusable component library

1. **Base Components**
   - Button, Input, Card, Dialog, Select
   - Toast provider & components
   - Loading skeleton

2. **Feature Components**
   - BeatCard (beat purchase interface)
   - ArtistUploadForm (R2 upload with presigned URL)
   - ErrorBoundary (error catching)

3. **Component Library Export**
   - Set up index.tsx with all exports

---

### Phase 6: Pages & Layouts
**Time**: 3-4 hours  
**Goal**: Build all user-facing pages

1. **Public Pages**
   - Home page (src/app/page.tsx)
   - Beats marketplace (src/app/beats/page.tsx)
   - Management info (src/app/management/page.tsx)
   - Car gallery (src/app/car/page.tsx)

2. **Dashboard Pages** (Protected)
   - Dashboard layout (src/app/dashboard/layout.tsx)
   - Dashboard home (src/app/dashboard/page.tsx)
   - Uploads management (src/app/dashboard/uploads/page.tsx)
   - Order history (src/app/dashboard/orders/page.tsx)

3. **Admin Pages** (Protected)
   - Admin layout (src/app/admin/layout.tsx)
   - Admin dashboard (src/app/admin/page.tsx)
   - Upload approval (src/app/admin/uploads/page.tsx)

4. **Root Layout**
   - Set up root layout (src/app/layout.tsx)
   - Global providers (Clerk, Toast, etc.)

---

### Phase 7: Styling & Theming
**Time**: 1-2 hours  
**Goal**: Apply complete design system

1. **CSS Variables**
   - Set up color system (src/styles/variables.css)
   - Configure light/dark mode

2. **Global Styles**
   - Apply typography (src/styles/globals.css)
   - Set responsive breakpoints
   - Configure animations

---

### Phase 8: Testing & Quality Assurance
**Time**: 2-3 hours  
**Goal**: Ensure build quality and functionality

1. **Type Checking**
   - Run TypeScript compiler (npm run type-check)
   - Fix any type errors

2. **Linting**
   - Run ESLint (npm run lint)
   - Fix any lint issues

3. **Build Verification**
   - npm install (verify dependencies)
   - npm run build (full build)
   - npm run dev (local development)

4. **Testing**
   - Manual smoke tests
   - API endpoint testing
   - Database query verification

---

### Phase 9: Documentation & Deployment Prep
**Time**: 1-2 hours  
**Goal**: Document system and prepare for deployment

1. **Documentation**
   - Verify ARCHITECTURE.md
   - Update API_REFERENCE.md
   - Create QUICK_START.md
   - Update DEPLOYMENT.md

2. **CI/CD Setup**
   - GitHub Actions workflows
   - Automated testing & linting
   - Deployment pipeline

3. **Environment Configuration**
   - Production environment setup
   - Secret management
   - Database backups

---

## Quick Reference: Key File Locations

| Feature | File Path |
|---------|-----------|
| Database Schema | `src/lib/db/schema.ts` |
| Environment Variables | `src/lib/env.ts` |
| Clerk Webhook | `src/lib/clerk/webhook.ts` |
| Stripe Webhook | `src/lib/stripe/webhook.ts` |
| Stripe Actions | `src/lib/stripe/actions.ts` |
| R2 Upload | `src/lib/r2/actions.ts` |
| Beat Actions | `src/lib/beats/actions.ts` |
| Email Templates | `src/lib/email/templates.ts` |
| Middleware (Auth) | `src/middleware.ts` |
| Components | `src/components/` |
| Root Layout | `src/app/layout.tsx` |
| Dashboard Pages | `src/app/dashboard/` |
| Admin Pages | `src/app/admin/` |
| Public Pages | `src/app/{beats,management,car}/` |

---

## Summary

**Total Estimated Time**: 16-22 hours  
**File Count**: ~80+ files (including config, components, pages)  
**Code Quality**: TypeScript strict, ESLint, type-safe APIs  
**Testing Coverage**: Smoke tests, API verification, E2E ready

This structure provides:
✅ Production-grade architecture  
✅ Type safety throughout  
✅ Proper error handling  
✅ Scalable folder organization  
✅ Clear separation of concerns  
✅ Comprehensive documentation  

---

**Next**: Follow the 9 phases in order. Each phase builds on the previous one. Complete and verify each phase before moving to the next.
