# Finish phases 1 and 2

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Issue:** [NQ-PLAN](https://app.notion.com/p/36a052c5da78814796c1cd0010999494)
> **Status:** Approved
> **Approved by:** Aviral Agrawal <Avi.aviral2001@gmail.com> — 2026-10-10T17:00:33Z
> **Related product source:** [Forma Features](https://app.notion.com/p/369052c5da7880d29f33da9ce7458b6d)

## Related specs

- [overview.md](../../overview.md)
- [architecture.md](../../architecture.md)
- [design-system.md](../../design-system.md)
- [projects](../projects/spec.md) — current create, list, rename, and the Publish button that does not change status
- [tables](../tables/spec.md) — current CSV upload, grid, modal rename, replace, and delete

## Summary

Phase 0 on the implementation plan is already done. This spec is only the open checkboxes in phase 1 (projects) and phase 2 (tables). Phases 3 through 9 stay unstarted until these two phases are in the product.

The admin can publish, unpublish, and close a project, and the workspace Publish control shows why publish is blocked. CSV upload and re-upload go through `multer` and `csv-parse`. Delete is rejected when a master table already references that table. The table tab renames in place.

## Classification

- Type: Feature
- Surface: UI / Full Stack
- Phase 3a (UX): Required
- Phase 3b (Services): Required

## Users & Roles

| Role | What they can do |
| --- | --- |
| Project admin | The person configuring a project today. Publishes, unpublishes, and closes that project. Uploads, re-uploads, renames, and deletes its reference tables. |

There is no sign-in screen in this phase. The server still treats each request as one fixed user in one organisation, as the projects spec describes. Project users, organisation admins, and the site admin are not part of this spec.

## Functional Requirements

### Phase 1 — project lifecycle

- **FR-NQPLAN-001** — The system sets a draft project's status to `published` when the project admin publishes it and every publish condition is met.
- **FR-NQPLAN-002** — The system rejects publish, leaves the status unchanged, and returns each unmet condition when any publish condition is unmet.
- **FR-NQPLAN-003** — The system sets a published project's status back to `draft` when the project admin unpublishes it, and removes every user's access to that project in the same request. Access removal is immediate.
- **FR-NQPLAN-004** — The system sets a project's status to `closed` when the project admin closes it, removes read and write access for every user, and excludes the project from the project-user list. Close does not delete the project. The admin list still shows it, with status `closed`.
- **FR-NQPLAN-005** — On a draft project, the workspace Publish control is disabled while any publish condition is unmet, and the tooltip names each unmet condition. The control is enabled when every condition is met.
- **FR-NQPLAN-006** — Publish is accepted only when all five conditions are met: at least one table, at least one column, at least one user, valid formulas, and valid routing config. The API and the tooltip use this same list. This phase does not build the master table, formulas, users, or routing. A condition that cannot be met yet is unmet.
- **FR-NQPLAN-007** — After publish, the same header control reads Unpublish and uses the destructive button style. Choosing it calls unpublish.

### Phase 2 — finish tables

- **FR-NQPLAN-008** — CSV upload and CSV re-upload accept the file through `multer` on the existing `file` field and parse it with `csv-parse`, including quoted fields. Column names come from the header. Each column is text or number. Re-upload replaces that table's rows and keeps the table name.
- **FR-NQPLAN-009** — The system rejects delete of a reference table when a `master_tables` row for that project references the table. When no master table references it, delete succeeds as the tables spec describes.
- **FR-NQPLAN-010** — The project admin renames a table by editing the tab label in place. Column rename stays the existing pencil action from the tables spec.

## Acceptance Criteria

- **AC-NQPLAN-001** — Given a draft project with at least one table, at least one column, at least one user, valid formulas, and valid routing config, when the project admin publishes it, then the status is `published`. Maps to FR-NQPLAN-001 and FR-NQPLAN-006.
- **AC-NQPLAN-002** — Given a draft project missing any of those five conditions, when the project admin publishes it, then the status stays `draft` and the response names each unmet condition. Maps to FR-NQPLAN-002 and FR-NQPLAN-006.
- **AC-NQPLAN-003** — Given a published project a user can open, when the project admin unpublishes it, then the status is `draft` and that user has no access. Maps to FR-NQPLAN-003.
- **AC-NQPLAN-004** — Given a project on a user's list, when the project admin closes it, then the user cannot read or write it, it is gone from that list, the project row still exists, and the admin list still shows it as `closed`. Maps to FR-NQPLAN-004.
- **AC-NQPLAN-005** — Given a draft project with an unmet publish condition, when the project admin views the workspace header, then Publish is disabled and the tooltip names each unmet condition. Given every condition met, then Publish is enabled. Maps to FR-NQPLAN-005 and FR-NQPLAN-006.
- **AC-NQPLAN-006** — Given a published project, when the project admin views the workspace header, then the control reads Unpublish. Choosing it sets the status to `draft`. Maps to FR-NQPLAN-007 and FR-NQPLAN-003.
- **AC-NQPLAN-007** — Given a CSV whose header cells are quoted and that contains a comma inside quotes, when the project admin uploads it, then `csv-parse` keeps that comma inside one column and the column type is text or number. Re-upload replaces the previous active rows and keeps the table name. Maps to FR-NQPLAN-008.
- **AC-NQPLAN-008** — Given a reference table that a `master_tables` row references, when the project admin deletes that table, then the table remains. Given no such reference, when they delete it, then the table leaves the tab list. Maps to FR-NQPLAN-009.
- **AC-NQPLAN-009** — Given a table tab, when the project admin edits the label and confirms, then the stored name changes. When they cancel, the previous name remains. Column rename from the header pencil still works. Maps to FR-NQPLAN-010.

## Data Model

No new store.

| Store | Change |
| --- | --- |
| `projects.status` | This phase writes `published`, returns a published project to `draft` on unpublish, and writes `closed` on close. |
| `tables`, `rows` | Unchanged shape. Upload parsing changes. Delete stays a soft delete. |
| `master_tables` | Already created in phase 0. This phase only reads it to decide whether a reference table may be deleted. It does not add a screen or an API for editing a master table. |

`created_by` stays unset. The caller is still the fixed user.

## API Endpoints

Auth is unchanged: no session header. The server attaches the current user. A project id outside that user's organisation returns 404, as the projects spec already requires.

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/projects/:id/publish` | Current user, project in their organisation | empty | Project with status `published`, or 400 naming each unmet condition |
| POST | `/projects/:id/unpublish` | Current user, project in their organisation | empty | Project with status `draft` |
| POST | `/projects/:id/close` | Current user, project in their organisation | empty | Project with status `closed` |
| POST | `/projects/:id/tables/upload` | Current user | multipart field `file`, parsed by `multer` and `csv-parse` | Existing upload summary |
| POST | `/projects/:id/tables/:tableId/reupload` | Current user | multipart field `file` | Existing detail shape, table name kept |
| DELETE | `/projects/:id/tables/:tableId` | Current user | empty | 400 when a master table references the table. Otherwise the existing soft delete |

Publish, unpublish, and close return 404 when the project is missing or belongs to another organisation. Unpublish on a project that is not `published`, and close on a project that is already `closed`, return 400 and leave the row unchanged. Publish on a project that is not `draft` returns 400.

## UI / UX

1. Workspace header, draft. Publish is a secondary button and disabled while any of the five publish conditions is unmet. The tooltip names each unmet condition. Publish is a primary button and enabled when all five are met. Choosing it calls publish and the badge becomes `published`.
2. Workspace header, published. The same control reads Unpublish and uses the destructive style. Choosing it calls unpublish and the badge becomes `draft`.
3. Workspace header, closed. Publish and Unpublish are not shown. The badge reads `closed`.
4. Table tab. The tab label is edited in place, with the same Enter, blur, and Escape behavior as the workspace title. The tab menu no longer contains Rename.

Empty, loading, and error states stay the ones already in the design system. There is no Close control on the screen. Close is the API above.

## Business Rules

- Phase 0 has no open tasks. Do not reopen it.
- Finish phase 1, then the open phase 2 items. Do not start phase 3 in this spec.
- Delete of a draft project stays as the projects spec defines it. A `published` project still cannot be deleted. Close is not that delete.
- A `closed` project is not published and is not unpublished by this spec. Publishing it again is out of scope.
- The delete guard reads `master_tables` only. With no master-table feature yet, a table that nothing references still deletes.

## Security Boundaries

- Publish, unpublish, close, upload, re-upload, rename, and delete apply only to a project in the caller's organisation.
- The master-table reference check does not return another organisation's configuration.
- This phase does not add a session, a magic link, or a second organisation.

## Out of Scope

- Master table editing, formulas, users, row assignment, magic-link sign-in, submit and routing, user table and form views, audit, comments, and sub-tables. Those are phases 3 through 9.
- A Close button in the workspace. This phase ships the close API only.
- Building the master table, users, or routing in this spec. Publish may refuse while that configuration is missing. This spec does not add those screens.
- Replacing the column-rename pencil. That flow already exists.
- Email notifications, SSO, and file types other than CSV.
