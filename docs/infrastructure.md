# Infrastructure

This document covers the local development setup, environment configuration, and infrastructure conventions for Forma. Read this before setting up the project or making any infrastructure changes.

---

## Local Development Stack

| Service | Tool | Port |
|---------|------|------|
| Frontend | React dev server | 3000 |
| Backend | NestJS | 3001 |
| Database | PostgreSQL | 5432 |
| DB Admin | pgAdmin | 5050 |

---

## Prerequisites

The following must be installed locally before running the project:

- Node.js v20+
- npm v10+
- PostgreSQL 15+
- pgAdmin (optional but recommended)

---

## Monorepo Setup

Root `package.json` uses npm workspaces:

```json
{
  "name": "forma",
  "private": true,
  "workspaces": [
    "apps/frontend",
    "apps/backend",
    "packages/shared"
  ],
  "scripts": {
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "dev": "npm run dev:frontend & npm run dev:backend"
  }
}
```

Install all dependencies from root:
```bash
npm install
```

---

## Environment Variables

### Backend — `apps/backend/.env`
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=forma
DB_USER=postgres
DB_PASSWORD=yourpassword

# App
PORT=4000
NODE_ENV=development
```

### Frontend — `apps/frontend/.env`
```env
REACT_APP_API_URL=http://localhost:4000
```

Never commit `.env` files. `.env.example` files are committed with all keys but no values.

---

## Database Setup

### Create the database locally
```bash
psql -U postgres -c "CREATE DATABASE forma;"
```

### Run migrations
```bash
npm run migration:run --workspace=apps/backend
```

### Create a new migration
```bash
npm run migration:create --workspace=apps/backend --name=migration-name
```

---

## Database Migrations

- All schema changes are done through migrations — never modify the database directly
- Migration files live in `apps/backend/src/migrations/`
- Every migration is versioned and committed to git
- Migrations run in order — never edit a migration that has already been committed
- If a migration needs to be changed, create a new migration that corrects it

---

## NestJS Backend Setup

```bash
cd apps/backend
npm install
npm run dev
```

Backend uses:
- `@nestjs/typeorm` for database access
- `typeorm` as the ORM
- `class-validator` and `class-transformer` for DTO validation
- `@nestjs/config` for environment variable management

TypeORM config lives in `apps/backend/src/app.module.ts`. Entities are auto-loaded from each module folder.

---

## React Frontend Setup

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend uses:
- `react-router-dom` for routing
- `ag-grid-community` for table and grid UI
- `axios` for API calls

---

## Shared Package

The `packages/shared` package contains TypeScript types shared between frontend and backend.

```bash
cd packages/shared
npm install
npm run build
```

After any changes to shared types, rebuild the package before running frontend or backend.

Types are imported as:
```typescript
import { ProjectStatus } from '@forma/shared'
```

---

## Project Scripts

Run from root:

| Script | Command |
|--------|---------|
| Run everything | `npm run dev` |
| Frontend only | `npm run dev:frontend` |
| Backend only | `npm run dev:backend` |
| Run migrations | `npm run migration:run --workspace=apps/backend` |
| Build shared | `npm run build --workspace=packages/shared` |

---

## Folder Conventions

```
apps/backend/src/
├── migrations/          # All database migrations
├── common/              # Shared guards, pipes, interceptors, decorators
├── config/              # Environment and app configuration
├── [module]/            # One folder per domain module
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   ├── [module].repository.ts
│   ├── [module].entity.ts
│   └── dto/
└── app.module.ts

apps/frontend/src/
├── api/                 # All API call functions, one file per domain
├── components/          # Shared components used across pages
├── pages/               # One folder per page/route
│   └── page-name/
│       ├── index.tsx
│       └── components/  # Components specific to this page
├── hooks/               # Shared custom hooks
├── types/               # Frontend-only types (use @forma/shared for shared types)
└── App.tsx
```

---

## Git Conventions

- `main` branch is always stable
- Feature branches named `feature/feature-name`
- One commit per meaningful unit of work
- Commit messages are descriptive: `add projects table migration` not `update db`
- Never commit `.env` files
- Always commit `.env.example` when adding new environment variables
- Migration files are always committed with the feature that requires them

---

## What Does Not Exist Yet

The following will be defined when needed:
- Cloud hosting and deployment
- CI/CD pipeline
- Authentication and session management
- Environment-specific configs (staging, production)