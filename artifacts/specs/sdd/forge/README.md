# forge/ — the harness outer loop

The **Forge loop** (metaphor) / **Harness loop** (descriptive) — the step-5 outer loop that
improves **what we build and work *with***: the project's standing engineering and distribution
harness. Owned by the **maintainers** — the shipyard that refits the ships. It pairs with
`harness/` exactly as `formation/` pairs with `corpus/`: each outer loop evolves a standing
subject.

Standing subject: **`harness/`** — the toolchain (and why), CI/CD, distribution/release
(changesets, `plugin.json`, marketplace), contribution, the contract-registry init-write, and
the public skill manifest. The `harness/` folder is the spec-level description; the actual
`package.json` / CI YAML / `CONTRIBUTING.md` are the code-level artifacts it abstracts.

## Altitude — the harness, never a mission

The Forge loop refines the harness over time; it does not run a mission and decides nothing
about the product. It sits at the **meta** altitude — above a single mission entirely. A
harness retrospective asks *"what should we build / work with?"* — never *"should THIS change
ship?"*

## Output — emits new CRs

Findings re-enter the system as **new CRs** through the single intake
(`intake/README.md`); the loop never auto-applies a harness change. Triggers are
retrospective: a release, a recurring CI failure, a toolchain pain point, or drift between the
declared harness and the real `package.json` / CI / contribution files. Each surfaces a CR to
evolve `harness/` (and the code-level artifacts it abstracts). The human **Council** (or the
maintainers) holds keep-or-cut; nothing becomes work without a ratified CR.

## The cross-installation field dimension

The harness loop also reaches *outside* this repo to grow the shared SDD contract from **real
corrections** rather than invented ones — the mechanism behind the descriptive promise that
*"the cause enum grows from real corrections."* It generalizes **across installations** (where
`doctrine/` generalizes across missions within one adoption): it gathers what users hit in the
field and routes it to the maintainers, who run their own loops on SDD.

The unit fed upstream is the combat-log **`correction`-with-`cause`** record — the same
provenance unit `design/provenance-model.md` owns; this folder consumes that shape, it does not
redefine it. Because corrections can carry code, prompts, paths, and secrets, **opt-in,
redaction, visibility, and human review are load-bearing, not bolted-on**:

| Stage | Requirement |
|---|---|
| **Consent** | explicit opt-in; **default OFF**; revocable. With opt-in OFF the loop captures nothing and sends nothing — fully inert. |
| **Minimize** | capture only the correction-with-cause record needed upstream — not surrounding context, not the whole transcript. |
| **Redact / anonymize** | strip or mask sensitive content (secrets, paths, identifying data) before anything can be transmitted. |
| **Preview** | the user reviews **exactly what would be sent** before it leaves — no opaque payload. |
| **Maintainer review** | a submission enters the shared corpus **only** after a human maintainer reviews it. |

**Hard invariant:** sensitive data is never transmitted unredacted; a record that has not
passed redaction is never eligible to leave the environment.

## Optional and downstream — never blocking

The field dimension is **entirely optional**. SDD's core workflow — intake, explore, deliver,
handoff, and the other outer loops — runs **identically whether the field loop is present,
absent, or opted out**. It is **never a dependency** of any core step; coupling is deliberately
loose. `priority: 3` — built after the core loops are solid, costing nothing operationally in
its absence.

## Boundaries — Forge owns the harness only

A product decision → `campaign/`; a corpus-structure observation → `formation/`; a process
lesson → `doctrine/`. Forge evolves the engineering & distribution harness and nothing else.

## Scenarios

Unit scenarios (consent OFF ⇒ nothing captured; no unredacted transmit; core workflow
unaffected) colocate in this folder; cross-capability outcome scenarios live in `acceptance/`.
