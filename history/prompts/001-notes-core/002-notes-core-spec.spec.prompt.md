---
id: 002
title: Notes Core Note Management Spec
stage: spec
date: 2026-09-03
surface: agent
model: opencode
feature: notes-core
branch: 001-notes-core
user: user
command: /sp.specify
labels: ["notes-app", "spec", "digest-compatibility"]
links:
  spec: specs/001-notes-core/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-notes-core/spec.md
 - specs/001-notes-core/checklists/requirements.md
tests:
 - Checklist created and validated (PASS)
---

## Prompt

Create the initial feature specification for the Notes App core note management feature (`/sp.specify`). Feature description from user input / conversation context: Notes App must support create, edit, soft-delete, feature/unfeature, visibility control, and basic search; must be compatible with the existing Weekly Digest data model (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`, `featured`, `visible`); invisible/deleted notes excluded from digest; `featured` affects digest ranking; full content preserved; digest selection capped at 15 notes. The Digest uses TypeScript/Node.js with SQLite + Knex. The integration mechanism is not decided.

## Response snapshot

Filled `specs/001-notes-core/spec.md` with user stories (P1 create/view, P2 edit/soft-delete/visibility, P3 feature/search), 8 functional requirements mapping Digest contract fields, 6 measurable technology-agnostic success criteria, key entity (Note with Digest-compatible fields), edge cases, and documented assumptions (auth deferred, integration mechanism unresolved, basic search not FTS). No [NEEDS CLARIFICATION] markers included (all scope has reasonable defaults). Created checklist at `specs/001-notes-core/checklists/requirements.md` — all items pass. Feature ready for `/sp.clarify` (optional clarification) or `/sp.plan`.

## Outcome

- ✅ Impact: Specification completed; Digest contract fields covered; no clarification markers needed; checklist validated
- 🧪 Tests: Checklist validation PASS; all sections complete; no unresolved placeholders
- 📁 Files: `specs/001-notes-core/spec.md`, `specs/001-notes-core/checklists/requirements.md`, `history/prompts/001-notes-core/002-notes-core-spec.spec.prompt.md`
- 🔁 Next prompts: `/sp.clarify` for auth/integration clarification if needed; `/sp.plan` for architecture and implementation planning
- 🧠 Reflection: Feature scope bounded by Digest contract requirements; kept simple (no auth mechanism decided, no FTS, no integration mechanism finalized) to avoid premature architecture choices.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS — checklist all items marked complete; no clarification markers; requirements testable; success criteria measurable and technology-agnostic
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to `/sp.clarify` if user wants to resolve auth method, DB choice, or integration mechanism before planning
