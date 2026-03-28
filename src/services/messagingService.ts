import { randomUUID } from "node:crypto";

import { MessageRecord, messageRecordSchema } from "../domain/message";
import { signMessageEnvelope, verifyMessageEnvelope } from "../utils/channelAuth";
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

  public createSignedMessage(input: Omit<MessageRecord, "id" | "createdAt" | "envelope">, signerNodeId: string, sharedSecret: string): MessageRecord {
    const base = this.createMessage(input);
    return messageRecordSchema.parse({
      ...base,
      envelope: signMessageEnvelope(base, signerNodeId, sharedSecret)
    });
  }

  public verifyMessage(record: MessageRecord, sharedSecret: string): boolean {
    return verifyMessageEnvelope(record, sharedSecret);
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
        record.senderId,
        record.role,
        roomId || null,
        JSON.stringify(record.payload),
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
      return rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        senderId: row.sender_id,
        role: row.role,
        payload: JSON.parse(row.payload),
        envelope: row.signature ? {
          signature: row.signature,
          algorithm: "HS256"
        } : undefined
      })) as MessageRecord[];
    } catch (err) {
      console.error("Failed to get messages from DB:", err);
      return [];
    }
  }
}