---
id: 016
title: T11 Validation Framework
stage: tasks
date: 2026-09-04
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.implement (T11)
labels: ["notes-app", "tasks", "validation", "errors", "security"]
links:
  tasks: specs/001-notes-core/tasks.md
  spec: specs/001-notes-core/spec.md
  data-model: specs/001-notes-core/data-model.md
files:
  - specs/001-notes-core/tasks.md
  - backend/src/utils/validation.ts
  - backend/src/utils/errors.ts
tests:
  - TypeScript (PASS)
  - ESLint (PASS)
  - Vitest (PASS — 1 passed)
---

## Prompt

Implement T11: Configure error handling and validation framework (`backend/src/utils/validation.ts`, `backend/src/utils/errors.ts`) per `spec.md` FR requirements, `data-model.md` validation rules, constitution Principles III-VI (simplicity, observability, test-first). Verify TypeScript, ESLint, Vitest. Fix only T11. Do not start T12.

## Response snapshot

Created `backend/src/utils/validation.ts`: `NoteCreatePayload` (title?, content?, user_id?, visible?, featured?), `NoteEditPayload` (title?, content?, visible?, featured?), `validateNoteCreate` (checks non-empty title/content/user_id), `validateNoteEdit` (checks title non-empty if present, visible/featured boolean). Created `backend/src/utils/errors.ts`: `AppError` (statusCode, isOperational), `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403), `NotFoundError` (404), `InternalServerError` (500, false operational); `handleError` logs structured JSON (timestamp/level/message/context/isOperational) without exposing internals to clients. All checks pass. T11 marked `[x]`. Stopped before T12.

## Outcome

- ✅ Impact: Validation and error framework complete; consistent API errors; no implementation details leaked; structured logging integrated (Principle V); simplicity maintained (Principle VI — minimal error class hierarchy)
- 🧪 Tests: TypeScript PASS, ESLint PASS, Vitest PASS
- 📁 Files: `backend/src/utils/validation.ts`, `backend/src/utils/errors.ts`, `specs/001-notes-core/tasks.md` (T11 [x])
- 🔁 Next prompts: Proceed to T12 (`[P] Setup contract test framework for Digest compatibility fields`) when instructed; validation/errors framework ready for endpoint/service integration
- 🧠 Reflection: Validation rules align exactly with `data-model.md` constraints and `spec.md` FR-001 through FR-007; error classes cover common HTTP status codes (400/401/403/404/500); `handleError` ensures structured error logging (Principle V) without leaking internal details (security best practice); no unnecessary complexity added

## Evaluation notes (flywheel)

- Failure modes observed: None for T11
- Graders run and results (PASS/FAIL): PASS — TypeScript 0, ESLint 0, Vitest 0; T11 complete
- Prompt variant: N/A
- Next experiment: Confirm T11 complete; proceed to T12 (contract test framework) when instructed; validation framework ready for endpoint integration (T013-T028)
