import { hookCommand } from '../lib/hook-command.mjs'
import type { HookDefinition } from '../register-agent-hooks.mjs'

export function getInitHooks(root = process.cwd()): HookDefinition[] {
	return [
		{
			id: 'mark-internal',
			label: 'PostToolUse › mark-internal',
			command: hookCommand('run-hook mark-internal', root),
			claude: { event: 'PostToolUse', matcher: 'Write|Edit' },
			cursor: { event: 'afterFileEdit' },
			codex: { event: 'PostToolUse', matcher: 'Write|Edit' },
		},
		{
			id: 'inject-local-augmentations',
			label: 'SessionStart › inject-local-augmentations',
			command: hookCommand('run-hook inject-local-augmentations', root),
			claude: { event: 'SessionStart' },
			codex: { event: 'SessionStart' },
		},
	]
}
