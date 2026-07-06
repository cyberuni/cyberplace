#!/usr/bin/env node
import { Command, Option } from 'commander'
import {
	type AgentRecord,
	ack,
	bumpLastSeen,
	decommission,
	emit,
	FileStore,
	type Format,
	fail,
	type Harness,
	type IdContext,
	inbox,
	install,
	listAgents,
	nextStep,
	prune,
	realExec,
	register,
	resolveAgent,
	resolveBody,
	resolveRoot,
	resolveSelfId,
	selectSessionAdapter,
	send,
	spawn,
	toonList,
	toonObject,
	touch,
} from 'cyberlegion'
import { buildMissions, resolveAgentsRoot } from './missions.ts'
import { detectMode } from './mode.ts'

// cyberfleet — the fleet layer on top of cyberlegion's mechanism. Identity/mail/session/install
// verbs below are thin wiring onto cyberlegion's functions; `missions`/`jump`/`pause`/`gate approve`
// are cyberfleet's own fleet-specific logic (SDD-derived mission view, session focus, a status-only
// pause marker, and the gate-approve stub).

interface RootOpts {
	root?: string
	space?: string
	format?: string
}

function ctxOf(opts: RootOpts): IdContext {
	const store = new FileStore(resolveRoot({ root: opts.root, space: opts.space }))
	return { store, env: process.env }
}

function formatOf(opts: RootOpts): Format {
	return opts.format === 'json' ? 'json' : 'toon'
}

function requireSelf(ctx: IdContext): string {
	const id = resolveSelfId(ctx)
	if (!id) fail('no fleet identity in this session — run `cyberfleet register` first')
	bumpLastSeen(ctx, id)
	return id
}

/**
 * Pause a unit's mission — a cyberfleet-level marker on its `AgentRecord.status` only. Not
 * exported by cyberlegion (fleet-specific concept), so it stays here — a thin write through the
 * shared `Store` seam. This is NOT a bridge to SDD's `pause-mission` checkpoint (which rewrites the
 * plan brief's todos/## NEXT anchor) — that gap is flagged, not silently papered over: a caller who
 * wants the actual mission checkpoint must run `sdd:pause-mission` in-session.
 */
function pauseAgent(ctx: IdContext, id: string): AgentRecord {
	const rec = ctx.store.getAgent(id)
	if (!rec) throw new Error(`no agent "${id}"`)
	rec.status = 'paused'
	ctx.store.putAgent(rec)
	return rec
}

const rootOpts = (cmd: Command) =>
	cmd
		.option('--root <path>', 'cyberlegion hub root (overrides the global hub / $CYBERLEGION_ROOT)')
		.option('--space <path>', 'alias for --root')
		.addOption(new Option('--format <format>', 'output format').choices(['toon', 'json']).default('toon'))

const program = new Command()
program
	.name('cyberfleet')
	.description('Fleet layer over cyberlegion — ships, missions, and the Council view')
	.version('0.0.0')

rootOpts(program.command('register'))
	.description('register or refresh this session identity')
	.option('--handle <name>', 'human handle for this agent')
	.option('--harness <h>', 'claude | cursor | codex (else auto-detected)')
	.action((opts) => {
		const ctx = ctxOf(opts)
		const rec = register(ctx, { handle: opts.handle, harness: opts.harness })
		emit(formatOf(opts), {
			toon: toonObject({ id: rec.id, handle: rec.handle, harness: rec.harness, status: rec.status }),
			json: rec,
		})
	})

rootOpts(program.command('who'))
	.description('list the addressable fleet')
	.option('--all', 'include exited agents')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const agents = listAgents(ctx.store).filter((a) => opts.all || a.status !== 'exited')
		emit(formatOf(opts), {
			toon: toonList(
				'agents',
				agents,
				[
					{ key: 'handle', get: (a: AgentRecord) => a.handle },
					{ key: 'harness', get: (a: AgentRecord) => a.harness },
					{ key: 'cwd', get: (a: AgentRecord) => a.cwd },
					{ key: 'status', get: (a: AgentRecord) => a.status },
					{ key: 'pane', get: (a: AgentRecord) => a.tmux?.pane ?? '-' },
					{ key: 'last-seen', get: (a: AgentRecord) => a.lastSeen },
					{ key: 'id', get: (a: AgentRecord) => a.id },
				],
				`${agents.length} agents`,
			),
			json: agents,
		})
	})

rootOpts(program.command('mode'))
	.description('report ship (a spawned unit worktree) vs command-center, and the shared fleet root')
	.action((opts) => {
		const info = detectMode({ root: opts.root, space: opts.space })
		emit(formatOf(opts), {
			toon: toonObject({ mode: info.mode, cwdRoot: info.cwdRoot, fleetRoot: info.fleetRoot }),
			json: info,
		})
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
			{ store: ctx.store },
			{ fromId, to: opts.to, subject: opts.subject, body, thread: opts.thread, replyTo: opts.replyTo },
		)
		emit(formatOf(opts), { toon: toonObject({ sent: msg.id, to: opts.to, subject: msg.subject }), json: msg })
	})

rootOpts(program.command('inbox'))
	.description('list your mail')
	.option('--unread', 'only un-acked mail')
	.option('--from <id>', 'filter by sender')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const meId = requireSelf(ctx)
		const items = inbox({ store: ctx.store }, { meId, unread: opts.unread, from: opts.from })
		const unreadCount = items.filter((i) => !i.read).length
		emit(formatOf(opts), {
			toon: toonList(
				'messages',
				items,
				[
					{ key: 'id', get: (m) => m.id },
					{ key: 'from', get: (m) => m.fromHandle },
					{ key: 'subject', get: (m) => m.subject ?? '' },
					{ key: 'read', get: (m) => m.read },
				],
				`${items.length} messages (${unreadCount} unread)`,
			),
			json: items,
		})
		const firstUnread = items.find((m) => !m.read)
		if (firstUnread) nextStep(`cyberfleet read ${firstUnread.id}`)
	})

/** Print + ack a message — a thin alias of `ack` (both move it out of the unread set). */
function runReadOrAck(field: 'read' | 'acked') {
	return (msgId: string, opts: RootOpts) => {
		const ctx = ctxOf(opts)
		const meId = requireSelf(ctx)
		const msg = ack({ store: ctx.store }, meId, msgId)
		emit(formatOf(opts), {
			toon: toonObject({ [field]: msg.id, from: msg.fromHandle, subject: msg.subject, body: msg.body }),
			json: msg,
		})
	}
}

rootOpts(program.command('read'))
	.description('print a message and acknowledge it')
	.argument('<msg-id>', 'message id')
	.action(runReadOrAck('read'))

rootOpts(program.command('ack'))
	.description('acknowledge a message (thin alias of `read` — both print + move it to acked)')
	.argument('<msg-id>', 'message id')
	.action(runReadOrAck('acked'))

rootOpts(program.command('spawn'))
	.description('launch a new peer session in its own git worktree (tmux or herdr)')
	.requiredOption('--harness <h>', 'claude | cursor | codex')
	.option('--task <text>', 'brief text, or - for stdin')
	.option('--brief-file <path>', 'read the brief from a file')
	.option('--handle <name>', 'handle for the new peer')
	.option('--branch <name>', 'branch for the new ship worktree (default cyberlegion/unit-<id>)')
	.option('--worktree-path <path>', 'where to check out the new ship worktree')
	.action((opts) => {
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
		emit(formatOf(opts), {
			toon: toonObject({
				spawned: res.agent.id,
				handle: res.agent.handle,
				harness: res.agent.harness,
				worktree: res.agent.worktree?.root,
				pane: res.pane,
			}),
			json: res,
		})
	})

rootOpts(program.command('prune'))
	.description('mark dead agents exited and sweep')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const changed = prune(ctx)
		emit(formatOf(opts), {
			toon: toonList(
				'pruned',
				changed,
				[
					{ key: 'id', get: (a: AgentRecord) => a.id },
					{ key: 'handle', get: (a: AgentRecord) => a.handle },
				],
				changed.length ? `pruned ${changed.length} agent(s)` : 'nothing to prune',
			),
			json: changed,
		})
	})

rootOpts(program.command('decommission'))
	.description("tear down a ship's worktree + session and reap its state (the deterministic inverse of spawn)")
	.argument('<id>', 'ship id')
	.option('--force', 'discard uncommitted changes in the worktree (never overrides the flagship rule)')
	.action((id, opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const res = decommission(ctx, { id, force: opts.force })
		emit(formatOf(opts), {
			toon: toonObject({ decommissioned: id, worktree: res.worktreeRoot ?? '-', pane: res.pane ?? '-' }),
			json: res,
		})
	})

rootOpts(program.command('install'))
	.description('wire the fleet surfacing hook into a harness config')
	.requiredOption('--agent <harness>', 'claude | cursor | codex')
	.option('--dir <path>', 'project dir to write config into', process.cwd())
	.action((opts) => {
		const results = install(opts.agent as Harness, opts.dir)
		emit(formatOf(opts), {
			toon: toonList(
				'hooks',
				results,
				[
					{ key: 'event', get: (r) => r.event },
					{ key: 'status', get: (r) => r.status },
					{ key: 'file', get: (r) => r.file },
				],
				`${results.length} hooks`,
			),
			json: results,
		})
	})

rootOpts(program.command('missions'))
	.description("who needs the Council's hands — ships × mission × gate × leash, derived from SDD state")
	.option('--agents-root <path>', 'override the root under which .agents/ is resolved (default: the primary checkout)')
	.action((opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const agentsRoot = opts.agentsRoot ?? resolveAgentsRoot(realExec)
		const agents = listAgents(ctx.store).filter((a) => a.status !== 'exited')
		const rows = buildMissions(agentsRoot, agents)
		emit(formatOf(opts), {
			toon: toonList(
				'missions',
				rows,
				[
					{ key: 'handle', get: (r) => r.handle },
					{ key: 'branch', get: (r) => r.branch ?? '-' },
					{ key: 'status', get: (r) => r.status },
					{
						key: 'mission',
						get: (r) => (r.mission ? `${r.mission.status} ${r.mission.completed}/${r.mission.total}` : '-'),
					},
					{ key: 'spec', get: (r) => r.spec?.status ?? '-' },
					{ key: 'gate:spec', get: (r) => (r.gate.spec ? `${r.gate.spec.verdict}(${r.gate.spec.by})` : '-') },
					{ key: 'gate:impl', get: (r) => (r.gate.impl ? `${r.gate.impl.verdict}(${r.gate.impl.by})` : '-') },
					{ key: 'leash', get: (r) => r.leash ?? '-' },
					{ key: 'council', get: (r) => (r.needsCouncil ? 'yes' : '-') },
					{ key: 'hal', get: (r) => (r.hal ? '!' : '') },
				],
				`${rows.length} ships`,
			),
			json: rows,
		})
	})

rootOpts(program.command('jump'))
	.description("select/focus a ship's session (tmux pane), or print its worktree path to cd into")
	.argument('<peer>', 'handle, id, or worktree branch/CR ref')
	.action((peer, opts) => {
		const ctx = ctxOf(opts)
		touch(ctx)
		const agent = resolveAgent(ctx.store, peer)
		const pane = agent.tmux?.pane ?? ctx.store.findPaneByAgentId(agent.id)
		if (pane) {
			try {
				selectSessionAdapter(ctx.env ?? process.env).focus(realExec, { id: pane })
				emit(formatOf(opts), { toon: toonObject({ jumped: agent.handle, pane }), json: { jumped: agent.handle, pane } })
				return
			} catch {
				// no live session backend, or the pane is gone — fall through to printing a cd target
			}
		}
		console.log(agent.worktree?.root ?? agent.cwd)
	})

rootOpts(program.command('pause'))
	.description("pause a ship's mission — a cyberfleet-level status marker only (see note)")
	.argument('<peer>', 'handle, id, or worktree branch/CR ref')
	.action((peer, opts) => {
		const ctx = ctxOf(opts)
		const agent = resolveAgent(ctx.store, peer)
		const rec = pauseAgent(ctx, agent.id)
		emit(formatOf(opts), { toon: toonObject({ paused: rec.handle, status: rec.status }), json: rec })
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
