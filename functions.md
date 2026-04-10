# Functions

Forma's heart and soul. This document describes what Forma is, how it thinks, and every rule it enforces. Anyone reading this should be able to understand the entire product without looking at any code.

---

## What Forma Does

Business teams run critical processes inside spreadsheets. The spreadsheet works — the logic is sound, the formulas are right, the structure is clear. But the moment multiple people need to interact with it, it breaks down. Versions conflict. People edit things they shouldn't. There is no clear flow for who does what and when.

Forma takes that spreadsheet logic and turns it into a proper multi-user application. The admin who built the spreadsheet configures Forma using the same mental model — columns, formulas, values. The people who used to receive the spreadsheet now interact with a controlled application that shows them only what they need to see and lets them do only what they are supposed to do.

Nobody learns a new tool. Nobody rebuilds their logic. The spreadsheet becomes an application.

---

## Core Concepts

### Project
A project is a single workflow. It contains all the tables, configuration, users, and routing rules for one process. An admin creates and owns a project. A project starts as a draft and is published when ready. Users can only access published projects.

### Tables
Admin uploads one or more CSVs into a project. Each CSV becomes a table. Tables are the raw reference data — the bands, the rates, the lookup values the workflow depends on. Tables are read-only after upload. Admin can re-upload to replace.

### Master Table
The master table is the heart of a project. It is not a data table — it is a configuration that defines what the application looks like and how it behaves. Admin builds it by combining columns from uploaded tables, writing formula columns, and defining user input columns. This is what users interact with.

### Users
Users are the people who participate in the workflow. They are uploaded by the admin as a CSV. Every user sees only the rows assigned to them, with only the columns the admin has permitted. A user fills in their inputs and submits. The row then moves to whoever is next in the workflow.

### Rows
A row is one record in the workflow. It carries all its values — reference data pulled from tables, user input filled in during the workflow, and a routing value that determines where it goes next. Rows move between users as the workflow progresses.

---

## Master Table Columns

Every column in the master table has a type. The type determines where its value comes from and how it behaves.

### Mapped
Value is pulled from a raw uploaded table via a defined join. Admin picks the source table and source column. Value is read at fetch time. Never editable by users.

### Formula
Value is calculated at fetch time from other columns using Excel-compatible syntax. Admin writes the formula using column names as references.

```
AY3_mid = base_mid + (NHE * 25) + (AE * 50)
base_ratio = base_actual / AY3_mid
```

Formula columns are evaluated in dependency order — if one formula references another, the dependency is resolved first. Never editable by users.

### User Input
Value is filled in by the user. Admin defines the input type:
- **Text** — free text entry
- **Number** — numeric value only
- **Dropdown** — admin defines a fixed list of allowed values

### Lookup
A special input type. Renders as a dropdown populated from a reference table column. When the user selects a value, the system resolves the join and auto-fills all mapped columns that source from the same table. The user picks one value and the rest populate instantly.

Example: User selects "Senior Engineer" from a Job Role lookup. Base Midpoint, NHE Target, and AE Target all fill automatically from the bands table.

### Routing
A hidden column that drives the workflow. Always invisible to users. Holds a user id — the next person the row should go to. Admin defines one routing column per master table. On submission, the system reads this column, transfers the row, and updates the value to chain to the next user.

---

## Joins

Admin defines how tables relate to each other. A join connects two tables on matching column values. This is how mapped and lookup columns pull values from reference tables into the master table view.

```
Bands Table . Job Role = Offer Table . Job Role
```

Multiple joins can be defined in one project. The master table can pull mapped columns from any joined table.

---

## Visibility and Editability

### Column Level
Admin sets visibility and editability on each master table column. These apply to all users.
- Formula and mapped columns are always read-only regardless of flags
- Routing column is always hidden regardless of flags

### Row Level
Admin assigns rows to users. Each assignment carries its own visibility and editability flags. A user sees a row only if it is in their assignment and is_visible is true. A user can edit a row only if is_editable is also true.

The combination of column-level and row-level flags means fine-grained control. A user might be able to see a row but not edit it. They might be able to edit some columns on a row but not others.

---

## Users and User Data

Users are uploaded as a CSV. Required fields are id, name, and email. Any additional columns in the CSV are stored as flexible data on the user record. These extra columns can be used by the routing engine.

Example:
```
id, name, email, manager_id, region
u1, John, john@co.com, u3, APAC
u3, Mike, mike@co.com, u5, APAC
u5, Director, dir@co.com, null, APAC
```

`manager_id` and `region` are not special fields — they are just data on the user that the admin can reference in routing configuration.

---

## Routing and Workflow

### The Routing Column
Admin marks one column as the routing column. This column holds a user id at all times. It is the answer to "who owns this row next."

Admin defines where the routing column gets its value from:
- **From the row** — another column on the row holds the target user id. The user may have selected this (e.g. a "Send To" dropdown) or it may be mapped from a table.
- **From the submitting user's data** — a column on the submitting user's record holds the target user id (e.g. manager_id).

### Submission
When a user submits a row:
1. System validates all required inputs are filled
2. System validates all formulas resolve without error
3. System reads the routing column value — this is the target user id
4. Row is removed from the submitting user's row list
5. Row is added to the target user's row list
6. System looks up the target user's data record
7. Routing column value is updated to the target user's routing source column value (e.g. their manager_id)
8. If the new routing value is null — the chain ends. Row is complete.

### Peer Routing
User selects who to send to from a dropdown. Routing column is set once. Row goes to that user. Chain ends after one transfer (their routing source will be null or not configured).

### Hierarchical Routing
Routing column sources from the submitting user's manager_id. Each time a user acts on the row and passes it along, the routing column updates to the next manager in the chain. Automatically walks up the hierarchy until it reaches a user with no manager.

```
John submits → routes to Mike (John's manager_id)
Mike approves → routes to Director (Mike's manager_id)
Director approves → routing value is null → complete
```

### Both patterns use the same mechanism. The routing column just chains differently depending on what the routing source column resolves to at each step.

---

## Formula Engine

One formula engine handles all column formula evaluation. It runs at read time when a row is fetched.

### Syntax
Excel-compatible. Column names used instead of cell references.

Supported:
- Math: `+ - * / ()`
- Comparison: `> < >= <= = <>`
- Logic: `IF, AND, OR, NOT`
- String: `CONCAT, LEFT, RIGHT, LEN, TRIM`
- Date: `TODAY, DATEDIF` (Phase 2)

### Evaluation
1. Resolve all mapped column values via joins
2. Merge user input values from the row
3. Build dependency graph of formula columns
4. Evaluate in dependency order
5. Return fully resolved row

### Errors
- Division by zero → return 0
- Undefined column reference → blocked at publish time
- Circular reference → blocked at master table save time
- Formula error at read time → return 0, flag the cell

---

## Validation Rules

### At Master Table Save
- All formula references must point to existing columns
- No circular references
- Maximum one routing column per master table

### At Publish
- At least one table uploaded
- Master table has at least one column configured
- At least one user added to the project
- All formula columns pass validation
- If routing is configured — routing source column must exist on the row or on user data

### At Submission
- All user_input columns marked required must have values
- All formula columns must resolve without error
- Routing column must resolve to a valid user id (unless no routing is configured)

---

## What Forma Is Not

- Forma is not a spreadsheet. Users cannot add columns or change structure.
- Forma is not a form builder. The structure comes from existing spreadsheet logic.
- Forma is not a reporting tool. Aggregates and dashboards are a later phase.
- Forma does not store formula results. They are always computed fresh at read time.
