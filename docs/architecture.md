# Delegate Architecture

## MVP architecture

The current implementation is intentionally simple:

```text
UI form → structured action request → deterministic policy engine → decision result → audit log entry
```

## Components

### 1. Policy definitions
Policies are plain TypeScript objects containing:
- policy metadata
- default effect (`allow` or `deny`)
- a list of explicit rules

### 2. Action request model
An agent request is normalized into a small schema:
- `actionType`
- `tool`
- `risk`
- `target`
- `justification`

### 3. Deterministic evaluation engine
The engine evaluates each rule with pure functions:
- string equality / inequality
- includes / not-includes matching
- numeric threshold checks

This avoids non-deterministic prompt interpretation during enforcement.

### 4. Decision object
Evaluation returns:
- final outcome (`allow` / `deny`)
- per-rule pass/fail checks
- a short reason string
- a scorecard with pass/fail counts

### 5. Audit log
Each submission becomes an audit entry with:
- timestamp
- policy name
- original request
- evaluation output

## Why this shape works for a hackathon

- minimal moving parts
- easy to demo live
- easy to explain to judges
- easy to extend into a real backend later

## Obvious next steps

- persist policies and audit logs in a database
- add user auth and approval workflows
- expose an API endpoint for agent runtimes
- support richer rule composition (`AND` / `OR`, regex, scoped capabilities)
- add signatures, replay protection, and immutable log storage
