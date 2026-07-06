import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectMode } from './mode.ts'

describe('detectMode', () => {
	it('reports command-center when no .agents/cyberlegion/config.json marker is present', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-'))
		const info = detectMode({ cwd, env: {} })
		expect(info.mode).toBe('command-center')
		expect(info.cwdRoot).toBe(cwd)
	})

	it('reports ship when the tracked marker is present at this project root', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-'))
		mkdirSync(join(cwd, '.agents', 'cyberlegion'), { recursive: true })
		writeFileSync(join(cwd, '.agents', 'cyberlegion', 'config.json'), '{}\n')
		const info = detectMode({ cwd, env: {} })
		expect(info.mode).toBe('ship')
	})

	it('resolves fleetRoot via cyberlegion resolveRoot (explicit --root/--space wins)', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-'))
		const info = detectMode({ cwd, root: '/tmp/explicit-hub', env: {} })
		expect(info.fleetRoot).toBe('/tmp/explicit-hub')
	})
})
