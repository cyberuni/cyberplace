import { createHash } from 'node:crypto'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadSourcesConfig } from './fs.js'
import type { SourcesConfig } from './source-registry.js'
import { DEFAULT_SOURCES, getStoreSegment, resolveSourceType, sha8 } from './source-registry.js'

const defaultSources: SourcesConfig = {
	handlers: {
		github: { hosts: ['github.com'] },
		gitlab: { hosts: ['gitlab.com'] },
		npm: { registries: ['https://registry.npmjs.org'] },
	},
}

describe('sha8', () => {
	it('returns first 8 hex chars of SHA-256 of input', () => {
		const expected = createHash('sha256').update('https://example.com/org/repo').digest('hex').slice(0, 8)
		expect(sha8('https://example.com/org/repo')).toBe(expected)
	})
})

describe('resolveSourceType', () => {
	it('returns github for github.com', () => {
		expect(resolveSourceType('github.com', defaultSources)).toBe('github')
	})

	it('returns gitlab for gitlab.com', () => {
		expect(resolveSourceType('gitlab.com', defaultSources)).toBe('gitlab')
	})

	it('returns url for unrecognized host', () => {
		expect(resolveSourceType('example.com', defaultSources)).toBe('url')
	})

	it('returns github for registered enterprise instance', () => {
		const sources: SourcesConfig = {
			handlers: {
				github: { hosts: ['github.com', 'github.mycompany.com'] },
				gitlab: { hosts: ['gitlab.com'] },
				npm: { registries: ['https://registry.npmjs.org'] },
			},
		}
		expect(resolveSourceType('github.mycompany.com', sources)).toBe('github')
	})
})

describe('getStoreSegment', () => {
	it('npm unscoped: npm/plugin-name@version', () => {
		expect(getStoreSegment('npm', 'universal-plugin', '1.2.3', defaultSources)).toBe('npm/universal-plugin@1.2.3')
	})

	it('npm scoped: npm/@scope/name@version', () => {
		expect(getStoreSegment('npm', '@cyberuni/universal-plugin', '1.2.3', defaultSources)).toBe(
			'npm/@cyberuni/universal-plugin@1.2.3',
		)
	})

	it('github: github.com/owner/repo@version', () => {
		expect(getStoreSegment('github.com/cyberuni/universal-plugin', 'universal-plugin', '1.2.3', defaultSources)).toBe(
			'github.com/cyberuni/universal-plugin@1.2.3',
		)
	})

	it('url: url/name-sha8@version for unrecognized host', () => {
		const url = 'https://example.com/org/repo'
		const hash = sha8(url)
		expect(getStoreSegment(url, 'universal-plugin', '1.2.3', defaultSources)).toBe(`url/universal-plugin-${hash}@1.2.3`)
	})

	it('url with trailing slash: strips trailing slash before hashing and segment', () => {
		// Both should produce same sha8 hash (after trailing slash strip)
		// The github.com segment should not embed a trailing slash
		const sourcesWithGithub: SourcesConfig = {
			handlers: {
				github: { hosts: ['github.com'] },
				gitlab: { hosts: ['gitlab.com'] },
				npm: { registries: ['https://registry.npmjs.org'] },
			},
		}
		// For a known host, trailing slash in URL path should not appear in segment
		const segmentWithSlash = getStoreSegment(
			'https://github.com/cyberuni/universal-plugin/',
			'universal-plugin',
			'1.2.3',
			sourcesWithGithub,
		)
		const segmentWithout = getStoreSegment(
			'https://github.com/cyberuni/universal-plugin',
			'universal-plugin',
			'1.2.3',
			sourcesWithGithub,
		)
		expect(segmentWithSlash).toBe(segmentWithout)
		expect(segmentWithSlash).toBe('github.com/cyberuni/universal-plugin@1.2.3')
	})

	it('url: trailing slash produces same segment as no trailing slash', () => {
		const url1 = 'https://example.com/org/repo'
		const url2 = 'https://example.com/org/repo/'
		expect(getStoreSegment(url1, 'universal-plugin', '1.2.3', defaultSources)).toBe(
			getStoreSegment(url2, 'universal-plugin', '1.2.3', defaultSources),
		)
	})

	it('owner/repo 2-part shorthand defaults to github.com', () => {
		expect(getStoreSegment('cyberuni/universal-plugin', 'universal-plugin', '1.2.3', defaultSources)).toBe(
			'github.com/cyberuni/universal-plugin@1.2.3',
		)
	})

	it('owner/repo shorthand uses first registered github host for enterprise', () => {
		const enterpriseSources: SourcesConfig = {
			handlers: {
				github: { hosts: ['github.mycompany.com', 'github.com'] },
				gitlab: { hosts: ['gitlab.com'] },
				npm: { registries: ['https://registry.npmjs.org'] },
			},
		}
		expect(getStoreSegment('cyberuni/universal-plugin', 'universal-plugin', '1.2.3', enterpriseSources)).toBe(
			'github.mycompany.com/cyberuni/universal-plugin@1.2.3',
		)
	})
})

describe('loadSourcesConfig', () => {
	let tmpDir: string

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'universal-plugin-sources-test-'))
	})

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true })
	})

	it('returns DEFAULT_SOURCES when config file does not exist (ENOENT)', () => {
		const missing = path.join(tmpDir, 'nonexistent', 'sources.json')
		expect(loadSourcesConfig(missing)).toEqual(DEFAULT_SOURCES)
	})

	it('parses and returns config when file exists', () => {
		const customConfig: SourcesConfig = {
			handlers: {
				github: { hosts: ['github.com', 'github.mycompany.com'] },
				npm: { registries: ['https://registry.npmjs.org'] },
			},
		}
		const configFile = path.join(tmpDir, 'sources.json')
		fs.writeFileSync(configFile, JSON.stringify(customConfig))
		expect(loadSourcesConfig(configFile)).toEqual(customConfig)
	})
})
