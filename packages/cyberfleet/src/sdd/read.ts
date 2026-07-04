// A thin, no-deps, read-only reader over SDD's durable state (ledger shards, plan briefs, spec
// frontmatter). SDD's own `.mts` engines (plugins/sdd/skills/*/scripts/*.mts) are internal to the
// sdd plugin and NOT importable from here — this module independently re-implements the small
// slice of glob/parse logic cyberfleet's `missions` query needs (see check-spec-state.mts's
// readLedgerText/parseLedgerGates and discover-plans.mts's frontmatter parse for the reference
// shapes this mirrors). Every function here is defensive: a repo with no `.agents/` at all (e.g.
// cyberfleet used standalone, outside any SDD-governed project) must yield nulls/empties, never
// throw.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** A durable `gate` ledger line for one CR — see sdd:combat-log-governance. */
export interface GateLine {
	gate: 'spec' | 'impl'
	verdict: string
	/** A human name (ratified) or the literal `"agent"` (self-asserted, provisional). */
	by: string
}

/** The conductor's run-start `leash` ledger line for one CR — see sdd:combat-log-governance. */
export interface LeashLine {
	leash: string
	by: string
}

interface RawLedgerLine {
	project: string
	kind?: string
	cr?: string
	gate?: string
	verdict?: string
	by?: string
	leash?: string
}

/** One project's ledger location: a `ledger/` shard dir and/or a legacy `ledger.jsonl`, both
 * siblings of that project's `spec.md`. */
interface ProjectLedgerLocation {
	/** The project name (a `.agents/specs/<project>` folder name, or `"repo"` for the single-project
	 * convention `.agents/spec`). */
	project: string
	dir: string
}

/**
 * Locate every project's ledger sibling dir under the three SDD spec conventions this reader
 * supports: `.agents/specs/<project>/` (multi-project) and `.agents/spec/` (single-project, named
 * `"repo"`). Never throws; an absent `.agents/specs` or `.agents/spec` simply contributes nothing.
 */
function discoverProjectLedgerLocations(agentsRoot: string): ProjectLedgerLocation[] {
	const out: ProjectLedgerLocation[] = []
	const specsDir = join(agentsRoot, '.agents', 'specs')
	if (existsSync(specsDir)) {
		try {
			for (const e of readdirSync(specsDir, { withFileTypes: true })) {
				if (e.isDirectory()) out.push({ project: e.name, dir: join(specsDir, e.name) })
			}
		} catch {
			// unreadable dir — contribute nothing, never throw
		}
	}
	const singleDir = join(agentsRoot, '.agents', 'spec')
	if (existsSync(singleDir)) out.push({ project: 'repo', dir: singleDir })
	return out
}

function parseJsonlFile(file: string, project: string): RawLedgerLine[] {
	let text: string
	try {
		text = readFileSync(file, 'utf8')
	} catch {
		return []
	}
	const lines: RawLedgerLine[] = []
	for (const raw of text.split('\n')) {
		const s = raw.trim()
		if (!s) continue
		try {
			lines.push({ project, ...JSON.parse(s) })
		} catch {
			// malformed line — skip, integrity is a separate concern (mirrors check-spec-state.mts)
		}
	}
	return lines
}

/**
 * Glob every ledger line across every discovered project: `<project>/ledger/*.jsonl` (ADR-0020
 * shards, sorted for stable but not authoritative-across-shards order) plus each project's
 * legacy single-file `<project>/ledger.jsonl` (pre-shard corpora, ADR-0020's tolerated legacy
 * form). Never throws.
 */
function readAllLedgerLines(agentsRoot: string): RawLedgerLine[] {
	const out: RawLedgerLine[] = []
	for (const { project, dir } of discoverProjectLedgerLocations(agentsRoot)) {
		const legacy = join(dir, 'ledger.jsonl')
		if (existsSync(legacy)) out.push(...parseJsonlFile(legacy, project))
		const shardsDir = join(dir, 'ledger')
		if (!existsSync(shardsDir)) continue
		let files: string[] = []
		try {
			files = readdirSync(shardsDir).filter((f) => f.endsWith('.jsonl'))
		} catch {
			files = []
		}
		for (const f of files.sort()) out.push(...parseJsonlFile(join(shardsDir, f), project))
	}
	return out
}

export interface SddLedgerState {
	/** The project this CR's ledger lines were found under, or null when none were found. */
	project: string | null
	/** The latest line per gate — "latest" meaning last-encountered in this reader's stable-but-
	 * cosmetic shard read order (ledger `seq` is per-shard, not a global order — see
	 * combat-log-governance); good enough for a query view, not a legality proof. */
	gates: { spec: GateLine | null; impl: GateLine | null }
	/** The run-start leash block, or null when none was recorded for this CR. */
	leash: LeashLine | null
}

/** Read the latest `gate`/`leash` ledger lines for one CR ref across every discovered project. */
export function readLedgerState(agentsRoot: string, cr: string): SddLedgerState {
	const lines = readAllLedgerLines(agentsRoot).filter((l) => l.cr === cr)
	const gates: { spec: GateLine | null; impl: GateLine | null } = { spec: null, impl: null }
	let leash: LeashLine | null = null
	let project: string | null = null
	for (const l of lines) {
		project ??= l.project
		if (l.kind === 'gate' && (l.gate === 'spec' || l.gate === 'impl') && l.verdict && l.by) {
			gates[l.gate] = { gate: l.gate, verdict: l.verdict, by: l.by }
		} else if (l.kind === 'leash' && l.leash && l.by) {
			leash = { leash: l.leash, by: l.by }
		}
	}
	return { project, gates, leash }
}

/**
 * True when the CR's combat log (`.agents/plans/<cr>.log.jsonl`, sibling to its plan brief) has
 * any `halt` line — a mid-flight stop not at a gate (see combat-log-governance). The combat log
 * may be absent even for a real mission (not every mission writes one); absence is not an error.
 */
export function hasHalt(agentsRoot: string, cr: string): boolean {
	const file = join(agentsRoot, '.agents', 'plans', `${cr}.log.jsonl`)
	if (!existsSync(file)) return false
	let text: string
	try {
		text = readFileSync(file, 'utf8')
	} catch {
		return false
	}
	for (const raw of text.split('\n')) {
		const s = raw.trim()
		if (!s) continue
		try {
			if (JSON.parse(s).kind === 'halt') return true
		} catch {
			// skip malformed line
		}
	}
	return false
}

export interface PlanBrief {
	/** The mission dispatch flag — the plan's top-level `status` (`active` when unset). */
	status: string
	total: number
	completed: number
	/** The `## NEXT` resume anchor's first content line, or '' when absent. */
	next: string
}

/** The first content line of the `## NEXT` resume anchor, or '' when there is none. */
function nextLead(text: string): string {
	const lines = text.split('\n')
	const i = lines.findIndex((l) => /^##\s+NEXT\b/i.test(l.trim()))
	if (i === -1) return ''
	for (let j = i + 1; j < lines.length; j++) {
		const l = lines[j].replace(/\r$/, '').trim()
		if (l === '') continue
		if (l.startsWith('#')) return '' // next heading, no content in between
		return l
			.replace(/^[-*]\s+/, '')
			.replace(/\*\*/g, '')
			.trim()
	}
	return ''
}

function unquote(v: string): string {
	return v.replace(/^["']|["']$/g, '')
}

/**
 * Parse `.agents/plans/<cr>.plan.md`'s frontmatter (dispatch `status` + the `todos:` tally) plus
 * its `## NEXT` lead line. Returns null when the plan brief is absent or has no frontmatter block
 * (mirrors discover-plans.mts: a `*.plan.md` with no frontmatter is a stray, not a brief).
 */
export function readPlanBrief(agentsRoot: string, cr: string): PlanBrief | null {
	const file = join(agentsRoot, '.agents', 'plans', `${cr}.plan.md`)
	if (!existsSync(file)) return null
	let text: string
	try {
		text = readFileSync(file, 'utf8')
	} catch {
		return null
	}
	const m = /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(text)
	if (!m) return null
	let status = 'active'
	let total = 0
	let completed = 0
	let inTodos = false
	for (const raw of m[1].split('\n')) {
		const line = raw.replace(/\r$/, '')
		if (line.trim() === '' || line.trim().startsWith('#')) continue
		const indent = line.length - line.trimStart().length
		const trimmed = line.trim()
		if (indent === 0) {
			inTodos = false
			const [key, ...rest] = trimmed.split(':')
			const value = unquote(rest.join(':').trim())
			if (key === 'status' && value !== '') status = value
			else if (key === 'todos') inTodos = true
			continue
		}
		if (inTodos) {
			const sm = /^(?:-\s+)?status:\s*(.+)$/.exec(trimmed)
			if (sm) {
				total++
				if (unquote(sm[1].trim()) === 'completed') completed++
			}
		}
	}
	return { status, total, completed, next: nextLead(text) }
}

/**
 * Parse one project's `spec.md` frontmatter `status` only (never the body). Tries the multi-
 * project convention (`.agents/specs/<project>/spec.md`) first, falling back to the single-
 * project convention (`.agents/spec/spec.md`, used when `project` is `"repo"` or unresolved).
 * Returns null when neither exists or the frontmatter has no `status`.
 */
export function readSpecStatus(agentsRoot: string, project: string): string | null {
	const candidates =
		project === 'repo'
			? [join(agentsRoot, '.agents', 'spec', 'spec.md')]
			: [join(agentsRoot, '.agents', 'specs', project, 'spec.md')]
	for (const file of candidates) {
		if (!existsSync(file)) continue
		let text: string
		try {
			text = readFileSync(file, 'utf8')
		} catch {
			continue
		}
		const m = /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(text)
		if (!m) continue
		for (const raw of m[1].split('\n')) {
			const line = raw.replace(/\r$/, '')
			if (line.length - line.trimStart().length !== 0) continue
			const [key, ...rest] = line.trim().split(':')
			if (key === 'status') {
				const value = unquote(rest.join(':').trim())
				return value === '' ? null : value
			}
		}
	}
	return null
}
