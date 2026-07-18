---
cr-ref: github-315
target-project: universal-plugin
touched-specs: [universal-plugin, cyberlegion-plugin]
blast: high
hitl: true
leash: auto-none
todos:
  - content: "explore — author plugin/deps node (FIVE-FORMS model, no lock; ls|up|add|remove|scan)"
    status: completed
  - content: "explore — retarget cyberlegion-plugin init to deps.json, then DECOUPLE it (init reads its own develop-time pin, not deps.json)"
    status: completed
  - content: "spec gate — fresh cold sdd-spec-judge on the NO-LOCK five-forms model (rounds 1-9 graded superseded models); HITL ratification required. R10-R13 done: oracle+architect PASS (R11-R13), every CR-introduced Builder gap closed. APPROVED by owner (Clearance ratified live): status:approved on universal-plugin, both suites frozen, gate lines in both shards, rubric DELETED per owner. cyberlegion-plugin root stays draft (untouched by this CR — init node only)"
    status: completed
  - content: "deliver — registry source, deps CRUD + detection, retire bundle, rewire release flow"
    status: pending
  - content: "deliver — seed each plugin's managed list from detection (ATOMIC with the rule)"
    status: pending
  - content: "deliver — fix the doc-example corruption; verify the release PR regenerates clean"
    status: pending
  - content: "impl gate — sdd-impl-judge PASS; rebase onto main"
    status: pending
  - content: "handoff — PR against main, Closes #315 (subsumed)"
    status: pending
---

# CR github-315 — plugin deps: manage the plugin's npx package dependencies

CR link: https://github.com/cyberuni/cyberplace/issues/315
Target node: `packages/universal-plugin/.agents/spec/plugin/deps/` — drafted this run, `git mv`'d from
the retired `plugin/bundle/`. Root spec `status: draft` (the legal state for a Clearance re-open of an
`implemented` spec — R7); suite `@frozen`, re-frozen at the gate.
Branch: `sdd/github-315-plugin-deps`, cut from `main` (the first attempt is abandoned — see Restarted below).
Ledger: `plugin-deps-package-management` shards (carry the Clearance grants, 5 judge rounds, and the refuted premise).

**Clearance floor GRANTED LIVE by the owner** — the node is rewritten, not edited. Do not proceed at a
gate without HITL ratification.

## The thesis

`universal-plugin` is a **published npm tool for any repo**, so `bundle`'s contract must not assume this
repo's changesets flow. It does today: it resolves versions from the local workspace `package.json`,
which is only authoritative because `changeset version` bumps it *before* publish. Under
`semantic-release` the version isn't known until the release run, so local lookup cannot work.

Managing those references is a package manager's job, so model it on one (`pnpm ls` / `up` / `add` /
`remove`) instead of on "materialize the release form".

> **Superseded in part (round 5).** This section once read "a plugin's `npx pkg@version` references ARE
> dependency declarations" — that premise is **refuted** (see the direction change below). A reference is
> a declaration only when its package is on `deps.json`'s managed list. The package-manager framing
> survives; "prose is the manifest" does not.

## Scope

- **Retire `plugin bundle`.** Replace with `plugin deps ls | up | add | remove | scan`.
  - Named `deps`, not `packages`: `packages/*` is already the workspace glob in this repo, so
    `plugin packages ls` would read as listing workspace members.
- **Delete the `inWorkspace` axis entirely** — this deletes `discoverWorkspace` / `findMonorepoRoot` /
  the glob machinery. (Round 5 note: the replacement selector is an **allowlist**, not the declared
  range — see the direction change below.)
- **Registry version source** — `--registry`, default npmjs.org. Offline support **dropped** (owner).
- **Write semantics** (settled with the owner; **DISAMBIGUATED at R6 — read the node, not this table**):

  | invocation | writes |
  |---|---|
  | `deps up` (bare) | exact — the security default (`npx pkg` → `npx pkg@x.y.z`) |
  | `deps up pkg@^2.0.0` | `^2.0.0` — range written through; user opted in |
  | `deps up pkg@^2.0.0 --exact` / `-E` | `2.4.1` — range as input, exact on disk |
  | `deps up --latest` | newest, ignoring declared ranges |

  > **R6:** this table's first row is **ambiguous** — its column says *invocation* (`deps up` bare) but
  > its example is a bare **reference** (`npx pkg`). Owner settled it live: **prose is the constraint.**
  > Bare `up` resolves *within* what the prose declares and never crosses it; an exact spec is a **pin**
  > bare `up` will not move. Only a spec-less `npx pkg` gets a version written by bare `up`. The table
  > was never wrong, only under-specified — the authority is now `plugin/deps/README.md`.

`npx pkg@^0.1.0` is natively supported by npx (**measured**: `cyberlegion@^0.1.0` → `0.1.0`), so a range
  in prose is a real invocation. It re-resolves at **run** time, which is exactly why the lock must record
  what it resolved to.
- **Release flow inverts** — pinning moves *after* `changeset publish`, over the network, as its own CI
  step. Root `package.json` `"version": "changeset version && pnpm run bundle"` and
  `.github/workflows/release.yml` both change.
- **Retire `pin-exempt`** — it is unwireable (see the atomicity section). *(Round 5: form alone does not
  decide either — the **allowlist** does. Form still classifies a managed name's spec; `ignore` still
  escapes a path.)*

## Subsumes #315 — do not land a cwd fix

#315's defect is real and reproduced: from a plugin dir, `--root .` never walks up
(`path.dirname('.') === '.'` terminates `findMonorepoRoot` on iteration one), the workspace map comes back
empty, and a local package is misfiled as external — exit 0, silently. **Its fix is deletion**: the
workspace discovery carrying the bug is removed. No `path.resolve` fix lands.

**Both of the issue's hypotheses were refuted before scoping — do not transcribe them:**
- Suspected cause ("walk up for the workspace marker rather than assuming cwd is the root") is **false**.
  The walk-up already exists; a *relative* root defeats it. Control: absolute `--root "$PWD"` from inside
  the plugin dir → `pinned 1`.
- Suggested signal rule ("skip count == candidate count should not exit zero") **contradicts two frozen
  scenarios** — "a pin for a package with no workspace entry is left untouched" (1 candidate, 1 skipped,
  exit 0) and "no pins to resolve is a definitive empty state" (0 == 0, the measured `quill` case). It
  would have fired the **Conflict** floor.

## Measured baseline (pre-change, `--dry-run`)

`aced` 1 pinned · `cyberfleet` 1 pinned · `cyberlegion` 1 pinned · `cyberspace` 2 pinned · `quill` 0
candidates ("nothing to bundle") · `sdd` 1 pinned + 1 skipped (`gherkin-cli`, genuinely external — and
under the new model its exact `@0.0.2` pin is what keeps it still). Real pin forms in the corpus today:
`@<version>`, `@<exact>`, `@0.0.2`, `@0.0.0`. **The placeholder syntax is NOT dropped** (round 1 said it
was — superseded): a placeholder is what marks documentation, and is never touched.

## Settled with the owner (do not re-litigate)

- **`plugin bundle` is hard-removed** — breaking, minor bump (pre-1.0). No alias, no stub.
- **`.plugin/pins.json` → `.plugin/deps.json`** — records what each declaration **resolved to** (the lock:
  `npx` re-resolves a range at run time, so prose alone does not say what shipped). JSON, not yaml/toml —
  universal-plugin carries **zero** yaml/toml deps by design. Sits beside `.plugin/plugin.json`.
  **Hand-editable, like `package.json`** (owner, round 2): it carries the `ignore` list, so `up` **preserves
  what it does not own** rather than regenerating. This gives it structure, so the init read is a **shape
  change**, not the pure rename round 1 assumed — that node needs re-judging.
- **Each plugin already gets its own map** — the release PR wrote six, one per plugin root. No
  `<plugin-name>.json` disambiguation needed; `${CLAUDE_PLUGIN_ROOT}` already scopes it.
- **The release step passes explicit `pkg@version` pairs** from what `changeset publish` published — so
  `universal-plugin` never needs to know "ours vs theirs" at release. `gherkin-cli` stays put because
  nobody names it, not because the tool classifies it. *(Round 5: this was claimed to "dissolve the
  selector problem for good" — it does not. It only covers the release invocation; a bare `deps up` still
  needed a selector, and prose classification was the wrong one. The **allowlist** is the selector.)*

## The init relay — verified against the record, not guessed

The owner asked why pinning happens at init time. It is **both**, and both stages are load-bearing:

- **release time** — resolve the version, record it in the shipped `deps.json`
- **init time** — read that map, write the concrete version into the hook

The hook is a durable command string in the **user's** settings (`npx cyberlegion@<v> mail hook --event X`),
so it needs a real version when written. But init **reads, never resolves**: the `hook-npx-pin` spec gate
deferred malformed-`--pin` validation precisely because "the version comes from the **trusted bundle pins
map**", and the skill's rule is "**Never invent a version number**" / "**Do not scrape the version from
prose**". If init resolved `latest` itself, an older plugin snapshot would silently drive a newer CLI.
**The relay survives the redesign untouched** — only the map's name and its derivation change.

Under the new model the map gets *more* load-bearing: a written-through range means the resolved version
is not in the prose at all, so `deps.json` becomes its only source.

## Freeze / floors

- **Clearance GRANTED LIVE** for `plugin/bundle` (rewrite) and **EXTENDED LIVE** for
  `cyberlegion-plugin/init` (3 frozen scenarios, lateral rename). Both recorded in the
  `plugin-deps-package-management` shards.
- **Compatibility**: hard-removing `plugin bundle` breaks published consumers — owner accepted, minor bump.
- The rename is **free only now**: `pins.json` has never landed on main (only on
  `origin/changeset-release/main`, commit `a6cc6cc4`), so its one reader has always hit the fallback. If
  that release PR merges first, the artifact ships and the rename gets expensive.

## Resolved at draft (2026-07-17) — settled IN THE SPEC, re-open only on judge evidence

Each of these was open at draft and is now a written contract in `plugin/deps/`. They are the
producer's calls, not the owner's — a judge FAIL on any is a real finding, not a re-litigation.

- **`deps outdated` does NOT split from `ls`** — `ls` carries a `status` per managed name, so
  `outdated` would be a second view of one row. *(closes the open)*
- **Staleness rule** — a recorded resolution that no longer satisfies the spec the prose declares is
  `ls` status `stale`. This is the answer to "what does a written-through range resolve to now", and
  it is why `ls` exists at all. *(closes the open)*
- **Node placement** — `plugin/deps/`, confirmed, with the root placement map rewritten to route on
  *"an op over the packages a plugin's skills invoke through npx"* rather than on release timing.
  Warden still finalizes at handoff.
- **`plugin/build` framing** — the dev-vs-release axis is gone, so `build`'s boundary prose now
  carves against **the dependency concern**, not against a release step. `build` derives manifests;
  `deps` manages what the skills invoke. No release-timing words left in either node.
- **`deps.json` shape** — `{ $schema, dependencies: { <name>: { resolved } }, ignore: [<path>] }`.
  A key under `dependencies` **is** the managed declaration; `{}` = managed, never resolved. This
  makes the cyberlegion-plugin `init` read a *recorded resolution*, per that shard's correction.
- **`add <pkg>@<spec>` ≡ `add <pkg>` + `up <pkg>@<spec>`** — pnpm-faithful (`pnpm add pkg@^2` writes
  both the manifest and the lock). Bare `add` only records the name; the spec never moves into
  `deps.json`, which is the whole point of the narrow allowlist.
- **`up` is all-or-nothing** — every managed name resolves before anything is written; any failure
  writes nothing and exits 1. A half-pinned plugin is a shipped defect, so a transient registry
  failure must not manufacture one. *(New: nothing settled this; the network dependency created it.)*
- **`--latest` keeps the declared form** — a range keeps its operator (`^2.0.0` → `^3.1.0`), a bare
  or exact reference gets exact newest; `--exact` overrides. Consistent with "range written through;
  the user opted in".
- **Extraction boundary** — a reference ends at whitespace or at a delimiter that cannot appear in a
  version spec (trailing `.` `?` `,` `)`, backtick, quote). Note this means `@1.5.0?` extracts as
  `1.5.0`, a **valid** declaration — so form does NOT protect it and `ignore` must. That is exactly
  the `upgrade-universal-plugin` case, and it is why `ignore` is a path escape and not a form rule.

## Still open at draft

- **The grill notes are unchanged** — see `## Grill notes`; none were settled by drafting.

## Follow-ups (record, do not act)

- Delegate hook init to `universal-plugin` (owner-identified).
- `hook-npx-pin`'s "dormant until publish" premise is **stale** — cyberlegion is published (npm 0.1.0).
- `pin-init-skill`'s pinning path has **never run on main**; verify end-to-end once this lands.

## Restarted from a clean base (2026-07-17)

The first attempt stacked 11 spec-churn commits onto `sdd/plugins-as-projects` — **which is PR #314's
branch, and #314 merged**. Its base is on `main` now, so that work is abandoned rather than rebased: the
node it drafted is written against a **refuted premise** (below) and must be redone, not fixed.

This branch is `sdd/github-315-plugin-deps`, cut fresh from `main`. What carried over is the **ledger**
(both shards) and this brief — the durable provenance the git churn never held: two live Clearance
grants, five judge rounds, the refuted premise, and the doc-example corruption finding. The abandoned
attempt is tagged `sdd-315-superseded-attempt` if any of its drafting is ever wanted.

**State on this branch (updated 2026-07-17):** the node is **drafted**. `plugin/bundle/` →
`plugin/deps/` via `git mv`, README + `deps.feature` rewritten on the allowlist model (2 commits,
`748c90d6` + `7cbce942`). See `## Resolved at draft`.

## ⚠ DIRECTION CHANGE (round 5) — an allowlist replaces prose classification

**The thesis "the skills are the manifest — any `npx <pkg>` reference is a declaration" is REFUTED.**
Proven against the real corpus + the live registry, then re-verified independently:

| evidence | scale | registry |
|---|---|---|
| `npx skills add cyberuni/cyberplace --skill <x>` — the bootstrap idiom for the **unrelated** `skills` CLI | **29 files**, nearly every plugin | `skills` → **1.5.19, real** |
| the English sentence *"…shipping an npx dependency"* | 3 governance docs | `dependency` → **0.0.1, real** |

A bare `deps up` would pin the installer whose whole job is to fetch latest (the security thesis
**inverted**) and rewrite an English sentence into a command. `npx` + a word is not a declaration —
sometimes it is prose, sometimes another tool's command, and **the information to tell them apart is not
in the string**. No classifier over that string can work. That is why five judge rounds each found a new
defect at a new point in the input space (R1 convergence contradiction · R2 `@latest` isn't semver ·
R3 `@*` is a truthy range · R4 `satisfies('latest')` is false + extraction unspecified · R5 the premise).

**The fix: `.plugin/deps.json` declares WHICH packages are managed.** A name not on the list is
invisible — nothing looks for it. The false-positive class stops existing rather than shrinking.

**This is a NARROW version of a model the owner rejected earlier, and the difference matters:** that one
also moved ranges into `deps.json` (killing prose ranges + `--exact`) → "no, that's not what I meant".
**Only the name list moves.** Versions stay in prose, ranges stay supported, `--exact` keeps its job,
`ls` still reads the lock.

**Also scoped in by the owner:** `deps add` / `deps remove` (how a name gets on the list) and a
**detection** command surfacing candidate package names across a plugin's skills — so the allowlist is
built from evidence, not memory. Detection answers the bootstrapping hole the judge raised twice: the old
`pin-exempt` marker was never applied to the one skill it existed for, and an allowlist nobody seeds fails
identically.

**Survives the change:** the extraction boundary and the placeholder rule — still needed (a managed
package can still appear as `@<version>` in prose), but their blast radius collapses to managed names.

## The declaration-form rule + the corpus sweep are ATOMIC (round 2)

`pin-exempt` was not merely unwired — it is **unwireable**. It is directory-scoped, but
`legate/SKILL.md:13` is prose *about* the placeholder and `:30-34` are real invocations — same syntax,
opposite intent, one file. No file/dir/glob mechanism can separate them. So the **version string**
decides: semver version or range = a declaration; a placeholder = not, therefore invisible to `up`, by
construction, with nothing to remember.

**Verified against the real strings** (`semver.validRange`): `<version>` / `<exact>` / `<old-version>` /
`<target-version>` → null (ignored); `0.1.0` / `^0.1.0` / `~1.2` → declarations; `1.5.0?` → null (so the
`?`-eating regex bug is covered for free). `<` being a real comparator does not bite: `<1.0.0` parses,
`<version>` does not.

**Measured against the corpus it will police** — exactly ONE false positive:
`universal-plugin@1.2.3` in `upgrade-universal-plugin/SKILL.md` (sample output, real semver) → that is
what `ignore` is for. Every other illustration is protected by form.

**But nearly the whole corpus is `@<version>`** (`legate`, `dispatch-governance`, `start-mission`,
`skillify`, `improve-skill`, all of `awesome-skills`, `init-commit-discipline`, `sdd-automaton`, …) and
those are REAL invocations. Today `@<version>` means "pin me at release"; under the rule it means the
opposite. **Therefore rule and sweep cannot be split across CRs:**

- rule without sweep → every real invocation silently stays unpinned; `npx` resolves newest at run time.
  A security regression that **fails green**.
- sweep without rule → docs keep being corrupted.

**Sweep (deliver, own commit, ~13 files, agent judgement + human skim):** classify each `@<version>` —
a real invocation becomes an exact declaration (`npx cyberlegion@0.1.0`); prose stays `@<version>` and is
now protected. Owner approved doing both here.

**Residual risk, accepted and mitigated, not solved:** an author who writes `@<version>` *meaning* "pin
me" is silently never pinned, and no tool can tell that from prose. Mitigation is visibility — `ls`
reports placeholder + ignored references alongside declarations, so an unclassified string is visible
rather than absent.

## Grill notes (raised with the owner, not yet settled)

- `up` refreshes the lock for **every** dep always, even where the manifest doesn't move.
- ~~`deps up nonesuch@1.0.0` fails loud — pnpm would *add*; there is no `add` verb here.~~
  **Settled by the direction change**: `add` now exists, so fail-loud is the right answer and the
  divergence from pnpm is deliberate — `up` never grows the allowlist as a side effect, because a
  list that grows implicitly is the false-positive class coming back through the write path. `up`
  and `remove` on an unmanaged name exit 1 pointing at `deps add`. **Spec'd.**
- **Unspec'd:** the release-flow rewiring (root `package.json` `version` script + `release.yml`). Listed
  as a node non-goal — may need its own home, or may be pure deliver work.

## Spec-gate judge history on the no-lock five-forms model (2026-07-17)

Four fresh cold `sdd-spec-judge` rounds, each briefed with NO scope facts (pointed at Non-goals +
ledger shards). Provenance tracked per finding — NOT diverging: model PASSes oracle+architect from
R11 on; each Builder gap was independent (mostly pre-existing or a new completeness point), and only
one traced to a prior fix (an incomplete fix, not a regenerated defect).

| round | judge | oracle | architect | builder | findings → disposition |
|---|---|---|---|---|---|
| R10 | aaba030 | FAIL | FAIL | FAIL | scan had 0 scenarios; spec.md stale `--exact`+lock; init README self-contradiction → **all fixed** (commit 5e54edc8) |
| R11 | aba6c647 | PASS | FAIL | FAIL | ignore×scan unstated; range×init undefined; @frozen-at-draft violation → **all fixed** (d2490c8b): ignore total over verbs, init total over forms, unfroze both suites |
| R12 | adc0268 | PASS | PASS | FAIL | ls×ignore gap (my R11 prose); divergence "differ" undefined; **rubric Selection (pre-existing on main)** → 2 in-scope fixed (f53d3fbe: ls×ignore scenario, divergence=byte-identity); rubric DEFERRED |
| R13 | a1b3577 | PASS | PASS | FAIL | missing-manifest tested only for ls (CR-introduced); **rubric 3rd boolean dim (pre-existing)** → manifest reframed as shared pre-dispatch gate (f4c2b9d7); rubric DEFERRED |

**Stopped the loop at R13** — model proven (oracle+architect PASS ×3), every CR-introduced Builder
gap closed. The suite is 67 deps scenarios + 22 init. Remaining Builder item is the **pre-existing
rubric** (below), an owner call, not a producer fix.

## The pre-existing rubric — HELD for the owner

`init-cyberlegion.feature`'s `@quality @rubric` scenario ("the onboarding is CLI-delegated,
environment-grounded, and consent-gated") **exists unchanged on main** (empty diff in that region —
verified). 3 of its 4 dimensions restate boolean floors already frozen as pass/fail scenarios in the
same file (`bind_ask_is_informed_consent_not_silent` ≙ :132-135, `non_coercive_respects_a_decline` ≙
:138-141, `every_mechanic_delegated_to_the_cli` ≙ :166-169), then re-admit them into a compensatory
sum — a Selection defect (a boolean floor is untradeable). Only `environment_summary_grounded_in_probe`
is a genuine gradient. Out of THIS CR's scope (pre-existing, R7 precedent = note-not-fix), but the
init feature is touched+frozen here, so surfaced at the gate. **Owner options:** delete the rubric
(radical-simplification read — init is boolean process-Gherkin), repair it (keep only the one real
gradient), or defer to a follow-up issue.

## NEXT — resume here

**SPEC GATE PASSED (2026-07-17) — owner ratified live (Clearance). Now in DELIVER.**

- `universal-plugin` root `status: approved`, `approval.spec: { verdict: approve, by: unional, cr:
  github-315 }` (the stale `build-bundle-split` spec block was overwritten; `approval.impl`
  github-89-build-axi left for the impl gate to overwrite). `deps.feature` (67 scen) + `init-
  cyberlegion.feature` (21 scen) both `@frozen`. Human gate lines in both ledger shards.
- `cyberlegion-plugin` root **stays `draft`** — it was already draft on main and this CR never touched
  the root spec.md (init NODE only); do NOT flip it.
- Owner decisions at the gate: **approve**; **delete** the pre-existing rubric (done, `by` owner call);
  **do NOT** save the "radical simplification" preference (answered — drop the open question).

**Next action — DELIVER unit 1: build `packages/universal-plugin/src/deps/`** to the frozen
`deps.feature` (67 scen). This is a good sonnet-delegation unit (large, frozen contract). Nothing was
built yet — the session paused right before dispatch. The codebase is already mapped (below); do not
re-explore.

**Deliver-phase orientation (mapped 2026-07-17 — do not re-explore):**
- **CLI pattern** (`packages/universal-plugin/src/`): commander; each command is `src/<domain>/cli.ts`
  exporting `xCommand()`, added to the `plugin` group in `src/cli.ts` (today: `buildCommand()` +
  `bundleCommand()`). Clean arch (package `CLAUDE.md`): `cli.ts` (interface, side effects) →
  `<domain>.ts` (pure domain, no I/O) → `fs.ts` (infra).
- **Reuse:** `src/pin/pin.ts` `extractPins` (the `npx pkg@spec` extractor + trailing-delimiter strip —
  EXTEND to also capture bare `npx pkg` prose refs, needed for warnings + `scan`); `src/pin/fs.ts`
  (`realPinFs`, `resolveSkillsDir`, `PinFs`); `src/output.ts` (`output`/`printTable`/`printFields`);
  `src/cli-options.ts` (`ROOT_OPTION`, `resolveRoot`); `src/build/build.ts` (`readManifest`).
  `src/bundle/{cli,bundle,fs}.ts` + `bundle.test.ts` is the closest SHAPE reference — mirror it, do
  not depend on it (it retires in unit 2). `src/source-registry/` is plugin-SOURCE resolution, NOT a
  version client — do not reuse for `deps up`.
- **New infra:** a registry client resolving a managed name → concrete version (default npmjs.org,
  `--registry`; range → highest satisfying, measured `^0.1.0`→`0.1.0`). Must be a DIP seam
  (`interface DepsRegistry`) so tests mock it; real adapter fetches the packument.
- **Test harness (per #322):** `src/bundle/bundle.test.ts` is the model — Vitest, a `fakeFs` + injected
  source (add a `fakeRegistry`), one `it` per frozen scenario tagged `// Scenario: <title>`, sections
  mirroring the `.feature` banners. Cover all 67; THEN add exhaustive pure-unit tests for the inner-rule
  combinatorics (five-forms classifier table, divergence byte-identity, extraction boundary) — the
  acceptance suite intentionally does not enumerate them.
- **`src/deps/` layout:** `deps.ts` (pure domain: five-forms classifier, allowlist, ignore path-escape,
  byte-identity divergence, up-rewrite, ls-status, scan, add/remove) + `fs.ts` (deps.json read/write,
  preserving unknown keys) + `registry.ts` (real `DepsRegistry`) + `cli.ts` (`depsCommand()`, 5 subs) +
  `deps.test.ts`. Wire into `src/cli.ts` alongside bundle (coexist).

**Deliver units (each commit green):**
1. Build `src/deps/` + wire `cli.ts` (bundle still present).
2. **Retire `src/bundle/` + rewire release — OUTWARD-FACING, checkpoint with owner first.** Delete
   `src/bundle/` (+ `src/pin/` if now unused), drop from `src/cli.ts`. Root `package.json`: the
   `bundle` script runs `plugin bundle --root <plugin>` ×6 (aced, cyberfleet, cyberlegion, cyberspace,
   quill, sdd); `version` = `changeset version && pnpm run bundle`. **CORRECTION:** `.github/workflows/
   release.yml` has **NO** bundle refs (verified) — the wiring is entirely the root `package.json`
   `version`→`bundle` script.
3. Seed each plugin's `.plugin/deps.json` via `deps scan`→`deps add` (ATOMIC with the rule sweep).
4. Fix the doc-example corruption; verify the release PR regenerates clean.
Then impl gate → rebase onto main → handoff PR.

**OPEN decision — settle with owner BEFORE building unit 2 (release rewire):** under the no-lock
five-forms model `deps up` resolves from the REGISTRY, so pinning must run AFTER `changeset publish`
(the just-published versions must be live to resolve). The old flow bundled at `changeset version`
(pre-publish, workspace source). So the `version` script likely DROPS `bundle` and a NEW post-publish
CI step runs `plugin deps up --root <plugin>` ×6. The plan's earlier "release passes explicit
pkg@version pairs" note (see `## Settled with the owner`) predates the no-lock model — reconcile it.

**Build to the #322/#323 doctrine** (filed this session; being implemented on branch
`suite-format-governance-split`): suite screams intents; `.feature` = acceptance/boundary only; inner
combinatorics → unit tests owned by the impl-producer. That is exactly how `src/deps/` should be built.

**Impl gate:** re-derive each frozen scenario's oracle independently (ADR-0016), run the impl-
producer's verification, per-scenario PASS/FAIL. This CR's impl gate overwrites `approval.impl`.

> **Branch note (2026-07-17):** the worktree was checked out off this branch mid-session and the
> `sdd/github-315-plugin-deps` ref was deleted; all commits were intact and the ref was restored at
> `e9f59a9a`. If the branch is missing again, recreate it: `git branch sdd/github-315-plugin-deps
> e9f59a9a` (or its latest descendant).

--- superseded resume instructions below (spec gate is DONE; kept for provenance) ---

**Next action:** dispatch a **fresh cold `sdd-spec-judge`** over the spec gate for this CR — brief it
with NO scope facts (point it at the two nodes' Non-goals + both ledger shards, say so). Grade
`git diff main...HEAD`. Then hold at the gate for **HITL ratification** (Clearance) — do not
self-assert. Concretely: judge `packages/universal-plugin/.agents/spec/plugin/deps/{README.md,deps.feature}`
(primary) + `.agents/specs/cyberlegion-plugin/init/{README.md,init-cyberlegion.feature}` (companion),
against `packages/universal-plugin/.agents/spec/ledger/plugin-deps-package-management.e4b71c.jsonl` and
`.agents/specs/cyberlegion-plugin/ledger/plugin-deps-package-management.e4b71c.jsonl`.

**What is on disk (NO-LOCK five-forms model — the last two commits, `befde5bb` + the deps.json
field-name/drop-lock work):**
- `plugin/deps/` — 58 scenarios. `deps.json` = `{ $schema, dependencies: [names], ignore: [paths] }`,
  **no versions recorded**. Five recognized reference forms (prose→warn, placeholder→exact, exact→pin,
  tilde/caret→left in place), everything else ignored. `ls` reads files only (status
  `pinned`/`unpinned`/`unused`/`divergent` + bare-prose warning count); `up` writes skill files only.
  Divergence + placeholder-adopt on authoring hygiene. See `## The five-forms model`.
- `cyberlegion-plugin/init` — **decoupled from `deps.json`**: init reads the version from its own
  `npx cyberlegion@<version>` invocation that `deps up` pins at develop time; falls back unpinned when
  still a placeholder.
- `status: draft` on `universal-plugin` (legal for a Clearance re-open — R7). All mechanical checks
  green (`check-suite` both projects, `check-spec-state` both, `pnpm check:specs`, 0 open markers).

**Blocking / decided:**
- **HITL ratification required (Clearance).** Do **not** self-assert. The edit-class guard reads this
  whole rewrite as additive (measured, R7) — a green mechanical check is NOT evidence; only the owner's
  live grant gates it.
- **Rounds 1–9 are STALE** — each graded a superseded model (prose-classifier R1–R5, allowlist+adopt
  R6–R8, closed-form R9). Do not carry their verdicts. This is the first judge pass on the no-lock
  five-forms model.
- **If the judge finds a defect INSIDE the five-forms/no-lock model** (not a scenario gap): read
  `## Convergence ledger` — three prior generations each had one lesson (do not classify an open input
  space). Bring a model-level defect to the owner, do not patch.
- **Open working preference to confirm with the owner:** whether to save "lean toward radical
  simplification / closed sets over general machinery" as a durable preference (raised at pause, not
  yet answered).

**After the gate (deliver):** `## Grill notes`' release-flow rewiring and the blocking ledger followup
about `package.json`/`.github/workflows/release.yml` are **ATOMIC** with retiring `plugin bundle` —
removing the verb without rewiring breaks release at the least observable moment (verified: root
`package.json` still runs `plugin bundle` ×6).

**Do not relearn** — see `## The five-forms model` (authoritative), `## Convergence ledger` (why the
model is what it is), `## Settled with the owner`, and the ledger shards (Clearance grants, the
drop-lock `scope-cut` correction, field-name ruling).

## The five-forms model — what is ON DISK (authoritative; supersedes the allowlist-classification text below)

Two selectors, both closed, neither classifies an open input space:

**`deps.json` records NO versions** — it is `{ $schema, dependencies: [names], ignore: [paths] }`,
`dependencies` a plain array of managed names. The lock/`resolved` field is DROPPED (owner cut; see the
`scope-cut` ledger correction). The shipped version lives in the prose `up` writes; a range is left to
re-resolve at run time. Two selectors, both closed, neither classifies an open input space:

1. **The allowlist** picks which *names* are managed (`dependencies`). Unchanged.
2. **The five forms** pick which *references* to a managed name are recognized. A managed name's
   reference is one of exactly five, and anything else is ignored:
   - **prose** (`npx pkg`, no `@`) → **warned**, never rewritten
   - **placeholder** (`@<version>`) → **converted to exact** by `up` (the authoring seed form)
   - **exact** (`@x`) → a pin; bare `up` leaves it, `--latest` moves it
   - **tilde** (`@~x`) / **caret** (`@^x`) → range; **left in place** (npx re-resolves at run time);
     `--latest` bumps the floor
   - `x` = major | major.minor | major.minor.patch
   - **anything else** (`@latest`, `@>=1`, `@*`, git/tarball/`npm:`/`file:`) → **ignored**, not error
3. `deps scan` — surface `npx <name>` references that are **not** managed. Load-bearing (below).
4. `deps ls` reads the **files** (never a registry): status `pinned`/`unpinned`/`unused`/`divergent`,
   bare prose as a warning count. `deps up` resolves from a registry and writes **skill files only**,
   never `deps.json`. Managed names only.
5. **`ignore`** (a path escape, evaluated first) protects the one real illustration file. **Divergence**
   is a simple guard grounded on **authoring hygiene** (not a lock): two exact/tilde/caret references
   with different specs → `up` exits 1; prose and placeholders carry no constraint and never diverge.
6. **Init relay decoupled** — `cyberlegion-plugin/init` no longer reads `deps.json`; `deps up` pins its
   own `npx cyberlegion@<version>` at develop time, and init reads that. (owner: develop-time
   management is the way to go.)

> The numbered list *below* (`the allowlist is the selector` … `the placeholder rule`) describes the
> **superseded** allowlist-with-classification model (R6–R8). It is kept only as history — build to the
> five-forms model above and to the node README, not to it.

Then re-judge. **The judge brief must carry NO scope facts** — point it at the node's Non-goals and the
ledger and say so. Anything briefed around is something the spec fails to say.

### The superseded allowlist-classification model (history — do NOT build to this)

1. `.plugin/deps.json` declares **which packages are managed**. A name not on the list is never looked
   for. This is the whole fix; everything else narrows to it.
2. `deps add <pkg>[@spec]` / `deps remove <pkg>` — how a name gets on and off the list.
3. `deps scan` — surface `npx <name>` references that are **not** managed. Load-bearing (below).
4. `deps ls` reads the lock; `deps up` resolves from a registry and writes. Both act on managed names only.
5. Keep the **extraction boundary** and the **placeholder rule** (a managed package can appear as
   `@<version>` in prose). *(Superseded: `@<version>` is now CONVERTED to exact, not left in place.)*

### Blocking / decided

- **Gate needs HITL ratification — Clearance.** Do **not** self-assert, and **do not ratify on an
  unjudged model**: the last verdict (round 5) is `ALIGNED false` against the thesis this replaces.
- **`deps scan` is confirmed** as the detection verb, and is **load-bearing, not a convenience**. The
  same bootstrapping failure has hit this node twice: the `pin-exempt` marker was never applied to the
  one skill it existed for, and an allowlist nobody seeds fails identically. If `add` is the only path
  onto the list, the marker problem is rebuilt under a new name — **the corpus seeding must RUN `scan`**,
  not be a human grep plus a promise in this brief.
- **Still unsettled** — see `## Grill notes`.

### Convergence ledger — count findings AND who introduced them

The CR's history is eight judge rounds, each finding a NEW defect at a NEW point in the input space.
That pattern is the reason to track *provenance* of each finding, not just the count: a defect
introduced by the **previous fix** means the loop is diverging, and the answer is to stop and
reconsider the model rather than patch again.

| round | verdict | findings | introduced by |
|---|---|---|---|
| R1–R5 | ALIGNED false ×5 | one per round, each a new input-space point | the **prose-classifier premise** — refuted, model replaced (allowlist) |
| R6 | ALIGNED false | bare `up` vs an already-versioned reference unspecified | my **original allowlist draft** |
| R7 | ALIGNED false ×3 + blocker | ① release-glue claim false ② init Non-goals self-contradiction ③ bare-vs-declared unreachable ④ `status: implemented` illegal | ① my original draft · ② **pre-existing on main**, untouched by this CR · ③ **the R6 fix** (one-spec-per-package was introduced there) · ④ my original omission |
| R8 | ALIGNED false (oracle PASS, architect PASS, builder FAIL) | ignore×divergence · placeholder×divergence · 3+ references | **the R6/R7 fixes** — every finding was a hole in a rule those fixes added |
| R9 | ALIGNED false (oracle PASS, architect PASS, builder FAIL) | `ls` catch-all · **dist-tags swallowed by a negative test** · malformed-json · 3 coverage holes | the **closed-form model itself** — a third generation |
| R10 | *pending* | judging the **five-forms** model | — |

**The stop rule FIRED at R8, and the re-examination it forced changed the diagnosis.** R6→R7→R8 was
not three defects; it was **one defect found three times**, and the fix loop itself was regenerating
it. The node never said WHICH REFERENCES PARTICIPATE — participation was defined *negatively and
piecemeal* across four places, so each cold judge picked a different **pair** of rules and asked "does
this one count?", and each answer needed a new rule. `declaration` was overloaded four ways: README:69
called a bare reference "a declaration with no constraint" while README:129 said it "declares
nothing" — a flat self-contradiction **no judge named across three rounds**.

**Verdict of the re-examination: the constraint STANDS, the method was the defect.** "One spec per
managed package" is right — the lock must stay single-valued for the init relay, and two versions of
one CLI in one plugin is an authoring error, not a use case. The alternative (a resolution *per
reference*) is rejected: it costs the init relay its single answer, which is the whole reason the
rule exists. So the fix was not another scenario — it is to state the discriminator **once**,
positively, as a total first-match-wins table (ignored → placeholder → bare → declaration), with
every other rule *reading off it* rather than deciding anything. The interaction class is now
**unreachable**, not merely enumerated: there is no pair left to ask about.

**Durable lesson (also in the ledger as a `method-defect` correction):** a rule stated by its
**exceptions** invites one judge round per exception pair. State the discriminator once, positively,
closed — then a new case is decided by *reading the table*, not by adding a rule.

**Trend:** R1–R5 died on one root cause (a classifier over a string lacking the information) → model
replaced. R6–R8 died on a second root cause (participation stated by exceptions) → method replaced.
Both were *single* root causes wearing many masks, which is why neither looked like divergence from
inside a single round. **If R9 finds a defect inside the closed form itself, that is a third
generation — question the model, not the prose, and bring it to the owner rather than patching.**

**R9 WAS a third generation, and the tripwire fired as written.** The dist-tag finding was the
closed-form model's *negative* participation test (`spec is not valid semver → placeholder`) silently
swallowing `@latest` as documentation — the same negative-test error class a prior feedback memory
already names. Rather than patch, the model went to the owner, who **replaced it**: support a small,
CLOSED set of five reference forms and IGNORE everything else (see `## The five-forms model` and the
ledger's simplification leash). A positive, closed enumeration cannot misclassify an unrecognized
form. This deleted the adopt rule (R7), placeholder-as-invisible (R8), and the six-status precedence
(R9) in one move — three generations of churn collapsed by narrowing the problem instead of widening
the classifier. **Trend closed: the lesson across all three generations is the same — do not classify
an open input space; either enumerate a closed set (forms) or gate on an explicit list (the allowlist).**

### Findings the diff will not show

- **The edit-class guard fails GREEN on this CR — now MEASURED on the real diff, not predicted.**
  The ledger's blocking followup called this from a draft; re-run against the landed rename:
  `classify-edit-class --files …/deps/deps.feature --base main` → **53 added / 0 modified / 0 removed
  → ADDITIVE**, the class that self-clears and needs no re-open. The 24 deleted `bundle.feature`
  scenarios are **invisible** to it. Pointing it at the old path is not a workaround —
  `…/bundle/bundle.feature` returns `EGIT` / UNCLASSIFIABLE (`spawnSync git ENOENT` on a deleted
  path). **So nothing mechanical will stop this gate; only the owner's live Clearance grant does.**
  Do not read a green edit-class check as evidence here.

- **The doc-example corruption is live and queued.** It is already committed to the pending
  `changeset-release/main` PR and ships on merge. The release bot regenerates that PR from `main`, so it
  is fixed by fixing the cause on `main` — not by editing the PR. Independent of this CR's timeline.
- **Why the allowlist, and not a better classifier.** Five judge rounds each refuted the previous fix at
  a new point in the input space. The premise itself was wrong: `npx skills add …` (29 files, a real
  published CLI) and the English phrase *"shipping an npx dependency"* (3 governance docs, `dependency`
  is a real package) are indistinguishable from declarations **by the string alone**. Do not re-open this
  by proposing a smarter rule.
- **`npx` accepts ranges natively** (measured: `cyberlegion@^0.1.0` → `0.1.0`), which is why a range in
  prose is a real invocation and the lock must record what it resolved to.
- The abandoned first attempt is tagged `sdd-315-superseded-attempt` (11 commits, refuted premise).

### Do not relearn

`## Settled with the owner` · `## The init relay` · `## Subsumes #315` (both of the issue's own
hypotheses are refuted — do not transcribe them) · `## DIRECTION CHANGE (round 5)` · the ledger shards,
which carry the two Clearance grants, five judge rounds, and the refuted premise.
