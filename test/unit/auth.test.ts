import { describe, expect, it } from "vitest";

import { MessageRecord } from "../../src/domain/message";
import { MessagingService } from "../../src/services/messagingService";
import { generateKeyPairSync } from "node:crypto";

describe("MessagingService Auth", () => {
  const service = new MessagingService();

  const baseInput = {
    channel: "boss_channel",
    fromNodeId: "worker-1",
    content: "Task complete",
    kind: "message" as const
  };

  it("should securely sign and verify envelopes using shared_secret mode", () => {
    const secret = "super-secret-key";
    const signed = service.createSignedMessage(baseInput, "worker-1", secret, "shared_secret");

    expect(signed.envelope).toBeDefined();
    expect(signed.envelope?.signerNodeId).toBe("worker-1");
    expect(signed.envelope?.authMode).toBe("shared_secret");

    const isValid = service.verifyMessage(signed, secret);
    expect(isValid).toBe(true);

    const isInvalid = service.verifyMessage(signed, "wrong-secret");
    expect(isInvalid).toBe(false);

    const tampered = {
      ...signed,
      content: "Task modified" // Mismatch payload vs signature
    } as MessageRecord;

    const isTamperedValid = service.verifyMessage(tampered, secret);
    expect(isTamperedValid).toBe(false);
  });

  it("should securely sign and verify envelopes using ed25519 mode", () => {
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const privPem = privateKey.export({ type: "pkcs8", format: "pem" }) as string;
    const pubPem = publicKey.export({ type: "spki", format: "pem" }) as string;

    const signed = service.createSignedMessage(baseInput, "worker-1", privPem, "ed25519");

    expect(signed.envelope).toBeDefined();
    expect(signed.envelope?.signerNodeId).toBe("worker-1");
    expect(signed.envelope?.authMode).toBe("ed25519");

    const isValid = service.verifyMessage(signed, pubPem);
    expect(isValid).toBe(true);

    const isInvalid = service.verifyMessage(signed, "wrong-key");
    expect(isInvalid).toBe(false);

    // Provide another valid keypair but not the matching one
    const pair2 = generateKeyPairSync("ed25519");
    const pubPem2 = pair2.publicKey.export({ type: "spki", format: "pem" }) as string;
    expect(service.verifyMessage(signed, pubPem2)).toBe(false);
  });

  it("should securely sign and verify envelopes using jwt mode", () => {
    const secret = "jwt-secret";
    const signed = service.createSignedMessage(baseInput, "worker-1", secret, "jwt");

    expect(signed.envelope).toBeDefined();
    expect(signed.envelope?.signerNodeId).toBe("worker-1");
    expect(signed.envelope?.authMode).toBe("jwt");

    const isValid = service.verifyMessage(signed, secret);
    expect(isValid).toBe(true);

    const isInvalid = service.verifyMessage(signed, "wrong-secret");
    expect(isInvalid).toBe(false);
  });
});
