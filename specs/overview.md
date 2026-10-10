# Forma — overview

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Status:** Approved
> **Approved by:** Aviral Agrawal <Avi.aviral2001@gmail.com> — 2026-10-10T11:49:36Z

This spec describes what the repository implements today. `docs/` describes a larger product (master table, users, formulas, routing, publish). Those documents are intent. They are not behavior unless this file or a feature spec says the code does it.

## What exists

Forma lets an admin create a project and load reference CSVs into it.

The admin lands on a project list, creates a project (always a draft), and enters a workspace. The workspace has four sections. Only **Tables** works. There, the admin uploads one or more CSV files. Each file becomes a table: columns come from the header, cell values are stored by column, and the data is shown in a read-only grid. The admin can rename the table, rename a column, replace the CSV, or delete the table.

Sign-in is not built. Requests are treated as one organisation.

## Who it is for

The admin who configures a project. There is no end-user experience yet, and the code does not distinguish multiple people.

## Core loop that runs

1. Admin opens `/projects`.
2. Admin creates a project with a name.
3. Admin lands in that project's workspace, on Tables.
4. Admin uploads a `.csv` file.
5. Admin reads the grid, and may rename, replace, or delete the table.

## Built features

| Feature | Spec | What the code does |
| --- | --- | --- |
| Projects | [spec.md](features/projects/spec.md) | List, create, open, rename. Delete exists on the API only. Publish is a button that does not publish. |
| Tables | [spec.md](features/tables/spec.md) | Upload, list, view, rename table, rename column, re-upload, soft-delete. |

## Present in the UI or tree, not built

These names appear in the workspace sidebar or as empty backend directories. They have no behavior.

| Name | Evidence |
| --- | --- |
| Master Table | Workspace panel text: "coming soon". `apps/backend/src/master-table/` is empty. Delete-if-referenced always returns false. |
| Users | Workspace panel text: "coming soon". `apps/backend/src/users/` is empty. |
| Audit | Workspace panel text: "coming soon". |
| Formula | `apps/backend/src/formula/` is empty. |
| Workflow | `apps/backend/src/workflow/` is empty. |
| Publish | Header button logs the project id. Status is never changed from `draft`. |
| Authentication | No sign-in. A middleware attaches one fixed user and organisation to every request. |

## Routes

| Path | Screen |
| --- | --- |
| `/` | Redirects to `/projects` |
| `/projects` | Project list |
| `/projects/:id` | Project workspace. Tables is the only live section. |

## Data the code stores

| Store | What it holds |
| --- | --- |
| `projects` | `project_id`, `name`, `org_id`, `status` (default `draft`), nullable `created_by`, timestamps |
| `tables` | `table_id`, `project_id`, `name`, `columns` (JSON), `status` (default `active`), timestamps |
| `rows` | `row_id`, `table_id`, `data` (JSON map of column id → value), nullable `created_by`, `status` (default `active`), timestamps |

## Observed gaps

These are contradictions in the current code. This spec does not choose a resolution.

1. **Shared `Project` type vs API.** `@forma/shared` `Project` has `owner_id`. The API returns `org_id` and does not return `owner_id`. The projects screen still renders, because it only reads `project_id`, `name`, `status`, and `created_at`.
2. **Project delete has no screen.** `DELETE /projects/:id` refuses `published` projects and hard-deletes others. No control in the UI calls it. The client method exists and is unused.
3. **Publish does not publish.** The button calls `console.log`. Nothing sets `status` to `published`. The entity allows `closed` and `deleted`; the response DTO only types `draft` and `published`.
4. **Tables are not scoped to the project in the URL.** Get, rename, delete, and re-upload load a table by `tableId` only. `projectId` is not checked. Upload does not check that the project exists.
5. **List row count.** Upload computes `row_count`. The list query returns the table entity, which has no `row_count` field, so list responses omit it. The tables screen does not display that field.
6. **CSV parsing.** The parser splits on commas and newlines. A quoted comma inside a cell becomes extra columns. Duplicate headers are suffixed `_1`, `_2`, and so on. An empty header becomes `Column {n}`.
7. **Type inference.** A column is `number` when every non-empty value in the first 100 rows parses as a finite float. A column of only empty cells is classified as `number`.
8. **No ownership check.** Project and table access checks are still TODOs. Every request is scoped to the single organisation the middleware attaches. A constant `PLACEHOLDER_org_id` in both controllers is unused.
9. **Older docs over-claim the build.** `docs/functions.md`, `docs/database.md`, and `docs/ui.md` specify master table, users, routing, formulas, and permissions. None of that is implemented. `README.md` says draft projects can be deleted from the product; the API can, the screen cannot.
