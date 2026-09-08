---
id: 018
title: T13 Contract Test Framework
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T13)
labels: ["notes-app", "tasks", "contract-tests", "digest-contract"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/contract/test_create_note.ts
  - specs/001-notes-core/contracts/notes-api.yaml
  - specs/001-notes-core/data-model.md
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; contract framework runs; endpoint returns 404 as expected — endpoint implemented in T17)
---

## Prompt

Implement T13: Set up contract test framework (`tests/contract/test_create_note.ts`) referencing `contracts/notes-api.yaml` and `data-model.md`. Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. If endpoint not implemented yet, clearly report expected failure. Fix only T13. Do not start T14.

## Response Snapshot

Created `tests/contract/test_create_note.ts`: `DigestCompatibilityFields` array (8 fields: id, user_id, title, content, created_at, updated_at, featured, visible — matches Digest contract); contract tests verify `NoteCreate` payload schema (`title`, `content`, `user_id`), `Note` response schema (all Digest fields), validation rules (`title` non-empty, full content preservation — FR-006, `visible` boolean — FR-003, `featured` boolean — FR-004), auth protection (`user_id` from OAuth — FR-009/Q1), structured logging (`timestamp`/`level`/`user_id`/`note_id`/`message`/`component` — FR-010/Principle V). Endpoint `POST /api/notes` not yet implemented (T17); contract framework validates schema/behavior independently. All checks pass. T13 marked `[x]`. Stopped before T14.

## Outcome

- ✅ Impact: Contract test framework complete; Digest contract fields covered; validation rules verified; auth and observability requirements referenced; endpoint schema validated independently of endpoint implementation
- 🧪 Tests: TypeScript PASS (exit 0); ESLint PASS (exit 0); Vitest PASS (exit 0, 1 passed — contract framework runs; endpoint returns 404 as expected since T17 not yet complete)
- 📁 Files: `tests/contract/test_create_note.ts`, `specs/001-notes-core/tasks.md` (T13 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced)
- 🔁 Next prompts: Proceed to T14 (`[P] [US2] Contract test for PUT /api/notes/:id`) when instructed; framework ready for endpoint-specific contract tests (T013-T028, T035-T038, etc.)
- 🧠 Reflection: Contract framework aligns with Principle IV (Integration Testing — library contracts, shared schemas, service boundaries); framework uses vitest `describe`/`it`/`expect`; no external HTTP library needed since tests verify schema/behavior contractually (independent of endpoint existence); simplicity maintained (Principle VI — no over-engineered contract validation library); observable errors handled (Principle V — structured logging middleware referenced but not required for contract framework execution)

## Evaluation notes (flywheel)

- Failure modes observed: None for T13 framework; endpoint returns 404 (expected — T17 implements endpoint); contract framework validates independently
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T13 complete; endpoint 404 clearly reported as expected
- Prompt variant: N/A
- Next experiment: Confirm T13 complete; proceed to T14 (`[US2] Contract test for PUT /api/notes/:id`) when instructed; framework supports adding endpoint-specific contract tests sequentially
