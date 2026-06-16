import { describe, expect, it } from 'vitest'
import type { PendingAction, StateFile } from './state.js'
import {
	addPendingAction,
	emptyState,
	isDismissed,
	mergeSafeState,
	takeSnapshot,
	writeAssetIndex,
	writePluginIndex,
} from './state.js'

describe('emptyState', () => {
	it('returns a valid empty state with schemaVersion 1', () => {
		const s = emptyState()
		expect(s.schemaVersion).toBe(1)
		expect(s.pendingActions).toEqual([])
		expect(s.dismissed).toEqual({})
		expect(s.snapshots).toEqual({})
		expect(s.uniPluginUpdates).toEqual({})
	})
})

describe('mergeSafeState', () => {
	it('preserves unknown top-level fields from stored state', () => {
		const stored = {
			schemaVersion: 1,
			unknownFuture: 'data',
			pendingActions: [],
			dismissed: {},
			snapshots: {},
			uniPluginUpdates: {},
			plugins: {},
			assets: {},
		}
		const merged = mergeSafeState(stored as StateFile)
		expect((merged as unknown as Record<string, unknown>)['unknownFuture']).toBe('data')
	})

	it('skips pendingActions with unknown type without throwing', () => {
		const stored: StateFile = {
			...emptyState(),
			pendingActions: [
				{
					id: '1',
					type: 'future-type' as never,
					plugin: 'p',
					version: '1.0.0',
					fromVendor: 'a',
					toVendor: 'b',
					scope: 'global',
					detectedAt: '2026-01-01T00:00:00Z',
				},
				{
					id: '2',
					type: 'install',
					plugin: 'q',
					version: '1.0.0',
					fromVendor: 'a',
					toVendor: 'b',
					scope: 'global',
					detectedAt: '2026-01-01T00:00:00Z',
				},
			],
		}
		const merged = mergeSafeState(stored)
		expect(merged.pendingActions).toHaveLength(1)
		expect(merged.pendingActions[0]!.id).toBe('2')
	})
})

describe('takeSnapshot', () => {
	it('upserts vendor+scope snapshot with current plugins and timestamp', () => {
		const state = emptyState()
		const plugins = { 'cyber-github': '1.2.0' }
		const now = '2026-06-07T10:00:00Z'
		const updated = takeSnapshot(state, 'claude-code', 'global', plugins, now)
		expect(updated.snapshots['claude-code']!['global']!.plugins).toEqual(plugins)
		expect(updated.snapshots['claude-code']!['global']!.takenAt).toBe(now)
	})

	it('preserves other vendors when updating one', () => {
		let state = takeSnapshot(emptyState(), 'cursor', 'global', { p: '1.0.0' }, '2026-06-06T00:00:00Z')
		state = takeSnapshot(state, 'claude-code', 'global', {}, '2026-06-07T00:00:00Z')
		expect(state.snapshots['cursor']).toBeDefined()
		expect(state.snapshots['claude-code']).toBeDefined()
	})
})

describe('isDismissed', () => {
	it('returns true for version-skipped when version matches', () => {
		const state: StateFile = {
			...emptyState(),
			dismissed: {
				'cursor/global/cyber-github': {
					reason: 'version-skipped',
					version: '1.2.0',
					dismissedAt: '2026-01-01T00:00:00Z',
				},
			},
		}
		expect(isDismissed(state, 'cursor', 'global', 'cyber-github', '1.2.0')).toBe(true)
	})

	it('returns false for version-skipped when version differs (newer offer)', () => {
		const state: StateFile = {
			...emptyState(),
			dismissed: {
				'cursor/global/cyber-github': {
					reason: 'version-skipped',
					version: '1.2.0',
					dismissedAt: '2026-01-01T00:00:00Z',
				},
			},
		}
		expect(isDismissed(state, 'cursor', 'global', 'cyber-github', '1.3.0')).toBe(false)
	})

	it('returns true for keep regardless of version', () => {
		const state: StateFile = {
			...emptyState(),
			dismissed: {
				'cursor/global/cyber-github': {
					reason: 'keep',
					version: null,
					dismissedAt: '2026-01-01T00:00:00Z',
				},
			},
		}
		expect(isDismissed(state, 'cursor', 'global', 'cyber-github', '9.9.9')).toBe(true)
	})

	it('returns false for unknown key', () => {
		expect(isDismissed(emptyState(), 'cursor', 'global', 'cyber-github', '1.0.0')).toBe(false)
	})
})

describe('emptyState plugins and assets', () => {
	it('has empty plugins and assets maps', () => {
		const s = emptyState()
		expect(s.plugins).toEqual({})
		expect(s.assets).toEqual({})
	})
})

describe('writePluginIndex', () => {
	it('sets plugin entry for vendor and plugin name', () => {
		const s = emptyState()
		const updated = writePluginIndex(s, 'claude-code', 'universal-plugin', {
			source: 'npm',
			path: '~/.claude/plugins/universal-plugin',
			version: '1.2.3',
		})
		expect(updated.plugins['claude-code']!['universal-plugin']).toEqual({
			source: 'npm',
			path: '~/.claude/plugins/universal-plugin',
			version: '1.2.3',
		})
	})

	it('does not mutate other vendor entries', () => {
		let s = emptyState()
		s = writePluginIndex(s, 'claude-code', 'universal-plugin', {
			source: 'npm',
			path: '~/.claude/plugins/universal-plugin',
			version: '1.2.3',
		})
		s = writePluginIndex(s, 'cursor', 'universal-plugin', {
			source: 'npm',
			path: '~/.cursor/extensions/universal-plugin',
			version: '1.2.3',
		})
		expect(s.plugins['claude-code']!['universal-plugin']!.path).toBe('~/.claude/plugins/universal-plugin')
		expect(s.plugins['cursor']!['universal-plugin']!.path).toBe('~/.cursor/extensions/universal-plugin')
	})
})

describe('writeAssetIndex', () => {
	it('sets asset entry for plugin name', () => {
		const s = emptyState()
		const updated = writeAssetIndex(s, 'universal-plugin', { source: 'npm', version: '1.2.3' })
		expect(updated.assets['universal-plugin']).toEqual({ source: 'npm', version: '1.2.3' })
	})
})

describe('addPendingAction', () => {
	const action: PendingAction = {
		id: 'abc',
		type: 'install',
		plugin: 'p',
		version: '1.0.0',
		fromVendor: 'claude-code',
		toVendor: 'cursor',
		scope: 'global',
		detectedAt: '2026-01-01T00:00:00Z',
	}

	it('appends action to pendingActions', () => {
		const updated = addPendingAction(emptyState(), action)
		expect(updated.pendingActions).toHaveLength(1)
		expect(updated.pendingActions[0]).toEqual(action)
	})

	it('deduplicates by type+plugin+toVendor+scope', () => {
		const state: StateFile = { ...emptyState(), pendingActions: [action] }
		const dup: PendingAction = { ...action, id: 'xyz' }
		const updated = addPendingAction(state, dup)
		expect(updated.pendingActions).toHaveLength(1)
	})

	it('allows same plugin in different vendors', () => {
		const state: StateFile = { ...emptyState(), pendingActions: [action] }
		const other: PendingAction = { ...action, id: 'def', toVendor: 'codex' }
		const updated = addPendingAction(state, other)
		expect(updated.pendingActions).toHaveLength(2)
	})
})
