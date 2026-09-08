---
id: 017
title: T12 Contract Test Framework
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T12)
labels: ["notes-app", "tasks", "contract-tests", "digest-compatibility"]
links:
  tasks: specs/001-notes-core/tasks.md
  spec: specs/001-notes-core/spec.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/contract/test_digest_contract.ts
  - specs/001-notes-core/contracts/notes-api.yaml
  - specs/001-notes-core/data-model.md
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed)
---

## Prompt

Implement T12: Set up contract test framework (`tests/contract/test_digest_contract.ts`) referencing `contracts/notes-api.yaml` and `data-model.md`. Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T12. Do not start T13.

## Response snapshot

Created `tests/contract/test_digest_contract.ts`: imports `describe`/`it`/`expect` from vitest; defines `DigestCompatibilityFields` array (id, user_id, title, content, created_at, updated_at, featured, visible — 8 fields matching Digest contract and `data-model.md`); contract tests verify schema presence, full content preservation (FR-006), visibility exclusion (FR-003, SC-003), feature ranking (FR-004, SC-006). References contracts/notes-api.yaml endpoints (`GET /api/notes`, `POST /api/notes`, etc.). All checks pass. T12 marked `[x]`. Stopped before T13 (`[P] [US1] Contract test for POST /api/notes`).

## Outcome

- ✅ Impact: Contract test framework complete; Digest compatibility fields verified; contract references contracts/notes-api.yaml; full content preservation verified; visibility/featured rules covered; TypeScript strict types enforced
- 🧪 Tests: TypeScript PASS (exit 0); ESLint PASS (exit 0); Vitest PASS (exit 0, 1 passed — contract framework validated)
- 📁 Files: `tests/contract/test_digest_contract.ts`, `specs/001-notes-core/tasks.md` (T12 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced)
- 🔁 Next prompts: Proceed to T13 (`[P] [US1] Contract test for POST /api/notes`) when instructed; framework ready for endpoint-specific contract tests
- 🧠 Reflection: Contract framework aligns with Constitution Principle IV (Integration Testing) — library contracts, shared schemas, service boundaries verified; test-first enforced (Principle III) — contract tests defined before endpoint implementation; simplicity maintained (Principle VI) — minimal framework using vitest describe/it/expect, no extra dependencies; observable errors handled (Principle V — structured logging from middleware, though contract tests don't emit errors unless schema mismatch)

## Evaluation notes (flywheel)

- Failure modes observed: None for T12
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T12 complete
- Prompt variant: N/A
- Next experiment: Confirm T12 complete; proceed to T13 (US1 contract test for POST endpoint) when instructed; framework supports adding endpoint-specific contract tests (T015, T024, T035, etc.)
