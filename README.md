# Next.js Bun Starter

A production-ready Next.js 16 starter with Bun, TypeScript, Tailwind CSS v4, and batteries included.

## Installation

### 1. Create Next.js Project

```bash
npx create-next-app@latest my-project --typescript --eslint --app
cd my-project
```

### 2. Install Runtime Dependencies

```bash
bun add winston rate-limiter-flexible tailwind-merge clsx zod
```

- **winston**: Structured logging with file transports and sensitive-key redaction
- **rate-limiter-flexible**: Per-route rate limiting (Redis-ready for multi-instance)
- **tailwind-merge**: Merge Tailwind CSS classes without style conflicts
- **clsx**: Construct className strings conditionally
- **zod**: Environment variable validation at startup

### 3. Install Development Dependencies

```bash
bun add -d prettier husky lint-staged vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 jsdom
```

- **prettier**: Code formatter
- **husky**: Git hooks manager
- **lint-staged**: Run linters on staged files
- **vitest**: Fast unit test framework
- **@vitejs/plugin-react**: Vite React plugin for Vitest
- **@testing-library/react**: React testing utilities
- **@testing-library/jest-dom**: Custom DOM matchers
- **@vitest/coverage-v8**: Coverage reporting
- **jsdom**: DOM environment for tests

### 4. Initialize Husky

```bash
bunx husky init
```

## Getting Started

```bash
cp .env.example .env.local
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script                  | Description                    |
| ----------------------- | ------------------------------ |
| `bun dev`               | Start development server       |
| `bun build`             | Build for production           |
| `bun start`             | Start production server        |
| `bun lint`              | Run ESLint                     |
| `bun run format`        | Format files with Prettier     |
| `bun run type-check`    | TypeScript type checking       |
| `bun run test`          | Run tests once                 |
| `bun run test:ui`       | Run tests with interactive UI  |
| `bun run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── app/                  Next.js App Router pages and layouts
│   └── api/              API route handlers
├── lib/                  Core utilities (server-only)
│   ├── env.ts            Zod environment validation
│   ├── logger.ts         Winston logger configuration
│   ├── api-wrapper.ts    HTTP request logging middleware
│   ├── api-error.ts      Standardized API error responses
│   └── rate-limit.ts     Per-route rate limiting
├── components/           Reusable React components
├── hooks/                Custom React hooks
├── utils/                Helper utilities (cn, etc.)
├── services/             Business logic / API services
├── types/                TypeScript type definitions
├── constants/            App-wide constants
├── tests/                Test files and setup
└── proxy.ts              Next.js proxy (auth checks, redirects)
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

| Variable              | Description                          | Default                       |
| --------------------- | ------------------------------------ | ----------------------------- |
| `NODE_ENV`            | Environment mode                     | `development`                 |
| `LOG_LEVEL`           | Logger verbosity                     | `debug` (dev) / `info` (prod) |
| `LOG_DIR`             | Directory for log files (production) | `logs`                        |
| `NEXT_PUBLIC_APP_URL` | Public-facing application URL        | —                             |

Environment variables are validated at startup with [Zod](https://zod.dev). The app will fail fast with clear error messages if variables are invalid.

## Security

Security headers are applied globally via `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — `unsafe-inline` is allowed for styles (required by Next.js critical CSS injection). Scripts are restricted to `self` only.
- `Permissions-Policy` — camera, microphone, geolocation disabled

`src/proxy.ts` is reserved for dynamic per-request logic (auth checks, redirects).

## Docker

```bash
docker compose up
```

Multi-stage build: Bun 1.2 for install/build, Node 22 Alpine for runtime. Standalone output, non-root user, health-checked Compose.

## Path Alias

This project uses `@/` as an alias for the `src/` directory:

```typescript
import { Button } from "@/components/button";
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh)
- [Vitest Documentation](https://vitest.dev)
- [Zod Documentation](https://zod.dev)
