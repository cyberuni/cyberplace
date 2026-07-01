#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${TMUX:-}" ]]; then
  echo "Error: not inside a tmux session. Start tmux first." >&2
  exit 1
fi

NEW_PANE=$(tmux split-window -h -c "$PWD" -P -F "#{pane_id}")
tmux send-keys -t "$NEW_PANE" "claude -c --fork-session" Enter
tmux select-pane -t "$NEW_PANE"
