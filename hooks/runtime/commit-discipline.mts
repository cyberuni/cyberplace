import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { formatCommitDisciplineSection, parseCommitDisciplineSection } from '../lib/commit-discipline-content.mts'

async function readStdin(): Promise<string> {
	const chunks: Buffer[] = []
	for await (const chunk of process.stdin) {
		chunks.push(chunk as Buffer)
	}
	return Buffer.concat(chunks).toString('utf8').trim()
}

export default async function run() {
	const verbose = process.argv.includes('--verbose')
	const input = await readStdin()

	if (input && verbose) {
		process.stderr.write(`commit-discipline hook: received ${input.length} bytes on stdin\n`)
	}

	let context: string
	const agentsPath = join(process.cwd(), 'AGENTS.md')
	try {
		const agentsMd = readFileSync(agentsPath, 'utf8')
		context = parseCommitDisciplineSection(agentsMd) ?? formatCommitDisciplineSection('commit')
	} catch {
		context = formatCommitDisciplineSection('commit')
	}

	const payload = {
		hookSpecificOutput: {
			hookEventName: 'SessionStart',
			additionalContext: context.trim(),
		},
	}

	process.stdout.write(`${JSON.stringify(payload)}\n`)
}
