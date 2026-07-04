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
		expect(result.stderr).toMatch(/plugin\.json/)
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
