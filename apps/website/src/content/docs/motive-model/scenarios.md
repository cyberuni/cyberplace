---
title: Scenarios
description: The model in motion. Actor involvement runs from fully decoupled — roles spread across people — to fully compressed, one human spanning every role while delegates supply production. Two walk-throughs.
---

Who plays which actor, and when, runs along an axis:

- **Fully decoupled** — roles spread across people, gated by asynchronous boundaries.
- **Fully compressed** — one human spans every role while delegates supply the production.

Real work sits between. The axis *is* the abundance dial: where generation is cheap, the team compresses; where it stays expensive, it spreads back out. Here are the two ends.

## Decoupled: a bug fix in an open-source project

- **Framer** — the contributor decides this bug is worth their time, usually self-framed from their own pain; the issue thread is the brief. A maintainer framed it earlier by accepting and labeling it.
- **Explorer** (Builder, divergent) — the contributor reproduces it, reads unfamiliar code, tries a couple of approaches, discards the dead ends.
- **Builder** (producer) — writes the fix and a regression test; the test is the contract, co-delivered.
- *— boundary: the pull request —*
- **The gate** — the maintainer enters *only now*, turning expertise backward against the change: correctness (Builder face) against the bar, fit-to-structure (Architect face), and worth-merging (Framer face). The two-axis verdict applies — accept-or-block, with or without change requests — and a recurring-class concern may be `accept + deferred`, filed as a follow-up. Note the asymmetry: the contributor produced for days with no evaluation present; the gate is async and late.
- **Curator** — if the bug is one of a recurring class, the maintainer encodes a lint rule, a test pattern, or a `CONTRIBUTING` note so the next contributor avoids it. Frequently deferred or skipped — infrastructure neglect in the wild.

**Reading:** one human (contributor) plays Framer + Explorer + Builder forward; another (maintainer) judges at the gate — Builder, Architect, and Framer faces turned backward — and curates. Roles cluster by *position in the contribution flow*, not by job. The same maintainer who judges here is a Builder on their own commits — the verb, not the person.

## Compressed: a solo developer and their delegates ship a feature

- **Framer** — the developer fixes the feature's *why* and what success looks like, sometimes as a written brief, sometimes only in their head.
- **Explorer** (Builder variant) — a delegate spikes three approaches in parallel; the developer, applying expertise *backward*, keeps one and kills two. That pick is the Builder's own backward face — evaluation inside the Builder phase.
- **Builder** (producer) — a delegate implements the chosen approach; the inner loop runs against tests.
- *— boundary: the developer reads the diff —*
- **The gate** — the same human, now turning their expertise backward on the delegate's output. `producer ≠ judge` still holds, because the *delegate* produced and the *human* judges.
- **Architect (conducting)** — the developer notices it should follow an existing convention and directs a refactor under green; if the convention needs a not-yet-built helper, they direct an orchestrator-delegate to build it in parallel rather than stalling the feature — the scheduling decision in miniature.
- **Curator** — at the end, the developer encodes the new convention so the next feature starts warmer — or, more often, a Curator-delegate flags "you've done this three times" and the human approves the entry.

**Reading:** one human spans all four actors, forward and backward, in an afternoon — impossible before AI, when production consumed all their focus. Delegates supply the production capacity, freeing the human to move through the roles while holding motive and accountability throughout. This is the thesis in miniature: **abundance does not replace the human; it lets one human *be* the team.**

## What the two ends share

Same four actors, same two faces, same gate, same surfaces. Only the **compression** changes. The decoupled team isn't running a different model — it's running the same model with production still scarce, so each person is confined closer to one contribution. That is the model being abundance-relative, not abundance-assuming.

---

*Next: [Recursion →](/motive-model/recursion/)*
