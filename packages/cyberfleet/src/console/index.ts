import { herdrSessionAdapter } from './session.herdr.ts'
import { tmuxSessionAdapter } from './session.tmux.ts'
import type { SessionAdapter } from './session.ts'

/** Backend selection: `$TMUX` → tmux, `$HERDR_ENV` → herdr, else a clear error. */
export function selectSessionAdapter(env: NodeJS.ProcessEnv): SessionAdapter {
	if (env.TMUX) return tmuxSessionAdapter
	if (env.HERDR_ENV) return herdrSessionAdapter
	throw new Error('spawn requires a session backend — run inside tmux ($TMUX) or herdr ($HERDR_ENV=1)')
}

export { herdrSessionAdapter } from './session.herdr.ts'
export { tmuxSessionAdapter } from './session.tmux.ts'
export type {
	SessionAdapter,
	SessionOpenOptions,
	SessionReadOptions,
	SessionTarget,
} from './session.ts'
export type { Worktree, WorktreeAdapter, WorktreeAddOptions, WorktreeRemoveOptions } from './worktree.ts'
export {
	assertDistinctFromPrimary,
	gitWorktreeAdapter,
	resolvePrimaryRoot,
} from './worktree.ts'
