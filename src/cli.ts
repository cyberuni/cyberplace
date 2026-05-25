#!/usr/bin/env node
import { Command } from 'commander'

import { auditCommand } from './audit/cli.js'
import { awesomeCommand } from './awesome/cli.js'
import { commitCommand } from './commit/cli.js'
import { governanceCommand } from './governance/cli.js'
import { hookCommand } from './hook/cli.js'
import { skillCommand } from './skill/cli.js'

const program = new Command()

program.name('cyber-skills').description('Skills, hooks, and workflows for AI agents').version('0.0.0')

program.addCommand(auditCommand())
program.addCommand(awesomeCommand())
program.addCommand(commitCommand())
program.addCommand(governanceCommand())
program.addCommand(hookCommand())
program.addCommand(skillCommand())

program.parseAsync(process.argv).catch((err: unknown) => {
	process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
	process.exit(1)
})
