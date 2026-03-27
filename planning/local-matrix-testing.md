# Local Matrix Testing

## Goal

Provide a repo-local way to run a Matrix homeserver for SwarmCom development and transport testing.

## Current Approach

Use a local Synapse container through Docker Compose.

File:

- `docker-compose.matrix.yml`

Data directory:

- `.swarmcom/matrix/data`

## Why This Exists

- lets SwarmCom test against a real Matrix homeserver
- avoids requiring external Matrix hosting during development
- keeps the development path close to the production transport model

## Commands

Generate Synapse config:

```bash
npm run matrix:generate
```

Start Synapse:

```bash
npm run matrix:up
```

Stop Synapse:

```bash
npm run matrix:down
```

Watch logs:

```bash
npm run matrix:logs
```

## Typical Test Flow

1. Generate Synapse config once
2. Start Synapse
3. Create a test user or bot account
4. Create boss, peer, and worker rooms
5. Populate `.env` with local Matrix values
6. Run SwarmCom in `matrix` transport mode

## Notes

- this is a development harness, not a production deployment
- `localhost:8008` is the expected local homeserver URL
- federation is not the focus here