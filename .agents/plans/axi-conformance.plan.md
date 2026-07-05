---
name: axi-conformance
status: active
todos:
  - content: "Record AXI-adoption ADR in design/decisions (scope #1-6,8-10; #7 deferred; re-open rationale)"
    status: completed
  - content: "Author axi/ reference node (shared contract) + all 4 behavioral nodes rewritten (build/validate/init/governance) + root spec + concept-index"
    status: completed
  - content: "Content-first #8 = group subcommands (governance->list, plugin->validate); non-interactive #6 uniform; per-subcommand help #10"
    status: completed
  - content: "Spec gate: cold judge ALIGNED true (round 1 caught managed-scope + #6 no-prompts gaps; fixed, re-graded PASS); froze 4 .feature, root->approved, gate line in shard; committed cebb510"
    status: completed
  - content: "Deliver DECISION (user): spec-only, defer ALL impl. Root stays approved. build+governance impl now trails frozen AXI contract (banners added)."
    status: completed
  - content: "Handoff DONE: placement final (axi/ top-level); banners committed b20e69c; detached Warden spawned; leak-clean. OUTSTANDING (user): push+open PR axi-conformance->main; 2 follow-up CRs documented in NEXT (impl-axi-contract, axi-ambient-context-#7)"
    status: completed
---

# CR: axi-conformance — make universal-plugin follow AXI

Source: https://github.com/kunchenguid/axi (AXI = Agent Experience Interface, 10 design principles for agent-native CLIs).

Target spec: `packages/universal-plugin/.agents/spec/` (status `approved`, impl-deferred per ADR-0001).

**Scope:** AXI principles #1–#6, #8–#10 across build/validate/init/governance. #7 (session-hook setup cmd + installable skill) DEFERRED to a follow-up CR — collides with the charter boundary (hooks→cyberplace, skills→cyberspace).

**Freeze handling:** re-open & rewrite frozen scenarios in place (nothing shipped). User ratifies re-open in-session (conductor holds user channel).

**The 10 AXI principles:** 1 TOON output · 2 minimal schemas (3-4 fields) · 3 truncation + `--full` · 4 pre-computed aggregates · 5 definitive empty states · 6 structured errors/exit codes, no interactive prompts, fail-loud on unknown flags · 7 ambient context (setup cmd + skill) [DEFERRED] · 8 content-first (no-arg = live data) · 9 next-step suggestions · 10 per-subcommand help.

Ledger shard: `axi-conformance.04835d.jsonl`.

## NEXT

CR complete as **spec-only** (user decision). Spec + suite committed `cebb510`, root `universal-plugin` = `approved`, four `.feature` frozen to the AXI contract. Remaining handoff: open PR on branch `axi-conformance` → `main`, spawn detached Warden formation pass, file two follow-up CRs:
1. **impl-axi-contract** — build the AXI output impl for all four commands (re-impl build+governance to satisfy the frozen suite; build validate+init). This is the deferred deliver.
2. **axi-ambient-context** — AXI #7 (session-hook setup command + installable skill), routed to cyberplace (hooks) + cyberspace/aced (skill); likely a thin universal-plugin setup command that delegates.

No further spec work on this CR. Doctrine-distill + retire this plan once the PR merges.
