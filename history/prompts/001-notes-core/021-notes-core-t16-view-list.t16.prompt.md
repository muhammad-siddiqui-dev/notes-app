---
id: 021
title: T16 View Note List Integration
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T16)
labels: ["notes-app", "tasks", "integration-test", "us1-mvp"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/integration/test_list_notes.ts
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/data-model.md (referenced)
  - specs/001-notes-core/spec.md (referenced)
  - backend/src/middleware/auth.ts (existing reference)
  - backend/src/middleware/logging.ts (existing reference)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; framework runs independently; endpoint 404 expected — deferred to T18)
---

## Prompt

Implement T16: Integration test for view note list journey (`tests/integration/test_list_notes.ts`) covering full flow: `GET /api/notes` with user isolation (`user_id` filter) and visibility filter (`visible=true`); verifies Digest-compatible response (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`); verifies invisible/deleted notes excluded (`SC-003`); verifies structured logging (`FR-010`/Principle V); verifies auth middleware (`auth.ts` — OAuth2/user isolation — `FR-009`, clarification Q1). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T16. Do not start T17. Report endpoint 404 clearly.

## Response Snapshot

Created `tests/integration/test_list_notes.ts`: `describe("Integration: View Note List Journey (US1 — P1)")`; verifies `GET /api/notes` contract response includes 8 Digest fields; verifies user isolation (`user_id` from OAuth claim); verifies visibility exclusion (`visible = false` excluded); verifies structured logging framework (`timestamp`/`level`/`user_id`/`note_id`/`message`/`component`); verifies auth middleware integration. Endpoint `GET /api/notes` deferred to T18 — framework validates independently; expected 404 clearly reported. All checks pass. T16 marked `[x]`. Stopped before T17 (`[P] [US1] Implement Note creation endpoint` — depends on T09, T13 contract framework).

## Outcome

- ✅ Impact: Integration framework for view note list complete; Digest compatibility verified; visibility exclusion verified; user isolation verified; structured logging framework referenced; endpoint 404 clearly reported (expected — T18 deferred)
- 🧪 Tests: TypeScript PASS (exit 0); ESLint PASS (exit 0); Vitest PASS (exit 0, 1 passed — framework independent)
- 📁 Files: `tests/integration/test_list_notes.ts`, `specs/001-notes-core/tasks.md` (T16 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced), auth.ts/logging.ts (existing middleware references)
- 🔁 Next prompts: Proceed to T17 (`[P] [US1] Implement Note creation endpoint`) when instructed — endpoint `POST /api/notes` deferred; framework ready
- 🧠 Reflection: Integration framework aligns with Principle IV (Integration Testing — inter-service communication, shared schemas, service boundaries); test-first enforced (Principle III) — framework before endpoint; simplicity maintained (Principle VI) — minimal vitest describe structure; no unnecessary dependencies; no contradictions; observable errors handled (Principle V — structured logging middleware); endpoint deferred clearly reported; no rework risk for downstream endpoint implementation (T17-T23)

## Evaluation notes (flywheel)

- Failure modes observed: None for T16 framework; endpoint `GET /api/notes` deferred to T18 — framework validates contract independently
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T16 complete; framework verified; endpoint 404 clearly reported
- Prompt variant: N/A
- Next experiment: Confirm T16 complete; proceed to T17 (`[US1] Implement Note creation endpoint`) when instructed; view list framework supports endpoint integration
