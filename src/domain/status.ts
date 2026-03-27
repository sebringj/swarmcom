import { z } from "zod";

export const statusStateSchema = z.enum(["idle", "busy", "blocked", "offline"]);
export type StatusState = z.infer<typeof statusStateSchema>;

export const statusSnapshotSchema = z.object({
  nodeId: z.string().min(1),
  summary: z.string().min(1),
  state: statusStateSchema,
  currentTask: z.string().optional(),
  blockers: z.array(z.string()).default([]),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export type StatusSnapshot = z.infer<typeof statusSnapshotSchema>;

export const statusHistoryEntrySchema = statusSnapshotSchema.extend({
  recordedAt: z.string().datetime()
});

export type StatusHistoryEntry = z.infer<typeof statusHistoryEntrySchema>;

export const nodeSummarySchema = z.object({
  nodeId: z.string().min(1),
  summary: z.string().min(1),
  state: statusStateSchema,
  updatedAt: z.string().datetime(),
  childCount: z.number().int().nonnegative().default(0),
  blockedChildren: z.number().int().nonnegative().default(0),
  busyChildren: z.number().int().nonnegative().default(0),
  highlights: z.array(z.string()).default([])
});

export type NodeSummary = z.infer<typeof nodeSummarySchema>;