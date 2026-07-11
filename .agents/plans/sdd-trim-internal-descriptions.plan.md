---
name: sdd-trim-internal-descriptions
status: active
todos:
  - content: "sweep 39 user-invocable:false SKILL.md descriptions → identity + caller only (3 sonnet agents by plugin: sdd governances 15, sdd non-gov 14, aced+cyberlegion 10)"
    status: completed
  - content: "review: description-line-only (verified), pnpm verify 19/19 GREEN. EXCLUDED as false positives (whole-file grep matched body prose, not frontmatter): sdd:manage + aced:define-governance are genuinely USER-FACING (Use-this-skill-when, no user-invocable:false). Also excluded plan-retirement (#121) + backfill-project-spec (already minimal)."
    status: completed
  - content: "commit + PR"
    status: in_progress
---

# CR — trim internal (non-user-invocable) skill descriptions

Chore / hygiene. Branch `sdd-trim-internal-descriptions` off `main`. No behavior change — metadata
conformance to `skill-design` governance.

## Why

A `user-invocable: false` skill's `description` is **not a trigger** — the skill is invoked by name
by its caller (a gateway, the conductor, the Scanner, a spawned judge), never matched to a user
situation. Verbose mechanical detail there:
- buys nothing at match time,
- is truncated in context (`skill-design.md:104` — keep `description` ≤120 chars),
- **duplicates** the body + README contract — a second copy that must be kept in sync (CR #121's
  impl-judge flagged plan-retirement's as stale; this CR removes that whole failure mode corpus-wide).

`skill-design.md:36`: a sub-skill needs only the `"Internal skill:"` prefix + the named caller to
prevent accidental activation. That is the whole job of the field here.

## The formula

Rewrite each to identity + caller, one plain single-line string:

    "Internal skill: <one-line what it is> — <who invokes it>, not user-triggered."

Keep: the `"Internal skill:"` prefix, the one-line identity, the named caller. Drop: procedures,
enum lists, file paths, predicates, step-by-step — that all already lives in the body + README.

## Scope

All `user-invocable: false` SKILL.md across `plugins/sdd`, `plugins/aced`, `plugins/cyberlegion`
(41 files). **Exclude:** `plugins/sdd/skills/plan-retirement` (already trimmed in PR #121) and
`plugins/sdd/skills/backfill-project-spec` (already 41 chars, minimal). Leave any other file whose
description is already ≤~140 chars and formula-shaped.

## Guard (per skill)

The identity + caller are **already present** in each current description — keep those clauses,
strip the operational middle. Only skim the body/README if a description clause looks like the
**sole** home of a fact (rare — bodies are dense by design). Never drop the `"Internal skill:"`
prefix; never touch any other frontmatter field, the body, or the README.

## Verify

`pnpm verify` (root — runs the skill audit). Commit, PR against `main`.
