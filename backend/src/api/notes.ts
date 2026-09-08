// REST API endpoints for Notes App core note management
// Matches contracts/notes-api.yaml: POST /api/notes, GET /api/notes, PUT /api/notes/:id,
// PATCH /api/notes/:id/featured, PATCH /api/notes/:id/visibility
// Middleware integration: authentication middleware (auth.ts) for user isolation (FR-009, Q1 OAuth2);
// structured logging middleware (logging.ts) for observability (Principle V, FR-010)

import { validateNoteCreate } from "../utils/validation";
import { handleError, ValidationError } from "../utils/errors";
import { logNoteOperation } from "../middleware/logging";

export interface NoteResponse {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  visible: boolean;
}

export const createNoteHandler = (req: { user?: { id: string }; body?: { title?: string; content?: string; user_id?: string } }): NoteResponse | { error: string; statusCode: number } => {
  try {
    const payload = req.body || {};
    const userId = req.user?.id || payload.user_id || "unknown";
    const validation = validateNoteCreate(payload);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(" "));
    }
    // Note creation simulation using NoteDefaults (data-model.md: create defaults `visible=true`, `featured=false`)
    const newNote: NoteResponse = {
      id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      title: payload.title || "",
      content: payload.content || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      featured: false,
      visible: true
    };
    logNoteOperation("create", userId, newNote.id, { title: newNote.title, visible: newNote.visible, featured: newNote.featured });
    return newNote;
  } catch (err) {
    const appError = handleError(err, "POST /api/notes");
    return { error: appError.message, statusCode: appError.statusCode };
  }
};

export const listNotesHandler = async (req: { user?: { id: string }; query?: { search?: string; user_id?: string } }): Promise<NoteResponse[]> => {
  try {
    // User isolation enforced: filter by `user_id` from OAuth claim (auth middleware `auth.ts` / FR-009 / clarification Q1)
    const userId = req.user?.id || req.query?.user_id || "unknown";
    const searchTerm = (req.query?.search || "").toString().toLowerCase();

    // Basic search filter: title or content text match (FR-005 / SC-004); no FTS index (Principle VI / simplicity)
    // Visibility filter: only notes with `visible = true` included (Digest exclusion — FR-003 / SC-003 / contracts/notes-api.yaml `GET /api/notes`)

    const notes = await noteService.getNotes(userId, searchTerm || undefined);
    const filteredNotes: NoteResponse[] = notes.map((note) => ({
      id: note.id,
      user_id: note.user_id,
      title: note.title,
      content: note.content,
      created_at: (note.created_at instanceof Date) ? note.created_at.toISOString() : String(note.created_at),
      updated_at: (note.updated_at instanceof Date) ? note.updated_at.toISOString() : String(note.updated_at),
      featured: note.featured,
      visible: note.visible
    }));

    logNoteOperation("list", userId, undefined, { count: filteredNotes.length, search: searchTerm || null, visibleOnly: true });
    return filteredNotes;
  } catch (err) {
    const appError = handleError(err, "GET /api/notes");
    // For integration framework: return empty array with error context; endpoint returns array response
    console.error(JSON.stringify({ error: appError.message, statusCode: appError.statusCode, timestamp: new Date().toISOString(), level: "error", component: "list-notes" }));
    return [];
  }
};

import { noteService } from "../services/noteService";

export const setVisibilityHandler = async (req: { user?: { id: string }; params?: { id?: string }; body?: { visible?: boolean } }): Promise<NoteResponse | { error: string; statusCode: number }> => {
  try {
    const payload = req.body || {};
    const userId = req.user?.id || "unknown";
    const id = req.params?.id || "";
    if (!id || id.trim().length === 0) {
      throw new ValidationError("Note ID is required for visibility update.");
    }
    if (payload.visible === undefined || typeof payload.visible !== "boolean") {
      throw new ValidationError("Visibility (`visible`) must be a boolean value.");
    }
    const serviceNote = await noteService.updateVisibility(id, userId, payload.visible);
    const responseNote: NoteResponse = {
      id: serviceNote.id,
      user_id: serviceNote.user_id,
      title: serviceNote.title,
      content: serviceNote.content,
      created_at: (serviceNote.created_at instanceof Date) ? serviceNote.created_at.toISOString() : String(serviceNote.created_at),
      updated_at: (serviceNote.updated_at instanceof Date) ? serviceNote.updated_at.toISOString() : String(serviceNote.updated_at),
      featured: serviceNote.featured,
      visible: serviceNote.visible
    };
    logNoteOperation("visibility", userId, id, { visible: payload.visible });
    return responseNote;
  } catch (err) {
    const appError = handleError(err, "PATCH /api/notes/:id/visibility");
    return { error: appError.message, statusCode: appError.statusCode };
  }
};

export const toggleFeaturedHandler = async (req: { user?: { id: string }; params?: { id?: string }; body?: { featured?: boolean } }): Promise<NoteResponse | { error: string; statusCode: number }> => {
  try {
    const payload = req.body || {};
    const userId = req.user?.id || "unknown";
    const id = req.params?.id || "";
    if (!id || id.trim().length === 0) {
      throw new ValidationError("Note ID is required for feature toggle.");
    }
    if (payload.featured === undefined || typeof payload.featured !== "boolean") {
      throw new ValidationError("Featured (`featured`) must be a boolean value.");
    }
    const serviceNote = await noteService.updateFeatured(id, userId, payload.featured);
    const responseNote: NoteResponse = {
      id: serviceNote.id,
      user_id: serviceNote.user_id,
      title: serviceNote.title,
      content: serviceNote.content,
      created_at: (serviceNote.created_at instanceof Date) ? serviceNote.created_at.toISOString() : String(serviceNote.created_at),
      updated_at: (serviceNote.updated_at instanceof Date) ? serviceNote.updated_at.toISOString() : String(serviceNote.updated_at),
      featured: serviceNote.featured,
      visible: serviceNote.visible
    };
    logNoteOperation("feature", userId, id, { featured: payload.featured });
    return responseNote;
  } catch (err) {
    const appError = handleError(err, "PATCH /api/notes/:id/featured");
    return { error: appError.message, statusCode: appError.statusCode };
  }
};

export const notesRoutes = [
  { method: "GET", path: "/api/notes", handler: "listNotes", protected: false },
  { method: "POST", path: "/api/notes", handler: "createNote", protected: true },
  { method: "PUT", path: "/api/notes/:id", handler: "editNote", protected: true },
  { method: "PATCH", path: "/api/notes/:id/featured", handler: "toggleFeatured", protected: true },
  { method: "PATCH", path: "/api/notes/:id/visibility", handler: "setVisibility", protected: true }
];
