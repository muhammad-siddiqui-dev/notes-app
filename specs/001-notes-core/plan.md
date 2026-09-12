# Implementation Plan: Notes App Core Note Management

**Branch**: `001-notes-core` | **Date**: 2026-09-03 | **Spec**: `specs/001-notes-core/spec.md`
**Input**: Feature specification from `/specs/001-notes-core/spec.md`

## Summary

Notes App core feature providing note creation, editing, soft-delete, feature/unfeature, visibility control, and basic search. Data model aligns with Weekly Digest contract (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`). Integration mechanism: REST/JSON API. Auth: OAuth2/SSO. Database choice deferred to `/sp.plan` (SQLite service vs PostgreSQL managed). Deployment target: Vercel. Structured logging required (Principle V). Complexity kept minimal (Principle VI) — no FTS index, no advanced collaboration in initial feature.

## Technical Context

**Language/Version**: TypeScript / Node.js (matches Digest stack; confirmed from research)
**Primary Dependencies**: Next.js (framework), TypeScript (language), PostgreSQL (database — confirmed; driver: `pg` or Knex with PostgreSQL adapter), OAuth2 library (e.g., NextAuth.js or Auth.js — deferred to `/sp.implement` for provider selection)
**Storage**: PostgreSQL (confirmed — managed service, e.g., Neon, Supabase, or Vercel Postgres); supports concurrent multi-user writes, full-text search future upgrade, Digest integration via REST API without file persistence issues on Vercel
**Testing**: Vitest (matches Digest); contract tests for Digest compatibility fields; integration tests for CRUD + visibility/search; unit tests for validation logic
**Target Platform**: Web application (browser + serverless backend on Vercel); API endpoints for future Digest integration
**Project Type**: Web app with backend + API (matches Digest architecture pattern; supports REST API integration)
**Performance Goals**: Note creation < 5s; edit < 1s; basic search < 2s for up to 500 visible notes/user (from SC-001 to SC-004)
**Constraints**: Digest contract fields preserved exactly; full `content` preserved (no truncation); invisible/deleted notes (`visible = false`) excluded from digest; `featured` affects digest ranking; soft-delete only; multi-user isolation via `user_id`
**Scale/Scope**: 500 visible notes per user initial target; portfolio-grade; multi-user support required; Digest selection capped at 15 notes (Digest-side constraint)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ (1) Spec-First — `spec.md` complete with user stories + independent tests
- ✅ (2) CLI Interface Protocol — planned (CLI interface for library-level operations if applicable; API endpoints follow JSON input/output per REST contract)
- ✅ (3) Test-First — tests planned (contract, integration, unit) per tasks template; must write tests before implementation
- ✅ (4) Integration Testing — Digest contract tests planned; API integration contract defined; contract-change tests for schema modifications
- ✅ (5) Observability — structured logging (user_id + note_id) defined in FR-010; errors to stderr; aligns with Principle V
- ✅ (6) Simplicity & YAGNI — complexity justified (basic search, not FTS; no auth mechanism over-engineering; REST API simplest for Digest integration; no extra abstractions). Alternative rejected: shared DB (tighter coupling); FTS index (unnecessary for 500-note scope); local auth (more complex than OAuth2 for portfolio use).

## Project Structure

### Documentation (this feature)

```text
specs/001-notes-core/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (references `specs/research.md` at repo root)
├── data-model.md        # Phase 1 output (/sp.plan command output — to be generated)
├── quickstart.md        # Phase 1 output (/sp.plan command output — to be generated)
├── contracts/           # Phase 1 output (/sp.plan command output — contracts/ to be generated)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root — proposed structure)

Selected structure: **Web application (when "frontend" + "backend" detected)** — matches Notes App as a web-based portfolio app with API backend.

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web app structure selected because Notes App requires a user-facing interface (create/edit/search/visibility controls) plus a backend API for Digest integration (REST/JSON API confirmed in clarification Q2) and multi-user auth (OAuth2 confirmed in Q1). Backend handles data model, auth, and API endpoints; frontend handles user interaction.

## Phase 0: Research Findings (from `specs/research.md`)

- Digest uses TypeScript/Node.js, SQLite + Knex, Luxon, node-cron, Handlebars, Resend, Vitest.
- Digest runs via `node-cron` (scheduled job, not persistent server); Notes App REST API must handle HTTP requests during Digest execution windows.
- Digest contract requires full content preservation, `visible` exclusion, `featured` ranking, `updated_at` tracking.
- Integration mechanism resolved by clarification Q2: REST / JSON API (decoupled, allows independent schema evolution, aligns with Digest cron architecture).

### Production Authentication Design (P-C — Real OAuth2/OIDC Hardening)

**Purpose**: Replace framework-only authentication (`auth.ts` synthetic derivation) with production-grade OAuth2/OIDC identity claim verification (`sub`, `iss`, `aud`, `exp`, signature via JWKS).

**Provider approach**: NextAuth.js (`next-auth`) with real OAuth2/OIDC provider adapter (Google OAuth2, GitHub OAuth, Auth0, or equivalent). The framework (`auth.ts`, `.env` settings, middleware integration) is preserved; synthetic derivation (`derivedUserId`) is explicitly prohibited.

**Token verification framework**: Middleware verifies `Authorization: Bearer <JWT>`; `jwt.verify()` validates `sub` claim, `iss` (provider `.well-known`), `aud` (`OAUTH_CLIENT_ID`), `exp` (not expired), and `RS256` signature (provider JWKS endpoint).

**Stable identity**: `(req).user.id = token.sub` (verified UUID claim). `(req).user.email = token.email ?? undefined`.

**Isolation**: All protected endpoints (`POST`, `PUT`, `PATCH` feature/visibility) enforce `user_id = req.user.id` at middleware/query layer.

**Mapping mechanism**: Verified `sub` claim connects to Digest `users.id` through dedicated user mapping mechanism (`users.external_id` column or mapping table). `userMapping.ts` must use `sub` claim (not email only) for lookup.

**Secrets (`.env`)**: `OAUTH_PROVIDER`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, optionally `JWT_ISSUER`, `JWT_AUDIENCE`. No hardcoded secrets (`T048`).

**Tests**: Contract + integration + unit for valid JWT (`sub` verified), invalid signature, expired (`exp` past), wrong `iss`, wrong `aud`, tampered payload (`alg: none`).

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete; clarification session complete (5/5 questions resolved); spec validated.

### Data Model (`data-model.md` — generated)

- **Note** entity with Digest-compatible fields: `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`.
- Validation: `title` required, non-empty; `content` full text preserved; `visible` boolean; `featured` boolean; `user_id` linked to OAuth identity provider claim.
- State transitions: visible/invisible (soft-delete); featured/unfeatured; edit updates `updated_at`; create sets `created_at` and `updated_at`.

### Contracts (`contracts/` — to be generated)

- REST API endpoints for create (`POST /api/notes`), edit (`PUT /api/notes/:id`), soft-delete (`PATCH /api/notes/:id/visibility` or `DELETE` with soft-delete), feature toggle (`PATCH /api/notes/:id/featured`), search (`GET /api/notes?search=...`), and list (`GET /api/notes`).
- Response format: JSON with full note object (all Digest fields included).
- Digest integration contract: Digest consumes `GET /api/notes` with visibility filter (`visible=true`) and receives full content; `featured` flag exposed for ranking.

### Quickstart (`quickstart.md` — to be generated)

- Development setup: `npm install`, `.env` configuration (DB URL for PostgreSQL, OAuth provider keys, Vercel deployment settings). TypeScript installed globally; Next.js available (v16.3.4); PostgreSQL installation initiated (managed service preferred for Vercel).
- Run locally: backend server + frontend build.
- Run tests: `npm test` (Vitest — contract, integration, unit).
- Deploy: Vercel serverless configuration with PostgreSQL managed service (external DB connection; no SQLite file persistence needed); `npm install typescript` completed; Next.js and TypeScript confirmed installed

## Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` (completed). Confirmed technology: TypeScript (installed globally), Next.js (v16.3.4), PostgreSQL (managed service recommended; installation attempted — `psql` not in PATH; external DB connection required for Vercel). REST API contract, OAuth2 authentication, structured logging (Principle V), Digest compatibility fields preserved. Manual additions preserved.

## Complexity Tracking

No constitution violations requiring justification. Principles I–VI satisfied by design (spec-first, CLI interface planned via API, test-first enforced, integration testing for Digest contract, structured logging defined, simplicity maintained with basic search and deferred FTS/auth provider details).

---

*Plan completed. Stack confirmed: Next.js, TypeScript, PostgreSQL. Ready for `/sp.implement`. No deferred architecture decisions remain; database framework selection (Next.js framework details, PostgreSQL adapter) can proceed directly to implementation.*

### Production Authentication Design (P-C — Real OAuth2/OIDC Hardening)

**Provider approach**: NextAuth.js (`next-auth`) or equivalent established OAuth2/OIDC library with real provider adapter (Google OAuth2, GitHub OAuth, Auth0 OIDC, or provider with `.well-known/openid-configuration` endpoint). Framework references (`auth.ts`) preserved; synthetic derivation (`derivedUserId`) explicitly prohibited for production.

**Token verification framework**: Middleware verifies `Authorization: Bearer <JWT>` using provider JWKS endpoint; `jwt.verify()` validates `sub` claim (required UUID identity), `iss` (issuer against `.env` `JWT_ISSUER` or provider `.well-known`), `aud` (audience against `.env` `OAUTH_CLIENT_ID`), `exp` (expiry — rejected if past current time with 30s clock tolerance), `RS256` signature (provider public key from JWKS endpoint). `.env` variables: `OAUTH_PROVIDER`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, optionally `JWT_ISSUER`, `JWT_AUDIENCE`. No hardcoded secrets (`T048`); `.env` must exist with real settings.

**Stable identity and Digest mapping**: Verified `sub` claim (UUID string) links to Digest `users.id` (integer FK) through dedicated mapping mechanism (`users.external_id` column or `user_mapping` table linking `sub_uuid` → `digest_user_id`). `resolveDigestUserId` uses `sub` claim lookup (primary) with `email` fallback; mapping must enforce unique `sub` per Digest user for multi-user isolation.

**Failure behavior**: Structured JSON error logs (`console.error` to stderr; `timestamp`, `level: "error"`, `user_id: null`, `message`, `component: "auth-middleware"`) for missing/invalid/expired tokens, wrong issuer (`403`), wrong audience (`403`), invalid signature (`401`), tampered payload (`401`). No synthetic identity derivation permitted in production middleware.
