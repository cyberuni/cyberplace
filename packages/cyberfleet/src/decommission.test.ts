import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { decommission } from './decommission.ts'
import { type AgentRecord, type Exec, saveAgent } from './identity.ts'
import { paths } from './paths.ts'

let root: string
let worktreeRoot: string
const primaryRoot = '/repo'

beforeEach(() => {
	const tmp = mkdtempSync(join(tmpdir(), 'cf-'))
	root = join(tmp, '.cyberfleet')
	worktreeRoot = join(tmp, 'ship-worktree')
	mkdirSync(worktreeRoot, { recursive: true })
})

/** A fake `exec` covering git worktree/status calls plus tmux/herdr session calls, with hooks. */
function makeExec(
	opts: {
		worktreeRemove?: (path: string) => string | null
		dirty?: boolean
		tmuxKillPane?: (args: string[]) => string | null
		herdrClose?: (args: string[]) => string | null
	} = {},
): { exec: Exec; calls: { worktreeRemove: string[][]; tmuxKill: string[][]; herdrClose: string[][] } } {
	const calls = { worktreeRemove: [] as string[][], tmuxKill: [] as string[][], herdrClose: [] as string[][] }
	const exec: Exec = (cmd, args) => {
		if (cmd === 'git') {
			if (args.includes('--git-common-dir')) return `${primaryRoot}/.git`
			if (args.includes('status')) return opts.dirty ? ' M file.txt' : ''
			if (args.includes('worktree') && args.includes('remove')) {
				calls.worktreeRemove.push(args)
				const path = args[args.length - 2]!
				return opts.worktreeRemove ? opts.worktreeRemove(path) : ''
			}
			return null
		}
		if (cmd === 'tmux' && args[0] === 'kill-pane') {
			calls.tmuxKill.push(args)
			return opts.tmuxKillPane ? opts.tmuxKillPane(args) : ''
		}
		if (cmd === 'herdr' && args[0] === 'pane' && args[1] === 'close') {
			calls.herdrClose.push(args)
			return opts.herdrClose ? opts.herdrClose(args) : ''
		}
		return null
	}
	return { exec, calls }
}

function registerShip(rec: Partial<AgentRecord> & { id: string }): AgentRecord {
	const full: AgentRecord = {
		handle: rec.id.slice(0, 6),
		harness: 'claude',
		cwd: worktreeRoot,
		status: 'active',
		createdAt: '2026-01-01T00:00:00.000Z',
		lastSeen: '2026-01-01T00:00:00.000Z',
		worktree: { root: worktreeRoot, branch: `cyberfleet/ship-${rec.id}` },
		tmux: { pane: '%9' },
		...rec,
	}
	saveAgent(root, full)
	return full
}

function writePaneFile(pane: string, id: string): void {
	mkdirSync(paths.panesDir(root), { recursive: true })
	writeFileSync(paths.paneFile(root, pane), id)
}

function writeData(id: string): void {
	mkdirSync(paths.dataDir(root, id), { recursive: true })
	writeFileSync(paths.briefFile(root, id), 'brief')
}

describe('teardown worktree + session', () => {
	it('removes the worktree through the worktree adapter and tears down the pane through the session adapter', () => {
		registerShip({ id: 'a1' })
		const { exec, calls } = makeExec()
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'a1' })
		expect(calls.worktreeRemove[0]).toEqual(expect.arrayContaining(['-C', primaryRoot, 'worktree', 'remove']))
		expect(calls.tmuxKill[0]).toEqual(['kill-pane', '-t', '%9'])
	})

	it('tears down through the tmux adapter when $TMUX is set', () => {
		registerShip({ id: 'a2' })
		const { exec, calls } = makeExec()
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'a2' })
		expect(calls.tmuxKill).toHaveLength(1)
		expect(calls.herdrClose).toHaveLength(0)
	})

	it('uses the herdr adapter when $TMUX is unset and $HERDR_ENV is set', () => {
		registerShip({ id: 'a3', tmux: null })
		writePaneFile('herdr-pane-1', 'a3')
		const { exec, calls } = makeExec()
		decommission({ root, env: { HERDR_ENV: '1' }, exec }, { id: 'a3' })
		expect(calls.herdrClose[0]).toEqual(['pane', 'close', 'herdr-pane-1'])
		expect(calls.tmuxKill).toHaveLength(0)
	})

	it("resolves a herdr ship's pane from the panes/<pane>.id reverse index when the record has none", () => {
		registerShip({ id: 'a4', tmux: null })
		writePaneFile('herdr-pane-2', 'a4')
		const { exec, calls } = makeExec()
		decommission({ root, env: { HERDR_ENV: '1' }, exec }, { id: 'a4' })
		expect(calls.herdrClose[0]).toEqual(['pane', 'close', 'herdr-pane-2'])
	})
})

describe('reap the record', () => {
	it('reaps agents/<id>.json, panes/<pane>.id, and data/<id>/ after teardown', () => {
		registerShip({ id: 'b1' })
		writePaneFile('%9', 'b1')
		writeData('b1')
		const { exec } = makeExec()
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'b1' })
		expect(existsSync(paths.agentFile(root, 'b1'))).toBe(false)
		expect(existsSync(paths.paneFile(root, '%9'))).toBe(false)
		expect(existsSync(paths.dataDir(root, 'b1'))).toBe(false)
	})

	it("reaps only the decommissioned ship's state, leaving another ship's untouched", () => {
		registerShip({ id: 'b2', tmux: { pane: '%9' } })
		writePaneFile('%9', 'b2')
		writeData('b2')
		const otherRoot = join(worktreeRoot, '..', 'other-worktree')
		mkdirSync(otherRoot, { recursive: true })
		registerShip({ id: 'other', worktree: { root: otherRoot, branch: 'cyberfleet/ship-other' }, tmux: { pane: '%8' } })
		writePaneFile('%8', 'other')
		writeData('other')

		const { exec } = makeExec()
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'b2' })

		expect(existsSync(paths.agentFile(root, 'other'))).toBe(true)
		expect(existsSync(paths.paneFile(root, '%8'))).toBe(true)
		expect(existsSync(paths.dataDir(root, 'other'))).toBe(true)
	})
})

describe('the flagship rule (ADR-0022 decision 8)', () => {
	it('refuses a ship whose worktree root equals the primary checkout, and reaps nothing', () => {
		registerShip({ id: 'c1', worktree: { root: primaryRoot } })
		const { exec, calls } = makeExec()
		expect(() => decommission({ root, env: { TMUX: 't' }, exec }, { id: 'c1' })).toThrow(/flagship|primary checkout/)
		expect(existsSync(paths.agentFile(root, 'c1'))).toBe(true)
		expect(calls.worktreeRemove).toHaveLength(0)
	})

	it('--force does not override the flagship rule', () => {
		registerShip({ id: 'c2', worktree: { root: primaryRoot } })
		const { exec } = makeExec()
		expect(() => decommission({ root, env: { TMUX: 't' }, exec }, { id: 'c2', force: true })).toThrow(
			/flagship|primary checkout/,
		)
		expect(existsSync(paths.agentFile(root, 'c2'))).toBe(true)
	})
})

describe('dirty-worktree refusal', () => {
	it('refuses a ship with uncommitted changes, reaping nothing', () => {
		registerShip({ id: 'd1' })
		const { exec } = makeExec({ dirty: true })
		expect(() => decommission({ root, env: { TMUX: 't' }, exec }, { id: 'd1' })).toThrow(/uncommitted/)
		expect(existsSync(paths.agentFile(root, 'd1'))).toBe(true)
	})

	it('with --force tears down a dirty worktree and reaps the record', () => {
		registerShip({ id: 'd2' })
		const { exec, calls } = makeExec({ dirty: true })
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'd2', force: true })
		expect(calls.worktreeRemove).toHaveLength(1)
		expect(existsSync(paths.agentFile(root, 'd2'))).toBe(false)
	})
})

describe('unknown id', () => {
	it('errors and reaps nothing when no agents/<id>.json exists', () => {
		const { exec } = makeExec()
		expect(() => decommission({ root, env: { TMUX: 't' }, exec }, { id: 'ghost' })).toThrow(/no ship registered/)
		expect(existsSync(paths.agentsDir(root))).toBe(false)
	})
})

describe('idempotent reap (already-gone is tolerated)', () => {
	it('completes the reap when the worktree no longer exists on disk', () => {
		registerShip({ id: 'e1', worktree: { root: join(worktreeRoot, 'gone') } })
		writeData('e1')
		const { exec, calls } = makeExec()
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'e1' })
		expect(calls.worktreeRemove).toHaveLength(0) // never even attempted — nothing on disk to remove
		expect(existsSync(paths.agentFile(root, 'e1'))).toBe(false)
		expect(existsSync(paths.dataDir(root, 'e1'))).toBe(false)
	})

	it('completes the reap when the pane no longer exists', () => {
		registerShip({ id: 'e2' })
		writeData('e2')
		const { exec } = makeExec({ tmuxKillPane: () => null }) // simulates the backend reporting failure
		decommission({ root, env: { TMUX: 't' }, exec }, { id: 'e2' })
		expect(existsSync(paths.agentFile(root, 'e2'))).toBe(false)
		expect(existsSync(paths.dataDir(root, 'e2'))).toBe(false)
	})
})

describe('teardown precedes reap — a genuine failure is not tolerated', () => {
	it('aborts without reaping when worktree removal genuinely fails', () => {
		registerShip({ id: 'f1' })
		writeData('f1')
		const { exec } = makeExec({ worktreeRemove: () => null }) // exec reports a real failure
		expect(() => decommission({ root, env: { TMUX: 't' }, exec }, { id: 'f1' })).toThrow(/aborted|removal failed/)
		expect(existsSync(paths.agentFile(root, 'f1'))).toBe(true)
		expect(existsSync(paths.dataDir(root, 'f1'))).toBe(true)
	})
})
