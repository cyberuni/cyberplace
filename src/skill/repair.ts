import * as fs from 'node:fs'
import * as path from 'node:path'

export interface RepairAction {
	skill: string
	action:
		| 'removed_public_symlink'
		| 'kept_agents_symlink'
		| 'updated_metadata'
		| 'already_internal'
		| 'local_augmentation_only'
		| 'skipped_missing_skill'
		| 'skipped_no_frontmatter'
	details?: string
}

export interface RepairResult {
	changed: boolean
	actions: RepairAction[]
}

export interface PrivateSkillIssue {
	skill: string
	issue: 'missing_metadata_internal' | 'public_skill_symlink' | 'missing_skill_file' | 'missing_frontmatter'
	details?: string
}

export interface PrivateSkillCheckResult {
	ok: boolean
	issues: PrivateSkillIssue[]
}

function ensureInternalMetadata(content: string): { changed: boolean; content: string } {
	const lines = content.split('\n')
	if (lines[0]?.trim() !== '---') return { changed: false, content }

	let endIndex = -1
	for (let i = 1; i < lines.length; i++) {
		if (lines[i]?.trim() === '---') {
			endIndex = i
			break
		}
	}
	if (endIndex === -1) return { changed: false, content }

	const frontmatter = lines.slice(1, endIndex)
	let metadataIndex = -1
	let metadataIndent = 0
	let hasInternal = false

	for (let i = 0; i < frontmatter.length; i++) {
		const line = frontmatter[i] ?? ''
		const metadataMatch = line.match(/^(\s*)metadata:\s*$/)
		if (metadataMatch) {
			metadataIndex = i
			metadataIndent = metadataMatch[1]?.length ?? 0
			for (let j = i + 1; j < frontmatter.length; j++) {
				const nested = frontmatter[j] ?? ''
				if (!nested.trim()) continue
				const indent = nested.match(/^(\s*)/)?.[1]?.length ?? 0
				if (indent <= metadataIndent) break
				if (/^\s*internal:\s*true\s*$/i.test(nested)) hasInternal = true
			}
			break
		}
	}

	if (hasInternal) return { changed: false, content }

	if (metadataIndex >= 0) {
		frontmatter.splice(metadataIndex + 1, 0, `${' '.repeat(metadataIndent + 2)}internal: true`)
	} else {
		frontmatter.push('metadata:', '  internal: true')
	}

	const updated = ['---', ...frontmatter, '---', ...lines.slice(endIndex + 1)].join('\n')
	return { changed: true, content: updated }
}

export function repairPrivateSkills(root: string): RepairResult {
	const privateSkillsDir = path.join(root, '.agents', 'skills')
	const publicSkillsDir = path.join(root, 'skills')
	const agentsSkillsDir = path.join(root, 'agents', 'skills')
	const actions: RepairAction[] = []
	let changed = false

	if (!fs.existsSync(privateSkillsDir)) return { changed: false, actions }

	for (const entry of fs.readdirSync(privateSkillsDir, { withFileTypes: true })) {
		const skillDir = path.join(privateSkillsDir, entry.name)
		const publicSkillDir = path.join(publicSkillsDir, entry.name)

		const stat = fs.lstatSync(skillDir)
		if (stat.isSymbolicLink()) {
			const resolved = fs.realpathSync(skillDir)
			const inPublicTree = resolved === publicSkillDir || resolved.startsWith(`${publicSkillsDir}${path.sep}`)
			if (inPublicTree) {
				fs.unlinkSync(skillDir)
				actions.push({
					skill: entry.name,
					action: 'removed_public_symlink',
					details: `${skillDir} -> ${resolved}`,
				})
				changed = true
				continue
			}
			const inAgentsTree =
				resolved === path.join(agentsSkillsDir, entry.name) || resolved.startsWith(`${agentsSkillsDir}${path.sep}`)
			if (inAgentsTree) {
				actions.push({ skill: entry.name, action: 'kept_agents_symlink', details: `${skillDir} -> ${resolved}` })
				continue
			}
		}

		const skillFile = path.join(skillDir, 'SKILL.md')
		if (!fs.existsSync(skillFile)) {
			if (fs.existsSync(path.join(skillDir, 'SKILL.local.md'))) {
				actions.push({ skill: entry.name, action: 'local_augmentation_only' })
				continue
			}
			actions.push({ skill: entry.name, action: 'skipped_missing_skill' })
			continue
		}

		const original = fs.readFileSync(skillFile, 'utf8')
		if (original.split('\n')[0]?.trim() !== '---') {
			actions.push({ skill: entry.name, action: 'skipped_no_frontmatter' })
			continue
		}

		const updated = ensureInternalMetadata(original)
		if (updated.changed) {
			fs.writeFileSync(skillFile, updated.content)
			actions.push({ skill: entry.name, action: 'updated_metadata' })
			changed = true
		} else {
			actions.push({ skill: entry.name, action: 'already_internal' })
		}
	}

	return { changed, actions }
}

export function validatePrivateSkills(root: string): PrivateSkillCheckResult {
	const privateSkillsDir = path.join(root, '.agents', 'skills')
	const publicSkillsDir = path.join(root, 'skills')
	const agentsSkillsDir = path.join(root, 'agents', 'skills')
	const issues: PrivateSkillIssue[] = []

	if (!fs.existsSync(privateSkillsDir)) return { ok: true, issues }

	for (const entry of fs.readdirSync(privateSkillsDir, { withFileTypes: true })) {
		const skillDir = path.join(privateSkillsDir, entry.name)
		const publicSkillDir = path.join(publicSkillsDir, entry.name)

		const stat = fs.lstatSync(skillDir)
		if (stat.isSymbolicLink()) {
			const resolved = fs.realpathSync(skillDir)
			const inPublicTree = resolved === publicSkillDir || resolved.startsWith(`${publicSkillsDir}${path.sep}`)
			if (inPublicTree) {
				issues.push({
					skill: entry.name,
					issue: 'public_skill_symlink',
					details: `${skillDir} -> ${resolved}`,
				})
				continue
			}
			const inAgentsTree =
				resolved === path.join(agentsSkillsDir, entry.name) || resolved.startsWith(`${agentsSkillsDir}${path.sep}`)
			if (inAgentsTree) continue
		}

		const skillFile = path.join(skillDir, 'SKILL.md')
		if (!fs.existsSync(skillFile)) {
			if (fs.existsSync(path.join(skillDir, 'SKILL.local.md'))) continue
			issues.push({ skill: entry.name, issue: 'missing_skill_file' })
			continue
		}

		const original = fs.readFileSync(skillFile, 'utf8')
		if (original.split('\n')[0]?.trim() !== '---') {
			issues.push({ skill: entry.name, issue: 'missing_frontmatter' })
			continue
		}

		const metadata = ensureInternalMetadata(original)
		if (metadata.changed) {
			issues.push({ skill: entry.name, issue: 'missing_metadata_internal' })
		}
	}

	return { ok: issues.length === 0, issues }
}
