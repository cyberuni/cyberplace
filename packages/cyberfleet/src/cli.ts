#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { Command } from 'commander'
import {
	bumpLastSeen,
	type Harness,
	type IdContext,
	listAgents,
	pauseAgent,
	prune,
	realExec,
	register,
	resolveSelfId,
	resolveShip,
	touch,
} from './identity.ts'
import { install } from './install.ts'
import { inbox, read, resolveBody, send } from './message.ts'
import { buildMissions, resolveAgentsRoot } from './missions.ts'
import { printFields, printTable } from './output.ts'
import { detectMode, resolveRoot } from './paths.ts'
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

rootOpts(program.command('mode'))
	.description('report ship (a .cyberfleet/ dir here) vs command-center, and the shared fleet root')
	.action((opts) => {
		const info = detectMode({ root: opts.root, space: opts.space })
		printFields({ mode: info.mode, cwdRoot: info.cwdRoot, fleetRoot: info.fleetRoot })
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
	.description('launch a new peer session in its own git worktree (tmux or herdr)')
	.requiredOption('--harness <h>', 'claude | cursor | codex')
	.option('--task <text>', 'brief text, or - for stdin')
	.option('--brief-file <path>', 'read the brief from a file')
	.option('--handle <name>', 'handle for the new peer')
	.option('--branch <name>', 'branch for the new ship worktree (default cyberfleet/ship-<id>)')
	.option('--worktree-path <path>', 'where to check out the new ship worktree')
	.action(async (opts) => {
		const { spawn } = await import('./spawn.ts')
		const ctx = ctxOf(opts)
		touch(ctx)
		const res = spawn(ctx, {
			harness: opts.harness,
			task: opts.task,
			briefFile: opts.briefFile,
			handle: opts.handle,
			branch: opts.branch,
			worktreePath: opts.worktreePath,
		})
		printFields({
			spawned: res.agent.id,
			handle: res.agent.handle,
			harness: res.agent.harness,
			worktree: res.agent.worktree?.root,
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

rootOpts(program.command('decommission'))
	.description("tear down a ship's worktree + session and reap its state (the deterministic inverse of spawn)")
	.argument('<id>', 'ship id')
	.option('--force', 'discard uncommitted changes in the worktree (never overrides the flagship rule)')
	.action(async (id, opts) => {
		const { decommission } = await import('./decommission.ts')
		const ctx = ctxOf(opts)
		touch(ctx)
		const res = decommission(ctx, { id, force: opts.force })
		printFields({ decommissioned: id, worktree: res.worktreeRoot ?? '-', pane: res.pane ?? '-' })
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

rootOpts(program.command('missions'))
	.description("who needs the Council's hands — ships × mission × gate × leash, derived from SDD state")
	.option('--json', 'emit the full structured array instead of the table')
	.option('--agents-root <path>', 'override the root under which .agents/ is resolved (default: the primary checkout)')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const agentsRoot = opts.agentsRoot ?? resolveAgentsRoot(realExec)
		const agents = listAgents(ctx.root).filter((a) => a.status !== 'exited')
		const rows = buildMissions(agentsRoot, agents)
		if (opts.json) {
			console.log(JSON.stringify(rows, null, 2))
			return
		}
		printTable(rows, [
			{ label: 'handle', get: (r) => r.handle },
			{ label: 'branch/cr', get: (r) => r.branch ?? '-' },
			{ label: 'status', get: (r) => r.status },
			{
				label: 'mission',
				get: (r) => (r.mission ? `${r.mission.status} ${r.mission.completed}/${r.mission.total}` : '-'),
			},
			{ label: 'spec', get: (r) => r.spec?.status ?? '-' },
			{ label: 'gate:spec', get: (r) => (r.gate.spec ? `${r.gate.spec.verdict}(${r.gate.spec.by})` : '-') },
			{ label: 'gate:impl', get: (r) => (r.gate.impl ? `${r.gate.impl.verdict}(${r.gate.impl.by})` : '-') },
			{ label: 'leash', get: (r) => r.leash ?? '-' },
			{ label: 'council', get: (r) => (r.needsCouncil ? 'yes' : '-') },
			{ label: 'HAL', get: (r) => (r.hal ? '!' : '') },
		])
	})

rootOpts(program.command('jump'))
	.description("select/focus a ship's session (tmux pane), or print its worktree path to cd into")
	.argument('<peer>', 'handle, id, or worktree branch/CR ref')
	.action((peer, opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const agent = resolveShip(ctx.root, peer)
		if (agent.tmux?.pane) {
			try {
				execFileSync('tmux', ['select-pane', '-t', agent.tmux.pane], { stdio: 'ignore' })
				printFields({ jumped: agent.handle, pane: agent.tmux.pane })
				return
			} catch {
				// tmux unavailable or pane gone — fall through to printing a cd target
			}
		}
		console.log(agent.worktree?.root ?? agent.cwd)
	})

rootOpts(program.command('ack'))
	.description('acknowledge a message (thin alias of `read` — both print + move it to acked)')
	.argument('<msg-id>', 'message id')
	.action((msgId, opts) => {
		const ctx = ctxOf(opts)
		const meId = requireSelf(ctx)
		const msg = read({ root: ctx.root }, meId, msgId)
		printFields({ acked: msg.id, from: msg.fromHandle, subject: msg.subject })
	})

rootOpts(program.command('pause'))
	.description("pause a ship's mission — a cyberfleet-level status marker only (see note)")
	.argument('<peer>', 'handle, id, or worktree branch/CR ref')
	.action((peer, opts) => {
		const ctx = ctxOf(opts)
		const agent = resolveShip(ctx.root, peer)
		const rec = pauseAgent(ctx.root, agent.id)
		printFields({ paused: rec.handle, status: rec.status })
		process.stderr.write(
			'note: this only flips the cyberfleet ship record to status:paused — it is NOT a bridge to ' +
				"SDD's pause-mission checkpoint (which rewrites the plan brief's todos/## NEXT anchor). " +
				'Run `sdd:pause-mission` in-session for the actual mission checkpoint (flagged gap).\n',
		)
	})

const gateCmd = program.command('gate').description('SDD gate operations')
rootOpts(gateCmd.command('approve'))
	.description('Council ratification of a gate — STUBBED, not safely relayable through this CLI (see note)')
	.argument('<cr>', 'CR ref')
	.argument('<gateName>', 'spec | impl')
	.action((cr, gateName, _opts) => {
		if (gateName !== 'spec' && gateName !== 'impl') throw new Error('<gateName> must be spec | impl')
		const by =
			process.env.SDD_HANDLE ??
			realExec('git', ['config', 'user.name']) ??
			realExec('git', ['log', '-1', '--format=%an'])
		const wouldWrite = { kind: 'gate', cr, gate: gateName, verdict: 'approve', by: by ?? '<unknown>' }
		process.stderr.write(
			'cyberfleet gate approve is NOT implemented — a human ratification into the SDD ledger cannot ' +
				'be safely relayed through this CLI without running in-session with the SDD schema in force ' +
				'(the relayed-ratification seam). It would have written:\n  ' +
				`${JSON.stringify(wouldWrite)}\n` +
				'Ratify this gate via the SDD spec-gate skill, in-session, instead. Flagging for the Council.\n',
		)
		process.exitCode = 1
	})

program.parseAsync(process.argv).catch((err: unknown) => {
	process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
	process.exit(1)
})
