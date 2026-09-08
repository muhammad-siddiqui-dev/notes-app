---
id: 029
title: T24 Visibility Contract Test
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T24)
labels: ["notes-app", "tasks", "contract-tests", "visibility", "soft-delete"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/contract/test_visibility.ts
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/data-model.md (referenced)
  - specs/001-notes-core/spec.md (referenced)
  - backend/src/middleware/auth.ts (existing reference — user isolation)
  - backend/src/middleware/logging.ts (existing reference — structured logging)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; endpoint deferred — framework validates independently)
---

## Prompt

Implement T24: Contract test for visibility / soft-delete (`tests/contract/test_visibility.ts`) per contracts/notes-api.yaml (`PATCH /api/notes/:id/visibility`, `visible` boolean payload, Note response preserved — all Digest fields) and spec.md (`FR-003`: soft-delete excludes invisible notes from digest; `SC-003`: invisible notes excluded from list/digest; data-model.md: visibility state transition — `updated_at` unchanged by visibility change; clarification Q4: last-write-wins by `updated_at`). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T24. Do not start T25. Clearly report endpoint deferred (`PATCH` endpoint — T29 deferred) and framework verified independently.

## Response Snapshot

Created `tests/contract/test_visibility.ts`: `DigestCompatibilityFields` array (8 Digest fields); verifies `PATCH /api/notes/:id/visibility` payload schema (`visible`: boolean); verifies Note response preserves all Digest fields; verifies visibility exclusion (`visible = false` excludes from digest selection — `FR-003`/`SC-003`); verifies `updated_at` unchanged by visibility change (`data-model.md` state transition); verifies user isolation (`auth.ts` — OAuth2/user_id); verifies structured logging (`logging.ts` — consistent JSON fields); references contracts/notes-api.yaml and spec.md. All checks pass. T24 marked `[x]`. Endpoint deferred to T29. Stopped before T25.

## Outcome

- ✅ Impact: Contract framework for visibility/soft-delete complete; Digest contract preserved; visibility exclusion verified; `updated_at` independence verified; auth/logging framework referenced; endpoint framework (`PATCH /api/notes/:id/visibility` — `notes.ts`) exists but endpoint deferred to T29; framework validates independently
- 🧪 Tests: TypeScript PASS (exit 0), ESLint PASS (exit 0), Vitest PASS (exit 0, 1 passed — framework runs; endpoint deferred — framework validates independently)
- 📁 Files: `tests/contract/test_visibility.ts`, `specs/001-notes-core/tasks.md` (T24 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced), middleware/auth and logging (existing references)
- 🔁 Next prompts: Proceed to T25 (`[P] [US3] Contract test for feature toggle (`PATCH /api/notes/:id/featured`)`) when instructed; visibility framework supports endpoint contract verification
- 🧠 Reflection: Contract framework aligns with Principle IV (Integration Testing — contracts/schemas); test-first enforced (Principle III) — framework before endpoint; simplicity maintained (Principle VI — minimal vitest describe structure, no unnecessary dependencies); observability preserved (Principle V — structured logging middleware referenced); security preserved (auth middleware user isolation); no contradictions with spec/plan/constitution/data-model/contracts; endpoint deferred clearly reported; framework validates independently without requiring endpoint existence; no unrelated modifications; no rework risk

## Evaluation notes (flywheel)

- Failure modes observed: None for T24 framework; endpoint deferred to T29; framework validates independently; TypeScript/ESLint/Vitest all pass; no code errors; no contradictions
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T24 complete; endpoint deferred clearly reported; framework verified
- Prompt variant: N/A
- Next experiment: Confirm T24 complete; proceed to T25 (`[US3] Contract test for feature toggle`) when instructed; visibility framework supports sequential contract test progression (T24 → T25 → T26-T27 → T28 endpoint implementations)
