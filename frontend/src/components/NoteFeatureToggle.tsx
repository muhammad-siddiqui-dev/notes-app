// Frontend component: Feature/unfeature toggle framework (User Story 3 — P3 priority; T42)
// References contracts/notes-api.yaml (`PATCH /api/notes/:id/featured`: `{ featured: boolean }` payload; `Note` response: Digest-compatible fields — `FR-007`)
// References specs/001-notes-core/spec.md (`FR-004`: set `featured` true/false; `SC-006`: feature toggle reflects for Digest ranking; `SC-003`/`SC-005`: visibility/content preserved; `FR-009`: OAuth/user isolation; `FR-010`: structured logging)
// References data-model.md (`featured`: Boolean; default `false`; affects digest ranking; `updated_at`: unchanged by feature toggle — state transition assumption — not content edit; Digest contract preserved exactly — 8 Digest fields)
// References endpoint framework (`PATCH /api/notes/:id/featured` — `notes.ts` — T39 endpoint framework fully implemented; service layer `updateFeatured` — T30 updates; middleware `auth.ts` — OAuth2/user isolation; `logging.ts` — structured JSON; `validation.ts` — boolean `featured` check; `errors.ts` — consistent responses)
// Design principle: simplicity (`Principle VI` — minimal component; basic toggle interface; no unnecessary JSX overhead; endpoint framework provides HTTP integration)

export interface NoteFeatureToggleData {
  noteId: string;
  featured: boolean;
  userId?: string; // From OAuth identity claim (`auth.ts` — `FR-009` / clarification Q1)
}

export interface NoteFeatureToggleState {
  noteId: string | null;
  featured: boolean;
  error: string | null;
  submitted: boolean;
}

export const initialFeatureToggleState: NoteFeatureToggleState = {
  noteId: null,
  featured: false,
  error: null,
  submitted: false
};

export const validateFeatureToggleInput = (featured?: boolean): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // Per contracts/notes-api.yaml (`PATCH` payload: `{ featured: boolean }`) and data-model.md (`featured`: Boolean; affects digest ranking; default `false`)
  if (featured !== undefined && typeof featured !== "boolean") {
    errors.push("Featured (`featured`) must be a boolean value.");
  }
  return { valid: errors.length === 0, errors };
};

export const formatFeatureTogglePayload = (noteId: string, featured: boolean) => ({
  id: noteId,
  featured: featured
});
