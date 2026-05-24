#!/usr/bin/env node
/**
 * Registers init-skill hooks for detected AI agents (Claude Code, Cursor, Codex).
 * Idempotent: safe to re-run; only writes when a hook is missing.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const MARK_INTERNAL = 'bash .agents/hooks/mark-internal.sh'
const INJECT_AUGMENTATIONS = 'bash .agents/hooks/inject-local-augmentations.sh'

// Claude Code / Codex hook shape
interface ClaudeHookEntry {
	type: string
	command: string
}
interface ClaudeHookGroup {
	matcher?: string
	hooks: ClaudeHookEntry[]
}
interface ClaudeSettings {
	hooks?: {
		PostToolUse?: ClaudeHookGroup[]
		SessionStart?: ClaudeHookGroup[]
		[key: string]: ClaudeHookGroup[] | undefined
	}
	[key: string]: unknown
}

// Cursor hook shape
interface CursorHookEntry {
	command: string
}
interface CursorSettings {
	version?: number
	hooks?: {
		afterFileEdit?: CursorHookEntry[]
		[key: string]: CursorHookEntry[] | undefined
	}
	[key: string]: unknown
}

export type HookStatus = 'registered' | 'already present' | 'skipped (dir not found)'

export interface HookResult {
	agent: string
	hook: string
	status: HookStatus
}

export interface RegisterOptions {
	root?: string
	dryRun?: boolean
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, 'utf8')) as T
}

function writeJson(path: string, data: unknown) {
	writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

function commandExistsInGroups(groups: ClaudeHookGroup[], command: string): boolean {
	return groups.some((g) => g.hooks.some((h) => h.command === command))
}

export function registerHooks(options: RegisterOptions = {}): HookResult[] {
	const root = options.root ?? process.cwd()
	const dryRun = options.dryRun ?? false
	const results: HookResult[] = []

	// --- Claude Code ---

	const claudeDir = join(root, '.claude')
	const claudeSettingsPath = join(claudeDir, 'settings.json')

	if (existsSync(claudeDir)) {
		const settings: ClaudeSettings = existsSync(claudeSettingsPath) ? readJson(claudeSettingsPath) : {}

		settings.hooks ??= {}
		settings.hooks.PostToolUse ??= []
		settings.hooks.SessionStart ??= []

		let changed = false

		if (commandExistsInGroups(settings.hooks.PostToolUse, MARK_INTERNAL)) {
			results.push({ agent: 'Claude Code', hook: 'PostToolUse › mark-internal', status: 'already present' })
		} else {
			const group = settings.hooks.PostToolUse.find((g) => g.matcher === 'Write|Edit')
			if (group) {
				group.hooks.push({ type: 'command', command: MARK_INTERNAL })
			} else {
				settings.hooks.PostToolUse.push({
					matcher: 'Write|Edit',
					hooks: [{ type: 'command', command: MARK_INTERNAL }],
				})
			}
			changed = true
			results.push({ agent: 'Claude Code', hook: 'PostToolUse › mark-internal', status: 'registered' })
		}

		if (commandExistsInGroups(settings.hooks.SessionStart, INJECT_AUGMENTATIONS)) {
			results.push({
				agent: 'Claude Code',
				hook: 'SessionStart › inject-local-augmentations',
				status: 'already present',
			})
		} else {
			if (settings.hooks.SessionStart.length > 0) {
				settings.hooks.SessionStart[0]!.hooks.push({ type: 'command', command: INJECT_AUGMENTATIONS })
			} else {
				settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: INJECT_AUGMENTATIONS }] })
			}
			changed = true
			results.push({ agent: 'Claude Code', hook: 'SessionStart › inject-local-augmentations', status: 'registered' })
		}

		if (changed && !dryRun) {
			writeJson(claudeSettingsPath, settings)
		}
	} else {
		results.push({ agent: 'Claude Code', hook: 'PostToolUse + SessionStart', status: 'skipped (dir not found)' })
	}

	// --- Cursor ---

	const cursorDir = join(root, '.cursor')
	const cursorHooksPath = join(cursorDir, 'hooks.json')

	if (existsSync(cursorDir)) {
		const settings: CursorSettings = existsSync(cursorHooksPath) ? readJson(cursorHooksPath) : { version: 1 }

		settings.version ??= 1
		settings.hooks ??= {}
		settings.hooks.afterFileEdit ??= []

		const alreadyPresent = settings.hooks.afterFileEdit.some((h) => h.command === MARK_INTERNAL)

		if (alreadyPresent) {
			results.push({ agent: 'Cursor', hook: 'afterFileEdit › mark-internal', status: 'already present' })
		} else {
			settings.hooks.afterFileEdit.push({ command: MARK_INTERNAL })
			results.push({ agent: 'Cursor', hook: 'afterFileEdit › mark-internal', status: 'registered' })
			if (!dryRun) writeJson(cursorHooksPath, settings)
		}
	} else {
		results.push({ agent: 'Cursor', hook: 'afterFileEdit', status: 'skipped (dir not found)' })
	}

	// --- Codex ---

	const codexDir = join(root, '.codex-plugin')
	const codexHooksPath = join(codexDir, 'hooks.json')

	if (existsSync(codexDir)) {
		const settings: ClaudeSettings = existsSync(codexHooksPath) ? readJson(codexHooksPath) : {}

		settings.hooks ??= {}
		settings.hooks.PostToolUse ??= []
		settings.hooks.SessionStart ??= []

		let changed = false

		if (commandExistsInGroups(settings.hooks.PostToolUse, MARK_INTERNAL)) {
			results.push({ agent: 'Codex', hook: 'PostToolUse › mark-internal', status: 'already present' })
		} else {
			const group = settings.hooks.PostToolUse.find((g) => g.matcher === 'Write|Edit')
			if (group) {
				group.hooks.push({ type: 'command', command: MARK_INTERNAL })
			} else {
				settings.hooks.PostToolUse.push({
					matcher: 'Write|Edit',
					hooks: [{ type: 'command', command: MARK_INTERNAL }],
				})
			}
			changed = true
			results.push({ agent: 'Codex', hook: 'PostToolUse › mark-internal', status: 'registered' })
		}

		if (commandExistsInGroups(settings.hooks.SessionStart, INJECT_AUGMENTATIONS)) {
			results.push({ agent: 'Codex', hook: 'SessionStart › inject-local-augmentations', status: 'already present' })
		} else {
			if (settings.hooks.SessionStart.length > 0) {
				settings.hooks.SessionStart[0]!.hooks.push({ type: 'command', command: INJECT_AUGMENTATIONS })
			} else {
				settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: INJECT_AUGMENTATIONS }] })
			}
			changed = true
			results.push({ agent: 'Codex', hook: 'SessionStart › inject-local-augmentations', status: 'registered' })
		}

		if (changed && !dryRun) {
			writeJson(codexHooksPath, settings)
		}
	} else {
		results.push({ agent: 'Codex', hook: 'PostToolUse + SessionStart', status: 'skipped (dir not found)' })
	}

	return results
}

// --- CLI entry point ---

if (process.argv[1] === import.meta.filename) {
	const args = process.argv.slice(2)
	const dryRun = args.includes('--dry-run')
	const verbose = args.includes('--verbose')
	const rootIdx = args.indexOf('--root')
	const root = rootIdx !== -1 ? args[rootIdx + 1]! : process.cwd()

	const results = registerHooks({ root, dryRun })

	if (verbose) {
		if (dryRun) console.log('Dry run — no files written.\n')

		const agentWidth = Math.max(...results.map((r) => r.agent.length), 'Agent'.length)
		const hookWidth = Math.max(...results.map((r) => r.hook.length), 'Hook'.length)
		const statusWidth = Math.max(...results.map((r) => r.status.length), 'Status'.length)

		function pad(s: string, n: number) {
			return s.padEnd(n)
		}
		function row(a: string, h: string, s: string) {
			return `| ${pad(a, agentWidth)} | ${pad(h, hookWidth)} | ${pad(s, statusWidth)} |`
		}

		console.log(row('Agent', 'Hook', 'Status'))
		console.log(`|-${'-'.repeat(agentWidth)}-|-${'-'.repeat(hookWidth)}-|-${'-'.repeat(statusWidth)}-|`)
		for (const r of results) {
			console.log(row(r.agent, r.hook, r.status))
		}
	}
}
