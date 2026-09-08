---

description: "Task list for feature implementation: Notes App core note management"
---

# Tasks: Notes App Core Note Management

**Branch**: `001-notes-core` | **Feature Dir**: `specs/001-notes-core/`
**Input**: Design documents from `/specs/001-notes-core/`
**Prerequisites**: `plan.md` (required), `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Principle-Driven Task Types** (per constitution):
- Testing discipline: Every user story MUST include contract + integration test tasks (Principles III–IV).
- Observability: Every service/task MUST include structured logging setup (Principle V).
- Simplicity check: Every feature MUST include a complexity justification task if violating the 3-project/3-service default (Principle VI) — NOT APPLICABLE (single web app within scope).
- Versioning: API contract changes MUST include a version bump task (Principle VI) — deferred to future feature.

**Tests**: Tests are MANDATORY for all features per Principles III–IV.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Next.js + TypeScript + PostgreSQL web app

- [x] T001 Initialize Next.js TypeScript project with backend (`backend/src/`) and frontend (`frontend/src/`) structure per `plan.md`
- [x] T002 [P] Configure TypeScript compiler and linting rules (`tsconfig.json`, `eslint.config.js`)
- [x] T003 [P] Configure linting and formatting rules (`.prettierrc`, `.prettierignore`, `eslint.config.js` alignment)
- [x] T004 [P] Initialize PostgreSQL database connection (`.env` with `DATABASE_URL`, `backend/src/lib/db.ts`) and configure environment/logging
- [x] T005 [P] Setup Vitest test runner (`vitest.config.ts`, `tests/` directories for contract/integration/unit)
- [x] T006 [P] Configure structured logging middleware (`backend/src/middleware/logging.ts`) per FR-010 and Principle V

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] [US1] Create Note model in `backend/src/models/note.ts` (Digest-compatible fields: `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`)
- [x] T008 [P] Implement OAuth2 / SSO authentication middleware (`backend/src/middleware/auth.ts`) per FR-009 and clarification Q1
- [x] T009 [P] Setup API routing and middleware structure (`backend/src/routes/index.ts`, `backend/src/api/notes.ts` for REST endpoints)
- [x] T010 Setup database migrations framework (`backend/src/migrations/` using Knex or equivalent) per `data-model.md`
- [x] T011 [P] Configure error handling and validation framework (`backend/src/utils/validation.ts`, `backend/src/utils/errors.ts`)
- [x] T012 [P] Setup contract test framework for Digest compatibility fields (`tests/contract/test_digest_contract.ts`)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Create and View Note (Priority: P1) 🎯 MVP

**Goal**: A user creates a new note with title and content, then views it in a list. Note is visible and not featured by default.

**Independent Test**: Can be fully tested by creating a note via API (`POST /api/notes`) and confirming it appears in list (`GET /api/notes`) with correct `visible=true`, `featured=false`, full `content`, and `created_at` set.

### Tests for User Story 1 (MANDATORY — Principles III–IV)

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [x] T013 [P] [US1] Contract test for `POST /api/notes` in `tests/contract/test_create_note.ts`
- [x] T014 [P] [US2] Contract test for `PUT /api/notes/:id` in `tests/contract/test_edit_note.ts`
- [x] T015 [P] [US2] Integration test for edit journey in `tests/integration/test_edit_note.ts`
- [x] T016 [P] [US1] Integration test for view note list journey in `tests/integration/test_list_notes.ts`

### Implementation for User Story 1

- [x] T017 [P] [US1] Implement Note creation endpoint (`POST /api/notes`) in `backend/src/api/notes.ts` (depends on T012, T009)
- [x] T018 [US1] Implement note list endpoint (`GET /api/notes`) with user isolation (`user_id` filter) and visibility filter (`visible=true`) in `backend/src/api/notes.ts`
- [x] T019 [US1] Create Note entity/query logic in `backend/src/services/noteService.ts` (depends on T007, T010)
- [x] T020 [P] [US1] Implement frontend note creation form component (`frontend/src/components/NoteForm.tsx`)
- [x] T021 [P] [US2] Implement frontend note edit interface (`frontend/src/components/NoteEditForm.tsx`)
- [x] T022 [US1] Add structured logging for create and list operations (`backend/src/middleware/logging.ts` integration) per FR-010 and Principle V
- [x] T023 [US1] Add validation for title (required, non-empty) and user isolation (`user_id` from OAuth claim) in `backend/src/utils/validation.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Edit, Soft-Delete, and Visibility Control (Priority: P2)

**Goal**: User edits note title/content (`updated_at` changes), changes visibility (`visible`), or performs soft-delete (`visible=false`). Invisible notes excluded from list and digest selection.

**Independent Test**: Can be fully tested by editing a note (`PUT /api/notes/:id`), confirming `updated_at` updates; setting `visible=false`, and verifying note excluded from list/search/digest selection.

### Tests for User Story 2 (MANDATORY — Principles III–IV)

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [x] T024 [P] [US2] Contract test for visibility / soft-delete (`PATCH /api/notes/:id/visibility`) in `tests/contract/test_visibility.ts`
- [x] T025 [P] [US3] Contract test for feature toggle (`PATCH /api/notes/:id/featured`) in `tests/contract/test_feature.ts` (US3 contract — placed under US2 due to dependency on model/service framework)
- [x] T027 [P] [US2] Integration test for visibility/soft-delete journey in `tests/integration/test_visibility.ts`

### Implementation for User Story 2

- [x] T028 [P] [US2] Implement visibility endpoint (`PATCH /api/notes/:id/visibility`) in `backend/src/api/notes.ts` (depends on T019, T09)
- [x] T030 [US2] Update Note service logic (`backend/src/services/noteService.ts`) for edit and visibility updates (depends on T028)
- [x] T031 [P] [US2] Implement edit endpoint (`PUT /api/notes/:id`) in `backend/src/api/notes.ts` (depends on T019 service `updateNote`)
- [x] T032 [P] [US2] Implement visibility/soft-delete toggle in frontend (`frontend/src/components/NoteVisibilityToggle.tsx`)
- [x] T033 [US2] Add structured logging for edit and visibility operations (`backend/src/middleware/logging.ts` integration)
- [x] T034 [P] [US3] Integration test for feature/unfeature journey in `tests/integration/test_feature.ts` (US3 — completed; endpoint `PATCH /api/notes/:id/featured` implementation deferred to T039)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Feature/Unfeature and Basic Search (Priority: P3)

**Goal**: User marks note featured (`featured=true`) or unfeatures it; searches visible notes by title/content; only visible notes returned.

**Independent Test**: Can be fully tested by toggling `featured` (`PATCH /api/notes/:id/featured`), confirming flag change; performing basic search (`GET /api/notes?search=...`) and verifying only visible matching notes returned.

### Tests for User Story 3 (MANDATORY — Principles III–IV)

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [x] T035 [P] [US3] Contract test for basic search (`GET /api/notes?search=...`) in `tests/contract/test_search.ts`
- [x] T036 [P] [US3] Integration test for feature/unfeature journey (`tests/integration/test_feature.ts`) — framework/test file exists; full journey blocked by missing endpoint (`PATCH /api/notes/:id/featured` — T039)
- [x] T037 [P] [US3] Search endpoint framework verification (`GET /api/notes?search=...` in `backend/src/api/notes.ts`) — framework verified: `search` optional, visibility filter, user isolation, Digest contract preserved; full endpoint verification deferred to T040
- [x] T038 [P] [US3] Integration test for basic search journey (`tests/integration/test_search.ts`) — file created; framework verifies search filters visible notes, user isolation, Digest contract, structured logging; endpoint (T040) pending

### Implementation for User Story 3

- [x] T039 [P] [US3] Implement feature toggle endpoint (`PATCH /api/notes/:id/featured`) in `backend/src/api/notes.ts` (depends on T030)
- [x] T040 [US3] Implement basic search endpoint (`GET /api/notes?search=...`) filtering visible notes in `backend/src/api/notes.ts`
- [x] T041 [US3] Add search query logic to Note service (`backend/src/services/noteService.ts`) — basic text filter on `title` + `content` (depends on T039, T040)
- [x] T042 [P] [US3] Implement feature/unfeature UI component (`frontend/src/components/NoteFeatureToggle.tsx`)
- [x] T043 [P] [US3] Implement search UI component (`frontend/src/components/SearchBar.tsx`)
- [x] T044 [US3] Add structured logging for feature/search operations (`backend/src/middleware/logging.ts` integration)
- [x] T045 [US3] Add search validation (empty query allowed; search excludes invisible notes) in `backend/src/utils/validation.ts`

**Checkpoint**: All user stories (1, 2, 3) should now work independently and meet Digest compatibility requirements

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories; final validation; documentation; security review

- [x] T046 [P] Documentation updates (`docs/quickstart.md` validation against `specs/001-notes-core/quickstart.md`)
- [x] T047 Code cleanup and refactoring (simplify service layer if over-engineered; verify simplicity principle — no unnecessary abstractions added)
- [x] T048 Security review and hardening (`.env` secrets verified, OAuth provider settings validated, authorization checks confirmed for all endpoints, no hardcoded secrets — per Security & Data Integrity principle)
- [x] T049 [P] Contract test validation: Verify Digest compatibility fields (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`) preserved exactly in all endpoints (per FR-007, contracts/notes-api.yaml)
- [x] T050 [P] Integration test for Digest API consumption: Verify Digest can call `GET /api/notes` with `visible=true` filter and receive full content (simulates Digest `node-cron` behavior — per Q2 clarification: REST/JSON API)
- [x] T051 [P] Performance validation: Confirm basic search returns results within 2s for 500 visible notes (SC-004); note creation under 5s (SC-001)
- [x] T052 [P] Observability validation: Confirm structured logs produced for all note operations (create, edit, delete, feature, visibility, search) with fields `timestamp`, `level`, `user_id`, `note_id`, `message` (FR-010; Principle V)
- [x] T053 [P] Complexity justification review: Confirm no unnecessary abstractions; basic search (not FTS) sufficient; REST API simplest for Digest integration; OAuth2 simpler than local auth for multi-user portfolio (per Principle VI and clarification Q5: 500-note scale)
- [x] T054 [P] Data model validation: Confirm Note entity fields match Digest contract; `visible` exclusion enforced at query level (not just UI); full `content` preserved; `updated_at` updated on edit; conflict resolution (last-write-wins) implemented or documented
- [x] T055 [P] User scenario independent test verification: Confirm User Story 1 (P1) works independently (MVP); User Story 2 (P2) independent; User Story 3 (P3) independent

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational (Phase 2)
  - User stories proceed in priority order (P1 → P2 → P3) or in parallel (if staffed)
- **Polish (Phase 6)**: Depends on all user stories complete; includes cross-cutting validation (Digest compatibility, performance, observability, security)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories; delivers MVP
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — may use Note model/service from US1; independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — depends on Note model/service; independently testable once model/service available

### Within Each User Story

- Tests (MANDATORY) MUST be written and FAIL before implementation (Principle III)
- Contract tests before endpoint implementation (Principle IV)
- Integration tests before feature demonstration
- Models before services
- Services before endpoints/UI
- Logging setup included for each user story (Principle V)
- Story complete before moving to next priority (P1 → P2 → P3)

### Parallel Opportunities

- Setup tasks (T001–T006) marked [P] can run in parallel (different files, independent)
- Foundational tasks (T007–T012) marked [P] can run in parallel (models, auth middleware, API routing, migrations, validation framework, contract tests — as long as model exists before service integration)
- Once Foundational completes:
  - All user story phases can start in parallel (if staffed)
  - Each user story's tests (contract + integration) can run in parallel ([P] markers)
  - Each user story's models can run in parallel with services/endpoints within that story
- Polish phase tasks (security review, documentation, performance validation) can run in parallel ([P] markers) once all user stories complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational (T007–T012)
3. Complete Phase 3: User Story 1 (T013–T023)
4. **STOP and VALIDATE**: Confirm independent test for User Story 1 passes; verify Digest contract fields preserved; confirm structured logging works; check simplicity (no unnecessary abstraction)
5. Deploy/demo if ready (minimal viable notes app: create + view + basic search not yet included — basic search comes in US3)

### Incremental Delivery

1. Setup + Foundational → Foundation ready (T001–T012)
2. Add User Story 1 (Create/View) → Independent test passes → Deploy/Demo (MVP)
3. Add User Story 2 (Edit/Soft-Delete/Visibility) → Independent test passes → Digest exclusion verified
4. Add User Story 3 (Feature/Search) → Independent test passes → Digest ranking verified; full content preserved; basic search working
5. Polish Phase → Performance validated (<5s create, <2s search for 500 notes); security review complete; documentation updated; contract tests pass for Digest integration

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work within same story phase
- [Story] labels ([US1], [US2], [US3]) map to user stories from `spec.md` for traceability
- Each user story independently testable (independent tests defined in spec.md and checklist)
- Tests MANDATORY (Principles III–IV); must fail before implementation
- Structured logging included for every user story phase (Principle V)
- Complexity justification included (Phase 6, T053) — basic search (not FTS), REST API (not shared DB), OAuth2 (not custom auth) — all simpler alternatives considered and rejected
- Commit after each task or logical group; stop at any checkpoint to validate independently
- Path conventions: `backend/src/` (models, services, api), `frontend/src/` (components, pages, services), `tests/` (contract, integration, unit)
---

*Task list completed. All tasks follow strict checklist format (`- [ ] T### [P?] [US?] Description with file path`). Tests mandatory (Principles III–IV). Observability included (Principle V). Complexity justified (Principle VI). Ready for `/sp.implement` with concrete tech stack: Next.js + TypeScript + PostgreSQL.*
