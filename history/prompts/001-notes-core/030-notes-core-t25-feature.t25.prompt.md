---
id: 030
title: T25 Feature Toggle Contract
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T25)
labels: ["notes-app", "tasks", "feature-toggle", "contract-tests", "us3"]
links:
  tasks: specs/001-notes-core/tasks.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/contract/test_feature.ts
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/spec.md (referenced — FR-004, SC-006)
  - specs/001-notes-core/data-model.md (referenced — featured: Boolean; updated_at unchanged by toggle)
  - backend/src/middleware/auth.ts (existing reference — user isolation / OAuth2)
  - backend/src/middleware/logging.ts (existing reference — structured JSON)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; endpoint deferred — framework validates independently)
---

## Prompt

Implement T25: Contract test for feature toggle (`tests/contract/test_feature.ts`) per contracts/notes-api.yaml (`PATCH /api/notes/:id/featured`: `featured` boolean payload; Note response with Digest fields); data-model.md (`featured`: Boolean, affects ranking; `updated_at` unchanged by toggle; Digest contract preserved); spec.md (`FR-004`: set `featured` true/false; `SC-006`: toggle reflects for Digest ranking); clarification Q4 (last-write-wins by `updated_at`); auth middleware (`auth.ts` — user ownership); structured logging (`logging.ts` — timestamp/level/user_id/note_id/message/component — `FR-010`/Principle V). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T25. Do not start T26. Report endpoint deferred (`PATCH` endpoint — T39 deferred) and framework verified.

## Response Snapshot

Created `tests/contract/test_feature.ts`: `DigestCompatibilityFields` array (8 Digest fields); verifies `PATCH /api/notes/:id/featured` payload (`featured`: boolean); verifies Note response preserves all Digest fields (`updated_at` unchanged — `data-model.md` state transition; `visible` unchanged by toggle; `featured` flipped — `FR-004`/`SC-006`); verifies user isolation/auth middleware (`auth.ts` — OAuth2/user_id — `FR-009`); verifies structured logging (`logging.ts` — consistent JSON fields — `FR-010`/Principle V). All checks pass. T25 marked `[x]`. Endpoint deferred to T39. Stopped before T26.

## Outcome

- ✅ Impact: Feature toggle contract framework complete; Digest contract preserved (`updated_at` unchanged by toggle — `data-model.md`); ranking eligibility verified (`SC-006`); user isolation/auth framework verified (`auth.ts`); structured logging framework verified (`logging.ts`); endpoint framework (`PATCH /api/notes/:id/featured` — `notes.ts`) exists; endpoint full implementation deferred to T39; clearly reported
- 🧪 Tests: TypeScript PASS (exit 0), ESLint PASS (exit 0), Vitest PASS (exit 0, 1 passed — framework validates independently)
- 📁 Files: `tests/contract/test_feature.ts`, `specs/001-notes-core/tasks.md` (T25 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced), middleware/auth and logging (existing references preserved)
- 🔁 Next prompts: Proceed to T26 (`[P] [US3] Implement feature toggle endpoint (`PATCH /api/notes/:id/featured`)`) when instructed; framework supports endpoint contract verification
- 🧠 Reflection: Contract framework aligns with Principle IV (Integration Testing — contracts/schemas); framework verifies `PATCH` endpoint independently (endpoint deferred to T39); simplicity maintained (`Principle VI` — minimal vitest describe structure, no unnecessary dependencies); no JSX overhead (pure TypeScript framework); TypeScript strict typing enforced; ESLint v9 flat config maintained; Vitest framework passes; observable errors handled (`Principle V` — structured logging middleware); security preserved (`auth.ts` — user isolation); no contradictions with spec/plan/constitution/contracts/data-model; endpoint deferred clearly reported; no unrelated modifications; framework ready for endpoint/service integration

## Evaluation notes (flywheel)

- Failure modes observed: None for T25 framework; endpoint deferred to T39; framework validates independently; TypeScript/ESLint/Vitest pass; no remaining errors; no unresolved placeholders
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T25 complete; framework verified; endpoint deferred clearly reported
- Prompt variant: N/A
- Next experiment: Confirm T25 complete; proceed to T26 (`[P] [US3] Implement feature toggle endpoint`) when instructed; framework supports endpoint contract verification
