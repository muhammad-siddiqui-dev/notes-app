/* eslint-disable no-unused-vars */
import { Note, NoteCreateInput, NoteEditInput } from "../models/note";
import { validateNoteCreate, validateNoteEdit } from "../utils/validation";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/errors";
import { logNoteOperation } from "../middleware/logging";
import { db } from "../lib/db";

export interface NoteService {
  createNote(input: NoteCreateInput, userId: string): Promise<Note>;
  getNotes(userId: string, search?: string): Promise<Note[]>;
  getNoteById(id: string, userId: string): Promise<Note | null>;
  updateNote(id: string, userId: string, input: NoteEditInput): Promise<Note>;
  updateVisibility(id: string, userId: string, visible: boolean): Promise<Note>;
  updateFeatured(id: string, userId: string, featured: boolean): Promise<Note>;
}

export const noteService: NoteService = {
  createNote: async (input, userId) => {
    const validation = validateNoteCreate({ ...input, user_id: userId, visible: true, featured: false });
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(" "));
    }
    const result = await db.query(
      `INSERT INTO notes (id, user_id, title, content, created_at, updated_at, featured, visible) VALUES (gen_random_uuid(), $1, $2, $3, $4, $4, $5, $6) RETURNING *`,
      [userId, input.title, input.content, new Date(), false, true]
    );
    const note: Note = result.rows[0] as Note;
    logNoteOperation("create", userId, note.id, { title: note.title, visible: note.visible, featured: note.featured });
    return note;
  },

  getNotes: async (userId, search) => {
    // T041 — Basic search query logic framework verification (`GET /api/notes?search=...` service layer)
    // Contracts: contracts/notes-api.yaml (`GET`: `user_id` required; optional `search`; response visible `Note` array — 8 Digest fields)
    // Spec: `FR-005` (basic text filter on `title` + `content`); `SC-004` (<2s for 500 visible notes/user); `FR-003` (`visible = true` filter); `FR-006`/`FR-007` (full content / Digest fields); `FR-009` (user isolation); `FR-010` (structured logging)
    // Data model: `visible` excludes invisible; `featured` preserved; `updated_at` unchanged; full `content` preserved; `user_id` isolation enforced
    // Implementation: basic `ILIKE` filter (no FTS index — `Principle VI` simplicity); `visible = true` enforced at query level; `user_id` parameter bound; structured logging included (`FR-010`)
    let queryText = `SELECT * FROM notes WHERE user_id = $1 AND visible = true`;
    const params: (string | boolean | Date)[] = [userId];

    if (search && search.trim().length > 0) {
      queryText += ` AND (title ILIKE $2 OR content ILIKE $2)`;
      params.push(`%${search.trim()}%`);
    }
    queryText += ` ORDER BY updated_at DESC`;

    const result = await db.query(queryText, params);
    const notes: Note[] = result.rows as Note[];
    logNoteOperation("list", userId, undefined, { count: notes.length, search: search || null, visibleOnly: true });
    return notes;
  },

  getNoteById: async (id, userId) => {
    const result = await db.query(`SELECT * FROM notes WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (result.rows.length === 0) {
      throw new NotFoundError("Note");
    }
    return result.rows[0] as Note;
  },

  updateNote: async (id, userId, input) => {
    // Per data-model.md (`updated_at` updates on edit to title/content; unchanged by visibility/feature toggles — state transition assumption); Digest contract preserved (`FR-007`); last-write-wins conflict (`updated_at` timestamp — clarification Q4); structured logging applied (`FR-010` — timestamp/level/user_id/note_id/message/component)
    const validation = validateNoteEdit(input);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(" "));
    }
    const result = await db.query(
      `UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = $3 WHERE id = $4 AND user_id = $5 RETURNING *`,
      [input.title, input.content, new Date(), id, userId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("Note");
    }
    const note: Note = result.rows[0] as Note;
    logNoteOperation("edit", userId, note.id, { title: note.title, updatedAt: note.updated_at });
    return note;
  },

  updateVisibility: async (id, userId, visible) => {
    // Per data-model.md (`visible`: Boolean; `false` excludes note from digest; `updated_at` unchanged by visibility change — state transition assumption, not content edit); Digest exclusion verified (`FR-003`/`SC-003`); user isolation enforced (`FR-009` — OAuth2/user_id); structured logging applied (`FR-010`); conflict framework (`updated_at` unchanged — clarification Q4 — avoids false last-write-wins conflict)
    const result = await db.query(
      `UPDATE notes SET visible = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [visible, id, userId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("Note");
    }
    const note: Note = result.rows[0] as Note;
    logNoteOperation("visibility", userId, note.id, { visible: note.visible });
    return note;
  },

  updateFeatured: async (id, userId, featured) => {
    // Per data-model.md (`featured`: Boolean; `updated_at` unchanged — feature toggle is metadata change, not content edit); Digest ranking eligibility affects digest selection (`FR-004`/`SC-006`); user isolation (`FR-009`); structured logging (`FR-010`); conflict framework (`updated_at` unchanged — clarification Q4 — avoids false conflict detection)
    const result = await db.query(
      `UPDATE notes SET featured = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [featured, id, userId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("Note");
    }
    const note: Note = result.rows[0] as Note;
    logNoteOperation("feature", userId, note.id, { featured: note.featured });
    return note;
  }
};
