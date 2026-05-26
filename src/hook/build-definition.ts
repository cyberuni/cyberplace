import { hookCommand } from './command.js'
import type { HookDefinition } from './register.js'

export type HookEvent = 'SessionStart' | 'PostToolUse'

export interface RegisterHookInput {
	name: string
	event: HookEvent
	file?: string
	glob?: string
	extract?: string
	heading?: string
	matcher?: string
}

function shellQuote(value: string): string {
	if (/^[A-Za-z0-9_./:-]+$/.test(value)) return value
	return `'${value.replace(/'/g, `'\\''`)}'`
}

export function buildRunArgs(input: RegisterHookInput): string {
	const args = ['hook', 'run', '--name', input.name]
	if (input.file) {
		args.push('--file', shellQuote(input.file))
	} else if (input.glob) {
		args.push('--glob', shellQuote(input.glob))
	} else if (input.extract) {
		args.push('--extract', shellQuote(input.extract), '--heading', shellQuote(input.heading ?? ''))
	}
	return args.join(' ')
}

export function buildHookDefinition(input: RegisterHookInput, root = process.cwd()): HookDefinition {
	const modes = [input.file, input.glob, input.extract].filter(Boolean)
	if (modes.length !== 1) {
		throw new Error('Exactly one of file, glob, or extract is required')
	}
	if (input.extract && !input.heading) {
		throw new Error('--extract requires --heading')
	}

	const command = hookCommand(buildRunArgs(input), root)
	const label = `${input.event} › ${input.name}`

	if (input.event === 'SessionStart') {
		return {
			id: input.name,
			label,
			command,
			claude: { event: 'SessionStart' },
			cursor: { event: 'sessionStart' },
			codex: { event: 'SessionStart' },
		}
	}

	const matcher = input.matcher ?? 'Write|Edit'
	return {
		id: input.name,
		label,
		command,
		claude: { event: 'PostToolUse', matcher },
		codex: { event: 'PostToolUse', matcher },
	}
}
