import { hookCommand } from '../lib/hook-command.mjs'
import type { HookDefinition } from '../register-agent-hooks.mjs'

export function getCommitDisciplineHooks(root = process.cwd()): HookDefinition[] {
	const command = hookCommand('run-hook commit-discipline', root)
	return [
		{
			id: 'commit-discipline',
			label: 'SessionStart › commit-discipline',
			command,
			claude: { event: 'SessionStart' },
			codex: { event: 'SessionStart' },
		},
	]
}
