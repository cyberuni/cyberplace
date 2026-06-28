---
name: start-mission
description: Use this skill to make a change to an SDD project — triggered by a general change request like "add a start-mission skill to sdd", "implement the auth capability", "revise the gateway spec", or "work on <github issue url>". Opens a change request against the durable project spec and runs the mission loop (explore → deliver → handoff).
---

# start-mission

The single user-facing entry for **changing an SDD project**. It opens a **change request (CR)** against the one durable project spec (`.agents/specs/<project>/`) and runs the **mission loop** over it. The session that runs this skill **is the conductor** — the user in the driver's seat, holding the user channel, grilling live, ratifying in-session. This skill is the **in-session realization of the conductor role** (the `automaton` agent is the headless realization for an unattended scheduler or a multi-CR fan-out).

A CR is the **unit of change-intent** (git-PR-shaped); the mission loop is the workflow that carries it. Whether the CR **adds** a capability, **revises** behavior, or **reconciles** overlap is decided during **explore** — not by a separate entry skill. A request with **no suite-relevant behavior** is **not a CR** and escapes the lifecycle (leave no SDD record).

> **Advise a capable model (e.g. Opus) on entry.** The explore grill runs in this session, so its quality tracks the session model. Surface this **before** the grill so the user can switch if needed. (The harness cannot switch the session model on your behalf.)

Load `sdd:lifecycle-governance` (status enum, the freeze re-open transition), `sdd:ownership-governance` (who writes each field), `sdd:spec-format-governance` + `sdd:suite-format-governance` (the node skeleton + suite bars), `sdd:spec-producer-governance` (the grilling procedure run inline), `sdd:impl-producer-governance` (what the spawned builder loads), `sdd:gate-validation-governance` (legal gate-state tuples), and `sdd:combat-log-governance` (the provenance shapes). The autonomy bar is baked in (below).

## Step 1 — intake: open the CR and scaffold the plan

Get the CR into the system and create its plan brief — the plan is a step-1 artifact, not something explore invents later.

- **Recover the request.** From a general change prompt, name the change and the target. From a **source URL** (`work on <github issue url>`), fetch the issue and read it as the CR body.
- **Locate the project spec** under `.agents/specs/<project>/`. One project is one spec — there is no spec fleet to pick from.
- **Scaffold `.agents/plans/<cr-ref>.plan.md`** from a basic template: frontmatter `todos` (ordered, `status: pending`) + a `## NEXT` anchor + the CR link. This is the portable handoff brief `pause-mission` / `resume-mission` operate on.
- **Escape a non-CR.** If the grill shows no suite-relevant behavior, state that the work leaves the lifecycle, create no draft, invoke no gate, write no record.

## Step 2 — explore: grill the spec + suite, build to learn

Run authoring **in-session** as the conductor. Explore **builds the implementation to learn** (build-to-learn) — implementation is not deferred to deliver; the freeze is the boundary. The phase ends at the **spec gate**.

**Resolution first.** Read **only** the project registry `.agents/universal-plugin.json` (never scan plugin dirs), match **each touched file's** `artifact-types`, and resolve each production-chain role to a plugin delegate or the SDD default. A required role with no real delegate **fails closed**. A domain claimed by two plugins → ask (answered live in-session).

For each unit the CR touches:

- **Locate or propose the node.** If a `spec.md` / `README.md` already exists at the target → this is a **revise** (no scaffolding). Otherwise **scaffold** a new node; if the user named no capability, propose the folder from the CR and confirm.
- **Classify the node** (declared, never inferred): `spec-type: behavioral` (a testable unit → `## Use Cases` + a `<unit>.feature`), `reference` (a shipped non-testable artifact → `## Subject`, no `.feature`), or **descriptive** (an index → no marker). Also classify **`artifact-types`** (the squad key — `skill` / `subagent` / `command` / `agents-section`, or omit for plain product code); set once, **confirm with the user, never guess**.
- **Scaffold the skeleton** per `sdd:spec-format-governance` (sections per type; `.feature` form per `sdd:suite-format-governance`). Write **no** control frontmatter (`status` / `aligned` / `approval` / `produced-by`) — those live on the root `spec.md` and belong to the conductor and the gate.
- **Collect seed intent.** For a **new** feature, ask 3–5 targeted questions (the core problem and who has it; observable behavior; the public interface; edge cases / non-goals; reviewers who must be heard). For **backfill** (behavior already in code), skip — the producer reads source, tests, history. For a **revise**, collect what changes and why and the parts it touches.

**The grill loop (the user loop).** You are the conductor. Run the spec-producer **inline** (load `sdd:spec-producer-governance`, or persona-load a plugin specialist for the `artifact-types`), **spawn the cold spec-judge** each round, and for build-to-learn **spawn the impl-producer builder** in `explore` mode against the **non-frozen** suite — spikes are thrown away; their learnings feed the live grill to steer the spec + suite. Set an **iteration cap** (default **3**; honor a user-named cap), then loop:

1. Grill the user **live** with the node path, `artifact-types`, and the seed intent (or `backfill` / `revise`); write the draft `spec.md` + `.feature`.
2. Spawn the cold spec-judge; incorporate its verdict and any `<!-- open: -->` markers.
3. On convergence → exit to the spec gate.
4. On `blocked`, or the cap hit without converging → **do not auto-accept**. Present the failing scenarios and ask the user to **accept as-is**, **keep looping** (reset the count), or **change direction**.

**Freeze re-open guard.** A node at `status: approved` or `implemented` has a **frozen `.feature`**. Re-opening is a freeze transition and a `status` write you do not own — confirm the re-open was **ratified** (the lightweight async re-open flag) before editing. **Never edit a frozen `.feature` without the ratified re-open.**

**Route observations.** The spec-producer surfaces typed `OBSERVATIONS` (`architect` | `strategist`); never act on them silently. Surface them. A granularity / split observation becomes a **new node** or a **corpus** operation — never a marker grown into this node. Decline = drop it.

## Step 2 gate — the spec gate (Draft → Approved, internal)

Run the spec gate as an **internal step** (not a user-invocable skill). Judge each touched unit suite against `sdd:suite-format-governance` (untagged scenarios boolean; `@rubric` well-formed) and the spec-format bars; load `sdd:lifecycle-governance` + `sdd:ownership-governance` + `sdd:gate-validation-governance` for the legal state tuple. **Never advance** with judge failures, open markers, or a misaligned suite. On **approve**: **freeze** each touched `.feature` via its `@frozen` tag, record a per-CR `gate` line in the root `ledger.jsonl`, and set `status: approved`. `spec.md` stays aligned, never frozen.

## Step 3 — deliver: build to keep

Build-to-keep against the **frozen** suite. **Spawn** the impl-producer builder (it loads `sdd:impl-producer-governance`; a named plugin / model-tuned producer runs at its own model + effort) to build the artifact **and** one verification per frozen scenario.

**The impl gate (Approved → Implemented, internal).** Spawn the **cold impl-judge** (`sdd:sdd-implementer` or the covering plugin's judge) to run the verification per frozen scenario plus an orthogonal structural/scope read. Set impl-layer **`aligned`** true **only when every impl-judge passes** (a frozen scenario with no verification blocks `aligned`). The three actions: **approve** → `implemented`; **change** → fix the **code** (never the frozen `.feature`); **reject** → redo, or a **Director-lens revert** (a frozen scenario proved fatal → unfreeze the `.feature`, return to `draft` — the only place a frozen `.feature` reopens).

## Step 4 — handoff

Land per the handoff unit: the declared delivery shape (branch → PR where the repo is PR-flow), decomposed by **unit of work** (one co-committable change per commit), conditional `status` write-back, a distilled public summary, and follow-ups filed as **new CRs**. Introduce no new hard floor; keep the combat log in the PR; keep the plan until the CR is done/merged and doctrine-distilled.

## Autonomy, provenance, and the hard floor (baked in)

- **Initial strategy** (run start): assess blast radius + the other dimensions and emit a run-level `strategy` block to the root `ledger.jsonl` — `leash` (`auto-none | auto-spec | auto-all`), `by: derived | user`, `approach[]`. It may be user-specified.
- **Per-gate verdict.** At each gate, derive the leash against discovered state and either **self-assert within leash** (write `approval.<gate>: { verdict: approve, by: agent, why }` + `aligned`; the spec lands in the async review queue) or **stop** with a verdict packet for the human. **Never advance** when any judge fails, any open marker remains, or `aligned` is false. Human ratification (`by: <name>`, advance `status`) is reserved to the in-session position holding the user channel — by default you, in-session; a headless `automaton` emits the verdict packet and stops, **even when a coordinator relays "the user approved."**
- **Combat log.** Append `report` / `correction` lines (and the halt that stopped you) to the plan's `*.log.jsonl`; the durable `gate` / `strategy` lines go to the root `ledger.jsonl`. Free text is commit-message-grade — never code, prompts, secrets, or literal values.
- **Hard floors (mandatory stops):** **Clearance** of a narrowing (weakening/deleting an acceptance scenario; pre-authorizable in the CR), **Compatibility** when the semver class exceeds the change-class ceiling (pre-authorizable), and **Conflict** of a logical contradiction in the suite (not pre-authorizable). An obvious stale-mistake contradiction is a conductor-served minor fix; escalate only when both sides are plausibly intended.

## Suspend and resume

A mission runs as **segments** (one autonomous sitting each). Position is **derived from the artifacts** (`spec.md`, the `.feature`, frontmatter, the plan), never a stored cursor. To checkpoint a mission into its plan, use `pause-mission`; to pick one up, `resume-mission` reads the `.plan.md` and continues this loop where it left off.
