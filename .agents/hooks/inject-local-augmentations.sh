#!/usr/bin/env bash
# SessionStart hook: surfaces any SKILL.local.md files as additional context.
# Output is shown to the agent at session start via hookSpecificOutput.

augmentations=""
while IFS= read -r -d '' local_md; do
    skill=$(basename "$(dirname "$local_md")")
    augmentations+="### Local augmentation for skill: $skill\n\n$(cat "$local_md")\n\n"
done < <(find .agents/skills -name "SKILL.local.md" -print0 2>/dev/null)

[ -z "$augmentations" ] && exit 0

printf '%s' "$augmentations" | jq -Rs '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":.}}'
