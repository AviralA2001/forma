# Feature: Tables

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Status:** Approved
> **Approved by:** Aviral Agrawal <Avi.aviral2001@gmail.com> — 2026-10-10T11:49:36Z

Depends on [projects](../projects/spec.md). A table cannot be created except by uploading a CSV into a project.

## What the code does

Tables are reference data inside a project. The admin uploads a CSV. The file name becomes the table name. The header row becomes columns. Each later row is stored as a JSON object keyed by column id. The admin views the rows in a read-only grid, renames the table, renames a column, replaces the file, or deletes the table.

Cells are not editable. The grid can sort, filter, and page on the client.

## Who

The admin working inside a project. Handlers do not check that this user owns the project, or that the table belongs to the `:projectId` in the URL.

## Screen

Tables render inside the project workspace (`/projects/:id`), in the Tables section. The component can also load a project from a `:projectId` route param, but `App` does not register a `/projects/:id/tables` route. In the workspace the page header and breadcrumbs inside Tables are hidden. Upload is the "+" on the tab strip, or the empty-state button.

### Empty

"No tables yet", a line about uploading a CSV for reference data, and "Upload CSV".

### With tables

- One tab per table, in the API order (newest `created_at` first among `status = 'active'`).
- The first tab is selected automatically.
- Each tab has a menu: Rename, Reupload, Delete.
- "+" opens the upload modal for a new file.
- The selected table is an AG Grid (Alpine theme). Columns are the table's columns. Cell value is `row.data[column_id]`. Columns are sortable, filterable, and resizable. Pagination defaults to 50 rows, with page sizes 20, 50, and 100.
- Each column header shows the name and a pencil button that opens rename-column.
- A header block with Rename Table, Reupload CSV, and Delete Table is present in the component and commented out. Those actions are only on the tab menu.
- Fetch failures set a banner: "Failed to load tables", "Failed to load table details", "Failed to upload table", "Failed to rename table", "Failed to rename column", "Failed to delete table", or "Failed to reupload table".

### Modals

- **Upload.** File picker. Confirm sends the file. The same modal is used for re-upload; which API is called depends on whether the tab menu opened Reupload.
- **Rename table.** Current name, new name required by the modal before confirm.
- **Rename column.** Same pattern, from the header pencil.
- **Delete.** Confirms by table name. The "referenced by master table" flag passed into this modal is hard-coded `false`.

The upload modal's exact validation copy is in the component; the server is what rejects a non-CSV.

## API

Prefix: `/projects/:projectId/tables`. Multipart field name for files: `file`.

| Method | Path | Success | Failure the code raises |
| --- | --- | --- | --- |
| `POST` | `/upload` | `{ table_id, name, column_count, row_count, created_at }` | `400` "No file uploaded". `400` "Only CSV files are supported" when the filename does not end in `.csv`. `400` if the parsed file has no header, no data rows, or is empty. |
| `GET` | `/` | Array of `{ table_id, name, column_count, row_count, created_at }` | — |
| `GET` | `/:tableId` | `{ table_id, name, columns, rows }` | `404` "Table not found" |
| `PATCH` | `/:tableId` | List-item shape after rename | `404` if missing. Body `{ "new_name": string }` length 1–255. |
| `PATCH` | `/:tableId/columns/:columnId` | Detail shape after the column rename | `404` "Table not found" or "Column not found" |
| `DELETE` | `/:tableId` | Empty success | `404` if missing. `400` "Cannot delete table that is referenced in master table" if the reference check returns true. That check always returns false. |
| `POST` | `/:tableId/reupload` | Detail shape | Same file checks as upload. |

`columns` items: `{ column_id, name, data_type }` where `data_type` is `text` or `number`.

`rows` items: `{ row_id, data }` where `data` is a map of `column_id` to a number or a string.

### Upload rules, as implemented

- Table name is the filename with a trailing `.csv` removed. If that is empty, the name is `Untitled Table`.
- Headers and cells are split on `,`. Lines are split on `\n`. Blank lines are dropped. Values are trimmed. Quoted commas are not handled.
- A blank header becomes `Column {index+1}` (1-based).
- If a name is already used, the next copy is `{name}_1`, then `{name}_2`, and so on.
- Type is `number` when every non-empty value among the first 100 rows parses with `parseFloat` as a finite number. Otherwise `text`. If every sampled cell is empty, the column is `number`.
- Stored numbers are `parseFloat` of the cell. Other cells are stored as strings, including empty string when the row is shorter than the header.
- A table with zero data rows is rejected.
- New tables are saved with the repository default status `active` when that column is present.

### Re-upload rules, as implemented

- The table name is kept.
- Columns are generated again, with new `column_id`s. Old column ids are not preserved.
- Existing rows are marked `status: 'deleted'`. New rows are inserted.
- The detail response is the active rows only.

### Delete rules, as implemented

- The table row is not removed. `status` is set to `deleted`.
- Its rows are marked `deleted` the same way.
- Lists and detail queries only return `status: 'active'`.

### List row count

`column_count` is `columns.length`. `row_count` is set on the upload response after a count query. The list handler reads `row_count` off the table entity, which has no such column, so list items do not include a real count unless something else attaches it.

## Acceptance criteria

- [ ] With no tables, the workspace Tables section shows the empty state and an upload action.
- [ ] Uploading a `.csv` with a header and at least one data row adds a tab named from the file and selects a view of that data.
- [ ] A non-`.csv` filename is rejected with "Only CSV files are supported".
- [ ] A CSV with only a header, or an empty file, is rejected and does not add a tab.
- [ ] Duplicate header names are stored with `_1`, `_2`, … suffixes. A blank header is stored as `Column {n}`.
- [ ] A column whose first 100 non-empty cells are all finite numbers is stored as `number`; other columns are `text`.
- [ ] The grid shows one column per stored column and does not offer cell editing.
- [ ] Rename from the tab menu changes the tab label and the stored name.
- [ ] Rename from the column pencil changes that header and leaves cell values on the same `column_id`.
- [ ] Reupload keeps the table name, replaces columns and active rows, and the grid shows the new file.
- [ ] Delete removes the tab. A following list request does not return that table.
- [ ] Deleting a table is allowed today, because the master-table reference check returns false.

## Out of scope in this code

- Editing a cell
- File types other than CSV
- Choosing a column type by hand
- Server-side paging (the API returns every active row; the grid pages in the browser)
- Blocking delete because a master table uses the table
- Checking that `:projectId` owns `:tableId`

## Gaps left open

- `projectId` on every table route except upload is unused for authorization or ownership.
- Upload does not verify the project exists.
- The reference check that would block delete is a stub.
- List `row_count` is not loaded.
- The commented table-header actions and the live tab menu are two UIs for the same operations. Only the tab menu is active.
