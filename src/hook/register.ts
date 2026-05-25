import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildHookDefinition, type RegisterHookInput } from './build-definition.js'
import { commandMatchesHook, sameHookTarget } from './command.js'

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

type HookStatus = 'registered' | 'already present' | 'skipped (dir not found)'

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

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, 'utf8')) as T
}

function writeJson(path: string, data: unknown) {
	writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

function commandExistsInGroups(groups: ClaudeHookGroup[], def: HookDefinition): boolean {
	return groups.some((g) => g.hooks.some((h) => commandMatchesHook(h.command, def.id, def.command)))
}

function replaceHookInGroups(groups: ClaudeHookGroup[], def: HookDefinition): boolean {
	for (const group of groups) {
		for (const hook of group.hooks) {
			if (sameHookTarget(hook.command, def.id, def.command) && hook.command !== def.command) {
				hook.command = def.command
				return true
			}
		}
	}
	return false
}

function replaceHookInList(list: CursorHookEntry[], def: HookDefinition): boolean {
	for (const hook of list) {
		if (sameHookTarget(hook.command, def.id, def.command) && hook.command !== def.command) {
			hook.command = def.command
			return true
		}
	}
	return false
}

function registerClaudeHook(
	settings: ClaudeSettings,
	def: HookDefinition,
	event: 'PostToolUse' | 'SessionStart',
): boolean {
	settings.hooks ??= {}
	settings.hooks[event] ??= []

	if (replaceHookInGroups(settings.hooks[event]!, def)) {
		return true
	}

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
	if (replaceHookInList(list, def)) {
		return true
	}
	if (list.some((h) => commandMatchesHook(h.command, def.id, def.command))) {
		return false
	}
	list.push({ command: def.command })
	return true
}

function registerAgentHooks(hooks: HookDefinition[], options: RegisterOptions = {}): HookResult[] {
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

export function registerHooks(hooks: HookDefinition[], options: RegisterOptions = {}): HookResult[] {
	return registerAgentHooks(hooks, options)
}

export function registerHook(input: RegisterHookInput, options: RegisterOptions = {}): HookResult[] {
	const root = options.root ?? process.cwd()
	return registerHooks([buildHookDefinition(input, root)], options)
}

export function printResults(results: HookResult[], dryRun: boolean) {
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
