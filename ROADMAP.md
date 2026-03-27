# SwarmCom Roadmap

**Project Goal**  
Build a lightweight, MCP-native, **node-based** communication backbone that allows independent agent systems (Cursor, multiple OpenClaw instances, Claude Code, Autonomo, Copilot setups, etc.) to coordinate cleanly across machines and organizational scales.

SwarmCom treats every participating system or machine as a **Node**. Each node can define its own local **bosses, peers, and workers**, and nodes can be **stitched together hierarchically** at any level. This makes it equally useful for:
- A single developer running multiple machines
- Small teams
- Large organizations

The architecture is designed to **snap in at any scale** without forcing a single central monolith.

## Core Design Principles

- **Node-based architecture**: Every machine or subsystem is a first-class Node.
- **Flexible roles**: Nodes can have `boss`, `peer`, or `worker` roles (roles can be mixed within a node).
- **Hierarchical stitching**: Nodes can connect to other nodes as parents or children, enabling nested swarms.
- **MCP-first**: One MCP endpoint is all any system needs to join the network.
- **Snap-in compatibility**: Minimal configuration required to connect at any level.
- **Transport flexibility**: Internal WebSocket by default + optional Matrix, Slack, Discord, etc.
- **Lightweight & self-hosted**: No heavy infrastructure required.

## v0.1 — Foundational Node System (Current Priority)

**Goal**: Build the core that makes node registration, communication, and basic coordination work reliably for both personal multi-machine use and as a foundation for larger hierarchies.

### Must-Have Features
- `swarmcom init` command that generates `swarmcom-network.json` and outputs the MCP WebSocket endpoint.
- **MCP Server** with WebSocket transport (reuse socket patterns from Autonomo where possible).
- **Node Registration** via MCP:
  - `register_node(node_id: string, role: "boss" | "peer" | "worker", name: string, capabilities: string[], parent_node_id?: string)`
- Core MCP tools:
  - `send_message(channel: string, content: string, target_role?: string, target_node_id?: string)`
  - `query_status(node_id?: string, task_id?: string)` — returns aggregated or node-specific status
  - `hand_off_artifact(from_node_id: string, to_node_id: string, description: string, context?: any)`
  - `query_network()` — returns overview of connected nodes and their roles
- Internal WebSocket-based communication backbone with lightweight persistence (JSON files or SQLite).
- Role-aware message routing and basic status aggregation.
- Clear setup guides for:
  - Cursor / Claude Code (native MCP)
  - OpenClaw (via community bridges like `freema/openclaw-mcp` or MCPorter skill)
  - Autonomo (as a verification node)

**Success Criteria for v0.1**:
- SwarmCom runs on multiple machines.
- Nodes can be registered with different roles.
- Basic status queries and handoffs work between nodes.
- The system meaningfully reduces coordination overhead for multi-machine workflows.

## v0.2 — Improved Usability & Multi-Transport

- Persistent task and node state using SQLite
- Matrix transport adapter (leveraging OpenClaw’s native Matrix support and existing matrix-mcp patterns)
- Configurable role-based channels (`#boss-room`, `#peer-room`, `#worker-room`)
- Simple CLI dashboard (`swarmcom status`, `swarmcom nodes`)
- Robust connection management and reconnection logic
- Autonomo integration for including verification state in status reports

## v0.3 — Hierarchical Node Stitching

- Full support for **nested hierarchies**: Nodes can declare parent/child relationships.
- Subtree status queries (`query_subtree_status(node_id)`)
- Cross-node handoffs with context preservation (including Autonomo state)
- Higher-level nodes can request summarized status from entire sub-nodes
- Optional Slack / Discord / Teams transport adapters

## v0.4 — Enterprise Readiness & Polish

- Audit logging and observability
- Basic role-based access control (optional)
- Docker images and easy deployment options
- Example configurations for different scales (single dev, team, organization)
- Performance improvements for larger networks (10+ nodes)

## v0.5+ — Future Directions

- Federation between separate SwarmCom networks
- Advanced auto-routing based on node capabilities
- Integration with AGENTS.md and other emerging standards
- Optional GUI dashboard

## Technical Guidelines

**Stack** (match Autonomo closely):
- TypeScript (Node.js)
- Reuse WebSocket / socket patterns from Autonomo
- MCP server implementation (WebSocket + HTTP/stdio support)
- SQLite for persistence
- Zod for schema validation

**Architecture Priorities**:
- Keep everything modular and composable.
- Design for hierarchical stitching from the beginning.
- Prioritize "snaps in easily" — joining a network should require minimal configuration.
- Stay lightweight. Avoid feature creep in early versions.

**Non-Goals (for now)**:
- Building a full multi-agent execution framework
- Replacing OpenClaw, Cursor, Autonomo, or other tools
- Heavy frontend UI (CLI-first approach)

---

**This is a living roadmap.**  
Start with **v0.1**. Focus on making the node registration, MCP communication, and basic handoff solid. Once the foundation is strong, the hierarchical stitching capabilities will naturally extend the project to any scale.

The power of SwarmCom lies in its **node-based design** — it can snap in at the individual developer level or at the organizational level without forcing a one-size-fits-all structure.

Point your LLM coder to this file and instruct it:  
**"Implement SwarmCom following this roadmap, starting with v0.1. Prioritize a clean node-based architecture with flexible roles (boss/peer/worker) and support for hierarchical stitching."**
