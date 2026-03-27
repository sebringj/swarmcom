# Feature Breakdown

## Priority Framework

Use three buckets:

- Now: required for v0.1
- Next: important after the first working release
- Later: valuable, but not needed to prove the product

## Now

### Network Initialization

- `swarmcom init`
- generate `swarmcom-network.json`
- configure MCP endpoint, transport settings, and persistence path

### Node Registration

- register node ID, role, capabilities, and boss-control permission
- track connected and last-seen state

### Visibility

- update each node's current status snapshot
- store each node's latest status in a simple local machine-readable format
- query one node status
- query full network summary
- summarize current activity across nodes from cached status snapshots
- summarize child nodes hierarchically so higher layers see rollups first
- inspect recent status changes on demand
- expose role and connection state in summaries

### Messaging

- send direct messages to a node
- send role-targeted messages
- store recent messages
- publish over a mature existing transport, preferably Matrix

### Persistence

- persist node metadata
- persist or mirror latest status only as needed beyond the node-owned source of truth
- persist recent status history for ad hoc lookback and summarization
- persist messages and network config

### Integration

- native MCP client connection path
- OpenClaw bridge-compatible setup path
- mixed-client operation where MCP and OpenClaw can connect at the same time
- one shared internal command path for both integration types
- Matrix-first transport path for cross-node communication

## Next

### Better Operational UX

- `swarmcom status`
- `swarmcom nodes`
- `swarmcom summary`
- improved logs and diagnostics

### Transport Expansion

- Slack adapter
- Discord adapter
- Teams adapter
- Telegram adapter
- better reconnect and session recovery
- optional dedicated OpenClaw adapter only if the bridge path proves insufficient
- optional local WebSocket transport only if a real gap remains

### Visibility Depth

- message history queries
- node timeline or status history
- summarized role-based views
- ad hoc summaries across current tasks, states, and blockers
- drill-down from parent summary to child detail only when requested

## Later

### Hierarchy

- parent and child node relationships
- subtree queries
- summarized reports for higher-level bosses

### External Channels

- alternate room and chat transports beyond the primary Matrix path

### Packaging and Scale

- Docker image
- larger network performance tuning
- audit log tooling

## Explicit Non-Goals For v0.1

- full workflow orchestration
- autonomous task assignment engine
- heavy web UI
- broad enterprise policy system
- separate business logic stacks for MCP and OpenClaw
- building custom network infrastructure first when an existing transport satisfies the need

## Acceptance Checklist For v0.1

- boss node can register successfully
- worker node can register successfully
- network query returns both nodes
- status snapshots can be updated and reflected in network summaries quickly
- parent nodes receive concise child summaries without requiring all leaf statuses by default
- a message can be sent to a specific node
- a message can be sent by role
- disallowed boss-control instruction is rejected
- restart preserves network state needed for continued use
- MCP and OpenClaw clients can both connect to the same running SwarmCom instance
- MCP and OpenClaw actions flow through the same persisted network state
- cross-node communication works through the selected existing transport without requiring SwarmCom to be its own primary network layer
- ad hoc status inspection can show current or recent node state without relying only on live events