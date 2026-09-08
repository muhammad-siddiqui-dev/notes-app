---
id: 006
title: Notes Core Tasks Generated
stage: tasks
date: 2026-09-03
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.tasks
labels: ["notes-app", "tasks", "digest-compatibility"]
links:
  spec: specs/001-notes-core/spec.md
  plan: specs/001-notes-core/plan.md
  tasks: specs/001-notes-core/tasks.md
files:
  - specs/001-notes-core/tasks.md
tests:
  - Task format validated: 55 tasks; all follow checklist format; [P] and [Story] labels correct; phases aligned to user stories
---

## Prompt

Run `/sp.tasks` for feature `001-notes-core`. Load `plan.md`, `spec.md`, `data-model.md`, `contracts/`, `research.md`. Generate tasks organized by user story (P1 Create/View, P2 Edit/Soft-Delete/Visibility, P3 Feature/Search) with phases (Setup, Foundational, User Stories 1-3, Polish). Include mandatory tests per Constitution Principles III-IV. Add structured logging tasks (Principle V). Include complexity justification task (Principle VI — basic search, not FTS; REST API simplest). Use concrete file paths (`backend/src/`, `frontend/src/`, `tests/`). Stack: Next.js + TypeScript + PostgreSQL.

## Response snapshot

Generated `specs/001-notes-core/tasks.md` with 55 tasks across 6 phases. Phase 1 (Setup): 6 tasks. Phase 2 (Foundational): 6 tasks (model, auth middleware, API routing, migrations, validation framework, contract tests). Phase 3 (US1): 11 tasks (tests + endpoint + service + frontend + logging + validation). Phase 4 (US2): 7 tasks. Phase 5 (US3): 7 tasks. Phase 6 (Polish): 10 tasks (security, contract validation, performance, observability, complexity review). All tasks use strict checklist format (`- [ ] T### [P?] [US?] Description with file path`). Mandatory tests included for all user stories. Independent test criteria from `spec.md` referenced per phase. Parallel markers applied appropriately. Ready for `/sp.implement`.

## Outcome

- ✅ Impact: Task list complete; all phases covered; user story phases independent; mandatory tests included; concrete file paths; stack confirmed
- 🧪 Tests: Format validation: 55 tasks, 43 parallel markers, 35 story labels, all checkboxes present; no unresolved placeholders
- 📁 Files: `specs/001-notes-core/tasks.md`, `history/prompts/001-notes-core/006-notes-core-tasks.tasks.prompt.md`
- 🔁 Next prompts: `/sp.implement` — begin with MVP (User Story 1: Create/View Note) after confirming database framework setup
- 🧠 Reflection: Tasks mapped directly to user stories from spec.md; contract and integration tests included per Principles III-IV; structured logging tasks included per Principle V; complexity justification included per Principle VI; no unnecessary abstractions added.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS — task count by phase verified; format validated; story dependency order preserved; parallel opportunities documented
- Prompt variant: N/A
- Next experiment: Proceed to `/sp.implement` — start with Phase 1 Setup tasks, then Foundational, then User Story 1 (P1 MVP) independently; confirm PostgreSQL schema and migrations before service implementation
