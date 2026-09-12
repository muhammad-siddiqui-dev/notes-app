# Feature Specification: Notes App Core Note Management

**Feature Branch**: `001-notes-core`  
**Created**: 2026-09-03  
**Status**: Draft | **Constitution Compliance**: Must include independent tests per user story (Principles III–IV); MUST include structured logging for security/auth events (Principle V); complexity MUST be justified (Principle VI)  
**Input**: User description: "Notes App core note management with create, edit, soft-delete, feature/unfeature, visibility control, and basic search; must support Digest compatibility fields (id, user_id, title, content, created_at, updated_at, featured, visible)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and View Note (Priority: P1) 🎯 MVP

A user creates a new note with a title and full content, then views it in a list. The note is visible and not featured by default.

**Why this priority**: Without note creation and viewing, no other feature delivers value. This is the foundational user journey.

**Independent Test**: Can be fully tested by creating a note via the interface and confirming it appears in the note list with correct title, content, and visibility status.

**Acceptance Scenarios**:

1. **Given** a user is on the notes view, **When** they enter a title and content and submit, **Then** a new note appears in the list with `visible = true`, `featured = false`, and `created_at` set.
2. **Given** a note exists, **When** the user opens it, **Then** the full `content` is displayed (not truncated) and `updated_at` reflects creation time.

---

### User Story 2 - Edit, Soft-Delete, and Visibility Control (Priority: P2)

A user edits an existing note's title or content, changes its visibility, or performs a soft-delete. Deleted/invisible notes must disappear from the list but remain recoverable in data (not physically removed).

**Why this priority**: Note maintenance is essential for a functional notes app; soft-delete supports Digest exclusion rules (`visible`) without losing data.

**Independent Test**: Can be fully tested by editing a note, confirming `updated_at` changes, setting `visible = false`, and verifying the note no longer appears in the list while data remains intact.

**Acceptance Scenarios**:

1. **Given** a note exists, **When** the user edits the title or content, **Then** `updated_at` updates and the Digest-relevant fields (`title`, `content`, `updated_at`) reflect changes.
2. **Given** a note exists, **When** the user sets it invisible or deletes it (soft-delete), **Then** it does not appear in the note list or in digest selection (per Digest contract).

---

### User Story 3 - Feature/Unfeature and Basic Search (Priority: P3)

A user marks a note as featured or unfeatures it. The user searches notes by title or content and sees only visible notes; featured status affects ranking (Digest contract requires `featured` flag for ranking).

**Why this priority**: Feature/unfeature is required for Digest ranking; basic search improves usability. Both can be delivered independently after core CRUD.

**Independent Test**: Can be fully tested by toggling `featured`, confirming the flag changes, and performing a basic text search that returns only visible, matching notes.

**Acceptance Scenarios**:

1. **Given** a visible note exists, **When** the user marks it featured, **Then** `featured = true` and the note is eligible for Digest ranking.
2. **Given** multiple visible notes exist, **When** the user searches by a term in title or content, **Then** only notes with matching text and `visible = true` are returned.

---

### Edge Cases

- What happens when a user searches with no results? System should show an empty state message.
- How does the system handle notes with empty title or content? Validation should prevent empty title; empty content should be allowed but documented.
- What happens when a previously-digested note is edited or made invisible? Digest must receive updated state (per Digest behavior rules); note must be excluded from future digest selection if `visible = false`.
- Concurrent edit conflict: Last-write-wins applies; the edit with the most recent `updated_at` timestamp is preserved; no optimistic locking or merge UI required for MVP.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a note with `title`, `content`, `user_id`, `visible = true`, `featured = false`, and auto-set `created_at` and `updated_at`.
- **FR-002**: System MUST allow users to edit `title` and `content` of an existing note and update `updated_at`.
- **FR-003**: System MUST support soft-delete (set `visible = false`) rather than physical deletion, ensuring invisible/deleted notes are excluded from digest selection.
- **FR-004**: System MUST allow users to set `featured = true` or `featured = false` on any visible note.
- **FR-005**: System MUST provide basic search that filters visible notes (`visible = true`) by `title` or `content` text.
- **FR-006**: System MUST preserve full `content` without truncation for Digest meaningfulness.
- **FR-007**: System MUST expose the Digest compatibility fields (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`) in note data.
- **FR-008**: System MUST enforce user isolation via `user_id` (multi-user support confirmed from context).
- **FR-009 [P]**: System MUST use OAuth2 / SSO provider authentication with real identity claim verification (`sub` claim extracted from verified JWT against provider JWKS; `iss` issuer verified against `.env` `JWT_ISSUER` or provider `.well-known/openid-configuration`; `aud` audience verified against `.env` `OAUTH_CLIENT_ID`; `exp` expiry validated; token signature verified using provider public key from JWKS endpoint). Synthetic derivation (`user-${token.substring(...)}`) is explicitly prohibited for production. Implementation deferred to production auth hardening task.
- **FR-009a [P]**: Authentication middleware MUST enforce user isolation by linking verified `sub` claim to `req.user.id` (string UUID from OAuth provider claim); all protected endpoints (`POST /api/notes`, `PUT /api/notes/:id`, `PATCH /api/notes/:id/visibility`, `PATCH /api/notes/:id/featured`) MUST filter notes by `user_id = req.user.id`.
- **FR-009b [P]**: Auth middleware MUST support dedicated user identity mapping mechanism (`users.external_id` column or mapping table) linking OAuth `sub` claim to Digest integer `user_id` for cross-project user isolation.
- **FR-009c [P]**: Authentication events MUST produce structured JSON logs (`timestamp`, `level`, `user_id`, `message`, `component`) to stdout (`info`) and stderr (`error`) per `FR-010` and Principle V; missing `.env` OAuth provider settings (`OAUTH_PROVIDER`) MUST trigger structured error log and reject authentication.
- **FR-010**: System MUST produce structured logs for all note operations (create, edit, delete, feature, visibility change, search) with consistent fields (`timestamp`, `level`, `user_id`, `note_id` where applicable, `message`). Errors MUST be written to stderr.

### Key Entities *(include if feature involves data)*

- **Note**: Represents a user note. Key attributes: `id` (PK), `user_id` (FK/user isolation), `title` (required string), `content` (full text, not truncated), `created_at` (ISO timestamp), `updated_at` (ISO timestamp), `featured` (boolean), `visible` (boolean, controls digest inclusion and visibility).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a note in under 5 seconds (measured from submit to confirmation in list).
- **SC-002**: Note editing updates `updated_at` within 1 second of submission and reflects changes in the list view immediately.
- **SC-003**: Soft-deleted or invisible notes (`visible = false`) do not appear in note list or in Digest selection (verified by query/filter behavior, not just UI).
- **SC-004**: Basic search returns matching visible notes within 2 seconds for up to 500 notes; search excludes invisible notes.
- **SC-005**: Full `content` is preserved and retrievable for all notes (no truncation) to support Digest meaningfulness.
- **SC-006**: Feature toggle (`featured`) is applied immediately and reflects correctly for Digest ranking eligibility.

---

## Clarifications

### Session 2026-09-03

- Q: Authentication/user isolation mechanism for Notes App? → A: OAuth2 / SSO provider (e.g., Google, GitHub)
- Q: Integration mechanism between Notes App and Digest? → A: REST / JSON API (Notes App exposes API; Digest consumes during cron execution)
- Q: Reliability / observability expectations? → A: Structured logging for all note operations (user_id + note_id context); basic error states; no formal uptime SLA (portfolio/MVP scope)
- Q: Concurrent edit conflict resolution? → A: Last-write-wins (timestamp `updated_at` determines latest version)
- Q: Scalability / performance target beyond basic search? → A: 500 visible notes/user; basic text filter; no horizontal scale target (portfolio/MVP scope)

---

### Assumptions

- Authentication mechanism: OAuth2 / SSO provider (e.g., Google, GitHub) selected for multi-user isolation; `user_id` derived from identity provider claim. Implementation details (provider selection, token handling) deferred to `/sp.plan`.
- Integration mechanism: REST / JSON API selected; Notes App exposes Digest-compatible endpoints; Digest consumes during `node-cron` execution. API contract must preserve full content and visibility/featured state.
- Basic search means text matching in `title` and `content`; full-text index (FTS) is a future optimization, not required here.
- Reliability / observability: Structured logging for all note operations; basic error states; no formal uptime SLA (portfolio scope). Observability aligns with Constitution Principle V.
- Scalability / performance: 500 visible notes per user; basic text search sufficient; no horizontal scaling target for MVP/portfolio scope. Performance targets defined in SC-001 through SC-006 (5s create, 1s edit, 2s search for 500 notes).
- Deployment target is Vercel (mentioned in research); persistence mechanism for database must be decided separately (SQLite service or PostgreSQL managed service).

---

*Specification created for `/sp.specify` workflow. Maximum 3 [NEEDS CLARIFICATION] markers allowed; none included above — all critical scope decisions have reasonable defaults based on Digest contract and user context.*
