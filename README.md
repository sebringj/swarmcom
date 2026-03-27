# SwarmCom

**The lightweight communication layer for your agent systems.**

<img src="fbb86f04-6a62-4dce-b407-8132f660375b.jpg" alt="SwarmCom Logo" height="120" width="auto">

**Purpose**:  
SwarmCom makes it easy to know **where things stand** across multiple independent agent systems (machines, tools, or people) and optionally send messages or instructions when needed.

It connects Cursor, Claude, Copilot, OpenClaw instances, and other MCP-compatible tools into a coherent network — without forcing heavy control or complex setup.

### Why SwarmCom?

When running multiple machines or agent setups, developers quickly face scattered context and constant manual coordination.  

SwarmCom solves this by acting as a **thin, private communication backbone**. You get:
- Clear visibility into the current status across all your nodes
- Simple messaging between systems
- Optional boss-level control (only on nodes that explicitly allow it)

It is **node-based** and **hierarchical** by design — each node can have its own bosses, peers, and workers, and nodes can be stitched together at any scale (from one developer’s multi-machine setup to large organizations).

## Key Features

- **MCP-native** — One MCP endpoint is all any tool needs to connect
- **Visibility-first** — Easy aggregated status queries across all nodes
- **Optional communication & control** — Send messages or instructions only when a node accepts boss control
- **Node-based roles** — Flexible `boss`, `peer`, and `worker` roles per node
- **Hierarchical stitching** — Nodes can form nested structures (personal → team → organization)
- **Dual integration** — Works natively with MCP clients (Cursor, Claude, Copilot) and OpenClaw (via community MCP bridges)
- **Flexible transports** — Internal WebSocket by default + optional Matrix support
- **Private & self-hosted** — Everything stays on your machines

## Quick Start

```bash
# 1. Install
npm install -g swarmcom
# or clone and build from source

# 2. Initialize your network
swarmcom init
