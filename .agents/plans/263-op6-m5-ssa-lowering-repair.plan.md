---
cr-ref: 263-op6-m5
source: https://github.com/cyberuni/cyberplace/issues/263
node: op6-m5
touch-set: sdd/ssa-lowering
blast: medium
status: in-progress
todos:
  - content: "Validate the seven against main before scoping (re-measure, never trust the brief)"
    status: completed
  - content: "#253 — close as absorbed: extract-situation withholds the scenario name (measured)"
    status: pending
  - content: "#250 — close as superseded: cohesion is non-substitutable, boolean is terminal"
    status: pending
  - content: "#254/#255 — state the two missing doctrine rules abstractly; prove by ablation"
    status: pending
  - content: "#241/#256 — ablation sweep: effective vs nominal suite size"
    status: pending
  - content: "#249 — Clearance/design call: batch to owner, do not self-assert"
    status: pending
  - content: "Structure pass: split the fold-manufactured double-barreled dimensions"
    status: pending
  - content: "Spec gate, impl gate, handoff"
    status: pending
---

# op6-m5 — repair the ssa-lowering frozen suite

Last repair before the #224 barrier-fence capstone (op6-m6), which is RAW-blocked on this node
and must edit `ssa-lowering.feature:137`. That edit is only safe once this suite is a sound
instrument.

## Measured verdicts on the seven (re-measured against main, NOT taken from the brief)

- **#253 — ABSORBED by #269.** Ran `extract-situation` against the leaking Oracle title: the brief
  emits `Given`/`When` only. The engine's contract table says the scenario **name** is *never*
  emitted ("names state the verdict"). #253 predicted this exact close. Close, do not re-fix.
- **#250 — SUPERSEDED by #292's selection rule.** Cohesion was demoted (README:304). The remnant ask
  — re-promote it to a rubric behind a temptation `Given` — is now **illegal**: cohesion is
  **non-substitutable** ("great barrier detection makes up for scattering a coupled node into thin
  fragments" — nobody accepts that), so a boolean `Then` is its **terminal** state, not a
  consolation. De-entailing it would not help: a de-entailed non-substitutable criterion is still
  barred from the sum. The issue is wrong twice — its own prescription (over-**merge**) was already
  refuted by README:317-320 (cohesion's miss is over-**split**).
- **#254 — LIVE.** SKILL.md:56 teaches direction only from a declared slogan ("an explicitly
  zero-telemetry, local-only product"). No rule infers direction from how a product ships.
- **#255 — LIVE.** SKILL.md:73's anti-fuse rule sits in step 2 (placement). Step 3's regroup bullet
  (:95-98) never restates it — the agent has no rule in front of it where the temptation arises.
- **#249 — LIVE, owner's call.** SKILL.md:37's exclusion vs the misaligned `@rubric` (one CR / one
  capability). Measured N=3: 1/3 producers took the exit, scored 0/6. Both sides plausibly intended
  ⇒ not a stale-mistake ⇒ escalate.
- **#256 / #241 — LIVE, converge.** 19/20 scenarios never ablated. Both are the same measurement.

## The spine — PROPOSED, THEN MEASURED FALSE (half of it)

**Proposed:** "#254/#255 are instrument defects in disguise. A dimension whose rule the doctrine never
states is bound to nothing; stating the rule where the act happens binds it, provable by ablation."

**#254: REFUTED by measurement. The rule was NOT landed.** Ablated properly — stripped the doctrine's
telemetry worked example (the pattern-match crutch), then ran two arms × N=3 blind producers on the
`misaligned` probe:

| arm | doctrine | verdicts | score |
|---|---|---|---|
| A — no example, **no rule** | competence only | reshape, kill, reshape | **3/3 PASS (6/6)** |
| B — no example, **+ the #254 rule** | rule supplied | reshape, kill, kill | **3/3 PASS (6/6)** |

**Δ = 0.** The rule is dead weight. I ran the control and it survived — the exact trap of ablating your
own fix and reading survival as a pass. Not landed.

**The real defect #254 misdiagnosed.** `catches-misalignment` is unloseable **via its `Given`**, not via
a missing rule. The situation states the direction three redundant times — *"read-only"*, *"no write
credentials"*, *"README promises it will never open a pull request or touch a branch"*. There is no
direction left to infer; the dimension measures whether the model can read, not what the doctrine
teaches. **No rule added to the doctrine can fix a situation that already contains the answer.**

This is the identical shape README:276-283 already flagged on `irreducible` — *"its situation ... hands
over **both** answers the rubric grades"* — the suite's self-declared weakest rubric. `catches-misalignment`
has the same defect and it was never noticed. That reclassifies #254: **a cued `Given` = a SUITE defect
needing a frozen `Given` edit ⇒ Clearance**, not the subject gap it was filed as.

**#255: ablating before deciding.** Same claim, and I just watched it fail once. Note the asymmetry that
makes #255 more promising: single-writer does **not** entail non-fusion (one Mission owning X, Y and Z
is still single-writer), so unlike `cohesion` the dimension is not entailed — it may genuinely bind.

## Hazards

- **My own fix can create absorption (#241's trap).** Stating the direction rule with the probes'
  apparatus ("read-only, no write credentials" / "no clock, same bytes") lifts the probe's
  illustration into the doctrine and the probe then grades nothing. State the rules **abstractly**;
  add **no** worked example (#254/#255 both say a 2nd example hands memorizers another template).
- **Ablation, never the miss test** (#303). The miss test cannot see an entailed dimension.
- **Controls that must survive** — derived from THIS suite, not the stale/inverted `operator.feature`
  one: `distinct-nodes` ("separate nodes, neither fused nor pooled") is two failure modes of ONE
  criterion — must NOT be split; `regroup-by-ownership`/`disjoint-nodes-not-fused` is the legal
  rule/gradient shape — must NOT be classed redundant by twin-scan.

## The fold finding (new — candidate follow-up issue)

#221 repeatedly folded dimension B into dimension A to escape unloseable dimensions. That move
**manufactured double-barreled dimensions**, which #292's structure step now makes illegal:
`irreducible-recognized` (recognize + serialize — README:281 admits the fold),
`conservative-default` (treat-as-hard + serialize), `catches-misalignment` (infer direction + not
mistaken for stale — README:260 admits the fold). Structure runs **before** selection.

## NEXT

Batch the #249 design call + the Clearance shape to `pod-op6-m5`. Run the ablation sweep for
#241/#256 concurrently. Then author the two doctrine rules and re-measure.
