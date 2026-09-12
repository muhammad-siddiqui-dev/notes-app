import knex from 'knex';
import Database from 'better-sqlite3';
import { UserMapping } from './userMapping';

// Initialize PostgreSQL connection using existing knex config
const pgKnex = knes({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  useNullAsUndefined: true
});

// Initialize SQLite connection for Digest replica
const sqlite = new Database(':memory:', { readonly: false });

// Initialize SQLite tables for Digest replica
function initSQLite() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      visible INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS user_mapping (
      notes_user_id TEXT NOT NULL,
      digest_user_id INTEGER NOT NULL
    );
  `);

  // Initialize sync state if not exists
  const insertState = sqlite.prepare(
    `INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)`
  );
  insertState.run('last_sync', '0');
  insertState.run('last_change', '0');
}

// User mapping implementation
class SQLiteUserMapping implements UserMapping {
  constructor(private db: Database.Database) {}

  async getUserByExternalId(externalId: string): Promise<number | undefined> {
    const row = this.db.prepare(
      `SELECT digest_user_id FROM user_mapping WHERE notes_user_id = ?`
    ).get(externalId);
    return row ? row.digest_user_id : undefined;
  }

  async mapUser(externalId: string, digestUserId: number): Promise<void> {
    this.db.prepare(
      `INSERT OR REPLACE INTO user_mapping (notes_user_id, digest_user_id) VALUES (?, ?)`
    ).run(externalId, digestUserId);
  }

  async getMappedUserIds(): Promise<Array<{ sub: string; digestUserId: number }>> {
    const rows = this.db.prepare(
      `SELECT notes_user_id as sub, digest_user_id FROM user_mapping`
    ).all();
    return rows as Array<{ sub: string; digestUserId: number }>;
  }
}

// Initialize SQLite and user mapping
initSQLite();
const userMapping = new SQLiteUserMapping(sqlite);

// Incremental sync - get notes changed since last sync
async function incrementalSync(): Promise<{
  newNotes: number;
  updatedNotes: number;
  skippedNotes: number;
}> {
  // Get last sync timestamp from SQLite
  const getSyncState = sqlite.prepare(
    `SELECT value FROM sync_state WHERE key = 'last_sync'`
  );
  const lastSyncRow = getSyncState.get();
  const lastSync = lastSyncRow ? parseInt(lastSyncRow.value) : 0;

  // Get last change timestamp
  const getChangeState = sqlite.prepare(
    `SELECT value FROM sync_state WHERE key = 'last_change'`
  );
  const lastChangeRow = getChangeState.get();
  const lastChange = lastChangeRow ? parseInt(lastChangeRow.value) : 0;

  // Query PostgreSQL for notes changed since last_sync
  const pgNotes = await pgKnex('notes')
    .where('updated_at', '>', new Date(lastSync))
    .orderBy('updated_at', 'asc');

  // Upsert note into SQLite
  const upsertNote = sqlite.prepare(`
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at, featured, visible)
    VALUES ($id, $user_id, $title, $content, $created_at, $updated_at, $featured, $visible)
    ON CONFLICT(id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at,
      featured = EXCLUDED.featured,
      visible = EXCLUDED.visible
  `);

  let newNotes = 0;
  let updatedNotes = 0;
  let skippedNotes = 0;

  for (const pgNote of pgNotes) {
    const userId = pgNote.user_id;

    // Map Notes App user_id to Digest user_id via user mapping
    const digestUserId = await userMapping.getUserByExternalId(userId);
    if (digestUserId === undefined) {
      // Create a new mapping if not exists
      const newDigestUserId = Math.abs(
        parseInt(userId.substring(0, 8)),
        10
      ) % 1000 + 1;
      await userMapping.mapUser(userId, newDigestUserId);
    }

    // Serialize dates for SQLite
    const createdAt = pgNote.created_at instanceof Date
      ? pgNote.created_at.toISOString()
      : pgNote.created_at;
    const updatedAt = pgNote.updated_at instanceof Date
      ? pgNote.updated_at.toISOString()
      : pgNote.updated_at;

    upsertNote.run({
      $id: pgNote.id,
      $user_id: pgNote.user_id,
      $title: pgNote.title,
      $content: pgNote.content,
      $created_at: createdAt,
      $updated_at: updatedAt,
      $featured: pgNote.featured ? 1 : 0,
      $visible: pgNote.visible ? 1 : 0
    });

    // Track if this is a new or updated note
    if (pgNote.updated_at > new Date(lastChange)) {
      updatedNotes++;
    } else {
      skippedNotes++;
    }
    newNotes++;
  }

  // Update sync state
  const updateSyncState = sqlite.prepare(
    `INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)`
  );
  updateSyncState.run('last_sync', Date.now());
  updateSyncState.run('last_change', Date.now());

  return { newNotes, updatedNotes, skippedNotes };
}

// Full sync - transfer all notes from PostgreSQL to SQLite
async function fullSync(): Promise<{ totalNotes: number }> {
  // Get all notes from PostgreSQL
  const pgNotes = await pgKnex('notes');

  // Upsert each note into SQLite
  const upsertNote = sqlite.prepare(`
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at, featured, visible)
    VALUES ($id, $user_id, $title, $content, $created_at, $updated_at, $featured, $visible)
    ON CONFLICT(id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at,
      featured = EXCLUDED.featured,
      visible = EXCLUDED.visible
  `);

  for (const pgNote of pgNotes) {
    const userId = pgNote.user_id;

    // Map Notes App user_id to Digest user_id via user mapping
    const digestUserId = await userMapping.getUserByExternalId(userId);
    if (digestUserId === undefined) {
      const newDigestUserId = Math.abs(
        parseInt(userId.substring(0, 8)),
        10
      ) % 1000 + 1;
      await userMapping.mapUser(userId, newDigestUserId);
    }

    // Serialize dates for SQLite
    const createdAt = pgNote.created_at instanceof Date
      ? pgNote.created_at.toISOString()
      : pgNote.created_at;
    const updatedAt = pgNote.updated_at instanceof Date
      ? pgNote.updated_at.toISOString()
      : pgNote.updated_at;

    upsertNote.run({
      $id: pgNote.id,
      $user_id: pgNote.user_id,
      $title: pgNote.title,
      $content: pgNote.content,
      $created_at: createdAt,
      $updated_at: updatedAt,
      $featured: pgNote.featured ? 1 : 0,
      $visible: pgNote.visible ? 1 : 0
    });
  }

  // Update sync state
  const updateSyncState = sqlite.prepare(
    `INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)`
  );
  updateSyncState.run('last_sync', Date.now());
  updateSyncState.run('last_change', Date.now());

  const getTotal = sqlite.prepare('SELECT COUNT(*) FROM notes');
  const totalNotes = getTotal.get().COUNT;

  return { totalNotes };
}

// Verify SQLite data integrity
function verifySync(): {
  noteCount: number;
  sampleNote: any;
  userMappings: Array<{ notes_user_id: string; digest_user_id: number }>;
} {
  const getNoteCount = sqlite.prepare('SELECT COUNT(*) as count FROM notes');
  const noteCount = getNoteCount.get().count;

  const getNote = sqlite.prepare('SELECT * FROM notes LIMIT 1');
  const sampleNote = getNote.get();

  const getUserMap = sqlite.prepare(
    'SELECT * FROM user_mapping LIMIT 5'
  );
  const userMappings = getUserAll.all();

  return {
    noteCount,
    sampleNote,
    userMappings
  };
}

export { incrementalSync, fullSync, verifySync };