// Frontend component: Basic search UI framework (User Story 3 — P3 priority; T43)
// References contracts/notes-api.yaml (`GET /api/notes`: optional `search` query string; response array of visible `Note` objects — Digest-compatible)
// References specs/001-notes-core/spec.md (`FR-005`: basic text filter on `title`/`content`; `SC-004`: <2s for 500 notes; `SC-003`: invisible excluded; `SC-005`: full content preserved; `FR-007`: Digest fields; `FR-009`/`FR-010`)
// References data-model.md (`visible`: Boolean excludes invisible; `featured`: Boolean; `updated_at`: unchanged by search; Digest contract preserved exactly — 8 fields)
// References endpoint framework (`GET /api/notes?search=...` — `notes.ts` — T40 endpoint framework; service layer `getNotes` — T41; middleware `auth.ts` — OAuth2/user isolation; `logging.ts` — structured JSON)
// Design principle: simplicity (`Principle VI` — minimal search input; basic query only; no FTS or complex UI; endpoint framework provides HTTP integration)

export interface SearchBarData {
  searchQuery: string;
  userId?: string; // OAuth identity claim (`FR-009`)
}

export interface SearchBarState {
  query: string;
  submitted: boolean;
  error: string | null;
}

export const initialSearchState: SearchBarState = {
  query: "",
  submitted: false,
  error: null
};

export const validateSearchInput = (query?: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // Per contracts/notes-api.yaml (`search`: optional string) and spec (`FR-005`): empty query allowed; no complex validation needed
  if (query !== undefined && typeof query !== "string") {
    errors.push("Search query (`search`) must be a string value.");
  }
  return { valid: errors.length === 0, errors };
};

export const formatSearchPayload = (query: string) => ({
  search: query.trim()
});
