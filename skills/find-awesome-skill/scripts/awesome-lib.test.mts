import test from 'node:test'
import assert from 'node:assert/strict'

import { flattenAwesomeEntries, validateAwesomeList } from './awesome-lib.mts'
import { renderAwesomeListMarkdown } from '../../update-awesome-list/scripts/render-awesome-list.mts'

test('validateAwesomeList accepts repos and skills objects with canonical keys', () => {
  const file = validateAwesomeList({
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
  }, 'memory')

  assert.deepEqual(Object.keys(file.repos), ['owner/repo'])
  assert.deepEqual(Object.keys(file.skills), ['owner/repo::skill-name'])

  const entries = flattenAwesomeEntries(file)
  assert.equal(entries[0]?.type, 'repo')
  assert.equal(entries[1]?.type, 'skill')
  assert.deepEqual(entries[0]?.tags, ['public-repo', 'targeted'])
  assert.deepEqual(entries[1]?.tags, ['validation'])
})

test('validateAwesomeList rejects mismatched canonical keys', () => {
  assert.throws(() => validateAwesomeList({
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
  }, 'memory'), /key must match normalized repo owner\/repo/)
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

  assert.notEqual(authoredRepoIndex, -1)
  assert.notEqual(authoredSkillIndex, -1)
  assert.notEqual(recommendedSkillIndex, -1)
  assert.ok(authoredRepoIndex < authoredSkillIndex)
  assert.ok(authoredSkillIndex < recommendedSkillIndex)
})
