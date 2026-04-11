# Requirements

## Tech Stack

### Frontend
- **Framework**: React
- **Grid / Table UI**: AG Grid (Community Edition)
- **Package Manager**: npm workspaces

### Backend
- **Runtime**: Node.js
- **Framework**: NestJS
- **Structure**: One module per domain

### Database
- **Primary**: PostgreSQL
- **Strategy**: Relational tables with JSONB for flexible, schema-variable data

### Local Development
- PostgreSQL running locally
- pgAdmin for database management
- No cloud hosting at this stage

---

## Monorepo Structure

```
forma/
├── apps/
│   ├── frontend/                  # React application
│   └── backend/                   # NestJS API
├── packages/
│   └── shared/                    # Shared types and utilities
├── docs/
│   ├── requirements.md            # Tech stack and practices
│   ├── database.md                # Database schema and design decisions
│   ├── functions.md               # Product soul — behaviour, rules, logic
│   └── features/
│       └── feature-name/
│           ├── feature-spec.md            # What and why
│           └── feature-implementation.md  # How — db, api, ui, rules
├── package.json                   # Root workspace config
└── README.md
```

### Backend Module Structure
```
backend/src/
├── projects/
├── tables/
├── master-table/
├── formula/
├── workflow/
├── users/
└── app.module.ts
```

---

## Documentation Practice

Every feature is planned before any code is written. No exceptions.

Each feature lives in `docs/features/feature-name/` and contains two files:

**feature-spec.md** — what and why
- Problem being solved
- User stories
- Scope
- Out of scope
- Open questions

**feature-implementation.md** — how
- Database changes
- API endpoints
- UI components
- Rules and edge cases
- Dependencies on other features

Both files must be written and reviewed before implementation begins. Code is written against these docs, not the other way around.

---

## Coding Conventions

- One NestJS module per domain — no cross-module direct imports, communicate via services
- DTOs for all request and response shapes
- JSONB fields always have a documented shape in database.md
- No raw SQL outside of repository classes
- All database migrations versioned and committed
- Environment variables for all config — no hardcoded values
- Errors returned in consistent shape: `{ statusCode, message, error }`
