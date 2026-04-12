# Feature Spec — Tables

## What
Tables are the raw reference data that powers a project. Admin uploads one or more CSV files into a project. Each CSV becomes a table. Tables are the source of truth for reference data — salary bands, job roles, rates, lookup values — that the master table is built on top of.

## Why
Before an admin can configure a master table, they need data to work with. Tables are that data. Without at least one table uploaded, there is nothing to map columns from, nothing to join, and nothing to build formulas against.

## Scope
- Admin can upload a CSV file to a project
- Each CSV becomes one table
- Column names are inferred from the CSV header row
- Data types are inferred per column (text, number)
- Admin can see a list of all tables in a project
- Admin can click a table and see its raw data in a read-only grid
- Admin can rename a table after upload
- Admin can rename columns after upload
- Admin can delete a table (only if it is not referenced in the master table)
- Admin can re-upload a CSV to replace a table entirely

## Out of Scope
- Editing individual cell values in a table
- Supporting file formats other than CSV
- Column type overrides by admin (type is inferred automatically)
- Pagination of raw table data (load all rows for now)

## User Stories

**As an admin:**
- I am on the Tables page of my project
- I upload a CSV file and it appears in my tables list with its name, column count, and row count
- I click on a table and see all its data in a clean read-only grid
- I can rename the table to something meaningful
- I can rename individual columns if the CSV headers are unclear
- I can delete a table I no longer need
- I can re-upload a CSV to replace the data in an existing table

## Dependencies
- Projects feature must exist — tables belong to a project

## Open Questions
- What is the maximum CSV file size we support? For now, no limit — revisit when performance becomes an issue.
- What happens if the CSV has duplicate column names? Auto-suffix with a number e.g. Name, Name_2.
