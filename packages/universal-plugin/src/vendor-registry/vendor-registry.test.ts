import { describe, expect, it } from 'vitest'
import type { VendorConfig, VendorRegistry } from './vendor-registry.js'
import { lookupVendor, mergeRegistries } from './vendor-registry.js'

const claudeCode: VendorConfig = {
	sessionStartEvent: 'SessionStart',
	globalManifest: '~/.claude/plugins/installed_plugins.json',
	projectManifest: null,
	hookGlob: '~/.claude/plugins/universal-plugin/hooks/hooks.json',
	globalPluginDir: '~/.claude/plugins/',
	pluginRootSuffix: '.claude-plugin/plugin.json',
	installCommand: 'claude plugin install {name}',
	removeCommand: 'claude plugin remove {name}',
	updateCommand: 'claude plugin update {name}@{version}',
}

const base: VendorRegistry = { 'claude-code': claudeCode }

it('claudeCode fixture has pluginRootSuffix', () => {
	expect(claudeCode.pluginRootSuffix).toBe('.claude-plugin/plugin.json')
})

describe('lookupVendor', () => {
	it('returns config for known vendor', () => {
		expect(lookupVendor(base, 'claude-code')).toEqual(claudeCode)
	})

	it('returns null for unknown vendor', () => {
		expect(lookupVendor(base, 'unknown')).toBeNull()
	})
})

describe('mergeRegistries', () => {
	it('user override replaces fields in base', () => {
		const override: VendorRegistry = {
			'claude-code': { ...claudeCode, installCommand: 'my-custom-install {name}' },
		}
		const merged = mergeRegistries(base, override)
		expect(merged['claude-code']!.installCommand).toBe('my-custom-install {name}')
	})

	it('user override can add a new vendor', () => {
		const override: VendorRegistry = {
			'my-vendor': { ...claudeCode, sessionStartEvent: 'customStart' },
		}
		const merged = mergeRegistries(base, override)
		expect(merged['my-vendor']).toBeDefined()
		expect(merged['claude-code']).toBeDefined()
	})

	it('base is unchanged when override is empty', () => {
		expect(mergeRegistries(base, {})).toEqual(base)
	})
})
