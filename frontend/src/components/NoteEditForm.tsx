/* eslint-disable no-unused-vars */
// Frontend component: Note edit interface framework (User Story 2 — P2: edit interface / edit journey — T21)
// References contracts/notes-api.yaml (`PUT /api/notes/:id` with `NoteEdit`: optional title/content; response `Note` with Digest fields preserved)
// References specs/001-notes-core/data-model.md (edit updates `updated_at`; `visible`/`featured` unchanged by edit — state transition assumption; Digest fields preserved exactly)
// References spec.md (`FR-002`: edit updates `updated_at`; `FR-007`: Digest compatibility fields preserved; clarification Q4: last-write-wins by `updated_at` timestamp for concurrent edits)
// References auth middleware (`auth.ts` — OAuth2 / user isolation — `FR-009`, clarification Q1)
// References structured logging middleware (`logging.ts` — `timestamp`/`level`/`user_id`/`note_id`/`message`/`component` — `FR-010`, Principle V)
// References errors framework (`errors.ts` — `ValidationError` 400, `NotFoundError` 404, `InternalServerError` 500 — secure messages without exposing internals)
// Design principle: simplicity (`Principle VI` — minimal component framework; no JSX overhead; interfaces/types only; no unnecessary complexity; endpoint framework `PUT /api/notes/:id` provides HTTP endpoint — `T28` deferred)

export interface NoteEditFormData {
  id?: string; // Note ID for PUT endpoint (`/api/notes/:id`)
  title?: string; // Optional — `NoteEdit` schema allows optional title (`contracts/notes-api.yaml`)
  content?: string; // Optional — `NoteEdit` schema allows optional content
  userId?: string; // Derived from OAuth2 identity claim (`auth.ts` / `FR-009`)
}

export interface NoteEditFormState {
  id: string | null;
  title: string;
  content: string;
  error: string | null;
  submitted: boolean;
  updatedAt: string | null; // Tracks edit submission time (`updated_at` — `data-model.md` / `SC-002`)
}

export const initialEditFormState: NoteEditFormState = {
  id: null,
  title: "",
  content: "",
  error: null,
  submitted: false,
  updatedAt: null
};

export const validateEditInput = (title?: string, content?: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // Per data-model.md validation rules: title required/non-empty for edit; content optional but preserved fully (`FR-006`)
  if (title !== undefined && title.trim().length === 0) {
    errors.push("Title must not be empty.");
  }
  // Note: content is optional per `NoteEdit` schema but if provided must be preserved fully (`FR-006` / Digest meaningfulness)
  return { valid: errors.length === 0, errors };
};

export const formatEditPayload = (id: string, title?: string, content?: string) => {
  return {
    id,
    title: title?.trim(),
    content: content?.trim()
  };
};
