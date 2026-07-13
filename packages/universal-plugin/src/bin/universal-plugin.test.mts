import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

const bin = path.resolve('bin/universal-plugin.mjs')

function run(...args: string[]) {
	return spawnSync('node', [bin, ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

test('prints help when no arguments given', () => {
	const result = run()
	expect(result.stdout + result.stderr).toMatch(/universal-plugin/)
})

test('prints error for unknown command', () => {
	const result = run('unknown-command')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/unknown command/)
})

test('plugin build fails when .plugin/plugin.json is missing', () => {
	const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-smoke-'))
	try {
		const result = spawnSync('node', [bin, 'plugin', 'build', '--root', empty], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/No \.plugin\/plugin\.json found/)
	} finally {
		fs.rmSync(empty, { recursive: true, force: true })
	}
})

test('plugin build --dry-run lists vendors without writing', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-dryrun-'))
	try {
		fs.mkdirSync(path.join(root, '.plugin'))
		fs.writeFileSync(
			path.join(root, '.plugin', 'plugin.json'),
			JSON.stringify({ name: 'test-plugin', vendorExtensions: { 'claude-code': {} } }),
		)
		const result = spawnSync('node', [bin, 'plugin', 'build', '--dry-run', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		expect(fs.existsSync(path.join(root, '.claude-plugin'))).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('plugin build --format json returns a structured build result', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-buildjson-'))
	try {
		fs.mkdirSync(path.join(root, '.plugin'))
		fs.writeFileSync(
			path.join(root, '.plugin', 'plugin.json'),
			JSON.stringify({ name: 'test-plugin', vendorExtensions: { 'claude-code': {} } }),
		)
		const result = spawnSync('node', [bin, 'plugin', 'build', '--format', 'json', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout)
		expect(Array.isArray(parsed.built)).toBe(true)
		expect(parsed.summary).toMatchObject({ built: 1, skipped: 0, failed: 0 })
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('plugin build --help no longer documents pin-resolution flags', () => {
	const result = spawnSync('node', [bin, 'plugin', 'build', '--help'], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
	expect(result.status).toBe(0)
	expect(result.stdout).not.toMatch(/--registry/)
	expect(result.stdout).not.toMatch(/--range/)
	expect(result.stdout).not.toMatch(/--skip-pins/)
	expect(result.stdout).not.toMatch(/--allow-major/)
})

function mkBuildFixture(prefix: string, vendorExtensions: Record<string, unknown>) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
	fs.mkdirSync(path.join(root, '.plugin'))
	fs.writeFileSync(
		path.join(root, '.plugin', 'plugin.json'),
		JSON.stringify({ name: 'test-plugin', vendorExtensions }),
	)
	return root
}

function runBuild(root: string, ...args: string[]) {
	return spawnSync('node', [bin, 'plugin', 'build', '--root', root, ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

// Scenario: a successful build prints a TOON result with per-vendor status and aggregate
test('plugin build prints per-vendor TOON rows and a pre-computed aggregate', () => {
	const root = mkBuildFixture('universal-plugin-build-toon-', { 'claude-code': {}, cursor: {} })
	try {
		const result = runBuild(root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/vendor/i)
		expect(result.stdout).toMatch(/path/i)
		expect(result.stdout).toMatch(/status/i)
		expect(result.stdout).toMatch(/built/)
		expect(result.stdout).toMatch(/built 2, skipped 0, failed 0/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: no vendorExtensions declared is a definitive empty state
test('plugin build with no vendorExtensions prints the built-0 aggregate and nothing-to-build', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-build-empty-'))
	try {
		fs.mkdirSync(path.join(root, '.plugin'))
		fs.writeFileSync(path.join(root, '.plugin', 'plugin.json'), JSON.stringify({ name: 'test-plugin' }))
		const result = runBuild(root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/built 0/)
		expect(result.stderr).toMatch(/nothing to build/)
		expect(fs.existsSync(path.join(root, '.claude-plugin'))).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: --format toon names the default explicitly
test('plugin build --format toon names the default explicitly', () => {
	const root = mkBuildFixture('universal-plugin-build-toonflag-', { 'claude-code': {} })
	try {
		const result = runBuild(root, '--format', 'toon')
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/claude-code/)
		expect(result.stdout).toMatch(/built 1, skipped 0, failed 0/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a successful build ends with a next-step suggestion
test('plugin build ends stderr with a next-step suggestion', () => {
	const root = mkBuildFixture('universal-plugin-build-nextstep-', { 'claude-code': {} })
	try {
		const result = runBuild(root)
		expect(result.status).toBe(0)
		expect(result.stderr.trimEnd().endsWith('→ universal-plugin plugin validate')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// ── plugin bundle ──

function mkBundleFixture(prefix: string) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
	fs.mkdirSync(path.join(root, '.plugin'))
	fs.writeFileSync(path.join(root, '.plugin', 'plugin.json'), JSON.stringify({ name: 'test-plugin' }))
	return root
}

function writeWorkspacePkg(root: string, name: string, version?: string) {
	const dir = path.join(root, 'packages', name)
	fs.mkdirSync(dir, { recursive: true })
	if (version !== undefined) {
		fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name, version }))
	}
}

function writeSkill(root: string, relPath: string, content: string) {
	const full = path.join(root, 'skills', relPath)
	fs.mkdirSync(path.dirname(full), { recursive: true })
	fs.writeFileSync(full, content)
}

function runBundle(root: string, ...args: string[]) {
	return spawnSync('node', [bin, 'plugin', 'bundle', '--root', root, ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

// Scenario: missing .plugin/plugin.json fails
test('plugin bundle fails when .plugin/plugin.json is missing', () => {
	const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-bundle-missing-'))
	try {
		const result = runBundle(empty)
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/No \.plugin\/plugin\.json found/)
	} finally {
		fs.rmSync(empty, { recursive: true, force: true })
	}
})

// Scenario: bundle pins a workspace CLI to its local package.json version
test('plugin bundle pins a workspace CLI to its local package.json version', () => {
	const root = mkBundleFixture('universal-plugin-bundle-pin-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		expect(fs.readFileSync(path.join(root, 'skills', 'x', 'SKILL.md'), 'utf8')).toBe('npx cyberplace@0.1.0')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a workspace package whose local package.json is unreadable warns and skips
test('plugin bundle warns and skips a workspace package with no readable version', () => {
	const root = mkBundleFixture('universal-plugin-bundle-unreadable-')
	try {
		writeWorkspacePkg(root, 'cyberfleet') // directory exists, no package.json written
		writeSkill(root, 'x/SKILL.md', 'npx cyberfleet@0.0.1')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		expect(fs.readFileSync(path.join(root, 'skills', 'x', 'SKILL.md'), 'utf8')).toBe('npx cyberfleet@0.0.1')
		expect(result.stderr).toMatch(/cyberfleet/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a pin for a package with no workspace entry is left untouched
test('plugin bundle leaves an external pin untouched', () => {
	const root = mkBundleFixture('universal-plugin-bundle-external-')
	try {
		writeSkill(root, 'x/SKILL.md', 'npx gherkin-cli@0.0.1')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		expect(fs.readFileSync(path.join(root, 'skills', 'x', 'SKILL.md'), 'utf8')).toBe('npx gherkin-cli@0.0.1')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: bundle writes a .plugin/pins.json map of resolved workspace versions
test('plugin bundle writes .plugin/pins.json mapping resolved workspace versions', () => {
	const root = mkBundleFixture('universal-plugin-bundle-pinsmap-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		const pins = JSON.parse(fs.readFileSync(path.join(root, '.plugin', 'pins.json'), 'utf8'))
		expect(pins.cyberplace).toBe('0.1.0')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: --dry-run does not write .plugin/pins.json
test('plugin bundle --dry-run does not write .plugin/pins.json', () => {
	const root = mkBundleFixture('universal-plugin-bundle-pinsmap-dry-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root, '--dry-run')
		expect(result.status).toBe(0)
		expect(fs.existsSync(path.join(root, '.plugin', 'pins.json'))).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: an external package is excluded from the pins map
test('plugin bundle excludes an external package from .plugin/pins.json', () => {
	const root = mkBundleFixture('universal-plugin-bundle-pinsmap-ext-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9\nnpx gherkin-cli@0.0.1')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		const pins = JSON.parse(fs.readFileSync(path.join(root, '.plugin', 'pins.json'), 'utf8'))
		expect(pins.cyberplace).toBe('0.1.0')
		expect(pins['gherkin-cli']).toBeUndefined()
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: --dry-run reports resolved pins without writing them
test('plugin bundle --dry-run reports without writing', () => {
	const root = mkBundleFixture('universal-plugin-bundle-dryrun-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root, '--dry-run')
		expect(result.status).toBe(0)
		expect(fs.readFileSync(path.join(root, 'skills', 'x', 'SKILL.md'), 'utf8')).toBe('npx cyberplace@0.0.9')
		expect(result.stdout).toMatch(/cyberplace/)
		expect(result.stdout).toMatch(/0\.0\.9/)
		expect(result.stdout).toMatch(/0\.1\.0/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a bundle prints TOON pins rows and a pre-computed aggregate
test('plugin bundle prints pins rows and a pre-computed aggregate', () => {
	const root = mkBundleFixture('universal-plugin-bundle-aggregate-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeWorkspacePkg(root, 'cyberfleet', '0.0.1')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9 and npx cyberfleet@0.0.1')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/package/i)
		expect(result.stdout).toMatch(/status/i)
		expect(result.stdout).toMatch(/pinned 1, unchanged 1, skipped 0/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: --format json returns a structured pins result
test('plugin bundle --format json returns a structured pins result', () => {
	const root = mkBundleFixture('universal-plugin-bundle-json-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root, '--format', 'json')
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout)
		expect(Array.isArray(parsed.pins)).toBe(true)
		expect(parsed.pins[0]).toMatchObject({ package: 'cyberplace', resolved: '0.1.0' })
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: --format toon names the default explicitly
test('plugin bundle --format toon names the default explicitly', () => {
	const root = mkBundleFixture('universal-plugin-bundle-toon-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root, '--format', 'toon')
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/cyberplace/)
		expect(result.stdout).toMatch(/pinned 1, unchanged 0, skipped 0/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a large pins list truncates with a size hint / --full suppresses truncation
test('plugin bundle truncates a large pins list and --full shows all', () => {
	const root = mkBundleFixture('universal-plugin-bundle-truncate-')
	try {
		const lines: string[] = []
		for (let i = 0; i < 40; i++) {
			const name = `cyberpkg-${i}`
			writeWorkspacePkg(root, name, '1.0.0')
			lines.push(`npx ${name}@0.0.1`)
		}
		writeSkill(root, 'x/SKILL.md', lines.join('\n'))

		const truncated = runBundle(root, '--dry-run')
		expect(truncated.status).toBe(0)
		expect(truncated.stdout).toMatch(/… \+\d+ more — rerun with --full/)

		const full = runBundle(root, '--dry-run', '--full')
		expect(full.status).toBe(0)
		expect(full.stdout).not.toMatch(/more — rerun with --full/)
		for (let i = 0; i < 40; i++) {
			expect(full.stdout).toMatch(new RegExp(`cyberpkg-${i}\\b`))
		}
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: no pins to resolve is a definitive empty state
test('plugin bundle reports a definitive empty state when there is nothing to bundle', () => {
	const root = mkBundleFixture('universal-plugin-bundle-empty-')
	try {
		writeSkill(root, 'x/SKILL.md', 'no references here')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/pinned 0/)
		expect(result.stderr).toMatch(/nothing to bundle/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a successful bundle ends with a next-step suggestion
test('plugin bundle ends stderr with a next-step suggestion', () => {
	const root = mkBundleFixture('universal-plugin-bundle-nextstep-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = runBundle(root)
		expect(result.status).toBe(0)
		expect(result.stderr.trimEnd().endsWith('→ review and commit the pinned skills')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: bundle never prompts interactively — exercised implicitly: run() never hangs waiting
// on stdin and always exits deterministically.
test('plugin bundle never prompts interactively', () => {
	const root = mkBundleFixture('universal-plugin-bundle-noprompt-')
	try {
		writeWorkspacePkg(root, 'cyberplace', '0.1.0')
		writeSkill(root, 'x/SKILL.md', 'npx cyberplace@0.0.9')
		const result = spawnSync('node', [bin, 'plugin', 'bundle', '--root', root], {
			encoding: 'utf8',
			input: '',
			timeout: 5000,
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: an unknown flag fails loud
test('plugin bundle --frobnicate fails loud naming the flag', () => {
	const root = mkBundleFixture('universal-plugin-bundle-unknownflag-')
	try {
		const result = runBundle(root, '--frobnicate')
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/--frobnicate/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: --help documents the bundle flags
test('plugin bundle --help documents synopsis, flags, and an example', () => {
	const result = spawnSync('node', [bin, 'plugin', 'bundle', '--help'], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
	expect(result.status).toBe(0)
	expect(result.stdout).toMatch(/Usage:/)
	expect(result.stdout).toMatch(/--dry-run/)
	expect(result.stdout).toMatch(/--full/)
	expect(result.stdout).toMatch(/Example:/)
})

test('governance list includes packaged defaults when project root has no governances', () => {
	const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		const result = spawnSync('node', [bin, 'governance', 'list', '--root', empty], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch("plugin-design")
	} finally {
		fs.rmSync(empty, { recursive: true, force: true })
	}
})

test('governance list returns governance name and scope', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		fs.mkdirSync(path.join(root, 'governances'))
		fs.writeFileSync(path.join(root, 'governances', 'plugin-design.md'), '# Plugin Design')
		const result = spawnSync('node', [bin, 'governance', 'list', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/plugin-design/)
		expect(result.stdout).toMatch(/project/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('governance show outputs content for a known governance', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		fs.mkdirSync(path.join(root, 'governances'))
		fs.writeFileSync(path.join(root, 'governances', 'plugin-design.md'), '# Plugin Design\ncontent here')
		const result = spawnSync('node', [bin, 'governance', 'show', 'plugin-design', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/# Plugin Design/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('governance show exits 1 for unknown governance', () => {
	const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		const result = spawnSync('node', [bin, 'governance', 'show', 'missing', '--root', empty], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/not found/)
	} finally {
		fs.rmSync(empty, { recursive: true, force: true })
	}
})

test('governance show --json returns structured output', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		fs.mkdirSync(path.join(root, 'governances'))
		fs.writeFileSync(path.join(root, 'governances', 'test-gov.md'), 'content')
		const result = spawnSync('node', [bin, 'governance', 'show', 'test-gov', '--json', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout)
		expect(parsed.scope).toBe('project')
		expect(parsed.content).toBe('content')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('governance show --format json returns structured output (frozen invocation)', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		fs.mkdirSync(path.join(root, 'governances'))
		fs.writeFileSync(path.join(root, 'governances', 'test-gov.md'), 'content')
		const result = spawnSync('node', [bin, 'governance', 'show', 'test-gov', '--format', 'json', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout)
		expect(parsed.scope).toBe('project')
		expect(parsed.content).toBe('content')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('governance list --format json returns array of entries (frozen invocation)', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-gov-'))
	try {
		fs.mkdirSync(path.join(root, 'governances'))
		fs.writeFileSync(path.join(root, 'governances', 'plugin-design.md'), '# Plugin Design')
		const result = spawnSync('node', [bin, 'governance', 'list', '--format', 'json', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout)
		expect(Array.isArray(parsed)).toBe(true)
		expect(parsed.every((e: { name: string; scope: string }) => 'name' in e && 'scope' in e)).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('publish sync-version writes version from packagePath into .plugin/plugin.json', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-syncver-'))
	try {
		fs.mkdirSync(path.join(root, '.plugin'))
		fs.mkdirSync(path.join(root, '.agents'))
		fs.mkdirSync(path.join(root, 'pkg'), { recursive: true })
		fs.writeFileSync(path.join(root, '.plugin', 'plugin.json'), JSON.stringify({ name: 'test-plugin' }))
		fs.writeFileSync(path.join(root, '.agents', 'universal-plugin.json'), JSON.stringify({ packagePath: 'pkg' }))
		fs.writeFileSync(path.join(root, 'pkg', 'package.json'), JSON.stringify({ version: '3.1.0' }))
		const result = spawnSync('node', [bin, 'publish', 'sync-version', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const manifest = JSON.parse(fs.readFileSync(path.join(root, '.plugin', 'plugin.json'), 'utf8')) as Record<string, unknown>
		expect(manifest['version']).toBe('3.1.0')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('publish sync-version exits 1 when packagePath is missing from manifest', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-syncver-'))
	try {
		fs.mkdirSync(path.join(root, '.plugin'))
		fs.writeFileSync(
			path.join(root, '.plugin', 'plugin.json'),
			JSON.stringify({ name: 'test-plugin' }),
		)
		const result = spawnSync('node', [bin, 'publish', 'sync-version', '--root', root], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/packagePath is required/)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})
