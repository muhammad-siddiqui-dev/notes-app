# Notes App — Initial Research Artifact

> **Purpose**: Document the problem space, compatibility requirements with the Weekly Digest, technology options, constraints, tradeoffs, and unresolved decisions. This file feeds `/sp.specify`, `/sp.clarify`, and `/sp.plan`. No architecture is finalized here. No implementation code is included.

---

## 1. Project Context

- **Project**: Notes App — a modern, polished, portfolio-grade notes application for personal and multi-user use.
- **Separate project**: The existing Weekly Email Digest (TypeScript/Node.js, SQLite + Knex, Luxon, node-cron, Handlebars, Resend, Vitest) must remain separate during development.
- **Eventual integration**: Required but mechanism NOT decided (shared DB, API, or other approach). The Notes App must eventually provide data compatible with the Digest's note model and behavior.

---

## 2. Functional Requirements & Scope (Researched Facts)

### Confirmed requirements from user input
- Note capabilities: create, edit, soft-delete, feature/unfeature, visibility control, basic search.
- User/account model must support multi-user usage (portability beyond single-user demo).
- Data model compatibility fields (must match Digest contract):
  - `id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`
- Digest behavior rules affecting data design:
  - Invisible/deleted notes must NOT appear in digest.
  - `featured` affects digest ranking.
  - `updated_at` and title/content changes matter for previously-digested notes.
  - Digest meaningfulness requires preserving full note content (not truncated summaries).
  - Digest selection capped at 15 notes.

### Researched facts (external references / known practices)
- Modern notes apps typically store `content` as plain text or Markdown; full content preservation aligns with Digest requirement.
- Soft-delete is implemented as `visible = false` or a `deleted_at` timestamp rather than physical deletion; Digest requires invisible/deleted notes excluded.
- Feature/unfeature is a boolean (`featured`) with ranking logic; Digest uses it for ranking.
- Search scope for MVP: title + content text search; index-based search (e.g., FTS) is a future optimization, not required for initial research.

---

## 3. Data Model & Digest Compatibility Requirements

### Required fields (confirmed by Digest contract)
| Field | Type (inferred) | Digest behavior implication |
|-------|----------------|----------------------------|
| `id` | UUID / integer PK | Stable identifier across digest runs |
| `user_id` | Foreign key / string | Multi-user isolation; digest filters by user |
| `title` | String (required) | Changes matter for previously-digested notes |
| `content` | Text (full, not truncated) | Digest meaningfulness requires full preservation |
| `created_at` | Timestamp (ISO) | Ordering / sequencing |
| `updated_at` | Timestamp (ISO) | Changes matter for previously-digested notes |
| `featured` | Boolean / integer | Affects digest ranking |
| `visible` | Boolean / enum | Invisible/deleted notes excluded from digest |

### Data compatibility rules (derived from Digest behavior)
- **Full content preservation**: Any note included in a digest must retain its full `content` at digest time. Truncation or summary-only storage violates Digest meaningfulness.
- **Invisible notes excluded**: `visible = false` (or equivalent deleted state) must filter out notes before digest selection; cap of 15 applies to visible, eligible notes only.
- **Featured ranking**: Digest ranking must respect `featured = true` as higher priority; ranking algorithm is Digest-side but data must expose the flag.
- **Updated tracking**: Digest must detect `updated_at` and title/content changes for notes previously included in a digest. This implies either Digest reads full note state each cycle or relies on diff detection via timestamp/content hash.

---

## 4. Database Options (Researched Tradeoffs)

### Option A: SQLite (Digest's current DB)
- **Fact**: Digest uses SQLite + Knex. SQLite is file-based, portable, requires no separate server.
- **Pros**: Zero deployment overhead; easy backup; aligns with Digest current stack; good for single-node deployment (e.g., Vercel serverless with file persistence limitations considered).
- **Cons**: Concurrent writes limited; file-based storage on serverless platforms (Vercel) requires persistent volume or external storage; multi-region deployment requires replication mechanism not native to SQLite.
- **Digest compatibility**: Direct file sharing between separate projects is risky; separate SQLite files per project are safe during development.

### Option B: PostgreSQL
- **Fact**: PostgreSQL is relational, supports concurrent writes, full-text search, JSON fields, and is deployable via managed services (e.g., Neon, Supabase, Vercel Postgres).
- **Pros**: Scalable; native FTS; supports concurrent multi-user access; easier integration via shared database or API contract; managed services handle backups and replication.
- **Cons**: Requires managed service or container; cost increases with scale; more operational complexity than SQLite.
- **Digest compatibility**: Digest could connect to the same PostgreSQL instance or consume an API exposing the data. Shared DB is feasible but couples projects; API decouples them.

### Unresolved decision (must be resolved in Specify / Clarify / Plan)
- **Which database will the Notes App use?** SQLite keeps initial simplicity; PostgreSQL supports multi-user and future integration better. The user must decide whether to match Digest (SQLite) or choose PostgreSQL for deployment/scalability.

---

## 5. Deployment Implications — Vercel (Researched Facts)

### Platform facts
- Vercel supports serverless functions (Node.js) and static/frontend deployment.
- Serverless functions are stateless; file-system writes are ephemeral per invocation unless using a persistent storage add-on (e.g., Vercel Blob, Vercel KV, external DB).
- SQLite file persistence on Vercel requires either:
  - A persistent volume (not standard on Vercel serverless), or
  - Using SQLite via a managed service (e.g., Turso, SQLite Cloud), or
  - Storing SQLite file in Vercel Blob between invocations (complex, slow).

### Implications for Notes App
- If using SQLite: deployment on Vercel requires either a SQLite-as-service (Turso) or accepting stateless file behavior, which conflicts with multi-user persistence.
- If using PostgreSQL (managed): Vercel serverless connects to external DB (e.g., Neon, Supabase) easily; no file persistence issue.
- If Notes App is purely frontend + serverless API, database must be external (managed) regardless of SQLite vs PostgreSQL choice.

### Unresolved decision
- **Deployment target confirmed as Vercel?** Confirmed by user input (mentioned Vercel). The mechanism for data persistence on Vercel must be decided based on DB choice.

---

## 6. Authentication & User/Account Model (Options & Tradeoffs)

### Options researched
1. **Simple local/user-table auth**: Email + hashed password stored in DB; session cookies or JWT tokens.
2. **OAuth / SSO (e.g., Google, GitHub)**: Uses external identity provider; reduces auth implementation burden; good for portfolio/multi-user apps.
3. **No auth for initial MVP**: Single-user mode; simplifies initial build; but conflicts with multi-user requirement.

### Tradeoffs
- Local auth: Full control; must implement secure hashing (e.g., bcrypt), session management, password reset. Higher implementation burden.
- OAuth: Faster to implement via libraries (e.g., NextAuth.js, Auth.js); less control over identity lifecycle; requires external service dependency.
- No auth: Fastest; violates multi-user scope; must be decided whether to include auth in initial feature or defer.

### Unresolved decisions
- **Authentication method?** OAuth vs local vs hybrid.
- **Auth library?** Not decided; should be researched in Specify if auth is in scope for initial feature.
- **User/account isolation model?** Confirmed: notes must include `user_id` for Digest compatibility; isolation mechanism (DB-level, query-level filter) must align with auth choice.

---

## 7. Integration Approaches Between Notes App and Digest (Researched Options)

### Confirmed constraints
- Digest uses TypeScript/Node.js, SQLite + Knex, Luxon, node-cron, Handlebars, Resend, Vitest.
- Digest runs via `node-cron` architecture (scheduled job, not continuous server).
- Integration mechanism NOT decided.

### Option A: Shared Database (Direct DB Access)
- **Mechanism**: Both projects connect to the same database instance; Digest reads Notes App tables directly (or vice versa).
- **Pros**: Simplest data sharing; no API layer needed; real-time consistency.
- **Cons**: Couples projects tightly; schema changes in Notes App break Digest; Digest's SQLite file-based approach makes shared DB complex unless both migrate to PostgreSQL or a shared SQLite service.
- **Digest `node-cron` impact**: Digest runs as scheduled job; direct DB access works well with cron because job connects, reads, writes, disconnects. No long-running connection needed.

### Option B: REST / JSON API
- **Mechanism**: Notes App exposes an API; Digest consumes it during cron execution (or Notes App pushes updates).
- **Pros**: Decoupled; Notes App can change schema without breaking Digest (as long as contract maintained); supports different tech stacks.
- **Cons**: Requires API design, authentication between services, error handling, rate limits; Digest must handle network failures during cron run.
- **Digest `node-cron` impact**: Digest must handle HTTP timeouts and retries; network failures during scheduled run could cause missed digests; requires robust error logging.

### Option C: Shared Schema Contract with Separate Storage
- **Mechanism**: Notes App and Digest agree on a data contract (fields, formats, behavior rules) but store data independently; synchronization via periodic job, webhook, or message queue.
- **Pros**: Maximum independence; Digest can run independently; synchronization frequency configurable.
- **Cons**: Most complex; requires sync mechanism (polling, webhook, queue); eventual consistency; data divergence risk.
- **Digest `node-cron` impact**: Digest could poll Notes App API or read from a shared sync table; `node-cron` architecture supports polling well.

### Unresolved decision
- **Integration mechanism**: Shared DB, API, or sync contract? Must be decided before Plan stage because it affects database choice, deployment, and Notes App architecture.

---

## 8. Digest's `node-cron` Architecture — Impact Analysis

### Researched facts
- Digest uses `node-cron` (scheduled job, not a persistent server process).
- Digest connects to DB, reads notes, generates digest, sends via Resend (email service), logs, and exits.
- Digest relies on external scheduling (e.g., cron job, GitHub Actions, or server cron) to trigger execution.

### Implications for Notes App integration
- **Shared DB**: Digest connects to DB during cron execution; Notes App must ensure DB is accessible (managed service or shared instance) during Digest's scheduled window.
- **API integration**: Digest must make HTTP requests during its execution window; network latency and timeouts must be handled; Digest must not exceed execution time limits imposed by hosting environment.
- **Sync contract**: Digest could read from a shared sync file/table or call API at start; `node-cron` architecture favors simple, fast operations; complex multi-step sync increases failure risk.

### Unresolved considerations
- **Digest hosting environment**: Not fully specified; affects timeout limits and DB access. Confirmed by user input that Digest is separate and must remain separate.
- **Digest scheduling frequency**: Not specified; affects integration timing and whether Notes App needs real-time updates or batch updates.

---

## 9. Security, Privacy, Accessibility, Maintainability, Testing, Performance

### Security & Privacy (Researched facts + recommendations)
- **Authentication**: Must protect user data; `user_id` isolation required.
- **Data privacy**: Notes may contain personal/sensitive content; storage should use encryption at rest (managed DB feature) or application-level encryption if highly sensitive. For portfolio app, basic DB-level encryption (managed service default) is sufficient.
- **Secrets**: Never hardcode secrets (per constitution); `.env` for DB URLs, API keys, auth secrets.
- **Soft-delete visibility control**: `visible` flag and `deleted_at` must be enforced at query level, not just application layer, to prevent accidental exposure.

### Accessibility (Researched facts)
- Modern web apps should meet WCAG 2.1 AA: keyboard navigation, screen reader labels, sufficient color contrast, focus indicators, alt text for images.
- Notes content is text-heavy; semantic HTML (`article`, `header`, `section`) improves accessibility.

### Maintainability (Researched facts + recommendations)
- Smallest viable change (Principle VI); avoid unnecessary abstraction.
- Test-first (Principle III); contract and integration tests required (Principle IV).
- Structured logging (Principle V) aids debugging; logs must include `user_id` and note `id` for audit trails.

### Testing (Researched facts)
- Unit tests: model logic, validation, query filtering.
- Integration tests: DB interactions, auth flows, note CRUD, visibility/search contracts.
- Contract tests: Digest compatibility fields and behavior rules (visible exclusion, featured ranking, full content preservation).
- Performance considerations: Search queries must handle text search; without FTS index, full-text search on large content fields will be slow; initial scope is basic search, not optimized FTS.

---

## 10. Major Tradeoffs Summary

| Decision Area | Simple Option | Scalable / Decoupled Option | Tradeoff |
|---|---|---|---|
| Database | SQLite (match Digest) | PostgreSQL (managed) | SQLite = simpler but serverless deployment complex; PostgreSQL = deployment easier but operational cost higher |
| Integration | Shared database | API / contract sync | Shared DB = simplest but tight coupling; API = decoupled but more complex; sync = most independent but eventual consistency |
| Auth | None / basic local | OAuth / SSO | No auth = fastest but violates multi-user; OAuth = faster implementation; local = full control but higher burden |
| Search | Basic text filter | Full-text search (FTS) index | Basic filter = simple but slow on large datasets; FTS = faster but adds complexity |
| Deployment target | Vercel serverless (with external DB) | Self-hosted container / VPS | Vercel = easy deployment; external DB adds cost; self-hosted = more control but more ops |

---

## 11. Unresolved Questions (Must Be Resolved Before Implementation)

These decisions affect architecture, database, deployment, and integration. They should be addressed in `/sp.clarify` and `/sp.plan`, not in this research document.

1. **Database choice**: SQLite (with persistence strategy) or PostgreSQL (managed service)?
2. **Integration mechanism**: Shared DB, REST API, or sync contract between Notes App and Digest?
3. **Authentication method**: OAuth (provider?), local auth, or deferred?
4. **Deployment persistence**: How will SQLite persist on Vercel (Turso? Vercel Blob? External SQLite service?), or will PostgreSQL be adopted?
5. **Digest scheduling and hosting**: What environment runs Digest's `node-cron`? What are execution time limits? Does Digest currently have a DB connection string configured?
6. **Notes content format**: Plain text, Markdown, or rich text? Digest requires full content; format affects storage size and rendering.
7. **Search scope and performance target**: Title + content filter sufficient, or full-text search index required for initial release?
8. **Multi-user isolation enforcement**: DB-level row-level security, application query filters, or both?
9. **Notes App tech stack**: Confirmed TypeScript/Node.js (to match Digest)? Frontend framework (React, Vue, plain HTML)? Server framework (Express, Fastify, Next.js)? Not specified; must be decided in Specify.
10. **Versioning / migration strategy**: How will schema changes be managed as Notes App evolves? Who owns schema changes given Digest dependency?
11. **Data retention / backup policy**: Who owns note backups? How are deleted (soft-deleted) notes handled over time?

---

## 12. Recommendations (Not Decisions — For Clarify / Plan Stage)

- **Keep Notes App intentionally simple**: Focus on create, edit, soft-delete, feature/unfeature, visibility, basic search. Do not build advanced collaboration, real-time sync, or complex tagging in initial feature.
- **Align data model with Digest contract early**: Define the exact schema for `notes` table (or equivalent) to match Digest fields (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`). Document this in `/sp.specify`.
- **Decide integration mechanism before database choice**: Integration approach (shared DB vs API vs sync) directly impacts whether SQLite is viable and how Notes App deploys.
- **Resolve Digest hosting and scheduling details**: Confirm Digest's `node-cron` execution environment, timeout limits, and DB connection details before finalizing Notes App deployment plan.
- **Use principle-driven design** (per constitution): Spec-first (Principle I), CLI interface (Principle II), test-first (Principle III), integration testing for Digest contract (Principle IV), structured logging (Principle V), simplicity and YAGNI (Principle VI).

---

## 13. References & Sources

- User input (conversation): Requirements for Notes App capabilities, Digest compatibility fields, Digest behavior rules, separate project requirement, Vercel deployment mention.
- Existing Digest project context: TypeScript/Node.js, SQLite + Knex, Luxon, node-cron, Handlebars, Resend, Vitest (from `opencode.md` and user input).
- `.specify/memory/constitution.md`: Governance principles guiding simplicity, testing, observability, CLI interface.
- No external documentation fetched for Vercel, SQLite, PostgreSQL, or OAuth beyond standard engineering knowledge; further verification can be done during Specify if needed.

---

*This research file is complete but intentionally leaves architecture, technology choices, and integration mechanism unresolved. Those must be decided through `/sp.clarify`, `/sp.specify`, and `/sp.plan` before any implementation begins.*
