#!/usr/bin/env node
// Deterministic governance resolution for SDD production-chain roles. Discovers
// the bar candidates across sources (project governances, specialist plugins, the
// sdd defaults), matches each by metadata{artifact-type, actor, gate}, applies
// precedence, and emits the per-role LOAD/COMPOSE plan the conductor executes
// (direct-read for project files, harness-load for <plugin>:<name> / sdd:<name>
// skills). The conductor never hand-enumerates — it runs this and executes the
// plan. See design/governance-resolution.md (the rule side) and
// plugin-contract-governance (the registry shape + the per-role loadout).
//
// --root here is the PROJECT ROOT (default "."), from which the registry
// `.agents/universal-plugin.json` and project governances `.agents/governances/`
// are derived — NOT the specs dir that the sibling check-spec-state.mts takes.
//
// MVP scope: single project + plugin + sdd. Nested-project anchor union
// (inner > outer across several `.agents/governances/` anchors) is a documented
// follow-up — resolveBar already orders the project candidates inner-first.
//
// Pure functions are exported for node:test; running the file directly drives the
// CLI. No dependencies — plain node strips the types.

import { type Dirent, existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// ─── the closed sets ───────────────────────────────────────────────────────────

export const ROLE_KEYS = ['spec-producer', 'solution-producer', 'spec-judge', 'impl-producer', 'impl-judge'] as const
export type RoleKey = (typeof ROLE_KEYS)[number]

export const BAR_KEYS = ['director-spec', 'builder-spec', 'builder-impl', 'architect-spec', 'architect-impl'] as const
export type BarKey = (typeof BAR_KEYS)[number]

export const ACTORS = ['director', 'builder', 'architect'] as const
export const GATES = ['spec', 'impl'] as const

// The fixed-universal bars + the resolved-actor bars each role loads
// (plugin-contract-governance "Which governances each role loads"). `fixed` names
// load as sdd:<name>-governance; `bars` resolve across sources.
export const ROLE_LOADOUT: Record<RoleKey, { fixed: string[]; bars: BarKey[] }> = {
	'spec-producer': { fixed: ['spec-format', 'suite-format', 'ownership'], bars: ['director-spec', 'builder-spec'] },
	'solution-producer': { fixed: ['ownership'], bars: ['architect-spec'] },
	'spec-judge': {
		fixed: ['spec-format', 'suite-format', 'lifecycle', 'gate-validation'],
		bars: ['director-spec', 'builder-spec', 'architect-spec'],
	},
	'impl-producer': { fixed: ['ownership'], bars: ['builder-impl', 'architect-impl'] },
	'impl-judge': { fixed: ['ownership', 'gate-validation'], bars: ['builder-impl', 'architect-impl'] },
}

// The SDD-default agent per role. A null ref means the conductor runs the role
// INLINE in the main session (spec/solution-producer) or via a generic spawned
// builder (impl-producer); both are recorded produced-by sdd:automaton. The two
// judges are spawned cold by name.
export const SDD_DEFAULT_AGENT: Record<RoleKey, string | null> = {
	'spec-producer': null,
	'solution-producer': null,
	'spec-judge': 'sdd-spec-judge',
	'impl-producer': null,
	'impl-judge': 'sdd-implementer',
}

// ─── types ──────────────────────────────────────────────────────────────────────

export interface RegistryEntry {
	name: string
	version?: string
	domains: string[]
	roles: Partial<Record<RoleKey, string | null>>
	governances: Partial<Record<BarKey, string | null>>
}

export interface Registry {
	'sdd-plugins': RegistryEntry[]
}

export interface GovMetadata {
	artifactType: string | null
	actor: string | null
	gate: string | null
	compose: 'union' | 'replace'
}

export interface GovCandidate extends GovMetadata {
	path: string // root-relative file path (direct-read ref)
}

export type Source = 'project' | 'plugin' | 'sdd'

export interface LoadInstruction {
	source: Source
	kind: 'direct-read' | 'harness-load'
	ref: string // a file path (project) or <plugin>:<name> / sdd:<name> (harness)
	compose: 'union' | 'replace'
}

export interface BarPlan {
	key: BarKey
	instructions: LoadInstruction[]
}

export interface AgentResolution {
	source: 'plugin' | 'sdd'
	ref: string | null // agent name; null = inline (producer) / generic builder (impl-producer)
}

export interface RolePlan {
	role: RoleKey
	agent: AgentResolution
	fixed: LoadInstruction[]
	bars: BarPlan[]
}

export interface LoadPlan {
	artifactType: string | null
	status: 'complete' | 'needs-input'
	plugin: string | null
	ambiguous: string[] // plugin names, when status is needs-input
	roles: RolePlan[]
}

// ─── registry parse + migrate-on-read ───────────────────────────────────────────

// Rename the legacy plan-producer role key to solution-producer and expand the
// flat governances{director,builder,architect} to the Model-B (actor,gate) keys.
// A live registry still on the legacy shape is migrated on encounter
// (plugin-contract-governance).
export function migrateEntry(entry: RegistryEntry): RegistryEntry {
	const roles: Partial<Record<RoleKey, string | null>> = { ...entry.roles }
	if ('plan-producer' in (entry.roles as Record<string, string | null>)) {
		const legacy = (entry.roles as Record<string, string | null>)['plan-producer']
		if (!('solution-producer' in roles)) roles['solution-producer'] = legacy
		delete (roles as Record<string, string | null>)['plan-producer']
	}

	const g = (entry.governances ?? {}) as Record<string, string | null>
	const isLegacy = 'director' in g || 'builder' in g || 'architect' in g
	const governances: Partial<Record<BarKey, string | null>> = isLegacy
		? {
				'director-spec': g.director ?? null,
				'builder-spec': g.builder ?? null,
				'builder-impl': g.builder ?? null,
				'architect-spec': g.architect ?? null,
				'architect-impl': g.architect ?? null,
			}
		: { ...(entry.governances ?? {}) }

	return { ...entry, roles, governances }
}

export function parseRegistry(text: string): Registry {
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch (e) {
		throw new Error(`registry is not valid JSON: ${(e as Error).message}`)
	}
	if (!raw || typeof raw !== 'object' || !Array.isArray((raw as Registry)['sdd-plugins']))
		throw new Error('registry has no sdd-plugins array')
	const entries = (raw as Registry)['sdd-plugins'].map(migrateEntry)
	return { 'sdd-plugins': entries }
}

// A project anchor with no registry resolves to all-SDD-defaults — a missing file
// is legal, not an error.
export function loadRegistry(root: string): Registry {
	const path = join(root, '.agents', 'universal-plugin.json')
	if (!existsSync(path)) return { 'sdd-plugins': [] }
	return parseRegistry(readFileSync(path, 'utf8'))
}

// ─── project governance discovery ───────────────────────────────────────────────

function frontmatter(text: string): string[] {
	const m = /^---\n([\s\S]*?)\n---/.exec(text)
	return m ? m[1].split('\n') : []
}

const unquote = (s: string) => s.trim().replace(/^["']|["']$/g, '')

// Read metadata{artifact-type?, actor, gate, compose} from a governance file's
// frontmatter. Returns null when there is no metadata block with an actor+gate —
// a plain doc that is not a resolvable bar.
export function parseGovernanceFrontmatter(text: string): GovMetadata | null {
	const lines = frontmatter(text)
	let inMeta = false
	let artifactType: string | null = null
	let actor: string | null = null
	let gate: string | null = null
	let compose: 'union' | 'replace' = 'union'

	for (const line of lines) {
		if (/^metadata:\s*$/.test(line)) {
			inMeta = true
			continue
		}
		if (inMeta && /^\S/.test(line)) inMeta = false // dedent ends the block
		if (!inMeta) continue
		const at = /^\s+artifact-type:\s*(.+)$/.exec(line)
		if (at) artifactType = unquote(at[1])
		const ac = /^\s+actor:\s*(.+)$/.exec(line)
		if (ac) actor = unquote(ac[1])
		const ga = /^\s+gate:\s*(.+)$/.exec(line)
		if (ga) gate = unquote(ga[1])
		const co = /^\s+compose:\s*(.+)$/.exec(line)
		if (co) compose = unquote(co[1]) === 'replace' ? 'replace' : 'union'
	}

	if (!actor || !gate) return null
	return { artifactType, actor, gate, compose }
}

// Discover project governance candidates under <root>/.agents/governances/ (flat;
// nested-project anchor union is a follow-up). Both .md and SKILL.md are read in
// place — no build.
export function discoverProjectGovernances(root: string): GovCandidate[] {
	const dir = join(root, '.agents', 'governances')
	let entries: Dirent[]
	try {
		entries = readdirSync(dir, { withFileTypes: true })
	} catch {
		return []
	}
	const out: GovCandidate[] = []
	for (const e of entries) {
		if (!e.isFile() || !e.name.endsWith('.md')) continue
		const meta = parseGovernanceFrontmatter(readFileSync(join(dir, e.name), 'utf8'))
		if (meta) out.push({ ...meta, path: join('.agents', 'governances', e.name) })
	}
	return out
}

// ─── plugin matching ────────────────────────────────────────────────────────────

// Match an artifact-type against each plugin's domains[]. Zero matches → all SDD
// defaults; one → that plugin; two or more → ambiguous (the conductor consults
// produced-by or asks).
export function matchPlugin(
	registry: Registry,
	artifactType: string | null,
): { entry: RegistryEntry | null; ambiguous: RegistryEntry[] } {
	if (!artifactType) return { entry: null, ambiguous: [] }
	const matches = registry['sdd-plugins'].filter((p) => p.domains?.includes(artifactType))
	if (matches.length === 0) return { entry: null, ambiguous: [] }
	if (matches.length === 1) return { entry: matches[0], ambiguous: [] }
	return { entry: null, ambiguous: matches }
}

// ─── bar resolution ─────────────────────────────────────────────────────────────

// Resolve one (actor, gate) bar across the three sources, most-specific first
// (project > plugin > sdd). compose: a `replace` candidate supersedes everything
// below it for the key; otherwise the bars union (the agent composes per
// precedence, most-specific wins on conflict).
export function resolveBar(
	artifactType: string | null,
	actor: string,
	gate: string,
	ctx: { entry: RegistryEntry | null; projectGovs: GovCandidate[] },
): BarPlan {
	const key = `${actor}-${gate}` as BarKey
	const candidates: LoadInstruction[] = []

	// project — artifact-type-specific candidates rank above typeless ones.
	const proj = ctx.projectGovs
		.filter((c) => c.actor === actor && c.gate === gate)
		.filter((c) => c.artifactType === artifactType || c.artifactType === null)
		.sort((a, b) => (a.artifactType === artifactType ? -1 : 0) - (b.artifactType === artifactType ? -1 : 0))
	for (const c of proj) candidates.push({ source: 'project', kind: 'direct-read', ref: c.path, compose: c.compose })

	// plugin — a named bar in the matched registry entry's governances map.
	const pluginBar = ctx.entry?.governances?.[key]
	if (ctx.entry && pluginBar)
		candidates.push({
			source: 'plugin',
			kind: 'harness-load',
			ref: `${ctx.entry.name}:${pluginBar}`,
			compose: 'union',
		})

	// sdd default — always exists by convention; lowest precedence.
	candidates.push({ source: 'sdd', kind: 'harness-load', ref: `sdd:${key}-governance`, compose: 'union' })

	// Apply replace-supersession walking most-specific → least.
	const instructions: LoadInstruction[] = []
	for (const c of candidates) {
		instructions.push(c)
		if (c.compose === 'replace') break
	}
	return { key, instructions }
}

// ─── role + plan resolution ─────────────────────────────────────────────────────

// Resolve the agent that runs a role: a named plugin delegate, the SDD default,
// or — for a present-but-missing role key — the <plugin>-<role> convention.
export function resolveAgent(role: RoleKey, entry: RegistryEntry | null): AgentResolution {
	if (!entry) return { source: 'sdd', ref: SDD_DEFAULT_AGENT[role] }
	if (role in entry.roles) {
		const named = entry.roles[role]
		if (named) return { source: 'plugin', ref: named }
		return { source: 'sdd', ref: SDD_DEFAULT_AGENT[role] } // explicit null = SDD default
	}
	return { source: 'plugin', ref: `${entry.name}-${role}` } // omitted = convention
}

export function resolveRole(
	role: RoleKey,
	artifactType: string | null,
	ctx: { entry: RegistryEntry | null; projectGovs: GovCandidate[] },
): RolePlan {
	const loadout = ROLE_LOADOUT[role]
	const fixed: LoadInstruction[] = loadout.fixed.map((name) => ({
		source: 'sdd',
		kind: 'harness-load',
		ref: `sdd:${name}-governance`,
		compose: 'union',
	}))
	const bars = loadout.bars.map((b) => {
		const [actor, gate] = b.split('-')
		return resolveBar(artifactType, actor, gate, ctx)
	})
	return { role, agent: resolveAgent(role, ctx.entry), fixed, bars }
}

export function buildLoadPlan(artifactType: string | null, registry: Registry, projectGovs: GovCandidate[]): LoadPlan {
	const { entry, ambiguous } = matchPlugin(registry, artifactType)
	if (ambiguous.length > 0)
		return {
			artifactType,
			status: 'needs-input',
			plugin: null,
			ambiguous: ambiguous.map((p) => p.name),
			roles: [],
		}
	const ctx = { entry, projectGovs }
	return {
		artifactType,
		status: 'complete',
		plugin: entry?.name ?? null,
		ambiguous: [],
		roles: ROLE_KEYS.map((r) => resolveRole(r, artifactType, ctx)),
	}
}

// ─── registry structural validation (the no-artifact-type CLI gate) ─────────────

// Validate the registry is well-formed and unambiguous: known role/governance
// keys, and no artifact-type claimed by two plugins (which would force every spec
// of that type into needs-input).
export function validateRegistry(registry: Registry): string[] {
	const v: string[] = []
	const domainOwners = new Map<string, string[]>()
	for (const entry of registry['sdd-plugins']) {
		const where = entry.name || '<unnamed plugin>'
		if (!entry.name) v.push('an sdd-plugins entry has no name')
		if (!Array.isArray(entry.domains)) v.push(`${where}: domains is not an array`)
		for (const r of Object.keys(entry.roles ?? {}))
			if (!ROLE_KEYS.includes(r as RoleKey)) v.push(`${where}: unknown role key "${r}"`)
		for (const k of Object.keys(entry.governances ?? {}))
			if (!BAR_KEYS.includes(k as BarKey)) v.push(`${where}: unknown governance key "${k}"`)
		for (const d of entry.domains ?? []) domainOwners.set(d, [...(domainOwners.get(d) ?? []), where])
	}
	for (const [domain, owners] of domainOwners)
		if (owners.length > 1)
			v.push(`artifact-type "${domain}" is claimed by ${owners.length} plugins (${owners.join(', ')}) — ambiguous`)
	return v
}

// ─── CLI entry ──────────────────────────────────────────────────────────────────

export function main(argv: string[]): number {
	const root = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : '.'
	const artifactType = argv.includes('--artifact-type') ? argv[argv.indexOf('--artifact-type') + 1] : null

	let registry: Registry
	try {
		registry = loadRegistry(root)
	} catch (e) {
		console.error(`✗ ${(e as Error).message}`)
		return 1
	}

	// No artifact-type → validate the registry is well-formed + unambiguous.
	if (!artifactType) {
		const violations = validateRegistry(registry)
		if (violations.length) {
			for (const line of violations) console.error(`✗ ${line}`)
			return 1
		}
		process.stdout.write('governance registry OK\n')
		return 0
	}

	// With an artifact-type → emit the resolution plan.
	const plan = buildLoadPlan(artifactType, registry, discoverProjectGovernances(root))
	process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`)
	if (plan.status === 'needs-input')
		console.error(`needs-input: artifact-type "${artifactType}" is claimed by ${plan.ambiguous.join(', ')}`)
	return 0
}

if (import.meta.main) process.exit(main(process.argv.slice(2)))
