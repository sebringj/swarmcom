import { z } from "zod";

import { messageRecordSchema } from "../domain/message";
import { nodeRecordSchema } from "../domain/node";
import { statusHistoryEntrySchema, statusSnapshotSchema } from "../domain/status";

export const registerNodeCommandSchema = nodeRecordSchema;
export type RegisterNodeCommand = z.infer<typeof registerNodeCommandSchema>;

export const updateStatusCommandSchema = z.object({
  status: statusSnapshotSchema
});
export type UpdateStatusCommand = z.infer<typeof updateStatusCommandSchema>;

export const queryStatusCommandSchema = z.object({
  nodeId: z.string().min(1).optional()
});
export type QueryStatusCommand = z.infer<typeof queryStatusCommandSchema>;

export const queryStatusHistoryCommandSchema = z.object({
  nodeId: z.string().min(1),
  limit: z.number().int().positive().max(50).default(10)
});
export type QueryStatusHistoryCommand = z.infer<typeof queryStatusHistoryCommandSchema>;

export const querySummaryCommandSchema = z.object({
  nodeId: z.string().min(1).optional()
});
export type QuerySummaryCommand = z.infer<typeof querySummaryCommandSchema>;

export const sendMessageCommandSchema = messageRecordSchema.pick({
  channel: true,
  fromNodeId: true,
  toNodeId: true,
  targetRole: true,
  content: true,
  kind: true
});
export type SendMessageCommand = z.infer<typeof sendMessageCommandSchema>;

export const commandSchemas = {
  registerNode: registerNodeCommandSchema,
  updateStatus: updateStatusCommandSchema,
  queryStatus: queryStatusCommandSchema,
  queryStatusHistory: queryStatusHistoryCommandSchema,
  querySummary: querySummaryCommandSchema,
  sendMessage: sendMessageCommandSchema,
  statusHistoryEntry: statusHistoryEntrySchema
} as const;