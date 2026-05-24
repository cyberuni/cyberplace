import { expect, test } from 'vitest'

import { flattenAwesomeEntries, validateAwesomeList } from '../../../skills/find-awesome-skill/scripts/awesome-lib.mts'
import { renderAwesomeListMarkdown } from '../../../skills/update-awesome-list/scripts/render-awesome-list.mts'

test('validateAwesomeList accepts repos and skills objects with canonical keys', () => {
	const file = validateAwesomeList(
		{
			version: 1,
			repos: {
				'owner/repo': {
					repo: 'https://github.com/owner/repo.git',
					kind: 'targeted',
					trust: 'authored',
					summary: 'Repo summary',
					why_recommended: 'Repo reason',
					tags: ['Public Repo', 'targeted'],
				},
			},
			skills: {
				'owner/repo::skill-name': {
					repo: 'owner/repo',
					skill: 'skill-name',
					kind: 'targeted',
					trust: 'recommended',
					summary: 'Skill summary',
					why_recommended: 'Skill reason',
					tags: ['Validation'],
				},
			},
		},
		'memory',
	)

	expect(Object.keys(file.repos)).toEqual(['owner/repo'])
	expect(Object.keys(file.skills)).toEqual(['owner/repo::skill-name'])

	const entries = flattenAwesomeEntries(file)
	expect(entries[0]?.type).toBe('repo')
	expect(entries[1]?.type).toBe('skill')
	expect(entries[0]?.tags).toEqual(['public-repo', 'targeted'])
	expect(entries[1]?.tags).toEqual(['validation'])
})

test('validateAwesomeList rejects mismatched canonical keys', () => {
	expect(() =>
		validateAwesomeList(
			{
				version: 1,
				repos: {
					wrong: {
						repo: 'owner/repo',
						kind: 'targeted',
						trust: 'authored',
						summary: 'Repo summary',
						why_recommended: 'Repo reason',
						tags: [],
					},
				},
				skills: {},
			},
			'memory',
		),
	).toThrow(/key must match normalized repo owner\/repo/)
})

test('renderAwesomeListMarkdown sorts entries by trust then canonical id', () => {
	const markdown = renderAwesomeListMarkdown([
		{
			type: 'skill',
			repo: 'z/repo',
			skill: 'z-skill',
			kind: 'targeted',
			trust: 'authored',
			summary: 'Z skill',
			why_recommended: 'Z reason',
			tags: [],
		},
		{
			type: 'repo',
			repo: 'a/repo',
			kind: 'targeted',
			trust: 'authored',
			summary: 'A repo',
			why_recommended: 'A reason',
			tags: [],
			highlights: [],
		},
		{
			type: 'skill',
			repo: 'a/repo',
			skill: 'a-skill',
			kind: 'targeted',
			trust: 'recommended',
			summary: 'A skill',
			why_recommended: 'A skill reason',
			tags: [],
		},
	])

	const authoredRepoIndex = markdown.indexOf('`a/repo`')
	const authoredSkillIndex = markdown.indexOf('`z/repo#z-skill`')
	const recommendedSkillIndex = markdown.indexOf('`a/repo#a-skill`')

	expect(authoredRepoIndex).not.toBe(-1)
	expect(authoredSkillIndex).not.toBe(-1)
	expect(recommendedSkillIndex).not.toBe(-1)
	expect(authoredRepoIndex).toBeLessThan(authoredSkillIndex)
	expect(authoredSkillIndex).toBeLessThan(recommendedSkillIndex)
})
