---
"cyberlegion": minor
---

**BREAKING** — realign the CLI to its real architecture (ADR-0024). Command groups now mirror the
mux/legion layering instead of the retired `surfacing`/`wake` concept axis:

- `identity <verb>` and `session <verb>` collapse into one **`unit`** group: `unit register`,
  `unit whoami`, `unit who` (now carries a `pane` field and a `"N units"` aggregate — the old
  `session list` folded in), `unit prune`, `unit spawn`, `unit close`, `unit focus`, `unit nudge`,
  `unit read`.
- `identity owner` → **`unit register --standing`** (bare, no `--handle`, lists the standing records).
- `identity bind-main` / `identity main` → **`attach`** (bare binds; `--clear` unbinds; `--show`
  reads the bound pane).
- `admin doctor` / `admin mode` → **`mux doctor`** / **`mux mode`**.
- `admin install` folds into **`init`** (which owns hook installation directly); `admin` now carries
  only `migrate`.

Hot-path top-level aliases (`who`, `send`, `inbox`, `spawn`) and the bare-status default action are
unchanged. `mail`, `agent`, and `dispatch` are unchanged.
