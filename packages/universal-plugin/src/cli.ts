#!/usr/bin/env node
import { Command } from 'commander'

import { cleanCommand } from './asset-store/cli.js'
import { buildCommand } from './build/cli.js'
import { governanceCommand } from './governance/cli.js'
import { prepareCommand } from './prepare/cli.js'
import { publishCommand } from './publish/cli.js'
import { selfUpdateCommand } from './self-update/cli.js'
import { syncCommand } from './sync/cli.js'

const program = new Command()

program.name('universal-plugin').description('Universal AI agent plugin build tool').version('0.0.0').helpCommand(false)

program.addCommand(buildCommand())
program.addCommand(cleanCommand())
program.addCommand(governanceCommand())
program.addCommand(prepareCommand())
program.addCommand(publishCommand())
program.addCommand(syncCommand())
program.addCommand(selfUpdateCommand())

program.parseAsync(process.argv).catch((err: unknown) => {
	process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
	process.exit(1)
})
