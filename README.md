# SwarmCom

**The lightweight communication layer for your agent systems.**

<img src="fbb86f04-6a62-4dce-b407-8132f660375b.jpg" alt="SwarmCom Logo" height="120" width="auto">

**Purpose**:  
SwarmCom makes it easy to know **where things stand** across multiple independent agent systems and optionally send messages or instructions when needed.

It connects Cursor, Claude, Copilot, OpenClaw instances, and other MCP-compatible tools into a coherent network — without forcing heavy control or complex setup.

### Why SwarmCom?

When running multiple machines or agent setups in parallel, developers face scattered context and constant manual coordination.

SwarmCom solves this by acting as a **thin, private communication backbone**. You get:
- Clear visibility into the current status across all your nodes
- Simple messaging between systems
- Optional boss-level control (only on nodes that explicitly allow it)

It is **node-based** and **hierarchical** by design — each node can have its own bosses, peers, and workers, and nodes can be stitched together at any scale.

## Key Features

- **MCP-native** — One MCP endpoint is all any tool needs to connect
- **Visibility-first** — Easy aggregated status queries across all nodes
- **Optional communication & control** — Send messages or instructions only when a node accepts boss control
- **Node-based roles** — Flexible `boss`, `peer`, and `worker` roles per node
- **Hierarchical stitching** — Nodes can form nested structures at any scale
- **Dual integration** — Works natively with MCP clients (Cursor, Claude, Copilot) and OpenClaw (via community bridges)
- **Flexible transports** — Internal WebSocket by default + optional Matrix support
- **Private & self-hosted** — Everything stays on your machines

## How SwarmCom Works

```mermaid
flowchart TD
    %% Styling definitions
    classDef swarm fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,rx:12,ry:12
    classDef boss fill:#e3f2fd,stroke:#1565c0,stroke-width:2.5px
    classDef worker fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px

    %% Main Components
    SwarmCom["<b>SwarmCom</b><br/>Communication Backbone<br/>(MCP Server + WebSocket)"]:::swarm

    subgraph "Your Agent Systems"
        Boss["Boss Node<br/>Cursor / Claude / Copilot"]:::boss
        Worker1["Worker Node<br/>OpenClaw Instance"]:::worker
        Worker2["Worker Node<br/>OpenClaw Instance"]:::worker
        Worker3["Worker Node<br/>Other System"]:::worker
    end

    %% Connections
    Boss <-->|MCP| SwarmCom
    Worker1 <-->|MCP| SwarmCom
    Worker2 <-->|MCP| SwarmCom
    Worker3 <-->|MCP| SwarmCom

    %% Optional external transport
    SwarmCom -.->|"Optional"<br/>Matrix / Slack| External["External Chat<br/>(Matrix, Slack, etc.)"]
```
