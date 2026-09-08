# Quickstart: Notes App Core Feature

**Branch**: `001-notes-core` | **Spec**: `spec.md` | **Plan**: `plan.md`

## Development Setup

1. **Clone and checkout branch**: `git checkout 001-notes-core`
2. **Install dependencies**: `npm install`
3. **Configure environment** (`.env`):
   - `DATABASE_URL`: PostgreSQL managed service URL (e.g., Neon, Supabase) OR SQLite service URL (e.g., Turso)
   - `OAUTH_PROVIDER`: OAuth2 provider name (e.g., Google, GitHub) — deferred to `/sp.plan`
   - `OAUTH_CLIENT_ID`: OAuth client identifier
   - `OAUTH_CLIENT_SECRET`: OAuth client secret
   - `VERCEL_URL`: Deployment URL for API callbacks
4. **Run database migrations**: `npm run migrate` (Knex or equivalent — deferred to plan)

## Running Locally

- **Backend server**: `npm run dev:backend`
- **Frontend**: `npm run dev:frontend`
- **Tests**: `npm test` (Vitest — contract, integration, unit)

## Testing Strategy (per Constitution Principles III–IV)

- **Unit tests**: Validation rules, query filters (`visible = true`, user isolation via `user_id`)
- **Contract tests**: Digest compatibility fields (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`) exposed correctly
- **Integration tests**: Note CRUD + visibility/search; API endpoints return JSON with full content preserved
- **Observability verification**: Confirm structured logs include `timestamp`, `level`, `user_id`, `note_id`, `message`

## Deploying

- **Target**: Vercel serverless (backend functions + static frontend)
- **Persistence**: External database required (SQLite file persistence not reliable on Vercel serverless; PostgreSQL managed service recommended based on research)
- **Integration with Digest**: Digest consumes REST API at `GET /api/notes` (with `visible=true` filter); Digest's `node-cron` architecture supports HTTP calls during scheduled execution

## Key Constraints (from Spec & Clarifications)

- Digest contract fields must be preserved exactly; full `content` never truncated.
- `visible = false` excludes notes from digest selection and note list.
- `featured` affects Digest ranking; toggle does not change `updated_at`.
- Conflict resolution: last-write-wins (`updated_at` timestamp).
- Auth: OAuth2/SSO (`user_id` linked to identity provider claim).
- Integration: REST/JSON API.
- Scale: 500 visible notes/user; basic text search.
