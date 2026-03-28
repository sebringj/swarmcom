import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export interface DbConfig {
  filePath: string;
}

export class DatabaseService {
  private db: Database.Database;

  constructor(config: DbConfig) {
    const absolutePath = resolve(config.filePath);
    const dir = dirname(absolutePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(absolutePath);
    this.db.pragma("journal_mode = WAL");
    this.runMigrations();
  }

  private runMigrations(): void {
    // Simple migration system for now.
    // In v0.2 this covers the initial schema requirements.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        role TEXT NOT NULL,
        room_id TEXT,
        payload TEXT NOT NULL,
        signature TEXT
      );

      CREATE TABLE IF NOT EXISTS status_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        node_id TEXT NOT NULL,
        state TEXT NOT NULL,
        summary TEXT NOT NULL,
        current_task TEXT,
        blockers TEXT,
        metadata TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_status_updates_created_at ON status_updates(created_at);
      CREATE INDEX IF NOT EXISTS idx_status_updates_node_id ON status_updates(node_id);
    `);
  }

  public getDb(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}
