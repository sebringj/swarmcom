import jwt from "jsonwebtoken";
import { MessageEnvelope, MessageRecord } from "../domain/message";
import { AuthStrategy, buildAuthPayload } from "./authStrategy";

export class JwtStrategy implements AuthStrategy {
  sign(record: Omit<MessageRecord, "envelope">, signerNodeId: string, privateKeyOrSecret?: string): MessageEnvelope {
    if (!privateKeyOrSecret) throw new Error("JwtStrategy requires a key or secret as credential");
    
    const signedAt = new Date().toISOString();
    const payloadStr = `${buildAuthPayload(record)}:${signerNodeId}:${signedAt}`;
    
    // We sign the deterministic payload hash into the JWT to prevent tampering
    const token = jwt.sign({ data: payloadStr, signerNodeId }, privateKeyOrSecret, {
      algorithm: privateKeyOrSecret.includes("BEGIN") ? "RS256" : "HS256",
      expiresIn: "5m" // Envelopes represent a point in time creation
    });

    return {
      signerNodeId,
      channel: record.channel,
      signedAt,
      signature: token, // the signature is the whole JWT
      authMode: "jwt"
    };
  }

  verify(record: MessageRecord, publicKeyOrSecret?: string): boolean {
    if (!record.envelope || record.envelope.authMode !== "jwt") return false;
    if (!publicKeyOrSecret) return false;

    const { envelope, ...unsignedRecord } = record;
    const payloadStr = `${buildAuthPayload(unsignedRecord)}:${envelope.signerNodeId}:${envelope.signedAt}`;

    try {
      const decoded = jwt.verify(envelope.signature, publicKeyOrSecret, {
        algorithms: ["HS256", "RS256"]
      }) as any;
      
      // Verify the payload data string hasn't been tampered with
      return decoded.data === payloadStr && decoded.signerNodeId === envelope.signerNodeId;
    } catch (err) {
      return false;
    }
  }
}
