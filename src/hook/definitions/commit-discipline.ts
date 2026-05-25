import { hookCommand } from '../command.js'
import type { HookDefinition } from '../register.js'

export function getCommitDisciplineHooks(root = process.cwd()): HookDefinition[] {
	const command = hookCommand('hook run commit-discipline', root)
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
