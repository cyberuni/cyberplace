# place-node

Internal SDD skill — the concrete engine for the **corpus/place-node** spec node
(`.agents/specs/sdd/corpus/place-node/`). Given a new node's `concept` (and optional name), suggests a
**provisional** capability home (derived from where that concept already lives) and catches possible
duplicates, so explore places a node in one lookup.

```bash
node scripts/place-node.mts --spec-dir .agents/specs/sdd --concept resolution --name leash
```

Read-only and advisory; placement is finalized at handoff. See [`SKILL.md`](./SKILL.md) for the full
contract. Not user-invocable.
