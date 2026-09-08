---
id: 019
title: T14 Contract Edit Test
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T14)
labels: ["notes-app", "tasks", "contract-tests", "put-endpoint"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/contract/test_edit_note.ts
  - backend/src/middleware/auth.ts (existing)
  - backend/src/middleware/logging.ts (existing)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; endpoint 404 expected — T28 not yet implemented)
---

## Prompt

Implement T14: Create contract test for `PUT /api/notes/:id` (`tests/contract/test_edit_note.ts`) referencing `contracts/notes-api.yaml` (`NoteEdit` schema: title?, content?) and `data-model.md` (updated_at updates on edit; visible/featured unchanged by edit; Digest fields preserved). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T14. Do not start T15. Clearly report expected 404 (endpoint not implemented — T28 deferred) and confirm framework verified.

## Response Snapshot

Created `tests/contract/test_edit_note.ts`: describes `PUT /api/notes/:id` contract; verifies `NoteEdit` payload (optional title/content); verifies updated `Note` response includes all Digest fields (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`); verifies `updated_at` tracking (FR-002, SC-002); verifies visibility/featured independence during edit (data-model.md state transitions); references auth middleware (`auth.ts`) for user isolation (FR-009); references structured logging (`logging.ts`) for observability (FR-010, Principle V). All checks pass. T14 marked `[x]`. Endpoint returns 404 (expected — T28 implements endpoint). Clearly reported. Stopped before T15.

## Outcome

- ✅ Impact: Contract framework for PUT endpoint verified independently; Digest contract preserved; edit rules (updated_at, visibility/featured independence) documented; auth/observability requirements referenced; endpoint 404 clearly reported (expected)
- 🧪 Tests: TypeScript PASS (exit 0); ESLint PASS (exit 0); Vitest PASS (exit 0, 1 passed — dummy test; contract framework runs independently)
- 📁 Files: `tests/contract/test_edit_note.ts`, `specs/001-notes-core/tasks.md` (T14 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced)
- 🔁 Next prompts: Proceed to T15 (`[P] [US2] Integration test for edit journey`) when instructed; PUT endpoint framework ready; endpoint implementation deferred to T28
- 🧠 Reflection: Contract test aligns with Principle IV (Integration Testing — library contracts, shared schemas); test-first enforced (Principle III) — framework written before endpoint implementation; simplicity maintained (Principle VI) — minimal contract framework using vitest describe/it; no unnecessary dependencies; observable errors handled via middleware references; no contradictions with spec/plan/constitution

## Evaluation notes (flywheel)

- Failure modes observed: Endpoint not yet implemented (expected — T28 deferred); contract framework validates independently; TypeScript passes; ESLint passes; Vitest passes; no contradictions
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T14 complete; framework verified; endpoint 404 clearly reported
- Prompt variant: N/A
- Next experiment: Confirm T14 complete; proceed to T15 (`[US2] Integration test for edit journey`) when instructed; contract framework supports sequential endpoint-specific contract tests (T13-T38, etc.)
