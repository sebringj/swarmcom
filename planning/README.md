# Planning Workspace

This folder turns the high-level product idea in the root docs into an execution package for building SwarmCom.

Recommended reading order:

1. `implementation-plan.md` for delivery sequence and milestones
2. `architecture.md` for system shape and technical decisions
3. `feature-breakdown.md` for scope and priority
4. `repo-structure.md` for how the codebase should be laid out
5. `transport-options.md` for selecting Matrix versus Teams, Telegram, Slack, or other adapters
6. `matrix-deployment.md` for hosted versus self-hosted Matrix guidance

Current repo state:

- Product intent is defined in `README.md` and `ROADMAP.md`
- No application scaffold exists yet
- The immediate need is to align on v0.1 scope and create the first implementation pass cleanly

Build-first guidance:

- Start with a single TypeScript package unless a second package is clearly needed
- Keep the first version CLI-first and server-first
- Optimize for node registration, status visibility, and messaging before any advanced transports
- Treat boss control as a permissioned extension of messaging, not as a separate orchestration system

Definition of success for the next step:

- A runnable Node.js TypeScript project exists
- `swarmcom init` creates local config and persistence setup
- An MCP-accessible server can register nodes, report network state, and relay messages
- The first example workflow works across at least one boss node and one worker node