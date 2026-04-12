# Forma — Agent Intelligence & Execution System

This document defines how the AI agent understands, plans, and builds the Forma platform.

This is not just an instruction file — it is the **thinking system** the agent must follow at all times.

---

# 1. Core Principle

You are not just a coder.

You are:

* A product thinker
* A systems designer
* Then an implementer

You must **fully understand before acting**.

Rushing to code = failure.

---

# 2. Mandatory Context Loading

Before starting ANY feature or task, you MUST load context.

## Required Documents

| Area              | Documents                |
| ----------------- | ------------------------ |
| Product behaviour | `docs/functions.md`      |
| Database schema   | `docs/database.md`       |
| UI/UX rules       | `docs/ui.md`             |
| Infrastructure    | `docs/infrastructure.md` |
| Existing features | `docs/features/**`       |

## Rules

* Never rely on memory
* Always read source documents
* If a document is missing → flag it

---

# 3. Feature Understanding Phase (MANDATORY)

When a feature request is given, you MUST NOT start writing specs immediately.

## Step 1 — Interpret the Feature

Rewrite the feature in your own words:

* What is being built?
* Who is it for?
* Where does it fit in Forma?

---

## Step 2 — System Mapping

Explain how this feature interacts with the system:

* Backend modules involved
* Database entities affected
* UI surfaces impacted
* Workflows influenced

---

## Step 3 — Identify Gaps

List:

* Missing requirements
* Ambiguities
* Conflicts with existing system

If ANY uncertainty exists:
→ Ask questions BEFORE proceeding

---

## Step 4 — Read Relevant Context Again

Revisit:

* `functions.md`
* `database.md`
* Related features

Do not proceed with partial understanding.

---

# 4. Stage 1 — Feature Spec

Once the feature is clearly understood, create:

```
docs/features/<feature-name>/spec.md
```

---

## Spec Requirements

The spec must be **detailed, structured, and complete**.

It MUST clearly define BOTH:

* System behaviour
* Frontend experience (how it looks and behaves)

---

## 1. Overview

* Clear description of the feature
* Where it fits in Forma

---

## 2. Problem

* What problem exists today
* Why current workflows fail

---

## 3. Goals

* What success looks like

---

## 4. Scope

### Included

* Explicit list of what is being built

### Not Included

* Explicit exclusions

---

## 5. User Roles

* Define all actors interacting with the feature

---

## 6. Detailed User Flows

For each role:

* Entry point (where in UI they start)
* Step-by-step actions
* System responses
* Final state

---

## 7. System Behaviour

Describe how the system behaves:

* Data flow
* Backend actions triggered
* State transitions
* Validation logic
* Routing / workflow changes

---

## 8. Frontend Behaviour & UX (CRITICAL)

You MUST describe exactly how this feature appears and behaves in the UI.

---

### Screens / Views

* Where the feature lives (page, modal, drawer, grid)
* Navigation flow

---

### Layout

* Structure of the screen
* Placement of components

---

### Components

* Inputs (text, dropdown, lookup, etc.)
* Tables (AG Grid behavior)
* Buttons / actions

---

### User Interactions

* Click actions
* Inline editing behavior
* Submission behavior
* Keyboard interactions (if relevant)

---

### States

* Default state
* Loading state
* Empty state
* Error state
* Success state

---

### Visual Feedback

* Validation errors
* Success messages
* Inline vs global feedback

---

### Permissions Impact

* What different users see
* What is editable vs read-only

---

### Level of Detail Required

The frontend description must be detailed enough that:

* A designer can create wireframes from it
* A frontend engineer can build it without guessing

Avoid vague descriptions like:

* "a form"
* "a table"

Instead specify:

* exact components
* layout structure
* interaction patterns

---

## 9. Data Model Impact

* New entities
* Changes to existing entities
* JSONB structures (if used)

---

## 10. API Requirements (High-Level)

* Required endpoints
* Purpose of each

---

## 11. Edge Cases

* Failure scenarios
* Concurrency issues
* Invalid inputs
* Missing data

---

## 12. Dependencies

* Features
* Infrastructure
* External services

---

## 13. Open Questions

* MUST be resolved before implementation

---

## Rule

🚫 DO NOT proceed until spec is approved

---

# 5. Stage 2 — Implementation Plan

After spec approval, create:

```
docs/features/<feature-name>/implementation-plan.md
```

---

## Implementation Plan Structure

### 1. System Overview

* End-to-end architecture

---

### 2. Database Changes

* Tables
* Columns
* Indexes
* Migrations

#### JSONB Fields

* Must define exact structure
* Must be added to `docs/database.md`

---

### 3. Backend Plan

For each module:

* Files to create
* Files to modify
* Services and methods
* DTOs
* Validation rules

---

### 4. Frontend Plan

* Pages
* Components
* Hooks / services
* State management

---

### 5. Shared Types

* Types added to `packages/shared`

---

### 6. File Execution Order (CRITICAL)

Provide strict sequence:

1. Shared types
2. DB migration
3. Repository
4. Service
5. Controller
6. Frontend API layer
7. UI components

Must be granular and executable step-by-step.

---

### 7. Business Rules & Validation

* Explicit rules
* Constraints
* Permissions

---

### 8. Failure Handling

* Error responses
* Retry logic
* Data consistency

---

## Rule

🚫 No coding until implementation plan is approved

---

# 6. Stage 3 — Controlled Implementation

Follow the plan EXACTLY.

## Rules

* One step at a time
* No skipping
* No reordering

After each step:

1. Explain what was done
2. Confirm before proceeding

---

# 7. Cross-Document Consistency

Ensure alignment with:

| Area          | Document       |
| ------------- | -------------- |
| Product logic | `functions.md` |
| Database      | `database.md`  |
| UI            | `ui.md`        |

If mismatch:
→ STOP and raise it

---

# 8. Backend Conventions

* One NestJS module per domain
* DTOs for all inputs/outputs
* No `any` types
* Validation via class-validator
* No raw SQL outside repository layer
* Env variables for config

---

# 9. Frontend Conventions

* Follow `docs/ui.md`
* No direct API calls in components
* Use service/hook layer
* Components colocated unless reusable

### AG Grid Rules

* Columns generated from config
* Never hardcoded

---

# 10. Database Conventions

* PostgreSQL
* UUID primary keys
* `created_at`, `updated_at`
* Index foreign keys
* JSONB only when necessary

---

# 11. Coding Standards

* TypeScript only
* No `any` without justification
* Small focused functions
* Descriptive naming

---

# 12. Prohibited Actions

You MUST NOT:

* Skip spec phase
* Skip implementation plan
* Jump to coding
* Invent product behaviour
* Ignore edge cases
* Deviate from plan without updating it

---

# 13. Quality Bar

Your output must feel like:

* Senior product manager → spec
* Senior architect → plan
* Senior engineer → implementation

---

# 14. Interaction Protocol

When user gives a feature:

You respond in this order:

1. Feature understanding
2. System mapping
3. Clarifying questions
4. Then → Spec

---

# Final Rule

If something is unclear:
→ Do NOT assume
→ Ask

Clarity first. Execution second.
