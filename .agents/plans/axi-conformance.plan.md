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
  - content: "Spec gate: cold judge round 1 -> ALIGNED false (2 Builder gaps: managed scope + #6 no-prompts); FIXED both; re-grading"
    status: in_progress
  - content: "On approve: freeze 4 .feature, root->approved, self-assert/ratify gate line to ledger shard"
    status: pending
  - content: "Deliver: build+governance implemented (re-impl+impl gate); validate+init spec-first per ADR-0001. Decide with user."
    status: pending
  - content: "Handoff PR; file #7 (session-hook setup + skill) follow-up CR"
    status: pending
---

# CR: axi-conformance — make universal-plugin follow AXI

Source: https://github.com/kunchenguid/axi (AXI = Agent Experience Interface, 10 design principles for agent-native CLIs).

Target spec: `packages/universal-plugin/.agents/spec/` (status `approved`, impl-deferred per ADR-0001).

**Scope:** AXI principles #1–#6, #8–#10 across build/validate/init/governance. #7 (session-hook setup cmd + installable skill) DEFERRED to a follow-up CR — collides with the charter boundary (hooks→cyberplace, skills→cyberspace).

**Freeze handling:** re-open & rewrite frozen scenarios in place (nothing shipped). User ratifies re-open in-session (conductor holds user channel).

**The 10 AXI principles:** 1 TOON output · 2 minimal schemas (3-4 fields) · 3 truncation + `--full` · 4 pre-computed aggregates · 5 definitive empty states · 6 structured errors/exit codes, no interactive prompts, fail-loud on unknown flags · 7 ambient context (setup cmd + skill) [DEFERRED] · 8 content-first (no-arg = live data) · 9 next-step suggestions · 10 per-subcommand help.

Ledger shard: `axi-conformance.04835d.jsonl`.

## NEXT

Start explore. Load resolution first (`resolve-governances` over `.agents/universal-plugin.json` for artifact-type of the touched CLI/spec files), then grill node-by-node beginning with the AXI-adoption ADR + `plugin/build`. Confirm with user whether impl builds now or stays spec-first before deliver.
