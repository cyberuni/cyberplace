import { beforeEach, describe, expect, it } from 'vitest'
import type { StateFile } from '../state/state.js'
import { emptyState, takeSnapshot } from '../state/state.js'
import type { PrepareFs } from './fs.js'
import { runPrepare } from './prepare.js'

function makeFs(opts: {
	manifestPlugins?: Record<string, string>
	globalState?: StateFile
	projectState?: StateFile | null
}): PrepareFs & { written: { global?: StateFile; project?: StateFile } } {
	const written: { global?: StateFile; project?: StateFile } = {}
	return {
		readManifest: () => opts.manifestPlugins ?? {},
		readPluginRoots: () => ({}),
		readGlobalState: () => opts.globalState ?? emptyState(),
		readProjectState: () => opts.projectState ?? null,
		writeGlobalState: (s) => {
			written.global = s
		},
		writeProjectState: (s) => {
			written.project = s
		},
		written,
	}
}

describe('runPrepare', () => {
	describe('Given first run (no previous snapshot)', () => {
		it('When prepare runs, Then takes snapshot and reports zero new actions', () => {
			const fs = makeFs({ manifestPlugins: { 'cyber-github': '1.0.0' } })
			const result = runPrepare({
				vendorId: 'claude-code',
				scope: 'global',
				fs,
				now: '2026-06-07T10:00:00Z',
			})
			expect(result.newActionCount).toBe(0)
			expect(fs.written.global).toBeDefined()
			expect(fs.written.global!.snapshots['claude-code']!['global']!.plugins).toEqual({
				'cyber-github': '1.0.0',
			})
		})
	})

	describe('Given plugin added since last snapshot, another vendor is known', () => {
		it('When prepare runs, Then generates install action and reports count = 1', () => {
			let state = takeSnapshot(emptyState(), 'claude-code', 'global', {}, '2026-06-06T00:00:00Z')
			state = takeSnapshot(state, 'cursor', 'global', {}, '2026-06-06T00:00:00Z')
			const fs = makeFs({ manifestPlugins: { 'cyber-github': '1.0.0' }, globalState: state })
			const result = runPrepare({
				vendorId: 'claude-code',
				scope: 'global',
				fs,
				now: '2026-06-07T10:00:00Z',
			})
			expect(result.newActionCount).toBe(1)
			expect(fs.written.global!.pendingActions).toHaveLength(1)
		})
	})

	describe('Given dry-run mode', () => {
		it('When prepare runs with dryRun=true, Then no state is written', () => {
			const fs = makeFs({ manifestPlugins: { 'cyber-github': '1.0.0' } })
			runPrepare({
				vendorId: 'claude-code',
				scope: 'global',
				fs,
				now: '2026-06-07T10:00:00Z',
				dryRun: true,
			})
			expect(fs.written.global).toBeUndefined()
		})
	})

	describe('Given project scope', () => {
		it('When prepare runs with scope=project and no existing project state, Then creates project state', () => {
			const fs = makeFs({ manifestPlugins: { 'cyber-github': '1.0.0' }, projectState: null })
			runPrepare({
				vendorId: 'claude-code',
				scope: 'project',
				fs,
				now: '2026-06-07T10:00:00Z',
			})
			expect(fs.written.project).toBeDefined()
		})
	})
})

describe('runPrepare plugin index', () => {
	const pluginRoots = { 'universal-plugin': '~/.claude/plugins/universal-plugin' }
	let capturedState: StateFile

	beforeEach(() => {
		const capturedStates: StateFile[] = []
		const fs: PrepareFs = {
			readManifest: () => ({ 'universal-plugin': '1.2.3' }),
			readPluginRoots: () => pluginRoots,
			readGlobalState: () => emptyState(),
			readProjectState: () => null,
			writeGlobalState: (s) => {
				capturedStates.push(s)
			},
			writeProjectState: () => {},
		}
		runPrepare({ vendorId: 'claude-code', scope: 'global', fs, now: '2026-01-01T00:00:00Z' })
		capturedState = capturedStates[0]!
	})

	it('writes plugin entry to state', () => {
		expect(capturedState.plugins['claude-code']!['universal-plugin']).toMatchObject({ version: '1.2.3' })
	})

	it('writes asset index entry', () => {
		expect(capturedState.assets['universal-plugin']).toMatchObject({ version: '1.2.3' })
	})
})
