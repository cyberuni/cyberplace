---
name: cyberlegion-plugin-init-skill
status: active
todos:
  - content: "author init-cyberlegion skill node (SKILL.md + README): probe via admin doctor, run cyberlegion init, detect root, ask, then identity owner --handle legate + identity bind-main"
    status: pending
  - content: "add init classification row to the legate skill map; surface init-cyberlegion from the top-level cyberspace init companion discovery"
    status: pending
  - content: "spec gate (aced or default per artifact-type=skill) + impl + handoff"
    status: pending
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
routing setup intents here, and surface `init-cyberlegion` from the top-level `init` skill's companion
discovery (`plugins/cyberspace/skills/init/SKILL.md` step 5).

## NEXT

Run start-mission against `.agents/specs/cyberlegion-plugin`. Artifact-type = skill → aced squad
(spec-producer aced-scenario-writer, impl-judge aced-impl-judge) per the registry. Author the skill
node's spec + .feature (activation triggers + the delegate-to-CLI behavior), gate, build, handoff.
