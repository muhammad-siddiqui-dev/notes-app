/* eslint-disable no-unused-vars */
// Frontend component: Note creation form framework (User Story 1 — P1 MVP)
// References contracts/notes-api.yaml (`NoteCreate`: title, content, user_id required; Note response: Digest-compatible fields)
// References spec.md (`FR-001`: create with defaults `visible=true`, `featured=false`; `SC-001`: under 5s; `FR-010`: structured logging)
// References data-model.md (Note entity: title required/non-empty; content full text preserved; user_id from OAuth; defaults visible=true/featured=false)
// References auth middleware (`auth.ts` — OAuth2 / user isolation — `FR-009` / clarification Q1)
// References structured logging middleware (`logging.ts` — `timestamp`/`level`/`user_id`/`note_id`/`message`/`component` — `FR-010` / Principle V)
// Design principle: simplicity (`Principle VI` — minimal form; basic input fields only; no unnecessary complexity; endpoint framework provides HTTP integration)

export interface NoteFormData {
  title: string;
  content: string;
  userId: string;
}

export interface NoteFormState {
  title: string;
  content: string;
  error: string | null;
  submitted: boolean;
}

export const initialFormState: NoteFormState = {
  title: "",
  content: "",
  error: null,
  submitted: false
};

export const validateFormInput = (title: string, content: string, userId?: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!title || title.trim().length === 0) {
    errors.push("Title is required and must not be empty.");
  }
  if (!content) {
    errors.push("Content is required.");
  }
  if (!userId || userId.trim().length === 0) {
    errors.push("User identification is required (OAuth2 / SSO provider claim).");
  }
  return { valid: errors.length === 0, errors };
};

export const formatNoteCreatePayload = (title: string, content: string, userId: string) => ({
  title: title.trim(),
  content: content.trim(),
  user_id: userId.trim(),
  visible: true,
  featured: false
});
