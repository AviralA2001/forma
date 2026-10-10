# Finish phases 1 and 2 — Implementation Plan

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Issue:** [NQ-PLAN](https://app.notion.com/p/36a052c5da78814796c1cd0010999494)
> **Feature spec:** [spec.md](/specs/features/remaining-mvp/spec.md)
> **UX spec:** [ux.md](/specs/features/remaining-mvp/ux.md)
> **Status:** Approved
> **Approved by:** Aviral Agrawal <Avi.aviral2001@gmail.com> — 2026-10-10T17:45:43Z

## Stack

NestJS, TypeORM, PostgreSQL, React, the existing fetch clients. JSON field names stay snake_case, matching `project_id` and `org_id` already returned by the projects API. No new cloud service.

Repo migrations create `projects`, `tables`, and `rows`. The running database also has `master_tables`, `project_users`, and `user_row_access` from phase 0. This plan reads and updates those tables. It does not add a migration and it does not build their screens. Column names used below are the ones in `docs/database.md`.

## API Contracts

The frontend reads `response.json()` directly. There is no `{ data: T }` wrapper.

| Endpoint | Request body | Response `data` shape |
| --- | --- | --- |
| `POST /projects/:id/publish` | empty | `200` `{ project_id, name, org_id, status: "published", created_at, updated_at }`. `400` `{ statusCode: 400, message: "Publish conditions are not met", conditions: string[] }`. `conditions` uses only these strings, in this order, and only the unmet ones: `"At least one table"`, `"At least one column"`, `"At least one user"`, `"Valid formulas"`, `"Valid routing config"`. `400` `{ statusCode: 400, message: "Only a draft project can be published" }` when status is not `draft`. `404` `{ statusCode: 404, message: "Project not found" }` |
| `POST /projects/:id/unpublish` | empty | `200` same project object with `status: "draft"`. `400` `{ statusCode: 400, message: "Only a published project can be unpublished" }`. `404` as above |
| `POST /projects/:id/close` | empty | `200` same project object with `status: "closed"`. `400` `{ statusCode: 400, message: "Project is already closed" }`. `404` as above |
| `POST /projects/:id/tables/upload` | multipart field `file` | unchanged upload summary |
| `POST /projects/:id/tables/:tableId/reupload` | multipart field `file` | unchanged detail shape. `name` is the previous table name |
| `DELETE /projects/:id/tables/:tableId` | empty | `200` empty. `400` `{ statusCode: 400, message: "Cannot delete table that is referenced in master table" }` |
| `PATCH /projects/:id/tables/:tableId` | `{ "new_name": string }` | unchanged list-item shape |
| `GET /projects` | empty | array of project objects. Includes `status: "closed"`. This is the admin list |

Publish checks, evaluated in the order of the tooltip lines:

- At least one table: at least one `tables` row for that `project_id` with `status = 'active'`.
- At least one column: the active `master_tables` row for that project has a `columns` array with length at least 1.
- At least one user: at least one `project_users` row for that `project_id` with `role = 'project_user'` and `status = 'active'`.
- Valid formulas: a master table exists, and every `columns` entry with `type = 'formula'` has a non-empty `formula` and does not refer to its own column name through other formula columns. Zero formula columns is valid.
- Valid routing config: the `columns` array contains exactly one entry with `type = 'routing'`.

No master table row fails column, formulas, and routing. A missing relation is logged and that condition is unmet. It is not a 500.

Unpublish and close set `user_row_access.status` to `inactive` for every row whose `master_row_id` belongs to this project's master table. They do that in the same request as the status change.

Delete reference: true when this project's active `master_tables.columns` or `joins` JSON contains the table id (`source_table_id`, `lookup_table_id`, `base_table_id`, or `join_table_id`). Another organisation's master table is not read.

## Tasks

### TASK-001 — Publish, unpublish, and close

- **Owner:** @os-dev
- **Layer:** API
- **FRs:** FR-NQPLAN-001, FR-NQPLAN-002, FR-NQPLAN-003, FR-NQPLAN-004, FR-NQPLAN-006
- **Depends on:** none
- **Complexity:** Medium
- **Risk:** Medium
- **Description:** Add `POST /projects/:id/publish`, `/unpublish`, and `/close` on the projects controller. Load the project with the existing org scope. Apply the status rules and the five checks in the contract. On unpublish and close, inactivate matching `user_row_access` rows. Add `closed` to the project status type in `@forma/shared` and the API response type. `GET /projects` keeps returning closed projects. This phase has no project-user list endpoint, so "gone from the user list" is satisfied by inactivating `user_row_access` and by not adding a user-facing list. Do not filter closed projects out of `GET /projects`.
- **Acceptance:** AC-NQPLAN-001 through AC-NQPLAN-004. A project in another organisation returns 404. A second close, an unpublish of a draft, and a publish of a published project return 400 and do not change the row.
- **Status:** Complete

### TASK-002 — Parse CSV with csv-parse and multer

- **Owner:** @os-dev
- **Layer:** API
- **FRs:** FR-NQPLAN-008
- **Depends on:** none
- **Complexity:** Low
- **Risk:** Low
- **Description:** Add `csv-parse` and `multer` as backend dependencies. Keep `FileInterceptor('file')` on upload and re-upload. Replace `parseCSV` with `csv-parse` in sync mode so quoted commas stay in one field. Keep header names, text-or-number inference, and re-upload name retention from the tables spec.
- **Acceptance:** AC-NQPLAN-007. A non-csv filename is still rejected with "Only CSV files are supported".
- **Status:** Complete

### TASK-003 — Block delete when the master table references the table

- **Owner:** @os-dev
- **Layer:** API
- **FRs:** FR-NQPLAN-009
- **Depends on:** none
- **Complexity:** Low
- **Risk:** Low
- **Description:** Replace `isTableReferencedInMasterTable` so it runs the reference check in the contract for that table's project only. Leave the soft delete as it is when the check is false.
- **Acceptance:** AC-NQPLAN-008.
- **Status:** Complete

### TASK-004 — Publish control and closed badge

- **Owner:** @os-dev
- **Layer:** Frontend
- **FRs:** FR-NQPLAN-005, FR-NQPLAN-007
- **Depends on:** TASK-001
- **Complexity:** Medium
- **Risk:** Low
- **Description:** In the workspace header, follow `ux.md`. Draft with unmet conditions: `btn-secondary`, disabled, tooltip on hover and focus listing `conditions` from a lightweight publish-check response or from the 400 body. The header needs the condition list before a click, so `GET /projects/:id` gains an optional `publish_conditions: string[]` of the unmet lines only. Empty array means Publish is `btn-primary` and enabled. Published: the same button is `btn-destructive` and reads Unpublish. Closed: no action, badge `status-closed`. In-flight labels are "Publishing..." and "Unpublishing...". A non-condition failure shows `error-banner`. Project cards render Closed.
- **Acceptance:** AC-NQPLAN-005 and AC-NQPLAN-006. The tooltip lines match the contract strings.
- **Status:** Complete

### TASK-005 — Rename a table from the tab label

- **Owner:** @os-dev
- **Layer:** Frontend
- **FRs:** FR-NQPLAN-010
- **Depends on:** none
- **Complexity:** Low
- **Risk:** Low
- **Description:** Remove Rename from the tab menu and stop opening `RenameTableModal` for tables. The active tab label uses the workspace title input: Enter or blur calls the existing PATCH `{ new_name }`. Escape restores the previous name. A blank trimmed name does not call the API. Column rename stays on the pencil and `RenameColumnModal`. A failed rename shows "Failed to rename table" and restores the stored name.
- **Acceptance:** AC-NQPLAN-009.
- **Status:** Complete

## Coverage

| FR / AC | Task |
| --- | --- |
| FR-NQPLAN-001, AC-NQPLAN-001 | TASK-001 |
| FR-NQPLAN-002, AC-NQPLAN-002 | TASK-001 |
| FR-NQPLAN-003, AC-NQPLAN-003 | TASK-001 |
| FR-NQPLAN-004, AC-NQPLAN-004 | TASK-001, TASK-004 |
| FR-NQPLAN-005, AC-NQPLAN-005 | TASK-004 |
| FR-NQPLAN-006 | TASK-001, TASK-004 |
| FR-NQPLAN-007, AC-NQPLAN-006 | TASK-004 |
| FR-NQPLAN-008, AC-NQPLAN-007 | TASK-002 |
| FR-NQPLAN-009, AC-NQPLAN-008 | TASK-003 |
| FR-NQPLAN-010, AC-NQPLAN-009 | TASK-005 |
