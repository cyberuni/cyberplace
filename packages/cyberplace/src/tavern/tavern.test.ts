import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { readCrewPlugins, readMarketplacePlugins } from './plugins.js'

const bin = path.resolve('bin/cyberplace.mjs')

interface MarketplacePluginFixture {
	name: string
	description: string
	source: string
	tags: string[]
}

function makeMarketplace(plugins: MarketplacePluginFixture[]): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tavern-marketplace-'))
	const pluginDir = path.join(root, '.claude-plugin')
	fs.mkdirSync(pluginDir, { recursive: true })
	fs.writeFileSync(
		path.join(pluginDir, 'marketplace.json'),
		JSON.stringify(
			{ $schema: 'https://example.com/schema.json', name: 'test', owner: { name: 'test' }, plugins },
			null,
			2,
		),
	)
	return root
}

function runCli(...args: string[]) {
	return spawnSync('node', [bin, 'tavern', ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

// Scenario: a marketplace plugin tagged crew appears in the tavern roster
test('a marketplace plugin tagged crew appears in the tavern roster', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	try {
		const crews = readCrewPlugins(root)
		expect(crews.some((c) => c.name === 'navigator')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a marketplace plugin not tagged crew is excluded from the roster
test('a marketplace plugin not tagged crew is excluded from the roster', () => {
	const root = makeMarketplace([
		{ name: 'plain', description: 'Not a crew', source: './plugins/plain', tags: ['docs'] },
	])
	try {
		const crews = readCrewPlugins(root)
		expect(crews.some((c) => c.name === 'plain')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: the roster shows each crew's recruit command
test("the roster shows each crew's recruit command", () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	try {
		const crews = readCrewPlugins(root)
		const navigator = crews.find((c) => c.name === 'navigator')
		expect(navigator?.recruit).toBe('cyberplace add navigator')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: cyberplace tavern <query> filters the crew roster by text
test('cyberplace tavern <query> filters the crew roster by text', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
		{ name: 'gunner', description: 'Gunner crew', source: './plugins/gunner', tags: ['crew'] },
	])
	try {
		const crews = readCrewPlugins(root, 'navigator')
		expect(crews.some((c) => c.name === 'navigator')).toBe(true)
		expect(crews.some((c) => c.name === 'gunner')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a query never surfaces a non-crew plugin
test('a query never surfaces a non-crew plugin', () => {
	const root = makeMarketplace([
		{
			name: 'navigator',
			description: 'Navigator plain plugin, matches the query text but ships no persona',
			source: './plugins/navigator',
			tags: ['docs'],
		},
	])
	try {
		const crews = readCrewPlugins(root, 'navigator')
		expect(crews.some((c) => c.name === 'navigator')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: json output emits structured crew records
test('json output emits structured crew records', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	try {
		const result = runCli('--format', 'json', '--root', root)
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout) as { name: string; recruit: string }[]
		expect(parsed.some((c) => c.name === 'navigator' && c.recruit === 'cyberplace add navigator')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a marketplace with no crew-tagged plugins yields an empty roster, not an error
test('a marketplace with no crew-tagged plugins yields an empty roster, not an error', () => {
	const root = makeMarketplace([])
	try {
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/no crews/i)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: the Tavern lists a crew but performs no recruit, install, or deployment
test('the tavern lists a crew but performs no recruit, install, or deployment', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	try {
		const before = fs.readdirSync(root, { recursive: true }).sort()
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/Recruit: cyberplace add navigator/)
		// only prints the roster; no files created, nothing recruited/installed/deployed
		const after = fs.readdirSync(root, { recursive: true }).sort()
		expect(after).toEqual(before)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: readMarketplacePlugins returns every plugin, crew or not, with an isCrew flag
test('readMarketplacePlugins returns every plugin, crew or not, with an isCrew flag', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
		{ name: 'plain', description: 'Not a crew', source: './plugins/plain', tags: ['docs'] },
	])
	try {
		const plugins = readMarketplacePlugins(root)
		expect(plugins).toHaveLength(2)
		expect(plugins.find((p) => p.name === 'navigator')?.isCrew).toBe(true)
		expect(plugins.find((p) => p.name === 'plain')?.isCrew).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: readMarketplacePlugins filters by free-text query over name, description, and tags
test('readMarketplacePlugins filters by free-text query over name, description, and tags', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
		{ name: 'plain', description: 'Not a crew', source: './plugins/plain', tags: ['docs'] },
	])
	try {
		const plugins = readMarketplacePlugins(root, 'navigator')
		expect(plugins.some((p) => p.name === 'navigator')).toBe(true)
		expect(plugins.some((p) => p.name === 'plain')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: readCrewPlugins enriches each crew with counts, sourceUrl, and version derived from its own manifest
test('readCrewPlugins enriches each crew with counts, sourceUrl, and version derived from its own manifest', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	const pluginRoot = path.join(root, 'plugins', 'navigator')
	fs.mkdirSync(path.join(pluginRoot, 'skills', 'chart'), { recursive: true })
	fs.mkdirSync(path.join(pluginRoot, '.claude-plugin'), { recursive: true })
	fs.writeFileSync(path.join(pluginRoot, '.claude-plugin', 'plugin.json'), JSON.stringify({ version: '1.2.3' }))
	try {
		const crews = readCrewPlugins(root)
		const navigator = crews.find((c) => c.name === 'navigator')
		expect(navigator?.version).toBe('1.2.3')
		expect(navigator?.skillCount).toBe(1)
		expect(navigator?.sourceUrl).toBe('https://github.com/cyberuni/cyberplace/tree/main/plugins/navigator')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: the Tavern page is reachable from the site top navigation
test('the Tavern is reachable from the site top navigation', () => {
	// The top nav is a custom SiteTitle component registered as a Starlight override;
	// the Tavern link lives there, not in the sidebar.
	const astroConfig = fs.readFileSync(path.resolve('../../apps/website/astro.config.mjs'), 'utf8')
	expect(astroConfig).toContain('SiteTitle')
	const siteTitle = fs.readFileSync(path.resolve('../../apps/website/src/components/SiteTitle.astro'), 'utf8')
	expect(siteTitle).toContain('Tavern')
	expect(siteTitle).toContain('tavern')
})

test('the Tavern docs page exists', () => {
	const pagePath = path.resolve('../../apps/website/src/content/docs/tavern/index.mdx')
	expect(fs.existsSync(pagePath)).toBe(true)
})
