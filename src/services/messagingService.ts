import { randomUUID } from "node:crypto";

import { MessageRecord, messageRecordSchema } from "../domain/message";
import { signMessageEnvelope, verifyMessageEnvelope } from "../utils/channelAuth";

export class MessagingService {
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
}