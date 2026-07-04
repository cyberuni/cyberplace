import { describe, expect, it } from 'vitest'
import type { Exec } from '../identity.ts'
import { tmuxSessionAdapter } from './session.tmux.ts'

function fakeExec(calls: string[][], responses: Record<string, string | null> = {}): Exec {
	return (_cmd, args) => {
		calls.push(args)
		return responses[args[0]!] ?? null
	}
}

describe('tmuxSessionAdapter', () => {
	it('open() splits a pane at the given cwd and launches the command in it', () => {
		const calls: string[][] = []
		const exec = fakeExec(calls, { 'split-window': '%9' })
		const target = tmuxSessionAdapter.open(exec, { cwd: '/ship', launch: 'claude' })
		expect(target).toEqual({ id: '%9' })
		expect(calls[0]).toEqual(['split-window', '-h', '-c', '/ship', '-P', '-F', '#{pane_id}'])
		expect(calls[1]).toEqual(['send-keys', '-t', '%9', 'claude', 'Enter'])
	})

	it('open() throws when tmux reports no pane', () => {
		const exec: Exec = () => null
		expect(() => tmuxSessionAdapter.open(exec, { cwd: '/ship', launch: 'claude' })).toThrow(/split-window/)
	})

	it('send() types text into the target pane', () => {
		const calls: string[][] = []
		const exec = fakeExec(calls)
		tmuxSessionAdapter.send(exec, { id: '%3' }, 'hello')
		expect(calls[0]).toEqual(['send-keys', '-t', '%3', 'hello', 'Enter'])
	})

	it('read() captures pane output, optionally scoped to N lines', () => {
		const calls: string[][] = []
		const exec = fakeExec(calls, { 'capture-pane': 'line1\nline2' })
		expect(tmuxSessionAdapter.read(exec, { id: '%3' })).toBe('line1\nline2')
		expect(calls[0]).toEqual(['capture-pane', '-p', '-t', '%3'])

		tmuxSessionAdapter.read(exec, { id: '%3' }, { lines: 50 })
		expect(calls[1]).toEqual(['capture-pane', '-p', '-t', '%3', '-S', '-50'])
	})

	it('teardown() kills the pane', () => {
		const calls: string[][] = []
		const exec = fakeExec(calls)
		tmuxSessionAdapter.teardown(exec, { id: '%3' })
		expect(calls[0]).toEqual(['kill-pane', '-t', '%3'])
	})
})
