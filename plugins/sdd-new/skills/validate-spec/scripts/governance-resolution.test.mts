import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
	buildLoadPlan,
	discoverProjectGovernances,
	type GovCandidate,
	loadArtifactTypeMap,
	main,
	matchSquad,
	migrateEntry,
	parseArtifactTypeMap,
	parseGovernanceFrontmatter,
	parseRegistry,
	type Registry,
	resolveAgent,
	resolveArtifactTypeFromMap,
	resolveBar,
	resolveRole,
	type Squad,
	type SquadMatch,
	validateRegistry,
} from './governance-resolution.mts'

// ─── migrate-on-read ────────────────────────────────────────────────────────────

test('migrateEntry folds a legacy flat entry into one squad', () => {
	const e = migrateEntry({ name: 'x', domains: ['skill', 'command'], roles: {}, governances: {} })
	assert.equal(e.squads.length, 1)
	assert.deepEqual(e.squads[0]['artifact-types'], ['skill', 'command'])
})

test('migrateEntry renames plan-producer to solution-producer', () => {
	const e = migrateEntry({
		name: 'x',
		domains: ['skill'],
		roles: { 'plan-producer': null, 'spec-judge': 'x-judge' },
		governances: {},
	})
	assert.equal('plan-producer' in e.squads[0].roles, false)
	assert.equal('solution-producer' in e.squads[0].roles, true)
	assert.equal(e.squads[0].roles['spec-judge'], 'x-judge')
})

test('migrateEntry keeps an existing solution-producer over a legacy plan-producer', () => {
	const e = migrateEntry({
		name: 'x',
		domains: [],
		roles: { 'plan-producer': 'old', 'solution-producer': 'new' },
		governances: {},
	})
	assert.equal(e.squads[0].roles['solution-producer'], 'new')
})

test('migrateEntry expands flat governances to the Model-B keys', () => {
	const e = migrateEntry({
		name: 'x',
		domains: [],
		roles: {},
		governances: { oracle: 'd', builder: 'b', architect: null },
	})
	assert.deepEqual(e.squads[0].governances, {
		'oracle-spec': 'd',
		'builder-spec': 'b',
		'builder-impl': 'b',
		'architect-spec': null,
		'architect-impl': null,
	})
})

test('migrateEntry leaves an already-squads entry unchanged in shape', () => {
	const g = {
		'oracle-spec': null,
		'builder-spec': 'b',
		'builder-impl': null,
		'architect-spec': null,
		'architect-impl': null,
	}
	const e = migrateEntry({
		name: 'x',
		squads: [{ 'artifact-types': ['skill'], roles: {}, governances: { ...g } }],
	})
	assert.equal(e.squads.length, 1)
	assert.deepEqual(e.squads[0].governances, g)
})

test('migrateEntry migrates per-squad roles and governances on a squads entry', () => {
	const e = migrateEntry({
		name: 'x',
		squads: [{ 'artifact-types': ['skill'], roles: { 'plan-producer': null }, governances: { oracle: 'd' } }],
	})
	assert.equal('solution-producer' in e.squads[0].roles, true)
	assert.equal('oracle-spec' in e.squads[0].governances, true)
})

test('parseRegistry parses and migrates every entry', () => {
	const text = JSON.stringify({
		'sdd-plugins': [
			{ name: 'aces', domains: ['skill'], roles: { 'plan-producer': null }, governances: { oracle: null } },
		],
	})
	const r = parseRegistry(text)
	assert.equal('solution-producer' in r['sdd-plugins'][0].squads[0].roles, true)
	assert.equal('oracle-spec' in r['sdd-plugins'][0].squads[0].governances, true)
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
		'  actor: oracle',
		'  gate: spec',
		'  compose: replace',
		'---',
		'# x',
	].join('\n')
	assert.deepEqual(parseGovernanceFrontmatter(text), {
		artifactType: null,
		actor: 'oracle',
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

// ─── squad matching ──────────────────────────────────────────────────────────────

const REG: Registry = {
	'sdd-plugins': [
		{
			name: 'aces',
			squads: [
				{ 'artifact-types': ['skill', 'command'], roles: { 'spec-judge': 'aces-spec-validator' }, governances: {} },
			],
		},
		{ name: 'quill', squads: [{ 'artifact-types': ['guide'], roles: {}, governances: {} }] },
	],
}

test('matchSquad returns the single matching squad', () => {
	const { match, ambiguous } = matchSquad(REG, 'skill')
	assert.equal(match?.plugin, 'aces')
	assert.deepEqual(match?.squad['artifact-types'], ['skill', 'command'])
	assert.equal(ambiguous.length, 0)
})

test('matchSquad returns no match for an unmatched artifact-type', () => {
	const { match, ambiguous } = matchSquad(REG, 'unknown')
	assert.equal(match, null)
	assert.equal(ambiguous.length, 0)
})

test('matchSquad returns no match for a null artifact-type', () => {
	assert.equal(matchSquad(REG, null).match, null)
})

test('matchSquad flags two plugins claiming the same artifact-type', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{ name: 'a', squads: [{ 'artifact-types': ['skill'], roles: {}, governances: {} }] },
			{ name: 'b', squads: [{ 'artifact-types': ['skill'], roles: {}, governances: {} }] },
		],
	}
	const { match, ambiguous } = matchSquad(reg, 'skill')
	assert.equal(match, null)
	assert.deepEqual(ambiguous, ['a', 'b'])
})

// ─── resolveBar — precedence + compose ──────────────────────────────────────────

const squadMatch = (plugin: string, governances: Squad['governances'], roles: Squad['roles'] = {}): SquadMatch => ({
	plugin,
	squad: { 'artifact-types': ['skill'], roles, governances },
})

test('resolveBar floors to the sdd default when nothing overrides', () => {
	const plan = resolveBar(null, 'oracle', 'spec', { match: null, projectGovs: [] })
	assert.equal(plan.key, 'oracle-spec')
	assert.deepEqual(plan.instructions, [
		{ source: 'sdd', kind: 'harness-load', ref: 'sdd:oracle-spec-governance', compose: 'union' },
	])
})

test('resolveBar unions project > plugin > sdd', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/d.md', artifactType: null, actor: 'oracle', gate: 'spec', compose: 'union' },
	]
	const match = squadMatch('aces', { 'oracle-spec': 'aces-dir' })
	const plan = resolveBar('skill', 'oracle', 'spec', { match, projectGovs })
	assert.deepEqual(
		plan.instructions.map((i) => i.source),
		['project', 'plugin', 'sdd'],
	)
	assert.equal(plan.instructions[1].ref, 'aces:aces-dir')
})

test('resolveBar — a project replace supersedes plugin and sdd', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/d.md', artifactType: null, actor: 'oracle', gate: 'spec', compose: 'replace' },
	]
	const match = squadMatch('aces', { 'oracle-spec': 'aces-dir' })
	const plan = resolveBar('skill', 'oracle', 'spec', { match, projectGovs })
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
	const plan = resolveBar('skill', 'builder', 'spec', { match: null, projectGovs })
	assert.equal(plan.instructions[0].ref, '.agents/governances/typed.md')
	assert.equal(plan.instructions[1].ref, '.agents/governances/typeless.md')
})

test('resolveBar ignores a project bar for a different gate', () => {
	const projectGovs: GovCandidate[] = [
		{ path: '.agents/governances/d.md', artifactType: null, actor: 'builder', gate: 'impl', compose: 'union' },
	]
	const plan = resolveBar('skill', 'builder', 'spec', { match: null, projectGovs })
	assert.deepEqual(
		plan.instructions.map((i) => i.source),
		['sdd'],
	)
})

// ─── resolveAgent ────────────────────────────────────────────────────────────────

test('resolveAgent returns the SDD default agent when no squad matches', () => {
	assert.deepEqual(resolveAgent('spec-judge', null), { source: 'sdd', ref: 'sdd-spec-judge' })
	assert.deepEqual(resolveAgent('spec-producer', null), { source: 'sdd', ref: null })
})

test('resolveAgent uses a named plugin delegate', () => {
	const match = squadMatch('aces', {}, { 'spec-judge': 'aces-spec-validator' })
	assert.deepEqual(resolveAgent('spec-judge', match), { source: 'plugin', ref: 'aces-spec-validator' })
})

test('resolveAgent treats an explicit null role as the SDD default', () => {
	const match = squadMatch('aces', {}, { 'impl-judge': null })
	assert.deepEqual(resolveAgent('impl-judge', match), { source: 'sdd', ref: 'sdd-implementer' })
})

test('resolveAgent falls back to the <plugin>-<role> convention for a missing role key', () => {
	const match = squadMatch('quill', {}, {})
	assert.deepEqual(resolveAgent('impl-producer', match), { source: 'plugin', ref: 'quill-impl-producer' })
})

// ─── resolveRole — fixed + bars per the contract ────────────────────────────────

test('resolveRole gives the spec-judge its fixed-universal + three -spec bars', () => {
	const plan = resolveRole('spec-judge', null, { match: null, projectGovs: [] })
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
		['oracle-spec', 'builder-spec', 'architect-spec'],
	)
})

test('resolveRole gives the impl-judge the builder/architect impl bars', () => {
	const plan = resolveRole('impl-judge', null, { match: null, projectGovs: [] })
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
			{ name: 'a', squads: [{ 'artifact-types': ['skill'], roles: {}, governances: {} }] },
			{ name: 'b', squads: [{ 'artifact-types': ['skill'], roles: {}, governances: {} }] },
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
		'sdd-plugins': [
			{ name: 'x', squads: [{ 'artifact-types': [], roles: { bogus: null } as Squad['roles'], governances: {} }] },
		],
	}
	assert.ok(validateRegistry(reg).some((m) => /unknown role key "bogus"/.test(m)))
})

test('validateRegistry flags an unknown governance key', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{
				name: 'x',
				squads: [{ 'artifact-types': [], roles: {}, governances: { oracle: null } as Squad['governances'] }],
			},
		],
	}
	assert.ok(validateRegistry(reg).some((m) => /unknown governance key "oracle"/.test(m)))
})

test('validateRegistry flags an artifact-type claimed by two plugins', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{ name: 'a', squads: [{ 'artifact-types': ['skill'], roles: {}, governances: {} }] },
			{ name: 'b', squads: [{ 'artifact-types': ['skill'], roles: {}, governances: {} }] },
		],
	}
	assert.ok(validateRegistry(reg).some((m) => /claimed by 2 plugins/.test(m)))
})

test('validateRegistry flags an artifact-type appearing in two squads of one plugin', () => {
	const reg: Registry = {
		'sdd-plugins': [
			{
				name: 'x',
				squads: [
					{ 'artifact-types': ['skill'], roles: {}, governances: {} },
					{ 'artifact-types': ['skill'], roles: {}, governances: {} },
				],
			},
		],
	}
	assert.ok(validateRegistry(reg).some((m) => /appears in more than one squad/.test(m)))
})

// ─── discoverProjectGovernances + main ──────────────────────────────────────────

test('discoverProjectGovernances reads bar files and skips non-bars', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		mkdirSync(join(root, '.agents', 'governances'), { recursive: true })
		writeFileSync(
			join(root, '.agents', 'governances', 'bar.md'),
			['---', 'metadata:', '  actor: oracle', '  gate: spec', '---', '# bar'].join('\n'),
		)
		writeFileSync(join(root, '.agents', 'governances', 'notes.md'), '# just notes, no frontmatter')
		const found = discoverProjectGovernances(root)
		assert.equal(found.length, 1)
		assert.equal(found[0].actor, 'oracle')
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

// ─── artifact-type tiebreaker map ────────────────────────────────────────────────

test('parseArtifactTypeMap reads quoted globs and skips comments, blanks, sections', () => {
	const toml = [
		'# the tiebreaker map',
		'',
		'[meta]',
		'"apps/website/src/content/**" = "docs"',
		"'plugins/*/agents/**' = 'subagent'",
		'plugins/*/skills/** = "skill"  # bare key',
	].join('\n')
	const map = parseArtifactTypeMap(toml)
	assert.deepEqual(map, [
		{ glob: 'apps/website/src/content/**', type: 'docs' },
		{ glob: 'plugins/*/agents/**', type: 'subagent' },
		{ glob: 'plugins/*/skills/**', type: 'skill' },
	])
})

test('resolveArtifactTypeFromMap picks the most-specific matching glob', () => {
	const map = parseArtifactTypeMap(['"apps/**" = "asset"', '"apps/website/src/content/**" = "docs"'].join('\n'))
	assert.equal(resolveArtifactTypeFromMap(map, 'apps/website/src/content/x.md'), 'docs')
	assert.equal(resolveArtifactTypeFromMap(map, 'apps/other/y.png'), 'asset')
})

test('resolveArtifactTypeFromMap: ** spans separators, * does not', () => {
	const map = parseArtifactTypeMap(['"plugins/*/skills/**" = "skill"'].join('\n'))
	assert.equal(resolveArtifactTypeFromMap(map, 'plugins/sdd/skills/foo/SKILL.md'), 'skill')
	assert.equal(resolveArtifactTypeFromMap(map, 'plugins/a/b/skills/foo/SKILL.md'), null)
})

test('resolveArtifactTypeFromMap returns null when nothing matches', () => {
	const map = parseArtifactTypeMap(['"docs/**" = "docs"'].join('\n'))
	assert.equal(resolveArtifactTypeFromMap(map, 'src/index.ts'), null)
})

test('loadArtifactTypeMap returns [] when the file is absent', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		assert.deepEqual(loadArtifactTypeMap(root), [])
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})

test('main --path resolves the artifact-type via the tiebreaker and emits the plan', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		mkdirSync(join(root, '.agents', 'sdd'), { recursive: true })
		writeFileSync(join(root, '.agents', 'sdd', 'artifact-types.toml'), '"docs/**" = "documentation"\n')
		writeFileSync(join(root, '.agents', 'universal-plugin.json'), JSON.stringify(REG))
		assert.equal(main(['--root', root, '--path', 'docs/guide.md']), 0)
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})

test('main --path with no tiebreaker match returns 0 (falls back to convention)', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-gov-'))
	try {
		assert.equal(main(['--root', root, '--path', 'src/whatever.ts']), 0)
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})
