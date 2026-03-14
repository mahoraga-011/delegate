# Delegate

Delegate is a hackathon-scoped MVP for **safe agent execution**: a thin, deterministic policy layer that sits between an autonomous agent and any real action.

This project ships:
- a polished Next.js + TypeScript + Tailwind web app
- a deterministic policy engine for agent action requests
- a simple audit log model with seeded entries
- lightweight product docs for positioning, architecture, and implementation

## Core demo flow

The app demonstrates four steps:
1. **Define a policy** by choosing a policy profile with explicit rules
2. **Submit an agent action request** with action type, tool, target, risk, and justification
3. **Run deterministic policy checks** that always produce the same result for the same input
4. **Append an audit log entry** showing allow/deny plus the evidence behind the decision

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- React 19

## Local development

```bash
cd delegate
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production build

```bash
cd delegate
npm run build
npm start
```

## Project structure

```text
delegate/
├── docs/
│   ├── architecture.md
│   ├── branding.md
│   ├── implementation-plan.md
│   └── overview.md
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── delegate.ts
└── README.md
```

## Product framing

Delegate is not trying to be a full agent platform yet. The MVP is intentionally narrow:
- deterministic, human-readable rules
- visible allow/deny decisions
- simple append-only auditability
- easy to extend into API-backed policy enforcement later

## Notes

- Current state is intentionally client-side and hackathon-friendly.
- The policy engine is pure TypeScript, making it easy to move to a server route or shared package.
- Audit entries are in-memory for the demo, but the structure is ready for persistence.
