---
title: init-aces
description: Register ACES as the SDD plugin for agent-configuration domains.
---

Part of the [ACES plugin](/aces/overview/) — see that page for install instructions.

**Trigger:** "set up ACES for this project", "register ACES as the SDD plugin"

Registers ACES in the project's SDD plugin registry so the [SDD](/sdd/overview/) conductor resolves the ACES production-chain roles by reading only `.agents/universal-plugin.json` — no plugin-directory scanning at runtime.

## What it does

1. Locates (or creates) `.agents/universal-plugin.json` at the project root.
2. Reads ACES's own version from its plugin manifest.
3. Writes (or rewrites, on upgrade or legacy shape) the `aces` entry under `sdd-plugins` with a single squad serving artifact-types `skill`, `subagent`, `command`, `agents-section`:
   - `spec-producer: aces-scenario-writer`, `spec-judge: aces-spec-validator`, `impl-judge: aces-impl-judge`
   - `impl-producer: null` — writing the agent config itself is done by [`define-agent`](/aces/define-agent/) / [`improve`](/aces/improve/) or the SDD-default impl-producer, not a bound agent
   - `solution-producer: null` — uses the SDD default
   - Binds its own `builder-spec` / `builder-impl` bars; other governance slots stay `null` (SDD default)

## Key behavior

- **Fails closed on a corrupt registry file** — if `.agents/universal-plugin.json` exists but is malformed JSON, it stops with an error rather than overwriting it.
- Rewrites (not appends) an existing `aces` entry found in a legacy shape or with a stale version, without disturbing other plugins' entries.
- Requires every squad to carry a `governances` block (bindings may be `null`, but the block itself must be present) — rejects a payload missing it.

## Next step

Run [`sdd:start-mission`](/sdd/overview/) to scaffold an agent-configuration spec; the conductor resolves the ACES roles automatically.
