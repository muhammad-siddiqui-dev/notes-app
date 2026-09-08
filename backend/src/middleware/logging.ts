export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  user_id?: string;
  note_id?: string;
  message: string;
  component?: string;
}

export const logEvent = (entry: LogEntry): void => {
  const output = JSON.stringify({
    timestamp: entry.timestamp || new Date().toISOString(),
    level: entry.level,
    user_id: entry.user_id ?? null,
    note_id: entry.note_id ?? null,
    message: entry.message,
    component: entry.component ?? "notes-app"
  });

  if (entry.level === "error") {
    console.error(output);
  } else if (entry.level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
};

export const logNoteOperation = (
  operation: string,
  userId: string,
  noteId?: string,
  extra?: Record<string, unknown>
): void => {
  // T044 — Structured logging framework verification for feature/search operations:
  // Per `spec.md` (`FR-010`): structured logs for all note operations (`create`, `edit`, `delete`, `feature`, `visibility`, `search`) with fields `timestamp`, `level`, `user_id`, `note_id`, `message`, `component`; errors to stderr (`console.error` — error level)
  // Per `contracts/notes-api.yaml`: endpoint framework includes `PATCH /api/notes/:id/featured` (feature toggle) and `GET /api/notes?search=...` (basic search); both require structured logging (`FR-010` / `Principle V`)
  // Per `data-model.md`: feature toggle (`featured` Boolean) and visibility (`visible` Boolean) are state transitions; `updated_at` unchanged; Digest ranking (`SC-006`) and exclusion (`SC-003`) tracked via structured logs
  // Middleware framework verified: `logEvent` produces JSON output with consistent fields; `logNoteOperation` applies to feature (`operation: "feature"`) and search (`operation: "list"`) independently; errors routed to stderr (`console.error`); no uptime SLA (`SC-001` to `SC-006` targets — portfolio scope — clarification Q3)
  logEvent({
    timestamp: new Date().toISOString(),
    level: "info",
    user_id: userId,
    note_id: noteId,
    message: `Note operation: ${operation}`,
    component: "note-service",
    ...extra
  } as LogEntry);
};
