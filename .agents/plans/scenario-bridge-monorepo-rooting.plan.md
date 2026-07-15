---
name: scenario-bridge-monorepo-rooting
status: active
todos:
  - content: "Intake: CR against sdd verify-scenarios + impl-judge nodes, plan brief"
    status: completed
  - content: "Explore: re-verify two-roots bug, confirm ownership seat (sdd:manage), grill spec.md + .feature diffs, cold spec-judge, build-to-learn spike"
    status: completed
  - content: "Spec gate: freeze new/changed scenarios, gate line, status: approved"
    status: completed
  - content: "Deliver: engine --feature-root/--root split + per-project discovery, impl-judge step-0 doctrine update, new manage-scenario-bridge engine, tests, impl-judge"
    status: completed
  - content: "Impl gate; pnpm verify; handoff branch + PR"
    status: completed
---

# scenario-bridge-monorepo-rooting — decouple feature-root from bridge/report-root

CR against `.agents/specs/sdd/mission/verify-scenarios` and `.agents/specs/sdd/mission/impl-judge`.

## The bug (re-verified in explore)
`verify-scenarios.mts` resolves `--feature`, `--config`, and each source's `reportPath` all under one
`--root` (`underRoot()`, `plugins/sdd/skills/verify-scenarios/scripts/verify-scenarios.mts:38-121`).
This repo roots specs at `.agents/specs/<project>/` (repo-root) but code+config+report at the
project's `project-path` (e.g. `packages/cyberlegion`, already a root `spec.md` frontmatter field —
`discover-specs` already emits it). One `--root` cannot serve both, so `sdd-impl-judge.md:124-136`
(step 0) looks for `.agents/sdd/scenario-bridge.toml` at repo-root, never finds the per-project one,
and silently falls back to full by-hand judging — confirmed only `packages/cyberlegion/.agents/sdd/scenario-bridge.toml`
(commit 026cd6b7) exists, hand-run with `--root packages/cyberlegion`. Plan #108 fixed a different bug
(absolute-path double-prefixing) — not this one.

## Design direction (confirmed in explore, subject to the grill + spec-judge)
- Engine: split `--root` into `--feature-root` (defaults to cwd; resolves `--feature`) and `--root`
  (the project/bridge root; resolves `--config` default path, `--report`, and every source's
  `reportPath`) — `underRoot` stays the same pure function, called with the right root per path class.
- impl-judge step 0: name which root — the project's `project-path` (root `spec.md` frontmatter,
  already discovered by `discover-specs`) — as the bridge root, discovered **per project**, not a
  single hardcoded repo-root path.
- Ownership: the `scenario-bridge.toml` config is one-time per-project wiring with no owning skill
  today (impl-producer-governance:34 owns the *binding tests*, not the config). Home: a new
  `sdd:manage` **Setup & discovery** engine (sibling to `manage-spec-anchors` / `manage-ignore` —
  same shape: writes only its one config file, no CR, no gate).

## NEXT
Done — landed as PR #259 (https://github.com/cyberuni/cyberplace/pull/259), branch
`sdd/scenario-bridge-monorepo-rooting`. Ledger: `.agents/specs/sdd/ledger/scenario-bridge-monorepo-rooting.0f4ead.jsonl`.
One backlog follow-up recorded there (pre-existing `manage-ignore` omission from
`.agents/specs/sdd/gateway/manage/README.md`, unrelated to this CR) — not filed as an issue, flagged
to the user at handoff instead.
