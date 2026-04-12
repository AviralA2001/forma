# Implementation Plan — Tables

## Database Changes

### New Migration: CreateTablesTable
Create a new migration file: `backend/src/migrations/1713000000001-CreateTables.ts`

**Tables table:**
```sql
CREATE TABLE tables (
  table_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  columns     JSONB NOT NULL,
  -- [{ column_id: UUID, name: string, data_type: 'text' | 'number' }]
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tables_project_id ON tables(project_id);
```

**Rows table (for storing raw table data):**
```sql
CREATE TABLE table_rows (
  row_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id    UUID REFERENCES tables(table_id) ON DELETE CASCADE,
  data        JSONB NOT NULL,
  -- { column_id: value }
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_table_rows_table_id ON table_rows(table_id);
```

### Shared Types
Add to `packages/shared/src/index.ts`:
```typescript
export interface TableColumn {
  column_id: string;
  name: string;
  data_type: 'text' | 'number';
}

export interface Table {
  table_id: string;
  project_id: string;
  name: string;
  columns: TableColumn[];
  row_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface TableRow {
  row_id: string;
  data: Record<string, any>;
}
```

---

## Backend Implementation

### File Structure
```
backend/src/tables/
├── tables.controller.ts
├── tables.service.ts
├── tables.repository.ts
├── dto/
│   ├── upload-table.dto.ts
│   ├── rename-table.dto.ts
│   ├── rename-column.dto.ts
│   ├── table-response.dto.ts
│   └── table-detail-response.dto.ts
└── tables.module.ts
```

### DTOs

#### upload-table.dto.ts
- File upload (multipart)
- project_id (body)

#### rename-table.dto.ts
- new_name: string

#### rename-column.dto.ts
- column_id: string
- new_name: string

#### table-response.dto.ts
- table_id, name, column_count, row_count, created_at

#### table-detail-response.dto.ts
- table_id, name, columns (array of {column_id, name, data_type}), rows (array of raw row data)

### Service: TableService

**Methods:**
1. `uploadTable(projectId, csvFile)` → creates table, parses CSV, infers types, stores rows
   - Generate column_id for each column
   - Infer data type by sampling first N rows
   - Handle duplicate column names with auto-suffix (Name, Name_2, etc)
   - Store table metadata
   - Store row data

2. `getTables(projectId)` → returns list of tables with metadata

3. `getTableDetail(tableId)` → returns table with all columns and rows

4. `renameTable(tableId, newName)` → updates table name

5. `renameColumn(tableId, columnId, newName)` → updates column name in columns JSONB

6. `deleteTable(tableId)` → verify not referenced in master_table, then delete

7. `reuploadTable(tableId, csvFile)` → replace table data entirely
   - Delete all rows for this table
   - Keep table_id and project_id
   - Re-infer types
   - Store new rows

### Repository: TableRepository

**Methods:**
- createTable(projectId, name, columns)
- getTablesByProjectId(projectId)
- getTableById(tableId)
- updateTableName(tableId, newName)
- updateTableColumns(tableId, columns)
- deleteTable(tableId)
- insertTableRows(rows)
- deleteTableRows(tableId)
- getTableRows(tableId)
- getRowCountForTable(tableId)

### Controller: TablesController

**Endpoints:**

1. `POST /projects/:projectId/tables/upload`
   - Multipart file upload
   - Response: TableResponseDto

2. `GET /projects/:projectId/tables`
   - Response: [TableResponseDto]

3. `GET /projects/:projectId/tables/:tableId`
   - Response: TableDetailResponseDto (includes all rows)

4. `PATCH /projects/:projectId/tables/:tableId`
   - Body: RenameTableDto
   - Response: TableResponseDto

5. `PATCH /projects/:projectId/tables/:tableId/columns/:columnId`
   - Body: RenameColumnDto
   - Response: TableDetailResponseDto

6. `DELETE /projects/:projectId/tables/:tableId`
   - Verify not referenced in master table
   - Response: 200 OK

7. `POST /projects/:projectId/tables/:tableId/reupload`
   - Multipart file upload (replaces existing table data)
   - Response: TableDetailResponseDto

### Implementation Details

**CSV Parsing:** Use `csv-parse` package (or similar Node CSV parser)
- Parse headers from first row
- Generate column_id for each column
- Handle duplicate column names by appending _2, _3, etc.

**Type Inference:**
- Sample up to 100 rows
- For each column, try parsing as number — if all samples parse as numbers, type is 'number'
- Otherwise type is 'text'
- Handle nulls gracefully (null/empty strings don't force text type)

**Validation:**
- CSV must have header row
- CSV must have at least one row of data
- Project must exist and be owned by current user

---

## Frontend Implementation

### File Structure
```
frontend/src/pages/
└── tables/
    ├── index.tsx (TablesPage)
    ├── TablesPage.css
    ├── components/
    │   ├── TablesList.tsx
    │   ├── TablesList.css
    │   ├── TableDetail.tsx
    │   ├── TableDetail.css
    │   ├── UploadTableModal.tsx
    │   ├── UploadTableModal.css
    │   ├── RenameTableModal.tsx
    │   ├── RenameTableModal.css
    │   ├── RenameColumnModal.tsx
    │   ├── RenameColumnModal.css
    │   ├── DeleteTableModal.tsx
    │   └── DeleteTableModal.css
    └── workspace/
        ├── TablesWorkspace.tsx
        └── TablesWorkspace.css
```

### Service Layer: frontend/src/api/tables.ts

Expose functions:
- `uploadTable(projectId, file)`
- `getTables(projectId)`
- `getTableDetail(tableId)`
- `renameTable(tableId, newName)`
- `renameColumn(tableId, columnId, newName)`
- `deleteTable(tableId)`
- `reuploadTable(tableId, file)`

### Components

**TablesPage** (main page)
- Shows list of tables or detail view of selected table
- Toggle between list and detail
- Upload button

**TablesList** (table browser)
- AG Grid displaying: Name, Columns, Rows, Actions (View, Rename, Delete, Reupload)
- On row click: navigate to detail view
- Loading and error states

**TableDetail** (table viewer)
- Header with table name, column count, row count
- Read-only AG Grid displaying all rows and columns
- Rename table button
- Rename column buttons (per column)
- Delete button
- Reupload button
- Back button

**UploadTableModal**
- File input (accept .csv)
- Submit button
- Loading state
- Error handling (invalid CSV format, etc)

**RenameTableModal**
- Text input pre-filled with current name
- Submit button

**RenameColumnModal**
- Text input pre-filled with current column name
- Submit button

**DeleteTableModal**
- Confirmation message: "Are you sure? This cannot be undone."
- Shows if table is referenced in master table (disables delete with message)
- Delete/Cancel buttons

**TablesWorkspace** (if we create a full workspace mode)
- Container component with left sidebar for table list
- Main content area for table detail
- Can be expanded later

---

## File Execution Order

### Backend

1. **Migration:** `CreateTables.ts` migration file with both tables schema
2. **Shared types:** Add Table, TableColumn, TableRow interfaces to shared package
3. **DTOs:** Create all DTO files
4. **Repository:** Create TableRepository with all database methods
5. **Service:** Create TableService with all business logic (includes CSV parsing and type inference)
6. **Controller:** Create TablesController with all endpoints
7. **Module:** Create TablesModule and register in AppModule

### Frontend

1. **API service:** Create `tables.ts` API layer
2. **Components:** Create each modal component (UploadTableModal, RenameTableModal, etc)
3. **Components:** Create TablesList and TableDetail components
4. **Page:** Create main TablesPage component
5. **Routes:** Add `/projects/:projectId/tables` route to main routing

---

## Rules and Edge Cases

- **Duplicate column names:** Auto-suffix with _2, _3, etc. Store the resolved name in columns JSONB
- **Empty columns:** Reject CSV with no columns or columns with empty names
- **Type inference:** If a column has mixed types, default to text
- **Division of responsibilities:** Backend owns all CSV parsing and type inference; frontend just sends file
- **Delete protection:** Cannot delete table if it is referenced (has mapped or lookup columns) in the master table — check master_table.columns for any source_table_id or lookup_table_id matching this table_id
- **Re-upload:** Clears all existing rows but keeps table_id and columns, allowing for data refresh
- **Row limit:** No pagination on table detail view — load all rows (revisit when performance becomes an issue)

---

## Dependencies

- **On:** Projects feature (tables belong to projects)
- **Blocking:** Users feature, Master Tables feature (for validation that deleted tables aren't referenced)
- **Future:** Formula engine will reference table columns; Master Tables will join against these tables

---

## Open Questions

- None at this stage. Spec decisions about file size and duplicate columns are documented and decided.
