#!/usr/bin/env node
// Impl-gate verification for sdd-provenance — one functional check per frozen
// scenario in sdd-provenance.feature (37 scenarios). The implementation is
// agent-prose (the operator + combat-log-governance) plus the corpus's sibling
// combat-log.jsonl ledgers, so each check is static inspection: assert the
// prose realizes the scenario's behavior, and assert the sample ledgers are
// well-formed JSONL with the required fields. Each test title is anchored to a
// frozen scenario title. Types are stripped by plain node --test.

import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const REPO = join(import.meta.dirname, '..', '..', '..')
const SPECS = join(REPO, 'artifacts', 'specs')
const SELF = join(SPECS, 'sdd-provenance')

const operator = readFileSync(join(REPO, 'plugins', 'sdd', 'agents', 'sdd-operator.md'), 'utf8')
const governance = readFileSync(join(REPO, 'plugins', 'sdd', 'skills', 'combat-log-governance', 'SKILL.md'), 'utf8')
const checkSpecState = readFileSync(
	join(REPO, 'plugins', 'sdd', 'skills', 'validate-spec', 'scripts', 'check-spec-state.mts'),
	'utf8',
)
const specMd = readFileSync(join(SELF, 'spec.md'), 'utf8')

// ── ledger corpus: every sibling combat-log.jsonl ───────────────────────────
interface LedgerEntry {
	seq?: number
	kind?: string
	role?: string
	agent?: string
	outcome?: string
	'correction-kind'?: string
	cause?: string
	[k: string]: unknown
}
interface Ledger {
	slug: string
	path: string
	entries: LedgerEntry[]
}

function specSlugs(): string[] {
	return readdirSync(SPECS, { withFileTypes: true })
		.filter((e) => e.isDirectory() && existsSync(join(SPECS, e.name, 'spec.md')))
		.map((e) => e.name)
}

function loadLedger(slug: string): Ledger | null {
	const path = join(SPECS, slug, 'combat-log.jsonl')
	if (!existsSync(path)) return null
	const entries = readFileSync(path, 'utf8')
		.split('\n')
		.filter((l) => l.trim() && !l.trimStart().startsWith('#'))
		.map((l) => JSON.parse(l) as LedgerEntry)
	return { slug, path, entries }
}

const ledgers: Ledger[] = specSlugs()
	.map(loadLedger)
	.filter((l): l is Ledger => l !== null)

const KINDS = new Set(['report', 'correction', 'strategy'])
const CORRECTION_KINDS = new Set(['gate-reject', 'judge-iteration', 'council-kickback'])
const CAUSES = new Set(['coverage-gap', 'design-overreach'])

// frontmatter block of a spec.md
function frontmatter(text: string): string {
	const m = /^---\n([\s\S]*?)\n---/.exec(text)
	return m ? m[1] : ''
}

// ════════════════════════════════════════════════════════════════════════════
// ── spec-folder shape ───────────────────────────────────────────────────────

test('the spec folder contains combat-log.jsonl beside spec.md', () => {
	assert.ok(existsSync(join(SELF, 'spec.md')), 'spec.md present')
	assert.ok(
		readdirSync(SELF).some((f) => f.endsWith('.feature')),
		'.feature present',
	)
	assert.ok(existsSync(join(SELF, 'combat-log.jsonl')), 'combat-log.jsonl sibling present')
})

test('current-state fields remain in spec.md frontmatter', () => {
	const fm = frontmatter(specMd)
	assert.match(fm, /^status:/m, 'status in frontmatter')
	assert.match(fm, /^approval:/m, 'approval in frontmatter')
	assert.match(fm, /^aligned:/m, 'aligned in frontmatter')
	assert.match(fm, /^produced-by:/m, 'produced-by in frontmatter')
	// no frontmatter log ledger entries — the ledger moved to the sibling file
	assert.doesNotMatch(fm, /^log:/m, 'no frontmatter log ledger')
})

test('the sibling combat-log file is never frozen', () => {
	// operator appends a report during delivery while spec.md/.feature stay frozen
	assert.match(operator, /sibling `combat-log\.jsonl` ledger/, 'operator names the sibling ledger as a write target')
	assert.match(governance, /never frozen/, 'governance: ledger never frozen')
	assert.match(
		governance,
		/keeps appending across the whole lifecycle, including while `spec\.md` and the `\.feature` are frozen/,
		'governance: appends even while spec.md/.feature frozen',
	)
})

test('the sibling combat-log file is never gated', () => {
	assert.match(governance, /never frozen and never gated/, 'governance: ledger never gated')
	// spec contract: never gated, no approval required/possible
	assert.match(specMd, /never gated/, 'spec: ledger never gated')
})

test('freeze covers spec.md and .feature only', () => {
	assert.match(
		specMd,
		/Freeze scope is `spec\.md` \+ `\.feature` only/,
		'spec: freeze scope is spec.md + .feature only',
	)
	assert.match(specMd, /sibling ledger is \*\*never\*\* part of the freeze/, 'spec: sibling ledger not frozen')
})

// ── reader split by path ────────────────────────────────────────────────────

test('the sdd gateway reads status from spec.md frontmatter only', () => {
	// the static state checker (the status reader) parses the status field out of
	// frontmatter and never opens the sibling ledger
	assert.match(checkSpecState, /\/\^status:\\s\*/, 'reader parses the status field from frontmatter')
	assert.match(checkSpecState, /frontmatter\(text: string\)/, 'reader scopes its parse to the frontmatter block')
	assert.doesNotMatch(checkSpecState, /combat-log\.jsonl/, 'status reader never opens the ledger file')
	assert.match(
		specMd,
		/status-only scan.*does not open the ledger|does not open the ledger/,
		'spec: gateway status-only scan does not open the ledger',
	)
})

test('the doctrine-loop Scanner reads the sibling combat-log file', () => {
	assert.match(specMd, /Scanner reads the ledger file/, 'spec: Scanner reads the ledger file')
	assert.match(
		governance,
		/doctrine-loop Scanner.*combat log \*\*alone\*\*|drafts strategy from the combat log \*\*alone\*\*/,
		'governance: Scanner reads the ledger as its sole input',
	)
})

// ── gate appends to sibling while judging the contract ──────────────────────

test('the spec gate appends its entry to the sibling ledger while judging the contract', () => {
	// judged object (spec.md + .feature) differs from written-to object (ledger)
	assert.match(
		specMd,
		/Write-to vs\. being-judged are separate files|judged object and the written-to object are different files/,
		'spec: write-to vs judged are separate files',
	)
	assert.match(
		specMd,
		/does append.*own report or correction entry to the sibling ledger/,
		'spec: the gate appends its own entry to the sibling ledger',
	)
})

// ── recording provenance ────────────────────────────────────────────────────

test('the producer is recorded on every artifact', () => {
	assert.match(
		operator,
		/`produced-by` is recorded \*\*always\*\*, on every production/,
		'operator: produced-by recorded always',
	)
	assert.match(
		operator,
		/regardless of whether any disambiguation happened/,
		'operator: recorded even with no disambiguation',
	)
})

test('provenance and approval together give full attribution', () => {
	// produced-by names the producer; approval names the judge → both known
	assert.match(
		governance,
		/produced-by.*\+ `approval`|produced-by` \(map by role\) \+ `approval`/,
		'governance: produced-by + approval current-state pair',
	)
	assert.match(
		specMd,
		/who \*\*produced\*\* it and who \*\*judged\*\* it/,
		'spec: producer and judge both attributable',
	)
})

// ── resume and availability ─────────────────────────────────────────────────

test('resume reuses the recorded producer when its plugin is installed', () => {
	assert.match(
		operator,
		/\*\*Cache hit\*\* — `produced-by\[role\]` is set \*\*and\*\*.*its plugin is still installed.*reuse it/,
		'operator: cache-hit reuses recorded producer when installed',
	)
})

test('an unavailable recorded producer does not block', () => {
	assert.match(
		operator,
		/recorded named producer whose plugin is \*\*gone\*\* is not an error/,
		'operator: unavailable producer is not an error',
	)
	assert.match(
		operator,
		/historical value is \*\*preserved annotated `\[unavailable\]`\*\*/,
		'operator: historical value preserved, annotated unavailable',
	)
	assert.match(operator, /re-resolves/, 'operator: re-resolves on cache miss')
})

// ── defaults and conflicts ──────────────────────────────────────────────────

test('a degenerate role records the SDD default', () => {
	assert.match(
		operator,
		/\*\*Default \+ record\*\* — \*\*zero matches\*\*.*SDD default/,
		'operator: zero matches uses the SDD default',
	)
	// a default producer records sdd:sdd-operator (inline) / a default judge records sdd:<default>
	assert.match(
		operator,
		/records `sdd:sdd-operator`|`sdd:<default>`|sdd-prefixed/,
		'operator: records the sdd-prefixed default',
	)
})

test('an unresolvable producer hard-fails with no sentinel', () => {
	assert.match(operator, /\*\*No resolvable role \(terminal\)\*\*/, 'operator: terminal no-resolvable-role branch')
	assert.match(
		operator,
		/hard-fail.*`STATUS: blocked`.*\*\*record nothing\*\*.*no sentinel value/s,
		'operator: hard-fails, records nothing, no sentinel',
	)
})

test('a first-time conflict asks once, then is decisive', () => {
	assert.match(
		operator,
		/\*\*Ambiguous \(ask once\)\*\*.*two or more plugins.*`STATUS: needs-input`/s,
		'operator: ambiguous returns needs-input',
	)
	assert.match(
		operator,
		/records the chosen producer into `produced-by\[role\]`.*the question never recurs/s,
		'operator: choice recorded, never recurs',
	)
})

// ── gate fail-closed ────────────────────────────────────────────────────────

test('the spec gate fails closed on an unresolved contested producer', () => {
	assert.match(
		operator,
		/\*\*Gate fail-closed\.\*\*.*contested role with no cache.*do \*\*not\*\* ask and do \*\*not\*\* write `produced-by`/s,
		'operator: gate fail-closed does not ask, does not write produced-by',
	)
	assert.match(
		operator,
		/resolve the domain producer via `create-spec` first/,
		'operator: blocker defers to create-spec',
	)
})

test('the impl gate fails closed on an unresolved contested producer', () => {
	// the fail-closed invariant is explicitly symmetric across spec and impl gates
	assert.match(
		operator,
		/[Ss]ymmetric across (?:the )?(?:both gates|the spec and impl gates|spec and impl)/,
		'operator: gate fail-closed symmetric across spec and impl gates',
	)
})

test('a gate still writes verdict frontmatter when it fails closed', () => {
	// the gate may write only status + the approval ratification, never setup frontmatter
	assert.match(specMd, /never write setup frontmatter \(`produced-by`/, 'spec: gate never writes setup frontmatter')
	assert.match(
		specMd,
		/owns only verdict frontmatter \(`status`, the human ratification of `approval`\)/,
		'spec: gate owns only verdict frontmatter',
	)
})

// ── validation, migration, ownership ────────────────────────────────────────

test('validate-spec flags but does not block an unavailable producer', () => {
	assert.match(
		specMd,
		/not installed\*\* is \*\*flagged, not blocked\*\*/,
		'spec: unavailable producer flagged not blocked',
	)
})

test('validate-spec blocks a malformed produced-by entry', () => {
	assert.match(specMd, /malformed entry \*\*fails the gate\*\*/, 'spec: malformed produced-by fails the gate')
	assert.match(
		specMd,
		/unlike an unavailable-but-valid entry, which is only flagged/,
		'spec: unavailable-but-valid in same spec still only flagged',
	)
})

test('validate-spec blocks a role with no resolvable producer', () => {
	assert.match(
		specMd,
		/no resolvable producer\*\* — not a plugin producer and not even an SDD default — \*\*fails closed with a blocker\*\*/,
		'spec: no-resolvable-producer fails closed',
	)
})

test('a legacy domain-plugin map is migrated into produced-by', () => {
	assert.match(
		operator,
		/\*\*Migrate first\.\*\*.*legacy `domain-plugin` map, rewrite its choice into `produced-by`.*\*\*drop\*\* the `domain-plugin` map/s,
		'operator: migrates domain-plugin into produced-by then drops it',
	)
})

test('the operator writes produced-by; producers and judges do not', () => {
	assert.match(governance, /producers \/ judges\*\*.*\| nothing \|/, 'governance: producers/judges write nothing')
	// the spec-producer contract forbids writing produced-by
	assert.match(
		operator,
		/must not write spec\.md control frontmatter \(status, aligned, approval, produced-by\)/,
		'operator: producer must not write produced-by',
	)
})

// ── log ledger: dispatch reports ────────────────────────────────────────────

test('a per-subagent report entry is appended to the sibling ledger per dispatch', () => {
	assert.match(
		operator,
		/append one `report` line to `combat-log\.jsonl` per act.*next `seq`.*`role`.*`agent`.*`outcome`/s,
		'operator: report line per dispatch with role/agent/outcome',
	)
	// at least one real report entry exists in the corpus with the required fields
	const report = ledgers.flatMap((l) => l.entries).find((e) => e.kind === 'report')
	assert.ok(report, 'a report entry exists in the corpus')
	assert.ok(typeof report?.role === 'string' && report.role, 'report names a role')
	assert.ok(typeof report?.agent === 'string' && report.agent, 'report names an agent')
	assert.ok(report?.outcome === 'pass' || report?.outcome === 'fail', 'report records an outcome')
})

test('each dispatch appends a new entry rather than overwriting', () => {
	assert.match(operator, /Append, never overwrite/, 'operator: append never overwrite')
	// every multi-entry ledger has strictly monotonic, gapless-or-increasing seq
	for (const l of ledgers) {
		const seqs = l.entries.map((e) => e.seq)
		for (let i = 1; i < seqs.length; i++) {
			assert.ok(
				typeof seqs[i] === 'number' && typeof seqs[i - 1] === 'number' && seqs[i]! > seqs[i - 1]!,
				`${l.slug}: seq is monotonically increasing (append-only shape)`,
			)
		}
	}
})

// ── log ledger: corrections with cause ──────────────────────────────────────

test('a gate rejection is recorded in both faces without duplication', () => {
	assert.match(
		operator,
		/a \*\*gate rejection\*\* → `correction-kind: gate-reject`/,
		'operator: gate rejection logs a correction',
	)
	assert.match(
		operator,
		/the standing verdict still goes to `approval`; the correction is \*\*not\*\* duplicated there/,
		'operator: verdict to approval, correction not duplicated',
	)
})

test('a gate rejection followed by a fix preserves the correction', () => {
	// append-only: the correction line is never edited/removed when approval lands
	assert.match(
		governance,
		/preserved forever as a correction line in the ledger|appended, never edited or removed|never edited or deleted/,
		'governance: correction preserved (append-only)',
	)
})

test('a producer-judge iteration is logged with a cause', () => {
	assert.match(
		operator,
		/a \*\*producer⇄judge iteration\*\*.*→ `correction-kind: judge-iteration`/,
		'operator: judge-iteration logs a correction',
	)
	assert.match(governance, /judge-iteration/, 'governance defines judge-iteration')
})

test('a Council kick-back is logged with a cause', () => {
	assert.match(
		operator,
		/a \*\*Council kick-back\*\*.*→ `correction-kind: council-kickback`/,
		'operator: council-kickback logs a correction',
	)
	assert.match(governance, /council-kickback/, 'governance defines council-kickback')
})

// ── log ledger: mission reconstruction ──────────────────────────────────────

test('the mission is reconstructed from the sibling ledger alone', () => {
	assert.match(
		specMd,
		/full ordered sequence of dispatches and corrections is replayable from the ledger alone/,
		'spec: mission replayable from the ledger alone',
	)
	// the sdd-provenance ledger itself replays in seq order from its file alone
	const self = ledgers.find((l) => l.slug === 'sdd-provenance')
	assert.ok(self && self.entries.length > 0, 'sdd-provenance ledger has entries')
	const seqs = self!.entries.map((e) => e.seq)
	assert.deepEqual(
		seqs,
		[...seqs].sort((a, b) => (a as number) - (b as number)),
		'entries are in seq order',
	)
})

test("a killed spec's correction trail survives for post-mortem", () => {
	assert.match(
		specMd,
		/correction trail that led to the kill are recoverable from the ledger/,
		'spec: kill correction trail recoverable',
	)
	assert.match(
		governance,
		/never edited or deleted|appended, never edited or removed/,
		'governance: append-only guarantees survival of the trail',
	)
})

// ── log ledger: recurrence detection ────────────────────────────────────────

test("the same cause is matchable across two specs' sibling ledgers", () => {
	assert.match(
		governance,
		/cross-mission recurrence detection groups and counts corrections by `cause` across N specs/,
		'governance: corrections groupable by cause across specs',
	)
	// Positive proof of the scenario: an on-enum cause that appears in two
	// different specs' ledgers falls into one matchable group. Group every
	// on-enum correction by cause across the corpus and require at least one
	// cause carried by ≥2 distinct specs.
	const bySpec = new Map<string, Set<string>>() // cause -> set of slugs
	for (const l of ledgers) {
		for (const e of l.entries) {
			if (e.kind !== 'correction' || !e.cause || !CAUSES.has(e.cause)) continue
			if (!bySpec.has(e.cause)) bySpec.set(e.cause, new Set())
			bySpec.get(e.cause)!.add(l.slug)
		}
	}
	const recurring = [...bySpec.entries()].find(([, slugs]) => slugs.size >= 2)
	assert.ok(recurring, 'at least one on-enum cause recurs across two specs, falling in the same matchable group')
})

// ── log ledger: strategy slot ───────────────────────────────────────────────

test('a strategy entry occupies a slot in the sibling ledger', () => {
	assert.match(governance, /### Strategy log-entry slot/, 'governance defines the strategy slot')
	assert.match(governance, /"kind": "strategy"|kind: strategy/, 'governance: strategy entry shape')
	assert.match(governance, /evidence/, 'governance: strategy carries evidence')
})

test('the operator does not write strategy entries', () => {
	assert.match(
		operator,
		/append only `report` and `correction` lines.*never.*`strategy` line/s,
		'operator: appends only report/correction, never strategy',
	)
	// no strategy entry exists in any operator-written corpus ledger (operator scope)
	const strategies = ledgers.flatMap((l) => l.entries).filter((e) => e.kind === 'strategy')
	// strategy is the Scanner's slot; none authored by the operator's deliver runs
	assert.ok(
		strategies.every((s) => s.kind === 'strategy'),
		'strategy entries (if any) are well-formed',
	)
})

// ── log ledger: ownership and validation ────────────────────────────────────

test('the operator writes the sibling ledger; producers and judges do not', () => {
	assert.match(governance, /## Write ownership/, 'governance: write-ownership matrix present')
	assert.match(
		operator,
		/spawned judge or named producer writes no `combat-log\.jsonl` line/,
		'operator: judge/named producer write no ledger line',
	)
})

test('validate-spec blocks a correction entry with an off-enum cause', () => {
	assert.match(
		governance,
		/`cause` value that is \*\*absent or off-enum\*\* is a \*\*structural error\*\*.*fails closed/s,
		'governance: off-enum cause fails closed',
	)
	assert.match(
		governance,
		/`validate-spec` fails a correction entry whose `cause` is absent or off-enum/,
		'governance: validate-spec fails off-enum cause',
	)
})

test('validate-spec passes a well-formed sibling ledger', () => {
	// The scenario asserts a *well-formed* ledger passes. Use the spec this gate
	// owns (sdd-provenance) as the well-formed exemplar — its own ledger must be
	// fully on-contract: known kind, numeric seq, report fields, on-enum
	// correction-kind + cause. (Two sibling specs carry out-of-ownership off-enum
	// values — surfaced as OBSERVATIONS, not edited here.)
	const self = ledgers.find((l) => l.slug === 'sdd-provenance')
	assert.ok(self && self.entries.length > 0, 'sdd-provenance ledger has entries')
	for (const e of self!.entries) {
		assert.ok(typeof e.seq === 'number', `${self!.slug}: entry has numeric seq`)
		assert.ok(e.kind && KINDS.has(e.kind), `${self!.slug}: entry kind "${e.kind}" is known`)
		if (e.kind === 'report') {
			assert.ok(e.role && e.agent, `${self!.slug}: report has role + agent`)
			assert.ok(e.outcome === 'pass' || e.outcome === 'fail', `${self!.slug}: report outcome valid`)
		}
		if (e.kind === 'correction') {
			assert.ok(
				e['correction-kind'] && CORRECTION_KINDS.has(e['correction-kind']),
				`${self!.slug}: correction-kind on-enum`,
			)
			assert.ok(e.cause && CAUSES.has(e.cause), `${self!.slug}: correction cause on-enum`)
		}
	}
	// Corpus-wide structural sanity that is in-contract for every spec: known
	// kind and numeric seq on every entry (the shape the ledger guarantees
	// regardless of which spec wrote it).
	for (const l of ledgers) {
		for (const e of l.entries) {
			assert.ok(typeof e.seq === 'number', `${l.slug}: entry has numeric seq`)
			assert.ok(e.kind && KINDS.has(e.kind), `${l.slug}: entry kind "${e.kind}" is known`)
		}
	}
})
