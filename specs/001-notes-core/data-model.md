# Data Model: Notes App Core Note Management

**Feature**: `001-notes-core` | **Date**: 2026-09-03
**Source**: Derived from `spec.md` (FR-001 through FR-010) and Digest compatibility contract.

---

## Entities

### Note

| Field | Type | Constraints | Digest Contract | Notes |
|-------|------|-------------|-----------------|-------|
| `id` | UUID / string (PK) | Unique, immutable | Required | Stable identifier for digest reference |
| `user_id` | String / UUID (FK) | Not null; references OAuth identity provider claim | Required | Multi-user isolation; derived from OAuth provider |
| `title` | String | Required; non-empty; max length TBD in plan | Required | Digest uses title for ranking/identification |
| `content` | Text | Full content preserved; no truncation | Required | Digest meaningfulness requires full preservation |
| `created_at` | ISO timestamp | Auto-set on creation; immutable | Required | Ordering / sequencing for digest |
| `updated_at` | ISO timestamp | Auto-set on creation; updated on edit | Required | Digest detects changes for previously-digested notes |
| `featured` | Boolean | Default `false`; set by user toggle | Required | Affects digest ranking |
| `visible` | Boolean | Default `true`; set to `false` for soft-delete | Required | Invisible/deleted notes excluded from digest selection |

---

## Validation Rules (from spec requirements)

- `title`: Required, non-empty.
- `content`: Full text preserved (no truncation); empty allowed but documented.
- `visible`: Boolean; `false` excludes note from note list and digest selection (per Digest contract).
- `featured`: Boolean; affects digest ranking eligibility.
- `user_id`: Must match OAuth identity provider claim (FR-009); isolation enforced at query level.
- `updated_at`: Updated on any edit to `title` or `content`; unchanged by visibility/feature toggles (unless design specifies otherwise; current assumption: visibility/feature changes do not alter `updated_at`).

---

## State Transitions

- **Create**: `visible = true`, `featured = false`, `created_at` = now, `updated_at` = now.
- **Edit** (title/content): `updated_at` = now; `visible` and `featured` unchanged.
- **Feature toggle** (`featured`): `featured` flips; `updated_at` unchanged (assumption: feature toggle is metadata change, not content edit).
- **Soft-delete / visibility off** (`visible = false`): `visible` set to `false`; note excluded from list/search/digest; `updated_at` unchanged (assumption: visibility change is state transition, not edit).
- **Restore** (`visible = true`): `visible` set to `true`; note re-included in list/search.

---

## Relationships

- Note → User (`user_id`): Many notes per user; isolation enforced by filtering on `user_id` for all queries.
- Note → Digest (external contract): Digest consumes notes via REST API (`GET /api/notes` with visibility filter); Note model must expose all Digest-required fields without modification.

---

*Data model aligns with Digest contract (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`) and clarification Q1 (OAuth2 auth) / Q2 (REST API integration) / Q4 (last-write-wins).*
