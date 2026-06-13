import * as fs from 'node:fs'
import * as path from 'node:path'

import { getPackageRoot } from '../hook/package-root.js'

export interface GovernanceMeta {
	name: string
	title: string
	body: string
}

const GOVERNANCE_NAME_PATTERN = /^[a-z0-9-]+$/

function governancesDir(): string {
	return path.join(getPackageRoot(), 'governances')
}

export function normalizeGovernanceName(name: string): string {
	const trimmed = name.trim()
	if (/[/\\]/.test(trimmed)) {
		throw new Error(`Invalid governance name: ${name}`)
	}

	const base = path.basename(trimmed)
	if (!base) {
		throw new Error(`Invalid governance name: ${name}`)
	}

	const normalized = base
		.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '')

	if (!normalized || !GOVERNANCE_NAME_PATTERN.test(normalized)) {
		throw new Error(`Invalid governance name: ${name}`)
	}

	return normalized
}

function governancePath(name: string): string {
	const normalized = normalizeGovernanceName(name)
	return path.join(governancesDir(), `${normalized}.md`)
}

function parseTitle(body: string, fallback: string): string {
	const match = body.match(/^#\s+(.+)$/m)
	return match?.[1]?.trim() ?? fallback
}

function titleFromName(name: string): string {
	return name
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ')
}

export function listGovernances(): GovernanceMeta[] {
	const dir = governancesDir()
	if (!fs.existsSync(dir)) return []

	return fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.md') && f !== 'README.md')
		.map((f) => {
			const name = f.slice(0, -3)
			const body = fs.readFileSync(path.join(dir, f), 'utf8')
			return { name, title: parseTitle(body, titleFromName(name)), body }
		})
		.sort((a, b) => a.name.localeCompare(b.name))
}

export function loadGovernance(name: string): GovernanceMeta {
	const normalized = normalizeGovernanceName(name)
	const filePath = governancePath(name)
	if (!fs.existsSync(filePath)) {
		throw new Error(`Unknown governance: ${normalized}`)
	}
	const body = fs.readFileSync(filePath, 'utf8')
	return { name: normalized, title: parseTitle(body, titleFromName(normalized)), body }
}
