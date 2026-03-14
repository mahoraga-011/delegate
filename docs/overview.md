# Delegate Overview

## What it is

Delegate is a **safe execution layer for autonomous agents**. Instead of letting an LLM-powered agent directly execute tools, Delegate requires each proposed action to pass through an explicit policy evaluation step first.

## Why it matters

Autonomous agents are useful, but the moment they get access to shell commands, write privileges, or external systems, the risk profile changes fast. Delegate makes that boundary visible and deterministic.

## MVP promise

For the hackathon MVP, Delegate proves four things:

1. Policies can be defined in a human-readable form.
2. Agent action requests can be normalized into a structured input.
3. Deterministic checks can decide allow/deny without prompt ambiguity.
4. Every decision can be preserved as an audit event.

## Intended users

- AI product teams shipping agent features quickly
- operators who want a guardrail before agents take action
- hackathon judges looking for a concrete safety primitive instead of vague AI safety claims

## What makes it feel credible

- the rules are explicit
- the result is explainable
- the audit log is visible
- the app feels like a real control surface, not just a landing page
