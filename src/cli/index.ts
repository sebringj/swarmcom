#!/usr/bin/env node
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvironment } from "../config/env";
import { createDefaultNetworkConfig, loadNetworkConfig, networkConfigExists, saveNetworkConfig } from "../config/networkConfig";
import { StatusSnapshot, statusSnapshotSchema } from "../domain/status";
import { createServer } from "../server/createServer";
import { StatusService } from "../services/statusService";
import { DatabaseService } from "../db/database";

type Flags = Record<string, string | boolean>;

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      continue;
    }

    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  return flags;
}

function getFlag(flags: Flags, key: string): string | undefined {
  const value = flags[key];
  return typeof value === "string" ? value : undefined;
}

function printHelp(): void {
  console.log(`SwarmCom CLI

Commands:
  swarmcom quickstart [--node-id <id>] [--name <name>] [--role <boss|peer|worker>] [--force]
  swarmcom init [--node-id <id>] [--name <name>] [--role <boss|peer|worker>] [--force]
  swarmcom update-status [--state <state>] [--summary <text>] [--task <text>] [--blocker <text>]
  swarmcom status
  swarmcom summary
  swarmcom serve
`);
}

function initializeProject(flags: Flags, mode: "init" | "quickstart"): void {
  const env = loadEnvironment();
  const configPath = resolve(getFlag(flags, "config") ?? env.SWARMCOM_NETWORK_FILE);
  const statusPath = resolve(env.SWARMCOM_STATUS_FILE);
  const humanStatusPath = resolve(env.SWARMCOM_HUMAN_STATUS_FILE);
  const force = flags.force === true;
  const transportType = (getFlag(flags, "transport") as "local" | "matrix" | undefined) ?? (mode === "quickstart" ? "local" : env.SWARMCOM_TRANSPORT);

  if (networkConfigExists(configPath) && !force) {
    throw new Error(`Config already exists at ${configPath}. Use --force to overwrite.`);
  }

  const config = createDefaultNetworkConfig({
    nodeId: getFlag(flags, "node-id") ?? "local-node",
    nodeName: getFlag(flags, "name") ?? "Local Node",
    role: (getFlag(flags, "role") as "boss" | "peer" | "worker" | undefined) ?? "boss",
    transport: {
      type: transportType,
      local: {
        channelDirectory: env.SWARMCOM_LOCAL_CHANNEL_DIR
      }
    },
    statusFile: statusPath,
    humanStatusFile: humanStatusPath
  });

  saveNetworkConfig(configPath, config);

  const dbService = new DatabaseService({ filePath: "./.swarmcom/db/swarmcom.sqlite" });
  const statusService = new StatusService(dbService);
  const initialStatus: StatusSnapshot = statusSnapshotSchema.parse({
    nodeId: config.nodeId,
    summary: "Initialized",
    state: "idle",
    currentTask: "Bootstrap SwarmCom",
    blockers: [],
    updatedAt: new Date().toISOString(),
    metadata: {
      source: "swarmcom init"
    }
  });

  statusService.writeSnapshot(statusPath, initialStatus);
  writeFileSync(humanStatusPath, `${statusService.renderHumanStatus(initialStatus)}\n`, "utf8");

  const server = createServer(configPath);
  if (config.transport.type === "local") {
    server.localAdapter.ensureLocalChannels(config);
  }

  if (!existsSync(resolve(".env")) && existsSync(resolve(".env.example"))) {
    console.log("Created config and status files. Copy .env.example to .env when you want to customize transport settings.");
  } else {
    console.log("Created config and status files.");
  }

  console.log(`- Config: ${configPath}`);
  console.log(`- Status: ${statusPath}`);
  console.log(`- Human status: ${humanStatusPath}`);
  console.log(`- Transport: ${config.transport.type}`);
  console.log("- Role channels: boss, peer, and worker channels defined via config and env-backed secrets");

  if (mode === "quickstart") {
    console.log("\nQuick start next steps:");
    console.log("1. npm run dev -- serve");
    console.log("2. npm run dev -- update-status --summary \"Working locally\" --task \"Testing SwarmCom\"");
    console.log("3. npm run dev -- summary");
  }
}

function initCommand(flags: Flags): void {
  initializeProject(flags, "init");
}

function quickstartCommand(flags: Flags): void {
  initializeProject(flags, "quickstart");
}

function updateStatusCommand(flags: Flags): void {
  const env = loadEnvironment();
  const statusPath = resolve(env.SWARMCOM_STATUS_FILE);
  const humanStatusPath = resolve(env.SWARMCOM_HUMAN_STATUS_FILE);
  const dbService = new DatabaseService({ filePath: "./.swarmcom/db/swarmcom.sqlite" });
  const statusService = new StatusService(dbService);
  const current = statusService.loadSnapshot(statusPath);

  if (!current) {
    throw new Error(`No status file found at ${statusPath}. Run 'swarmcom init' first.`);
  }

  const blocker = getFlag(flags, "blocker");
  const updated: StatusSnapshot = statusSnapshotSchema.parse({
    ...current,
    state: (getFlag(flags, "state") as StatusSnapshot["state"] | undefined) ?? current.state,
    summary: getFlag(flags, "summary") ?? current.summary,
    currentTask: getFlag(flags, "task") ?? current.currentTask,
    blockers: blocker ? [...current.blockers, blocker] : current.blockers,
    updatedAt: new Date().toISOString()
  });

  statusService.writeSnapshot(statusPath, updated);
  statusService.appendHistory(`${statusPath}.history.json`, {
    ...updated,
    recordedAt: new Date().toISOString()
  });
  writeFileSync(humanStatusPath, `${statusService.renderHumanStatus(updated)}\n`, "utf8");
  console.log(`Updated status for ${updated.nodeId}`);
}

function statusCommand(): void {
  const env = loadEnvironment();
  const dbService = new DatabaseService({ filePath: "./.swarmcom/db/swarmcom.sqlite" });
  const statusService = new StatusService(dbService);
  const status = statusService.loadSnapshot(resolve(env.SWARMCOM_STATUS_FILE));

  if (!status) {
    throw new Error("No current status found. Run 'swarmcom init' first.");
  }

  console.log(JSON.stringify(status, null, 2));
}

function summaryCommand(flags: Flags): void {
  const env = loadEnvironment();
  const config = loadNetworkConfig(resolve(getFlag(flags, "config") ?? env.SWARMCOM_NETWORK_FILE));
  const dbService = new DatabaseService({ filePath: "./.swarmcom/db/swarmcom.sqlite" });
  const statusService = new StatusService(dbService);
  const server = createServer(resolve(getFlag(flags, "config") ?? env.SWARMCOM_NETWORK_FILE));
  const childSummaries = server.networkService.summarizeChildren(config.children);
  const selfStatus = statusService.loadSnapshot(config.statusFile);

  if (!selfStatus) {
    throw new Error(`No current status found at ${config.statusFile}.`);
  }

  const summary = statusService.buildSummary(selfStatus, childSummaries);
  console.log(JSON.stringify({ summary, children: childSummaries }, null, 2));
}

function serveCommand(flags: Flags): void {
  const env = loadEnvironment();
  const server = createServer(resolve(getFlag(flags, "config") ?? env.SWARMCOM_NETWORK_FILE));
  if (server.networkConfig.transport.type === "local") {
    server.localAdapter.ensureLocalChannels(server.networkConfig);
  }
  console.log("SwarmCom scaffold loaded.");
  console.log(`- Node: ${server.networkConfig.nodeName} (${server.networkConfig.nodeId})`);
  console.log(`- Role: ${server.networkConfig.role}`);
  console.log(`- Transport: ${server.networkConfig.transport.type}`);
  console.log(`- MCP tools: ${server.mcpAdapter.describeTools().join(", ")}`);
  if (server.networkConfig.transport.type === "matrix") {
    console.log(`- Matrix: ${server.matrixAdapter.describe()}`);
    console.log(`- Matrix role channels: ${server.matrixAdapter.describeRoleChannels(server.networkConfig).join(" | ")}`);
  } else {
    console.log(`- Local channels: ${server.localAdapter.describe(server.networkConfig)}`);
  }
  console.log(`- OpenClaw: ${server.openClawAdapter.describeBridgeStrategy()}`);
}

function main(): void {
  const [, , command, ...rest] = process.argv;
  const flags = parseFlags(rest);

  try {
    switch (command) {
      case "quickstart":
        quickstartCommand(flags);
        return;
      case "init":
        initCommand(flags);
        return;
      case "update-status":
        updateStatusCommand(flags);
        return;
      case "status":
        statusCommand();
        return;
      case "summary":
        summaryCommand(flags);
        return;
      case "serve":
        serveCommand(flags);
        return;
      case "help":
      case "--help":
      case "-h":
      case undefined:
        printHelp();
        return;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}

main();