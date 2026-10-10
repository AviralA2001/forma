# Design System

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)
> **Status:** Approved
> **Approved by:** Aviral Agrawal <Avi.aviral2001@gmail.com> — 2026-10-10T11:49:36Z
> **Source:** `apps/frontend/src/styles/tokens.css` and `components.css`. Screens must use these tokens and classes.

Forma is a light admin UI. Body text is `#111827` on `#f9fafb`. The brand accent is `#46dae5`. The workspace sidebar is dark. Do not introduce a second palette or a utility-CSS framework for these screens.

## Foundations

### Colour palette

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg-base` | `#f9fafb` | Page background |
| `--color-bg-surface` | `#ffffff` | Cards, inputs, modals |
| `--color-bg-subtle` | `#f3f4f6` | Hover, disabled fill, draft badge |
| `--color-bg-hover` | `#f3f4f6` | Hover surface |
| `--color-bg-sidebar` | `#1e2e2d` | Workspace sidebar |
| `--color-bg-sidebar-hover` | `#2a3c3e` | Sidebar item hover |
| `--color-border` | `#e5e7eb` | Default border |
| `--color-border-strong` | `#d1d5db` | Secondary button border |
| `--color-text-primary` | `#111827` | Headings and body |
| `--color-text-secondary` | `#6b7280` | Supporting text. Not for the main label of a control. |
| `--color-text-sidebar` | `#c9d1d9` | Sidebar item |
| `--color-text-sidebar-active` | `#ffffff` | Active sidebar item |
| `--color-brand` | `#46dae5` | Primary button, focus, links |
| `--color-brand-hover` | `#38afca` | Primary hover |
| `--color-brand-light` | `#cffafe` | Focus ring, primary badge |
| `--color-success` | `#16a34a` | Success text, published badge |
| `--color-success-light` | `#dcfce7` | Success background |
| `--color-error` | `#dc2626` | Error text, destructive button |
| `--color-error-light` | `#fee2e2` | Error background |
| `--color-warning` | `#ea580c` | Warning text |
| `--color-warning-light` | `#fed7aa` | Warning background |

Readable content uses `--color-text-primary`. `--color-text-secondary` is for dates, helper text, and inactive chrome.

### Typography scale

Font: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`.

Mono: `'JetBrains Mono', 'Fira Code', monospace`. Used for `code` only.

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 11px | Badges, card subtitles, helper text |
| `--text-sm` | 12px | Breadcrumbs, labels, error copy |
| `--text-base` | 14px | Body, buttons, inputs |
| `--text-lg` | 16px | Large button |
| `--text-xl` | 18px | Modal title, empty-state heading |
| `--text-2xl` | 22px | Page title when a screen needs it |

Weights: 400, 500, 600, 700 (`--font-light` through `--font-bold`). Line heights: 1.4, 1.5, 1.6.

### Spacing scale

| Token | Value |
| --- | --- |
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 12px |
| `--spacing-lg` | 16px |
| `--spacing-xl` | 24px |
| `--spacing-2xl` | 32px |

### Border radii

| Token | Value |
| --- | --- |
| `--radius-sm` | 4px |
| `--radius-md` | 6px |
| `--radius-lg` | 8px |
| `--radius-xl` | 12px |

Buttons and inputs use `--radius-md`. Cards use `--radius-lg`. Modals use `--radius-xl`. Badges use `--radius-sm`.

### Shadows

| Token | Value |
| --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` |
| `--shadow-md` | `0 1px 3px rgba(0, 0, 0, 0.08)` |
| `--shadow-lg` | `0 2px 8px rgba(0, 0, 0, 0.1)` |
| `--shadow-xl` | `0 4px 12px rgba(0, 0, 0, 0.15)` |
| `--shadow-2xl` | `0 10px 40px rgba(0, 0, 0, 0.15)` |

Cards use `--shadow-lg` on hover. Modals use `--shadow-2xl`.

### Z-index scale

| Layer | Value |
| --- | --- |
| Modal overlay | 1000 |

No other z-index is defined. New layers go above or below the modal, not between unnamed values.

### Other foundations

| Token | Value |
| --- | --- |
| `--size-button-height` | 36px |
| `--size-input-height` | 36px |
| `--size-modal-width-sm` | 400px |
| `--size-modal-width-md` | 600px |
| `--size-modal-width-lg` | 800px |
| `--transition-fast` | 0.15s ease |
| `--transition-base` | 0.2s ease |
| `--transition-slow` | 0.3s ease |

Focus ring on inputs: border `--color-brand`, shadow `0 0 0 3px var(--color-brand-light)`.

## Components

### Button

- **Variants:** `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-destructive`. Sizes: default (36px), `btn-sm` (32px), `btn-lg` (40px).
- **States:** default, hover, disabled (opacity 0.5, `cursor: not-allowed`). Primary hover uses `--color-brand-hover`. Destructive hover is `#b91c1c`.
- **Props:** label, variant, size, disabled, type.
- **Usage rules:** One primary action per dialog. Cancel is secondary or ghost. Delete is destructive. Labels are verbs: "Create Project", "Upload CSV".

### Input

- **Variants:** text, number, textarea, select. Error modifier: `input-error`.
- **States:** default, focus, disabled, error.
- **Props:** value, placeholder, disabled, error message.
- **Usage rules:** Labels use `input-label` at `--text-sm` and primary text colour. Helper text uses `input-helper`. Error text uses `error-message` under the field. Do not submit an empty required name.

### Combobox

- **Variants:** default, `combobox-trigger-error`.
- **States:** default, hover, focus, disabled, error.
- **Props:** label, value, options, disabled, error.
- **Usage rules:** Same focus ring as inputs. Not used by the projects or tables screens today. Do not invent a second dropdown style.

### Modal

- **Variants:** padded `.modal` (max width `--size-modal-width-sm`) and structured `.modal-content` with header, body, and footer.
- **States:** open, closed, submitting (actions disabled).
- **Props:** title, body, primary action, secondary action, on close.
- **Usage rules:** Overlay is `rgba(0, 0, 0, 0.5)` at z-index 1000, centered. Clicking the overlay closes. Escape closes. Actions sit at the end of the row: secondary then primary. While a request is in flight, both actions are disabled and the primary label shows the pending verb ("Creating...").

### Badge

- **Variants:** `badge-default`, `badge-primary`, `badge-success`, `badge-error`, `badge-warning`. Project status uses `status-badge` plus `status-draft` or `status-published`.
- **States:** static.
- **Props:** label, variant.
- **Usage rules:** Draft is the subtle badge. Published is the success badge. Status text is the status word, capitalised.

### Toggle

- **Variants:** one, 44×24.
- **States:** off, on (brand fill, knob translated), disabled.
- **Props:** checked, disabled, label.
- **Usage rules:** The label sits outside the control. Not used by the current project or table screens.

### Card

- **Variants:** one. Header (title plus optional badge), subtitle, optional body, optional footer.
- **States:** default, hover (brand border, `--shadow-lg`, 2px lift).
- **Props:** title, subtitle, badge, on click.
- **Usage rules:** A project card is the whole click target. Title is primary text. "Created {date}" is `--text-xs` secondary text.

### Link

- **Variants:** `link` (brand), `link-muted`.
- **States:** default, hover.
- **Props:** href, label.
- **Usage rules:** Navigation that is not a button uses a link. Breadcrumb ancestors use `breadcrumb-link`. The current crumb is `breadcrumb-current` and is not a link.

### Breadcrumbs

- **Variants:** one row, separator between items.
- **States:** link, current.
- **Props:** items, current label.
- **Usage rules:** Ancestor, then separator, then current. Current is primary text at medium weight.

### Empty state

- **Variants:** centered block, max width 400px, minimum height 400px.
- **States:** empty only.
- **Props:** heading, body, primary action.
- **Usage rules:** Heading is `--text-xl` primary. Body is secondary. One primary button under the copy.

### Loading state

- **Variants:** text row, optional `.spinner`.
- **States:** loading.
- **Props:** message.
- **Usage rules:** Projects use the sentence "Loading projects...". Tables use "Loading tables...". The workspace uses "Loading...". Do not swap in a different pattern per screen.

### Error banner

- **Variants:** `error-message` (under a field), `error-banner` (page), `modal-error`.
- **States:** visible, absent.
- **Props:** message.
- **Usage rules:** Background `--color-error-light`, text `--color-error`, border `--color-error`. Say what failed in one sentence.

### Success banner

- **Variants:** `success-message`, `success-banner`.
- **States:** visible, absent.
- **Props:** message.
- **Usage rules:** Same structure as the error banner, with success colours. The current project and table flows do not show one. Use it when a later spec requires a confirmation that stays on the page.

### Data grid

- **Variants:** AG Grid Alpine, full width of the table pane.
- **States:** rows present. Empty and loading are the tables page states, not grid states.
- **Props:** columns, rows, page size.
- **Usage rules:** Read-only. Sort, filter, and resize are on. Default page size is 50, with 20 and 100 available. Column headers show the column name and a rename control. Do not add cell editing here.

## Patterns

### Page shell

Project list is a page heading plus one primary button, then either loading, an error banner, an empty state, or a grid of cards.

The workspace is a header (back, editable title, status badge, Publish), a breadcrumb, a dark sidebar, and a main pane. Sidebar items are Master Table, Tables, Users, and Audit. Only Tables has a designed body. The other three are a heading and the sentence "coming soon" until a feature spec exists.

### Dialog for a name

One text field, Cancel, and a primary confirm. Enter submits. Escape or overlay dismisses. Empty input shows `error-message` and does not submit.

### Table tabs

One tab per table. The active tab is selected. Each tab has a menu: Rename, Reupload, Delete. A "+" tab opens upload. Rename, re-upload, and delete use the modal pattern. Delete uses the destructive button.
