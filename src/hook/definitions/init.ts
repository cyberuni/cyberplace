import { hookCommand } from '../command.js'
import type { HookDefinition } from '../register.js'

export function getInitHooks(root = process.cwd()): HookDefinition[] {
	return [
		{
			id: 'mark-internal',
			label: 'PostToolUse › mark-internal',
			command: hookCommand('hook run mark-internal', root),
			claude: { event: 'PostToolUse', matcher: 'Write|Edit' },
			cursor: { event: 'afterFileEdit' },
			codex: { event: 'PostToolUse', matcher: 'Write|Edit' },
		},
		{
			id: 'inject-local-augmentations',
			label: 'SessionStart › inject-local-augmentations',
			command: hookCommand('hook run inject-local-augmentations', root),
			claude: { event: 'SessionStart' },
			codex: { event: 'SessionStart' },
		},
	]
}
