import { createHmac, timingSafeEqual } from "node:crypto";

import { MessageEnvelope, MessageRecord } from "../domain/message";

function buildPayload(record: Omit<MessageRecord, "envelope">): string {
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

export function signMessageEnvelope(record: Omit<MessageRecord, "envelope">, signerNodeId: string, sharedSecret: string): MessageEnvelope {
  const signedAt = new Date().toISOString();
  const payload = `${buildPayload(record)}:${signerNodeId}:${signedAt}`;
  const signature = createHmac("sha256", sharedSecret).update(payload).digest("hex");

  return {
    signerNodeId,
    channel: record.channel,
    signedAt,
    signature
  };
}

export function verifyMessageEnvelope(record: MessageRecord, sharedSecret: string): boolean {
  if (!record.envelope) {
    return false;
  }

  const { envelope, ...unsignedRecord } = record;
  const payload = `${buildPayload(unsignedRecord)}:${envelope.signerNodeId}:${envelope.signedAt}`;
  const expected = createHmac("sha256", sharedSecret).update(payload).digest("hex");
  const provided = envelope.signature;

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(provided, "utf8"));
}