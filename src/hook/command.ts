import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { detectPackageManager } from '../registry/npm.js'
import { getPackageRoot } from './package-root.js'

function getPackageVersion(): string {
	const pkgPath = join(getPackageRoot(), 'package.json')
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string }
	return pkg.version
}

function pmExecPrefix(root: string): string | null {
	const pm = detectPackageManager(root)
	if (pm === 'pnpm') return 'pnpm exec'
	if (pm === 'yarn') return 'yarn exec'
	if (pm === 'bun') return 'bunx'
	return null
}

/**
 * Build a hook command string for registration in agent settings.
 * Uses the repo's package manager exec wrapper when a lock file is present;
 * otherwise falls back to pinned npx.
 */
export function hookCommand(subcommand: string, root = process.cwd()): string {
	const prefix = pmExecPrefix(root)
	if (prefix) {
		return `${prefix} cyber-skills ${subcommand}`
	}
	const version = getPackageVersion()
	return `npx cyber-skills@${version} ${subcommand}`
}

function isCommandString(command: unknown): command is string {
	return typeof command === 'string' && command.length > 0
}

function extractFlagValue(command: unknown, flag: string): string | null {
	if (!isCommandString(command)) return null
	const match = command.match(new RegExp(`${flag}\\s+('[^']*'|"[^"]*"|\\S+)`))
	if (!match?.[1]) return null
	const value = match[1]
	if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
		return value.slice(1, -1)
	}
	return value
}

function extractNpxVersion(command: unknown): string | null {
	if (!isCommandString(command)) return null
	const match = command.match(/npx(?:\s+(?:--yes|-y))?\s+cyber-skills@(\S+)/)
	return match?.[1] ?? null
}

function legacyEquivalent(hookId: string, existing: string): boolean {
	if (hookId === 'commit-discipline') {
		return (
			existing.includes('hook run commit-discipline') ||
			existing.includes('run-hook commit-discipline') ||
			(existing.includes('hook run') && existing.includes('--extract') && existing.includes('Commit Discipline'))
		)
	}
	if (hookId === 'local-augmentations' || hookId === 'inject-local-augmentations') {
		return (
			existing.includes('hook run inject-local-augmentations') ||
			existing.includes('run-hook inject-local-augmentations') ||
			existing.includes('inject-local-augmentations.sh') ||
			(existing.includes('hook run') && existing.includes('--glob') && existing.includes('SKILL.local.md'))
		)
	}
	if (hookId === 'mark-internal') {
		return (
			existing.includes('hook run mark-internal') ||
			existing.includes('run-hook mark-internal') ||
			existing.includes('mark-internal.sh')
		)
	}
	return false
}

/** Same logical hook target (--name + input flags, or legacy equivalent), ignoring semver and local bin vs npx. */
export function sameHookTarget(existing: unknown, hookId: string, expectedCommand: string): boolean {
	if (!isCommandString(existing)) return false
	if (existing === expectedCommand) return true

	const existingName = extractFlagValue(existing, '--name')
	const expectedName = extractFlagValue(expectedCommand, '--name')
	if (existingName && expectedName && existingName !== expectedName) {
		return false
	}
	if (existingName && expectedName && existingName === expectedName) {
		for (const flag of ['--file', '--glob', '--extract', '--heading'] as const) {
			const existingValue = extractFlagValue(existing, flag)
			const expectedValue = extractFlagValue(expectedCommand, flag)
			if (existingValue !== expectedValue) return false
		}
		return true
	}

	return legacyEquivalent(hookId, existing)
}

function extractPmExecPrefix(command: string): string | null {
	const match = command.match(/^(pnpm exec|yarn exec|bunx|npm exec)\s+cyber-skills/)
	return match?.[1] ?? null
}

/** True when an existing registered command refers to the same hook id and semver/path. */
export function commandMatchesHook(existing: unknown, hookId: string, expectedCommand: string): boolean {
	if (!isCommandString(existing)) return false
	if (existing === expectedCommand) return true
	if (!sameHookTarget(existing, hookId, expectedCommand)) return false

	const existingPmPrefix = extractPmExecPrefix(existing)
	const expectedPmPrefix = extractPmExecPrefix(expectedCommand)

	// If one uses pm exec and the other does not, they differ in execution method → re-register
	if ((existingPmPrefix === null) !== (expectedPmPrefix === null)) return false
	// If both use pm exec, require the same package manager
	if (existingPmPrefix !== null && existingPmPrefix !== expectedPmPrefix) return false

	const existingVersion = extractNpxVersion(existing)
	const expectedVersion = extractNpxVersion(expectedCommand)
	if (existingVersion && expectedVersion && existingVersion !== expectedVersion) {
		return false
	}

	const existingUsesLocalBin = /node_modules[/\\]\.bin[/\\]cyber-skills/.test(existing)
	const expectedUsesLocalBin = /node_modules[/\\]\.bin[/\\]cyber-skills/.test(expectedCommand)
	if (existingUsesLocalBin !== expectedUsesLocalBin) {
		return false
	}

	return true
}
