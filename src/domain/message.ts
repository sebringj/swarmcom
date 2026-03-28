import { z } from "zod";

export const messageKindSchema = z.enum(["message", "instruction", "artifact"]);
export type MessageKind = z.infer<typeof messageKindSchema>;

export const messageEnvelopeSchema = z.object({
  signerNodeId: z.string().min(1),
  channel: z.string().min(1),
  signedAt: z.string().datetime(),
  signature: z.string().min(1),
  authMode: z.enum(["shared_secret", "ed25519", "jwt"]).default("shared_secret")
});

export type MessageEnvelope = z.infer<typeof messageEnvelopeSchema>;

export const messageRecordSchema = z.object({
  id: z.string().min(1),
  channel: z.string().min(1),
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1).optional(),
  targetRole: z.enum(["boss", "peer", "worker"]).optional(),
  content: z.string().min(1),
  kind: messageKindSchema.default("message"),
  createdAt: z.string().datetime(),
  envelope: messageEnvelopeSchema.optional()
});

export type MessageRecord = z.infer<typeof messageRecordSchema>;