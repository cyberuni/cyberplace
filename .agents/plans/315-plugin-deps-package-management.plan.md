---
cr-ref: github-315
target-project: universal-plugin
touched-specs: [universal-plugin, cyberlegion-plugin]
blast: high
hitl: true
leash: auto-none
todos:
  - content: "explore — author plugin/deps node on the ALLOWLIST model (ls|up|add|remove|scan)"
    status: completed
  - content: "explore — rename pins.json -> deps.json in cyberlegion-plugin init (3 frozen scenarios)"
    status: completed
  - content: "spec gate — sdd-spec-judge ALIGNED on BOTH specs; HITL ratification required"
    status: in_progress
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

## NEXT — resume here

**The node is DRAFTED and at the spec gate. Round 8 of the cold spec-judge is the live frontier.**

State: `plugin/deps/` authored on the allowlist model (71 scenarios), `cyberlegion-plugin/init`
retargeted to `.plugin/deps.json`, root maps + concept index updated, `status: draft` on
`universal-plugin` (the legal state for a Clearance re-open — see R7). All mechanical checks green:
`check-suite`, `check-spec-state` (both projects), `pnpm check:specs`, 0 open markers.

**Do NOT read green mechanical checks as evidence here** — see the edit-class finding below.

Round 8 returned ALIGNED false (builder); its findings are cleared by the **closed form** — see
`## Convergence ledger`, which also carries the next tripwire. **Round 9 is dispatched.**

If round 9 returns ALIGNED false: read `## Convergence ledger` FIRST and honor its tripwire before
patching. If ALIGNED true: the gate still needs **HITL ratification** (Clearance) — do not
self-assert. Then proceed to the deliver todos, where `## Grill notes`' release-flow item and the
blocking ledger followup about `package.json`/`release.yml` are ATOMIC with retiring `plugin bundle`.

The node to build — **the allowlist is the selector**, not any property of the prose:

1. `.plugin/deps.json` declares **which packages are managed**. A name not on the list is never looked
   for. This is the whole fix; everything else narrows to it.
2. `deps add <pkg>[@spec]` / `deps remove <pkg>` — how a name gets on and off the list.
3. `deps scan` — surface `npx <name>` references that are **not** managed. Load-bearing (below).
4. `deps ls` reads the lock; `deps up` resolves from a registry and writes. Both act on managed names only.
5. Keep the **extraction boundary** (a reference ends at whitespace or a Markdown/sentence delimiter;
   the delimiter is never part of the spec) and the **placeholder rule** (a managed package can still
   appear as `@<version>` in prose). Both survive; their blast radius collapses to managed names.

Then re-judge. **The judge brief must carry NO scope facts** — point it at the node's Non-goals and the
ledger and say so. Anything briefed around is something the spec fails to say.

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
| R9 | *pending* | judging the **closed form** | — |

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
