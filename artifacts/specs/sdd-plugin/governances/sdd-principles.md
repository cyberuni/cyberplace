# SDD Principles

Core rules for spec-driven development. Load this governance when writing, reviewing, or implementing a spec.

---

## The rules

1. **Spec alongside code.** Spec, code, and product are co-delivered — not sequential. A builder works from their angle of expertise (product, design, engineering, security, etc.) and submits spec + code together. A feature has multiple angles; no single builder completes the full spec upfront. Builders from other angles contribute before and after the MR to improve the spec, code, and product.

2. **The spec owns the behavior.** If the implementation disagrees with the spec, the implementation is wrong — unless the spec is revised through a review cycle.

3. **Why is not optional.** A spec without a "Why" section is incomplete. If you cannot articulate why the feature is needed, the feature may not be needed.

4. **Scenarios are observable.** Gherkin scenarios describe what a user or caller observes — exit codes, stdout, return values, side effects. They do not describe internal state, function calls, or implementation details.

5. **Happy path + error cases.** Every spec must cover at least one success scenario and the primary failure scenarios for each operation.

6. **Status must be accurate.** Marking a spec Implemented when scenarios are not passing is a violation. Marking it Approved before review is a violation.

7. **Specs survive refactors.** The spec does not change when the implementation is restructured. It changes only when behavior changes — and behavior changes require a new review cycle.

8. **One spec per domain.** A spec covers one coherent feature or command group. If a spec covers two unrelated concerns, split it.
