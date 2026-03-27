# Matrix Deployment Modes

## Goal

Document the Matrix deployment assumptions SwarmCom should make for v0.1.

SwarmCom should integrate with Matrix as a client and service layer. It should not require users to become Matrix infrastructure experts before they can evaluate the product.

## Recommended Deployment Modes

### Option 1: Hosted Matrix

Recommended provider:

- Element Matrix Services (EMS)

Why this is the default recommendation:

- lowest operational burden
- credible and well-known in the Matrix ecosystem
- suitable for organizations that want production use without self-hosting immediately
- good README recommendation because it reduces setup friction

Best for:

- teams that want to get running quickly
- early pilots
- organizations without appetite for self-hosting communications infrastructure on day one

### Option 2: Self-Hosted Matrix

Recommended baseline:

- Synapse on a cloud VM

Cloud examples:

- AWS EC2
- Azure VM

Why this is the recommended self-hosted path:

- widely understood
- strong documentation footprint
- practical for internal org deployments
- good fit when control, policy, and data ownership matter

Best for:

- internal enterprise deployments
- security-sensitive teams
- orgs that already operate their own cloud infrastructure

## What SwarmCom Should Assume

For v0.1, SwarmCom should assume one of these is true:

- the user already has access to a Matrix homeserver
- the user can provision EMS
- the user can stand up Synapse on a VM

SwarmCom should not assume:

- automatic Matrix server provisioning
- high-availability Matrix deployment
- mandatory federation
- complex enterprise SSO on day one

## Recommended Org Guidance

For an organization, the simplest realistic guidance is:

1. Start with one Matrix homeserver
2. Use a dedicated service account for SwarmCom
3. Keep federation disabled unless there is a reason to enable it
4. Create a small set of rooms for node or role coordination
5. Add SSO or deeper policy controls later if needed

## v0.1 Documentation Position

The docs should recommend:

- EMS for the fastest hosted path
- Synapse on AWS or Azure for the self-hosted path

This keeps the recommendation concrete without making SwarmCom vendor-locked.