# Astra

A monorepo project with React frontend, NestJS backend, and shared utilities.

## Structure

- `apps/frontend`: React application with AG Grid
- `apps/backend`: NestJS API
- `packages/shared`: Shared types and utilities
- `docs/`: Documentation

## Getting Started

1. Install dependencies: `pnpm install`
2. Start backend: `pnpm run --filter backend start:dev`
3. Start frontend: `pnpm run --filter frontend start`

## Local Development

- PostgreSQL should be running locally.
- Use pgAdmin for database management.