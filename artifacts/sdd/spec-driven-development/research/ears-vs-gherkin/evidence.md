# Evidence — EARS vs Gherkin

## E01 — EARS developed at Rolls-Royce for systems RE

- **Date:** 2009
- **Status:** Confirmed
- **Confidence:** High
- **Source:** Alistair Mavin et al., IEEE RE 2009
- **URL:** https://ieeexplore.ieee.org/document/5328509/
- **Source type:** Peer-reviewed conference paper (original publication)
- **Notes:** Five patterns defined: Ubiquitous, State-driven (While), Event-driven (When),
  Optional (Where), Unwanted behavior (If/Then). Complex requirements combine patterns.

## E02 — EARS applied to embedded PLC systems (IEC 61131-3)

- **Date:** 2025
- **Status:** Confirmed
- **Confidence:** High
- **Source:** Springer Nature, SN Computer Science
- **URL:** https://link.springer.com/article/10.1007/s42979-025-03843-3
- **Source type:** Academic paper
- **Notes:** Validates EARS applicability beyond software-only requirements, including
  programmable logic controllers. Strengthens the non-software domain claim.

## E03 — Gherkin is directly executable via Cucumber/SpecFlow

- **Date:** Ongoing (framework mature since ~2008)
- **Status:** Confirmed
- **Confidence:** High
- **Source:** Cucumber official docs
- **URL:** https://cucumber.io/docs/gherkin/reference/
- **Source type:** Official documentation
- **Notes:** Scenarios written in Gherkin become runnable acceptance tests. Living documentation
  claim is structurally guaranteed — same file is both spec and test.

## E04 — Tools automate EARS→Gherkin conversion

- **Date:** 2024–2025
- **Status:** Confirmed
- **Confidence:** Medium (tooling maturity unclear for complex patterns)
- **Source:** RequireKit, LinkedIn article by Menzione
- **URL:** http://requirekit.ai/core-concepts/bdd-scenarios/ / https://www.linkedin.com/pulse/bridging-gap-translating-ears-requirements-gherkin-ai-menzione-hwxef
- **Source type:** Product documentation, practitioner article
- **Notes:** Confirms EARS→Gherkin is a recognized workflow. Quality of translation for
  multi-keyword complex EARS patterns is not benchmarked — open question.

## E05 — Gherkin stakeholder adoption gap

- **Date:** 2022–2025
- **Status:** Confirmed (widely reported)
- **Confidence:** High
- **Source:** Multiple practitioner sources (TestQuality, 3e.pl)
- **URL:** https://testquality.com/best-practices-for-writing-maintainable-gherkin-test-cases/
- **Source type:** Practitioner guides
- **Notes:** BDD promise of business-written tests rarely holds. Gherkin frequently becomes a
  QA-only artifact, undermining its communication advantage. Weakens Gherkin-only workflows.

## E06 — EARS vagueness persists despite structural constraints

- **Date:** 2013–2024
- **Status:** Confirmed
- **Confidence:** High
- **Source:** IARIA tutorial (Terzakis 2013), Jama FAQ
- **URL:** https://www.iaria.org/conferences2013/filesICCGI13/ICCGI_2013_Tutorial_Terzakis.pdf / https://www.jamasoftware.com/requirements-management-guide/writing-requirements/frequently-asked-questions-about-the-ears-notation-and-jama-connect-requirements-advisor/
- **Source type:** Academic tutorial, commercial documentation
- **Notes:** EARS constrains syntax/structure, not semantics. Lexical ambiguity remains dependent
  on author precision. Weakens strong claims about ambiguity elimination.

## E07 — ANMS combines EARS + Gherkin + Mermaid for AI-native spec

- **Date:** 2025
- **Status:** Preliminary
- **Confidence:** Low (single source, no independent validation)
- **Source:** DEV Community post
- **URL:** https://dev.to/goodrelax/a-spec-template-built-for-ai-3bkp
- **Source type:** Community blog post
- **Notes:** Interesting signal for AI-driven development workflows. Needs independent
  corroboration before strong claims about adoption or effectiveness.
