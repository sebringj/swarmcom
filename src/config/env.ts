import { config as loadDotEnv } from "dotenv";
import { z } from "zod";

loadDotEnv();

const environmentSchema = z.object({
  SWARMCOM_TRANSPORT: z.enum(["local", "matrix"]).default("local"),
  MATRIX_HOMESERVER_URL: z.string().url().optional(),
  MATRIX_ACCESS_TOKEN: z.string().optional(),
  MATRIX_USER_ID: z.string().optional(),
  MATRIX_PRIMARY_ROOM_ID: z.string().optional(),
  MATRIX_BOSS_ROOM_ID: z.string().optional(),
  MATRIX_PEER_ROOM_ID: z.string().optional(),
  MATRIX_WORKER_ROOM_ID: z.string().optional(),
  SWARMCOM_BOSS_CHANNEL_SECRET: z.string().optional(),
  SWARMCOM_PEER_CHANNEL_SECRET: z.string().optional(),
  SWARMCOM_WORKER_CHANNEL_SECRET: z.string().optional(),
  SWARMCOM_NETWORK_FILE: z.string().default("./swarmcom-network.json"),
  SWARMCOM_STATUS_FILE: z.string().default("./swarm-status.json"),
  SWARMCOM_HUMAN_STATUS_FILE: z.string().default("./STATUS.md"),
  SWARMCOM_LOCAL_CHANNEL_DIR: z.string().default("./.swarmcom/channels")
});

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(): Environment {
  return environmentSchema.parse(process.env);
}