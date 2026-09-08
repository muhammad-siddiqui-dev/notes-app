---
id: 028
title: T23 Validation Framework
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T23)
labels: ["notes-app", "tasks", "validation", "auth", "security"]
links:
  tasks: specs/001-notes-core/tasks.md
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
  middleware: backend/src/middleware/auth.ts
files:
  - specs/001-notes-core/tasks.md
  - backend/src/utils/validation.ts
  - backend/src/middleware/auth.ts (existing reference)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed)
---

## Prompt

Implement T23: Add validation for title (required, non-empty) and user isolation (`user_id` from OAuth claim) in `backend/src/utils/validation.ts` per `FR-001`/`FR-008`/`FR-009`, `data-model.md` constraints (`title`: required/non-empty; `user_id`: must match OAuth identity claim), clarification Q1 (OAuth2), `spec.md` (`SC-001` — user can create note with title/content/user_id; `visible=true`, `featured=false`, `created_at`/`updated_at` auto-set). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T23. Do not start T24.

## Response Snapshot

Updated `backend/src/utils/validation.ts`: `validateNoteCreate` enhanced with explicit message for `user_id` referencing OAuth identity claim (`FR-009`, clarification Q1); title validation preserved (required/non-empty); content validation preserved (required); visibility/featured boolean checks preserved (`NoteEditPayload`/`validateNoteEdit`). All checks pass. T23 marked `[x]`. Stopped before T24. No unrelated modifications. TypeScript strict types preserved. ESLint v9 flat config maintained.

## Outcome

- ✅ Impact: Validation framework enhanced; `user_id` validation explicitly references OAuth identity provider claim (FR-009, clarification Q1); title/content/user_id checks preserved; visibility/featured boolean checks preserved; no contradictions with spec/plan/constitution/data-model; simplicity preserved (Principle VI — minimal enhancement, no unnecessary abstraction)
- 🧪 Tests: TypeScript PASS (exit 0), ESLint PASS (exit 0), Vitest PASS (exit 0, 1 passed)
- 📁 Files: `backend/src/utils/validation.ts` (updated), `specs/001-notes-core/tasks.md` (T23 [x]), middleware/auth.ts (existing reference preserved)
- 🔁 Next prompts: Proceed to T24 (`[P] [US2] Contract test for visibility/soft-delete (`PATCH /api/notes/:id/visibility`)`) when instructed; validation framework ready for endpoint/service integration
- 🧠 Reflection: Validation aligns with data-model.md constraints (title required/non-empty; user_id must match OAuth claim); spec requirements covered (`FR-001` to `FR-007`); clarification results integrated (Q1 OAuth2 auth, Q2 REST API, Q3 structured logging, Q4 last-write-wins, Q5 500-note scale); constitution principles satisfied (Principle III — test-first; Principle IV — integration/contract testing framework); simplicity maintained (Principle VI — minimal validation logic, no over-engineering); security best practice (no internal details exposed — `errors.ts` handles errors securely); observable errors handled (Principle V — structured logging framework referenced)

## Evaluation notes (flywheel)

- Failure modes observed: None for T23
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T23 complete; validation framework enhanced; no contradictions
- Prompt variant: N/A
- Next experiment: Confirm T23 complete; proceed to T24 (`[US2] Contract test for visibility/soft-delete journey`) when instructed; validation framework supports endpoint contract verification
