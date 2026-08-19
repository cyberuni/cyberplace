---
cr-ref: 62-spec-reference-resolution
project-spec: .agents/specs/sdd
status: active
todos:
  - content: Place + classify the node under project-spec/; declare spec-type and concept
    status: completed
  - content: Settle the extraction rule — which strings are references, and the escape hatch
    status: completed
  - content: Author README.md + check-spec-references.feature (boolean scenarios)
    status: completed
  - content: Spec gate — cold spec-judge, freeze, ledger gate line
    status: completed
  - content: Build the engine + tests; wire it into check-project-specs' ENGINES
    status: completed
  - content: Fix the survivors the first run finds in this repo's own corpus
    status: completed
  - content: Impl gate — cold impl-judge, verification per frozen scenario
    status: completed
  - content: Handoff — changeset, PR, comment the landing PR on the source issue
    status: completed
---

# CR: check that every relative reference in a spec node resolves

Add `check-spec-references` beside the other project-spec engines: walk every `.md` under a
project spec, extract each explicitly-relative reference, resolve it against the file's own
directory, and fail on any that does not exist.

Source: `repobuddy/buddy-agent-harness#62`. A **different forge repo** from this one, so the PR
carries **no closing reference** — handoff comments the landing PR on the issue instead.

## Why

In the source repo every `../../../src/...` and `../../../skills/init/...` reference in the spec
corpus was off by one directory level and resolved to nothing. Not a typo — a **consistent
off-by-one** where each reference read as plausible: right filename, right-looking depth, wrong
level. Review by eye is what let them land; only resolving them catches it.

## Scope

- New unit: `.agents/specs/sdd/project-spec/check-spec-references/` + the skill
  `plugins/sdd/skills/check-spec-references/`.
- Wired into `check-project-specs`' `ENGINES` (the per-project entry point), `--spec-dir <d> --check`.

## Settled before drafting (spike, throwaway)

A prototype run over both corpora settled the extraction rule and turned up live survivors.

- **Only explicitly-relative references** (`./` or `../` prefixed) are extracted. A bare path in
  inline code is **not** a reference to resolve: the corpus is full of `cli/`, `skills/doctor/`,
  `.claude/skills`, `~/.codex/config.toml`, `.agents/skills/**/SKILL.md` — illustrative or
  repo-root-relative prose. Treating them as references would reject most of them. This is what
  makes the source issue's repo-root-relative trap
  (`.research/agentic-configuration-standards/`) pass **by construction**, not by exception.
- **Two forms**: markdown link targets `](./x)` / `](../x)`, and inline-code spans
  `` `../../../../src/foo.ts` ``.
- **Directories count** — a reference resolving to a directory passes, trailing slash and all.
- **The escape hatch is earned, not guessed.** One class of false positive is real and recurs
  across both corpora: prose that *quotes a path relative to something other than the file* —
  the text inside a bridge file, a symlink target relative to `.cursor/`. Both read exactly like a
  genuine anchor, so no structural narrowing separates them. An inline marker suppresses the line.

### Survivors the spike found (this repo, 12)

`cyberfleet-plugin/{README,spec}.md`, `sdd/corpus/discovery/README.md`,
`sdd/intake/{manage-ignore,plan-discovery,resolve-tracking}/README.md`,
`sdd/mission/{handoff,manage-scenario-bridge,resolution,verify-scenarios}/README.md`,
`sdd/plugin/README.md` — all the same off-by-one class. They land in this CR; the guard's first
run catching what it was built for is the precedent `check-retired-terms` set.

## What landed

`check-spec-references` ships beside its project-spec siblings and runs from
`check-project-specs`' engine set. The node is frozen at 38 scenarios, the engine carries 41 tests,
and the check runs clean over this corpus and over the one the issue was filed from.

**14 broken anchors corrected**, every one the same off-by-one class: 12 here (cyberfleet-plugin,
`sdd/corpus`, `sdd/intake` ×3, `sdd/mission` ×4, `packages/cyberfleet`), 2 in the source repo. Two
lines were marked rather than fixed — prose quoting a path relative to something other than the file
it sits in, which is what the inline marker exists for.

## The pattern the gates found

Nine judge rounds, seven of which found a real defect, and **every one was the same shape**: a rule
written to its motivating case rather than to the model it claimed to implement, leaving somewhere a
genuinely broken reference passed silently — the exact failure this CR exists to close, reproduced
inside the thing built to close it.

| Round | Defect |
|---|---|
| spec 1 | three resolved-actor bars never loaded (preflight stop) |
| spec 2 | audit mode and check mode differed by exit code alone — unbought scope |
| spec 2 | doubled-backtick spans excluded by regex accident rather than by rule |
| spec 2 | no CFG and no scenario map, so the suite could not surface a hole |
| spec 3 | a stray backtick swallowed the rest of its line |
| spec 4 | the ignore marker fired on a line that merely quoted it — self-triggering |
| impl 1 | the fence tracker was a bare toggle, character- and length-blind |
| impl 2 | a code span wrapping across a line break was read as two halves |
| impl 3 | a span reached past a heading, list, quote, or rule into the next block |

Twice a fix opened the next defect (whole-text scanning, then its missing block bound). Two further
defects came from my own mutation sweeps that no judge caught: the code-span run-length rule was
load-bearing but untested, and a mistyped `--spec-dir` failed unhandled.

Twenty-two mutations stand, each failing exactly the tests it should.

## Held out of scope

Three follow-ups recorded in the ledger shard, all over-report or implausible-input class, none
silent-miss: a link target containing a literal `)`, a backtick inside an angle-bracket destination,
and the block-boundary predicate's omissions (setext, HTML blocks, GFM tables) plus its slightly
wide list arm. The last two are deliberately **not** fixed speculatively — a boundary firing where
CommonMark would not truncates a legitimate wrapped span, and a span that never forms drops its
reference, so widening carries the same risk it would close.

The judge's architect observation — that project-spec engine nodes each improvise a Use Cases shape
for a single-entry-point checker — is recorded as a corpus-wide backlog item; it would touch several
frozen suites.
