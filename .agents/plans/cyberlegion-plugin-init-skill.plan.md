---
name: cyberlegion-plugin-init-skill
status: active
todos:
  - content: "explore: draft init/ node spec.md + init-cyberlegion.feature (aced-scenario-writer), grill + spec-judge"
    status: completed
  - content: "spec gate: freeze init-cyberlegion.feature, status write-back"
    status: completed
  - content: "deliver: build init-cyberlegion SKILL.md + README to keep; add init row to legate map (gateway node); impl gate"
    status: completed
  - content: "handoff: branch/PR, follow-ups"
    status: completed
---

# CR cyberlegion-plugin-init-skill — the interactive onboarding skill (follow-up to init-legate)

Target spec: `.agents/specs/cyberlegion-plugin` (project-path `plugins/cyberlegion`). Follows the
landed CLI CR `cyberlegion-init-legate` (a thin wrapper over its verbs — the same pattern
`manage-inbox` followed the owner-mailbox package CR).

## CR

Add the user-facing `init-cyberlegion` skill under `plugins/cyberlegion/skills/`, cyberlegion house
style (name + description, version-pin blockquote, `## Boundaries`; model on `init-commit-discipline`,
not the in-skill-JSON init-aced/quill pattern). Interactive flow, delegating every mechanic to the CLI:
1. Probe — `cyberlegion admin doctor` (harness + mux/pane + self-id).
2. Register the hook — `cyberlegion init [--agent <detected>]`.
3. Detect root — top-level pane / `!spawnedBy` (from doctor/`whoami`).
4. If root and no `legate` owner bound: ask the user to bind this pane as the main/legate inbox.
5. On yes: `cyberlegion identity owner --handle legate` + (in a pane) `cyberlegion identity bind-main`.

Also: add an `init` row to the `legate` classification map (`plugins/cyberlegion/skills/legate/SKILL.md`)
routing setup intents here.

**Scope decision (this run):** the top-level cyberspace `init` step-5 companion surfacing is a
different project spec (`plugins/cyberspace`) — dropped from this CR. Its discovery already scans
`init-*` skills generically, so `init-cyberlegion` surfaces there with no explicit edit. File a
cyberspace-spec CR only if an explicit routing note is wanted later.

## NEXT

Spec+impl gates PASSED (aced spec-judge ALIGNED; aced impl-judge 18/18). `pnpm verify` green. Skill
`plugins/cyberlegion/skills/init-cyberlegion/` built; legate map disambiguated. Remaining: open the PR,
then let the detached Warden formation pass run. Root `cyberlegion-plugin` status stays `draft` until
gateway/dispatch features are also gated (owed — separate CRs).

Follow-ups: (1) gateway/gateway.feature + dispatch/dispatch.feature owed; (2) optional cyberspace init
step-5 explicit routing note (dropped from this CR — generic init-* discovery already surfaces it).
