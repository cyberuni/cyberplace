import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { initShip } from './init.ts'
import { detectMode } from './mode.ts'

describe('initShip', () => {
	// Scenario: init writes the marker when none is present
	it('writes .agents/cyberfleet/ship.json recording a schema version when absent', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-init-'))
		const result = initShip(cwd)
		expect(result.created).toBe(true)
		const markerPath = join(cwd, '.agents', 'cyberfleet', 'ship.json')
		expect(existsSync(markerPath)).toBe(true)
		const contents = JSON.parse(readFileSync(markerPath, 'utf8'))
		expect(contents.version).toBe(1)
	})

	// Scenario: init on an already-initialized directory is a no-op
	it('does not overwrite an existing marker', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-init-'))
		initShip(cwd)
		const markerPath = join(cwd, '.agents', 'cyberfleet', 'ship.json')
		const before = statSync(markerPath).mtimeMs
		const beforeContents = readFileSync(markerPath, 'utf8')

		const result = initShip(cwd)

		expect(result.created).toBe(false)
		const after = statSync(markerPath).mtimeMs
		const afterContents = readFileSync(markerPath, 'utf8')
		expect(after).toBe(before)
		expect(afterContents).toBe(beforeContents)
	})

	// Scenario: re-running init does not error
	it('re-running init on an already-initialized directory does not throw', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-init-'))
		initShip(cwd)
		expect(() => initShip(cwd)).not.toThrow()
	})

	// Scenario: init works in a non-git folder
	it('creates the marker in a plain non-git folder', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-init-nogit-'))
		expect(existsSync(join(cwd, '.git'))).toBe(false)
		const result = initShip(cwd)
		expect(result.created).toBe(true)
		expect(existsSync(join(cwd, '.agents', 'cyberfleet', 'ship.json'))).toBe(true)
	})

	// Extra guard (deliberately kept out of the frozen suite): init never touches cyberlegion's
	// own namespace — cyberfleet owns its marker entirely separately.
	it('does not create or modify anything under .agents/cyberlegion/', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-init-'))
		initShip(cwd)
		expect(existsSync(join(cwd, '.agents', 'cyberlegion'))).toBe(false)
	})

	// Extra guard (deliberately kept out of the frozen suite): init → mode composes end-to-end —
	// after init, detectMode at the same root reports ship.
	it('composes with detectMode: after init, this root reports mode ship', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-init-'))
		initShip(cwd)
		const info = detectMode({ cwd, env: {} })
		expect(info.mode).toBe('ship')
	})
})
