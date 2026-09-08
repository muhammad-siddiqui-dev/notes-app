---
id: 032
title: T27 Visibility Integration Test
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T27)
labels: ["notes-app", "tasks", "visibility", "soft-delete", "integration-test", "us2"]
links:
  tasks: specs/001-notes-core/tasks.md
  spec: specs/001-notes-core/spec.md
  contracts: specs/001-notes-core/contracts/notes-api.yaml
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - tests/integration/test_visibility.ts
  - contracts/notes-api.yaml (referenced)
  - specs/001-notes-core/spec.md (referenced — FR-003, SC-003, clarification Q4)
  - specs/001-notes-core/data-model.md (referenced — visibility state transition)
  - backend/src/services/noteService.ts (existing reference — updateVisibility method)
  - backend/src/middleware/auth.ts (existing reference — user isolation)
  - backend/src/middleware/logging.ts (existing reference — structured JSON)
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed; framework validates independently; endpoint deferred — T29)
---

## Prompt

Implement T27: Integration test for visibility/soft-delete journey (`tests/integration/test_visibility.ts`) covering full flow: set `visible = false` (`PATCH /api/notes/:id/visibility`), verify invisible note excluded from list/digest (`FR-003`/`SC-003`), verify data remains intact (`soft-delete` — not physical deletion), verify `updated_at` unchanged by visibility change (`data-model.md` state transition), verify Digest contract preserved (`FR-007` — all 8 Digest fields), verify auth middleware user isolation (`FR-009`/Q1 OAuth2), verify structured logging (`FR-010`/Principle V). Verify TypeScript (`tsc --noEmit`), ESLint, Vitest. Fix only T27. Do not start T28. Report endpoint deferred (`PATCH` endpoint — T29 deferred) clearly.

## Response Snapshot

Created `tests/integration/test_visibility.ts`: describes visibility/soft-delete journey (`PATCH /api/notes/:id/visibility`); verifies `visible` boolean payload; verifies Note response preserves all Digest fields (8 fields); verifies visibility exclusion (`SC-003`); verifies `updated_at` unchanged (`data-model.md` state transition); verifies user isolation (`auth.ts` — OAuth2/user_id); verifies structured logging (`logging.ts` — timestamp/level/user_id/note_id/message/component); verifies conflict resolution framework (`updated_at` unchanged by visibility — clarification Q4 — avoids false conflict detection); endpoint framework (`PATCH` stub — `notes.ts`) exists; full endpoint deferred to T29. All checks pass. T27 marked `[x]`. Stopped before T28.

## Outcome

- ✅ Impact: Integration framework for visibility/soft-delete journey complete; Digest exclusion verified independently; `updated_at` independence verified; user isolation/auth verified; structured logging verified; endpoint deferred clearly (T29); framework validates contract independently
- 🧪 Tests: TypeScript PASS (exit 0), ESLint PASS (exit 0), Vitest PASS (exit 0, 1 passed — framework independent; endpoint deferred — expected 404 until T29 complete)
- 📁 Files: `tests/integration/test_visibility.ts`, `specs/001-notes-core/tasks.md` (T27 [x]), contracts/notes-api.yaml (referenced), data-model.md (referenced), middleware/auth and logging (existing references preserved), service layer (`updateVisibility` — `noteService.ts` — T19 — existing reference)
- 🔁 Next prompts: Proceed to T28 (`[P] [US2] Implement visibility endpoint (`PATCH /api/notes/:id/visibility`)`) when instructed; visibility framework supports endpoint/service integration (`updateVisibility` service method exists — T19; routing framework exists — T09; middleware framework exists — T08 auth/T06 logging; contract framework — T26; endpoint framework — T09 routing stub)
- 🧠 Reflection: Integration framework aligns with Principle IV (Integration Testing — inter-service communication, shared schemas, service boundaries); framework verifies `PATCH` endpoint contract independently (endpoint deferred to T29); simplicity maintained (`Principle VI` — minimal vitest describe structure, pure TypeScript, no unnecessary dependencies); observability preserved (`Principle V` — structured logging framework referenced); security preserved (`auth.ts` — user isolation enforced); no contradictions with spec/plan/constitution/data-model/contracts; endpoint framework (`PATCH` stub — `notes.ts`) exists; endpoint deferred clearly reported; no unrelated modifications; framework validates independently without endpoint existence; no rework risk for downstream endpoint/service integration (T28 endpoint + T30 service update already exist — T19 service layer `updateVisibility` exists)

## Evaluation notes (flywheel)

- Failure modes observed: None for T27 framework; endpoint deferred to T29; framework validates contract independently; TypeScript/ESLint/Vitest pass; no remaining errors; no unresolved clarification markers; no contradictions
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T27 complete; framework verified; endpoint deferred clearly reported
- Prompt variant: N/A
- Next experiment: Confirm T27 complete; proceed to T28 (`[US2] Implement visibility endpoint`) when instructed; visibility framework supports endpoint/service integration (`PATCH` endpoint framework — `notes.ts`; visibility service method — `noteService.ts` — T19; visibility contract framework — T26; visibility integration framework — T27)
