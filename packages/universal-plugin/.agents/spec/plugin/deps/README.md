---
spec-type: behavioral
concept: [dependencies, axi]
---

# plugin deps — manage the plugin's npx package dependencies

A plugin's skills invoke other CLIs through `npx <pkg>[@<spec>]`. Those invocations are real
dependencies: `npx` resolves the newest matching version at **run** time, so an unpinned reference
silently changes what a user's agent executes. `universal-plugin plugin deps` manages them the way a
package manager manages any dependency — `ls` · `up` · `add` · `remove` · `scan`.

**`.plugin/deps.json` declares which packages are managed.** A package name that is not on that list
is **invisible** — no command looks for it, so it can never be read, rewritten, or reported as a
dependency. This is the whole selector. Nothing about the surrounding text decides anything.

The list is explicit because **no property of the string can decide it**. `npx skills add
cyberuni/cyberplace` is the bootstrap idiom for an unrelated installer (and `skills` is a real
published package), and the English sentence *"…shipping an npx dependency"* reads identically to an
invocation (`dependency` is a real published package too). Both are indistinguishable from a genuine
declaration by the text alone, and pinning either one is a defect — the first pins an installer whose
entire job is to fetch latest, the second rewrites a sentence into a command. An allowlist does not
shrink that false-positive class; it stops it existing.

Versions stay **in the prose**, where the invocation is. `deps.json` is not a manifest of what to
install — it is the **managed-name list plus the lock**: what each declaration last resolved to.
The lock is load-bearing because a range in prose (`npx cyberlegion@^0.1.0`, natively supported by
`npx`) re-resolves at run time, so the prose alone never says what shipped.

Resolution is from a **registry** (`--registry`, default npmjs.org). There is no workspace/local
version source and no offline mode: `universal-plugin` is a published tool for any repo, and a local
`package.json` is only authoritative under a release flow that bumps it before publish — which is
this repo's changesets policy, not a general contract.

Follows the AXI output contract ([../../axi/](../../axi/README.md)).

## The artifact — `.plugin/deps.json`

Sits beside `.plugin/plugin.json`, at the plugin root, and is **hand-editable** like a
`package.json`. It carries the managed list, each name's recorded resolution, and an `ignore` list of
paths:

```json
{
  "$schema": "https://cyberuni.github.io/cyberplace/deps.schema.json",
  "dependencies": {
    "cyberlegion": { "resolved": "0.1.0" },
    "gherkin-cli": {}
  },
  "ignore": ["skills/upgrade-universal-plugin/SKILL.md"]
}
```

A key under `dependencies` **is** the declaration that the package is managed; its value records what
that package last resolved to (`{}` = managed, never resolved). Because the file is hand-edited,
every write **preserves what it does not own** — `ignore`, `$schema`, and any unrecognized key survive
a write untouched, rather than being regenerated away.

`ignore` escapes a **path**, and is the answer to the one case the managed list cannot express: a
managed package appearing in a file as *illustration* rather than invocation. The
`upgrade-universal-plugin` meta-skill is exactly this — it manages `universal-plugin`, and prints
`npx universal-plugin@1.2.3` as sample output. That string is real semver for a managed name; only its
**location** distinguishes it.

## Classifying a reference — the closed form

Every rule below reads off this one table. It is stated **once**, positively, and it is **total**:
every `npx <managed-name>` occurrence in the plugin's files lands in exactly one row, evaluated
**top to bottom, first match wins**. Nothing else decides participation.

| # | the reference is… | test | a **declaration**? | `up` may write it? |
|---|---|---|---|---|
| 1 | **ignored** | its file's path is on `ignore` | no | **never** |
| 2 | **a placeholder** | its spec is not a valid semver version or range | no | **never** |
| 3 | **bare** | it carries no `@spec` at all | no | yes — it *adopts* (below) |
| 4 | **a declaration** | its spec is a valid semver version or range | **yes** | yes |

Read the precedence off the order: **`ignore` is evaluated first, on the path.** A reference in an
ignored path is invisible in exactly the way an unmanaged *name* is invisible — it never declares,
never adopts, never diverges, and never reaches the lock. That is what makes `ignore` safe: an
illustration string can never perturb a real dependency, which is the same false-positive class this
node exists to eliminate, arriving by a different door.

Only **row 4** declares. From that, everything else follows with nothing left to decide:

- **A package's spec** is the spec its declarations agree on. No declarations → the package has no
  spec. Two declarations that differ → **`divergent`**; `up` fails loud, `ls` says so, a human picks.
- **A bare reference adopts** the package's spec. If the package has no spec, bare `up` pins it
  **exact** — the security default, and the only case where bare `up` invents a version.
- **A placeholder or ignored reference is never written and never counted**, so a managed package can
  be freely written *about* without any of it reaching `up`, the lock, or divergence.

A reference **ends** at whitespace or at a delimiter that cannot appear in a version spec (a trailing
`.`, `?`, `,`, `)`, a backtick, a quote). The delimiter is never part of the spec, and is never
rewritten. Note the consequence: `@1.5.0?` extracts as `1.5.0`, a **valid** spec — so row 2 does not
protect it and row 1 must. That is precisely why `ignore` is a *path* escape and not a form rule.

This table classifies a **managed** name only. It cannot decide membership — that is what five
successive attempts at a prose classifier each proved at a new point in the input space.

## Use Cases

**Subject** — the `plugin deps` command group operating on a plugin project rooted at
`.plugin/plugin.json`, reading and writing `.plugin/deps.json` and the plugin's skill files, with
output per the AXI contract.

- **Rooted at a plugin project** — every verb operates on a plugin project rooted at
  `.plugin/plugin.json`; a missing manifest fails loud (exit 1), like `build`. A missing
  `.plugin/deps.json` is an empty managed list, not an error — nothing is managed yet.
- **The allowlist is the selector** — every verb acts on the names under `dependencies` and on nothing
  else. An `npx` reference to an unmanaged name is never read, rewritten, or counted; `scan` is the
  only verb that sees it, and `scan` only reports.
- **`deps scan`** — reports the `npx <name>` references across the plugin's skills whose name is
  **not** managed, one row per candidate name with how many files carry it, so the managed list is
  built from evidence rather than memory. `scan` classifies nothing and writes nothing; the reader
  decides, once, and `deps add` records the decision. Everything managed → a definitive empty state.
- **`deps ls`** — one row per managed name: the spec its declarations agree on, what the lock records
  it resolved to, and a status. Since one name can carry references of several rows at once, the
  status is the **first** of these that applies — a total rule, no ties:

  | status | when |
  |---|---|
  | `divergent` | two declarations (row 4) disagree — the error outranks every other reading |
  | `unused` | the name has no references at all |
  | `ignored` | it has references, and **every** one is ignored (row 1) |
  | `placeholder` | it has non-ignored references, and every one is a placeholder (row 2) |
  | `stale` | it has a spec, and the lock's resolution no longer satisfies it |
  | `unchanged` | otherwise |

  So a name with one placeholder *and* one declaration is simply reported on its declaration — the
  placeholder is prose, not a competing state. `ignored` and `placeholder` describe a name whose
  every reference is untouchable, which is exactly the residual-risk mitigation: a managed package
  that no command will ever write is **visible** rather than silently absent.
- **`deps up`** — resolves each managed name from the registry and records the resolution in
  `deps.json`. Whether it also **rewrites the prose** depends on what the prose declares, because a
  declared spec is a constraint `up` honors rather than a value `up` overwrites:

  | the prose declares | bare `deps up` writes |
  |---|---|
  | no spec (`npx pkg`) | `npx pkg@2.4.1` — **exact**; the security default, and the only case where bare `up` adds a version |
  | a range (`@^2.0.0`) | **prose unchanged**; the lock records what `^2.0.0` resolves to now |
  | an exact version (`@2.0.1`) | **prose unchanged** — an exact spec is a pin; the lock records `2.0.1` |

  So bare `up` never crosses a constraint and can never silently cross a major. Moving a declared
  spec is an **explicit** act — naming one, or `--latest`:

  | invocation | writes |
  |---|---|
  | `deps up pkg@^2.0.0` | `^2.0.0` — the range is written through; the user opted in |
  | `deps up pkg@^2.0.0 --exact` / `-E` | `2.4.1` — range as input, exact on disk |
  | `deps up --latest` | the newest published version, ignoring the spec the prose declares |

  `--latest` keeps the form the prose already declared — a range keeps its operator (`^2.0.0` →
  `^3.1.0`), a bare or exact reference gets the exact newest; `--exact` forces exact either way.
- **One spec per managed package** — the lock records **one** resolution per package, and a reader
  like an init skill asks it *"what version shipped"* expecting one answer, so a package's
  declarations (closed-form row 4, and only row 4) must agree. Two that differ is the only
  divergence: `up` fails loud, `ls` reports `divergent`, a human picks. Rows 1–3 never diverge with
  anything, because they never declare. Two versions of one CLI inside one plugin is an authoring
  error, not a use case — the rule names it instead of silently picking a winner.

  Adoption (row 3) is what keeps this **idempotent and bootstrappable**: pinning a bare reference to
  exact while a sibling kept its range would *manufacture* a divergence the next `up` then rejects,
  and would make a mixed corpus impossible to seed at all.
- **A managed package with no reference is `unused`** — `add`ing a name does not require the prose to
  invoke it. `ls` reports it `unused`, `up` resolves nothing for it and records nothing. This is the
  honest inverse of `scan`: `scan` finds references with no entry, `unused` finds an entry with no
  references.
- **`up` is all-or-nothing** — every managed name is resolved before anything is written. If any
  resolution fails, `up` writes nothing and exits 1. A half-pinned plugin is a shipped defect, so a
  transient registry failure must not produce one.
- **Idempotent** — a declaration already at the version the registry resolves is left unchanged
  (status `unchanged`).
- **`deps add <pkg>[@<spec>]`** — puts a name on the managed list. Bare `add` records the name and
  nothing else (its references are picked up by the next `up`); `add pkg@^2.0.0` also resolves and
  writes that spec through, exactly as `up pkg@^2.0.0` would. Adding an already-managed name is a
  no-op, not an error.
- **`deps remove <pkg>`** — takes a name off the managed list and drops its recorded resolution. The
  prose is **not** reverted: removing a dependency does not un-write an invocation that still runs.
  Removing a name that is not managed fails loud.
- **Naming an unmanaged package fails loud** — `deps up nonesuch` (or `remove`) exits 1 naming the
  package and pointing at `deps add`. The list is never grown as a side effect of another verb.
- **`--dry-run`** — resolves and reports without writing anything (neither the skill files nor
  `.plugin/deps.json`).
- **AXI output** — each verb prints a TOON section to stdout, one row per package, plus a pre-computed
  aggregate; `--format json` returns the structured shape; `--format toon` names the default; a large
  list truncates with a `--full` escape; an empty result is a definitive empty state; a successful run
  ends with a stderr next-step suggestion; `deps` with no subcommand shows live data (`ls`), not help;
  no verb prompts; an unknown flag fails loud; `--help` documents the flags with a synopsis and one
  example.

**Non-goals** — deciding whether an **unmanaged** `npx` reference is a dependency (`scan` reports
candidates; a human answers via `add` — no classifier over the text can, and this node does not try);
deriving vendor manifests ([`plugin build`](../build/README.md) owns that — `deps` never touches
`.plugin/plugin.json` or the vendor outputs); resolving from a **workspace** or a local
`package.json`, and any **offline** mode (both dropped — a published tool cannot assume a release flow
that bumps locally before publish); `npx` specs beyond its documented `<pkg>[@<version>]` surface (git
specs, tarball URLs, `file:` paths, `npm:` aliases are out of scope); **installing** anything
(`deps.json` is a name list plus a lock, not an install manifest — there are no `node_modules`);
**when and by what `deps up` gets invoked at release** — a consuming repo's CI wiring is that repo's
concern, not this command's behavior, and `deps` works the same whether a human, a script, or a
release job runs it; updating `universal-plugin`'s own reference across a
project's hook files (`self-update`, part of the sync engine destined to leave this package);
refreshing **stale prose** in other plugins' skills, which is a content change.

Every scenario in [`deps.feature`](./deps.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **rooted at a plugin project** | missing `.plugin/plugin.json` fails loud (exit 1); missing `deps.json` = empty list, not an error |
| **the allowlist is the selector** | an unmanaged name (`npx skills add`, the prose `npx dependency`) is untouched by `up` and absent from `ls` |
| **`deps scan`** | unmanaged `npx <name>` candidates reported with file counts + `→ deps add`; managed names excluded; nothing unmanaged → empty state |
| **`deps ls`** | one row per managed name (agreed spec, recorded resolution, status); the status precedence table is total — `divergent` outranks `stale`; a name whose every reference is untouchable reports `ignored`/`placeholder` rather than vanishing |
| **`deps up`** | a bare reference → exact; a declared range → prose unchanged, lock refreshed; an exact spec is a pin bare `up` never moves; `pkg@^2.0.0` → range written through; `--exact` → exact from a range; `--latest` → newest, crossing the constraint, keeping the declared form |
| **the closed form** | every reference lands in exactly one row (ignored / placeholder / bare / declaration), first match wins; only a declaration declares |
| **one spec per package** | two *declarations* disagreeing → `up` exits 1, `ls` says `divergent`, incl. alongside a bare reference; an ignored or placeholder reference never diverges with anything; a bare reference adopts rather than diverging |
| **unused** | a managed name with no reference → `ls` says `unused`, `up` records nothing |
| **all-or-nothing** | a failed resolution writes nothing and exits 1 |
| **idempotent** | already at the resolved version → `unchanged` |
| **form / placeholder** | `@<version>` on a managed name is never rewritten, never declares, and never gives a bare sibling a spec to adopt; a trailing delimiter is not part of the spec |
| **`ignore`** | an ignored path is never rewritten and never counted — `ignore` is evaluated first, on the path, so an illustration cannot perturb a real dependency |
| **the lock** | `up` records the resolution; hand-edited `ignore` / `$schema` / unknown keys survive a write |
| **`deps add` / `deps remove`** | `add` records the name (`@spec` also writes through); re-adding is a no-op; `remove` drops the name + resolution, leaves prose; removing an unmanaged name fails loud |
| **naming an unmanaged package** | `up nonesuch` exits 1 pointing at `deps add` |
| **`--dry-run`** | reports without writing skills or `deps.json` |
| **registry** | `--registry` resolves from the named registry; npmjs.org is the default |
| **TOON rows + aggregate (#1,#2,#4)** | rows + pre-computed aggregate |
| **`--format json` / `--format toon`** | JSON shape; `--format toon` names the default |
| **truncation / `--full` (#3)** | large list truncates with a hint; `--full` shows all |
| **definitive empty states (#5)** | nothing managed → exit 0 with an explicit empty state |
| **content-first (#8)** | bare `plugin deps` runs `ls` |
| **next-step / no-prompt / fail-loud / help (#9,#6,#10)** | `→` next-step; never prompts; unknown flag exits 1; `--help` synopsis + flags + example |
