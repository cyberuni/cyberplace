#!/usr/bin/env bash
# PostToolUse hook: ensures any SKILL.md written under .agents/skills/ is marked internal.
# Reads Claude Code tool JSON from stdin; silently exits for non-matching paths.

file_path=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)

[[ "$file_path" =~ \.agents/skills/[^/]+/SKILL\.md$ ]] || exit 0
[ -f "$file_path" ] || exit 0
grep -q '^\s*internal: true' "$file_path" && exit 0

python3 - "$file_path" <<'PYEOF'
import sys, re

fp = sys.argv[1]
with open(fp) as f:
    content = f.read()

if re.search(r'^\s*internal:\s*true', content, re.MULTILINE):
    sys.exit(0)

if re.search(r'^metadata:', content, re.MULTILINE):
    # metadata block exists but lacks internal: true — append it
    content = re.sub(r'^(metadata:\n)', r'\1  internal: true\n', content, count=1, flags=re.MULTILINE)
else:
    # no metadata block — insert one before the closing --- of the frontmatter
    # frontmatter starts at char 0 with ---, find the second ---
    m = re.search(r'^---$', content, re.MULTILINE)
    if m and m.start() > 0:
        pos = m.start()
        content = content[:pos] + 'metadata:\n  internal: true\n' + content[pos:]

with open(fp, 'w') as f:
    f.write(content)
PYEOF
