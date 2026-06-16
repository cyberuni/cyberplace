import { describe, expect, it } from 'vitest'
import type { StateFile } from '../state/state.js'
import { emptyState } from '../state/state.js'
import type { VendorRegistry } from '../vendor-registry/vendor-registry.js'
import type { SyncFs } from './sync.js'
import { applySyncAction } from './sync.js'

const cursorRegistry: VendorRegistry = {
	cursor: {
		sessionStartEvent: 'sessionStart',
		globalManifest: null,
		projectManifest: null,
		hookGlob: null,
		globalPluginDir: null,
		pluginRootSuffix: '.cursor-plugin/plugin.json',
		installCommand: 'cursor plugin install {name}',
		removeCommand: 'cursor plugin remove {name}',
		updateCommand: 'cursor plugin update {name}@{version}',
	},
}

const nullCommandRegistry: VendorRegistry = {
	cursor: {
		...cursorRegistry.cursor!,
		installCommand: null,
	},
}

const baseAction = {
	id: 'abc',
	type: 'install' as const,
	plugin: 'cyber-github',
	version: '1.0.0',
	fromVendor: 'claude-code',
	toVendor: 'cursor',
	scope: 'global',
	detectedAt: '2026-06-07T00:00:00Z',
}

function makeFs(opts: {
	state?: StateFile
	shellExitCode?: number
}): SyncFs & { shelled?: string; written?: StateFile } {
	const result: SyncFs & { shelled?: string; written?: StateFile } = {
		readGlobalState: () => opts.state ?? emptyState(),
		writeGlobalState: (s) => {
			result.written = s
		},
		shell: (cmd) => {
			result.shelled = cmd
			return opts.shellExitCode ?? 0
		},
	}
	return result
}

describe('applySyncAction', () => {
	it('returns not-found when action id is missing from state', () => {
		const fs = makeFs({})
		const result = applySyncAction({ actionId: 'missing', registry: cursorRegistry, fs, now: '2026-06-07T10:00:00Z' })
		expect(result.outcome).toBe('not-found')
	})

	it('shells out the install command with substituted plugin name', () => {
		const state: StateFile = { ...emptyState(), pendingActions: [baseAction] }
		const fs = makeFs({ state })
		applySyncAction({ actionId: 'abc', registry: cursorRegistry, fs, now: '2026-06-07T10:00:00Z' })
		expect(fs.shelled).toBe('cursor plugin install cyber-github')
	})

	it('removes action from pendingActions on success', () => {
		const state: StateFile = { ...emptyState(), pendingActions: [baseAction] }
		const fs = makeFs({ state })
		const result = applySyncAction({ actionId: 'abc', registry: cursorRegistry, fs, now: '2026-06-07T10:00:00Z' })
		expect(result.outcome).toBe('applied')
		expect(fs.written!.pendingActions).toHaveLength(0)
	})

	it('returns failed when shell command exits non-zero', () => {
		const state: StateFile = { ...emptyState(), pendingActions: [baseAction] }
		const fs = makeFs({ state, shellExitCode: 1 })
		const result = applySyncAction({ actionId: 'abc', registry: cursorRegistry, fs, now: '2026-06-07T10:00:00Z' })
		expect(result.outcome).toBe('failed')
		expect(fs.written).toBeUndefined()
	})

	it('returns manual outcome and instruction when install command is null', () => {
		const state: StateFile = { ...emptyState(), pendingActions: [baseAction] }
		const fs = makeFs({ state })
		const result = applySyncAction({ actionId: 'abc', registry: nullCommandRegistry, fs, now: '2026-06-07T10:00:00Z' })
		expect(result.outcome).toBe('manual')
		expect(result.instruction).toContain('cyber-github')
		expect(result.instruction).toContain('cursor')
		expect(fs.written!.pendingActions).toHaveLength(0)
	})

	it('substitutes {version} in update command', () => {
		const upgradeAction = { ...baseAction, id: 'upg', type: 'upgrade' as const }
		const state: StateFile = { ...emptyState(), pendingActions: [upgradeAction] }
		const fs = makeFs({ state })
		applySyncAction({ actionId: 'upg', registry: cursorRegistry, fs, now: '2026-06-07T10:00:00Z' })
		expect(fs.shelled).toBe('cursor plugin update cyber-github@1.0.0')
	})
})
