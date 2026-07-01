import { describe, expect, it } from 'vitest'
import type { StateFile } from '../state/state.js'
import { emptyState } from '../state/state.js'
import type { SelfUpdateFs } from './self-update.js'
import { runSelfUpdate } from './self-update.js'

function makeFs(
	files: Record<string, string>,
	state: StateFile = emptyState(),
): SelfUpdateFs & { written: Record<string, string>; savedState?: StateFile } {
	const result: SelfUpdateFs & { written: Record<string, string>; savedState?: StateFile } = {
		written: {},
		globHookFiles: () => Object.keys(files),
		readFile: (p) => files[p] ?? '',
		writeFile: (p, content) => {
			result.written[p] = content
		},
		readGlobalState: () => state,
		writeGlobalState: (s) => {
			result.savedState = s
		},
	}
	return result
}

describe('runSelfUpdate', () => {
	it('replaces same-major version pin across all hook files', () => {
		const files = {
			'/hooks/claude.json': '{"SessionStart":[{"command":"npx universal-plugin@1.2.3 prepare claude-code"}]}',
			'/hooks/cursor.json': '{"sessionStart":[{"command":"npx universal-plugin@1.2.3 prepare cursor"}]}',
		}
		const fs = makeFs(files)
		const result = runSelfUpdate({ toVersion: '1.5.0', fs })
		expect(result.updatedCount).toBe(2)
		expect(fs.written['/hooks/claude.json']).toContain('npx universal-plugin@1.5.0')
		expect(fs.written['/hooks/cursor.json']).toContain('npx universal-plugin@1.5.0')
	})

	it('does not touch pins from a different major', () => {
		const files = {
			'/hooks/claude.json': '{"SessionStart":[{"command":"npx universal-plugin@2.0.0 prepare claude-code"}]}',
		}
		const fs = makeFs(files)
		const result = runSelfUpdate({ toVersion: '1.5.0', fs })
		expect(result.updatedCount).toBe(0)
		expect(fs.written['/hooks/claude.json']).toBeUndefined()
	})

	it('does not rewrite a file that already has the target version', () => {
		const files = {
			'/hooks/claude.json': '{"SessionStart":[{"command":"npx universal-plugin@1.5.0 prepare claude-code"}]}',
		}
		const fs = makeFs(files)
		const result = runSelfUpdate({ toVersion: '1.5.0', fs })
		expect(result.updatedCount).toBe(0)
	})

	it('throws on non-numeric major version', () => {
		const fs = makeFs({})
		expect(() => runSelfUpdate({ toVersion: '(evil|)1.0.0', fs })).toThrow('Invalid version format')
	})

	it('clears the uniPluginUpdates entry for the updated major', () => {
		const state: StateFile = {
			...emptyState(),
			uniPluginUpdates: {
				'1': { current: '1.2.3', available: '1.5.0', detectedAt: '2026-06-07T00:00:00Z' },
				'2': { current: '2.0.0', available: '2.1.0', detectedAt: '2026-06-07T00:00:00Z' },
			},
		}
		const fs = makeFs({}, state)
		runSelfUpdate({ toVersion: '1.5.0', fs })
		expect(fs.savedState!.uniPluginUpdates['1']).toBeUndefined()
		expect(fs.savedState!.uniPluginUpdates['2']).toBeDefined()
	})
})
