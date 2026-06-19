# Evidence — The Actor–Delegate Model

One section per claim the framework asserts. Status/confidence reflect how well established theory grounds the claim. Caveats and divergences are kept, not smoothed.

---

## agency-theory

- **claim:** The Actor (principal) delegates work to a Delegate (agent) who performs it on the actor's behalf.
- **status:** supported
- **confidence:** high
- **quote:** "in which one party (the principal) delegates work to another (the agent), who performs that work on behalf of the principal" (Eisenhardt 1989, as summarized).
- **source:** EBSCO Research Starters — Agency Theory (organizational economics); Eisenhardt 1989; Jensen & Meckling 1976
- **url:** https://www.ebsco.com/research-starters/economics/agency-theory-organizational-economics
- **type:** encyclopedia
- **note (load-bearing divergence):** In classic agency theory the agent has its *own self-interested goals* and information asymmetry produces the "agency problem" (moral hazard, adverse selection). The Actor–Delegate Model's delegate has **no intrinsic motive** — it is "capacity, not a party." This *eliminates the agency problem by design* and is the framework's core adaptation of the theory, NOT something the source literature states. Cite agency theory for the delegation structure; flag the motive divergence explicitly.

## accountability-delegation

- **claim:** Accountability stays with the Actor and never delegates; the Delegate is never accountable.
- **status:** partially supported (original framing)
- **confidence:** medium
- **source:** EBSCO Research Starters — Agency Theory
- **url:** https://www.ebsco.com/research-starters/economics/agency-theory-organizational-economics
- **type:** encyclopedia
- **note:** Classic theory does not model non-agentic delegates. "Accountability that never delegates / capacity not a party" is original to this framework, consistent with agency theory's principal-bears-residual-risk premise but not a direct claim of it.

## single-double-loop

- **claim:** The Curator's outer loop revises governing assumptions (double-loop); the inner execution loop corrects actions under fixed assumptions (single-loop).
- **status:** supported
- **confidence:** high
- **quote:** "When the error detected and corrected permits the organization to carry on its present policies or achieve its present objectives, then that error-and-correction process is single-loop learning." / "Double-loop learning occurs when error is detected and corrected in ways that involve the modification of an organization's underlying norms, policies and objectives." (Argyris & Schön 1978: 2–3)
- **source:** Argyris & Schön, *Organizational Learning* (1978), via infed.org
- **url:** https://infed.org/dir/welcome/chris-argyris-theories-of-action-double-loop-learning-and-organizational-learning/
- **type:** encyclopedia (quoting primary)
- **note:** Clean mapping.

## dev-inner-outer-loop

- **claim:** The developer inner loop is fast local iteration (code/build/debug, pre-push); the outer loop is post-push automation (CI/CD, review, deploy).
- **status:** supported
- **confidence:** high
- **quote:** "The developer lives and works in the inner loop; their responsibility is to create code, build, debug, and finally push the code… The platform engineer exists in the outer loop." (Red Hat) "The inner loop refers to the rapid, iterative cycle that individual developers engage in… The outer loop encompasses the broader cycle of integrating individual contributions into the larger system." (Speedscale)
- **source:** Red Hat Developer (2024); Speedscale Docs
- **url:** https://developers.redhat.com/articles/2024/09/05/platform-engineers-role-devsecops-inner-and-outer-loops ; https://docs.speedscale.com/concepts/inner-outer/
- **type:** maintainer / docs
- **note:** Distinct from the Argyris/Schön loops — this is the delivery-pipeline loop, used in the doc for the inner/outer split of *tasks*.

## team-topologies-platform

- **claim:** The Curator is the team's infrastructure actor whose product is a layer consumed as self-service by every other actor — like a platform team.
- **status:** supported
- **confidence:** high
- **quote:** "a foundation of self-service APIs, tools, services, knowledge and support which are arranged as a compelling internal product… made available via self-service capabilities… easy for the stream-aligned teams to consume."
- **source:** Skelton & Pais, *Team Topologies* (IT Revolution summary)
- **url:** https://itrevolution.com/articles/four-team-types/
- **type:** maintainer
- **note:** Grounds "a role whose product is a layer" — nobody says platform engineering "isn't a role, it's a layer."

## conways-law

- **claim:** The Architect's object is the relations/structure between parts; a system's structure mirrors the communication structure that built it.
- **status:** supported
- **confidence:** high
- **quote:** "[O]rganizations which design systems… are constrained to produce designs which are copies of the communication structures of these organizations." (Conway 1968). MIT/Harvard mirroring study: "the product developed by the loosely-coupled organization is significantly more modular than the product from the tightly-coupled organization."
- **source:** Melvin E. Conway, "How Do Committees Invent?" (1968); MIT/Harvard mirroring-hypothesis study
- **url:** https://en.wikipedia.org/wiki/Conway%27s_law
- **type:** encyclopedia (quoting primary)
- **note:** Used as empirical backdrop for "relations between parts is a distinct, system-shaping object."

## screaming-architecture

- **claim:** The Architect's motive is constructive — structure should shout the domain — not merely defensive constraint.
- **status:** supported
- **confidence:** high
- **quote:** "do they scream: Health Care System, or Accounting System… Or do they scream: Rails, or Spring/Hibernate…? A good software architecture allows decisions about frameworks, databases, web-servers… to be deferred and delayed."
- **source:** Robert C. Martin, "Screaming Architecture" (2011); restated in *Clean Architecture* (2017) ch. 21
- **url:** https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html
- **type:** primary
- **note:** Direct URL corrected from the originally-cited Clean Architecture blog post.

## mece

- **claim:** The actor decomposition should be MECE — mutually exclusive (no overlap), collectively exhaustive (no gaps).
- **status:** supported
- **confidence:** high
- **quote:** "mutually exclusive and collectively exhaustive… developed in the late 1960s by Barbara Minto at McKinsey & Company and underlies her Minto Pyramid Principle."
- **source:** Wikipedia, MECE principle; McKinsey alumni interview with Barbara Minto
- **url:** https://en.wikipedia.org/wiki/MECE_principle
- **type:** encyclopedia
- **note:** Used as the test the four-actor set is held to.

## separation-of-duties

- **claim:** producer ≠ judge — the instance that produced a change is not its independent approver.
- **status:** supported
- **confidence:** high
- **quote:** "The developer can't approve their own change (SoD), and the team lead has to review the flag before approving (four eyes)."
- **source:** Flagsmith, "What is the Four-Eyes Principle"; ISO 27001 Annex A 5.3 (Segregation of Duties)
- **url:** https://www.flagsmith.com/blog/what-is-the-four-eyes-principle
- **type:** docs / standard
- **note:** Framework adds the "per artifact across time" refinement (you may switch forward→backward on the same artifact, but it spends your arm's-length standing).

## walking-skeleton

- **claim:** A walking skeleton is a thin end-to-end slice stood up early to get whole-system feedback before the parts are real.
- **status:** supported
- **confidence:** high
- **quote:** "A Walking Skeleton is an implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end."
- **source:** Freeman & Pryce, *Growing Object-Oriented Software, Guided by Tests* (ch. 10)
- **url:** https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html
- **type:** primary
- **note:** Chapter body paywalled; quote confirmed via multiple secondary citations.

## test-stub-rework

- **claim:** A stub lets you build before a dependency exists, at the cost of rework when the real dependency lands; building in dependency order avoids rework but blocks progress.
- **status:** partially supported — framework inference
- **confidence:** medium
- **quote:** "Stubs provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test." (Fowler)
- **source:** Martin Fowler, *TestDouble*; Wikipedia, Test stub
- **url:** https://martinfowler.com/bliki/TestDouble.html
- **type:** maintainer
- **note (honest):** Sources confirm stubs supply canned data for absent dependencies. The *rework-cost / dependency-ordering trade-off* is the framework's own logical extension — NOT stated verbatim in any source. Present it as reasoning, not citation.

## ai-augmentation-roles

- **claim:** Generative AI shifts developer work from production toward augmentation and spawns new roles (abundance premise; positions ≠ roles).
- **status:** supported
- **confidence:** high
- **quote:** "Generative AI will spawn new roles in software engineering and operations, requiring 80% of the engineering workforce to upskill" through 2027.
- **source:** Gartner press release (2024-10-03)
- **url:** https://www.gartner.com/en/newsroom/press-releases/2024-10-03-gartner-says-generative-ai-will-require-80-percent-of-engineering-workforce-to-upskill-through-2027
- **type:** analyst (primary)
- **note:** gartner.com may 403 from some fetchers; quote reconstructed from faithful secondary (CDO Magazine). Supports "abundance does not replace the human; it changes what the work is."

## multi-agent-orchestration

- **claim:** The Conductor variant's signature move (fan dependency work out to parallel delegates) maps to the orchestrator-worker pattern.
- **status:** supported
- **confidence:** high
- **quote:** "In the orchestrator-workers workflow, a central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results." Plus: "the lead agent spins up 3–5 subagents in parallel rather than serially."
- **source:** Anthropic, *Building Effective Agents*; Anthropic, *How we built our multi-agent research system*
- **url:** https://www.anthropic.com/research/building-effective-agents ; https://www.anthropic.com/engineering/multi-agent-research-system
- **type:** primary
- **note:** Anthropic notes multi-agent excels at parallelizable strands, less so for "tightly interdependent tasks such as coding" — a caveat worth keeping near the Conductor claim.
