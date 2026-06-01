Feature: Layer discovery
  The discovery algorithm collects all applicable augmentation layer files for an agentic file,
  ordered from lowest to highest priority. Missing layers are silently skipped.

  The system under test is any conformant layer resolver (e.g., `cyber-skills skill layers`).

  # --- Base layer ---

  Scenario: Skill with only a shared layer resolves to one layer
    Given skill "commit-work" is installed at the shared package path
    And no other layer files exist for "commit-work"
    When discovery runs for "commit-work"
    Then exactly one layer is collected: "shared"

  # --- User layer ---

  Scenario: User layer at ~/.agents/skills/{name}/SKILL.md is collected
    Given "~/.agents/skills/commit-work/SKILL.md" exists
    When discovery runs for "commit-work"
    Then the "user" layer is included in the collected layers

  Scenario: Missing user layer is silently skipped
    Given "~/.agents/skills/commit-work/SKILL.md" does not exist
    When discovery runs for "commit-work"
    Then no "user" layer appears in the collected layers
    And no warning is emitted for the missing user layer

  # --- Org layer ---

  Scenario: Org layer path taken from AGENTS_ORG_PATH env var
    Given env var AGENTS_ORG_PATH is set to "/etc/company/agents"
    And "/etc/company/agents/skills/commit-work/SKILL.md" exists
    When discovery runs for "commit-work"
    Then the "org" layer is collected from "/etc/company/agents/skills/commit-work/SKILL.md"

  Scenario: Org layer falls back to well-known POSIX path when AGENTS_ORG_PATH is absent
    Given AGENTS_ORG_PATH is not set
    And "/etc/agents/skills/commit-work/SKILL.md" exists
    When discovery runs for "commit-work"
    Then the "org" layer is collected from "/etc/agents/skills/commit-work/SKILL.md"

  Scenario: Missing org layer is silently skipped
    Given AGENTS_ORG_PATH is not set
    And "/etc/agents/skills/commit-work/SKILL.md" does not exist
    When discovery runs for "commit-work"
    Then no "org" layer appears in the collected layers

  # --- Remote org layer ---

  Scenario: Remote org layer is fetched when AGENTS_ORG_PATH is a URL
    Given AGENTS_ORG_PATH is "https://cdn.example.com/agents"
    And "https://cdn.example.com/agents/skills/commit-work/SKILL.md" is reachable
    When discovery runs for "commit-work"
    Then the fetched content is used as the "org" layer
    And the content is cached at "~/.cache/agents/org-skills/commit-work/SKILL.md"

  Scenario: Remote org layer uses cache on fetch failure
    Given AGENTS_ORG_PATH is "https://cdn.example.com/agents"
    And the URL is unreachable
    And a cached file exists at "~/.cache/agents/org-skills/commit-work/SKILL.md"
    When discovery runs for "commit-work"
    Then the cached content is used as the "org" layer

  Scenario: Remote org layer is skipped with a warning on cache miss and fetch failure
    Given AGENTS_ORG_PATH is "https://cdn.example.com/agents"
    And the URL is unreachable
    And no cache file exists for "commit-work"
    When discovery runs for "commit-work"
    Then no "org" layer appears in the collected layers
    And a warning is emitted that the remote org layer could not be fetched

  Scenario: Remote org layer fetch uses a 5-second timeout
    Given AGENTS_ORG_PATH is "https://cdn.example.com/agents"
    When discovery runs for "commit-work"
    Then the HTTP request uses a timeout of 5 seconds

  Scenario: Remote org layer cache is refreshed after 24-hour TTL expires
    Given AGENTS_ORG_PATH is "https://cdn.example.com/agents"
    And a cached org layer exists that was fetched 25 hours ago
    And the remote URL is reachable
    When discovery runs for "commit-work"
    Then the remote layer is re-fetched
    And the cache is updated with the new content

  Scenario: Remote org layer cache within TTL is used without re-fetching
    Given AGENTS_ORG_PATH is "https://cdn.example.com/agents"
    And a cached org layer exists that was fetched 23 hours ago
    When discovery runs for "commit-work"
    Then the cached content is used without making an HTTP request

  # --- Project layer ---

  Scenario: Project layer is the deepest SKILL.md found walking up to git root
    Given CWD is "/repo/packages/core/src"
    And "/repo/packages/core/.agents/skills/commit-work/SKILL.md" exists
    And "/repo/.agents/skills/commit-work/SKILL.md" also exists
    When discovery runs for "commit-work"
    Then the "project" layer is collected from "/repo/packages/core/.agents/skills/commit-work/SKILL.md"

  Scenario: Project layer walk stops at git root
    Given CWD is "/repo/src"
    And no ".agents/skills/commit-work/SKILL.md" exists between CWD and the git root
    When discovery runs for "commit-work"
    Then no "project" layer appears in the collected layers

  Scenario: Only the deepest match in the project walk is used, not all matches
    Given CWD is "/repo/packages/core"
    And both "/repo/.agents/skills/commit-work/SKILL.md" and "/repo/packages/core/.agents/skills/commit-work/SKILL.md" exist
    When discovery runs for "commit-work"
    Then exactly one "project" layer is collected
    And it is "/repo/packages/core/.agents/skills/commit-work/SKILL.md"

  # --- Workspace layer ---

  Scenario: Workspace layer is distinct from project layer in a monorepo
    Given the git root is "/repo"
    And CWD is inside sub-package "/repo/packages/core" which has a "package.json"
    And "/repo/.agents/skills/commit-work/SKILL.md" exists
    And "/repo/packages/core/.agents/skills/commit-work/SKILL.md" exists
    When discovery runs for "commit-work"
    Then the "project" layer is collected from "/repo/.agents/skills/commit-work/SKILL.md"
    And the "workspace" layer is collected from "/repo/packages/core/.agents/skills/commit-work/SKILL.md"

  Scenario: Workspace layer is absent when CWD is at the repo root (not inside a sub-package)
    Given CWD equals the git root
    When discovery runs for "commit-work"
    Then no "workspace" layer appears in the collected layers

  Scenario: Sub-package is detected by presence of pyproject.toml as well as package.json
    Given CWD is inside a directory containing "pyproject.toml" below the git root
    And ".agents/skills/commit-work/SKILL.md" exists in that directory
    When discovery runs for "commit-work"
    Then the "workspace" layer is collected from that directory

  # --- Local layer ---

  Scenario: Local layer is SKILL.local.md alongside the highest-priority non-local layer
    Given the highest-priority non-local layer is "/repo/.agents/skills/commit-work/SKILL.md"
    And "/repo/.agents/skills/commit-work/SKILL.local.md" exists
    When discovery runs for "commit-work"
    Then the "local" layer is collected from "/repo/.agents/skills/commit-work/SKILL.local.md"

  Scenario: Local layer alongside shared base is collected when no other layers exist
    Given the only non-local layer is the shared base at the npm package path
    And "SKILL.local.md" exists alongside the base file
    When discovery runs for "commit-work"
    Then the "local" layer is collected from alongside the shared base

  Scenario: Local layer alongside a lower-priority layer is not collected when a higher layer exists
    Given a local "SKILL.local.md" exists alongside the shared base
    And a project layer also exists at "/repo/.agents/skills/commit-work/SKILL.md"
    And no "SKILL.local.md" exists alongside the project layer
    When discovery runs for "commit-work"
    Then no "local" layer is collected
    And the shared base's "SKILL.local.md" is not used

  # --- Backward compatibility ---

  Scenario: SKILL.project.md co-located with base is treated as project scope
    Given "SKILL.project.md" exists alongside the installed base "SKILL.md"
    When discovery runs for "commit-work"
    Then the "project" layer is collected from "SKILL.project.md"

  Scenario: SKILL.local.md co-located with base is treated as local scope
    Given "SKILL.local.md" exists alongside the installed base "SKILL.md"
    When discovery runs for "commit-work"
    Then the "local" layer is collected from "SKILL.local.md"

  # --- Layer order ---

  Scenario: Collected layers are always ordered built-in through local regardless of discovery path
    Given layers exist for "commit-work" at user, org, project, and local scopes
    When discovery runs for "commit-work"
    Then the collected order is: built-in, user, shared, org, project, workspace, local
    And no layer appears more than once
