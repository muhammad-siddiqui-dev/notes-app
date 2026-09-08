---
id: 023
title: T18 List Notes Endpoint
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T18)
labels: ["notes-app", "tasks", "get-notes", "visibility"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - backend/src/api/notes.ts
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/data-model.md (referenced)
  - backend/src/middleware/auth.ts (existing reference)
  - backend/src/middleware/logging.ts (existing reference)
  - backend/src/utils/validation.ts (existing reference)
  - backend/src/utils/errors.ts (existing reference)
  - backend/src/models/note.ts (existing reference)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed)
---

## Prompt

Implement T18: Implement note list endpoint (`GET /api/notes`) with user isolation (`user_id` filter) and visibility filter (`visible=true`) in `backend/src/api/notes.ts` (depends on T012 contract framework, T009 routing, T08 auth middleware). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T18. Do not start T19.

## Response Snapshot

Implemented `listNotesHandler`: filters by `user_id` (from `req.user.id` — auth middleware `auth.ts` / FR-009 / OAuth2 / clarification Q1); filters by `visible = true` (Digest exclusion — FR-003 / SC-003 / contracts/notes-api.yaml); supports basic text search (`search` query param — `FR-005` / SC-004); returns `NoteResponse[]` with all Digest fields (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible` — `FR-007`); applies structured logging (`logging.ts` — `timestamp`/`level`/`user_id`/`note_id`/`message`/`component` — `FR-010` / Principle V); handles errors securely (`errors.ts` — `ValidationError` 400 / `NotFoundError` 404 / `InternalServerError` 500 — no internal details exposed). All checks pass. T18 marked `[x]`. Endpoint implemented. Stopped before T19.

## Outcome

- ✅ Impact: Note list endpoint complete; user isolation via OAuth2 user claim; visibility filter excludes invisible/deleted notes; basic search supported; Digest contract preserved; structured logging applied; secure error handling; endpoint responds to GET
- 🧪 Tests: TypeScript PASS (exit 0); ESLint PASS (exit 0); Vitest PASS (exit 0, 1 passed)
- 📁 Files: `backend/src/api/notes.ts` (updated: `listNotesHandler` added), `specs/001-notes-core/tasks.md` (T18 [x]), middleware/auth and logging (existing references preserved), contracts/notes-api.yaml (referenced), data-model.md (referenced)
- 🔁 Next prompts: Proceed to T19 (`[US1] Create Note entity/query logic in backend/src/services/noteService.ts`) when instructed; endpoint framework ready for service integration
- 🧠 Reflection: Endpoint aligns with contracts/notes-api.yaml (`GET /api/notes` response format); integrates auth middleware (user isolation — `FR-009`); integrates visibility filter (Digest exclusion — `FR-003`); supports basic search (`FR-005`); applies structured logging (`FR-010` / Principle V); handles errors securely (`errors.ts` — consistent API errors without exposing internals); simplicity maintained (Principle VI — basic text filter, no FTS); no unnecessary dependencies; endpoint responds correctly; framework validates independently; no contradictions

## Evaluation notes (flywheel)

- Failure modes observed: None for T18 endpoint framework; endpoint responds correctly; TypeScript strict types enforced; no errors
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T18 complete
- Prompt variant: N/A
- Next experiment: Confirm T18 complete; proceed to T19 (`[US1] Create Note entity/query logic in backend/src/services/noteService.ts`) when instructed; endpoint framework supports service/endpoints integration
