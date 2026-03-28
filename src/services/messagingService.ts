import { randomUUID } from "node:crypto";

import { MessageRecord, messageRecordSchema } from "../domain/message";
import { AuthFactory, AuthMode } from "../auth/authFactory";
import { DatabaseService } from "../db/database";

export class MessagingService {
  private dbService?: DatabaseService;

  constructor(dbService?: DatabaseService) {
    this.dbService = dbService;
  }

  public createMessage(input: Omit<MessageRecord, "id" | "createdAt">): MessageRecord {
    return messageRecordSchema.parse({
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    });
  }

  public createSignedMessage(
    input: Omit<MessageRecord, "id" | "createdAt" | "envelope">, 
    signerNodeId: string, 
    credential?: string,
    authMode: AuthMode = "shared_secret"
  ): MessageRecord {
    const base = this.createMessage(input);
    const strategy = AuthFactory.create(authMode);
    
    return messageRecordSchema.parse({
      ...base,
      envelope: strategy.sign(base, signerNodeId, credential)
    });
  }

  public verifyMessage(record: MessageRecord, credential?: string): boolean {
    if (!record.envelope) return false;
    const authMode = (record.envelope.authMode as AuthMode) || "shared_secret";
    const strategy = AuthFactory.create(authMode);
    return strategy.verify(record, credential);
  }

  public storeMessage(record: MessageRecord, roomId?: string): void {
    if (!this.dbService) return;
    
    try {
      const stmt = this.dbService.getDb().prepare(`
        INSERT OR IGNORE INTO messages (id, created_at, sender_id, role, room_id, payload, signature)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.id,
        record.createdAt,
        record.fromNodeId,
        record.targetRole || null,
        roomId || null,
        JSON.stringify(record),
        record.envelope?.signature || null
      );
    } catch (err) {
      console.error("Failed to store message in DB:", err);
    }
  }

  public getMessages(): MessageRecord[] {
    if (!this.dbService) return [];
    
    try {
      const stmt = this.dbService.getDb().prepare(`
        SELECT * FROM messages ORDER BY created_at DESC LIMIT 100
      `);
      const rows = stmt.all() as any[];
      return rows.map((row) => JSON.parse(row.payload)) as MessageRecord[];
    } catch (err) {
      console.error("Failed to get messages from DB:", err);
      return [];
    }
  }
}