import { sign, verify } from "node:crypto";
import { MessageEnvelope, MessageRecord } from "../domain/message";
import { AuthStrategy, buildAuthPayload } from "./authStrategy";

export class Ed25519Strategy implements AuthStrategy {
  sign(record: Omit<MessageRecord, "envelope">, signerNodeId: string, privateKeyPem?: string): MessageEnvelope {
    if (!privateKeyPem) throw new Error("Ed25519Strategy requires a private key PEM as credential");
    
    const signedAt = new Date().toISOString();
    const payload = Buffer.from(`${buildAuthPayload(record)}:${signerNodeId}:${signedAt}`, "utf8");
    
    const signature = sign(null, payload, privateKeyPem).toString("base64");

    return {
      signerNodeId,
      channel: record.channel,
      signedAt,
      signature,
      authMode: "ed25519"
    };
  }

  verify(record: MessageRecord, publicKeyPem?: string): boolean {
    if (!record.envelope || record.envelope.authMode !== "ed25519") return false;
    if (!publicKeyPem) return false;

    const { envelope, ...unsignedRecord } = record;
    const payload = Buffer.from(`${buildAuthPayload(unsignedRecord)}:${envelope.signerNodeId}:${envelope.signedAt}`, "utf8");
    
    try {
      return verify(null, payload, publicKeyPem, Buffer.from(envelope.signature, "base64"));
    } catch (err) {
      return false;
    }
  }
}
