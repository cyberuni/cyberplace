import { expect, test } from 'vitest'

import { parseMarkdownSection } from './extract-section.js'

test('parseMarkdownSection extracts heading and body', () => {
	const md = '# Title\n\n## Commit Discipline\n\n- Rule one\n\n## Other\n\nMore'
	const section = parseMarkdownSection(md, 'Commit Discipline')
	expect(section).toContain('## Commit Discipline')
	expect(section).toContain('- Rule one')
	expect(section).not.toContain('Other')
})

test('parseMarkdownSection accepts heading with hashes', () => {
	const md = '## Skill Augmentations\n\nAlways check SKILL.local.md\n'
	expect(parseMarkdownSection(md, '## Skill Augmentations')).toContain('Always check SKILL.local.md')
})

test('parseMarkdownSection returns null when heading is missing', () => {
	expect(parseMarkdownSection('# Title\n', 'Missing')).toBeNull()
})
