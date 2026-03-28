import { MessageEnvelope, MessageRecord } from "../domain/message";

export interface AuthStrategy {
  sign(record: Omit<MessageRecord, "envelope">, signerNodeId: string, credential?: string): MessageEnvelope;
  verify(record: MessageRecord, credential?: string): boolean;
}

export function buildAuthPayload(record: Omit<MessageRecord, "envelope">): string {
  return JSON.stringify({
    id: record.id,
    channel: record.channel,
    fromNodeId: record.fromNodeId,
    toNodeId: record.toNodeId,
    targetRole: record.targetRole,
    content: record.content,
    kind: record.kind,
    createdAt: record.createdAt
  });
}
