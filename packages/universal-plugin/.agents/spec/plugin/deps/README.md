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

## The five reference forms

`deps` recognizes **exactly five** forms of an `npx <managed-name>` reference. The set is
deliberately small — an author writes one of these five, and everything else is left alone. In the
version column, `x` is `major`, `major.minor`, or `major.minor.patch` (e.g. `2`, `2.4`, `2.4.1`).

| # | form | example | on `deps up` |
|---|---|---|---|
| 1 | **prose** (bare, no `@`) | `npx cyberlegion` | **warned, never rewritten** — surfaced so a forgotten pin is visible, but treated as prose |
| 2 | **placeholder** | `npx cyberlegion@<version>` | **converted to exact** — the form an author writes first; `up` fills in the resolved version |
| 3 | **exact** | `npx cyberlegion@2.4.1` | a **pin** — bare `up` leaves it; `--latest` moves it |
| 4 | **tilde range** | `npx cyberlegion@~2.4` | resolved within the range; the prose stays; `--latest` crosses it |
| 5 | **caret range** | `npx cyberlegion@^2.4` | resolved within the range; the prose stays; `--latest` crosses it |

**Anything else is ignored** — not an error, not rewritten, not counted. A dist-tag (`@latest`,
`@next`), a comparator range (`@>=1`, `@*`), a git/tarball/`npm:`/`file:` spec, or any other string
is simply not one of the five, so `deps` does not touch it. The set is closed by enumeration: a
reference either matches one of the five exactly, or it is invisible.

**Only forms 3–5 declare a constraint.** Prose (1) is a warning, placeholder (2) is a request to be
filled in — neither sets a version the package must satisfy. From that:

- **A package's constraint** is the one shared by its exact/tilde/caret references. Two of those that
  **differ** is a `divergent` error — `up` fails loud, `ls` says so, a human picks. Two versions of
  one CLI in one plugin is an authoring mistake, named rather than silently resolved.
- **A placeholder adopts** that constraint: `up` resolves within it and writes the exact result. With
  no constraint anywhere, a placeholder resolves to the **newest** published version.
- **Prose is only ever warned about**, so a forgotten `npx cyberlegion` is surfaced without being
  silently rewritten into a pin.

`ignore` still escapes a **path** (evaluated first, before any form): a reference in an ignored file
is invisible entirely — never warned, never converted, never counted. This is what protects the one
real illustration file (`upgrade-universal-plugin` prints `npx universal-plugin@2.4.1` as sample
output, an exact form `up` would otherwise pin). A reference ends at whitespace or a trailing
delimiter (`.`, `?`, `,`, `)`, a backtick, a quote) that is never part of the spec.

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
- **`deps ls`** — one row per managed name: its constraint (the exact/tilde/caret spec its references
  share, or `—` for none), what the lock records it resolved to, and a status:

  | status | when |
  |---|---|
  | `divergent` | two exact/tilde/caret references carry **different** specs |
  | `unused` | the name has no recognized references at all |
  | `unpinned` | it has references, but none is a constraint yet (only prose and/or placeholders) |
  | `stale` | it has a constraint, and the lock's resolution no longer satisfies it |
  | `ok` | otherwise — resolved and consistent |

  Bare-prose references are also surfaced as a **warning count** on the row, so a forgotten pin is
  visible without changing the status.
- **`deps up`** — resolves each managed name from the registry, records the resolution in `deps.json`,
  and rewrites the prose form by form:

  | the reference is | bare `deps up` does |
  |---|---|
  | **prose** (`npx pkg`) | **warns**, leaves it — never invents a pin from a bare reference |
  | **a placeholder** (`@<version>`) | **converts to exact** — writes the resolved version (`@2.4.1`) |
  | **exact** (`@2.4.1`) | leaves it — a pin; the lock records it |
  | **a range** (`@~2.4` / `@^2.4`) | leaves the prose, resolves within it, records the result in the lock |

  So bare `up` never crosses a constraint and never silently pins a bare reference. Moving an exact
  pin, or bumping a range's floor, is an **explicit** act:

  | invocation | writes |
  |---|---|
  | `deps up pkg@^2.4` | `^2.4` — sets the constraint in the prose; the user opted in |
  | `deps up --latest` | the newest published version, crossing the declared constraint (a range keeps its operator, `^2.4` → `^3.1`; an exact or placeholder becomes the exact newest) |
- **One constraint per managed package** — the lock records **one** resolution per package, and a
  reader like an init skill asks it *"what version shipped"* expecting one answer, so a package's
  exact/tilde/caret references must agree. Two that differ is `divergent`: `up` fails loud, `ls`
  reports it, a human picks. Prose and placeholders never diverge — they carry no constraint.
- **A managed package with no reference is `unused`** — `add`ing a name does not require the prose to
  invoke it. `ls` reports it `unused`, `up` resolves nothing for it and records nothing.
- **`up` is all-or-nothing** — every managed name is resolved before anything is written. If any
  resolution fails, `up` writes nothing and exits 1. A half-pinned plugin is a shipped defect, so a
  transient registry failure must not produce one.
- **Idempotent** — a reference already at the version the registry resolves is left unchanged
  (status `ok`); running `up` twice changes nothing the second time.
- **`deps add <pkg>[@<spec>]`** — puts a name on the managed list. Bare `add` records the name and
  nothing else (its references are picked up by the next `up`); `add pkg@^2.4` also sets that
  constraint in the prose, exactly as `up pkg@^2.4` would. Adding an already-managed name is a
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
that bumps locally before publish); **any reference form outside the five** — dist-tags (`@latest`,
`@next`), comparator ranges (`@>=1`, `@*`), git specs, tarball URLs, `file:` paths, and `npm:` aliases
are all simply **ignored** (never rewritten, never an error), not classified or supported; **installing**
anything
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
| **`deps ls`** | one row per managed name (constraint, recorded resolution, status ∈ `ok`/`stale`/`unpinned`/`unused`/`divergent`); bare-prose references surfaced as a warning count |
| **the five forms** | prose → warned; placeholder → converted to exact; exact → pin; tilde/caret → range; **anything else ignored** (dist-tag, comparator, git/tarball/npm:) |
| **`deps up`** | placeholder → exact resolved version; a range → prose unchanged, lock refreshed; an exact pin bare `up` never moves; prose warned, never pinned; `pkg@^2.4` → constraint set in prose; `--latest` → newest, crossing the constraint, keeping the operator |
| **one constraint per package** | two exact/tilde/caret references disagreeing → `up` exits 1, `ls` says `divergent`; prose and placeholders never diverge |
| **unused** | a managed name with no reference → `ls` says `unused`, `up` records nothing |
| **all-or-nothing** | a failed resolution writes nothing and exits 1 |
| **idempotent** | already at the resolved version → `ok`; a second `up` changes nothing |
| **ignored forms** | a dist-tag / comparator / git / tarball / `npm:` reference is left untouched and not counted |
| **`ignore`** | an ignored path is never rewritten and never counted — evaluated first, on the path, so an illustration cannot perturb a real dependency |
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
