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

// AXI Scenario: tavern prints a TOON result with a pre-computed aggregate
test('tavern prints a TOON result with a pre-computed aggregate', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
		{ name: 'gunner', description: 'Gunner crew', source: './plugins/gunner', tags: ['crew'] },
	])
	try {
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toContain('crews[2]{name,description,recruit}:')
		expect(result.stdout).toContain('2 crews')
		expect(result.stdout).toContain('cyberplace add navigator')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// AXI Scenario: a long crew roster truncates with a size hint; --full disables it
test('a long crew roster truncates with a size hint unless --full', () => {
	const plugins = Array.from({ length: 40 }, (_, i) => ({
		name: `crew${String(i).padStart(2, '0')}`,
		description: `Crew ${i}`,
		source: `./plugins/crew${i}`,
		tags: ['crew'],
	}))
	const root = makeMarketplace(plugins)
	try {
		const truncated = runCli('--root', root)
		expect(truncated.status).toBe(0)
		expect(truncated.stdout).toMatch(/… \+\d+ lines — rerun with --full/)

		const full = runCli('--full', '--root', root)
		expect(full.status).toBe(0)
		expect(full.stdout).not.toMatch(/rerun with --full/)
		for (const p of plugins) expect(full.stdout).toContain(p.name)

		const json = runCli('--format', 'json', '--root', root)
		expect(json.status).toBe(0)
		const parsed = JSON.parse(json.stdout) as { name: string }[]
		expect(parsed).toHaveLength(40)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// AXI Scenario: an empty roster is a definitive empty state, not an error
test('an empty roster is a definitive empty state', () => {
	const root = makeMarketplace([])
	try {
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toContain('0 crews found')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// AXI Scenario: bare tavern shows the roster, not help; ends with a next-step on stderr
test('bare tavern shows the roster with a next-step on stderr, not help', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	try {
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toContain('navigator')
		expect(result.stdout).not.toMatch(/Usage:/)
		expect(result.stderr.trim().endsWith('→ cyberplace add <name>')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// AXI Scenario: an unknown flag fails loud
test('an unknown flag fails loud', () => {
	const root = makeMarketplace([
		{ name: 'navigator', description: 'Navigator crew', source: './plugins/navigator', tags: ['crew'] },
	])
	try {
		const result = runCli('--frobnicate', '--root', root)
		expect(result.status).toBe(1)
		expect(result.stderr).toContain('--frobnicate')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// AXI Scenario: tavern --help prints a concise reference
test('tavern --help prints a concise reference', () => {
	const result = runCli('--help')
	expect(result.status).toBe(0)
	expect(result.stdout).toMatch(/Usage:/)
	expect(result.stdout).toContain('--format')
	expect(result.stdout).toContain('Example:')
})

// Scenario: a present-but-malformed marketplace manifest fails loud
test('a present-but-malformed marketplace manifest fails loud', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tavern-malformed-'))
	fs.mkdirSync(path.join(root, '.claude-plugin'), { recursive: true })
	fs.writeFileSync(path.join(root, '.claude-plugin', 'marketplace.json'), '{ not valid json ')
	try {
		const result = runCli('--root', root)
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/could not parse marketplace manifest/i)
		expect(result.stdout).not.toContain('0 crews found')
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
		expect(result.stdout).toContain('cyberplace add navigator')
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
