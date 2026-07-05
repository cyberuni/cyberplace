---
spec-type: reference
concept: [axi]
---

# axi — the Agent Experience Interface output contract

A **reference artifact**: the shared output contract every `universal-plugin` command follows so an
AI agent spends the fewest tokens per interaction. It adopts [AXI](https://github.com/kunchenguid/axi)
(Agent Experience Interface) — a design framework whose principles treat the agent's token budget as
a first-class constraint. This node states the cross-cutting conventions **once**; each behavioral
node ([`plugin/build/`](../plugin/build/README.md), [`plugin/validate/`](../plugin/validate/README.md),
[`plugin/init/`](../plugin/init/README.md), [`governance/`](../governance/README.md)) references this
contract and carries the concrete scenarios that exercise it.

## Subject

- **Artifact** — the AXI output contract, realized as shared CLI-output conventions in the
  `universal-plugin` bin (`packages/universal-plugin/src/`), not a separate shipped file. Every
  command's interface layer (`cli.ts`) honors it.
- **Scope of adoption** — AXI principles **#1–#6 and #8–#10**. Principle **#7** (ambient context: an
  explicit session-hook setup command plus an installable Agent Skill) is **out of scope here** and
  deferred to a follow-up change request: session-hook wiring is the `cyberplace` package's concern
  and agent-facing skills are the `cyberspace` / `aced` plugins' — folding them into this deterministic
  build engine would cross the charter boundary (root `spec.md` placement map).

### The contract surface (the conventions a command must satisfy)

1. **Token-efficient output (#1)** — a result- or list-shaped command emits
   [TOON](https://toonformat.dev/) by default (~40% fewer tokens than JSON). `--format json` stays an
   explicit escape hatch (the existing structured shape); `--format toon` names the default. Free-form
   human prose is never the default for a structured result.
2. **Minimal default schema (#2)** — a list/result row carries **3–4 fields**, not every field
   (governance list → `name, scope`; build result → `vendor, path, status`). Full detail is reached
   through the item's own command or `--full`, never dumped by default.
3. **Truncation + `--full` (#3)** — a large text body (a governance document, a long violation list)
   is truncated with a size hint (`… +240 lines — rerun with --full`) unless `--full` is passed.
   `--full` is the universal escape hatch that suppresses truncation.
4. **Pre-computed aggregates (#4)** — every result carries a summary of counts and statuses inside the
   structured payload, so the agent needs no follow-up round trip (build → `built N, skipped M, failed
   K`; validate → `S schema, V vendor violations`; governance list → `N governances across C scopes`).
5. **Definitive empty states (#5)** — an empty result states so explicitly (`0 governances found`,
   `nothing to build`) with exit 0; never blank output an agent must guess at.
6. **Structured errors, exit codes, no prompts, fail-loud (#6)** — mutations are idempotent; errors
   are structured (a stable `code` + message, honoring `--format`); exit `0` = success, `1` = failure;
   commands **never** prompt interactively (agent-safe by default); an **unknown flag fails loud**
   (exit 1, naming the flag) rather than being silently ignored.
7. *(#7 ambient context — deferred, see Scope of adoption above.)*
8. **Content-first (#8)** — a **command group** invoked with no subcommand shows live data, not help:
   `governance` runs `list`; `plugin` shows the project's build/validate status. (Bare
   `universal-plugin` is a pure dispatcher with no single live view — it shows help.)
9. **Next-step suggestions (#9)** — every command ends with a next-step line naming the natural
   follow-up (`→ universal-plugin plugin validate`), so an agent is handed the next move.
10. **Consistent help (#10)** — every subcommand answers `--help` with a concise reference (synopsis,
    flags, one example), distinct from #8's no-argument content.

### Stream discipline (how the surface is realized)

- **stdout** carries the machine result only — the TOON (or `--format json`) payload **including its
  aggregate summary (#4)**. So `--format json | jq` and TOON parsing stay clean.
- **stderr** carries the human affordances — the next-step line (#9), warnings, and structured errors
  (#6). Redirecting or discarding stderr never corrupts the parsed result.

- **Conformance** — verified through the consumer suites of the four behavioral nodes (each asserts
  the contract concretely for its command), never by this artifact itself. A reference artifact carries
  this `## Subject` in place of `## Use Cases` + a `.feature`.
- **Boundary** — this bar owns the *shared* output shape. Each command's *domain* behavior (what build
  derives, what validate checks, how governance resolves) lives in that command's node. The deferred
  #7 integration surface is not this bar's — it is a future CR routed to `cyberplace` / `cyberspace`.
