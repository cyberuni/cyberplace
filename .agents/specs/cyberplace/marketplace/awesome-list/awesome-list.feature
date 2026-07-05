@frozen
Feature: awesome — curated skill/plugin discovery
  cyberplace awesome finds, inspects, and renders a curated catalog of skills and plugins, and
  manages the layered source config that feeds it. Output follows the AXI contract: TOON by
  default with pre-computed aggregates, truncation with --full for large results, definitive
  empty states, content-first bare invocation, next-step suggestions, and fail-loud unknown
  flags.

  Background:
    Given the project root is a temporary directory

  # ── find: scoring and ranking ──

  Scenario: an exact repo-name match ranks above a summary-only match
    Given a catalog entry "acme/nav" whose name matches the query "nav" exactly
    And a catalog entry "other/repo" whose summary merely mentions "nav"
    When I run "cyberplace awesome find nav --root <root>"
    Then the exit code is 0
    And "acme/nav" is listed before "other/repo"

  Scenario: --limit caps the number of results
    Given a catalog with 5 entries matching the query "skill"
    When I run "cyberplace awesome find skill --limit 2 --root <root>"
    Then the exit code is 0
    And exactly 2 results are printed

  Scenario: a repo entry derives its install command
    Given a catalog repo entry "acme/nav" with no skill name
    When I run "cyberplace awesome find nav --root <root>"
    Then the exit code is 0
    And stdout contains the install command "npx skills add acme/nav"

  Scenario: a skill entry derives its install command with --skill
    Given a catalog skill entry "acme/nav" skill "helm"
    When I run "cyberplace awesome find helm --root <root>"
    Then the exit code is 0
    And stdout contains the install command "npx skills add acme/nav --skill helm"

  Scenario: find with no query returns the full catalog ranked by trust and corroboration
    Given a catalog with 2 "authored" entries and 1 "recommended" entry
    When I run "cyberplace awesome find --root <root>"
    Then the exit code is 0
    And the "authored" entries are listed before the "recommended" entry

  Scenario: find --format json returns a structured array
    Given a catalog with 1 matching entry for the query "nav"
    When I run "cyberplace awesome find nav --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array where each entry has "repo", "summary", and "installCommand"

  # ── inspect: repo skill listing ──

  Scenario: inspect lists a repo's public skills from SKILL.md frontmatter
    Given a repo "acme/nav" whose "skills/" directory has 2 SKILL.md files with name and description
    When I run "cyberplace awesome inspect acme/nav --root <root>"
    Then the exit code is 0
    And stdout lists 2 skills each with its directory and description

  Scenario: inspect --query filters skills by substring
    Given a repo "acme/nav" whose "skills/" directory has skills "helm" and "compass"
    When I run "cyberplace awesome inspect acme/nav --query helm --root <root>"
    Then the exit code is 0
    And stdout lists only the "helm" skill

  Scenario: inspect reports zero skills for a repo with no matches
    Given a repo "acme/nav" whose "skills/" directory has skills "helm" and "compass"
    When I run "cyberplace awesome inspect acme/nav --query zzznomatch --root <root>"
    Then the exit code is 0
    And stdout contains "acme/nav has 2 public skill(s)."
    And no skill rows are printed

  Scenario: inspect --format json returns a structured array
    Given a repo "acme/nav" whose "skills/" directory has 1 SKILL.md file
    When I run "cyberplace awesome inspect acme/nav --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array where each entry has "directory", "name", and "description"

  Scenario: inspect fails loud when the repo has no skills directory
    Given a repo "acme/ghost" with no "skills/" directory
    When I run "cyberplace awesome inspect acme/ghost --root <root>"
    Then the exit code is 1
    And stderr contains "Failed to inspect skills/ in acme/ghost"

  # ── render: marker-block write ──

  Scenario: render writes the catalog between the AWESOME-SKILLS markers when content changed
    Given "<root>/readme.md" contains empty "AWESOME-SKILLS" markers
    And "<root>/awesome-skills.json" has 1 authored repo entry
    When I run "cyberplace awesome render --root <root>"
    Then the exit code is 0
    And "<root>/readme.md" contains the rendered entry between the "AWESOME-SKILLS" markers
    And stdout reports "changed" as "true"

  Scenario: render is idempotent when content has not changed
    Given "<root>/readme.md" already contains the current rendered catalog between the "AWESOME-SKILLS" markers
    When I run "cyberplace awesome render --root <root>"
    Then the exit code is 0
    And stdout reports "changed" as "false"
    And "<root>/readme.md" is unchanged on disk

  Scenario: render fails when the marker block is missing
    Given "<root>/readme.md" has no "AWESOME-SKILLS" markers
    When I run "cyberplace awesome render --root <root>"
    Then the exit code is 1
    And stderr contains "Missing AWESOME-SKILLS markers"

  # ── sources: layering and mutation ──

  Scenario: a local-private source overrides a repo-shared source of the same repo and path
    Given a repo-shared source "acme/nav" at "awesome-skills.json"
    And a local-private source "acme/nav" at "awesome-skills.json"
    When I run "cyberplace awesome sources list --root <root>"
    Then the exit code is 0
    And the listed source class for "acme/nav" is "local-private"

  Scenario: a repo-shared source overrides a global-user source of the same repo and path
    Given a global-user source "acme/nav" at "awesome-skills.json"
    And a repo-shared source "acme/nav" at "awesome-skills.json"
    When I run "cyberplace awesome sources list --root <root>"
    Then the exit code is 0
    And the listed source class for "acme/nav" is "repo-shared"

  Scenario: sources disable then enable a source round-trips it back to listed
    Given a repo-shared source "acme/nav" at "awesome-skills.json"
    When I run "cyberplace awesome sources disable acme/nav --layer repo --root <root>"
    Then the exit code is 0
    And "acme/nav" is absent from "cyberplace awesome sources list --root <root>"
    When I run "cyberplace awesome sources enable acme/nav --layer repo --root <root>"
    Then the exit code is 0
    And "acme/nav" is present in "cyberplace awesome sources list --root <root>"

  Scenario: sources add is idempotent
    When I run "cyberplace awesome sources add acme/nav --layer local --root <root>"
    And I run "cyberplace awesome sources add acme/nav --layer local --root <root>" again
    Then both exit codes are 0
    And "cyberplace awesome sources list --root <root>" lists "acme/nav" exactly once

  Scenario: sources remove drops a source that was never added
    When I run "cyberplace awesome sources remove acme/nav --layer local --root <root>"
    Then the exit code is 0
    And "acme/nav" is absent from "cyberplace awesome sources list --root <root>"

  Scenario: disabling the current repo's built-in default source warns
    Given the current repo is the built-in default source
    When I run "cyberplace awesome sources disable <current-repo> --layer local --root <root>"
    Then the exit code is 0
    And stdout contains "disables the built-in default source"

  Scenario: an invalid --layer value fails loud
    When I run "cyberplace awesome sources add acme/nav --layer bogus --root <root>"
    Then the exit code is 1
    And stderr contains "Expected --layer local|repo|global"

  # ── AXI: find TOON default + aggregate (#1,#2,#4) ──

  Scenario: find prints a TOON result with a pre-computed aggregate
    Given a catalog with 3 matching skills across 2 sources for the query "agent"
    When I run "cyberplace awesome find agent --root <root>"
    Then stdout is TOON with rows carrying "repo", "summary", and "install"
    And stdout contains the aggregate summary "3 skills across 2 sources"
    And the exit code is 0

  # ── AXI: find definitive empty state (#5) ──

  Scenario: find is a definitive empty state when nothing matches
    Given an empty catalog
    When I run "cyberplace awesome find zzznomatch --root <root>"
    Then the exit code is 0
    And stdout contains "0 skills found"

  # ── AXI: inspect truncation + --full (#3) ──

  Scenario: inspect truncates a long skill list with a size hint
    Given a repo "acme/nav" whose "skills/" directory has 60 SKILL.md files
    When I run "cyberplace awesome inspect acme/nav --root <root>"
    Then the exit code is 0
    And stdout is truncated with a size hint matching "… +\d+ lines — rerun with --full"

  Scenario: inspect --full prints every skill untruncated
    Given a repo "acme/nav" whose "skills/" directory has 60 SKILL.md files
    When I run "cyberplace awesome inspect acme/nav --full --root <root>"
    Then the exit code is 0
    And stdout lists all 60 skills

  Scenario: inspect --format json is never truncated
    Given a repo "acme/nav" whose "skills/" directory has 60 SKILL.md files
    When I run "cyberplace awesome inspect acme/nav --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array with 60 entries

  # ── AXI: sources list minimal schema + aggregate (#1,#2,#4) ──

  Scenario: sources list prints a TOON result with a pre-computed aggregate
    Given a repo-shared source "acme/nav" at "awesome-skills.json"
    And a global-user source "acme/compass" at "awesome-skills.json"
    When I run "cyberplace awesome sources list --root <root>"
    Then stdout is TOON with rows carrying "name", "layer", and "enabled"
    And stdout contains the aggregate summary "2 sources across 2 layers"
    And the exit code is 0

  # ── AXI: sources definitive empty state (#5) ──

  Scenario: sources list is a definitive empty state when none are configured
    Given no sources are configured at any layer
    When I run "cyberplace awesome sources list --root <root>"
    Then the exit code is 0
    And stdout contains "no sources configured"

  # ── AXI: render aggregate (#4) ──

  Scenario: render reports an aggregate count of rendered entries
    Given "<root>/readme.md" contains empty "AWESOME-SKILLS" markers
    And "<root>/awesome-skills.json" has 3 authored repo entries
    When I run "cyberplace awesome render --root <root>"
    Then the exit code is 0
    And stdout contains the aggregate summary "rendered 3 entries"

  # ── AXI: content-first bare invocation (#8) ──
  # Choice: bare `cyberplace awesome` runs `sources list` — the effective, live
  # catalog config an agent most needs before finding or rendering anything.

  Scenario: bare awesome with no subcommand shows the effective sources
    Given a repo-shared source "acme/nav" at "awesome-skills.json"
    When I run "cyberplace awesome --root <root>"
    Then the exit code is 0
    And stdout is the same TOON result as "cyberplace awesome sources list --root <root>"

  # ── AXI: next-step suggestions (#9) ──

  Scenario: find ends with a next-step suggestion
    Given a catalog with 1 matching entry for the query "nav"
    When I run "cyberplace awesome find nav --root <root>"
    Then stderr contains "→ cyberplace awesome inspect <repo>"

  Scenario: inspect ends with a next-step suggestion
    Given a repo "acme/nav" whose "skills/" directory has 1 SKILL.md file
    When I run "cyberplace awesome inspect acme/nav --root <root>"
    Then stderr contains "→ cyberplace awesome find"

  Scenario: render ends with a next-step suggestion
    Given "<root>/readme.md" contains empty "AWESOME-SKILLS" markers
    And "<root>/awesome-skills.json" has 1 authored repo entry
    When I run "cyberplace awesome render --root <root>"
    Then stderr contains "→ cyberplace awesome sources list"

  Scenario: sources list ends with a next-step suggestion
    Given a repo-shared source "acme/nav" at "awesome-skills.json"
    When I run "cyberplace awesome sources list --root <root>"
    Then stderr contains "→ cyberplace awesome find"

  # ── AXI: non-interactive, fail-loud (#6) ──

  Scenario: awesome commands never prompt interactively
    Given a catalog with 1 matching entry for the query "nav"
    When I run "cyberplace awesome find nav --root <root>"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    When I run "cyberplace awesome find nav --frobnicate --root <root>"
    Then the exit code is 1
    And stderr contains "--frobnicate"

  # ── AXI: help (#10) ──

  Scenario: awesome --help prints a concise reference
    When I run "cyberplace awesome --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example

  Scenario: awesome find --help prints a concise reference
    When I run "cyberplace awesome find --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example

  Scenario: awesome sources --help prints a concise reference
    When I run "cyberplace awesome sources --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
