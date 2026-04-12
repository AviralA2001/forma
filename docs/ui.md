# UI Design System

Forma is a tool for business teams — HR, operations, finance. The UI must feel serious, trustworthy, and data-dense. It gets out of the way of the data. Clean whites, neutral grays, a dark sidebar, and subtle borders. Professional without being sterile.

Read this fully before writing any frontend code. Every UI decision must be consistent with this document.

---

## Design Principles

1. **Data first** — the interface exists to show and collect data. Nothing decorative that doesn't serve that purpose.
2. **Density over whitespace** — business users work with a lot of data. Use space efficiently.
3. **Predictable over clever** — interactions behave exactly as expected. No surprises.
4. **Errors are clear** — validation errors, formula errors, and routing failures must be impossible to miss.
5. **Admin and user feel different** — the admin configuration experience is more complex and technical. The user experience is clean and focused.

---

## Global Rules — Apply to Every Page

These rules apply to every page in the application without exception. They do not need to be repeated in individual feature specs.

### Breadcrumbs
Every page must show breadcrumbs at the top of the content area, below the page header. Breadcrumbs show the full path to the current page and each segment is clickable.

```
Projects > Offers Tool > Master Table
```

- Root is always "Projects" linking to the projects list
- Segments are separated by ">"
- Current page segment is not clickable
- Font size: 12px, color: `--color-text-secondary`
- Clickable segments: `--color-brand` on hover

### Back Button
Every page that is not the root (projects list) must have a back button. The back button sits to the left of the page title in the page header. It is a ghost button with a left arrow icon. It navigates to the logical parent page — not necessarily browser history.

```
← Projects       (from project workspace)
← Offers Tool    (from a section within a project)
```

---

## Color Palette

```css
/* Background */
--color-bg-base: #F9FAFB;
--color-bg-surface: #FFFFFF;
--color-bg-sidebar: #1E1E2E;
--color-bg-sidebar-hover: #2A2A3E;
--color-bg-subtle: #F3F4F6;

/* Border */
--color-border: #E5E7EB;
--color-border-strong: #D1D5DB;

/* Text */
--color-text-primary: #111827;
--color-text-secondary: #6B7280;
--color-text-disabled: #9CA3AF;
--color-text-sidebar: #C9D1D9;
--color-text-sidebar-active: #FFFFFF;

/* Brand */
--color-brand: #4F46E5;
--color-brand-hover: #4338CA;
--color-brand-light: #EEF2FF;

/* Status */
--color-success: #16A34A;
--color-success-light: #DCFCE7;
--color-warning: #D97706;
--color-warning-light: #FEF3C7;
--color-error: #DC2626;
--color-error-light: #FEE2E2;
--color-info: #2563EB;
--color-info-light: #DBEAFE;
```

---

## Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

--text-xs: 11px;
--text-sm: 12px;
--text-base: 14px;
--text-md: 15px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 22px;

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

All UI text is 14px by default. Labels are 12px. Page titles are 18px.

---

## Layout

### Shell
```
┌─────────────────────────────────────────────┐
│  Sidebar (240px, dark)  │  Main Content Area │
│                         │                    │
│  - Project nav          │  - Page header     │
│  - Section nav          │  - Breadcrumbs     │
│                         │  - Content         │
│                         │                    │
└─────────────────────────────────────────────┘
```

- Sidebar: fixed, 240px, dark (`--color-bg-sidebar`)
- Main content: fluid, white (`--color-bg-surface`)
- Page header: 56px tall, bottom border, back button + page title left, primary actions right
- Breadcrumbs: directly below page header, 12px, `--color-text-secondary`
- Content area: 24px padding all sides

### Admin Sidebar
- Forma logo
- Project switcher
- Section links: Tables, Master Table, Users

### User Sidebar
- Forma logo
- Project name
- View switcher: Table View, Form View

---

## Spacing

Base unit is 4px. Use multiples of 4.

```
4px  — xs
8px  — sm
12px — md
16px — lg
24px — xl
32px — 2xl
```

---

## Components

### Buttons

**Primary** — brand color, white text. One per page maximum.
```
background: --color-brand
color: white
padding: 8px 16px
border-radius: 6px
font-size: 14px
font-weight: 500
```

**Secondary** — white, bordered.
```
background: white
border: 1px solid --color-border-strong
color: --color-text-primary
padding: 8px 16px
border-radius: 6px
```

**Destructive** — error color. Irreversible actions only.
```
background: --color-error
color: white
```

**Ghost** — no background, no border. Toolbars, back button, tight spaces.
```
background: transparent
color: --color-text-secondary
hover background: --color-bg-subtle
```

---

### Inputs

Base style for all inputs:
```
height: 36px
border: 1px solid --color-border
border-radius: 6px
padding: 0 12px
font-size: 14px
background: white
focus: border --color-brand, ring 2px --color-brand-light
```

**Formula Input** — monospace font, 40px tall, light gray background.
```
font: --font-mono 13px
height: 40px
background: #F6F8FA
```

**Error state** — border `--color-error`, error message below in 12px `--color-error`.

---

### Table — AG Grid

All AG Grid instances follow these rules:

```
Row height: 40px
Header height: 40px
Font size: 14px
Border color: --color-border
Header background: --color-bg-subtle
Header text: --color-text-secondary, font-weight 600
```

**Cell states:**
- Read-only: background `--color-bg-subtle`
- Editable: background `white`, inset border on focus
- Error: background `--color-error-light`, red bottom border, tooltip on hover
- Selected: background `--color-brand-light`

Column definitions are always generated dynamically from master table config. Never hardcoded. Routing column is never passed to AG Grid — strip it before building column definitions.

---

### Badges

```
padding: 2px 8px
border-radius: 4px
font-size: 11px
font-weight: 500
```

| Badge | Background | Text |
|-------|------------|------|
| Draft | `--color-bg-subtle` | `--color-text-secondary` |
| Published | `--color-success-light` | `--color-success` |
| Formula | `--color-brand-light` | `--color-brand` |
| Mapped | `--color-bg-subtle` | `--color-text-secondary` |
| User Input | `--color-warning-light` | `--color-warning` |
| Lookup | `--color-info-light` | `--color-info` |

Routing column badge is never shown to users.

---

### Formula Bar

Full-width input that appears when a formula column is selected in the column builder.

```
width: 100%
height: 40px
font: --font-mono 13px
background: #F6F8FA
border: 1px solid --color-border
border-radius: 6px
padding: 0 12px
```

Shows column name autocomplete as admin types.

---

### Sidebar

```
width: 240px
background: --color-bg-sidebar
padding: 16px 0
```

**Logo area:** 56px tall, 16px padding, bottom border `rgba(255,255,255,0.08)`

**Nav item:**
```
height: 36px
padding: 0 16px
font-size: 14px
color: --color-text-sidebar
border-radius: 6px
margin: 0 8px
```

**Active nav item:**
```
background: --color-bg-sidebar-hover
color: --color-text-sidebar-active
font-weight: 500
```

---

### Publish Button

Publish is not a sidebar section. It is a button in the project workspace header, top right, next to the project status badge.

- When project is draft and conditions are not met: button is disabled, shows "Publish" in secondary style
- When project is draft and all conditions are met: button is enabled, shows "Publish" in primary style
- When project is published: button changes to "Unpublish" in destructive style

Publish conditions checklist is shown as a tooltip or dropdown on the disabled publish button so admin can see what is missing.

---

### Empty States

Every list and table must handle empty state:
- Short title: "No tables uploaded yet"
- One-line description: "Upload a CSV to get started"
- Primary action button if applicable

No illustrations. No icons. Text and button only.

---

### Error States

- **Inline field error** — 12px red text below the field
- **Cell error** — red background tint, tooltip on hover with formula error
- **Page error** — dismissible banner at top of content area in `--color-error-light`
- **Publish validation** — tooltip/dropdown on disabled publish button listing unmet conditions

---

## Admin Pages

### Projects List
- Page header: "Projects" title, "New Project" primary button top right
- No back button on this page — it is the root
- No breadcrumbs on this page — it is the root
- Grid of project cards: name, status badge, created date
- Empty state if no projects

### Project Workspace
- Page header: back button (← Projects), project name (inline editable), status badge, Publish button top right
- Breadcrumbs: Projects > Project Name
- Sidebar sections: Tables, Master Table, Users, Audit
- Each section is a placeholder for feature-specific UI

### Tables Page
- Breadcrumbs: Projects > Project Name > Tables
- List of uploaded tables: name, column count, row count
- Upload CSV button (primary)
- Click table → read-only AG Grid of raw data

### Master Table Page
- Breadcrumbs: Projects > Project Name > Master Table
- Three sections laid out vertically:
  1. **Joins** — list of defined joins, add button
  2. **Column Builder** — configuration grid. Each row is one master table column. Columns: Name, Type, Config, Visible, Editable, Actions
  3. **Formula Bar** — appears when a formula column row is active

### Users Page
- Breadcrumbs: Projects > Project Name > Users
- List of users: name, email, role
- Upload users CSV button
- Click user → side panel with row assignments and visibility/editability toggles per row

---

## User Pages

### Table View
- Breadcrumbs: Project Name > Table View
- Full-width AG Grid
- Filter bar above grid
- Editable cells white, read-only cells gray
- Submit button top right
- Submitted rows become read-only immediately

### Form View
- Breadcrumbs: Project Name > Form View
- One row per screen
- Only user_input and lookup columns shown as form fields
- Mapped and formula columns shown as read-only values below a divider
- Lookup fields trigger auto-fill on selection
- Formula values recalculate instantly when inputs change
- Submit button at bottom
- Previous / Next navigation for multiple rows

---

## Responsive Behaviour

Forma is desktop-first. Minimum supported width is 1280px. Mobile is out of scope for this version.