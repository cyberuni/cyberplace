#!/usr/bin/env node
// Static state check for an SDD project spec (the project-spec model). Two
// fail-closed responsibilities, both the safety net that makes an illegal state
// uncommittable:
//   1. the root spec.md lifecycle tuple — status / aligned / open-markers /
//      approval attribution. (The project-spec model dropped the old
//      type/subtasks/composition axis; the root is a descriptive index that owns
//      no .feature of its own, so there is no per-spec .feature requirement — the
//      behavior suite lives in the behavioral nodes.)
//   2. the per-node spec-type reconcile — a node README's `spec-type` marker must
//      agree with its shape: reference => ## Subject and NO sibling .feature;
//      behavioral => ## Use Cases; descriptive (no marker) => no requirement.
// See design/lifecycle-model.md (legal-state tuples + per-node spec-type checks)
// and design/unit-and-organization.md (spec types). Pure functions are exported
// for node:test; running the file directly drives the CLI. No dependencies.

import { type Dirent, existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface GateVerdict {
	verdict?: string
	by?: string
	hasWhy: boolean
}

export interface SpecState {
	status: string
	aligned: boolean | null
	markerCount: number
	approval: Record<string, GateVerdict> | null
}

export interface NodeSpec {
	type: string | null
	hasSubject: boolean
	hasUseCases: boolean
}

const GATES = ['spec', 'impl']
const VERDICTS = ['approve', 'pause', 'reject']
const SPEC_TYPES = ['reference', 'behavioral']

function frontmatter(text: string): string[] {
	const m = /^---\n([\s\S]*?)\n---/.exec(text)
	return m ? m[1].split('\n') : []
}

// Strip fenced + inline code so a doc that *documents* a marker or a heading
// (e.g. "wraps `## Subject` in backticks") does not trip its own checks.
function prose(text: string): string {
	return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

export function parseSpecState(text: string): SpecState {
	const lines = frontmatter(text)
	let status = ''
	let aligned: boolean | null = null
	let approval: Record<string, GateVerdict> | null = null

	for (let i = 0; i < lines.length; i++) {
		const s = /^status:\s*(.+)$/.exec(lines[i])
		if (s) {
			status = s[1].trim().replace(/^["']|["']$/g, '')
			continue
		}
		const a = /^aligned:\s*(true|false)\b/.exec(lines[i])
		if (a) {
			aligned = a[1] === 'true'
			continue
		}
		const ap = /^approval:\s*(.*)$/.exec(lines[i])
		if (ap) {
			approval = {}
			if (ap[1].trim() && ap[1].trim() !== '{}') continue // inline non-empty unsupported; treat as empty map
			let gate: string | null = null
			for (let j = i + 1; j < lines.length; j++) {
				if (!/^\s/.test(lines[j])) break // dedent to top level ends the block
				const g = /^ {2}(\w+):\s*$/.exec(lines[j])
				if (g) {
					gate = g[1]
					approval[gate] = { hasWhy: false }
					continue
				}
				if (!gate) continue
				const verdict = /^ {4}verdict:\s*(.+)$/.exec(lines[j])
				if (verdict) approval[gate].verdict = verdict[1].trim().replace(/^["']|["']$/g, '')
				const by = /^ {4}by:\s*(.+)$/.exec(lines[j])
				if (by) approval[gate].by = by[1].trim().replace(/^["']|["']$/g, '')
				if (/^ {4}why:/.test(lines[j])) approval[gate].hasWhy = true
			}
		}
	}

	const markerCount = (prose(text).match(/<!--\s*open:/g) ?? []).length
	return { status, aligned, markerCount, approval }
}

// The root project spec.md lifecycle tuple.
export function checkSpec(slug: string, state: SpecState): string[] {
	const { status, aligned, markerCount, approval } = state
	const v: string[] = []
	const tag = (msg: string) => v.push(`${slug}: ${msg}`)

	// draft + aligned:true is LEGAL ("contract synced, ready for the spec gate") —
	// aligned is layer-scoped, so it may hold at draft. No rejection here.
	if (status === 'implemented' && aligned !== true) tag('illegal state — implemented requires aligned:true')
	if ((status === 'approved' || status === 'implemented') && markerCount > 0)
		tag(`illegal state — ${markerCount} open marker(s) but status is ${status} (markers block the gate)`)

	if (approval) {
		for (const [gate, entry] of Object.entries(approval)) {
			if (!GATES.includes(gate)) tag(`approval has unknown gate "${gate}" (expected spec | impl)`)
			if (entry.verdict && !VERDICTS.includes(entry.verdict))
				tag(`approval.${gate} has unknown verdict "${entry.verdict}" (expected approve | pause | reject)`)
			if (entry.verdict === 'pause' && entry.by)
				tag(`approval.${gate} is a pause but carries by — a pause is always the agent's act and omits by`)
			if (entry.verdict === 'approve' && !entry.by)
				tag(`approval.${gate} is an approve with no by — an approve must record its approver`)
			if (entry.by === 'agent' && !entry.hasWhy)
				tag(`approval.${gate} is by:agent but has no why block (a self-assertion must record its derivation)`)
			const passed =
				(gate === 'spec' && (status === 'approved' || status === 'implemented')) ||
				(gate === 'impl' && status === 'implemented')
			if (entry.verdict === 'pause' && passed)
				tag(`approval.${gate} is a pause but the ${gate} gate is already passed (status ${status})`)
		}
	}
	if (
		(status === 'approved' || status === 'implemented') &&
		!(approval?.spec?.verdict === 'approve' && approval?.spec?.by)
	)
		tag(
			`status is ${status} but approval.spec has no approve verdict with an approver — the spec gate has no recorded ratification`,
		)
	if (status === 'implemented' && !(approval?.impl?.verdict === 'approve' && approval?.impl?.by))
		tag(
			'status is implemented but approval.impl has no approve verdict with an approver — the impl gate has no recorded ratification',
		)

	return v
}

export function parseNode(text: string): NodeSpec {
	let type: string | null = null
	for (const l of frontmatter(text)) {
		const m = /^spec-type:\s*(.+)$/.exec(l)
		if (m) {
			type = m[1].trim().replace(/^["']|["']$/g, '')
			break
		}
	}
	const body = prose(text)
	return {
		type,
		hasSubject: /^##\s+Subject\b/m.test(body),
		hasUseCases: /^##\s+Use Cases\b/m.test(body),
	}
}

// The per-node spec-type reconcile. A node README's marker must agree with its
// shape; descriptive (no marker) carries no requirement.
export function checkNode(slug: string, node: NodeSpec, hasFeature: boolean): string[] {
	const { type, hasSubject, hasUseCases } = node
	const v: string[] = []
	const tag = (msg: string) => v.push(`${slug}: ${msg}`)

	if (type === null) return v
	if (!SPEC_TYPES.includes(type)) {
		tag(`unknown spec-type "${type}" (expected reference | behavioral)`)
		return v
	}
	if (type === 'reference') {
		if (hasFeature)
			tag('spec-type: reference but a sibling .feature exists — a reference artifact is suite-less by design')
		if (!hasSubject) tag('spec-type: reference but no ## Subject section')
	}
	if (type === 'behavioral' && !hasUseCases) tag('spec-type: behavioral but no ## Use Cases section')

	return v
}

function hasFeatureFile(dir: string): boolean {
	try {
		return readdirSync(dir).some((f) => f.endsWith('.feature'))
	} catch {
		return false
	}
}

// Walk the tree for every dir holding a file named `name`; the slug is the
// root-relative dir path. Nested projects are real and must be enforced too.
function discoverDirsWith(root: string, name: string): string[] {
	const out: string[] = []
	const walk = (dir: string, rel: string) => {
		let entries: Dirent[]
		try {
			entries = readdirSync(dir, { withFileTypes: true })
		} catch {
			return
		}
		if (entries.some((e) => e.isFile() && e.name === name)) out.push(rel)
		for (const e of entries) {
			if (!e.isDirectory() || e.name === 'node_modules' || e.name.startsWith('.')) continue
			walk(join(dir, e.name), rel ? join(rel, e.name) : e.name)
		}
	}
	walk(root, '')
	return out
}

export const discoverSpecDirs = (root: string): string[] => discoverDirsWith(root, 'spec.md')
export const discoverNodeDirs = (root: string): string[] => discoverDirsWith(root, 'README.md')

export function main(argv: string[]): number {
	const root = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : '.agents/specs'
	let violations: string[] = []

	for (const slug of discoverSpecDirs(root)) {
		const specPath = join(root, slug, 'spec.md')
		if (!existsSync(specPath)) continue
		violations = violations.concat(checkSpec(slug, parseSpecState(readFileSync(specPath, 'utf8'))))
	}
	for (const slug of discoverNodeDirs(root)) {
		const dir = join(root, slug)
		const readme = join(dir, 'README.md')
		if (!existsSync(readme)) continue
		violations = violations.concat(checkNode(slug, parseNode(readFileSync(readme, 'utf8')), hasFeatureFile(dir)))
	}

	if (violations.length) {
		for (const line of violations) console.error(`✗ ${line}`)
		return 1
	}
	process.stdout.write('spec states OK\n')
	return 0
}

if (import.meta.main) process.exit(main(process.argv.slice(2)))
