---
name: create-persona-skill
description: Use this skill when the user asks to create a persona or role skill. Scaffolds opt-in SKILL.md with metadata.persona.
---

# Create Persona Skill

Apply when the user wants a role-loading skill — orchestrator, designer, product manager, security auditor, or any expert stance they invoke explicitly or when work clearly matches the role.

## Activation model

Persona skills default to **opt-in** — no hook unless the author chooses one.

1. **`metadata.activation: per-situation`** (default) — no hook event; load via `description` when the user or task matches the trigger.
2. **`metadata.activation: session-start`** (rare) — normalized SessionStart / `sessionStart` hook event; inject persona at chat open via `hook register`. Discipline-like; not the default for personas.

Other hook events: see **skill-design** governance (Activation table).

Full rules: `npx cyber-skills@<version> governance show skill-design`

## Workflow

### 1. Confirm placement

| Placement | Location |
|-----------|----------|
| User | `~/.agents/skills/<name>/` |
| Project private | `.agents/skills/<name>/` |
| Project public | `skills/<name>/` |

Ask if not stated.

### 2. Interview

Ask all in one pass. Skip any already answered.

1. **Role name** — what is the expert called? (becomes the skill `name`)
2. **Domain** — area of expertise and responsibility in one sentence
3. **Decisions** — what does this role decide? State as heuristics ("prefer X when Y", "escalate if Z")
4. **Delegation** — does it spawn subagents, direct the user, or both? What does it hand off vs keep?
5. **Output style** — voice, format, and detail level (e.g., brief directives, structured specs, annotated critique)
6. **Capabilities** — tools, systems, or connectors needed (if any)
7. **Boundaries** — what does this role defer, refuse, or escalate?
8. **Trigger** — how does the user invoke it? (e.g., "act as orchestrator", "start designer mode")
9. **Activation** — `per-situation` (default) or a hook event such as `session-start` (explain hook implication if chosen)

### 3. Create directory and write SKILL.md

```bash
mkdir -p <placement-path>/<name>
```

Write `<placement-path>/<name>/SKILL.md` from this template — fill every section from interview answers, leave no placeholder text. Default `activation: per-situation`; use another value from the governance table only when interview answer 9 requires a hook event.

```markdown
---
name: <name>
description: Use this skill when the user <trigger phrase>. Loads <role> context for the session.
metadata:
  persona: "true"
  activation: per-situation
---

# <Role Title>

You are a <role> — <one-sentence stance>.

## Domain

<Area of expertise and responsibility.>

## Decisions

<Heuristics: what this role decides and how. Prefer "when X, do Y" form.>

## Delegation

<What this role hands off and what it keeps. How handoffs are structured.>

## Output

<Voice, format, detail level.>

## Boundaries

<What this role defers, refuses, or escalates. When to exit the persona.>
```

If `activation` is a hook event (not `per-situation`), register the hook after audit — map the value to `hook register --event` per **skill-design** governance.

### 4. Audit

```bash
npx cyber-skills@<version> audit validate --path <placement-path>/<name>
```

Then invoke the **audit-skill** agent skill. Fix all CRITICAL findings before proceeding.

### 5. Link to agents

Use `npx skills add <path>` if available. Otherwise symlink:

```bash
ln -sf ~/.agents/skills/<name> ~/.claude/skills/<name>
```

Adjust target path per agent (`~/.cursor/skills/`, `~/.opencode/skills/`, etc.).

## Anti-patterns

- Defaulting personas to `session-start` without explicit author intent — prefer `per-situation` + `description` trigger
- Missing `metadata.persona: "true"` on role-loading body text — audit-skill E2 review treats undeclared persona phrases as injection
- Multi-step workflow inside a persona skill — delegate to a separate process or tool-based skill
- Decision heuristics written as prose paragraphs — use "when X, do Y" form

## References

```bash
npx cyber-skills@<version> governance show skill-design
```
