# spec-producer-governance

Non-user-invocable SDD skill holding the **default spec-producer procedure**: how to author the `spec.md` body and a boolean Gherkin `.feature` for a domain no plugin covers.

Loaded via the harness (`Skill`) by `sdd-operator` when it runs the spec-producer role from the SDD default — the Operator authors **inline** in its own warm context (recorded `produced-by.spec-producer: sdd:sdd-operator`) rather than spawning a producer agent. The grader stays separate: a cold `sdd-spec-judge` reviews the output.

References `sdd:spec-governance` (the universal format bar) plus the resolved director + builder + architect actor bars (the spec-gate lens set, forward face) as its self-alignment criteria, and `sdd:ownership-governance` for the write-ownership matrix. Includes the reconcile-toward-the-source-of-truth rule for contradictions surfaced during grilling.
