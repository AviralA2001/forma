# Feature Implementation — Projects

## Database Changes

### New Table: projects
```sql
CREATE TABLE projects (
  project_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  owner_id      UUID NOT NULL,
  status        VARCHAR(20) DEFAULT 'draft',  -- draft | published
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
```

Migration file: `apps/backend/src/migrations/001-create-projects.ts`

---

## Backend

### Module: `apps/backend/src/projects/`

Files to create in order:

**1. `projects.entity.ts`**
TypeORM entity mapping to the projects table.
```
Fields: project_id, name, owner_id, status, created_at, updated_at
```

**2. `dto/create-project.dto.ts`**
```
name: string, required, minLength 1, maxLength 255
```

**3. `dto/update-project.dto.ts`**
```
name: string, optional, minLength 1, maxLength 255
```

**4. `dto/project-response.dto.ts`**
```
project_id, name, owner_id, status, created_at, updated_at
```

**5. `projects.repository.ts`**
Methods:
- `create(ownerId, name)` → project
- `findAllByOwner(ownerId)` → project[]
- `findOne(projectId, ownerId)` → project | null
- `update(projectId, ownerId, name)` → project
- `delete(projectId, ownerId)` → void

**6. `projects.service.ts`**
Methods:
- `createProject(ownerId, dto)` → ProjectResponseDto
- `getProjects(ownerId)` → ProjectResponseDto[]
- `getProject(projectId, ownerId)` → ProjectResponseDto
- `updateProject(projectId, ownerId, dto)` → ProjectResponseDto
- `deleteProject(projectId, ownerId)` → void

Rules:
- Delete is only allowed if status is `draft`
- If project not found or ownerId does not match → throw NotFoundException
- If delete attempted on published project → throw BadRequestException

**7. `projects.controller.ts`**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects` | Create project |
| GET | `/projects` | List all projects for owner |
| GET | `/projects/:id` | Get single project |
| PATCH | `/projects/:id` | Update project name |
| DELETE | `/projects/:id` | Delete draft project |

**8. `projects.module.ts`**
Wire controller, service, repository, and TypeORM entity together.

**9. Register in `app.module.ts`**
Import ProjectsModule.

---

## Frontend

### Pages and components to create in order:

**1. `apps/frontend/src/pages/projects/index.tsx` — Projects List Page**

Layout:
- Page header: "Projects" title, "New Project" primary button top right
- If no projects: empty state — "No projects yet" + "Create your first project" button
- If projects exist: grid of project cards

Project card contains:
- Project name
- Status badge (Draft / Published)
- Created date
- Click anywhere on card → navigate to `/projects/:id`

**2. `apps/frontend/src/pages/projects/components/ProjectCard.tsx`**
- Props: project_id, name, status, created_at
- Renders the card described above

**3. `apps/frontend/src/pages/projects/components/NewProjectModal.tsx`**
- Triggered by "New Project" button
- Single input: Project name
- Confirm button: "Create Project" (primary)
- Cancel button (ghost)
- On confirm → call create API → close modal → navigate to new project workspace
- Inline validation: name cannot be empty

**4. `apps/frontend/src/pages/projects/[id]/index.tsx` — Project Workspace**

Layout:
- Sidebar shows: Tables, Master Table, Users, Audit
- Default section on open: Tables
- Page header shows project name with inline edit on click, plus a Publish button on the right
- Each sidebar item navigates to its section within the workspace

Sections are rendered as child routes:
```
/projects/:id/tables
/projects/:id/master-table
/projects/:id/users
/projects/:id/audit
```

Each section page is a placeholder at this stage — content built in subsequent features.

**5. `apps/frontend/src/api/projects.ts`**
All API calls for projects:
- `createProject(name)` → project
- `getProjects()` → project[]
- `getProject(id)` → project
- `updateProject(id, name)` → project
- `deleteProject(id)` → void

**6. `apps/frontend/src/types/project.ts`**
Local types if not already in `@forma/shared`.

---

## Shared Types

Add to `packages/shared/src/index.ts`:

```typescript
export type ProjectStatus = 'draft' | 'published'

export interface Project {
  project_id: string
  name: string
  owner_id: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}
```

---

## File Execution Order

Execute in this exact order:

1. `packages/shared` — add Project type and ProjectStatus
2. `migrations/001-create-projects.ts` — create and run migration
3. `projects.entity.ts`
4. `create-project.dto.ts`
5. `update-project.dto.ts`
6. `project-response.dto.ts`
7. `projects.repository.ts`
8. `projects.service.ts`
9. `projects.controller.ts`
10. `projects.module.ts`
11. Register in `app.module.ts`
12. `api/projects.ts` — frontend API layer
13. `ProjectCard.tsx`
14. `NewProjectModal.tsx`
15. `pages/projects/index.tsx` — projects list page
16. `pages/projects/[id]/index.tsx` — project workspace shell with sidebar and child routes

---

## Edge Cases

- Admin tries to delete a published project → block with clear error message: "Published projects cannot be deleted"
- Admin creates project with empty name → blocked by DTO validation, inline error on input
- Admin navigates to a project that doesn't exist → 404, redirect to projects list
- Project name edited to empty string → blocked, revert to previous name

---

## Dependencies
- None. This is the first feature, no other features need to exist first.
- `owner_id` is hardcoded for now as authentication does not exist yet. Use a fixed UUID as the placeholder admin user id. This will be replaced when auth is built.