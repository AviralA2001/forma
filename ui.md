# UI Design

## Overview

Two distinct experiences: Admin (configuration) and User (interaction). Admin experience should feel like Excel. User experience should feel like a clean internal tool.

---

## Admin Experience

### 1. Projects List
- Simple list of projects with status badges (Draft / Published)
- Create new project button
- Click project → go to project workspace

---

### 2. Project Workspace
Tabbed layout:

```
[ Tables ]  [ Master Table ]  [ Users ]  [ Publish ]
```

---

### 3. Tables Tab
- Upload CSV button
- List of uploaded tables with column previews
- Click table → see raw data in AG Grid (read only)
- Admin can rename tables and columns

---

### 4. Master Table Tab
This is the core admin experience. Three sections:

**Section A — Joins**
Visual join builder. Admin picks:
- Base table
- Join table
- Matching columns (dropdown on each side)

Displays as a simple list of defined joins.

**Section B — Column Builder**
A grid-like interface where admin adds columns one by one.

Each row in the builder represents one master table column:

| Column Name | Type | Config |
|-------------|------|--------|
| Job Role | Lookup | From: Bands Table → Job Role |
| Base Midpoint | Mapped | From: Bands Table → Base Midpoint |
| AY3 Mid | Formula | `= base_mid + (NHE * 25) + (AE * 50)` |
| Base Actual | User Input | Type: Number |
| Base Ratio | Formula | `= base_actual / AY3_mid` |

Column types:
- **Mapped** — pick source table and source column
- **Formula** — text input with Excel-like formula bar
- **User Input** — pick input type (text, number, dropdown, lookup)
- **Lookup** — pick lookup table and key column

Visibility and editability toggles on each column.

**Section C — Formula Bar**
When admin clicks a formula column, a larger formula input opens at the top (like Excel's formula bar). Shows column name autocomplete as admin types.

---

### 5. Users Tab
- List of users with their roles
- Add user form (name, email, role)
- Click user → configure which rows they can see/edit
- Row assignment is manual at this stage

---

### 6. Publish Tab
- Pre-publish checklist:
  - [ ] At least one table uploaded
  - [ ] Master table configured
  - [ ] At least one user added
  - [ ] All formulas valid
- Publish button (disabled until checklist passes)

---

## User Experience

### 1. Project Home
User lands on their assigned project. Sees only what they have access to.

---

### 2. Table View
AG Grid showing only their visible rows and columns. Inline editing enabled on editable cells. Filter bar at top — filter by any visible column.

Submit button at the top right. Submitting transfers ownership to the approver.

---

### 3. Form View
Alternative to table view. One row per screen. Shows only user_input and lookup columns as form fields. Mapped and formula columns shown as read-only display values (auto-populated).

Lookup field behavior:
- Renders as a dropdown
- On selection, mapped columns auto-fill from resolved lookup
- Formula columns recalculate instantly

Submit button at the bottom.

---

### 4. Approver View
Same as table view but approver sees rows transferred to them. Actions per row:
- Approve
- Reject
- Send Back (transfers row back to original user)

---

## Component Notes

### AG Grid Configuration
- Use Community Edition
- Enable inline editing only on `is_editable: true` columns
- Column definitions generated dynamically from master table config
- `cellEditorSelector` used to render appropriate input per column type (text, number, dropdown)
- Row data fetched from resolve endpoint — fully computed values

### Formula Bar
- Simple controlled input
- Column name autocomplete from current master table columns
- Syntax highlighting nice to have, not required day one

### Lookup Dropdown
- On change → call lookup resolution API
- Response auto-fills mapped columns in the current row
- Show loading state while resolving

---

## View States

| State | Description |
|-------|-------------|
| Loading | Skeleton rows in grid |
| Empty | "No rows assigned" message |
| Error | Formula error on a cell — show red highlight, tooltip with error |
| Read Only | Cell grayed out, not clickable |
| Editable | White cell, clickable |
| Submitted | Row grayed out, submit button disabled |
