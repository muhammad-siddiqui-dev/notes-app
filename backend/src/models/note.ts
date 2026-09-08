export interface Note {
  id: string; // UUID / PK — Digest contract
  user_id: string; // FK/user isolation — Digest contract; OAuth identity claim
  title: string;
  content: string; // Full text preserved — Digest meaningfulness (FR-006)
  created_at: Date; // ISO timestamp — Digest sequencing
  updated_at: Date; // Updated on edit — Digest change detection
  featured: boolean; // Default false — Digest ranking
  visible: boolean; // Default true; false excludes from digest (FR-003)
}

export interface NoteCreateInput {
  title: string;
  content: string;
  user_id: string;
}

export interface NoteEditInput {
  title?: string;
  content?: string;
}

export const NoteDefaults = {
  featured: false,
  visible: true,
} as const;
