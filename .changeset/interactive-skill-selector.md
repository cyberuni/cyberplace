---
"cyber-skills": minor
---

Upgrade the `add` interactive skill picker with keyboard navigation, fuzzy filtering, and group toggle.

- Use arrow keys to navigate the skill list.
- Press `Space` to toggle a single skill or an entire group (group rows show `[ ]` / `[-]` / `[x]` state).
- Type any characters to fuzzy-filter by skill name; `Backspace` removes the last filter character.
- Press `Ctrl+A` to select or deselect all currently visible skills.
- Press `Enter` to confirm, `Esc` to cancel.
- Non-TTY sessions fall back to the original numbered-list prompt.
