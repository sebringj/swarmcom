# SwarmCom Roadmap

**Project Goal**  
Build a lightweight, MCP-native communication layer for independent agent systems that prioritizes **visibility** ("Where are things at?") while optionally enabling **communication and boss-level control** when desired.

SwarmCom treats every machine or subsystem as a **Node**. Each node can have its own **bosses, peers, and workers**. 

A node can **optionally expose boss control** — meaning a higher-level boss can send instructions or delegate tasks to it — but this is never forced. The default mode is visibility + lightweight messaging.

This design works equally well for:
- A single developer coordinating multiple machines
- Small teams
- Large organizations

## Core Design Principles

- **Visibility first**: Easy, aggregated status across all connected nodes.
- **Communication second**: Simple messaging between nodes.
- **Optional control**: A node can choose to accept boss-level instructions (e.g. task delegation, handoffs, or commands). Control is explicit and opt-in per node.
- **Node-based & hierarchical**: Nodes register with roles (`boss`, `peer`, `worker`) and can be stitched together at any level.
- **MCP-first**: One MCP endpoint is all any system needs to join the network.
- **Flexible & non-intrusive**: Nodes decide how much control they expose.
- **Transport flexibility**: Internal WebSocket by default + optional Matrix, Slack, Discord, etc.

## v0.1 — Core Visibility + Optional Messaging (Current Priority)

**Goal**: Deliver useful “where are things at” visibility with basic optional communication.

### Must-Have Features

- `swarmcom init` — Generates `swarmcom-network.json` and provides the MCP WebSocket endpoint.
- **MCP Server** with WebSocket transport (reuse socket patterns from Autonomo).
- **Node Registration**:
  - `register_node(node_id: string, role: "boss" | "peer" | "worker", name: string, capabilities: string[], accepts_boss_control: boolean)`
- Core MCP tools:
  - `query_status(node_id?: string)` — Get current status (aggregated or per node)
  - `query_network()` — Overview of all connected nodes, roles, and status
  - `send_message(channel: string, content: string, target_role?: string, target_node_id?: string)` — General messaging
  - `hand_off_artifact(from_node_id: string, to_node_id: string, description: string, context?: any)` — Optional light handoff
- Internal WebSocket backbone for real-time updates.
- Lightweight persistence (SQLite or JSON files).
- Simple CLI:
  - `swarmcom status` — Quick network overview
  - `swarmcom nodes` — List connected nodes with their status

**Success Criteria**:
- Connect 3–5 nodes (e.g. main planning session + several OpenClaw instances on different machines).
- Quickly see where things stand across all nodes.
- Optionally send messages or instructions to nodes that accept boss control.
- The system reduces mental overhead when running multiple agent systems.

## v0.2 — Enhanced Visibility & Transports

- Persistent history of status updates and messages
- Matrix transport adapter (leveraging OpenClaw’s native Matrix support)
- Role-based channels (`#boss-room`, `#peer-room`, `#worker-room`)
- Improved CLI dashboard for at-a-glance visibility
- Autonomo integration (include verification results in status reports)
- Better handling of nodes that accept/reject boss control

## v0.3 — Optional Boss Control & Hierarchy

- Full support for **optional boss control**:
  - Nodes declare whether they accept boss instructions
  - Higher-level bosses can send targeted commands to accepting nodes
- Nested node hierarchies (parent/child relationships)
- Subtree status queries
- Summarized reporting for higher-level bosses
- Optional Slack / Discord / Teams transport adapters

## v0.4 — Scalability & Polish

- Audit logging for messages and control actions
- Performance tuning for larger networks
- Docker support and easier deployment patterns
- Example configurations for single-dev, team, and organizational use

## Technical Guidelines

**Stack**:
- TypeScript (Node.js)
- Reuse WebSocket / socket patterns from Autonomo
- MCP server implementation
- SQLite for persistence
- Zod for validation

**Key Rules**:
- **Visibility is the default** — status should always be available.
- **Control is optional** — a node must explicitly allow boss control (`accepts_boss_control: true`).
- Keep the system non-intrusive and flexible.
- Design for hierarchical stitching from the start.

**Non-Goals**:
- Forced automation or heavy orchestration
- Replacing the internal logic of existing tools (Cursor, OpenClaw, Autonomo, etc.)
- Building a full workflow engine

---

**Living Roadmap**

Start with **v0.1**. Focus on making status queries fast, clear, and useful, with optional messaging and boss control as a secondary capability.

The main use case is:  
“When I have multiple machines (or multiple people running agents), I want to quickly know where things stand, and optionally be able to send instructions to nodes that allow boss control.”

Point your LLM coder to this file and instruct it:  
**"Implement SwarmCom following this roadmap. Prioritize visibility first, then optional messaging, then optional boss control. Make the node-based architecture flexible and hierarchical."**
