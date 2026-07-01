# Plan: Spec Digest

## Approach

Add a small, documentation-only internal skill, `spec-digest`, that an SDD gate skill calls to summarize a spec for human review. The skill body tells the agent which artifacts to read, which fixed sections to emit, and that it must neither mutate files nor render a verdict. No scripts, no CLI, no project-file writes.

Wire it into `validate-spec` step 4 so the digest appears above the gate report, before the human verdict is taken.

## Skill behavior

The skill body is organized around three rules:

1. **Read** — open `spec.md` and the sibling `.feature` in the target spec folder; read nothing else.
2. **Emit fixed sections** — What, Status, Scenarios (count + names), Key decisions (design-decision headings), Open items (markers). A missing `.feature` is zero scenarios, not an error.
3. **Stay inert** — write no file, advance no status, render no verdict; return the digest to the caller.

## Integration

`validate-spec/SKILL.md` step 4 ("Confirm the voices, then take the verdict") calls `spec-digest` on the resolved spec and includes the digest in the gate report before requesting the human verdict. Additive only — no change to the legal-state machine, transitions, or `aligned` scoping.

## Failure handling

| Condition | Behavior |
|---|---|
| `.feature` missing | Report zero scenarios; do not error |
| Open markers present | List them under Open items; do not block (the gate decides) |
| `spec.md` missing | Out of scope — `validate-spec` resolves the target before calling |

## Test strategy

- Mechanical skill audit for `plugins/sdd/skills/spec-digest`.
- `pnpm verify` after implementation.

## Out of scope

- Domain-specific digest enrichment (ACES/Quill flavor) — no digest role exists in the plugin contract.
- Any change to gate legality, status transitions, or `aligned` semantics.
- Invocation from the `sdd` gateway — the gateway routes to the gate, it does not summarize.
