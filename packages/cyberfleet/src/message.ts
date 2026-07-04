import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadAgent, resolveRecipient } from './identity.ts'
import { paths } from './paths.ts'

export interface Message {
	id: string
	from: string
	fromHandle: string
	to: string
	subject?: string
	body: string
	thread?: string
	replyTo?: string
	ts: number
	sentAt: string
}

export interface MsgContext {
	root: string
	now?: () => number
}

export interface SendInput {
	fromId: string
	to: string
	subject?: string
	body: string
	thread?: string
	replyTo?: string
}

/** Write one message file into the recipient's inbox. Collision-free by <epochMs>-<hex>. */
export function send(ctx: MsgContext, input: SendInput): Message {
	const toId = resolveRecipient(ctx.root, input.to) // throws if unknown — no partial write
	const from = loadAgent(ctx.root, input.fromId)
	const ts = ctx.now?.() ?? Date.now()
	const id = `${ts}-${randomBytes(3).toString('hex')}`
	const msg: Message = {
		id,
		from: input.fromId,
		fromHandle: from?.handle ?? input.fromId,
		to: toId,
		...(input.subject ? { subject: input.subject } : {}),
		body: input.body,
		...(input.thread ? { thread: input.thread } : {}),
		...(input.replyTo ? { replyTo: input.replyTo } : {}),
		ts,
		sentAt: new Date(ts).toISOString(),
	}
	const dir = paths.inboxDir(ctx.root, toId)
	mkdirSync(dir, { recursive: true })
	writeFileSync(join(dir, `${id}.json`), `${JSON.stringify(msg, null, 2)}\n`)
	return msg
}

function readDir(dir: string): Message[] {
	if (!existsSync(dir)) return []
	return readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Message)
}

export interface InboxItem extends Message {
	read: boolean
}

export interface InboxQuery {
	meId: string
	unread?: boolean
	from?: string
}

/** List the caller's mail, chronological (lexical filename sort == time order). */
export function inbox(ctx: MsgContext, q: InboxQuery): InboxItem[] {
	const unread = readDir(paths.inboxDir(ctx.root, q.meId)).map((m) => ({ ...m, read: false }))
	const acked = q.unread ? [] : readDir(paths.inboxReadDir(ctx.root, q.meId)).map((m) => ({ ...m, read: true }))
	let items = [...unread, ...acked]
	if (q.from) items = items.filter((m) => m.from === q.from || m.fromHandle === q.from)
	return items.sort((a, b) => a.id.localeCompare(b.id))
}

/** Print + ack a message by moving it out of the unread set. Errors if not unread. */
export function read(ctx: MsgContext, meId: string, msgId: string): Message {
	const src = join(paths.inboxDir(ctx.root, meId), `${msgId}.json`)
	if (!existsSync(src)) {
		throw new Error(`"${msgId}" is not an unread message in this inbox`)
	}
	const msg = JSON.parse(readFileSync(src, 'utf8')) as Message
	const readDirPath = paths.inboxReadDir(ctx.root, meId)
	mkdirSync(readDirPath, { recursive: true })
	renameSync(src, join(readDirPath, `${msgId}.json`))
	return msg
}
