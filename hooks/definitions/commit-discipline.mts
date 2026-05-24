import { hookCommand } from '../lib/hook-command.mts'
import type { HookDefinition } from '../register-agent-hooks.mts'

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
