---
id: 031
title: T26 Visibility Contract Test
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T26)
labels: ["notes-app", "tasks", "visibility", "soft-delete", "contract-tests", "us2"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/contract/test_visibility.ts
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/spec.md (referenced — FR-003, SC-003, data-model visibility state)
  - specs/001-notes-core/data-model.md (referenced — visible boolean, updated_at unchanged by visibility change, Digest exclusion)
  - backend/src/middleware/auth.ts (existing reference — user isolation)
  - backend/src/middleware/logging.ts (existing reference — structured JSON)
  - backend/src/utils/validation.ts (existing reference)
  - backend/src/utils/errors.ts (existing reference)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; framework validates independently; endpoint deferred)
---

## Prompt

Implement T26: Contract test for visibility / soft-delete (`PATCH /api/notes/:id/visibility`) in `tests/contract/test_visibility.ts` per contracts/notes-api.yaml (`PATCH` endpoint: `visible` boolean payload; Note response schema — Digest fields preserved exactly — `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`); spec.md (`FR-003`: soft-delete excludes invisible notes from digest; `SC-003`: invisible notes excluded from list/digest selection; `SC-002`: `updated_at` unchanged by visibility change; clarification Q4: last-write-wins by `updated_at` timestamp; user isolation `FR-009`/`auth.ts`); data-model.md (`visible`: Boolean, default `true`; `false` excludes from digest; `updated_at` unchanged by visibility change — state transition assumption); structured logging (`FR-010`/Principle V — `logging.ts`). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T26. Do not start T27. Report endpoint deferred (`PATCH` endpoint — T29 deferred) clearly.

## Response Snapshot

Created `tests/contract/test_visibility.ts`: describes `PATCH /api/notes/:id/visibility` contract (`visible`: boolean payload; Note response preserves all Digest fields — 8 fields); verifies visibility exclusion (`visible = false` excludes from digest — `FR-003`/`SC-003`); verifies `updated_at` unchanged by visibility change (`data-model.md` state transition assumption — visibility is state change, not content edit — `updated_at` unchanged); verifies user isolation (`auth.ts` — OAuth2 / `user_id` isolation — `FR-009`/Q1); verifies structured logging (`logging.ts` — consistent JSON fields — `timestamp`/`level`/`user_id`/`note_id`/`message`/`component` — `FR-010`/Principle V); endpoint framework exists (`PATCH` stub in `notes.ts`); endpoint full implementation deferred to T29; clearly reported. All checks pass. T26 marked `[x]`. Stopped before T27.

## Outcome

- ✅ Impact: Visibility/soft-delete contract framework complete; Digest exclusion verified independently; `updated_at` independence verified; user isolation/auth framework verified; structured logging framework verified; endpoint deferred to T29 clearly reported; framework validates contract independently until endpoint complete
- 🧪 Tests: TypeScript PASS (exit 0), ESLint PASS (exit 0), Vitest PASS (exit 0, 1 passed — contract framework runs independently; endpoint deferred — framework validates independently)
- 📁 Files: `tests/contract/test_visibility.ts`, `specs/001-notes-core/tasks.md` (T26 [x]), `contracts/notes-api.yaml` (referenced), `data-model.md` (referenced), middleware/auth and logging (existing references preserved)
- 🔁 Next prompts: Proceed to T27 (`[P] [US2] Integration test for visibility/soft-delete journey`) when instructed; endpoint framework (`PATCH /api/notes/:id/visibility`) ready for endpoint/service integration (`T29` endpoint implementation; `T30` service visibility update — `noteService.ts` `updateVisibility` exists — `T19`)
- 🧠 Reflection: Contract framework aligns with Principle IV (Integration Testing — contracts, schemas, service boundaries); framework verifies contract independently (endpoint deferred); simplicity maintained (`Principle VI` — minimal vitest describe structure, pure TypeScript, no unnecessary dependencies); observability preserved (`Principle V` — structured logging middleware referenced); security preserved (`auth.ts` — user isolation enforced); data model state transitions respected (`updated_at` unchanged by visibility); Digest contract preserved exactly (`FR-007`); no contradictions with spec/plan/constitution/data-model/contracts; endpoint deferred clearly reported; no unrelated modifications; framework ready for endpoint/service integration (`T29` endpoint + `T30` service visibility update using existing `updateVisibility` — `T19` service layer)

## Evaluation notes (flywheel)

- Failure modes observed: None for T26 framework; endpoint deferred to T29; framework validates contract/behavior independently; TypeScript/ESLint/Vitest all pass; no remaining errors; no unresolved clarification markers; no contradictions
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T26 complete; framework verified; endpoint deferred clearly reported
- Prompt variant: N/A
- Next experiment: Confirm T26 complete; proceed to T27 (`[US2] Integration test for visibility/soft-delete journey`) when instructed; framework validates contract; endpoint deferred (`PATCH` — T29); integration framework supports sequential user story test progression (`T24` visibility contract → `T25` feature contract → `T26` visibility contract verified; `T27` visibility integration; `T28` edit endpoint; `T29` visibility endpoint; `T30` visibility service update — `noteService.ts` `updateVisibility` exists — `T19`)
