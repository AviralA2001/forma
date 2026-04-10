# Database Design

## Overview

PostgreSQL with JSONB for flexible column data. Relational structure where relationships are clear, JSONB where schema flexibility is needed.

---

## Schema

### Projects
```sql
CREATE TABLE projects (
  project_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  owner_id      UUID NOT NULL,
  status        VARCHAR(20) DEFAULT 'draft', -- draft | published
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

---

### Tables
Raw CSVs uploaded by the admin. Each CSV becomes one table. Columns stored as JSONB since schema varies per upload.

```sql
CREATE TABLE tables (
  table_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(project_id),
  name        VARCHAR(255) NOT NULL,
  columns     JSONB NOT NULL,
  -- [{ column_id, name, data_type }]
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

### Rows
One document per row per table. All values — reference data and user input — stored as a flat key-value map. Admin has full visibility of all rows.

```sql
CREATE TABLE rows (
  row_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id    UUID REFERENCES tables(table_id),
  data        JSONB NOT NULL,
  -- { column_id: value }
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

---

### Master Tables
Configuration only. No data lives here. Defines the shape of the published application.

```sql
CREATE TABLE master_tables (
  master_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(project_id),
  columns     JSONB NOT NULL,
  joins       JSONB NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

#### columns JSONB shape
```json
[
  {
    "column_id": "uuid",
    "name": "Job Role",
    "type": "lookup",
    "is_visible": true,
    "is_editable": true,
    "input_type": "dropdown",
    "lookup_table_id": "uuid",
    "lookup_column_id": "uuid"
  },
  {
    "column_id": "uuid",
    "name": "Base Midpoint",
    "type": "mapped",
    "is_visible": true,
    "is_editable": false,
    "source_table_id": "uuid",
    "source_column_id": "uuid"
  },
  {
    "column_id": "uuid",
    "name": "AY3 Mid",
    "type": "formula",
    "is_visible": true,
    "is_editable": false,
    "formula": "base_mid + (NHE * 25) + (AE * 50)"
  },
  {
    "column_id": "uuid",
    "name": "Base Actual",
    "type": "user_input",
    "is_visible": true,
    "is_editable": true,
    "input_type": "number"
  },
  {
    "column_id": "uuid",
    "name": "Next User",
    "type": "routing",
    "is_visible": false,
    "is_editable": false,
    "is_routing_column": true,
    "routing_source": "row_column | user_data_column",
    "routing_source_column": "column_id or user data key e.g. manager_id"
  }
]
```

#### Column types
| Type | Description |
|------|-------------|
| `mapped` | Pulled from a raw table column via the join |
| `formula` | Calculated at read time from other columns using Excel syntax |
| `user_input` | Filled in by the user, stored directly in the row |
| `lookup` | User selects a value, system resolves the join and auto-populates mapped columns |
| `routing` | Hidden column. Holds the next user id. Drives row transfer on submission |

#### Input types (for user_input and lookup columns)
| Input Type | Description |
|------------|-------------|
| `text` | Free text |
| `number` | Numeric value |
| `dropdown` | Fixed list of values defined by admin |
| `lookup` | Dropdown that triggers a join resolution and auto-fills mapped columns |

#### joins JSONB shape
```json
[
  {
    "base_table_id": "uuid",
    "join_table_id": "uuid",
    "on": {
      "base_column_id": "uuid",
      "join_column_id": "uuid"
    }
  }
]
```

---

### Users
Identity, role, project access, row ownership, and arbitrary data columns from the users CSV.

```sql
CREATE TABLE users (
  user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  role            VARCHAR(20) NOT NULL, -- admin | user
  project_access  UUID[],
  rows            JSONB DEFAULT '[]',
  -- [{ row_id, is_visible, is_editable }]
  data            JSONB DEFAULT '{}',
  -- arbitrary columns from users CSV e.g. { manager_id: u3, region: APAC }
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### rows JSONB shape
```json
[
  {
    "row_id": "uuid",
    "is_visible": true,
    "is_editable": true
  }
]
```

#### data JSONB shape
Flexible. Comes directly from the users CSV columns beyond id, name, and email.
```json
{
  "manager_id": "u3",
  "region": "APAC",
  "level": "L4"
}
```

---

## Routing Mechanism — Data Flow

On submission:

1. System reads the routing column value from the row — this is a user id
2. Transfers the row: removes row_id from submitting user's rows array, adds to target user's rows array
3. Looks up the target user's record
4. Updates the routing column value in the row to the target user's `routing_source_column` value (e.g. their `manager_id`)
5. If the new routing column value is null — the chain ends, row is fully approved

```
John submits offer
→ row.next_user_id = u3 (from John's manager_id)
→ row moves to Mike

Mike approves
→ row.next_user_id = u5 (from Mike's manager_id)
→ row moves to Director

Director approves
→ row.next_user_id = null
→ done
```

---

## Key Design Decisions

**Calculated columns are never stored.** Formula columns are evaluated at read time. This keeps data consistent and avoids stale computed values.

**All row values live in the rows table.** Reference data and user input are both in `rows.data`. Users table only tracks ownership and permissions.

**Routing column is just another column.** It lives in the row's data map like any other column. The only thing special about it is the `is_routing_column` flag and the system's behavior on submission.

**Approver is just a user.** No special role. Any user can receive routed rows.

**User data columns are flexible.** Whatever columns the admin includes in the users CSV beyond id/name/email are stored in `users.data` as JSONB. These can be referenced by the routing engine.

**Known future migration point.** The rows JSONB array on users will need to be extracted into its own table when row counts grow large.

---

## Indexes to Add Later
```sql
CREATE INDEX idx_rows_table_id ON rows(table_id);
CREATE INDEX idx_tables_project_id ON tables(project_id);
CREATE INDEX idx_master_project_id ON master_tables(project_id);
```
