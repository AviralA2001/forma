# Finish phases 1 and 2 — Feature Tracker

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Issue:** [NQ-PLAN](https://app.notion.com/p/36a052c5da78814796c1cd0010999494)
> **Status:** In Progress

---

## Phase Gates

### Phase 1 — Specs

- [x] `specs/features/remaining-mvp/spec.md`
- [x] `specs/features/remaining-mvp/ux.md`

### Phase 2 — Plans

- [x] `plans/features/remaining-mvp/coding-plan.md`
- [ ] `plans/features/remaining-mvp/test-plan.md` — waived by the operator on 2026-10-10. Do not write tests.

No infrastructure plan. This work stays on the existing app and database. It adds no cloud service.

---

## Build & Test

### Backend track

- [x] TASK-001 — Publish, unpublish, and close (@os-dev)
- [x] TASK-002 — Parse CSV with csv-parse and multer (@os-dev)
- [x] TASK-003 — Block delete when the master table references the table (@os-dev)

### Frontend track

- [x] TASK-004 — Publish control and closed badge (@os-dev)
- [x] TASK-005 — Rename a table from the tab label (@os-dev)

### Testing

Waived by the operator. No test tasks.

---

## Test Gate

- [ ] All acceptance criteria have a passing test
- [ ] No failing regression tests
- [ ] Operator ran the CI command and confirmed output
- [ ] Operator sign-off on test results

## Deploy Gate

- [ ] Dev environment deployed and smoke-checked
- [ ] Staging deployed and smoke-checked
- [ ] Observability alarms and monitors active
- [ ] Operator sign-off before production
