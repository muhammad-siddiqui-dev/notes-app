/* eslint-disable no-unused-vars */
// Frontend component: Visibility/soft-delete toggle framework (US2 — P2 priority; T32)
// References contracts/notes-api.yaml (`PATCH /api/notes/:id/visibility`: `visible` boolean payload; Note response schema — Digest fields preserved exactly — `FR-003`/`SC-003`)
// References specs/001-notes-core/spec.md (`FR-003`: soft-delete excludes invisible notes from digest; `SC-003`: invisible excluded from list/digest; `FR-009`: auth/user isolation; `FR-010`: structured logging; clarification Q4: last-write-wins by `updated_at` — visibility change does not alter `updated_at` — `data-model.md` state transition assumption)
// References data-model.md (`visible`: Boolean; `updated_at`: unchanged by visibility — state transition; Digest exclusion verified)
// References endpoint framework (`PATCH /api/notes/:id/visibility` — `notes.ts` — endpoint framework; service layer `updateVisibility` — T19 + T30 updates; middleware `auth.ts` — OAuth2/user isolation; `logging.ts` — structured JSON logs; `validation.ts` — boolean `visible` check; `errors.ts` — consistent 400/404/500 responses)
// Design principle: simplicity (`Principle VI` — minimal framework, no JSX overhead, pure TypeScript interfaces/types, no unnecessary dependencies, endpoint framework provides HTTP endpoint — `PATCH` endpoint exists — `notes.ts` — T28 visibility endpoint framework fully implemented)

export interface NoteVisibilityFormData {
  noteId: string;
  visible: boolean;
  userId?: string; // From OAuth identity claim (`auth.ts` — `FR-009` / clarification Q1)
}

export interface NoteVisibilityFormState {
  noteId: string | null;
  visible: boolean;
  error: string | null;
  submitted: boolean;
}

export const initialVisibilityFormState: NoteVisibilityFormState = {
  noteId: null,
  visible: true,
  error: null,
  submitted: false
};

export const validateVisibilityInput = (visible?: boolean): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // Per contracts/notes-api.yaml (`PATCH` payload: `{ visible: boolean }`) and data-model.md (`visible`: Boolean; `false` excludes from digest)
  if (visible !== undefined && typeof visible !== "boolean") {
    errors.push("Visibility (`visible`) must be a boolean value.");
  }
  return { valid: errors.length === 0, errors };
};

export const formatVisibilityPayload = (noteId: string, visible: boolean) => ({
  id: noteId,
  visible: visible
});
