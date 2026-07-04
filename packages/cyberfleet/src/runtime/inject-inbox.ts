import { existsSync, readFileSync } from 'node:fs'
import { type IdContext, loadAgent, resolveSelfId, saveAgent } from '../identity.ts'
import { inbox } from '../message.ts'
import { paths } from '../paths.ts'

export type HookEvent = 'SessionStart' | 'PostToolUse'
const EVENTS: HookEvent[] = ['SessionStart', 'PostToolUse']

export interface InjectPayload {
	hookSpecificOutput: { hookEventName: HookEvent; additionalContext: string }
}

/**
 * Resolve the calling agent, gather its pending brief + unread mail, and return the
 * SessionStart-style injection payload — or null when there is nothing to inject (an
 * unregistered caller or an empty inbox never fails the harness hook).
 */
export function injectInbox(ctx: IdContext, event: string): InjectPayload | null {
	if (!EVENTS.includes(event as HookEvent)) {
		throw new Error(`unsupported --event "${event}" (expected ${EVENTS.join(' | ')})`)
	}
	const meId = resolveSelfId(ctx)
	if (!meId) return null // unregistered caller — inject nothing, don't error the hook

	const parts: string[] = []
	const rec = loadAgent(ctx.root, meId)
	if (rec?.status === 'spawning') {
		const briefFile = paths.briefFile(ctx.root, meId)
		if (existsSync(briefFile)) {
			parts.push(`## Your brief\n\n${readFileSync(briefFile, 'utf8').trim()}`)
		}
		rec.status = 'active'
		saveAgent(ctx.root, rec)
	}

	const unread = inbox({ root: ctx.root }, { meId, unread: true })
	if (unread.length > 0) {
		const lines = unread.map(
			(m) => `- **${m.fromHandle}**${m.subject ? ` — ${m.subject}` : ''}: ${m.body} \`(${m.id})\``,
		)
		parts.push(`## Unread fleet mail (${unread.length})\n\n${lines.join('\n')}`)
	}

	if (parts.length === 0) return null
	return { hookSpecificOutput: { hookEventName: event as HookEvent, additionalContext: parts.join('\n\n') } }
}
