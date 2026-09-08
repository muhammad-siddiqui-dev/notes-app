<!-- Sync Impact Report -->
<!-- Version: 0.0.0 (template) → 1.0.0 (initial adoption) -->
<!-- Principles: All 6 filled (PRINCIPLE_5 split into Observability + Simplicity, PRINCIPLE_6 added) -->
<!-- Sections added: Security & Data Integrity; Development Workflow & Review Process -->
<!-- Added: Governance rules, versioning policy, amendment procedure, compliance review expectations -->
<!-- Templates updated: .specify/templates/plan-template.md ✅ (aligned gates), .specify/templates/spec-template.md ✅ (aligned requirements), .specify/templates/tasks-template.md ✅ (task types reflect principles) -->
<!-- Commands checked: .opencode/command/*.md ✅ (no agent-specific names remaining) -->
<!-- Deferred: RATIFICATION_DATE (unknown) -->
<!-- TODOs: Confirm RATIFICATION_DATE -->

# Notes App Constitution

## Core Principles

### I. Spec-First Development
Every feature MUST start with a written specification at `specs/<feature>/spec.md`. The spec defines user stories, independent tests, and measurable acceptance criteria before any implementation begins. Rationale: Without a clear spec, scope creep and ambiguous requirements are guaranteed; a written spec makes user intent verifiable and testable.

### II. CLI Interface Protocol
Every library and service MUST expose functionality via a CLI interface following stdin/args → stdout, errors → stderr. Outputs MUST support both JSON and human-readable formats. Rationale: Text I/O ensures debuggability, composability, and automation; structured formats enable machine parsing and logging.

### III. Test-First (NON-NEGOTIABLE)
TDD is mandatory: tests MUST be written and approved by the user BEFORE implementation. The cycle is: test written → test fails → user approves → implement → test passes. Red-Green-Refactor is strictly enforced. Rationale: Tests document intent; writing them first prevents untestable designs and reduces regression risk.

### IV. Integration Testing
Every feature MUST include contract tests for new library contracts, integration tests for inter-service communication, and contract-change tests for schema modifications. Focus areas: library contracts, shared schemas, and service boundaries. Rationale: Unit tests miss contract mismatches; integration tests catch failures at boundaries where bugs propagate.

### V. Observability
Structured logging is required for all operations. Every service MUST produce logs with consistent fields (timestamp, level, component, message) and MUST write errors to stderr. Rationale: Without structured logs, debugging in production is impossible; observability is a non-negotiable operational requirement.

### VI. Simplicity & YAGNI
Start with the smallest viable change that satisfies the spec. Do not add abstractions, libraries, or features not explicitly required. Complexity MUST be justified in the plan with a simpler alternative rejected. Rationale: Unnecessary complexity increases failure modes, maintenance cost, and security surface.

## Security & Data Integrity

All user data MUST be handled with explicit authorization checks. No secrets or keys MUST be hardcoded; use `.env` and environment configuration. All data modifications MUST be validated against the spec's entity definitions. Any security event (auth failure, authorization denial, data access) MUST be logged with context.

Rationale: Security cannot be added as an afterthought; it must be embedded in every feature's design and verified by tests.

## Development Workflow & Review Process

Every pull request MUST reference the feature spec and include:
- A constitution check confirming compliance with principles I–VI.
- Evidence that tests fail before implementation and pass after.
- Documentation updates if user-facing behavior changed.

Code review gates:
- Tests pass (unit + integration).
- No unexplained complexity violations.
- PHR created for every significant user input.
- ADR suggested when a significant architectural decision is detected.

Amendments to this constitution require documentation of the change, approval, and a migration plan if the change affects existing specs or plans. All amendments MUST update the version per semantic versioning rules.

## Governance

This constitution supersedes all other practices in the repository. Amendments MUST follow the procedure:

1. Document the proposed change with rationale.
2. Verify no principle removals or backward-incompatible governance changes occur without a major version bump.
3. Confirm all dependent templates are updated before the amendment is ratified.
4. Ensure PHR is created for the amendment prompt.

Versioning policy: MAJOR = backward-incompatible principle removals or governance redefinitions; MINOR = new principle/section added or materially expanded guidance; PATCH = clarifications, wording fixes, non-semantic refinements.

Compliance review expectations: Every feature plan (`/sp.plan`) MUST include a Constitution Check referencing the updated principles. Every feature spec (`/specs/<feature>/spec.md`) MUST include user stories that can be independently tested. Every implementation (`/sp.implement`) MUST create a PHR.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): No prior adoption date found in repo; confirm original ratification date | **Last Amended**: 2026-09-03
