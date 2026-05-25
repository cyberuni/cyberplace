#!/usr/bin/env node
/**
 * Registers agent runtime hooks for detected AI agents (Claude Code, Cursor, Codex).
 * Idempotent: safe to re-run; only writes when a hook is missing.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { getCommitDisciplineHooks } from './definitions/commit-discipline.mjs'
import { getInitHooks } from './definitions/init.mjs'
import { commandMatchesHook } from './lib/hook-command.mjs'

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

interface CursorHookEntry {
	command: string
}
interface CursorSettings {
	version?: number
	hooks?: {
		afterFileEdit?: CursorHookEntry[]
		sessionStart?: CursorHookEntry[]
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

export type HookDefinition = {
	id: string
	label: string
	command: string
	claude?: { event: 'PostToolUse' | 'SessionStart'; matcher?: string }
	cursor?: { event: 'afterFileEdit' | 'sessionStart' }
	codex?: { event: 'PostToolUse' | 'SessionStart'; matcher?: string }
}

export type HookSet = 'init' | 'commit-discipline'

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, 'utf8')) as T
}

function writeJson(path: string, data: unknown) {
	writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

function commandExistsInGroups(groups: ClaudeHookGroup[], def: HookDefinition): boolean {
	return groups.some((g) => g.hooks.some((h) => commandMatchesHook(h.command, def.id, def.command)))
}

function registerClaudeHook(
	settings: ClaudeSettings,
	def: HookDefinition,
	event: 'PostToolUse' | 'SessionStart',
): boolean {
	settings.hooks ??= {}
	settings.hooks[event] ??= []

	if (commandExistsInGroups(settings.hooks[event]!, def)) {
		return false
	}

	if (event === 'PostToolUse') {
		const matcher = def.claude?.matcher ?? 'Write|Edit'
		const group = settings.hooks.PostToolUse!.find((g) => g.matcher === matcher)
		if (group) {
			group.hooks.push({ type: 'command', command: def.command })
		} else {
			settings.hooks.PostToolUse!.push({
				matcher,
				hooks: [{ type: 'command', command: def.command }],
			})
		}
	} else {
		if (settings.hooks.SessionStart!.length > 0) {
			settings.hooks.SessionStart![0]!.hooks.push({ type: 'command', command: def.command })
		} else {
			settings.hooks.SessionStart!.push({ hooks: [{ type: 'command', command: def.command }] })
		}
	}
	return true
}

function registerCursorHook(
	settings: CursorSettings,
	def: HookDefinition,
	event: 'afterFileEdit' | 'sessionStart',
): boolean {
	settings.version ??= 1
	settings.hooks ??= {}
	settings.hooks[event] ??= []

	const list = settings.hooks[event]!
	if (list.some((h) => commandMatchesHook(h.command, def.id, def.command))) {
		return false
	}
	list.push({ command: def.command })
	return true
}

export function registerAgentHooks(hooks: HookDefinition[], options: RegisterOptions = {}): HookResult[] {
	const root = options.root ?? process.cwd()
	const dryRun = options.dryRun ?? false
	const results: HookResult[] = []

	const claudeDir = join(root, '.claude')
	const claudeSettingsPath = join(claudeDir, 'settings.json')

	if (existsSync(claudeDir)) {
		const settings: ClaudeSettings = existsSync(claudeSettingsPath) ? readJson(claudeSettingsPath) : {}
		let changed = false

		for (const def of hooks) {
			if (def.claude) {
				const registered = registerClaudeHook(settings, def, def.claude.event)
				if (registered) {
					changed = true
					results.push({ agent: 'Claude Code', hook: def.label, status: 'registered' })
				} else {
					results.push({ agent: 'Claude Code', hook: def.label, status: 'already present' })
				}
			}
		}

		if (changed && !dryRun) {
			writeJson(claudeSettingsPath, settings)
		}
	} else {
		const claudeHooks = hooks.filter((h) => h.claude)
		if (claudeHooks.length > 0) {
			results.push({
				agent: 'Claude Code',
				hook: claudeHooks.map((h) => h.label).join(', '),
				status: 'skipped (dir not found)',
			})
		}
	}

	const cursorDir = join(root, '.cursor')
	const cursorHooksPath = join(cursorDir, 'hooks.json')

	if (existsSync(cursorDir)) {
		const settings: CursorSettings = existsSync(cursorHooksPath) ? readJson(cursorHooksPath) : { version: 1 }
		let changed = false

		for (const def of hooks) {
			if (def.cursor) {
				const registered = registerCursorHook(settings, def, def.cursor.event)
				if (registered) {
					changed = true
					results.push({ agent: 'Cursor', hook: def.label, status: 'registered' })
				} else {
					results.push({ agent: 'Cursor', hook: def.label, status: 'already present' })
				}
			}
		}

		if (changed && !dryRun) {
			writeJson(cursorHooksPath, settings)
		}
	} else {
		const cursorHooks = hooks.filter((h) => h.cursor)
		if (cursorHooks.length > 0) {
			results.push({
				agent: 'Cursor',
				hook: cursorHooks.map((h) => h.label).join(', '),
				status: 'skipped (dir not found)',
			})
		}
	}

	const codexDir = join(root, '.codex-plugin')
	const codexHooksPath = join(codexDir, 'hooks.json')

	if (existsSync(codexDir)) {
		const settings: ClaudeSettings = existsSync(codexHooksPath) ? readJson(codexHooksPath) : {}
		let changed = false

		for (const def of hooks) {
			if (def.codex) {
				const registered = registerClaudeHook(settings, def, def.codex.event)
				if (registered) {
					changed = true
					results.push({ agent: 'Codex', hook: def.label, status: 'registered' })
				} else {
					results.push({ agent: 'Codex', hook: def.label, status: 'already present' })
				}
			}
		}

		if (changed && !dryRun) {
			writeJson(codexHooksPath, settings)
		}
	} else {
		const codexHooks = hooks.filter((h) => h.codex)
		if (codexHooks.length > 0) {
			results.push({
				agent: 'Codex',
				hook: codexHooks.map((h) => h.label).join(', '),
				status: 'skipped (dir not found)',
			})
		}
	}

	return results
}

export function hooksForSet(set: HookSet, root?: string): HookDefinition[] {
	switch (set) {
		case 'init':
			return getInitHooks(root)
		case 'commit-discipline':
			return getCommitDisciplineHooks(root)
	}
}

export function registerHooksForSet(set: HookSet, options: RegisterOptions = {}): HookResult[] {
	const root = options.root ?? process.cwd()
	return registerAgentHooks(hooksForSet(set, root), options)
}

function printResults(results: HookResult[], dryRun: boolean) {
	if (dryRun) process.stderr.write('Dry run — no files written.\n\n')

	const agentWidth = Math.max(...results.map((r) => r.agent.length), 'Agent'.length)
	const hookWidth = Math.max(...results.map((r) => r.hook.length), 'Hook'.length)
	const statusWidth = Math.max(...results.map((r) => r.status.length), 'Status'.length)

	function pad(s: string, n: number) {
		return s.padEnd(n)
	}
	function row(a: string, h: string, s: string) {
		return `| ${pad(a, agentWidth)} | ${pad(h, hookWidth)} | ${pad(s, statusWidth)} |`
	}

	process.stderr.write(`${row('Agent', 'Hook', 'Status')}\n`)
	process.stderr.write(`|-${'-'.repeat(agentWidth)}-|-${'-'.repeat(hookWidth)}-|-${'-'.repeat(statusWidth)}-|\n`)
	for (const r of results) {
		process.stderr.write(`${row(r.agent, r.hook, r.status)}\n`)
	}
}

if (process.argv[1] === import.meta.filename) {
	const args = process.argv.slice(2)
	const dryRun = args.includes('--dry-run')
	const verbose = args.includes('--verbose')
	const setIdx = args.indexOf('--set')
	const rootIdx = args.indexOf('--root')
	const set = setIdx !== -1 ? (args[setIdx + 1] as HookSet) : undefined
	const root = rootIdx !== -1 ? args[rootIdx + 1]! : process.cwd()

	if (!set || (set !== 'init' && set !== 'commit-discipline')) {
		process.stderr.write(
			'Usage: register-agent-hooks.mjs --set init|commit-discipline [--root <path>] [--dry-run] [--verbose]\n',
		)
		process.exit(1)
	}

	const results = registerHooksForSet(set, { root, dryRun })
	if (verbose) printResults(results, dryRun)
}
