import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { realSyncVersionFs } from './fs.js'
import { syncVersion } from './sync-version.js'

let dir: string

beforeEach(() => {
	dir = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-syncver-'))
	fs.mkdirSync(path.join(dir, '.plugin'))
	fs.mkdirSync(path.join(dir, '.agents'))
})

afterEach(() => {
	fs.rmSync(dir, { recursive: true, force: true })
})

function writeManifest(manifest: object, indent?: string | number) {
	fs.writeFileSync(path.join(dir, '.plugin', 'plugin.json'), JSON.stringify(manifest, null, indent))
}

function writeAgentsConfig(config: object) {
	fs.writeFileSync(path.join(dir, '.agents', 'universal-plugin.json'), JSON.stringify(config))
}

function writePackage(relFolder: string, pkg: object) {
	fs.mkdirSync(path.join(dir, relFolder), { recursive: true })
	fs.writeFileSync(path.join(dir, relFolder, 'package.json'), JSON.stringify(pkg))
}

function readManifest(): Record<string, unknown> {
	return JSON.parse(fs.readFileSync(path.join(dir, '.plugin', 'plugin.json'), 'utf8')) as Record<string, unknown>
}

describe('syncVersion', () => {
	it('throws when .plugin/plugin.json is missing', () => {
		const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-empty-'))
		try {
			expect(() => syncVersion(empty, realSyncVersionFs)).toThrow(/No .plugin\/plugin.json/)
		} finally {
			fs.rmSync(empty, { recursive: true, force: true })
		}
	})

	it('throws when packagePath is missing from .agents/universal-plugin.json', () => {
		writeManifest({ name: 'my-plugin' })
		expect(() => syncVersion(dir, realSyncVersionFs)).toThrow(/packagePath is required/)
	})

	it('throws when packagePath/package.json does not exist', () => {
		writeManifest({ name: 'my-plugin' })
		writeAgentsConfig({ packagePath: 'packages/missing' })
		expect(() => syncVersion(dir, realSyncVersionFs)).toThrow(/No package.json found at packages\/missing/)
	})

	it('throws when packagePath/package.json has no version', () => {
		writeManifest({ name: 'my-plugin' })
		writeAgentsConfig({ packagePath: 'packages/mypkg' })
		writePackage('packages/mypkg', { name: 'mypkg' })
		expect(() => syncVersion(dir, realSyncVersionFs)).toThrow(/No version found in packages\/mypkg\/package.json/)
	})

	it('writes version from packagePath into .plugin/plugin.json', () => {
		writeManifest({ name: 'my-plugin' })
		writeAgentsConfig({ packagePath: 'packages/mypkg' })
		writePackage('packages/mypkg', { name: 'mypkg', version: '1.2.3' })
		const result = syncVersion(dir, realSyncVersionFs)
		expect(result.version).toBe('1.2.3')
		expect(readManifest().version).toBe('1.2.3')
	})

	it('preserves all other fields when writing', () => {
		writeManifest({ name: 'my-plugin', description: 'desc' })
		writeAgentsConfig({ packagePath: 'packages/mypkg' })
		writePackage('packages/mypkg', { version: '2.0.0' })
		syncVersion(dir, realSyncVersionFs)
		const manifest = readManifest()
		expect(manifest.name).toBe('my-plugin')
		expect(manifest.description).toBe('desc')
	})

	it('returns manifestPath pointing to .plugin/plugin.json', () => {
		writeManifest({ name: 'x' })
		writeAgentsConfig({ packagePath: 'pkg' })
		writePackage('pkg', { version: '0.1.0' })
		const result = syncVersion(dir, realSyncVersionFs)
		expect(result.manifestPath).toBe(path.join(dir, '.plugin', 'plugin.json'))
	})

	it('overwrites an existing version field', () => {
		writeManifest({ name: 'my-plugin', version: '0.0.1' })
		writeAgentsConfig({ packagePath: 'packages/mypkg' })
		writePackage('packages/mypkg', { version: '1.2.3' })
		syncVersion(dir, realSyncVersionFs)
		expect(readManifest().version).toBe('1.2.3')
	})

	it('uses tab indentation by default when file has no indentation', () => {
		writeManifest({ name: 'my-plugin' })
		writeAgentsConfig({ packagePath: 'pkg' })
		writePackage('pkg', { version: '1.0.0' })
		syncVersion(dir, realSyncVersionFs)
		const raw = fs.readFileSync(path.join(dir, '.plugin', 'plugin.json'), 'utf8')
		expect(raw).toContain('\t')
	})

	it('preserves tab indentation from existing file', () => {
		writeManifest({ name: 'my-plugin' }, '\t')
		writeAgentsConfig({ packagePath: 'pkg' })
		writePackage('pkg', { version: '1.0.0' })
		syncVersion(dir, realSyncVersionFs)
		const raw = fs.readFileSync(path.join(dir, '.plugin', 'plugin.json'), 'utf8')
		expect(raw).toContain('\t')
		expect(raw).not.toMatch(/\n {2}/)
	})

	it('preserves 2-space indentation from existing file', () => {
		writeManifest({ name: 'my-plugin' }, 2)
		writeAgentsConfig({ packagePath: 'pkg' })
		writePackage('pkg', { version: '1.0.0' })
		syncVersion(dir, realSyncVersionFs)
		const raw = fs.readFileSync(path.join(dir, '.plugin', 'plugin.json'), 'utf8')
		expect(raw).toContain('\n  ')
		expect(raw).not.toContain('\t')
	})
})
