# Finish phases 1 and 2 — Test Plan

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Issue:** [NQ-PLAN](https://app.notion.com/p/36a052c5da78814796c1cd0010999494)
> **Feature spec:** [spec.md](/specs/features/remaining-mvp/spec.md)
> **Status:** Draft

## Scope

API tests hit the projects and tables handlers against the test database. Frontend tests render the workspace header and the tab strip. Out of scope: master-table editing, user management screens, sign-in, and phases 3 through 9.

## Test Cases

### TC-001 — Publish a complete draft

- **Type:** Integration
- **FR:** FR-NQPLAN-001, FR-NQPLAN-006
- **Acceptance criterion:** AC-NQPLAN-001
- **Input:** Draft project with one active table, a master table column, one active project user, no invalid formula, and one routing column. `POST /projects/:id/publish` with an empty body.
- **Expected output:** `200` and `status` `"published"`.
- **Edge cases:** Zero formula columns still passes "Valid formulas" when the other four conditions pass.
- **Status:** Pending

### TC-002 — Reject an incomplete publish

- **Type:** Integration
- **FR:** FR-NQPLAN-002, FR-NQPLAN-006
- **Acceptance criterion:** AC-NQPLAN-002
- **Input:** Draft project with no table, no master column, no project user, and no routing column. `POST /projects/:id/publish`.
- **Expected output:** `400`. `status` stays `draft`. `conditions` contains "At least one table", "At least one column", "At least one user", "Valid formulas", and "Valid routing config".
- **Edge cases:** A project that fails only one condition returns that one string.
- **Status:** Pending

### TC-003 — Unpublish removes access

- **Type:** Integration
- **FR:** FR-NQPLAN-003
- **Acceptance criterion:** AC-NQPLAN-003
- **Input:** Published project with an active `user_row_access` row on its master row. `POST /projects/:id/unpublish`.
- **Expected output:** `200`, `status` `"draft"`, and that access row `status` `"inactive"`.
- **Edge cases:** Unpublish of a draft returns `400` and leaves the row unchanged.
- **Status:** Pending

### TC-004 — Close removes access and stays on the admin list

- **Type:** Integration
- **FR:** FR-NQPLAN-004
- **Acceptance criterion:** AC-NQPLAN-004
- **Input:** Project with active row access. `POST /projects/:id/close`, then `GET /projects`.
- **Expected output:** `200`, `status` `"closed"`, access row `inactive`, and the project present in the list. A second close returns `400`.
- **Edge cases:** Close does not delete the project row.
- **Status:** Pending

### TC-005 — Publish button and tooltip

- **Type:** Unit
- **FR:** FR-NQPLAN-005, FR-NQPLAN-006
- **Acceptance criterion:** AC-NQPLAN-005
- **Input:** Workspace rendered with `publish_conditions` of one unmet line, then with an empty array.
- **Expected output:** First render: Publish is disabled, secondary, and focus shows that line. Second render: Publish is enabled and primary.
- **Edge cases:** The tooltip does not show a condition that is already met.
- **Status:** Pending

### TC-006 — Unpublish control

- **Type:** Unit
- **FR:** FR-NQPLAN-007, FR-NQPLAN-003
- **Acceptance criterion:** AC-NQPLAN-006
- **Input:** Workspace rendered with `status` `"published"`. Click the action.
- **Expected output:** The button reads Unpublish and uses the destructive style. The click calls `POST /projects/:id/unpublish`.
- **Edge cases:** While the request is in flight the label is "Unpublishing..." and the button is disabled.
- **Status:** Pending

### TC-007 — Quoted CSV upload and re-upload

- **Type:** Integration
- **FR:** FR-NQPLAN-008
- **Acceptance criterion:** AC-NQPLAN-007
- **Input:** Multipart field `file` whose content is `"name","note"\n"Ada","hello, world"\n`, uploaded onto a table already named `Bands`. Then re-upload `"name","note"\n"Ada","hello again"\n`.
- **Expected output:** Header cells stay two columns. `note` is text because the value is not a number. The cell value is `hello, world`. Re-upload keeps the table name `Bands` and the active rows are only the new file.
- **Edge cases:** A `.txt` filename returns `400` "Only CSV files are supported".
- **Status:** Pending

### TC-008 — [CONTRACT] Project lifecycle responses

- **Type:** Integration
- **FR:** FR-NQPLAN-001, FR-NQPLAN-003, FR-NQPLAN-004
- **Acceptance criterion:** AC-NQPLAN-001, AC-NQPLAN-003, AC-NQPLAN-004
- **Input:** Publish, unpublish, and close for a project the caller can see.
- **Expected output:** Each `200` body has `project_id`, `name`, `org_id`, `status`, `created_at`, and `updated_at`. Publish `400` for unmet conditions has `conditions` as an array of strings. `GET /projects/:id` includes `publish_conditions` as an array of strings.
- **Edge cases:** None of these bodies are wrapped in `data`.
- **Status:** Pending

### TC-009 — Delete is blocked only by this project's master table

- **Type:** Integration
- **FR:** FR-NQPLAN-009
- **Acceptance criterion:** AC-NQPLAN-008
- **Input:** Delete a table whose id appears in this project's `master_tables.columns`. Delete a table that does not. A master table in another organisation mentions the first table id.
- **Expected output:** First delete is `400` "Cannot delete table that is referenced in master table" and the tab's table stays active. Second delete soft-deletes. The other organisation's master table does not cause the block by itself.
- **Edge cases:** A missing table returns `404`.
- **Status:** Pending

### TC-010 — Inline table rename

- **Type:** Unit
- **FR:** FR-NQPLAN-010
- **Acceptance criterion:** AC-NQPLAN-009
- **Input:** Active tab label edited, then Enter. Same label, then Escape. Blank name, then Enter. Column pencil.
- **Expected output:** Enter calls PATCH `{ new_name }` and the tab shows the new name. Escape keeps the previous name and does not call PATCH. Blank does not call PATCH. The tab menu has no Rename. The pencil still opens column rename.
- **Edge cases:** A failed PATCH shows "Failed to rename table" and restores the stored name.
- **Status:** Pending

### TC-011 — Another organisation cannot change the project

- **Type:** Integration
- **FR:** FR-NQPLAN-001
- **Acceptance criterion:** AC-NQPLAN-001
- **Input:** Publish, unpublish, and close with a project id whose `org_id` is not the caller's.
- **Expected output:** `404` "Project not found" and the stored status is unchanged.
- **Edge cases:** The same `404` for get, update, and delete already covered by the projects spec stays in place.
- **Status:** Pending

### TC-012 — Closed workspace has no publish action

- **Type:** Unit
- **FR:** FR-NQPLAN-004
- **Acceptance criterion:** AC-NQPLAN-004
- **Input:** Workspace and project card rendered with `status` `"closed"`.
- **Expected output:** Badge reads Closed. Publish and Unpublish are absent. The card is still in the list.
- **Edge cases:** None.
- **Status:** Pending
