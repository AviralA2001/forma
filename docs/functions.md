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

A project is a single workflow. It contains all the tables, configuration, users, and routing rules for one process.

* Created and owned by an admin
* Starts in **draft**
* Must be **published** before users can access
* Users can only access published projects

---

### Tables

Admin uploads one or more CSVs into a project. Each CSV becomes a table.

* Source of truth for reference data
* Read-only after upload
* Can be replaced via re-upload
* Used for joins, mapped columns, and lookups

---

### Master Table

The master table is the heart of a project.

* Not a data table — a configuration layer
* Defines:

  * Columns
  * Formulas
  * User inputs
  * Routing logic
* Built by combining:

  * Columns from tables
  * Formula columns
  * User input columns
* This is the primary interface users interact with

---

### Users

Users participate in workflows.

* Uploaded via CSV
* Required fields: `id`, `name`, `email`
* Additional fields stored as flexible user data
* Users only see:

  * Rows assigned to them
  * Columns permitted to them

---

### Rows

A row is one record in the workflow.

* Contains:

  * Reference data (mapped)
  * User inputs
  * Computed values (formula)
  * Routing value
* Moves between users during workflow

---

## System Guarantees

The system guarantees the following at all times:

* A row may be assigned to one or more users depending on workflow configuration
* A routing column always contains either:

  * A valid user id
  * Null (indicating workflow completion)
* Formula columns are never persisted — only computed at read time
* Mapped columns always reflect latest table data (no caching)
* A user can only see rows explicitly assigned to them
* A user can only edit columns that are both:

  * Marked as editable at the column level
  * Allowed by the row-level assignment permissions
* A row cannot exist without a project
* A project cannot be accessed unless published

---

## Master Table Columns

Every column in the master table has a type.

---

### Mapped

* Value pulled from uploaded tables via joins
* Read at fetch time
* Never editable

---

### Formula

* Computed at fetch time
* Uses Excel-compatible syntax
* Can reference other columns

Examples:

```
AY3_mid = base_mid + (NHE * 25) + (AE * 50)
base_ratio = base_actual / AY3_mid
```

Rules:

* Evaluated in dependency order
* Never editable
* Pure and stateless
* Same inputs always produce same outputs
* No side effects allowed

---

### User Input

Defined by admin.

Types:

* Text
* Number
* Dropdown (fixed values)

Rules:

* Editable based on permissions
* Can be required

---

### Lookup

Special input type.

* Dropdown sourced from a reference table
* On selection:

  * Resolves join
  * Auto-fills mapped columns from same table

Rules:

* Must match value in source table
* Changing value refreshes all dependent mapped columns
* Clearing value resets dependent mapped columns to null

---

### Routing

* Hidden column
* Holds user id of next owner
* Always exists (if workflow enabled)

Rules:

* Not visible to users
* Not editable
* Drives workflow progression

---

## Joins

Admin defines relationships between tables.

Example:

```
Bands.Job Role = Offer.Job Role
```

Rules:

* Enables mapped + lookup resolution
* Multiple joins allowed
* Joins must be valid at configuration time

---

## Visibility and Editability

### Column Level

* Controlled by admin
* Applies globally

Rules:

* Formula + mapped → always read-only
* Routing → always hidden

---

### Row Level

Controlled per assignment.

Each assignment defines:

* `is_visible`
* `is_editable`

Rules:

* User sees row only if `is_visible = true`
* User edits only if `is_editable = true`
* Combined with column rules for fine-grained control

---

## Users and User Data

Users uploaded via CSV.

Example:

```
id, name, email, manager_id, region
u1, John, john@co.com, u3, APAC
u3, Mike, mike@co.com, u5, APAC
u5, Director, dir@co.com, null, APAC
```

Rules:

* Additional fields stored as flexible data
* Can be used in routing logic
* No predefined schema beyond required fields

---

## Routing and Workflow

### Routing Column

Defines who owns the row next.

Sources:

* From row (column value)
* From user data (e.g. manager_id)

---

## Routing Resolution Rules

1. If source = row:

   * Read value from row column

2. If source = user:

   * Read value from submitting user data

3. Result:

   * Valid user id → continue
   * Null → complete
   * Invalid → block submission

4. Resolution must happen synchronously during submission

---

## Submission Flow

On submit:

1. Validate required inputs
2. Validate formulas resolve
3. Resolve routing value
4. Remove row from current user
5. Assign row to next user
6. Load next user's data
7. Update routing column using their routing source
8. If routing becomes null → complete

---

## Routing Patterns

### Peer Routing

* User selects next user
* Single transfer
* Ends after one step

---

### Hierarchical Routing

* Uses `manager_id`
* Automatically walks up hierarchy

Example:

```
John → Mike → Director → Complete
```

---

## Row State

Each row exists in one of the following states:

* ACTIVE → assigned and pending action
* TRANSFERRED → moving between users (transient)
* COMPLETED → routing is null

Transitions:

* ACTIVE → TRANSFERRED → ACTIVE
* ACTIVE → COMPLETED

Rules:

* Only ACTIVE rows visible
* COMPLETED rows are read-only
* TRANSFERRED is temporary

---

## Formula Engine

Single engine evaluates all formulas.

### Evaluation Steps

1. Resolve mapped values via joins
2. Merge user inputs
3. Build dependency graph
4. Evaluate in order
5. Return resolved row

---

### Supported Functions

* Math: `+ - * / ()`
* Comparison: `> < >= <= = <>`
* Logic: `IF, AND, OR, NOT`
* String: `CONCAT, LEFT, RIGHT, LEN, TRIM`
* Date: `TODAY, DATEDIF` (Phase 2)

---

### Error Handling

* Division by zero → return 0
* Undefined reference → blocked at publish
* Circular reference → blocked at save
* Runtime error → return 0 and flag

---

## Validation Rules

### Master Table Save

* All references valid
* No circular dependencies
* Max one routing column

---

### Publish

* At least one table
* At least one column
* At least one user
* Valid formulas
* Valid routing config

---

### Submission

* Required inputs filled
* Formulas resolve
* Routing resolves to valid user or null

---

## What Forma Is Not

* Not a spreadsheet (no structure editing by users)
* Not a form builder
* Not a reporting tool (yet)
* Does not store computed values
