---
name: rename-durability-to-tracked
status: active
todos:
  - content: "Grill: converge .sddignore semantics + manage-ignore shape"
    status: in_progress
  - content: "Ratify frozen re-open for resolve-tracking node (matcher behavior change, not just rename)"
    status: pending
  - content: "Rewrite intake node README + feature: tracked|ignored verdict + .sddignore last-match-wins"
    status: pending
  - content: "Reimpl matcher: TOML map/most-specific-wins -> gitignore patterns + ! + last-match-wins"
    status: pending
  - content: "Rename tool + node dir: resolve-durability -> resolve-tracking (git mv, code ids, tests)"
    status: pending
  - content: "NEW node manage-ignore: spec + feature + engine (list/CRUD/induce/preview), route from manage gateway"
    status: pending
  - content: "Sweep classification-sense durability refs across sdd spec + plugins/sdd skills"
    status: pending
  - content: "Sweep ADRs + website docs + changesets for classification-sense refs"
    status: pending
  - content: "Spec gate (freeze both nodes) + impl gate (scripts/tests green) + handoff"
    status: pending
---

# CR: rename the durability *classification* to tracked | ignored

Change-request against `.agents/specs/sdd` (project-path `plugins/sdd`). **Revise** of the
frozen intake node `resolve-durability`. Source: local (naming-fit).

## NEXT

DONE — committed on branch `rename-durability-to-tracked` (6f4e314). Both gates self-asserted
(ledger seq 1-3), both node .features frozen, `pnpm verify` green (13/13). Awaiting: user
decision to push + open PR (delivery shape = branch → PR).

Follow-ups (file as new CRs, do NOT block this one):
- Doc-link off-by-one: node README concrete-engine links use `../../../../` (4) but need
  `../../../../../` (5) to reach repo-root `plugins/`. Pre-existing corpus-wide (plan-discovery
  has it too); the two new nodes copy it. Warden/formation fix all at once.
- Coverage edge: no scenario for a malformed `.sddignore` at *resolve* time (only validate);
  non-blocking (resolve path fail-closes, never errors).
- Historical ledger shards `local-*durability*.jsonl` keep their names (immutable provenance).

## Rename map (classification sense ONLY)

| From | To |
|------|-----|
| verdict `durable` / `non-durable` | `tracked` / `ignored` |
| skill/tool/node `resolve-durability` | `resolve-tracking` |
| `.agents/sdd/durability.toml` (TOML map) | `.agents/sdd/.sddignore` (gitignore syntax) |
| "durability signal" / "durability resolution" | "tracking signal" / "resolve tracking" |
| `--explicit durable\|non-durable` | `--explicit tracked\|ignored` |
| code ids `DurabilityMap` `DurabilityBinding` `DurabilityFromMap` | `IgnoreRules` / `TrackingRule` (grill) |
| "escape by durability" | "ignored escapes" / "escape by tracking status" |

## `.sddignore` semantics (B — the behavior change)

- **Location:** `.agents/sdd/.sddignore` (sibling of the other sdd config). gitignore syntax.
- **Meaning:** a matched pattern ⇒ **ignored**; `!pattern` ⇒ **tracked** (the re-include /
  override). Unmatched ⇒ fall through to the next resolution step.
- **Ordering:** **last-match-wins** (gitignore standard) — REPLACES the old
  most-specific-glob-wins. This is the frozen-scenario rewrite.
- **Resolution order (unchanged shape, step 2 swapped):**
  1. `--explicit tracked|ignored` wins outright.
  2. `.sddignore` — last matching rule decides (`!` = tracked); unmatched falls through.
  3. Kind default (skill/subagent/command location convention).
  4. Fail closed → **tracked**.
- **Polarity note now clean:** gitignore is inherently an opt-out list over
  "everything's a candidate," which is exactly SDD's govern-by-default. The earlier
  add-first caveat dissolves under B.

## NEW node: manage-ignore (mirror manage-spec-anchors)

- New capability node under `intake/` (or `manage/`), engine `.mts`, routed from the
  `manage` gateway (alongside `manage-spec-anchors`).
- Features to mirror: **list** current rules (explain syntax) · **add/remove** a rule (CRUD) ·
  **induce** a pattern from a sample path · **preview** which paths a pattern ignores/tracks
  before saving. Writes ONLY `.sddignore`, never spec content.
- Separate node from resolve-tracking (resolve = read/derive; manage = curate).

## KEEP (do not rename — permanence adjective, different word-sense)

"durable ledger", "durable project spec", "durable root `ledger/` directory", "durably".
A "tracked ledger" would not mean the same thing.

## Ambiguous cases to resolve in the grill / Warden pass

- `intake/README.md:212` "when a durability-escaped artifact later moves to a **durable node**"
  — "durable node" here leans gate-sense; likely -> "tracked node".

## Leash (run-start)

Blast radius HIGH (~400 classification-sense hits across the frozen SDD spec, ADRs, docs).
Leash proposed: **auto-none** — stop for user at scope confirm, at the frozen re-open
ratification, and before the corpus sweep. Not executing autonomously while user away.
