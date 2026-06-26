# intake/ — the CR subsystem

The **change request (CR)** is the unit of work — step 1 of the Mission Loop and the top of
the abstraction stack. Everything that enters SDD enters as a CR, and nothing re-enters
except as a CR. `intake/` is the **CR subsystem**: it owns the CR concept, its **sources**
(prompt / Asana / Jira / Linear / GitHub / a local store), the **escape hatch** (work that
is not spec-able), and the **inject channel** (zoom into a single inner-loop agent). It
**feeds** missions — it is not "step 1 inside the mission"; a scheduler pulls a CR from here
and runs the Mission Loop (`../mission/`) to step 4. All sources reach the project through
the universal `../gateway/`.

## The CR is the unit of work

In the abstraction stack each layer is an abstraction of the one below:

- **outcome** — what actually happens.
- **code** — abstraction of outcome.
- **spec + behavior suite** — abstraction of code; what humans read to know what the
  project *is* and does.
- **change request (CR)** — abstraction of the behavior suite. The intent you *grill*
  into concrete deltas to spec + suite (and from there, code).

A CR is therefore not a feature, a spec, or a flag bolted onto a spec — it is the
**intent**. It carries `what` and `why` (free text; `why` may optionally cite a combat-log
correction as a loose pointer, never a copy). The grilling that turns a CR into spec+suite
deltas happens in `authoring/`, which owns the spec gate; the CR itself is pre-grill intent.

The unit is the **project**, not the feature: one durable spec, one behavior suite, one
gate/freeze baseline. A CR produces *deltas* to that single corpus — it never spawns a new
sibling spec to gate. Size is handled by organizing into files/folders, not by splitting
into smaller specs to approve separately.

## Sources — the only work-intake

A CR may originate from any source; the source is the carrier, never a different kind of
work. CR intake is *the only* work-intake in the loop.

| Source | Carrier |
|---|---|
| **human prompt** | a request typed directly to the gateway |
| **Asana** | a task, via `cyber-asana` |
| **Jira** | an issue, via a Jira adapter |
| **Linear** | an issue, via a Linear adapter |
| **GitHub** | an issue, via the `create-issue` / `link-pr-to-task` skills |
| **local store** | a CR persisted in-repo (candidate: a `bd` / beads integration) |

The store behind a source is **pluggable through an adapter**: requesters write *through the
adapter*, never to a backend directly, so a CR is raised the same way whether it lands in the
local store, GitHub, Asana, Jira, or Linear. The adapter contract fixes the operations every
backend must expose — `create`, `read`, `list`, `transition` — and the adapter governance
itself is a later, Architect-lens artifact; this file fixes only the contract.

<!-- open: The local CR store does not exist yet — it needs its own spec.md + .feature
(candidate implementation: a `bd` / beads integration). Spec: the on-disk CR record shape,
its open→accepted→done status, and how the adapter maps `create`/`read`/`list`/`transition`
onto the store. New work. -->

The **adapter set and the local store are new work** — each adapter (and the local store
above) needs its own colocated spec + suite that does not exist yet.

Every actor is a requester through the same adaptor — no requester is privileged. The four
**outer loops** (campaign / formation / doctrine / forge) are CR-generators: a
retrospective finding becomes a **new CR**, which is how the outer loops close back onto the
single intake. A human raises a CR by deciding *what to build*; a loop raises a CR by
finding what should change next.

## Escape hatch — work that is not spec-able

Some requested work is **not spec-able as a feature of a subject**, and SDD recognizes it
and lets it **escape** the lifecycle rather than forcing empty ceremony — a draft with no
freezable scenarios, a spec gate with nothing to judge, an impl gate with no behavior to
verify. The escape is **explicit and recorded, never silent**, and no draft spec is created
for escaped work.

The distinguishing test is whether there is **subject behavior to freeze as scenarios**:

| Kind | Through the lifecycle? | Examples |
|---|---|---|
| **Subject feature** — observable behavior/capability of a project | Yes | add CI, publish GitHub Pages, adopt Vitest, standardize on pnpm, a new CLI command |
| **Representation / meta-work** — changes how SDD models the corpus | No (escapes) | retype specs, split/merge specs, relocate a contract across specs, regenerate derived views, reorganize folders |

Two refinements:

- **Ambiguity defaults to in-lifecycle.** When it is unclear whether work is a subject
  feature or representation work, treat it as a subject feature and route it in. Escaping
  must be *positively recognized*; the safe failure mode is one unnecessary draft, not one
  untracked behavior change.
- **Meta-work that changes SDD-plugin behavior is still a subject feature.** The deciding
  test is the same: changing a lifecycle transition rule produces a freezable scenario
  ("given status X, transition Y is rejected") and stays in the lifecycle; only meta-work
  whose *sole* output is the reorganized corpus escapes.

Recognition lives at the gateway; the reliable recognition mechanism is **not yet
designed** — registered here as tracked work.

<!-- open: How is non-spec-able / representation work recognized? Candidate signals: (a)
the work targets artifacts/specs/** or SDD tooling itself; (b) the user explicitly declares
it meta/representation work; (c) the gateway probes for a nameable subject feature and finds
none; (d) it is a pure refactor of spec shape with no behavior delta. Decide which signals
are authoritative, how they combine, and the gateway's behavior on each. -->

## Inject channel — zoom into a single inner-loop agent

A capability for the human **Council** to zoom from the orchestration level down into a
single inner-loop agent — to communicate with it or fine-tune it directly. It defines two
distinct moves toward an agent, both entered through the `gateway`:

| Move | Nature | Effect |
|---|---|---|
| **Project** | asynchronous, persistent | imprint a **program** (a governance — the agent's operating directives) and withdraw; the tuning persists on every future autonomous run |
| **Inject** | live, transient | jack into one inner-loop agent in real time to converse or pilot *through* it; the channel closes when the Council withdraws |

Projecting is *calibrating the worker*; injecting is *being present in it*. They must never
be conflated — one changes future behavior, the other operates the present.

The mechanism is **dual-mode**: an injectable agent can be (a) dispatched autonomously as
today **and** (b) invoked directly — as a subagent or loaded in-context as a persona — for
a live human channel. The injectable set is the **inner-loop producers and judges**.

Two invariants:

- **The gateway is the single door.** An inject attempted outside the gateway is refused;
  the only accepted entry to both project and inject is the gateway.
- **Inject respects existing contracts.** A live channel does not bypass ownership and
  governance rules: a judge injected live still cannot write artifacts it does not own
  (e.g. a frozen `.feature`); a producer injected live still answers to its program. Inject
  changes *who you are talking to*, never *what they are allowed to do*.

## Scenarios (colocated)

### Channels — intake

```gherkin
Scenario: a human prompt becomes a CR
  Given a human raises a change through the gateway prompt
  When the request is recorded
  Then an open change request exists carrying its what and why

Scenario: a requester writes through the adaptor and never to a backend directly
  Given a requester files a change request
  When the request is stored
  Then the write goes through the adaptor and not to a backend directly

Scenario: an outer-loop finding re-enters only as a new CR
  Given a retrospective loop finds something that should change
  When it surfaces the finding
  Then it files a new change request rather than mutating the corpus directly

Scenario: a why may cite a combat-log correction
  Given a requester references a combat-log correction in the why
  When the change request is stored
  Then the why cites the correction without copying the mission record
```

### Escape hatch

```gherkin
Scenario: Representation work escapes the lifecycle
  Given work recognized as representation work on the spec corpus
  When the sdd gateway handles the request
  Then the work proceeds outside the SDD lifecycle
  And no draft spec is created for it

Scenario: Escaped work skips both gates
  Given work recognized as representation work on the spec corpus
  When the work is carried out
  Then it passes through neither the spec gate nor the impl gate

Scenario: Escape is recorded, not silent
  Given work recognized as representation work on the spec corpus
  When the sdd gateway escapes it
  Then the gateway states that the work is leaving the SDD lifecycle

Scenario: A subject feature stays in the lifecycle
  Given work recognized as a feature of the subject
  When the sdd gateway handles the request
  Then the work is routed into the SDD lifecycle

Scenario: Ambiguous work defaults to the lifecycle
  Given work that cannot be positively recognized as representation work
  When the sdd gateway handles the request
  Then the work is routed into the SDD lifecycle
```

### Inject channel

```gherkin
Scenario: project imprints a program and persists it
  Given the Council projects into a named inner-loop agent with a new program
  When the projection completes and the Council withdraws
  Then the agent's program reflects the new directives
  And the next autonomous run of that agent applies the new program

Scenario: inject opens a live channel to one named agent
  Given the Council injects into a named inner-loop agent through the gateway
  When the channel is open
  Then the Council exchanges messages with that agent directly
  And the channel closes when the Council withdraws

Scenario: a withdrawn projection still changes the next run but a withdrawn injection does not
  Given the Council has both projected a program into an agent and injected a live channel into it
  When the Council withdraws from both and the agent runs again autonomously
  Then the agent runs with the projected program applied
  And the agent runs with no live channel to the Council

Scenario: an inject attempted outside the gateway is refused
  Given the Council attempts to open a channel to an agent without going through the gateway
  When the attempt is made
  Then the attempt is refused
  And the only accepted entry to project and inject is the gateway

Scenario: an injected judge cannot write what it does not own
  Given a judge injected live during an approved spec
  When the Council pilots it to edit the frozen feature
  Then the frozen feature is unchanged

Scenario: an injected producer still obeys its program
  Given a producer injected live whose program forbids an action
  When the Council pilots it toward that action
  Then the producer does not perform the forbidden action
```
