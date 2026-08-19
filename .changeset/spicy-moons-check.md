---
'cyber-sdd': minor
---

Add `check-spec-references` to the per-project spec checks: it walks every `.md` under a project
spec, resolves each explicitly-relative reference against the directory of the file carrying it, and
fails on any that resolves to nothing.

It closes a failure review cannot catch. The recurrence it was distilled from was not a typo but a
consistent off-by-one — every `../../../src/…` reference in a spec corpus was one directory level
short, and each read as entirely plausible: right filename, right-looking depth, wrong level. The
finding therefore names both the reference as written and the path it resolved to, since the first
half is exactly what looked correct.

Only an explicitly-relative path (`./` or `../`) is a reference; a bare path in inline code is
prose. That is what makes a repo-root-relative reference pass by construction rather than by
exception. Directory targets resolve, trailing slash and all. A line carrying
`<!-- spec-ref-ignore: why -->` is skipped, for prose quoting a path relative to something other
than the file it sits in.
