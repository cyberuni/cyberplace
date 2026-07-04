#!/usr/bin/env node
import { Command } from 'commander'
import {
	bumpLastSeen,
	type Harness,
	type IdContext,
	listAgents,
	prune,
	register,
	resolveSelfId,
	touch,
} from './identity.ts'
import { install } from './install.ts'
import { inbox, read, resolveBody, send } from './message.ts'
import { printFields, printTable } from './output.ts'
import { resolveRoot } from './paths.ts'
import { injectInbox } from './runtime/inject-inbox.ts'

interface RootOpts {
	root?: string
	space?: string
}

function ctxOf(opts: RootOpts): IdContext {
	return { root: resolveRoot({ root: opts.root, space: opts.space }), env: process.env }
}

function requireSelf(ctx: IdContext): string {
	const id = resolveSelfId(ctx)
	if (!id) throw new Error('no fleet identity in this session — run `cyberfleet register` first')
	bumpLastSeen(ctx, id)
	return id
}

const rootOpts = (cmd: Command) =>
	cmd.option('--root <path>', 'transport root (.cyberfleet dir)').option('--space <path>', 'alias for --root')

const program = new Command()
program.name('cyberfleet').description('Harness-agnostic, MCP-free inter-agent sessions and messaging').version('0.0.0')

rootOpts(program.command('register'))
	.description('register or refresh this session identity')
	.option('--handle <name>', 'human handle for this agent')
	.option('--harness <h>', 'claude | cursor | codex (else auto-detected)')
	.action((opts) => {
		const ctx = ctxOf(opts)
		const rec = register(ctx, { handle: opts.handle, harness: opts.harness })
		printFields({ id: rec.id, handle: rec.handle, harness: rec.harness, status: rec.status })
	})

rootOpts(program.command('who'))
	.description('list the addressable fleet')
	.option('--all', 'include exited agents')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const agents = listAgents(ctx.root).filter((a) => opts.all || a.status !== 'exited')
		printTable(agents, [
			{ label: 'handle', get: (a) => a.handle },
			{ label: 'harness', get: (a) => a.harness },
			{ label: 'cwd', get: (a) => a.cwd },
			{ label: 'status', get: (a) => a.status },
			{ label: 'pane', get: (a) => a.tmux?.pane ?? '-' },
			{ label: 'last-seen', get: (a) => a.lastSeen },
			{ label: 'id', get: (a) => a.id },
		])
	})

rootOpts(program.command('send'))
	.description('send a message to a peer (by handle or id)')
	.requiredOption('--to <peer>', 'recipient handle or id')
	.option('--subject <s>', 'subject')
	.option('--body <text>', 'message body')
	.option('--body-file <path>', 'read body from a file, or - for stdin')
	.option('--thread <id>', 'thread id')
	.option('--reply-to <msg>', 'message id this replies to')
	.action((opts) => {
		const ctx = ctxOf(opts)
		const fromId = requireSelf(ctx)
		const body = resolveBody(opts.body, opts.bodyFile)
		const msg = send(
			{ root: ctx.root },
			{ fromId, to: opts.to, subject: opts.subject, body, thread: opts.thread, replyTo: opts.replyTo },
		)
		printFields({ sent: msg.id, to: opts.to, subject: msg.subject })
	})

rootOpts(program.command('inbox'))
	.description('list your mail, or emit the SessionStart hook payload')
	.option('--unread', 'only un-acked mail')
	.option('--from <id>', 'filter by sender')
	.option('--hook', 'emit the harness hook injection payload instead')
	.option('--event <event>', 'SessionStart | PostToolUse (with --hook)', 'SessionStart')
	.action((opts) => {
		const ctx = ctxOf(opts)
		if (opts.hook) {
			touch(ctx)
			const payload = injectInbox(ctx, opts.event)
			if (payload) console.log(JSON.stringify(payload))
			return
		}
		const meId = requireSelf(ctx)
		const items = inbox({ root: ctx.root }, { meId, unread: opts.unread, from: opts.from })
		if (items.length === 0) {
			console.log(opts.unread ? '(no unread mail)' : '(inbox empty)')
			return
		}
		for (const m of items) {
			console.log(`${m.read ? ' ' : '*'} ${m.id}  ${m.fromHandle}${m.subject ? ` — ${m.subject}` : ''}: ${m.body}`)
		}
	})

rootOpts(program.command('read'))
	.description('print a message and acknowledge it')
	.argument('<msg-id>', 'message id')
	.action((msgId, opts) => {
		const ctx = ctxOf(opts)
		const meId = requireSelf(ctx)
		const msg = read({ root: ctx.root }, meId, msgId)
		printFields({ from: msg.fromHandle, subject: msg.subject, id: msg.id })
		console.log(`\n${msg.body}`)
	})

rootOpts(program.command('spawn'))
	.description('launch a new peer session in a tmux split')
	.requiredOption('--harness <h>', 'claude | cursor | codex')
	.option('--task <text>', 'brief text, or - for stdin')
	.option('--brief-file <path>', 'read the brief from a file')
	.option('--handle <name>', 'handle for the new peer')
	.action(async (opts) => {
		const { spawn } = await import('./spawn.ts')
		const ctx = ctxOf(opts)
		touch(ctx)
		const res = spawn(ctx, { harness: opts.harness, task: opts.task, briefFile: opts.briefFile, handle: opts.handle })
		printFields({
			spawned: res.agent.id,
			handle: res.agent.handle,
			harness: res.agent.harness,
			pane: res.pane,
			launch: res.launch,
		})
	})

rootOpts(program.command('prune'))
	.description('mark dead agents exited and sweep')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const changed = prune(ctx)
		console.log(changed.length ? `pruned ${changed.length} agent(s)` : 'nothing to prune')
	})

program
	.command('install')
	.description('wire the fleet surfacing hook into a harness config')
	.requiredOption('--agent <harness>', 'claude | cursor | codex')
	.option('--dir <path>', 'project dir to write config into', process.cwd())
	.action((opts) => {
		const results = install(opts.agent as Harness, opts.dir)
		for (const r of results) console.log(`${r.status}: ${r.harness} ${r.vendorEvent} → ${r.file}`)
	})

program.parseAsync(process.argv).catch((err: unknown) => {
	process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
	process.exit(1)
})
