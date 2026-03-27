import { loadEnvironment } from "../../config/env";
import { NetworkConfig, resolveRoleChannels } from "../../config/networkConfig";

export type MatrixAdapterStatus = {
  configured: boolean;
  missing: string[];
};

export class MatrixAdapter {
  public validateEnvironment(): MatrixAdapterStatus {
    const env = loadEnvironment();
    const missing = [
      !env.MATRIX_HOMESERVER_URL ? "MATRIX_HOMESERVER_URL" : undefined,
      !env.MATRIX_ACCESS_TOKEN ? "MATRIX_ACCESS_TOKEN" : undefined,
      !env.MATRIX_USER_ID ? "MATRIX_USER_ID" : undefined,
      !env.MATRIX_PRIMARY_ROOM_ID ? "MATRIX_PRIMARY_ROOM_ID" : undefined
    ].filter((value): value is string => Boolean(value));

    return {
      configured: missing.length === 0,
      missing
    };
  }

  public describe(): string {
    const status = this.validateEnvironment();
    if (status.configured) {
      return "Matrix adapter is configured.";
    }

    return `Matrix adapter is not fully configured. Missing: ${status.missing.join(", ")}`;
  }

  public describeRoleChannels(config: NetworkConfig): string[] {
    const env = process.env;
    const channels = resolveRoleChannels(config, env);

    return [
      `boss: ${channels.boss.roomId ? "configured" : "missing room"}${channels.boss.secret ? ", signed" : ", missing secret"}`,
      `peer: ${channels.peer.roomId ? "configured" : "missing room"}${channels.peer.secret ? ", signed" : ", missing secret"}`,
      `worker: ${channels.worker.roomId ? "configured" : "missing room"}${channels.worker.secret ? ", signed" : ", missing secret"}`
    ];
  }
}