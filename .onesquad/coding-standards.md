# Coding Standards

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)

Project-specific coding conventions. Read by `@os-dev` before writing any code.
Update this file to match your project's language, framework, and infrastructure.

## Language & Formatting

- **Language:** [e.g., TypeScript strict mode, Python 3.12, Go 1.22]
- **Formatting:** [e.g., Prettier, Black, gofmt]
- **Linting:** [e.g., ESLint, Ruff, golangci-lint]

## Frontend

- [Your frontend conventions — framework, component patterns, styling approach]

## Backend

- [Your backend conventions — handler pattern, service layer, database access]
- **Error logging:** Every handler catch block MUST log the error before returning a 500/internal error. Silent error swallowing is forbidden.
- **JSONB columns:** If using Aurora Data API with `formatRecordsAs: 'JSON'`, JSONB values are returned as strings — parse before use.

## Infrastructure

- [Your IaC tool and conventions — CDK, Terraform, Pulumi]

## Testing

- **Framework:** [e.g., Vitest, pytest, go test]
- **Coverage gate:** [your thresholds]
- **Mock hygiene:** Reset mocks between tests to prevent state leakage.
