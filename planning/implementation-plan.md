# Implementation Plan

## Objective

Build v0.1 as the smallest useful SwarmCom release:

- initialize a local SwarmCom network
- run a communication server usable by both MCP-native clients and OpenClaw
- register nodes with role and capability metadata
- maintain an updateable latest-status snapshot for each node
- prefer node-owned latest status files over mandatory centralized current-state storage
- query node and network status
- support fast summaries and ad hoc status inspection
- support hierarchical summary rollups so parent nodes can see relevant child state quickly
- send targeted messages
- persist enough state to survive restarts

Transport assumption for v0.1:

- prefer Matrix or another mature transport for cross-node communication
- keep custom WebSocket transport optional and secondary

## Delivery Strategy

Use a vertical-slice approach instead of building every layer in isolation.

Each phase should end with something runnable.

## Phase 0: Repository Bootstrap

Deliverables:

- Node.js + TypeScript project scaffold
- package manager selection and scripts
- linting, formatting, and test baseline
- environment configuration approach
- basic README update for local development

Suggested scripts:

- `dev`
- `build`
- `start`
- `test`
- `lint`
- `typecheck`

Exit criteria:

- project installs cleanly
- TypeScript compiles
- one smoke test passes

## Phase 1: Core Domain Model

Deliverables:

- node model
- role model: `boss`, `peer`, `worker`
- status model
- status snapshot and status history model
- hierarchical summary model
- message model
- network configuration model
- canonical command and event contracts shared by all adapters
- Zod schemas for all external inputs

Minimum entities:

- `NodeRecord`
- `NodePresence`
- `StatusSnapshot`
- `StatusHistoryEntry`
- `MessageRecord`
- `NetworkConfig`

Exit criteria:

- all adapter inputs and persistence payloads validate through shared schemas
- in-memory service tests cover registration and message routing behavior

## Phase 2: Persistence Layer

Deliverables:

- SQLite database setup and migrations
- repositories for nodes, statuses, and messages
- persistence adapter interface to keep higher layers testable

Minimum stored data:

- known nodes
- references to latest node-owned status snapshots or mirrored current status where useful
- recent status history
- message history
- network configuration
- transport configuration

Exit criteria:

- restart preserves node metadata and recent state
- repository tests pass against SQLite

## Phase 3: SwarmCom Server Runtime

Deliverables:

- server bootstrap
- connection/session management
- internal event bus for status and message updates
- Matrix transport adapter for real-time communication
- optional local WebSocket transport adapter only if needed
- adapter composition that allows MCP and OpenClaw-driven clients to operate concurrently

Responsibilities:

- authenticate or identify clients at a basic level
- track connected versus known nodes
- publish updates to interested clients
- normalize transport payloads into domain events

Exit criteria:

- multiple clients can connect concurrently
- one client action updates shared network state in real time

## Phase 4: MCP Tool Surface

Deliverables:

- `register_node`
- `update_status`
- `query_status`
- `query_status_history`
- `query_summary`
- `query_network`
- `send_message`
- optional `hand_off_artifact` as a thin extension if time permits

Design rule:

- tool handlers should stay thin and delegate to domain services

Exit criteria:

- MCP clients can complete the v0.1 happy path without direct database access
- malformed payloads return clear validation errors

## Phase 5: OpenClaw Adapter Surface

Deliverables:

- OpenClaw compatibility layer or documented bridge binding
- translation between OpenClaw-side actions and the same canonical command set used by MCP tools
- concurrency validation for mixed MCP and OpenClaw sessions
- transport binding that works cleanly over the chosen existing network path

Exit criteria:

- OpenClaw can complete the same registration, query, and messaging flows through the shared core
- mixed MCP and OpenClaw usage does not require duplicated handlers or storage paths

## Phase 6: CLI and Local Setup

Deliverables:

- `swarmcom init`
- config file generation
- default local database creation
- default transport configuration creation
- command to run the server locally
- documentation for EMS and self-hosted Synapse setup assumptions

Recommended initial CLI surface:

- `swarmcom init`
- `swarmcom serve`
- `swarmcom status`

Exit criteria:

- a developer can initialize and start the network from the CLI only

## Phase 7: Example Integration Flows

Deliverables:

- one native MCP client walkthrough
- one OpenClaw bridge walkthrough
- one mixed-client walkthrough with both connected at once
- example config snippets
- one example using hosted Matrix and one example using self-hosted Matrix assumptions

Exit criteria:

- root docs show a working boss plus worker setup
- integration steps are tested at least once end to end

## v0.1 Cut Line

Must ship:

- node registration
- node status updates
- aggregated status queries
- quick summary reads from latest snapshots
- hierarchical summary reads from child nodes
- targeted messaging
- permission flag for boss control
- SQLite persistence
- Matrix-first transport integration
- MCP tool compatibility
- OpenClaw compatibility through the same shared core
- concurrent support for mixed MCP and OpenClaw clients

Can slip if necessary:

- artifact handoff
- advanced history queries beyond recent status lookback
- optional local WebSocket transport
- complex reconnect heuristics

Should not start before v0.1 is stable:

- Slack or Discord adapters
- subtree hierarchy queries
- Docker packaging

## First Coding Pass Recommendation

Build in this exact order:

1. project scaffold
2. shared schemas, commands, and domain types
3. SQLite repositories
4. in-memory service layer tests
5. Matrix transport adapter
6. MCP handlers
7. OpenClaw adapter or bridge binding
8. CLI commands
9. end-to-end mixed-client happy path test
10. optional local WebSocket transport if justified

## Risks To Control Early

- MCP transport choices may affect server structure more than expected
- OpenClaw bridge compatibility may require payload shape adjustments
- a second adapter path can accidentally duplicate handler logic unless canonical commands are introduced first
- transport abstraction can become leaky unless Matrix-specific concerns are isolated at the adapter boundary
- real-time presence and persisted node state can diverge unless modeled explicitly
- boss-control semantics can sprawl unless kept behind a simple permission gate