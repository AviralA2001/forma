# Feature Spec — Projects

## What
A project is the top level container in Forma. Everything — tables, master table configuration, users, routing rules — lives inside a project. Admin creates and manages projects. Users access published projects.

## Why
Without a project there is nothing to build inside. This is the first thing an admin does when they arrive in Forma. It also defines the publish lifecycle — a project starts as a draft and becomes live only when it is ready.

## Scope
- Admin can create a project with a name
- Admin can see a list of all their projects
- Admin can open a project and enter the project workspace
- A project has two statuses: draft and published
- A project is created in draft by default
- Admin can delete a draft project
- Project name can be edited after creation

## Out of Scope
- Publishing logic (covered in the Publish feature)
- Multiple admins per project
- Project templates
- Archiving projects
- Any user-facing project access (covered in the Users feature)

## User Stories

**As an admin:**
- I arrive at Forma and see a list of my projects
- I create a new project by giving it a name
- I click into a project and see the project workspace with sections: Tables, Master Table, Users, Audit
- A Publish button is visible in the workspace header to publish the project
- I can rename my project
- I can delete a project I no longer need (draft only)
- I can see at a glance which projects are draft and which are published

## Dependencies
- None. This is the first feature.

## Open Questions
- None.