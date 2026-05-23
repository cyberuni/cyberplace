#!/usr/bin/env bash
# Mechanically validates SKILL.md files for structure and security.
# Covers: S1, S2, S3 (structure), Q1 (trigger language), E1 (dangerous commands), E2 (prompt injection).
# Quality checks Q2–Q8 and nuanced security checks require LLM review (run validate-skill skill).
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

  # Q1: description must include trigger language
  if [[ -n "$fm_desc" ]]; then
    if ! echo "$fm_desc" | grep -qi "use this skill when\|when to use"; then
      warn "HIGH" "Q1" "Trigger language in description" \
        "description: $fm_desc" \
        "Add 'Use this skill when ...' to the description field"
    fi
  fi

  # E1: Dangerous shell commands — checked in fenced code blocks only.
  # Patterns in prose/bullet lists are documentation, not instructions.
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
  # Inline backtick- or quote-wrapped examples are documentation, not instructions.
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
  # Use stripped content so backtick-wrapped examples in docs don't trigger.
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

echo "✅ All structural and security checks passed."
echo "   Run the validate-skill agent skill for full quality review."
