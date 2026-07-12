---
"@cyberplace/sdd-plugin": patch
---

Refine the conductor's rebase-before-impl-gate conflict handling (follow-ups to the
rebase-onto-target change):

- **Push-race is closed.** If the target advances between the passing impl gate and the push,
  the conductor re-rebases onto the new tip and re-runs the impl gate — it does not push until the
  gate passes on the re-rebased tree, looping until the push wins. What lands is always a tree the
  gate saw green, even under concurrent merges. The re-verify stays in the conductor/deliver seam.
- **Confident-conflict scenario disambiguated.** The "resolve as deliver work" case is now explicitly
  scoped to conflicts the conductor can resolve confidently, cleanly partitioned against the
  unconfident case that halts.
