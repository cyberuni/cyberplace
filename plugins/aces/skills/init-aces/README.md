# init-aces

Registers ACES as an SDD plugin for agent-configuration domains (`skill`, `subagent`, `command`, `agents-section`) by writing a role-map entry to `.agents/universal-plugin.json` under `sdd-plugins[]`. Once registered, `sdd-orchestrator` resolves the ACES production-chain roles — `aces-scenario-writer` (spec-producer), `aces-spec-validator` (spec-judge), `aces-implementer` (impl-judge) — by reading only that one file at runtime (no plugin-directory scanning).

Idempotent: re-running rewrites an old-shape or version-stale entry in place (rewrite-on-init migration). Spec creation itself is owned by the `sdd` plugin's `create-spec` / `validate-spec`; this skill only wires the registry.
