import { describe, expect, it } from "vitest";

import { MessagingService } from "../../src/services/messagingService";

describe("channelAuth", () => {
  const service = new MessagingService();

  it("signs and verifies a message with the shared channel secret", () => {
    const secret = "test-shared-secret";
    const message = service.createSignedMessage(
      {
        channel: "boss",
        fromNodeId: "boss-1",
        toNodeId: "worker-1",
        content: "Proceed with the task",
        kind: "instruction"
      },
      "boss-1",
      secret
    );

    expect(message.envelope).toBeDefined();
    expect(service.verifyMessage(message, secret)).toBe(true);
    expect(service.verifyMessage(message, "wrong-secret")).toBe(false);
  });
});