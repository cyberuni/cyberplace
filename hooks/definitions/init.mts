import type { HookDefinition } from '../register-agent-hooks.mts'

const MARK_INTERNAL = 'bash .agents/hooks/mark-internal.sh'
const INJECT_AUGMENTATIONS = 'bash .agents/hooks/inject-local-augmentations.sh'

export const INIT_HOOKS: HookDefinition[] = [
	{
		id: 'mark-internal',
		label: 'PostToolUse › mark-internal',
		command: MARK_INTERNAL,
		claude: { event: 'PostToolUse', matcher: 'Write|Edit' },
		cursor: { event: 'afterFileEdit' },
		codex: { event: 'PostToolUse', matcher: 'Write|Edit' },
	},
	{
		id: 'inject-local-augmentations',
		label: 'SessionStart › inject-local-augmentations',
		command: INJECT_AUGMENTATIONS,
		claude: { event: 'SessionStart' },
		codex: { event: 'SessionStart' },
	},
]
