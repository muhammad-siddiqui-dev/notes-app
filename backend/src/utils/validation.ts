export interface NoteCreatePayload {
  title?: string;
  content?: string;
  user_id?: string;
  visible?: boolean;
  featured?: boolean;
}

export interface NoteEditPayload {
  title?: string;
  content?: string;
  visible?: boolean;
  featured?: boolean;
}

export const validateNoteCreate = (payload: NoteCreatePayload): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!payload.title || payload.title.trim().length === 0) {
    errors.push("Title is required and must not be empty.");
  }
  if (!payload.content) {
    errors.push("Content is required.");
  }
  if (!payload.user_id || payload.user_id.trim().length === 0) {
    errors.push("User identification (`user_id`) is required and must match the OAuth identity provider claim (FR-009, clarification Q1: OAuth2 selected).");
  }
  return { valid: errors.length === 0, errors };
};

export interface SearchQueryPayload {
  search?: string;
  user_id?: string;
}

export const validateSearchQuery = (payload: SearchQueryPayload): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // T045 — Search validation framework verification (`GET /api/notes?search=...`):
  // Per contracts/notes-api.yaml (`search`: optional string; `user_id`: required string); spec (`FR-005`/`SC-004`/`SC-003`); data-model.md (`visible` excludes invisible; full content preserved — `FR-006`/`FR-007`)
  // Search validation rules: empty query allowed (`search?.trim().length === 0` is valid); `search` must be string if provided; invisible notes excluded by endpoint query (`visible = true` filter enforced at service/query level — `FR-003`/`SC-003`); user isolation (`user_id`) required (`FR-009`)
  if (payload.search !== undefined && typeof payload.search !== "string") {
    errors.push("Search (`search`) must be a string value if provided.");
  }
  if (!payload.user_id || payload.user_id.trim().length === 0) {
    errors.push("User identification (`user_id`) is required and must match the OAuth identity provider claim (`FR-009`, clarification Q1: OAuth2 selected).");
  }
  return { valid: errors.length === 0, errors };
};

export const validateNoteEdit = (payload: NoteEditPayload): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (payload.title !== undefined && payload.title.trim().length === 0) {
    errors.push("Title must not be empty.");
  }
  if (payload.content !== undefined && payload.content.trim().length === 0 && payload.content !== "") {
    // Empty content allowed per data-model.md assumption; only reject if explicitly invalid
  }
  // Per `data-model.md`: edit updates `updated_at` (state transition: `updated_at` = now when `title`/`content` changes); visibility/feature toggles do not alter `updated_at` (state transition assumption — not content edit); Digest contract preserved (`updated_at` tracking — `FR-002`/`SC-002`; visibility exclusion — `FR-003`/`SC-003`; feature ranking — `FR-004`/`SC-006`)
  if (payload.visible !== undefined && typeof payload.visible !== "boolean") {
    errors.push("Visibility must be a boolean value.");
  }
  if (payload.featured !== undefined && typeof payload.featured !== "boolean") {
    errors.push("Featured must be a boolean value.");
  }
  return { valid: errors.length === 0, errors };
};
