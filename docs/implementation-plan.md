# Delegate Implementation Plan

## Hackathon scope

### Phase 1 — Product shell
- Create a Next.js TypeScript app
- Set visual direction and landing/dashboard hybrid layout
- Add docs for overview, branding, and architecture

### Phase 2 — Core safety primitive
- Define a typed policy schema
- Define a typed action request schema
- Implement deterministic rule evaluation
- Generate explainable results from policy checks

### Phase 3 — Demo workflow
- Render selectable policy profiles
- Capture an action request from the UI
- Show real-time allow/deny output
- Append submissions to an audit log

### Phase 4 — Polish
- Seed sample entries
- Tighten copy and visual hierarchy
- Verify lint/build pass cleanly
- Initialize local git history if needed

## Post-hackathon roadmap

### Near term
- persist data with SQLite or Postgres
- add API routes for remote agent runtimes
- attach human approval checkpoints for medium-risk actions

### Mid term
- support policy packs and reusable capability templates
- add organization/workspace concepts
- integrate with tool runners and agent orchestration stacks

### Longer term
- cryptographic audit trails
- signed execution envelopes
- sandbox adapters for shell, browser, and network actions
- policy simulation and red-team replay tooling

## Success criteria for the MVP

The demo is successful if someone can open the app and immediately understand:
- what an agent is trying to do
- what policy governs it
- why the action is allowed or denied
- where the audit record ends up
