# forma

A monorepo project with React frontend, NestJS backend, and shared utilities.

## Structure

- `apps/frontend`: React application with AG Grid
- `apps/backend`: NestJS API
- `packages/shared`: Shared types and utilities
- `docs/`: Documentation

## Prerequisites

- Node.js 16+ and pnpm installed
- PostgreSQL running locally
- pgAdmin for database management (optional)

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

Create a local PostgreSQL database:

```bash
createdb forma
```

If you have custom credentials, update `.env.local` with your database configuration.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and update if needed:

```bash
cp .env.example .env.local
```

### 4. Start the Applications

**Terminal 1 — Backend (http://localhost:3001):**
```bash
pnpm run --filter backend start:dev
```

**Terminal 2 — Frontend (http://localhost:3000):**
```bash
pnpm run --filter frontend start
```

## Features

### Projects
- Create, view, and manage projects
- Draft and published project statuses
- Inline project name editing
- Delete draft projects

## Building for Production

```bash
pnpm run build
```

## Documentation

See `docs/` for detailed documentation on:
- `requirements.md` — operating manual and conventions
- `database.md` — database schema and design decisions
- `functions.md` — product behavior and rules
- `features/` — feature specifications and implementation plans