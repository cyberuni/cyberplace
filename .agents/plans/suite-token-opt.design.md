# CR-B — SDD suite token reduction (design)

## Goal
Cut token usage in the SDD mission loop around **consuming behavior suites** (`.feature`), by delegating mechanical parse/diff work to the published **`gherkin-cli`** (`npx gherkin-cli@<pinned>`) and mechanizing what the LLM re-derives.

> **Pivot (from the original loose-lib plan):** parsing, the manifest, and additive-detection are no longer built inside SDD. They are provided by the external, AXI-conformant `gherkin-cli` (own cyberuni repo, published to npm), invoked via **pinned npx** — an external ref agentskills blesses, no plugin-root-lib / self-containment problem. `build-resolve-pins` pins the version. SDD's `.mts` engines never import it; they shell it and read `--format json`.

## Where tokens burn (unchanged analysis)
- spec-judge spawned **cold every grill round** re-runs `resolve-governances` + re-composes precedence by hand.
- gate digest + judges re-tokenize raw `.feature` by hand.
- additive-self-clear is decided by an LLM round today.

## Optimizations (this CR)

1. **Manifest via `gherkin-cli parse` (was #4).** Where the conductor / gate digest / judges today read raw `.feature` into LLM context, they instead call `npx gherkin-cli@<pin> parse <files>` and consume the compact TOON manifest (names, tags incl `@frozen`/`@rubric`, counts; `--full` for steps). SDD applies its own doctrine lints (adverb/rubric-noun bans) over that manifest — those stay SDD-side.
2. **Additive-detection via `gherkin-cli diff` (was #3).** The freeze / additive-self-clear decision calls `npx gherkin-cli@<pin> diff --base <ref> <file>` and reads `addOnly`. `addOnly: true` ⇒ purely additive ⇒ self-clears with **no judge round**. Any `modified`/`removed` ⇒ the judge is scoped to the changed scenarios (narrowing/contradiction stays semantic; Conflict is still a hard floor).
3. **`resolve-governances --compose` (#2, SDD-side, no gherkin).** Add a `--compose` mode that emits the final ordered, replace-applied governance load-list, so the producer + judges (every grill round) stop re-deriving the precedence fold as LLM reasoning.
4. **Wiring / lazy-load.** Propagate the conductor's lazy-load discipline into the judge agent defs; route the conductor/judges to consume the composed set (#3) + the manifest (#1) + the additive signal (#2).

## Optional / follow-up (not token wins)
- Repoint `check-suite.mts` / `check-spec-structure.mts` to `gherkin-cli` (robustness — drop the hand-rolled tokenizer + the drifting `countScenarios`). Improves correctness, not tokens; can be its own CR.

## Off the table (by design)
- impl-judge re-deriving each scenario's oracle (ADR-0016 independence).
- Semantic judgments (coverage, ordering rationale, near-miss balance, narrowing detection).

## Boundary decision (settled — see reference memory / ADR route)
`gherkin-cli` is invoked via **pinned npx** (external ref → agentskills-conformant; the strict cyberplace S4 only scans SKILL.md refs, and an `npx <pkg>@<ver>` ref is the blessed form `build-resolve-pins` already handles). No plugin-root shared lib, no `internal:true` hack. Relax-S4 (CR-A) remains an independent follow-up.

## Spec nodes touched (provisional)
- `mission/resolution` — `resolve-governances --compose`.
- `mission/conductor` + `authoring/spec-gate` — consume `gherkin-cli` manifest + `diff --addOnly`; the additive-self-clear mechanization.
- judge agent defs (`sdd-spec-judge`, `sdd-impl-judge`) — lazy-load + consume the composed set/manifest.
- A new/updated reference note on the `gherkin-cli` dependency + its pin.
