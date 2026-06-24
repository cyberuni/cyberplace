---
title: Use Case
description: A use case is an entry-point into a system's behavior — who triggers it, with what inputs, toward what outcome. Use cases live in the spec.
---

A **use case** is an *entry-point*. It answers one question: **who or what triggers this, with what inputs, toward what outcome?**

It is the map of doorways into a behavior. Each distinct way the system gets invoked is one use case — coarse-grained by design. A use case is not a test; it is the *situation* a test later verifies.

## What a use case names

| Part | Question it answers |
|---|---|
| **Trigger** | What event or situation sets the behavior off? |
| **Inputs** | What does the behavior receive when triggered? |
| **Outcome** | What does it produce? |

## Where use cases live

Use cases live in **`spec.md`**, as prose or a trigger/inputs/outcome table. Every spec carries a dedicated **Use Cases** section — it is part of the design a human reviews at the gate, the high-altitude account of *when and with what* the system is invoked.

A use case with no [scenarios](/concepts/scenario/) is unverified intent — a doorway with no proof anything happens once you walk through it. The relationship is **one-to-many**: one use case is verified by one or more scenarios (the happy path, the negative mirror, the boundary).

## Use case vs scenario

A use case is *coarse* and lives in `spec.md`; a [scenario](/concepts/scenario/) is *fine* and lives in the `.feature`. The use case is the entry-point; the scenario is the boolean proof.
