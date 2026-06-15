---
title: Overview
description: What spec-driven development is and how the co-delivery model works.
---

Spec-driven development (SDD) is a practice where behavioral specs and implementation are **co-delivered** — written, reviewed, and shipped together, not in sequence.

## The co-delivery model

A spec is not a requirements document written before coding begins. It is a living artifact that describes observable behavior. It evolves alongside the code.

A builder works from their angle of expertise — product, design, engineering, security — and submits spec + code together in the same merge request. Other builders contribute their angle before and after the MR. No single person writes the full spec upfront.

This means:

- The spec and the implementation are always in sync
- Reviewers can verify behavior by reading the spec, not by reverse-engineering the code
- Refactoring the implementation does not change the spec — only behavior changes do

## What a spec contains

A spec covers one domain (one feature or command group). It answers:

- **What** — the observable behavior
- **Why** — the problem being solved
- **Command surface** — the CLI syntax or API signature
- **Scenarios** — Gherkin scenarios describing success and failure cases

## What a spec is not

- A design document for implementation internals
- A complete upfront specification
- A substitute for code review
