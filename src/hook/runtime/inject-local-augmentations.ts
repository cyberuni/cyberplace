import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { basename, dirname } from 'node:path'

export default async function run() {
	const matches: string[] = []
	try {
		for await (const f of glob('.agents/skills/**/SKILL.local.md')) {
			matches.push(f)
		}
	} catch {
		return
	}

	if (matches.length === 0) return

	const parts: string[] = []
	for (const localMd of matches.sort()) {
		const skill = basename(dirname(localMd))
		const content = readFileSync(localMd, 'utf8')
		parts.push(`### Local augmentation for skill: ${skill}\n\n${content}`)
	}

	const additionalContext = parts.join('\n\n')
	const payload = {
		hookSpecificOutput: {
			hookEventName: 'SessionStart',
			additionalContext,
		},
	}
	process.stdout.write(`${JSON.stringify(payload)}\n`)
}
