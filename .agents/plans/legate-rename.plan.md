---
name: legate-rename
status: active
todos:
  - content: "rename gateway skill cyberlegion→legate (folder + name: + heading)"
    status: done
  - content: "rename agent legate.md→headless-legate.md (name: + heading + self-refs)"
    status: done
  - content: "fix artifact code-refs: `legate` agent→`headless-legate`; `cyberlegion` gateway→`legate` (persona 'the Legate' stays)"
    status: done
  - content: "revise cyberlegion-plugin spec (spec.md + gateway/dispatch READMEs)"
    status: done
  - content: "update website cyberlegion/overview.md stale agent ref"
    status: done
  - content: "audit-validate (folder==name green); commit + handoff"
    status: done
---

# CR legate-rename — rename gateway skill + headless agent

Target spec: `.agents/specs/cyberlegion-plugin` (project `plugins/cyberlegion`, status draft).

## CR

Two renames in the `cyberlegion` plugin:
- gateway **skill** `cyberlegion` → `legate` (folder `plugins/cyberlegion/skills/cyberlegion/` →
  `.../legate/`, `name:`, `# heading`)
- headless **agent** `legate` → `headless-legate` (`plugins/cyberlegion/agents/legate.md` →
  `headless-legate.md`, `name:`, heading, self-refs)

Result model: **the Legate** (persona) is realized in-session by skill `legate`, headless by agent
`headless-legate`. The persona word "the Legate" is unchanged everywhere.

## Reference-fix rule (per file)

- code `` `legate` `` meaning the **agent** → `` `headless-legate` ``
- `` `cyberlegion` `` / "the cyberlegion gateway" meaning the **skill** → `` `legate` ``
- prose **"the Legate"** (persona/role) → **unchanged**
- `` `cyberlegion` CLI `` / plugin/package name `cyberlegion` → **unchanged**

## Freeze / gate

Spec is `draft`, no `.feature` suites (owed) → nothing `@frozen`. No freeze re-open, no spec-gate
freeze, no impl-judge. This is a descriptive-node revise + artifact rename.

## Out of scope (deliberate)

- CLI spec `packages/cyberlegion/.agents/spec` — different project; its refs are to the persona /
  the historical CR name `legion-gateway-legate`, not the renamed artifacts.
- ADR 0022/0023 — historical decision records; `legate` mentions describe the decision at the time.

## NEXT

LANDED in commit `9bf85ab` (branch `main`, not pushed). Retire this brief at doctrine distillation.
Full `pnpm verify` is red on a pre-existing, unrelated cause: the untracked `.agents/cyberlegion/
worktrees/` checkout pollutes knip/typecheck globs (not gitignored). That is a separate repo-hygiene
fix, out of scope for this rename.
