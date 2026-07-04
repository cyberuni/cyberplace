import type { SessionAdapter, SessionReadOptions, SessionTarget } from './session.ts'

/** tmux backend — detected via `$TMUX`. */
export const tmuxSessionAdapter: SessionAdapter = {
	name: 'tmux',

	open(exec, opts) {
		const pane = exec('tmux', ['split-window', '-h', '-c', opts.cwd, '-P', '-F', '#{pane_id}'])
		if (!pane) throw new Error('tmux split-window failed')
		const target: SessionTarget = { id: pane }
		tmuxSessionAdapter.send(exec, target, opts.launch)
		return target
	},

	send(exec, target, text) {
		exec('tmux', ['send-keys', '-t', target.id, text, 'Enter'])
	},

	read(exec, target, opts?: SessionReadOptions) {
		const args = ['capture-pane', '-p', '-t', target.id]
		if (opts?.lines != null) args.push('-S', `-${opts.lines}`)
		return exec('tmux', args) ?? ''
	},

	teardown(exec, target) {
		exec('tmux', ['kill-pane', '-t', target.id])
	},
}
