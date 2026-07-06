# CR-B — SDD suite token reduction (design)

## Goal
Cut token usage in the SDD mission loop around **defining and consuming behavior suites** (`.feature`), by delegating mechanical work to scripts/engines. Target the costly *consume* side (judges/gate re-deriving what a script can compute).

## Where tokens burn (touch-point findings)
- **Define:** spec-producer already self-checks with `check-suite.mts` before returning — already off the LLM.
- **Consume (costly):**
  - spec-judge spawned **cold every grill round** (up to 3×) — each re-runs `resolve-governances`, re-loads every bar body, **re-composes precedence by hand**. No warm carry-over.
  - impl-producer + impl-judge repeat resolve→load→compose for impl bars.
  - gate digest reads raw `.feature` to list added/modified/narrowed scenario names — re-tokenizing by hand.
  - `check-suite.mts` already builds a full structured parse (names, tags incl `@frozen`/`@rubric`, ordered steps, outlines, examples, counts) but **discards it** — emits only violation strings. Every judge re-tokenizes from raw text.

## Optimizations (this CR)
1. **Shared Gherkin parser → plugin-root neutral lib.** `check-suite` owns a hand-rolled tokenizer; `check-spec-structure` re-implements a mini `countScenarios`; the new engines (#3/#4) want the same parse. Extract one parser to a plugin-level home; consumers import it. Kills the duplication (already drifting: mini vs full).
2. **`resolve-governances --compose` mode.** Matcher is deliberately "dumb" (candidates by tier); every consumer re-runs the precedence fold `sdd < plugin < project-root < project` + `compose: replace` as LLM reasoning. Add a mode that emits the final ordered, replace-applied load-list. Consumers load the named set — zero precedence reasoning.
3. **Mechanical additive-detection engine.** `git diff` a touched `.feature` vs its committed version; classify per scenario: **added** (new `Scenario:`, nothing else touched — mechanical, safe → additive self-clears **without a judge round**) vs **touched** (needs a judge look). Narrowing-vs-rewrite stays semantic. Contradiction is a hard floor (Conflict) → additive still needs a contradiction-only check, not a full re-grade.
4. **`check-suite` manifest output (`--format toon`).** Emit the already-built parse — scenario names + tags (`@frozen`/`@rubric`) + counts. Gate digest + judges consume the manifest instead of re-tokenizing raw `.feature`.
5. **Wiring.** Propagate the conductor's lazy-load discipline (load bar *names* up front, *bodies* only at the invoking bar) into the judge agent defs (which still say "load each candidate body and compose"). Judges/conductor consume the composed set (#2) + manifest (#4).

## Off the table (by design)
- impl-judge re-deriving each scenario's oracle regardless of blast radius — ADR-0016 independence. The re-derivation IS the verdict.
- Semantic judgments (coverage, ordering rationale, near-miss balance, narrowing detection) — need the LLM.

## Boundary decision (settled)
Plugin-root shared lib is **agentskills-conformant**: the spec allows scripts to reference documented external deps and is silent on plugins; the strict "same-folder only" rule is cyberplace's own S4, stricter than the standard. S4 scans only SKILL.md refs, **not `.mts` imports** — so the shared-lib import never trips it. Mitigate the `npx skills add --skill <member>` runtime dangle with:
- `compatibility` frontmatter on member skills: "Part of the SDD plugin — install the full plugin, not this skill alone".
- a fail-loud guard in each entry script (clear "install the plugin" message on import failure).
- a website "install as a plugin" note.
Relaxing S4 to match the standard = **CR-A**, a separate follow-up (full SDD backfill of an audit/self-containment node into the cyberplace spec).

## Spec nodes touched (provisional)
- `authoring/suite-format` — parser + manifest (`check-suite`)
- `mission/resolution` — `resolve-governances --compose`
- new engine node — additive-detection (place provisionally near suite-format)
- `mission/conductor` + judge nodes — lazy-load + consume composed set/manifest
