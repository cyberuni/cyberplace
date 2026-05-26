import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printTable } from '../output.js'
import { buildHookDefinition, type RegisterHookInput } from './build-definition.js'
import { printResults, registerHook } from './register.js'
import runInjectInstructions from './runtime/inject-instructions.js'

export function hookCommand(): Command {
	const cmd = new Command('hook').description('Manage and run agent hooks')

	cmd
		.command('run')
		.description('Run an instruction hook (SessionStart context injection)')
		.option('--name <name>', 'Hook name (for logging and idempotency)')
		.option('--file <path>', 'Read instructions from a file')
		.option('--glob <pattern>', 'Glob files and inject their contents')
		.option('--extract <path>', 'Extract a markdown section from a file')
		.option('--heading <heading>', 'Heading to extract (required with --extract)')
		.option('--verbose', 'Human-readable status on stderr')
		.action(async (opts: { name?: string; file?: string; glob?: string; extract?: string; heading?: string }) => {
			await runInjectInstructions({
				name: opts.name,
				file: opts.file,
				glob: opts.glob,
				extract: opts.extract,
				heading: opts.heading,
			})
		})

	cmd
		.command('register')
		.description('Register an instruction hook in agent settings')
		.requiredOption('--name <name>', 'Hook name')
		.option('--event <event>', 'Hook event', 'SessionStart')
		.option('--file <path>', 'Instruction file path')
		.option('--glob <pattern>', 'Glob pattern for dynamic instructions')
		.option('--extract <path>', 'Markdown file to extract a section from')
		.option('--heading <heading>', 'Heading to extract (required with --extract)')
		.option('--matcher <matcher>', 'PostToolUse matcher (default Write|Edit)')
		.option(
			'--npx-yes',
			'Register npx hook commands with --yes (after user consented to npm install; SessionStart cannot prompt)',
		)
		.addOption(ROOT_OPTION)
		.option('--dry-run', 'Preview without writing')
		.option('--verbose', 'Human-readable status on stderr')
		.option('--json', 'Output raw JSON')
		.action(
			(opts: {
				name: string
				event: string
				file?: string
				glob?: string
				extract?: string
				heading?: string
				matcher?: string
				npxYes?: boolean
				root?: string
				dryRun: boolean
				verbose: boolean
			}) => {
				const root = resolveRoot(opts.root)
				if (opts.event !== 'SessionStart' && opts.event !== 'PostToolUse') {
					process.stderr.write('--event must be SessionStart or PostToolUse\n')
					process.exit(1)
				}

				const modes = [opts.file, opts.glob, opts.extract].filter(Boolean)
				if (modes.length !== 1) {
					process.stderr.write('Exactly one of --file, --glob, or --extract is required\n')
					process.exit(1)
				}
				if (opts.extract && !opts.heading) {
					process.stderr.write('--extract requires --heading\n')
					process.exit(1)
				}

				const input: RegisterHookInput = {
					name: opts.name,
					event: opts.event as RegisterHookInput['event'],
					file: opts.file,
					glob: opts.glob,
					extract: opts.extract,
					heading: opts.heading,
					matcher: opts.matcher,
					npxYes: opts.npxYes,
				}

				try {
					buildHookDefinition(input, root)
				} catch (err) {
					process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
					process.exit(1)
				}

				const results = registerHook(input, { root, dryRun: opts.dryRun })
				if (opts.verbose) {
					printResults(results, opts.dryRun)
				} else {
					output(results, () =>
						printTable(results, [
							{ label: 'Agent', get: (r) => r.agent },
							{ label: 'Hook', get: (r) => r.hook },
							{ label: 'Status', get: (r) => r.status },
						]),
					)
				}
			},
		)

	return cmd
}
