# Architecture Notes

## System Shape

SwarmCom should be implemented as a thin coordination backbone with four primary layers:

1. CLI layer for local setup and operations
2. client adapter layer for MCP and OpenClaw-facing actions
3. application services for network logic
4. persistence and transport adapters

This keeps the product aligned with the roadmap: visibility first, control second.

The critical design rule is that MCP and OpenClaw must be usable simultaneously, but they must not create parallel implementations of registration, messaging, status, or permission logic.

## DRY Integration Rule

Every external integration path must translate into the same canonical commands and events.

That means:

- one shared node schema
- one shared status schema
- one shared message schema
- one shared permission model
- one shared service layer

Adapters are responsible only for:

- input translation
- output formatting
- connection and session concerns
- client-specific protocol quirks

Adapters must not own:

- business rules
- routing logic
- persistence logic
- boss-control permission checks

## Core Domain Concepts

### Node

A node represents a participating machine, agent host, or subsystem.

Required fields:

- `nodeId`
- `name`
- `role`
- `capabilities`
- `acceptsBossControl`
- `connectionState`
- `lastSeenAt`

### Status Snapshot

A status snapshot is the latest state a node wants to expose.

Suggested fields:

- `nodeId`
- `summary`
- `state` such as `idle`, `busy`, `blocked`, `offline`
- `currentTask`
- `updatedAt`
- `metadata`

Design intent:

- this is the fast read model for network summaries
- it should be cheap to overwrite as new updates arrive
- it should be queryable independently of the raw event stream

SwarmCom should treat status in two layers:

- latest node-owned status snapshot for quick summaries and current state reads
- recent status history for ad hoc inspection and lightweight auditability

Recommended source of truth for latest status:

- a simple node-local JSON file such as `swarm-status.json`

Optional human-facing companion:

- a Markdown rendering such as `STATUS.md`

SwarmCom should normalize these into one canonical status shape, but should avoid requiring a heavyweight extra storage system just to know a node's current state.

### Hierarchical Status Rollup

Each node should be able to summarize the state of its own subtree.

That means:

- leaf nodes publish direct status snapshots
- intermediate nodes publish both their own local status and a rolled-up child summary
- parent nodes read summarized child status by default
- deeper leaf detail is fetched only on demand

This keeps top-level visibility fast and reduces information overload.

### Message

A message is the generic communication primitive. Boss instructions should be modeled as a message subtype or flagged message, not a second transport concept.

Suggested fields:

- `id`
- `channel`
- `fromNodeId`
- `toNodeId`
- `targetRole`
- `content`
- `kind`
- `createdAt`

### Canonical Command Set

Both MCP and OpenClaw-facing integrations should map into a small internal command set.

Suggested initial commands:

- `RegisterNode`
- `UpdateStatus`
- `QueryStatus`
- `QueryStatusHistory`
- `QuerySummary`
- `QueryNetwork`
- `SendMessage`
- `HandOffArtifact`

This is the main DRY seam in the system. Clients can differ, but the command handlers should not.

## Service Boundaries

### Network Service

Owns:

- node registration
- node lookup
- presence updates
- network summaries

### Status Service

Owns:

- status writes
- latest status reads
- network summary generation from latest snapshots
- hierarchical rollup generation from child summaries
- recent status history reads for ad hoc inspection
- aggregated views by node or role

### Messaging Service

Owns:

- direct messages
- role-targeted messages
- permission checks for boss control messages
- message persistence and fan-out

### Config Service

Owns:

- reading and writing `swarmcom-network.json`
- validating local endpoint configuration

### Adapter Layer

Owns:

- MCP tool binding to canonical commands
- OpenClaw bridge binding to canonical commands
- request and response translation
- adapter capability declarations

## Runtime Design

Recommended single-process runtime for v0.1:

- Node.js process hosting MCP server, OpenClaw-facing adapter endpoints, and transport adapters together
- shared application service container
- SQLite file on local disk

Why this is the right starting point:

- lowest operational complexity
- simple installation story
- easy local development
- enough scale for the intended first use cases

## Transport Guidance

### Primary

Matrix or another mature transport should handle cross-node messaging and presence whenever possible.

Why:

- avoids rebuilding network infrastructure that already exists
- benefits from proven delivery, rooms, identity, and federation models
- aligns well with OpenClaw's existing ecosystem
- keeps SwarmCom focused on routing, state, permissions, and protocol adaptation

### Secondary

MCP is the public control surface exposed to compatible clients.

### Optional Local Transport

WebSocket should be treated as an optional local or development transport, not the architectural default.

Use it only when:

- Matrix is unavailable or undesirable in a local-only setup
- a bridge needs a very small local runtime path
- development ergonomics clearly improve

### OpenClaw Compatibility

OpenClaw support should be treated as a peer adapter path, not a second implementation stack.

Interpretation for implementation:

- if OpenClaw reaches SwarmCom through MCP bridges, those requests still land on the same canonical handlers
- if OpenClaw uses Matrix directly, SwarmCom should consume and emit through the same shared message model
- if a dedicated OpenClaw adapter is later needed, it should still translate into the same internal commands
- no transport-specific tables or business rules should be introduced for OpenClaw alone

Interpretation for implementation:

- MCP tools invoke application services through canonical command handlers
- OpenClaw integrations invoke the same handlers
- transport adapters distribute live updates and inbound events
- shared services prevent logic duplication between transports

## Transport Adapter Model

SwarmCom should treat transport as a pluggable edge concern.

Recommended adapters:

- `matrixAdapter` for primary network transport
- `mcpAdapter` for control and query operations
- `websocketAdapter` only as an optional local transport

The adapter contract should standardize:

- outbound message publishing
- inbound event normalization
- presence mapping
- status update normalization
- transport capability reporting

## Persistence Guidance

SQLite is sufficient for v0.1 if the schema stays narrow.

Suggested tables:

- `nodes`
- `node_presence`
- `status_snapshots`
- `status_history`
- `messages`
- `network_config`

Important modeling choice:

- separate durable node identity from ephemeral connection presence
- separate current status snapshot from append-oriented status history

Persistence guidance:

- latest status may be node-owned in JSON and mirrored or indexed centrally only when useful
- centralized storage is more important for search, history, or coordination than for the basic current-status source of truth

That avoids losing known nodes when they disconnect.

## Security and Trust Model

Keep trust assumptions explicit even if authentication is minimal in v0.1.

Minimum safeguards:

- nodes declare whether boss control is accepted
- instruction-style messages are blocked if the target node does not allow boss control
- config should support private network deployment by default
- log message origin for auditability

## Open Questions Before Coding

- Which MCP server library best supports the target transport mix cleanly?
- Should status updates be published into Matrix rooms, direct messages, or both?
- How should node identity be established across reconnects?
- Does `send_message` need delivery acknowledgment in v0.1?
- Is artifact handoff a message with structured metadata or a distinct entity?
- What minimum Matrix room and identity conventions keep setup simple without locking the design too early?

## Recommended Default Decisions

To keep momentum, start with these decisions unless a constraint appears:

- single package TypeScript repository
- one runtime binary with CLI entrypoint
- one SQLite database file in local app data or repo-local dev path
- one canonical command and event layer between adapters and services
- Matrix-first transport strategy
- message acknowledgments deferred until needed
- artifact handoff implemented as structured message metadata