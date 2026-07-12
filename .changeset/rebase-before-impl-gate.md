---
"@cyberplace/sdd-plugin": minor
---

The conductor now **rebases the CR branch onto the target as its last deliver act, before the impl
gate**, so the frozen suite verifies the merged tree that actually lands.

- **Clean linear history, verified merge.** Before running the impl gate, the conductor rebases onto
  the current target tip (`pull --rebase` onto latest `main` for commit-to-main projects). The impl
  gate then judges the merged tree — keeping history linear and guaranteeing impl-sync holds on what
  lands, so handoff stays a pure consumer that never re-verifies.
- **Conflicts are deliver work.** A textual conflict is resolved as deliver code work against the
  frozen `.feature` (never a `.feature` edit); the gate re-runs on the resolved tree.
- **No new hard floor.** Rebasing an unmerged CR branch is git-reversible (reflog), so it introduces
  no new mandatory stop. A conflict resolution that would narrow a frozen scenario still fires the
  existing Clearance floor; semver-over-ceiling fires Compatibility; a genuine contradiction fires
  Conflict.
