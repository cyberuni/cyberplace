import * as fs from 'node:fs'
import * as path from 'node:path'

import { getPackageRoot } from '../hook/package-root.js'

export interface DisciplineMeta {
	name: string
	title: string
	body: string
}

function disciplinesDir(): string {
	return path.join(getPackageRoot(), 'disciplines')
}

function disciplinePath(name: string): string {
	const base = path.basename(name)
	if (base !== name || !/^[a-z0-9-]+$/.test(name)) {
		throw new Error(`Invalid discipline name: ${name}`)
	}
	return path.join(disciplinesDir(), `${name}.md`)
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

export function listDisciplines(): DisciplineMeta[] {
	const dir = disciplinesDir()
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

export function loadDiscipline(name: string): DisciplineMeta {
	const filePath = disciplinePath(name)
	if (!fs.existsSync(filePath)) {
		throw new Error(`Unknown discipline: ${name}`)
	}
	const body = fs.readFileSync(filePath, 'utf8')
	return { name, title: parseTitle(body, titleFromName(name)), body }
}
