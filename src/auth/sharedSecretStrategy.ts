import { createHmac, timingSafeEqual } from "node:crypto";
import { MessageEnvelope, MessageRecord } from "../domain/message";
import { AuthStrategy, buildAuthPayload } from "./authStrategy";

export class SharedSecretStrategy implements AuthStrategy {
  sign(record: Omit<MessageRecord, "envelope">, signerNodeId: string, credential?: string): MessageEnvelope {
    if (!credential) throw new Error("SharedSecretStrategy requires a shared secret as credential");
    
    const signedAt = new Date().toISOString();
    const payload = `${buildAuthPayload(record)}:${signerNodeId}:${signedAt}`;
    const signature = createHmac("sha256", credential).update(payload).digest("hex");

    return {
      signerNodeId,
      channel: record.channel,
      signedAt,
      signature,
      authMode: "shared_secret"
    };
  }

  verify(record: MessageRecord, credential?: string): boolean {
    if (!record.envelope || record.envelope.authMode !== "shared_secret") return false;
    if (!credential) return false;

    const { envelope, ...unsignedRecord } = record;
    const payload = `${buildAuthPayload(unsignedRecord)}:${envelope.signerNodeId}:${envelope.signedAt}`;
    const expected = createHmac("sha256", credential).update(payload).digest("hex");
    const provided = envelope.signature;

    if (expected.length !== provided.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(provided, "utf8"));
  }
}
