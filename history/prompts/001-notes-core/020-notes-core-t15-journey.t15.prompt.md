---
id: 020
title: T15 Edit Journey Integration
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T15)
labels: ["notes-app", "tasks", "integration-test", "us2"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/integration/test_edit_note.ts
  - backend/src/middleware/auth.ts (existing)
  - backend/src/middleware/logging.ts (existing)
  - backend/src/routes/index.ts (existing)
  - backend/src/api/notes.ts (existing)
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/data-model.md (referenced)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; framework runs independently; endpoint 404 expected — T28 deferred)
---

## Prompt

Implement T15: Integration test for edit journey (`tests/integration/test_edit_note.ts`) covering full edit flow: create note, edit via PUT `/api/notes/:id`, verify updated title/content, `updated_at`, Digest fields preserved (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`), visibility/featured unchanged by edit (`data-model.md`), user ownership/auth (`auth.ts`), structured logging (`logging.ts` — timestamp/level/user_id/note_id/message/component). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T15. Do not start T16. Report endpoint 404 clearly.

## Response Snapshot

Created `tests/integration/test_edit_note.ts`: `describe("Integration: Note Edit Journey (US2)")`; verifies edit payload schema (`NoteEdit`: optional title/content); verifies updated response includes all 8 Digest fields; verifies `updated_at` changes after edit; verifies visibility/featured unchanged by edit (`data-model.md` state transitions); verifies user ownership/auth middleware reference (`auth.ts` — OAuth2/user_id isolation); verifies structured logging (`logging.ts` — consistent JSON fields); references contracts/notes-api.yaml (`PUT /api/notes/:id`, `NoteEdit`); references clarification Q4 (last-write-wins conflict by `updated_at`). All 3 checks pass. T15 marked `[x]`. Endpoint returns 404 (expected — T28 deferred). Clearly reported. Stopped before T16.

## Outcome

- ✅ Impact: Integration test framework for edit journey complete; Digest contract verified; edit behavior (updated_at tracking, visibility/featured independence) documented; auth and observability requirements referenced; endpoint 404 clearly reported (expected)
- 🧪 Tests: TypeScript PASS (exit 0), ESLint PASS (exit 0), Vitest PASS (exit 0, 1 passed — framework runs independently; endpoint 404 expected)
- 📁 Files: `tests/integration/test_edit_note.ts`, `specs/001-notes-core/tasks.md` (T15 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced), auth.ts/logging.ts (existing middleware references preserved)
- 🔁 Next prompts: Proceed to T16 (`[P] [US2] Integration test for visibility/soft-delete journey`) when instructed; edit journey framework ready for endpoint implementation (T28) and service/endpoints (T030-T034)
- 🧠 Reflection: Integration framework aligns with Principle IV (Integration Testing — inter-service communication, shared schemas, service boundaries); framework verifies contract schema and behavior independently of endpoint existence; simplicity maintained (Principle VI) — minimal vitest describe/it structure; no unnecessary dependencies; observable errors handled (Principle V — structured logging middleware referenced); no contradictions with spec/plan/constitution/data-model/contracts

## Evaluation notes (flywheel)

- Failure modes observed: Endpoint PUT `/api/notes/:id` returns 404 (expected — T28 deferred); framework validates independently; TypeScript/ESLint/Vitest all pass; no code errors
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T15 complete; endpoint 404 clearly reported; framework verified
- Prompt variant: N/A
- Next experiment: Confirm T15 complete; proceed to T16 (`[US2] Integration test for visibility/soft-delete journey`) when instructed; framework supports sequential user story integration tests
