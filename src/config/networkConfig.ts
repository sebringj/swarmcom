import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { z } from "zod";

import { childNodeReferenceSchema, nodeRoleSchema, roleChannelMapSchema } from "../domain/node";

export const transportTypeSchema = z.enum(["local", "matrix"]);
export type TransportType = z.infer<typeof transportTypeSchema>;

export const localTransportConfigSchema = z.object({
  channelDirectory: z.string().min(1).default("./.swarmcom/channels")
});

export const matrixConfigSchema = z.object({
  homeserverUrlEnv: z.string().default("MATRIX_HOMESERVER_URL"),
  accessTokenEnv: z.string().default("MATRIX_ACCESS_TOKEN"),
  userIdEnv: z.string().default("MATRIX_USER_ID"),
  primaryRoomIdEnv: z.string().default("MATRIX_PRIMARY_ROOM_ID"),
  channels: roleChannelMapSchema.default({
    boss: {
      channelName: "boss",
      roomIdEnv: "MATRIX_BOSS_ROOM_ID",
      secretEnv: "SWARMCOM_BOSS_CHANNEL_SECRET"
    },
    peer: {
      channelName: "peer",
      roomIdEnv: "MATRIX_PEER_ROOM_ID",
      secretEnv: "SWARMCOM_PEER_CHANNEL_SECRET"
    },
    worker: {
      channelName: "worker",
      roomIdEnv: "MATRIX_WORKER_ROOM_ID",
      secretEnv: "SWARMCOM_WORKER_CHANNEL_SECRET"
    }
  })
});

export const networkConfigSchema = z.object({
  version: z.literal(1),
  nodeId: z.string().min(1),
  nodeName: z.string().min(1),
  role: nodeRoleSchema,
  transport: z.object({
    type: transportTypeSchema.default("local"),
    local: localTransportConfigSchema.default({})
  }),
  acceptsBossControl: z.boolean().default(false),
  statusFile: z.string().min(1),
  humanStatusFile: z.string().min(1),
  matrix: matrixConfigSchema,
  children: z.array(childNodeReferenceSchema).default([])
});

export type NetworkConfig = z.infer<typeof networkConfigSchema>;

export type ResolvedChannelConfig = {
  roomId?: string;
  secret?: string;
};

export type ResolvedRoleChannels = {
  boss: ResolvedChannelConfig;
  peer: ResolvedChannelConfig;
  worker: ResolvedChannelConfig;
};

export function createDefaultNetworkConfig(input?: Partial<NetworkConfig>): NetworkConfig {
  return networkConfigSchema.parse({
    version: 1,
    nodeId: input?.nodeId ?? "local-node",
    nodeName: input?.nodeName ?? "Local Node",
    role: input?.role ?? "boss",
    transport: input?.transport ?? {
      type: "local",
      local: {
        channelDirectory: "./.swarmcom/channels"
      }
    },
    acceptsBossControl: input?.acceptsBossControl ?? false,
    statusFile: input?.statusFile ?? "./swarm-status.json",
    humanStatusFile: input?.humanStatusFile ?? "./STATUS.md",
    matrix: input?.matrix ?? {},
    children: input?.children ?? []
  });
}

export function loadNetworkConfig(filePath: string): NetworkConfig {
  const raw = readFileSync(resolve(filePath), "utf8");
  return networkConfigSchema.parse(JSON.parse(raw));
}

export function saveNetworkConfig(filePath: string, config: NetworkConfig): void {
  const absolutePath = resolve(filePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function networkConfigExists(filePath: string): boolean {
  return existsSync(resolve(filePath));
}

export function resolveRoleChannels(config: NetworkConfig, env: NodeJS.ProcessEnv): ResolvedRoleChannels {
  return {
    boss: {
      roomId: env[config.matrix.channels.boss.roomIdEnv],
      secret: env[config.matrix.channels.boss.secretEnv]
    },
    peer: {
      roomId: env[config.matrix.channels.peer.roomIdEnv],
      secret: env[config.matrix.channels.peer.secretEnv]
    },
    worker: {
      roomId: env[config.matrix.channels.worker.roomIdEnv],
      secret: env[config.matrix.channels.worker.secretEnv]
    }
  };
}