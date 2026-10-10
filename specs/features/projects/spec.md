# Feature: Projects

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Status:** Approved
> **Approved by:** Aviral Agrawal <Avi.aviral2001@gmail.com> — 2026-10-10T11:49:36Z

## What the code does

A project is the container the admin creates before uploading tables. The admin sees their organisation's projects, creates one by name, opens it, and renames it from the workspace header. A new project is always `draft`. The status badge shows that value. The Publish button does not change it.

## Who

The admin configuring projects. There is no sign-in screen. The server treats each request as one fixed user in one organisation.

## Screens

### Project list — `/projects`

- Heading "Projects" and a "+ New Project" button.
- While loading: "Loading projects...".
- On fetch failure: "Failed to load projects". The empty state is not shown in that case; the error sits above an empty grid only when the request succeeded with zero projects.
- Empty state: "No projects yet", short prompt, and "Create your first project".
- Otherwise a grid of cards. Each card shows the name, a status badge, and the created date. Clicking a card opens `/projects/:id`.
- "New Project" opens a modal: text field "Project name", Cancel, Create Project. Empty or whitespace-only names show "Project name cannot be empty" and do not call the API. Enter confirms. Escape or overlay click cancels. On success the modal closes and the app navigates to the new project.

### Workspace — `/projects/:id`

- "← Projects" returns to the list.
- The project name is the title. Clicking it turns it into a text field. Enter or blur saves. Escape restores the previous name. A blank trimmed name does not save.
- Status badge next to the title.
- "Publish" is visible. Clicking it writes the project id to the console and leaves status unchanged.
- Breadcrumb: Projects > {name}. The Projects crumb is a plain link to `/projects`.
- Sidebar: Master Table, Tables, Users, Audit. Tables is selected on entry. The other three render a heading and "coming soon".
- The Tables panel is the tables feature. See [tables spec](../tables/spec.md).
- Unknown id or failed load: "Failed to load project" or "Project not found", plus "Back to Projects".

There is no delete control on the list or in the workspace.

## API

JSON. No auth header. The server attaches the current user before the handler runs.

| Method | Path | Request | Success | Failure the code raises |
| --- | --- | --- | --- | --- |
| `POST` | `/projects` | `{ "name": string }` | Project object | Validation error if `name` is missing, not a string, empty, or longer than 255 |
| `GET` | `/projects` | — | Array of projects for the caller's organisation, newest `created_at` first | — |
| `GET` | `/projects/:id` | — | One project | `404` "Project not found" when id is missing or belongs to another `org_id` |
| `PATCH` | `/projects/:id` | `{ "name"?: string }` | Updated project | `404` if not found. If `name` is omitted, the stored name is kept. |
| `DELETE` | `/projects/:id` | — | Empty success | `404` if not found. `400` "Published projects cannot be deleted" when `status` is `published`. |

Project object returned by the API:

| Field | Meaning |
| --- | --- |
| `project_id` | UUID |
| `name` | String, max 255 in validation |
| `org_id` | UUID of the caller's organisation |
| `status` | Stored default `draft`. Response type allows `draft` or `published`. |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

Create always sets `status` to `draft` and `org_id` from the caller. `created_by` on the entity is not set.

Delete removes the project row. The migration declares `ON DELETE CASCADE` from `tables.project_id` to `projects`. The service does not delete tables itself.

## Acceptance criteria

- [ ] Opening `/` lands on `/projects`.
- [ ] With no projects, the admin sees the empty state and can open the create modal from it or from "+ New Project".
- [ ] A non-empty name creates a `draft` project and opens its workspace.
- [ ] An empty name in the modal does not create a project.
- [ ] The list shows name, status, and created date, newest first.
- [ ] Clicking a card opens that workspace and loads Tables.
- [ ] Editing the workspace title persists the new name and shows it after reload.
- [ ] Clearing the title and leaving the field keeps the previous name.
- [ ] Publish leaves `status` as `draft`. Current build only. The open phase 1 behavior is in [finish phases 1 and 2](../remaining-mvp/spec.md) FR-NQPLAN-001 through FR-NQPLAN-007.
- [ ] Master Table, Users, and Audit show "coming soon".
- [ ] `DELETE /projects/:id` removes a draft project and returns 400 for a project whose status is already `published`.
- [ ] A project id outside the caller's organisation returns 404 on get, update, and delete.

## Out of scope in this code

- Sign-in, roles, or more than one organisation
- Publishing, closing, or archiving
- Deleting a project from the screen
- Multiple admins, templates, or a user-facing project list
- Master table, users, and audit behavior inside the workspace

## Gaps left open

- The UI never calls delete, so "published projects cannot be deleted" cannot be exercised from the product.
- The entity allows status `closed` and `deleted`. No path sets them. The response DTO does not include them.
- `@forma/shared` `Project` expects `owner_id`. The API sends `org_id`.
- List and get are scoped by `org_id` only. Comments in the service say this should later go through project membership. That membership does not exist.
