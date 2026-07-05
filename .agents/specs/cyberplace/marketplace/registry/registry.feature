@frozen
Feature: registry — acquire skills and configure their sources
  cyberplace add/remove/update/list/find install and track skills from a GitHub/GitLab repo, a git
  URL, or an npm package in a scope-aware lock file, cyberplace config provider manages the sources
  a spec resolves against, and cyberplace migrate carries forward a legacy skills-lock.json. Output
  follows the AXI contract: TOON by default with pre-computed aggregates, truncation with --full for
  large results, definitive empty states, content-first bare invocation, next-step suggestions, and
  fail-loud unknown flags — non-interactive by default is the one principle the shipped CLI does not
  yet meet (flagged below, impl-deferred).

  Background:
    Given the project root is a temporary directory

  # ── add: repo, skill-scoped, npm, git-url ──

  Scenario: add installs every skill from an org/repo spec
    Given the repo "acme/skills" has skills "alpha" and "beta"
    When I run "cyberplace add acme/skills --yes --root <root>"
    Then the exit code is 0
    And the project lock file has entries for "alpha" and "beta"
    And stdout reports 2 skills installed

  Scenario: add installs a single skill from an org/repo:skill spec
    Given the repo "acme/skills" has skills "alpha" and "beta"
    When I run "cyberplace add acme/skills:alpha --root <root>"
    Then the exit code is 0
    And the project lock file has an entry for "alpha" only
    And stdout reports 1 skill installed

  Scenario: add installs from an npm package
    Given the npm package "@acme/skillpack" has a skills/ directory with skill "gamma"
    When I run "cyberplace add @acme/skillpack --root <root>"
    Then the exit code is 0
    And the project lock file has an entry for "gamma" with source type "npm"

  Scenario: add installs from a git URL
    When I run "cyberplace add https://gitlab.example.com/acme/skills --root <root>"
    Then the exit code is 0
    And the project lock file records the source as "https://gitlab.example.com/acme/skills"

  Scenario: add --branch selects the fetched ref
    Given the repo "acme/skills" has a branch "next" with skill "delta"
    When I run "cyberplace add acme/skills:delta --branch next --root <root>"
    Then the exit code is 0
    And the project lock file has an entry for "delta"

  Scenario: add --global installs to the global scope
    Given the repo "acme/skills" has skill "alpha"
    When I run "cyberplace add acme/skills:alpha --global --root <root>"
    Then the exit code is 0
    And the global lock file has an entry for "alpha"
    And the project lock file has no entry for "alpha"

  Scenario: add skips a symlink collision with a real directory
    Given a real directory already exists at "<root>/skills/alpha"
    And the repo "acme/skills" has skill "alpha"
    When I run "cyberplace add acme/skills:alpha --root <root>"
    Then the exit code is 0
    And stdout warns that "alpha" was skipped because "<root>/skills/alpha" is a real directory
    And the project lock file still has an entry for "alpha"

  Scenario: add skips a package-managed skill with an install hint
    Given the repo "acme/skills" has a package-managed skill "managed-one" naming npm package "@acme/managed-one"
    When I run "cyberplace add acme/skills:managed-one --root <root>"
    Then stdout warns to install "managed-one" via "cyberplace add @acme/managed-one" instead
    And the project lock file has no entry for "managed-one"
    And the exit code is 1

  # ── remove: happy path + not-installed no-op ──

  Scenario: remove deletes an installed skill's files and lock entry
    Given the skill "alpha" is installed in the project scope
    When I run "cyberplace remove alpha --root <root>"
    Then the exit code is 0
    And the installed skill directory for "alpha" no longer exists
    And the project lock file has no entry for "alpha"

  Scenario: removing a skill that is not installed is a definitive no-op
    When I run "cyberplace remove ghost --root <root>"
    Then the exit code is 0
    And stdout reports that skill "ghost" was not found in the lock file

  # ── update: single skill + --all ──

  Scenario: update re-fetches a single locked skill
    Given the skill "alpha" is installed in the project scope from repo "acme/skills"
    And the repo "acme/skills" now serves a newer "alpha"
    When I run "cyberplace update alpha --root <root>"
    Then the exit code is 0
    And stdout reports that "alpha" was updated

  Scenario: update --all re-fetches every locked skill
    Given skills "alpha" and "beta" are installed in the project scope from repo "acme/skills"
    When I run "cyberplace update --all --root <root>"
    Then the exit code is 0
    And stdout reports an update result for "alpha" and for "beta"

  # AXI #5 definitive empty/no-op state — the target contract (today's code exits 1; impl deferred).
  Scenario: update a skill that is not installed is a definitive no-op
    When I run "cyberplace update ghost --root <root>"
    Then the exit code is 0
    And stdout reports that skill "ghost" was not found in the lock file

  # ── list: scope-aware ──

  Scenario: list --global reads the global lock and excludes project-only skills
    Given the skill "alpha" is installed in the project scope
    And the skill "beta" is installed in the global scope
    When I run "cyberplace list --global --root <root>"
    Then the exit code is 0
    And stdout contains a row for "beta"
    And stdout does not contain a row for "alpha"

  # ── find: marketplace search + scoped repo search ──

  Scenario: find returns marketplace matches with install commands
    Given the default marketplace has a skill "widget-maker" with an install command
    When I run "cyberplace find widget --root <root>"
    Then the exit code is 0
    And stdout contains a row for "widget-maker" carrying an install command

  Scenario: find --in scopes the search to one repo
    Given the repo "acme/skills" has skills "alpha" and "beta"
    When I run "cyberplace find alpha --in acme/skills --root <root>"
    Then the exit code is 0
    And stdout contains a row for "alpha" only

  Scenario: find with no query and no results is a definitive empty state
    Given no marketplace has any matching skill
    When I run "cyberplace find --root <root>"
    Then the exit code is 0
    And stdout contains "No skills found"

  # ── config provider: add, list, remove; project vs global ──

  Scenario: config provider add records a provider with type and match
    When I run "cyberplace config provider add https://gitlab.mycompany.com --type gitlab --match mycompany/* --root <root>"
    Then the exit code is 0
    And the project config file has a provider "https://gitlab.mycompany.com" with type "gitlab" and match "mycompany/*"

  Scenario: config provider add to the global scope writes the global config file
    When I run "cyberplace config provider add https://skills.example.com --type marketplace --global --root <root>"
    Then the exit code is 0
    And the global config file has a provider "https://skills.example.com" with type "marketplace"
    And the project config file has no provider "https://skills.example.com"

  Scenario: config provider list enumerates configured providers
    Given the project config has a provider "https://gitlab.mycompany.com" of type "gitlab"
    When I run "cyberplace config provider list --root <root>"
    Then the exit code is 0
    And stdout contains a row for "https://gitlab.mycompany.com" with type "gitlab"

  Scenario: config provider remove deletes a configured provider
    Given the project config has a provider "https://gitlab.mycompany.com" of type "gitlab"
    When I run "cyberplace config provider remove https://gitlab.mycompany.com --root <root>"
    Then the exit code is 0
    And the project config file has no provider "https://gitlab.mycompany.com"

  Scenario: config provider remove for a never-configured provider is a definitive no-op
    Given the project config has no providers
    When I run "cyberplace config provider remove https://gitlab.ghost.com --root <root>"
    Then the exit code is 0
    And stdout reports that no provider "https://gitlab.ghost.com" was configured

  Scenario: config provider add with an invalid type fails loud
    When I run "cyberplace config provider add https://gitlab.mycompany.com --type bogus --root <root>"
    Then the exit code is 1
    And stderr contains "bogus"
    And the project config file has no provider "https://gitlab.mycompany.com"

  # ── migrate: legacy lock conversion ──

  Scenario: migrate converts a legacy skills-lock.json into the cyberplace lock
    Given a legacy "<root>/skills-lock.json" exists with entries "alpha" and "beta"
    When I run "cyberplace migrate --root <root>"
    Then the exit code is 0
    And the project lock file has entries for "alpha" and "beta"
    And stdout reports 2 entries migrated

  Scenario: migrate --dry-run writes nothing
    Given a legacy "<root>/skills-lock.json" exists with entry "alpha"
    When I run "cyberplace migrate --dry-run --root <root>"
    Then the exit code is 0
    And the project lock file has no entry for "alpha"
    And stdout reports the migration as a dry run

  # AXI #5 definitive empty/no-op state — the target contract (today's code exits 1; impl deferred).
  Scenario: migrate with no legacy lock file is a definitive nothing-to-migrate
    Given no "<root>/skills-lock.json" exists
    When I run "cyberplace migrate --root <root>"
    Then the exit code is 0
    And stdout reports that the source file was not found

  # ── AXI: TOON default + --format json (#1) ──

  Scenario: list prints TOON rows by default
    Given the skill "alpha" is installed in the project scope
    When I run "cyberplace list --root <root>"
    Then stdout is TOON with rows carrying "name", "scope", and "source"
    And the exit code is 0

  Scenario: list --format json returns structured entries
    Given the skill "alpha" is installed in the project scope
    When I run "cyberplace list --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array where each entry has "name" and "source"

  Scenario: find prints TOON rows by default
    Given the default marketplace has a skill "widget-maker" with an install command
    When I run "cyberplace find widget --root <root>"
    Then stdout is TOON with rows carrying "repo", "summary", and "install"
    And the exit code is 0

  Scenario: config provider list prints TOON rows by default
    Given the project config has a provider "https://gitlab.mycompany.com" of type "gitlab"
    When I run "cyberplace config provider list --root <root>"
    Then stdout is TOON with rows carrying "name", "type", and "match"
    And the exit code is 0

  # ── AXI: truncation + --full (#3) ──

  Scenario: a long find result truncates with a size hint unless --full
    Given the default marketplace has 200 matching skills
    When I run "cyberplace find widget --root <root>"
    Then the exit code is 0
    And stdout is truncated with a size hint matching "… +\d+ lines — rerun with --full"

  Scenario: find --full prints the whole result set untruncated
    Given the default marketplace has 200 matching skills
    When I run "cyberplace find widget --full --root <root>"
    Then the exit code is 0
    And stdout contains all 200 matching rows

  Scenario: find --format json is never truncated
    Given the default marketplace has 200 matching skills
    When I run "cyberplace find widget --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array containing all 200 matching entries

  # ── AXI: aggregates in the payload (#4) ──

  Scenario: add carries an installed/skipped aggregate
    Given the repo "acme/skills" has skills "alpha" and "beta"
    And the repo also has a package-managed skill "managed-one"
    When I run "cyberplace add acme/skills --yes --root <root>"
    Then stdout contains the aggregate summary "installed 2 skills, skipped 1"

  Scenario: list carries a skills-across-scopes aggregate
    Given skills "alpha" and "beta" are installed in the project scope
    When I run "cyberplace list --root <root>"
    Then stdout contains the aggregate summary "2 skills across 1 scope"

  Scenario: find carries a results-across-marketplaces aggregate
    Given the default marketplace has a skill "widget-maker"
    When I run "cyberplace find widget --root <root>"
    Then stdout contains the aggregate summary "1 result across 1 marketplace"

  Scenario: config provider list carries a providers-across-scopes aggregate
    Given the project config has a provider "https://gitlab.mycompany.com" of type "gitlab"
    When I run "cyberplace config provider list --root <root>"
    Then stdout contains the aggregate summary "1 provider across 1 scope"

  Scenario: migrate carries a migrated-entries aggregate
    Given a legacy "<root>/skills-lock.json" exists with entries "alpha" and "beta"
    When I run "cyberplace migrate --root <root>"
    Then stdout contains the aggregate summary "migrated 2 entries"

  # ── AXI: definitive empty states (#5) ──

  Scenario: list is a definitive empty state when no skill is installed
    When I run "cyberplace list --root <root>"
    Then the exit code is 0
    And stdout contains "0 skills installed"

  Scenario: find is a definitive empty state when no marketplace matches
    Given no marketplace has any matching skill
    When I run "cyberplace find nonexistent-widget --root <root>"
    Then the exit code is 0
    And stdout contains "0 results found"

  Scenario: config provider list is a definitive empty state when none are configured
    When I run "cyberplace config provider list --root <root>"
    Then the exit code is 0
    And stdout contains "no providers configured"

  # ── AXI: non-interactive, fail-loud (#6) — impl-deferred ──
  # The shipped prompt.ts flows still prompt interactively for a bare-repo add and
  # for remove/update with no explicit scope or name; these scenarios name the
  # contract the follow-up impl mission must reach, not today's behavior.

  Scenario: add never prompts interactively and installs a deterministic default
    Given the repo "acme/skills" has skills "alpha" and "beta"
    When I run "cyberplace add acme/skills --root <root>"
    Then no interactive prompts are shown
    And the exit code is 0
    And the project lock file has entries for "alpha" and "beta"

  Scenario: remove with no name never prompts interactively
    Given the skill "alpha" is installed in the project scope
    When I run "cyberplace remove --root <root>"
    Then no interactive prompts are shown
    And the exit code is 1

  Scenario: update with no name and no scope flag never prompts interactively
    Given skills "alpha" and "beta" are installed in the project scope
    When I run "cyberplace update --root <root>"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: re-running add with the same spec is idempotent
    Given the skill "alpha" is already installed in the project scope from repo "acme/skills"
    When I run "cyberplace add acme/skills:alpha --root <root>"
    Then the exit code is 0
    And the project lock file still has exactly one entry for "alpha"

  Scenario: an unknown flag on add fails loud
    When I run "cyberplace add acme/skills --frobnicate --root <root>"
    Then the exit code is 1
    And stderr contains "--frobnicate"

  # ── AXI: content-first bare invocation (#8) ──

  Scenario: bare config with no subcommand runs config provider list
    Given the project config has a provider "https://gitlab.mycompany.com" of type "gitlab"
    When I run "cyberplace config --root <root>"
    Then the exit code is 0
    And stdout is the same TOON result as "cyberplace config provider list --root <root>"

  # ── AXI: next-step suggestions (#9) ──

  Scenario: add ends with a next-step suggestion
    Given the repo "acme/skills" has skill "alpha"
    When I run "cyberplace add acme/skills:alpha --root <root>"
    Then stderr ends with "→ cyberplace list"

  Scenario: find ends with a next-step suggestion
    Given the default marketplace has a skill "widget-maker"
    When I run "cyberplace find widget --root <root>"
    Then stderr ends with "→ cyberplace add <spec>"

  # ── AXI: help (#10) ──

  Scenario: add --help prints a concise reference
    When I run "cyberplace add --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example

  Scenario: find --help prints a concise reference
    When I run "cyberplace find --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example

  Scenario: config --help prints a concise reference
    When I run "cyberplace config --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
