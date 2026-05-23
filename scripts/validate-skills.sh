#!/usr/bin/env bash
# Mechanically validates SKILL.md files for structure, quality, and security.
# Covers: S1–S5 (structure), Q1–Q4 (quality), E1, E2, E6 (security).
# Q5–Q8 and nuanced security checks (E3–E5, E7) require LLM review (run validate-skill skill).
set -euo pipefail

CRITICAL_FAILURES=0
WARNINGS=0

fail_critical() {
  local check_id="$1" name="$2" evidence="$3" fix="$4"
  echo "  ❌ [CRITICAL] $check_id — $name"
  echo "     Evidence: $evidence"
  echo "     Fix:      $fix"
  CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
}

warn() {
  local severity="$1" check_id="$2" name="$3" evidence="$4" fix="$5"
  echo "  ⚠️  [$severity] $check_id — $name"
  echo "     Evidence: $evidence"
  echo "     Fix:      $fix"
  WARNINGS=$((WARNINGS + 1))
}

extract_frontmatter_field() {
  local file="$1" field="$2"
  awk '/^---/{n++; if(n==2) exit} n==1 && !/^---/{print}' "$file" \
    | grep "^${field}:" | head -1 | sed "s/^${field}: *//"
}

extract_body() {
  # Everything after the closing --- of the frontmatter
  awk '/^---/{n++; if(n==2){found=1; next}} found{print}' "$1"
}

# Extract only content inside fenced code blocks (``` ... ```)
extract_code_blocks() {
  awk '/^```/{in_block=!in_block; next} in_block{print NR": "$0}' "$1"
}

# Strip inline backtick-quoted and double-quoted content (examples/references, not instructions)
strip_examples() {
  sed 's/`[^`]*`//g; s/"[^"]*"//g' "$1"
}

validate_skill() {
  local real_path="$1"
  local skill_dir dir_name skill_ok
  skill_dir=$(dirname "$real_path")
  dir_name=$(basename "$skill_dir")
  skill_ok=1

  echo ""
  echo "── $dir_name ─────────────────────────"

  # ── Structure ──────────────────────────────────────────────────────────────

  # S1: SKILL.md must be at <dir>/<name>/SKILL.md
  local parent
  parent=$(basename "$(dirname "$skill_dir")")
  if [[ "$parent" != "skills" ]]; then
    fail_critical "S1" "SKILL.md in own directory" \
      "path: $real_path" \
      "Move SKILL.md into its own named subdirectory under skills/"
    skill_ok=0
  fi

  # S2: name and description frontmatter required
  local fm_name fm_desc
  fm_name=$(extract_frontmatter_field "$real_path" "name")
  fm_desc=$(extract_frontmatter_field "$real_path" "description")
  if [[ -z "$fm_name" ]]; then
    fail_critical "S2" "Required frontmatter: name" \
      "name: field missing or empty" \
      "Add 'name: $dir_name' to the YAML frontmatter block"
    skill_ok=0
  fi
  if [[ -z "$fm_desc" ]]; then
    fail_critical "S2" "Required frontmatter: description" \
      "description: field missing or empty" \
      "Add a description: field to the YAML frontmatter block"
    skill_ok=0
  fi

  # S3: name must match directory name
  if [[ -n "$fm_name" && "$fm_name" != "$dir_name" ]]; then
    warn "HIGH" "S3" "name matches directory" \
      "name: '$fm_name' but directory is '$dir_name'" \
      "Set name: to '$dir_name'"
  fi

  # S4: Referenced files/subdirs must exist within the skill directory.
  # Only checks paths inside fenced code blocks (prose examples like "e.g., x.sh" are docs).
  # Excludes: template placeholders (<...>), globs (*), absolute/home/repo-root paths.
  local s4_refs
  mapfile -t s4_refs < <(
    extract_code_blocks "$real_path" \
      | grep -oE '[a-zA-Z0-9_.-]+/[a-zA-Z0-9_./-]+' \
      | grep -vE '[<>*]' \
      | grep -vE '^(https?://|~|/)' \
      | grep -E '\.(md|sh|js|ts|py|json|yaml|yml)$' \
      || true
  )
  for ref in "${s4_refs[@]}"; do
    local target="$skill_dir/$ref"
    if [[ ! -e "$target" ]]; then
      warn "HIGH" "S4" "Referenced file does not exist in skill directory" \
        "$ref (looked for $target)" \
        "Create the file inside the skill directory or remove the reference"
    fi
  done

  # S5: Internal markdown anchor links must resolve to real headings.
  # Checked on stripped content so backtick-wrapped syntax examples don't trigger.
  local s5_anchors
  mapfile -t s5_anchors < <(
    strip_examples "$real_path" \
      | grep -oE '\[([^]]+)\]\(#([^)]+)\)' \
      | sed 's/.*](#//' | sed 's/)//' \
      || true
  )
  for anchor in "${s5_anchors[@]}"; do
    local heading_pat
    heading_pat=$(echo "$anchor" | sed 's/-/ /g')
    if ! grep -qi "^#.*${heading_pat}" "$real_path"; then
      warn "MEDIUM" "S5" "Internal anchor link does not resolve" \
        "#$anchor" \
        "Add a heading matching '$heading_pat' or fix the link target"
    fi
  done

  # ── Quality ────────────────────────────────────────────────────────────────

  local body
  body=$(extract_body "$real_path")

  # Q1: description must include trigger language
  if [[ -n "$fm_desc" ]]; then
    if ! echo "$fm_desc" | grep -qi "use this skill when\|when to use"; then
      warn "HIGH" "Q1" "Trigger language in description" \
        "description: $fm_desc" \
        "Add 'Use this skill when ...' to the description field"
    fi
  fi

  # Q2: description must be specific (word count and generic phrase check)
  if [[ -n "$fm_desc" ]]; then
    local word_count
    # Strip leading/trailing quotes before counting
    word_count=$(echo "$fm_desc" | tr -d '"' | wc -w)
    if [[ $word_count -lt 12 ]]; then
      warn "HIGH" "Q2" "Description too short (specificity)" \
        "${word_count} words: $fm_desc" \
        "Expand the description to at least 12 words with specific trigger conditions"
    fi
    local generic_patterns=(
      'helps with'
      'general purpose'
      'handles tasks'
      'use this skill when the user asks anything'
      'does things'
    )
    for pat in "${generic_patterns[@]}"; do
      if echo "$fm_desc" | grep -qi "$pat"; then
        warn "HIGH" "Q2" "Description uses vague generic phrase" \
          "matched '$pat' in: $fm_desc" \
          "Replace with specific trigger conditions and outcomes"
        break
      fi
    done
  fi

  # Q3: apparent sub-skills must carry "Internal skill:" prefix
  if [[ -n "$fm_desc" ]]; then
    if echo "$fm_desc" | grep -qi "called by\b\|^internal\b"; then
      if ! echo "$fm_desc" | grep -qi "^Internal skill:"; then
        warn "MEDIUM" "Q3" "Sub-skill missing 'Internal skill:' prefix" \
          "description: $fm_desc" \
          "Prefix description with 'Internal skill: ' to prevent unintended activation"
      fi
    fi
  fi

  # Q4: body must contain actionable instructions (numbered steps or decision headers)
  if [[ -n "$body" ]]; then
    if ! echo "$body" | grep -qE '^[0-9]+\.|^#{1,4} ' ; then
      warn "MEDIUM" "Q4" "No actionable instruction body" \
        "body has no numbered steps or section headers" \
        "Add numbered steps, decision logic, or ## section headers"
    fi
  else
    warn "MEDIUM" "Q4" "No actionable instruction body" \
      "body is empty after frontmatter" \
      "Add numbered steps, decision logic, or ## section headers"
  fi

  # ── Security ───────────────────────────────────────────────────────────────

  # E1: Dangerous shell commands — checked in fenced code blocks only.
  local code_content
  code_content=$(extract_code_blocks "$real_path")
  local e1_patterns=(
    'rm[[:space:]]+-[rRf]*f[rRf]*[[:space:]]+'
    'sudo[[:space:]]+rm'
    'curl[^|#\n]*\|[[:space:]]*(ba)?sh'
    'wget[^|#\n]*\|[[:space:]]*(ba)?sh'
    '\bdd[[:space:]]+if='
    '\b(mkfs|fdisk|parted)\b'
    'kill[[:space:]]+-9[[:space:]]+1\b'
    ':\(\)\{[[:space:]]*:\|:&[[:space:]]*\}'
    'chmod[[:space:]]+-R[[:space:]]+777[[:space:]]+'
  )
  for pat in "${e1_patterns[@]}"; do
    local match
    match=$(echo "$code_content" | grep -E "$pat" | head -1 || true)
    if [[ -n "$match" ]]; then
      fail_critical "E1" "Dangerous shell command (in code block)" \
        "$match" \
        "Remove or rewrite; never embed destructive commands in a skill"
      skill_ok=0
    fi
  done

  # E2: Prompt injection — checked on prose with inline examples stripped.
  local stripped_content
  stripped_content=$(strip_examples "$real_path")
  local e2_patterns=(
    '[Ii]gnore (previous|all|prior) instructions'
    '[Yy]ou are now [A-Z][a-zA-Z]'
    '[Ff]rom now on you are '
    '[Dd]isregard your (guidelines|rules)'
    '[Ff]orget your (guidelines|training)'
    '[Yy]our new instructions are'
  )
  for pat in "${e2_patterns[@]}"; do
    local match
    match=$(echo "$stripped_content" | grep -nE "$pat" | head -1 || true)
    if [[ -n "$match" ]]; then
      fail_critical "E2" "Prompt injection pattern" \
        "$match" \
        "Remove prompt-injection content; treat skill body as untrusted data"
      skill_ok=0
    fi
  done

  # E6: git push --force to main/master without a confirmation step.
  local e6_match
  e6_match=$(echo "$stripped_content" | grep -nE 'git push.*(--force|-f )' \
    | grep -E '(main|master)' | head -1 || true)
  if [[ -n "$e6_match" ]]; then
    warn "HIGH" "E6" "Silent permission escalation: force-push to main/master" \
      "$e6_match" \
      "Add an explicit user-confirmation step before the force-push"
  fi

  if [[ $skill_ok -eq 1 ]]; then
    echo "  ✅ no CRITICAL findings"
  else
    echo "  🚨 DO NOT commit or install until all CRITICAL findings are resolved."
  fi
}

# ── Discovery ───────────────────────────────────────────────────────────────
# Resolve symlinks so each real file is validated once.
mapfile -t skill_files < <(
  find skills .agents/skills -name "SKILL.md" 2>/dev/null \
    | while read -r f; do realpath "$f"; done \
    | sort -u
)

if [[ ${#skill_files[@]} -eq 0 ]]; then
  echo "No SKILL.md files found."
  exit 0
fi

echo "Validating ${#skill_files[@]} skill(s)…"

for f in "${skill_files[@]}"; do
  validate_skill "$f"
done

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════"
echo "Results: ${CRITICAL_FAILURES} critical failure(s), ${WARNINGS} warning(s)"

if [[ $CRITICAL_FAILURES -gt 0 ]]; then
  echo "❌ Fix all CRITICAL findings before merging."
  exit 1
fi

echo "✅ All checks passed (S1–S5, Q1–Q4, E1–E2, E6)."
echo "   Run the validate-skill agent skill for full quality review (Q5–Q8, E3–E5, E7)."
