# DASHBOARD_INTEGRATION.md

**Last updated:** March 28, 2026

## Core Philosophy

The dashboard is **not** a special component.  
It is simply **another client** in the swarm that speaks the same language as everything else.

Any action taken in the dashboard (typing a message, clicking a quick action, updating a task) should be **indistinguishable** from the human typing directly into their code editor or MCP-enabled tool.

This removes complexity and keeps the entire system consistent.

## How Messages Flow

1. Human interacts with the dashboard (types message or clicks button)
2. The React frontend sends the message through the standard `swarmcom-client.ts` SDK
3. The message is posted to the Matrix room **exactly** as if it came from the user’s IDE
4. All agents (including any MCP-integrated tools) receive and process it normally
5. The dashboard listens to the same room and updates its UI in real time

→ There is **no special “dashboard message”** type.  
→ There is **no special handling** required by agents.

## Practical Examples

**Human sends a command from dashboard:**
- User clicks “Request Status Update” on a worker node
- Dashboard sends a message that looks like the user typed: