import * as os from 'node:os'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ASSET_DIRS, globalStorePath, projectStorePath, storeEntryPath } from './asset-store.js'

describe('globalStorePath', () => {
	it('returns ~/.agents/.universal-plugin/plugins', () => {
		const result = globalStorePath()
		expect(result.startsWith(os.homedir())).toBe(true)
		expect(result.endsWith(path.join('.agents', '.universal-plugin', 'plugins'))).toBe(true)
	})
})

describe('projectStorePath', () => {
	it('returns <root>/.agents/.universal-plugin/plugins/', () => {
		expect(projectStorePath('/my/project')).toBe('/my/project/.agents/.universal-plugin/plugins')
	})
})

describe('storeEntryPath', () => {
	it('joins store root with segment', () => {
		expect(storeEntryPath('/store', 'npm/universal-plugin@1.2.3')).toBe('/store/npm/universal-plugin@1.2.3')
	})
})

describe('ASSET_DIRS', () => {
	it('contains exactly governances, disciplines, guidelines, templates', () => {
		expect([...ASSET_DIRS]).toStrictEqual(['governances', 'disciplines', 'guidelines', 'templates'])
	})
})
