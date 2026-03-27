# Recommended Repository Structure

## Initial Layout

```text
swarmcom/
  src/
    cli/
    config/
    domain/
    commands/
    services/
    adapters/
      mcp/
      openclaw/
      matrix/
    persistence/
    transports/
      websocket/
    server/
    utils/
  test/
    unit/
    integration/
  scripts/
  planning/
  README.md
  ROADMAP.md
  package.json
  tsconfig.json
```

## Directory Responsibilities

### `src/cli`

Command definitions and argument parsing.

### `src/config`

Config loading, defaults, and schema validation for `swarmcom-network.json`.

### `src/domain`

Pure types, enums, schemas, and domain rules.

Keep this layer free of transport and database details.

### `src/commands`

Canonical command and event contracts shared by MCP and OpenClaw-facing adapters.

This is the boundary that keeps the system DRY.

### `src/adapters/mcp`

MCP tool bindings that translate client requests into canonical commands.

### `src/adapters/openclaw`

OpenClaw bridge bindings or compatibility wrappers that translate OpenClaw-side requests into the same canonical commands.

### `src/adapters/matrix`

Matrix transport bindings for publishing messages, receiving events, and mapping room activity into canonical commands and events.

### `src/services`

Application services coordinating domain behavior.

This is where registration, status querying, and messaging logic should live.

### `src/persistence`

SQLite connection setup, migrations, and repository implementations.

### `src/transports/websocket`

Optional local transport only. Keep this isolated so it can remain secondary or be omitted entirely.

### `src/server`

Runtime composition root that wires services, transports, and config together.

### `test/unit`

Fast tests for domain and service logic.

### `test/integration`

Persistence and end-to-end runtime tests.

## Suggested Early File Set

Start with a minimal set of files:

- `src/cli/index.ts`
- `src/server/createServer.ts`
- `src/config/networkConfig.ts`
- `src/domain/node.ts`
- `src/domain/status.ts`
- `src/domain/message.ts`
- `src/commands/contracts.ts`
- `src/services/networkService.ts`
- `src/services/statusService.ts`
- `src/services/messagingService.ts`
- `src/persistence/sqlite.ts`
- `src/adapters/matrix/matrixAdapter.ts`
- `src/adapters/mcp/registerNodeTool.ts`
- `src/adapters/mcp/queryStatusTool.ts`
- `src/adapters/mcp/queryNetworkTool.ts`
- `src/adapters/mcp/sendMessageTool.ts`
- `src/adapters/openclaw/bridgeAdapter.ts`

## Dependency Guidance

Reasonable first-pass dependencies:

- MCP SDK for server implementation
- Matrix SDK or client library appropriate for the chosen Node.js stack
- `zod` for validation
- a small SQLite library with stable TypeScript support
- one CLI parser only if it materially improves the developer experience

Avoid adding:

- web UI frameworks
- message brokers
- heavy ORM layers
- multi-package monorepo tooling before there is a real need