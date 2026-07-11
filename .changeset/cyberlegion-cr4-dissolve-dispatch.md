---
"cyberlegion": minor
---

**BREAKING** — dissolve the CLI's `dispatch` command group, `Store` result-slot
(`resultPath`/`writeResult`/`readResult`), and `realizeSubagentInstruction`/`selectWakePath` library
exports. A cold subagent now returns via the caller's own Task-result (its final returned message)
instead of a `dispatch prep`/collect result file, and a warm peer returns via `mail await` on a
thread instead of `dispatch channel`. Routing (warm-peer vs subagent vs run-inline) and the
wake-matrix decision move out of the CLI into the Legate plugin's governance
(`dispatch-governance`/`subagent-backend-governance`), which now composes `unit spawn` + `mail
await` + `agent resolve` directly. Verdict-schema validation is dropped for now, to return later as
a dedicated `mail --verdict-schema` capability.
