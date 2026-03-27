# Transport Options

## Decision Framing

SwarmCom should not treat every chat or messaging platform as equally suitable.

The transport layer needs to support these priorities:

- private or self-hosted operation where possible
- reliable cross-node messaging
- room or channel semantics
- good automation compatibility
- stable APIs and bridgeability
- low duplication of logic inside SwarmCom

## Recommendation

### Best Primary Transport: Matrix

Matrix is the strongest default primary transport for SwarmCom.

Why it fits:

- open protocol
- self-hostable
- already aligned with multi-agent and bridge-heavy setups
- room-based messaging maps cleanly to role or node channels
- better architectural fit for a private coordination layer

Use Matrix first for:

- cross-machine messaging
- room-based coordination
- role-targeted broadcasts
- presence and event propagation where practical

Recommended starting points:

- Hosted: Element Matrix Services (EMS)
- Self-hosted: Synapse on AWS or Azure

## Other Transport Options

### Teams

Teams can be a useful enterprise adapter, but it should not be the primary architecture target.

Pros:

- common in enterprise environments
- useful where users already live in Microsoft 365
- good for notifications and operational visibility

Cons:

- vendor-controlled ecosystem
- less natural as a low-friction self-hosted backbone
- API and permission model can add operational complexity
- weaker fit for local developer-first setups

Verdict:

- good optional adapter
- not the default transport backbone

### Telegram

Telegram can be useful for lightweight notifications and remote command relays, but it is a weak primary transport for this product.

Pros:

- simple bot model
- easy to get quick message flows working
- useful for alerts and lightweight operator commands

Cons:

- weaker fit for structured multi-node state
- less suitable for private internal network semantics
- room and permission modeling is not as clean for this use case
- not ideal as the canonical transport for persisted coordination

Verdict:

- good secondary adapter for alerts or lightweight interaction
- not a strong primary network choice

### Slack

Slack is useful as an operational surface, but similar to Teams it is better as an adapter than as the backbone.

Verdict:

- useful for visibility and notifications
- not ideal as the primary protocol layer

### Discord

Discord can support rooms and bots well enough, but it is usually a community-facing transport rather than a serious primary backbone for this kind of system.

Verdict:

- optional adapter
- not the preferred default

## Suggested Strategy

Use a transport tier model.

### Tier 1: Primary

- Matrix

### Tier 2: Strong Secondary Adapters

- Teams
- Slack

### Tier 3: Lightweight or Situational Adapters

- Telegram
- Discord

## Product Rule

SwarmCom should have exactly one canonical internal message and status model regardless of transport.

That means:

- Teams messages map into the same internal message shape as Matrix messages
- Telegram alerts map into the same command and event flow
- no transport gets custom domain logic

## Practical v0.1 Recommendation

Ship with:

- MCP adapter
- Matrix adapter
- OpenClaw compatibility path

Recommend to users:

- EMS for fastest adoption
- Synapse on a cloud VM for full-control deployments

Defer until later:

- Teams adapter
- Telegram adapter
- Slack adapter
- Discord adapter

## One Important Clarification

If by "the ones that Claude uses" you mean channels or adapters commonly used around agent tooling, they may still be useful surfaces.

But SwarmCom should not optimize for where an agent can post messages first.

It should optimize for:

- stable transport semantics
- private deployment
- multi-node coordination
- low architectural duplication

On those criteria, Matrix is still the best primary fit.