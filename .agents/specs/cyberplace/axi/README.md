---
spec-type: reference
concept: [axi]
---

# axi — the Agent Experience Interface output contract

A **reference artifact**: the shared output contract every marketplace-facing `cyberplace` command
follows so an AI agent spends the fewest tokens per interaction. It adopts
[AXI](https://github.com/kunchenguid/axi) (Agent Experience Interface) — a design framework whose
principles treat the agent's token budget as a first-class constraint. `cyberplace` is consumed
almost entirely by AI agents (find/add in an agent's install loop, tavern to point at a crew), yet
its output today is human-prose-first with `--format json` as the escape — the inverse of what an
agent wants. This node states the cross-cutting conventions **once**; each behavioral node
([`marketplace/awesome-list/`](../marketplace/awesome-list/README.md),
[`marketplace/registry/`](../marketplace/registry/README.md),
[`marketplace/tavern/`](../marketplace/tavern/README.md)) references this contract and carries the
concrete scenarios that exercise it.

> This is the **same** contract `packages/universal-plugin` adopted (its ADR-0003); cyberplace shares
> the output shape so an agent moving between the two bins sees one interface.

## Subject

- **Artifact** — the AXI output contract, realized as shared CLI-output conventions in the
  `cyberplace` bin (`packages/cyberplace/src/`), not a separate shipped file. Every command's
  interface layer (`cli.ts` + the shared `output.ts`) honors it.
- **Scope of adoption** — AXI principles **#1–#6 and #8–#10**. Principle **#7** (ambient context: an
  explicit session-hook setup command plus an installable Agent Skill) is **out of scope here** and
  deferred to a follow-up change request. #7 is entangled with `cyberplace`'s own concerns —
  `cyberplace add` (the [`registry/`](../marketplace/registry/README.md) installer) *is* the
  skill-installation mechanism #7 is about, and session-hook wiring is the legacy `hook/` tenant's
  (root [`spec.md`](../spec.md) → Out-of-charter tenants). Folding #7 in now would pull a deferred
  ambient-context design and an out-of-charter tenant into a spec-only marketplace CR; it is routed
  to a later CR instead.

### The contract surface (the conventions a command must satisfy)

1. **Token-efficient output (#1)** — a result- or list-shaped command emits
   [TOON](https://toonformat.dev/) by default (~40% fewer tokens than JSON). `--format json` stays an
   explicit escape hatch (the existing structured shape); free-form human prose is never the default
   for a structured result. (`cyberplace`'s current `--format agent|json|text` collapses toward TOON
   default + the `json` escape.)
2. **Minimal default schema (#2)** — a list/result row carries **3–4 fields**, not every field
   (`find` → `repo, summary, install`; `list` → `name, scope, source`; providers → `name, type,
   match`). Full detail is reached through the item's own command or `--full`, never dumped by default.
3. **Truncation + `--full` (#3)** — a large text body (a long result set, an `inspect` dump) is
   truncated with a size hint (`… +240 lines — rerun with --full`) unless `--full` is passed.
   `--full` is the universal escape hatch that suppresses truncation; `--format json` is never
   truncated.
4. **Pre-computed aggregates (#4)** — every result carries a summary of counts and statuses inside the
   structured payload, so the agent needs no follow-up round trip (`add` → `installed N, skipped M`;
   `find` → `N results across M marketplaces`; `list` → `N skills across C scopes`).
5. **Definitive empty states (#5)** — an empty result states so explicitly (`0 results found`,
   `0 skills installed`, `no providers configured`) with exit 0; never blank output an agent must
   guess at.
6. **Structured errors, exit codes, no prompts, fail-loud (#6)** — mutations are idempotent; errors
   are structured (a stable `code` + message, honoring `--format`); exit `0` = success, `1` = failure;
   commands **never** prompt interactively (agent-safe by default — `add`/`remove`/`update` run to a
   deterministic default instead of the TTY select); an **unknown flag fails loud** (exit 1, naming the
   flag) rather than being silently ignored.
7. *(#7 ambient context — deferred, see Scope of adoption above.)*
8. **Content-first (#8)** — a **command group** invoked with no subcommand shows live data, not help:
   `cyberplace awesome` shows the effective sources; `cyberplace config` runs `config provider list`;
   `cyberplace tavern` shows the crew roster. (Bare `cyberplace` is a pure dispatcher with no single
   live view — it shows help.)
9. **Next-step suggestions (#9)** — every command ends with a next-step line naming the natural
   follow-up (`→ cyberplace add <spec>` after `find`; `→ cyberplace list` after `add`), so an agent is
   handed the next move.
10. **Consistent help (#10)** — every subcommand answers `--help` with a concise reference (synopsis,
    flags, one example), distinct from #8's no-argument content.

### Stream discipline (how the surface is realized)

- **stdout** carries the machine result only — the TOON (or `--format json`) payload **including its
  aggregate summary (#4)**. So `--format json | jq` and TOON parsing stay clean.
- **stderr** carries the human affordances — the next-step line (#9), warnings, and structured errors
  (#6). Redirecting or discarding stderr never corrupts the parsed result.

- **Conformance** — verified through the consumer suites of the three behavioral marketplace nodes
  (each asserts the contract concretely for its commands), never by this artifact itself. A reference
  artifact carries this `## Subject` in place of `## Use Cases` + a `.feature`.
- **Impl trails the contract** — the shipped `cyberplace` bin predates this adoption: it emits human
  prose + `--format json` and still prompts interactively. Only the AXI output surface + the
  non-interactive default is unbuilt; the impl gate withholds certification until a follow-up mission
  re-implements each command against its frozen suite.
- **Boundary** — this bar owns the *shared* output shape. Each command's *domain* behavior (what
  `find` ranks, what `add` installs, how sources layer) lives in that command's node. The deferred #7
  integration surface is not this bar's — it is a future CR.
