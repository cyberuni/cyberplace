# aces-builder-impl

Internal ACES governance (`user-invocable: false`). The **Builder** actor bar at the **impl gate**,
specialized for agent-configuration artifact-types — it **unions onto** `sdd:builder-impl-governance`
and adds how an agent-config subject (which has no deterministic test runner) reaches a per-scenario
boolean: one scenario→rubric eval per frozen scenario, an explicit N-run policy (trigger vs
behavior/quality), and a `score ≥ threshold` collapse, with the runner (`aces-judge`) kept separate
from the author.

One merged bar loaded by **both** faces — the ACES impl-producer (`define-agent` / `improve`, forward,
which authors the eval suite) and the cold impl-judge (`aces-implementer`, backward, which runs it);
`producer ≠ judge` holds at the agent level. Bound in `.agents/universal-plugin.json` as the ACES
squad's `builder-impl` governance; the contract-quality side is the spec gate's `aces-builder-spec`.
Not triggered by users directly.
