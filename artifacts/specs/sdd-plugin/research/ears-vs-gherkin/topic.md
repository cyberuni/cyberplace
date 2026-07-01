# EARS vs Gherkin (June 2026)

## Question

What are the differences between EARS (Easy Approach to Requirements Syntax) and Gherkin,
and when should each be used?

## Scope

In scope: EARS syntax, Gherkin/BDD syntax, purpose, audience, tooling, strengths, weaknesses,
complementary workflows, AI tooling trends.

Out of scope: specific Cucumber/SpecFlow framework internals, NFR specification strategies,
formal methods (Z, Alloy, TLA+).

## Source angles

- EARS official documentation and original IEEE paper
- Gherkin/Cucumber official documentation
- Practitioner comparisons and conversion tooling
- Systems engineering and embedded domain usage
- Maintenance and criticism literature
- AI-assisted spec tooling (2024–2026)

## Findings

### Layer separation

EARS and Gherkin operate at different layers. EARS is a structured natural language notation for
writing *system requirements* ("the system shall…"). Gherkin is an executable specification
language for writing *acceptance scenarios* ("given… when… then…"). They are largely
complementary rather than competing.

### EARS

Developed by Alistair Mavin at Rolls-Royce PLC in 2009. Five core patterns:

| Pattern | Keyword | Example |
|---|---|---|
| Ubiquitous | *(none)* | The system shall log all transactions. |
| State-driven | `While` | While the door is locked, the alarm shall be armed. |
| Event-driven | `When` | When the user submits the form, the system shall validate all fields. |
| Optional feature | `Where` | Where the device has GPS, the app shall display the user's location. |
| Unwanted behavior | `If / Then` | If an invalid PIN is entered three times, then the card shall be blocked. |

Complex requirements combine patterns: `While [state], when [event], [system] shall [response].`

Domain: software and non-software (aerospace, automotive, PLC, construction).

### Gherkin

Originated with the Cucumber framework (~2006, Dan North BDD movement). Structures scenarios as:

```gherkin
Feature: User login
  Scenario: Valid credentials
    Given the user is on the login page
    When the user enters valid credentials
    Then the user should see the dashboard
```

Additional keywords: `Background`, `Scenario Outline` / `Examples`, `And` / `But`.
Executable via Cucumber, SpecFlow, Behave, Behat across Java, JS, Python, Ruby, .NET.

### Complementary workflow

1. Write EARS requirements — defines *what* the system shall do.
2. Derive Gherkin scenarios from EARS — tooling (RequireKit, Spec Format Converter) automates this.
3. Automate Gherkin — scenarios become executable acceptance tests.
4. Maintain traceability — Gherkin `@tags` link scenarios back to EARS requirement IDs.

### AI tooling trends (2025–2026)

ANMS (DEV Community) is a spec template that combines EARS + Gherkin + Mermaid for AI-driven
development. Tools like RequireKit generate Given-When-Then from EARS automatically. Hand-crafting
Gherkin scenarios manually is declining as AI assistants capture and formalize scenarios in
real-time during team discussions.

## Contradictions

- Gherkin is often promoted as a "business-readable" collaboration tool, but practitioners widely
  report that non-technical stakeholders rarely write or maintain scenarios in practice.
- EARS claims to reduce ambiguity through structure, but critics note that lexical vagueness and
  subjective interpretation persist regardless of pattern compliance.

## Open questions

- How complete is EARS→Gherkin auto-translation for complex (multi-keyword) EARS patterns?
- How does ANMS compare to using EARS/Gherkin independently with LLMs?
- Neither format handles NFRs (performance, security, availability) well — what is the best complement?

## Sources consulted

- [Alistair Mavin EARS official guide](https://alistairmavin.com/ears/)
- [EARS IEEE original paper (2009)](https://ieeexplore.ieee.org/document/5328509/)
- [EARS on DEV Community](https://dev.to/sebastian_dingler/ears-the-easy-approach-to-requirements-syntax-39a5)
- [EARS at Jama Software](https://www.jamasoftware.com/requirements-management-guide/writing-requirements/adopting-the-ears-notation-to-improve-requirements-engineering/)
- [When not to use EARS (QRA Corp)](https://qracorp.com/when-not-to-use-ears/)
- [EARS for PLC / embedded systems (Springer 2025)](https://link.springer.com/article/10.1007/s42979-025-03843-3)
- [Translating EARS to Gherkin with AI (LinkedIn)](https://www.linkedin.com/pulse/bridging-gap-translating-ears-requirements-gherkin-ai-menzione-hwxef)
- [EARS+BDD segue (Conduct of Code)](https://conductofcode.io/post/easy-approach-to-requirements-syntax-and-the-segue-to-behavior-driven-development/)
- [ANMS spec template for AI (DEV Community)](https://dev.to/goodrelax/a-spec-template-built-for-ai-3bkp)
- [Cucumber Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
- [Gherkin maintenance best practices (TestQuality)](https://testquality.com/best-practices-for-writing-maintainable-gherkin-test-cases/)
- [RequireKit EARS→Gherkin](http://requirekit.ai/core-concepts/bdd-scenarios/)
