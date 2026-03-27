import { z } from "zod";

export const nodeRoleSchema = z.enum(["boss", "peer", "worker"]);
export type NodeRole = z.infer<typeof nodeRoleSchema>;

export const connectionStateSchema = z.enum(["online", "offline", "degraded", "unknown"]);
export type ConnectionState = z.infer<typeof connectionStateSchema>;

export const roleChannelSchema = z.object({
  channelName: z.string().min(1),
  roomIdEnv: z.string().min(1),
  secretEnv: z.string().min(1)
});

export type RoleChannel = z.infer<typeof roleChannelSchema>;

export const roleChannelMapSchema = z.object({
  boss: roleChannelSchema,
  peer: roleChannelSchema,
  worker: roleChannelSchema
});

export type RoleChannelMap = z.infer<typeof roleChannelMapSchema>;

export const nodeRecordSchema = z.object({
  nodeId: z.string().min(1),
  name: z.string().min(1),
  role: nodeRoleSchema,
  capabilities: z.array(z.string()).default([]),
  acceptsBossControl: z.boolean().default(false),
  connectionState: connectionStateSchema.default("unknown"),
  lastSeenAt: z.string().datetime().optional()
});

export type NodeRecord = z.infer<typeof nodeRecordSchema>;

export const childNodeReferenceSchema = z.object({
  nodeId: z.string().min(1),
  name: z.string().min(1),
  role: nodeRoleSchema,
  statusFile: z.string().min(1).optional(),
  summaryFile: z.string().min(1).optional()
});

export type ChildNodeReference = z.infer<typeof childNodeReferenceSchema>;