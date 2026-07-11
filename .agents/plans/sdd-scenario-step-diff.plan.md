---
name: sdd-scenario-step-diff
status: active
todos:
  - content: "explore: settle where the additive/freeze classification lives + whether gherkin-cli diff already exposes per-scenario step identity; grill spec+suite for the change"
    status: in_progress
  - content: "spec gate: cold sdd-spec-judge over touched spec-gate/freeze .feature + README; freeze on approve"
    status: pending
  - content: "deliver: implement the scenario-step-level diff / fail-closed pre-judge check; one verification per frozen scenario"
    status: pending
  - content: "impl gate: cold sdd-impl-judge; advance status on all-pass"
    status: pending
  - content: "handoff: root pnpm verify, land, keep combat log"
    status: pending
---

# CR A — scenario-step-level structural diff (freeze/pre-judge integrity)

Ratified doctrine strategy (Council 2026-07). The remaining piece of the pre-judge / freeze
integrity work after d1 (`f1a1eda0`) landed the use-case-coverage + sibling-prose + referenced-artifact
checks. This CR is **d1's routed follow-up #1**, which `strategy.dae416` seq1 independently rediscovered.

Target spec: `.agents/specs/sdd` (the `authoring/spec-gate` node and/or the freeze/lifecycle model).
Impl: `plugins/sdd/skills/spec-gate/scripts/` (+ possibly the `gherkin-cli` diff consumer path).

## The gap

The additive-self-clear **freeze classifier** — which decides whether a `.feature` edit is purely
additive (self-clears, stays `@frozen`) vs a narrowing/rewrite (a re-open) — and the spec-gate
pre-judge check both risk keying on **raw git line-diff**. A context-line reassignment fools that: a
trailing step orphaned onto a new/adjacent scenario shows **no `-` line**, so a frozen scenario
silently loses an assertion and the edit reads as "additive." This was d1's own round-1 bug (an insert
Edit orphaned `And the gate spawns the cold judge` onto the next scenario). Fix: classify at the
**per-named-Scenario step level** so a step leaving an existing frozen scenario is caught mechanically,
before the cold judge.

## Explore — SETTLED

**Probe result (fixture: a frozen scenario's trailing step orphaned onto a new adjacent scenario):**
- Raw `git diff` is fooled — the orphan shows only `+ Scenario: gamma`, **zero `-` lines** → reads as
  purely additive.
- `gherkin-cli@0.0.1 diff --base <ref> --format json` is **correct** — reports the losing scenario as
  `modified`, the new one as `added`, and `addOnly: false`. AST-level; NOT fooled.

**So the gap is not gherkin-cli and not a missing differ.** The freeze/additive self-clear decision is
today only a **conductor prose procedure** (`start-mission` line 49, `spec-gate` SKILL line 154) — there
is **no fail-closed mechanical check**. An agent that eyeballs `git diff` (or skips gherkin-cli) can
self-clear a narrowing edit; d1's round-1 bug slipped the pre-filter for exactly this reason (caught
only by the cold judge). `check-suite.mts` (form) and `check-spec-state.mts` (lifecycle/coverage) do
no edit-class classification.

**Deliverable:** a fail-closed, `--files`-scoped mechanical **freeze edit-class check** that, for each
touched `@frozen` `.feature`, runs `gherkin-cli diff --base <baseref>` and **blocks self-assertion when
`addOnly` is false** (a baseline/frozen scenario is `modified` or `removed`) **without a ratified
re-open** — converting the soft "examine for narrowing" prose into a hard pre-judge gate. Wired the same
dual way as d1's checks: spec-producer self-run + `spec-gate` fail-closed pre-filter. Whole-scenario
additions keep self-clearing (`addOnly: true`); pure `git mv` renames stay exempt (zero content delta).

**Re-open exemption — RESOLVED, no new flag.** Per `lifecycle-governance` (lines 113–147): a legitimate
narrowing requires a ratified re-open, which **unfreezes the file** (clears `@frozen`) for a fresh cycle.
So the exemption is the `@frozen` tag itself — the check fires **only on files still carrying `@frozen`**.
A re-opened (unfrozen) file is skipped; an agent narrowing a still-`@frozen` file (skipping the ratified
re-open) is exactly what fails closed. Baseref = the file's committed HEAD version (`gherkin-cli diff
--base HEAD <file>`), same as the other `--files` pre-filters.

## Reconciliation notes (settled)

- d1 (`f1a1eda0`, on `main`) already shipped referenced-artifact-exists + use-case-row→scenario +
  sibling-prose sweep in `check-spec-state.mts`. NOT in scope here.
- d1 **follow-up #2** (backfill `Scenario`-column Use Cases tables so the landed use-case check has
  teeth against the live corpus) is a SEPARATE CR — not this one.

## NEXT — resume here

Explore is COMPLETE and the design is settled (above). Next action: **author the spec additively**
against `.agents/specs/sdd/authoring/spec-gate/` —
1. spec.md/README: a `## Use Cases` row + prose for the freeze edit-class pre-filter (fail-closed on a
   still-`@frozen` file with `addOnly:false`, exempt when unfrozen / whole-scenario-added / pure rename).
2. `spec-gate.feature`: **additive** boolean scenarios (frozen file + narrowing ⇒ blocked; + whole new
   scenario ⇒ self-clears; unfrozen file ⇒ skipped; pure `git mv` ⇒ exempt). Additive ⇒ self-clears the
   freeze, stays `@frozen`, no re-open.
3. Self-run `check-suite.mts` + `check-spec-state.mts` over the touched files, then the spec gate
   (cold `sdd-spec-judge`). Then deliver the check engine (new `check-freeze.mts` or fold into an
   existing script — decide at deliver) with one verification per frozen scenario.
Impl locus decision deferred to deliver: standalone `check-freeze.mts` vs extend `check-suite.mts`
(leaning standalone — it needs a git baseref the others don't take).
