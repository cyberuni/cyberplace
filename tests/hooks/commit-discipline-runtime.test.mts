import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

const bin = path.resolve('bin/cyber-skills.mts')

test('run-hook commit-discipline emits SessionStart JSON', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-hook-'))
	try {
		fs.writeFileSync(path.join(root, 'AGENTS.md'), '## Commit Discipline\n\n- Custom rule\n')
		const result = spawnSync('node', ['--experimental-strip-types', bin, 'run-hook', 'commit-discipline'], {
			cwd: root,
			encoding: 'utf8',
			input: '{}',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const payload = JSON.parse(result.stdout.trim()) as {
			hookSpecificOutput: { hookEventName: string; additionalContext: string }
		}
		expect(payload.hookSpecificOutput.hookEventName).toBe('SessionStart')
		expect(payload.hookSpecificOutput.additionalContext).toContain('Custom rule')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})
