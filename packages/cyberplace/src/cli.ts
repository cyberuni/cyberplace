#!/usr/bin/env node
import { Command } from 'commander'

import { awesomeCommand } from './awesome/cli.js'
import { commitCommand } from './commit/cli.js'
import { governanceCommand } from './governance/cli.js'
import { hookCommand } from './hook/cli.js'
import {
	addCommand,
	configCommand,
	findCommand,
	listCommand,
	migrateCommand,
	removeCommand,
	updateCommand,
} from './registry/cli.js'
import { tavernCommand } from './tavern/cli.js'

const program = new Command()

program.name('cyberplace').description('Skills, hooks, and workflows for AI agents').version('0.0.0')

program.addCommand(awesomeCommand())
program.addCommand(commitCommand())
program.addCommand(governanceCommand())
program.addCommand(hookCommand())
program.addCommand(tavernCommand())

// Registry commands (top-level for ergonomics)
program.addCommand(addCommand())
program.addCommand(removeCommand())
program.addCommand(updateCommand())
program.addCommand(listCommand())
program.addCommand(findCommand())
program.addCommand(migrateCommand())
program.addCommand(configCommand())

program.parseAsync(process.argv).catch((err: unknown) => {
	process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
	process.exit(1)
})
