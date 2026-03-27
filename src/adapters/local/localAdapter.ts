import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { NetworkConfig } from "../../config/networkConfig";

export class LocalAdapter {
  public ensureLocalChannels(config: NetworkConfig): string[] {
    const baseDir = resolve(config.transport.local.channelDirectory);
    const channels = ["boss", "peer", "worker"].map((name) => resolve(baseDir, name));

    mkdirSync(baseDir, { recursive: true });
    for (const channelPath of channels) {
      mkdirSync(channelPath, { recursive: true });
    }

    return channels;
  }

  public describe(config: NetworkConfig): string {
    return `Local quick start transport using channel directory ${resolve(config.transport.local.channelDirectory)}`;
  }
}