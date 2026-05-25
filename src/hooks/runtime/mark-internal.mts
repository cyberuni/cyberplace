import { readFileSync, writeFileSync } from 'node:fs'

async function readStdin(): Promise<string> {
	const chunks: Buffer[] = []
	for await (const chunk of process.stdin) {
		chunks.push(chunk as Buffer)
	}
	return Buffer.concat(chunks).toString('utf8').trim()
}

export default async function run() {
	const input = await readStdin()

	let filePath = ''
	if (input) {
		try {
			const parsed = JSON.parse(input) as { tool_input?: { file_path?: string } }
			filePath = parsed.tool_input?.file_path ?? ''
		} catch {
			// not JSON, ignore
		}
	}

	if (!filePath || !/.agents\/skills\/[^/]+\/SKILL\.md$/.test(filePath)) return

	let content: string
	try {
		content = readFileSync(filePath, 'utf8')
	} catch {
		return
	}

	if (/^\s*internal:\s*true/m.test(content)) return

	if (/^metadata:/m.test(content)) {
		content = content.replace(/^(metadata:\n)/m, '$1  internal: true\n')
	} else {
		// insert before the closing --- of frontmatter
		const match = /^---$/m.exec(content.slice(3))
		if (!match) return
		const pos = 3 + match.index
		content = content.slice(0, pos) + 'metadata:\n  internal: true\n' + content.slice(pos)
	}

	writeFileSync(filePath, content, 'utf8')
}
