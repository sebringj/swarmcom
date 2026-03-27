# SwarmCom Roadmap

**Project Goal**  
Build a lightweight, MCP-native communication layer that enables visibility and optional coordination across independent agent systems.

SwarmCom treats every participating machine or subsystem as a **Node**. Each node can have its own **bosses, peers, and workers**. 

The primary focus is **visibility** — knowing where things stand across your systems — with optional messaging and boss-level control when a node explicitly allows it.

It works seamlessly for a single developer with multiple machines as well as larger setups.

## Core Design Principles

- **Visibility first**: Fast, aggregated status across all connected nodes.
- **Optional communication & control**: Nodes can send/receive messages and optionally accept boss instructions.
- **Node-based architecture**: Every system registers as a node with flexible roles (`boss`, `peer`, `worker`).
- **Hierarchical & modular**: Nodes can be stitched together at any level (personal → team → organization).
- **MCP-first**: One MCP endpoint is all any system needs to join the network.
- **Dual integration from day one**:
  - Native MCP clients (Claude, Cursor, Copilot extensions, etc.)
  - OpenClaw (via existing community MCP bridges)
- **Transport flexibility**: Internal WebSocket by default + optional Matrix and other channels.

## v0.1 — Core Visibility + Basic Integration (Current Priority)

**Goal**: Deliver working visibility and messaging with solid integration for both MCP clients and OpenClaw from the very first version.

### Must-Have Features

- `swarmcom init` — Creates `swarmcom-network.json` and provides the MCP WebSocket endpoint.
- **MCP Server** with WebSocket transport (real-time capable).
- **Node Registration** via MCP tool:
  - `register_node(node_id: string, role: "boss" | "peer" | "worker", name: string, capabilities: string[], accepts_boss_control: boolean)`
- Core MCP tools:
  - `query_status(node_id?: string)` — Get current status from one node or aggregated view
  - `query_network()` — List all connected nodes with roles and high-level status
  - `send_message(channel: string, content: string, target_role?: string, target_node_id?: string)`
  - `hand_off_artifact(from_node_id: string, to_node_id: string, description: string, context?: any)` — optional
- Internal WebSocket backbone for real-time messaging and updates.
- Lightweight persistence (SQLite recommended).

**Day-One Integrations**:
- **MCP clients** (Claude Desktop, Cursor, Copilot extensions, etc.): Connect directly via the MCP endpoint.
- **OpenClaw**: Support via existing community bridges (`freema/openclaw-mcp`, MCPorter skill, etc.). Users should be able to point OpenClaw at SwarmCom’s MCP URL with minimal configuration.

**Success Criteria**:
- I can run SwarmCom and connect both:
  - A native MCP client (e.g. Cursor or Claude) as a boss node
  - One or more OpenClaw instances as worker nodes
- I can query current status across all nodes.
- I can send messages to specific nodes or roles.
- Nodes that allow boss control can receive optional instructions.

## v0.2 — Enhanced Visibility & Transports

- Persistent message and status history
- Matrix transport adapter (strong integration with OpenClaw’s native Matrix support)
- Role-based channels (`#boss-room`, `#peer-room`, `#worker-room`)
- Improved CLI commands (`swarmcom status`, `swarmcom nodes`)
- Better reconnection handling and connection status
- Support for nodes dynamically accepting/rejecting boss control

## v0.3 — Hierarchical Node Support

- Nested node hierarchies (parent/child relationships)
- Subtree status queries (`query_subtree_status`)
- Summarized reporting for higher-level bosses
- Cross-node handoffs with context
- Optional Slack / Discord / Teams transport adapters

## v0.4 — Scalability & Polish

- Audit logging
- Performance improvements for larger networks
- Docker support
- Example configurations for different scales (single dev multi-machine, team, organization)

## Technical Guidelines

**Stack**:
- TypeScript (Node.js)
- WebSocket for real-time communication
- MCP server implementation (supporting WebSocket + HTTP/stdio)
- SQLite for persistence
- Zod for validation

**Key Rules**:
- Visibility is the default experience.
- Control is always optional per node (`accepts_boss_control` flag).
- Make integration with OpenClaw and MCP clients as smooth as possible from day one.
- Keep the system lightweight and non-intrusive.

**Non-Goals**:
- Building a full orchestration or workflow engine
- Forcing automation on nodes
- Heavy UI (CLI-first)

---

**Living Roadmap**

Start with **v0.1** and ensure strong, practical integration with both native MCP clients and OpenClaw.

The core use case is simple:  
When running multiple machines or agent systems, quickly see where things stand and optionally send messages or instructions to nodes that allow it.

Point your LLM coder here with this instruction:  
**"Implement SwarmCom following this roadmap. From day one, ensure good integration with both native MCP clients (Claude/Cursor/Copilot) and OpenClaw via its community MCP bridges. Prioritize visibility, with optional messaging and boss control."**
