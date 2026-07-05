---
name: cyberplace-marketplace-axi
status: active
todos:
  - content: Reframe root spec.md to marketplace-only charter + Out-of-charter tenants section
    status: completed
  - content: Author axi/ reference node (adopt #1-6/#8-10, defer #7) + decisions log
    status: completed
  - content: Fill awesome-list.feature from src/awesome/ with AXI scenarios
    status: completed
  - content: New marketplace/registry/ node + registry.feature (AXI output, #6 non-interactive as impl gap)
    status: completed
  - content: Re-open tavern.feature, retrofit AXI output scenarios (additive, freeze preserved)
    status: completed
  - content: Add registry to marketplace/README.md
    status: completed
  - content: Spec gate — cold sdd-spec-judge 3-lens ALIGNED true, freeze, by-concept, status→approved
    status: completed
  - content: Handoff — impl-trails banners, commit, detached Warden; impl gate WITHHELD (deferred)
    status: completed
---

# cyberplace-marketplace-axi

**CR (spec-approved, impl deferred)** — Reframed the cyberplace project spec to a
marketplace-interaction-only charter and adopted the AXI output contract (#1–#6 + #8–#10; #7 deferred).
Spec + frozen `.feature` suites landed; **impl gate withheld** (impl trails the contract, per
universal-plugin `b20e69c`).

Branch: `cyberplace-marketplace-axi` (off `main`).
Ledger shard: `ledger/cyberplace-marketplace-axi.c5e6e5.jsonl` (leash seq 1, spec-gate approve seq 2).
Spec gate: cold sdd-spec-judge 2 rounds, 3-lens all PASS, ALIGNED true.

## Deferred → follow-up CRs (not this mission)
1. **impl-axi-contract** — build the AXI output in the CLI: TOON default in `src/output.ts`,
   pre-computed aggregates, next-step on stderr, truncation + `--full`, and non-interactive
   `registry` (`add`/`remove`/`update` run to a deterministic default instead of the TTY prompts in
   `src/registry/prompt.ts`). Verify against the three frozen suites; then advance `status: implemented`.
2. **axi-ambient-context (AXI #7)** — session-hook setup + registry-as-installable-skill; pulls in the
   `hook/` tenant.
3. **legacy-tenant-relocation** — move `audit/ commit/ governance/ hook/ skill/` out of the package to
   their homes (see root spec.md → Out-of-charter tenants).

## Warden follow-up
- Non-blocking advisory: `marketplace/registry/` is 52 scenarios (>40). Two-level depth cap +
  one-unit scoping block an in-node split now; the post-mission Warden should weigh a future carve
  (e.g. acquire vs source).

## NEXT
Mission complete at spec-approved. If continuing: open a PR for this branch, or start the
**impl-axi-contract** follow-up CR (build the CLI to the frozen suites, then run the impl gate).
