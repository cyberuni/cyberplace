import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import {
	classifyLocation,
	collectSpecs,
	LIFECYCLE_STATUSES,
	main,
	parseFrontmatter,
	toToon,
} from './discover-specs.mts'

// Write a spec.md (relative to dir) with the given frontmatter body.
function seed(dir: string, relPath: string, frontmatter: string): void {
	const full = join(dir, relPath)
	mkdirSync(dirname(full), { recursive: true })
	writeFileSync(full, `---\n${frontmatter}\n---\n\n# body\n`)
}

// ── parseFrontmatter ──

test('parseFrontmatter reads status, project-path, and approval verdicts', () => {
	const fm = parseFrontmatter(
		'---\nstatus: approved\nproject-path: plugins/sdd-new\napproval:\n  spec:\n    verdict: approve\n    by: unional\n  impl:\n    verdict: approve\n---\n# body\n',
	)
	assert.equal(fm?.status, 'approved')
	assert.equal(fm?.projectPath, 'plugins/sdd-new')
	assert.deepEqual(fm?.approval, { spec: 'approve', impl: 'approve' })
})

test('parseFrontmatter ignores nested why blocks and unknown keys', () => {
	const fm = parseFrontmatter(
		'---\nstatus: draft\napproval:\n  spec:\n    verdict: approve\n    why:\n      leash: within\n      basis: judged\nproduced-by: sdd:automaton\n---\n',
	)
	assert.equal(fm?.status, 'draft')
	assert.deepEqual(fm?.approval, { spec: 'approve' })
})

test('parseFrontmatter returns null when there is no frontmatter block', () => {
	assert.equal(parseFrontmatter('# just a heading\n'), null)
})

test('parseFrontmatter strips quotes from scalar values', () => {
	const fm = parseFrontmatter('---\nstatus: "approved"\nproject-path: \'plugins/aces\'\n---\n')
	assert.equal(fm?.status, 'approved')
	assert.equal(fm?.projectPath, 'plugins/aces')
})

test('the lifecycle enum is exactly the four states', () => {
	assert.deepEqual([...LIFECYCLE_STATUSES].sort(), ['approved', 'deprecated', 'draft', 'implemented'])
})

// ── classifyLocation ──

test('classifyLocation recognizes the three spec locations', () => {
	assert.deepEqual(classifyLocation('.agents/spec/spec.md'), {
		pattern: 'root-single',
		projectPath: '',
	})
	assert.deepEqual(classifyLocation('.agents/specs/sdd/spec.md'), {
		pattern: 'root-multi',
		projectPath: 'sdd',
	})
	assert.deepEqual(classifyLocation('plugins/aces/.agents/spec/spec.md'), {
		pattern: 'nested',
		projectPath: 'plugins/aces',
	})
})

test('classifyLocation rejects a spec.md outside the three locations', () => {
	assert.equal(classifyLocation('src/foo/spec.md'), null)
	assert.equal(classifyLocation('spec.md'), null)
	// not a spec location: an extra segment under .agents/specs/<project>
	assert.equal(classifyLocation('.agents/specs/sdd/nested/spec.md'), null)
})

// ── collectSpecs (scan + shape filter) ──

test('collectSpecs finds specs at all three locations and excludes non-specs', () => {
	const dir = mkdtempSync(join(tmpdir(), 'read-specs-'))
	try {
		seed(dir, '.agents/spec/spec.md', 'status: draft\nproject-path: .') // pattern 1
		seed(dir, '.agents/specs/sdd/spec.md', 'status: approved\nproject-path: plugins/sdd-new') // pattern 2
		seed(dir, '.agents/specs/aces/spec.md', 'status: implemented') // pattern 2
		seed(dir, 'packages/web/.agents/spec/spec.md', 'status: draft') // pattern 3 (nested)
		// excluded — a spec.md with no lifecycle status at a spec location
		seed(dir, '.agents/specs/notaspec/spec.md', 'title: not a spec')
		// excluded — a status-bearing spec.md OUTSIDE the spec locations
		seed(dir, 'src/feature/spec.md', 'status: approved')
		// excluded — under a skipped dir
		seed(dir, 'node_modules/pkg/.agents/spec/spec.md', 'status: draft')

		const specs = collectSpecs(dir)
		assert.deepEqual(
			specs.map((s) => s.path),
			['.agents/spec', '.agents/specs/aces', '.agents/specs/sdd', 'packages/web/.agents/spec'],
		)
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
})

test('collectSpecs only matches root-level .agents/specs (pattern 2 has no ** prefix)', () => {
	const dir = mkdtempSync(join(tmpdir(), 'read-specs-'))
	try {
		seed(dir, '.agents/specs/sdd/spec.md', 'status: draft')
		// a NESTED .agents/specs/<project> is NOT a recognized location (only nested .agents/spec is)
		seed(dir, 'pkg/.agents/specs/inner/spec.md', 'status: draft')
		const specs = collectSpecs(dir)
		assert.deepEqual(
			specs.map((s) => s.path),
			['.agents/specs/sdd'],
		)
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
})

test('collectSpecs carries status, project-path, and flattened approvals', () => {
	const dir = mkdtempSync(join(tmpdir(), 'read-specs-'))
	try {
		seed(
			dir,
			'.agents/specs/sdd/spec.md',
			'status: approved\nproject-path: plugins/sdd-new\napproval:\n  spec:\n    verdict: approve\n    by: unional',
		)
		const [s] = collectSpecs(dir)
		assert.equal(s.status, 'approved')
		assert.equal(s.projectPath, 'plugins/sdd-new')
		assert.equal(s.approvals, 'spec:approve')
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
})

// ── toToon ──

test('toToon emits a tabular header and one row per spec', () => {
	const toon = toToon([
		{ path: '.agents/specs/sdd', status: 'approved', projectPath: 'plugins/sdd-new', approvals: 'spec:approve' },
		{ path: '.agents/specs/aces', status: 'draft', projectPath: 'plugins/aces', approvals: '' },
	])
	assert.equal(
		toon,
		'specs[2]{path,status,projectPath,approvals}:\n' +
			'  .agents/specs/sdd,approved,plugins/sdd-new,spec:approve\n' +
			'  .agents/specs/aces,draft,plugins/aces,""',
	)
})

test('toToon on an empty set emits only the zero header', () => {
	assert.equal(toToon([]), 'specs[0]{path,status,projectPath,approvals}:')
})

// ── main (CLI) ──

test('main scans the given root and returns 0', () => {
	const dir = mkdtempSync(join(tmpdir(), 'discover-specs-'))
	const writes: string[] = []
	const original = process.stdout.write
	// capture stdout so the CLI smoke test stays quiet
	process.stdout.write = ((chunk: string) => {
		writes.push(String(chunk))
		return true
	}) as typeof process.stdout.write
	try {
		seed(dir, '.agents/specs/sdd/spec.md', 'status: approved\nproject-path: plugins/sdd-new')
		assert.equal(main(['--root', dir]), 0)
		assert.match(writes.join(''), /specs\[1\]\{path,status,projectPath,approvals\}:/)
		assert.match(writes.join(''), /\.agents\/specs\/sdd,approved,plugins\/sdd-new/)
	} finally {
		process.stdout.write = original
		rmSync(dir, { recursive: true, force: true })
	}
})
