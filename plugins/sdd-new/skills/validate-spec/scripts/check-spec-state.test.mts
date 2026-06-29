import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
	checkNode,
	checkSpec,
	discoverNodeDirs,
	discoverSpecDirs,
	type NodeSpec,
	parseNode,
	parseSpecState,
	type SpecState,
} from './check-spec-state.mts'

function state(over: Partial<SpecState> = {}): SpecState {
	return {
		status: 'draft',
		projectPath: null,
		markerCount: 0,
		approval: null,
		...over,
	}
}

function node(over: Partial<NodeSpec> = {}): NodeSpec {
	return { type: null, hasSubject: false, hasUseCases: false, ...over }
}

// ── root lifecycle tuple ──

test('parseSpecState reads status, project-path, and marker count', () => {
	const s = parseSpecState(
		'---\nstatus: draft\nproject-path: plugins/sdd-new\n---\n\n<!-- open: a -->\n<!--   open: b -->\n',
	)
	assert.equal(s.status, 'draft')
	assert.equal(s.projectPath, 'plugins/sdd-new')
	assert.equal(s.markerCount, 2)
})

test('parseSpecState ignores marker syntax inside code spans and fences', () => {
	const text = [
		'---',
		'status: approved',
		'---',
		'',
		'an inline `<!-- open: x -->` marker',
		'',
		'```',
		'<!-- open: y -->',
		'```',
		'',
	].join('\n')
	assert.equal(parseSpecState(text).markerCount, 0)
})

test('parseSpecState reads a nested approval map with verdict and why', () => {
	const text = [
		'---',
		'status: approved',
		'approval:',
		'  spec:',
		'    verdict: approve',
		'    by: unional',
		'  impl:',
		'    verdict: approve',
		'    by: agent',
		'    why:',
		'      reversibility: safe',
		'---',
		'',
	].join('\n')
	const s = parseSpecState(text)
	assert.equal(s.approval?.spec.by, 'unional')
	assert.equal(s.approval?.spec.hasWhy, false)
	assert.equal(s.approval?.impl.by, 'agent')
	assert.equal(s.approval?.impl.hasWhy, true)
})

test('a clean draft passes', () => {
	assert.deepEqual(checkSpec('x', state()), [])
})

test('open markers block the gate once approved', () => {
	const v = checkSpec(
		'x',
		state({ status: 'approved', markerCount: 1, approval: { spec: { verdict: 'approve', by: 'u', hasWhy: false } } }),
	)
	assert.ok(v.some((m) => /open marker/.test(m)))
})

test('approved without an approve verdict on the spec gate is illegal', () => {
	const v = checkSpec('x', state({ status: 'approved' }))
	assert.ok(v.some((m) => /approval.spec has no approve verdict/.test(m)))
})

test('a by:agent entry without a why is illegal', () => {
	const v = checkSpec('x', state({ approval: { spec: { verdict: 'approve', by: 'agent', hasWhy: false } } }))
	assert.ok(v.some((m) => /by:agent but has no why/.test(m)))
})

test('a pause carrying by is illegal', () => {
	const v = checkSpec('x', state({ approval: { spec: { verdict: 'pause', by: 'agent', hasWhy: true } } }))
	assert.ok(v.some((m) => /pause but carries by/.test(m)))
})

test('an unknown gate key is rejected', () => {
	const v = checkSpec('x', state({ approval: { release: { verdict: 'approve', by: 'u', hasWhy: false } } }))
	assert.ok(v.some((m) => /unknown gate "release"/.test(m)))
})

test('a fully approved-and-implemented spec passes', () => {
	const v = checkSpec(
		'x',
		state({
			status: 'implemented',
			approval: {
				spec: { verdict: 'approve', by: 'u', hasWhy: false },
				impl: { verdict: 'approve', by: 'u', hasWhy: false },
			},
		}),
	)
	assert.deepEqual(v, [])
})

test('a descriptive root with no frontmatter is a no-op (no .feature requirement)', () => {
	assert.deepEqual(checkSpec('sdd', parseSpecState('# Spec\n\nbody only, no frontmatter\n')), [])
})

// ── project-path (the router index) ──

test('parseSpecState reads project-path; absent leaves it null', () => {
	assert.equal(
		parseSpecState('---\nstatus: draft\nproject-path: plugins/sdd-new\n---\n').projectPath,
		'plugins/sdd-new',
	)
	assert.equal(parseSpecState('---\nstatus: draft\n---\n').projectPath, null)
})

test('project-path is a router hint, not a lifecycle-legality concern — its absence is not a violation', () => {
	assert.deepEqual(checkSpec('x', state({ projectPath: null })), [])
})

// ── per-node spec-type reconcile ──

test('parseNode reads spec-type and detects Subject / Use Cases sections', () => {
	const ref = parseNode('---\nspec-type: reference\n---\n\n# x\n\n## Subject\n\nfoo\n')
	assert.deepEqual(ref, { type: 'reference', hasSubject: true, hasUseCases: false })
	const beh = parseNode('---\nspec-type: behavioral\n---\n\n# y\n\n## Use Cases\n\nbar\n')
	assert.deepEqual(beh, { type: 'behavioral', hasSubject: false, hasUseCases: true })
	const desc = parseNode('# overview\n\nno marker\n')
	assert.equal(desc.type, null)
})

test('parseNode ignores a heading shown inside a code fence', () => {
	const n = parseNode('---\nspec-type: reference\n---\n\n```\n## Subject\n```\n')
	assert.equal(n.hasSubject, false)
})

test('a descriptive node (no marker) raises no spec-type violation', () => {
	assert.deepEqual(checkNode('authoring', node({ type: null }), true), [])
})

test('a reference node with a Subject and no .feature passes', () => {
	assert.deepEqual(checkNode('authoring/spec-format', node({ type: 'reference', hasSubject: true }), false), [])
})

test('a reference node carrying a .feature is illegal', () => {
	const v = checkNode('authoring/spec-format', node({ type: 'reference', hasSubject: true }), true)
	assert.ok(v.some((m) => /reference but a sibling .feature exists/.test(m)))
})

test('a reference node with no Subject section is illegal', () => {
	const v = checkNode('authoring/spec-format', node({ type: 'reference', hasSubject: false }), false)
	assert.ok(v.some((m) => /reference but no ## Subject/.test(m)))
})

test('a behavioral node with Use Cases passes', () => {
	assert.deepEqual(checkNode('authoring/spec-producer', node({ type: 'behavioral', hasUseCases: true }), true), [])
})

test('a behavioral node with no Use Cases section is illegal', () => {
	const v = checkNode('authoring/spec-producer', node({ type: 'behavioral', hasUseCases: false }), true)
	assert.ok(v.some((m) => /behavioral but no ## Use Cases/.test(m)))
})

test('an unknown spec-type is rejected', () => {
	const v = checkNode('x', node({ type: 'descriptive' }), false)
	assert.ok(v.some((m) => /unknown spec-type "descriptive"/.test(m)))
})

// ── discovery ──

test('discoverSpecDirs finds the project root; discoverNodeDirs finds README nodes', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-specs-'))
	try {
		mkdirSync(join(root, 'sdd', 'authoring', 'spec-format'), { recursive: true })
		writeFileSync(join(root, 'sdd', 'spec.md'), '---\nstatus: draft\n---\n')
		writeFileSync(join(root, 'sdd', 'authoring', 'README.md'), '# overview\n')
		writeFileSync(
			join(root, 'sdd', 'authoring', 'spec-format', 'README.md'),
			'---\nspec-type: reference\n---\n## Subject\n',
		)
		assert.deepEqual(discoverSpecDirs(root), ['sdd'])
		assert.deepEqual(
			discoverNodeDirs(root).sort(),
			[join('sdd', 'authoring'), join('sdd', 'authoring', 'spec-format')].sort(),
		)
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})

test('discoverSpecDirs skips node_modules and dot dirs', () => {
	const root = mkdtempSync(join(tmpdir(), 'sdd-specs-'))
	try {
		mkdirSync(join(root, 'node_modules', 'pkg'), { recursive: true })
		writeFileSync(join(root, 'node_modules', 'pkg', 'spec.md'), '---\nstatus: draft\n---\n')
		mkdirSync(join(root, '.cache'), { recursive: true })
		writeFileSync(join(root, '.cache', 'spec.md'), '---\nstatus: draft\n---\n')
		assert.deepEqual(discoverSpecDirs(root), [])
	} finally {
		rmSync(root, { recursive: true, force: true })
	}
})
