import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
	buildLoadPlan,
	discoverProjectGovernances,
	type GovCandidate,
	main,
	matchPlugin,
	migrateEntry,
	parseGovernanceFrontmatter,
	parseRegistry,
	type Registry,
	type RegistryEntry,
	resolveAgent,
	resolveBar,
	resolveRole,
	validateRegistry,
} from './governance-resolution.mts'

// ─── migrate-on-read ────────────────────────────────────────────────────────────

test('migrateEntry renames plan-producer to solution-producer', () => {
	const e = migrateEntry({
		name: 'x',
		domains: ['skill'],
		roles: { 'plan-producer': null, 'spec-judge': 'x-judge' } as RegistryEntry['roles'],
		governances: {},
	})
	assert.equal('plan-producer' in e.roles, false)
	assert.equal('solution-producer' in e.roles, true)
	assert.equal(e.roles['spec-judge'], 'x-judge')
})

test('migrateEntry keeps an existing solution-producer over a legacy plan-producer', () => {
	const e = migrateEntry({
		name: 'x',
		domains: [],
		roles: { 'plan-producer': 'old', 'solution-producer': 'new' } as RegistryEntry['roles'],
		governances: {},
	})
	assert.equal(e.roles['solution-producer'], 'new')
})

test('migrateEntry expands flat governances to the Model-B keys', () => {
	const e = migrateEntry({
		name: 'x',
		domains: [],
		roles: {},
		governances: { director: 'd', builder: 'b', architect: null } as RegistryEntry['governances'],
	})
	assert.deepEqual(e.governances, {
		'director-spec': 'd',
		'builder-spec': 'b',
		'builder-impl': 'b',
		'architect-spec': null,
		'architect-impl': null,
	})
})

test('migrateEntry leaves an already-Model-B entry unchanged', () => {
	const g = {
		'director-spec': null,
		'builder-spec': 'b',
		'builder-impl': null,
		'architect-spec': null,
		'architect-impl': null,
	}
	const e = migrateEntry({ name: 'x', domains: [], roles: {}, governances: { ...g } })
	assert.deepEqual(e.governances, g)
})

test('parseRegistry parses and migrates every entry', () => {
	const text = JSON.stringify({
		'sdd-plugins': [
			{ name: 'aces', domains: ['skill'], roles: { 'plan-producer': null }, governances: { director: null } },
		],
	})
	const r = parseRegistry(text)
	assert.equal('solution-producer' in r['sdd-plugins'][0].roles, true)
	assert.equal('director-spec' in r['sdd-plugins'][0].governances, true)
})

test('parseRegistry throws on malformed JSON', () => {
	assert.throws(() => parseRegistry('{ not json'), /not valid JSON/)
})

test('parseRegistry throws when sdd-plugins is missing', () => {
	assert.throws(() => parseRegistry('{}'), /no sdd-plugins/)
})

// ─── governance frontmatter ──────────────────────────────────────────────────────

test('parseGovernanceFrontmatter reads actor, gate, compose', () => {
	const text = [
		'---',
		'name: x',
		'metadata:',
		'  actor: director',
		'  gate: spec',
		'  compose: replace',
		'---',
		'# x',
	].join('\n')
	assert.deepEqual(parseGovernanceFrontmatter(text), {
		artifactType: null,
		actor: 'director',
		gate: 'spec',
		compose: 'replace',
	})
})

test('parseGovernanceFrontmatter defaults compose to union and reads artifact-type', () => {
	const text = ['---', 'metadata:', '  artifact-type: skill', '  actor: builder', '  gate: impl', '---'].join('\n')
	assert.deepEqual(parseGovernanceFrontmatter(text), {
		artifactType: 'skill',
		actor: 'builder',
		gate: 'impl',
		compose: 'union',
	})
})

test('parseGovernanceFrontmatter returns null without an actor/gate', () => {
	const text = ['---', 'name: x', 'metadata:', '  internal: true', '---'].join('\n')
	assert.equal(parseGovernanceFrontmatter(text), null)
})

// ─── plugin matching ─────────────────────────────────────────────────────────────

const REG: Registry = {
	'sdd-plugins': [
		{ name: 'aces', domains: ['skill', 'command'], roles: { 'spec-judge': 'aces-spec-validator' }, governances: {} },
		{ name: 'quill', domains: ['guide'], roles: {}, governances: {} },
	],
}

test('matchPlugin returns the single matching plugin', () => {
	const { entry, ambiguous } = matchPlugin(REG, 'skill')
	assert.equal(entry?.name, 'aces')
	assert.equal(ambiguous.length, 0)
})

test('matchPlugin returns no entry for an unmatched artifact-type', () => {
	const { entry, ambiguous } = matchPlugin(REG, 'unknown')
	assert.equal(entry, null)
	assert.equal(ambiguous.length, 0)
})

test('matchPlugin returns no entry for a null artifact-type', () => {
	assert.equal(matchPlugin(REG, null).entry, null)
})

test('matchPlugin flags two plugins claiming the same artifact-type', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{ name: 'a', domains: ['skill'], roles: {}, governances: {} },
			{ name: 'b', domains: ['skill'], roles: {}, governances: {} },
		],
	}
	const { entry, ambiguous } = matchPlugin(reg, 'skill')
	assert.equal(entry, null)
	assert.deepEqual(
		ambiguous.map((p) => p.name),
		['a', 'b'],
	)
})

// ─── resolveBar — precedence + compose ──────────────────────────────────────────

test('resolveBar floors to the sdd default when nothing overrides', () => {
	const plan = resolveBar(null, 'director', 'spec', { entry: null, projectGovs: [] })
	assert.equal(plan.key, 'director-spec')
	assert.deepEqual(plan.instructions, [
		{ source: 'sdd', kind: 'harness-load', ref: 'sdd:director-spec-governance', compose: 'union' },
	])
})

test('resolveBar unions project > plugin > sdd', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/d.md', artifactType: null, actor: 'director', gate: 'spec', compose: 'union' },
	]
	const entry: RegistryEntry = {
		name: 'aces',
		domains: ['skill'],
		roles: {},
		governances: { 'director-spec': 'aces-dir' },
	}
	const plan = resolveBar('skill', 'director', 'spec', { entry, projectGovs })
	assert.deepEqual(
		plan.instructions.map((i) => i.source),
		['project', 'plugin', 'sdd'],
	)
	assert.equal(plan.instructions[1].ref, 'aces:aces-dir')
})

test('resolveBar — a project replace supersedes plugin and sdd', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/d.md', artifactType: null, actor: 'director', gate: 'spec', compose: 'replace' },
	]
	const entry: RegistryEntry = {
		name: 'aces',
		domains: ['skill'],
		roles: {},
		governances: { 'director-spec': 'aces-dir' },
	}
	const plan = resolveBar('skill', 'director', 'spec', { entry, projectGovs })
	assert.deepEqual(
		plan.instructions.map((i) => i.source),
		['project'],
	)
})

test('resolveBar ranks an artifact-type-specific project bar above a typeless one', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/typeless.md', artifactType: null, actor: 'builder', gate: 'spec', compose: 'union' },
		{ path: '.agents/governances/typed.md', artifactType: 'skill', actor: 'builder', gate: 'spec', compose: 'union' },
	]
	const plan = resolveBar('skill', 'builder', 'spec', { entry: null, projectGovs })
	assert.equal(plan.instructions[0].ref, '.agents/governances/typed.md')
	assert.equal(plan.instructions[1].ref, '.agents/governances/typeless.md')
})

test('resolveBar ignores a project bar for a different gate', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/d.md', artifactType: null, actor: 'builder', gate: 'impl', compose: 'union' },
	]
	const plan = resolveBar('skill', 'builder', 'spec', { entry: null, projectGovs })
	assert.deepEqual(
		plan.instructions.map((i) => i.source),
		['sdd'],
	)
})

// ─── resolveAgent ────────────────────────────────────────────────────────────────

test('resolveAgent returns the SDD default agent when no plugin matches', () => {
	assert.deepEqual(resolveAgent('spec-judge', null), { source: 'sdd', ref: 'sdd-spec-judge' })
	assert.deepEqual(resolveAgent('spec-producer', null), { source: 'sdd', ref: null })
})

test('resolveAgent uses a named plugin delegate', () => {
	const entry: RegistryEntry = {
		name: 'aces',
		domains: ['skill'],
		roles: { 'spec-judge': 'aces-spec-validator' },
		governances: {},
	}
	assert.deepEqual(resolveAgent('spec-judge', entry), { source: 'plugin', ref: 'aces-spec-validator' })
})

test('resolveAgent treats an explicit null role as the SDD default', () => {
	const entry: RegistryEntry = { name: 'aces', domains: ['skill'], roles: { 'impl-judge': null }, governances: {} }
	assert.deepEqual(resolveAgent('impl-judge', entry), { source: 'sdd', ref: 'sdd-implementer' })
})

test('resolveAgent falls back to the <plugin>-<role> convention for a missing role key', () => {
	const entry: RegistryEntry = { name: 'quill', domains: ['guide'], roles: {}, governances: {} }
	assert.deepEqual(resolveAgent('impl-producer', entry), { source: 'plugin', ref: 'quill-impl-producer' })
})

// ─── resolveRole — fixed + bars per the contract ────────────────────────────────

test('resolveRole gives the spec-judge its fixed-universal + three -spec bars', () => {
	const plan = resolveRole('spec-judge', null, { entry: null, projectGovs: [] })
	assert.deepEqual(
		plan.fixed.map((i) => i.ref),
		[
			'sdd:spec-format-governance',
			'sdd:suite-format-governance',
			'sdd:lifecycle-governance',
			'sdd:gate-validation-governance',
		],
	)
	assert.deepEqual(
		plan.bars.map((b) => b.key),
		['director-spec', 'builder-spec', 'architect-spec'],
	)
})

test('resolveRole gives the impl-judge the builder/architect impl bars', () => {
	const plan = resolveRole('impl-judge', null, { entry: null, projectGovs: [] })
	assert.deepEqual(
		plan.bars.map((b) => b.key),
		['builder-impl', 'architect-impl'],
	)
})

// ─── buildLoadPlan ───────────────────────────────────────────────────────────────

test('buildLoadPlan resolves all five roles to SDD defaults for a typeless spec', () => {
	const plan = buildLoadPlan(null, REG, [])
	assert.equal(plan.status, 'complete')
	assert.equal(plan.plugin, null)
	assert.deepEqual(
		plan.roles.map((r) => r.role),
		['spec-producer', 'solution-producer', 'spec-judge', 'impl-producer', 'impl-judge'],
	)
})

test('buildLoadPlan binds the matched plugin', () => {
	const plan = buildLoadPlan('skill', REG, [])
	assert.equal(plan.plugin, 'aces')
	const judge = plan.roles.find((r) => r.role === 'spec-judge')
	assert.deepEqual(judge?.agent, { source: 'plugin', ref: 'aces-spec-validator' })
})

test('buildLoadPlan returns needs-input on an ambiguous artifact-type', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{ name: 'a', domains: ['skill'], roles: {}, governances: {} },
			{ name: 'b', domains: ['skill'], roles: {}, governances: {} },
		],
	}
	const plan = buildLoadPlan('skill', reg, [])
	assert.equal(plan.status, 'needs-input')
	assert.deepEqual(plan.ambiguous, ['a', 'b'])
	assert.equal(plan.roles.length, 0)
})

// ─── validateRegistry ───────────────────────────────────────────────────────────

test('validateRegistry passes a clean registry', () => {
	assert.deepEqual(validateRegistry(REG), [])
})

test('validateRegistry flags an unknown role key', () => {
	const reg: Registry = {
		'sdd-plugins': [{ name: 'x', domains: [], roles: { bogus: null } as RegistryEntry['roles'], governances: {} }],
	}
	assert.ok(validateRegistry(reg).some((m) => /unknown role key "bogus"/.test(m)))
})

test('validateRegistry flags an unknown governance key', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{ name: 'x', domains: [], roles: {}, governances: { director: null } as RegistryEntry['governances'] },
		],
	}
	assert.ok(validateRegistry(reg).some((m) => /unknown governance key "director"/.test(m)))
})

test('validateRegistry flags a domain claimed by two plugins', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{ name: 'a', domains: ['skill'], roles: {}, governances: {} },
			{ name: 'b', domains: ['skill'], roles: {}, governances: {} },
		],
	}
	assert.ok(validateRegistry(reg).some((m) => /claimed by 2 plugins/.test(m)))
})

// ─── discoverProjectGovernances + main ──────────────────────────────────────────

test('discoverProjectGovernances reads bar files and skips non-bars', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		mkdirSync(join(root, '.agents', 'governances'), { recursive: true })
		writeFileSync(
			join(root, '.agents', 'governances', 'bar.md'),
			['---', 'metadata:', '  actor: director', '  gate: spec', '---', '# bar'].join('\n'),
		)
		writeFileSync(join(root, '.agents', 'governances', 'notes.md'), '# just notes, no frontmatter')
		const found = discoverProjectGovernances(root)
		assert.equal(found.length, 1)
		assert.equal(found[0].actor, 'director')
		assert.equal(found[0].path, join('.agents', 'governances', 'bar.md'))
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})

test('main validates the registry and returns 0 (no artifact-type)', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		mkdirSync(join(root, '.agents'), { recursive: true })
		writeFileSync(join(root, '.agents', 'universal-plugin.json'), JSON.stringify(REG))
		assert.equal(main(['--root', root]), 0)
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})

test('main returns 1 on a malformed registry', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		mkdirSync(join(root, '.agents'), { recursive: true })
		writeFileSync(join(root, '.agents', 'universal-plugin.json'), '{ not json')
		assert.equal(main(['--root', root]), 1)
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})

test('main treats a missing registry as zero plugins (legal)', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		assert.equal(main(['--root', root]), 0)
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})
