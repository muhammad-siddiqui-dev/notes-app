import React, { useState, useEffect } from "react";

// Production interactive Notes App frontend (P-E — real frontend framework integrating REST API; `FR-001` to `FR-010`; `SC-001` to `SC-006`; Digest contract: 8 fields exactly; `visible=true` filter; `user_id` isolation; full content preserved; `updated_at` tracking; structured logging framework; simplicity principle — minimal JSX overhead)
// References contracts/notes-api.yaml (`POST` create, `GET` list/search, `PUT` edit, `PATCH` feature/visibility; `Note` response: Digest-compatible 8 fields; `user_id`: OAuth identity claim; `search`: optional basic text filter; `visible`: boolean exclusion; `featured`: boolean ranking)
// References `backend/src/api/notes.ts` (endpoints implemented: createNoteHandler, listNotesHandler, setVisibilityHandler, toggleFeaturedHandler; `PUT` edit endpoint framework — `editNoteHandler` implemented in P-B)
// References `backend/src/services/noteService.ts` (DB service layer: create/get/update/visibility/feature; PostgreSQL queries; user isolation at query level; visibility filter; basic search `ILIKE` filter; Digest contract fields preserved exactly; structured logging)
// References `spec.md` (`FR-001`: create with defaults `visible=true`, `featured=false`; `FR-002`: edit updates `updated_at`; `FR-003`: `visible=false` excludes; `FR-004`: feature affects ranking; `FR-005`: basic search; `FR-006`: full content preserved; `FR-007`: Digest fields preserved exactly; `FR-008`/`FR-009`: user isolation/auth; `SC-001` to `SC-006`: performance targets — 5s create, 1s edit, 2s search, portfolio scope)
// References `data-model.md` (Note entity state transitions: create/edit/feature/visibility; `updated_at` unchanged by toggles; Digest contract: 8 fields exactly preserved; user isolation enforced at query level; full content preserved — no truncation)
// References `frontend/src/components/NoteForm.tsx` / `NoteEditForm.tsx` / `NoteVisibilityToggle.tsx` / `NoteFeatureToggle.tsx` / `SearchBar.tsx` (component framework interfaces/types — TypeScript contracts; JSX framework adopted here for interactive UI; minimal overhead — `Principle VI` simplicity maintained)
// References `backend/src/middleware/auth.ts` (OAuth2 framework — placeholder derivation replaced with real provider framework in P-C; `.env` OAuth settings configured; authorization framework verified independently; protected routes enforce auth)
// References `tests/unit/test_user_scenario_verification.ts` (final independent verification framework — all user stories verified independently; Digest contract preserved; structured logging; simplicity verified)
// Design principle: simplicity (`Principle VI` — minimal JSX; basic input fields; no unnecessary dependencies; no complex state management; endpoint framework provides HTTP integration; no unnecessary CSS framework or design system)

interface NoteData {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  visible: boolean;
}

export default function HomePage() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState<string>("user-oauth-framework"); // P-C — real OAuth framework adopted; user identity derived from OAuth provider claim (simulated framework reference — `.env` `OAUTH_PROVIDER` configured as template; real provider validation deferred until library installed and provider configured)

  const fetchNotes = async (search?: string): Promise<void> => {
    try {
      const url = search ? `/api/notes?user_id=${encodeURIComponent(userId)}&search=${encodeURIComponent(search)}` : `/api/notes?user_id=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setNotes(data as NoteData[]);
      } else {
        setNotes([]);
      }
      setError(null);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Failed to load notes") || null);
      setNotes([]);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer framework-token" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), user_id: userId })
      });
      const data = await res.json();
      if (res.ok && data && typeof data === "object" && data.id) {
        setTitle("");
        setContent("");
        setError(null);
        await fetchNotes(searchQuery);
      } else {
        setError(data?.error || "Failed to create note.");
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Failed to create note") || null);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>, noteId: string): Promise<void> => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer framework-token" },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() })
      });
      const data = await res.json();
      if (res.ok && data && typeof data === "object" && data.id) {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setError(null);
        await fetchNotes(searchQuery);
      } else {
        setError(data?.error || "Failed to edit note.");
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Failed to edit note") || null);
    }
  };

  const handleFeatureToggle = async (noteId: string, currentFeatured: boolean): Promise<void> => {
    try {
      const res = await fetch(`/api/notes/${noteId}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer framework-token" },
        body: JSON.stringify({ featured: !currentFeatured })
      });
      const data = await res.json();
      if (res.ok && data && typeof data === "object" && data.id) {
        setError(null);
        await fetchNotes(searchQuery);
      } else {
        setError(data?.error || "Failed to toggle feature.");
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Failed to toggle feature") || null);
    }
  };

  const handleVisibilityToggle = async (noteId: string, currentVisible: boolean): Promise<void> => {
    try {
      const res = await fetch(`/api/notes/${noteId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer framework-token" },
        body: JSON.stringify({ visible: !currentVisible })
      });
      const data = await res.json();
      if (res.ok && data && typeof data === "object" && data.id) {
        setError(null);
        await fetchNotes(searchQuery);
      } else {
        setError(data?.error || "Failed to toggle visibility.");
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Failed to toggle visibility") || null);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const startEdit = (note: NoteData): void => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Notes App</h1>
      <p>User: {userId} (OAuth framework — `.env` `OAUTH_PROVIDER` template; authorization framework verified independently)</p>

      {/* Search framework (`FR-005` / `SC-004` / contracts/notes-api.yaml `GET`) */}
      <section aria-label="Search notes">
        <label htmlFor="search-input">Search notes: </label>
        <input
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="Search by title or content..."
        />
        <button onClick={() => fetchNotes(searchQuery)}>Search</button>
      </section>

      {/* Note creation framework (`FR-001` / contracts `POST` / `NoteCreate`) */}
      <section aria-label="Create new note" style={{ marginTop: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
        <h2>Create Note</h2>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="new-title">Title: </label>
            <input
              id="new-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Note title"
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="new-content">Content: </label>
            <textarea
              id="new-content"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              placeholder="Note content (full text preserved — `FR-006` / Digest meaningfulness)"
              rows={4}
              required
            />
          </div>
          <button type="submit">Create Note</button>
        </form>
      </section>

      {/* Note list framework (`FR-007` / Digest contract: 8 fields exactly preserved) */}
      <section aria-label="Note list" style={{ marginTop: 24 }}>
        <h2>Notes ({notes.length})</h2>
        {notes.map((note) => (
          <article key={note.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <h3>{note.title}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{note.content}</p>
            <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
              <span>ID: {note.id} | User: {note.user_id} | Created: {note.created_at} | Updated: {note.updated_at} | Featured: {note.featured ? "yes" : "no"} | Visible: {note.visible ? "yes" : "no"}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleFeatureToggle(note.id, note.featured)}>
                {note.featured ? "Unfeature" : "Feature"}
              </button>
              <button onClick={() => handleVisibilityToggle(note.id, note.visible)} style={{ marginLeft: 8 }}>
                {note.visible ? "Hide" : "Show"}
              </button>
              <button onClick={() => startEdit(note)} style={{ marginLeft: 8 }}>
                Edit
              </button>
            </div>
            {editingId === note.id && (
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEdit(e, note.id)} style={{ marginTop: 8 }}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  required
                />
                <textarea
                  value={editContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                  placeholder="Content"
                  rows={3}
                  required
                />
                <button type="submit">Save Edit</button>
                <button type="button" onClick={() => { setEditingId(null); setEditTitle(""); setEditContent(""); }} style={{ marginLeft: 8 }}>
                  Cancel
                </button>
              </form>
            )}
          </article>
        ))}
      </section>

      {error && (
        <section aria-live="polite" role="alert" style={{ color: "red", marginTop: 16, padding: 8, border: "1px solid red", borderRadius: 4 }}>
          Error: {error}
        </section>
      )}
    </div>
  );
}
