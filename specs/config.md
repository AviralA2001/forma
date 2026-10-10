# Project metadata

> **Agent instructions:** [instructions.md](/.onesquad/instructions.md)

Reverse-engineered from the repository on 2026-10-10. This file records detected tooling. It is not a product spec.

## Issue tracker

No tracker is connected.

`.onesquad/config.md` still has placeholder values for tool, workspace, base URL, and issue ID format. Feature specs in this pass use directory slugs (`projects`, `tables`) because there are no issue IDs to attach.

## Version control

- **Tool:** Git
- **Host:** GitHub
- **Remote:** `https://github.com/AviralA2001/astra.git`
- **Default branch:** `main`
- **Local directory name:** `forma`

## AI tooling

- **OneSquad config** (`.onesquad/config.md`): primary Claude Code, secondary GitHub Copilot
- **Cursor MCP:** `.cursor/mcp.json` points at `https://mcp.os-ai.dev/v1/mcp`
- **VS Code MCP:** `.vscode/mcp.json` points at the same server, with an empty Authorization header
- **Role stubs:** `.claude/agents/` and `.claude/commands/`
- **Copilot instructions:** `.github/instructions/onesquad.instructions.md`

## Cloud and deployment

Not chosen yet. No infrastructure-as-code, Dockerfile, or CI workflow is in the repo. Development defaults live in `.env.example` and the app servers.
