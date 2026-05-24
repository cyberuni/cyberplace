#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import { flattenAwesomeEntries, validateAwesomeList } from '../../find-awesome-skill/scripts/awesome-lib.mts'

interface Highlight {
  type: string
  key: string
  summary: string
}

interface RepoEntry {
  type: 'repo'
  repo: string
  kind: string
  trust: 'authored' | 'recommended'
  summary: string
  why_recommended: string
  tags: string[]
  highlights?: Highlight[]
}

interface SkillEntry {
  type: 'skill'
  repo: string
  skill: string
  kind: string
  trust: 'authored' | 'recommended'
  summary: string
  why_recommended: string
  tags: string[]
}

type Entry = RepoEntry | SkillEntry

function deriveInstallCommand(entry: Entry): string {
  return entry.type === 'repo'
    ? `npx skills add ${entry.repo}`
    : `npx skills add ${entry.repo} --skill ${entry.skill}`
}

export function renderAwesomeListMarkdown(entries: Entry[]): string {
  const sections: string[] = ['## Awesome Skills', '']
  for (const trust of ['authored', 'recommended'] as const) {
    const grouped = entries
      .filter(entry => entry.trust === trust)
      .sort((a, b) => a.repo.localeCompare(b.repo) || (a.type === 'skill' ? a.skill : '').localeCompare(b.type === 'skill' ? b.skill : ''))
    if (grouped.length === 0) continue
    sections.push(`### ${trust === 'authored' ? 'Authored' : 'Recommended'}`)
    sections.push('')
    for (const entry of grouped) {
      const title = entry.type === 'repo' ? `\`${entry.repo}\`` : `\`${entry.repo}#${entry.skill}\``
      sections.push(`- ${title} — ${entry.kind}`)
      sections.push(`  ${entry.summary}`)
      sections.push(`  Why recommended: ${entry.why_recommended}`)
      if (entry.tags.length > 0) sections.push(`  Tags: ${entry.tags.map(tag => `\`${tag}\``).join(', ')}`)
      sections.push(`  Install: \`${deriveInstallCommand(entry)}\``)
      if (entry.type === 'repo' && entry.highlights && entry.highlights.length > 0) {
        sections.push('  Highlights:')
        for (const highlight of entry.highlights) {
          sections.push(`  - \`${highlight.type}:${highlight.key}\` — ${highlight.summary}`)
        }
      }
      sections.push('')
    }
  }
  return sections.join('\n').trimEnd()
}

function updateMarkedSection(content: string, markerName: string, replacement: string): string {
  const start = `<!-- ${markerName}:START -->`
  const end = `<!-- ${markerName}:END -->`
  if (!content.includes(start) || !content.includes(end)) throw new Error(`Missing ${markerName} markers in target file`)
  return content.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'm'), `${start}\n${replacement}\n${end}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cwd = process.cwd()
  const awesomePath = path.join(cwd, 'awesome-skills.json')
  const readmePath = path.join(cwd, 'readme.md')
  const awesome = validateAwesomeList(JSON.parse(fs.readFileSync(awesomePath, 'utf8')), awesomePath)
  const markdown = renderAwesomeListMarkdown(flattenAwesomeEntries(awesome))
  const updated = updateMarkedSection(fs.readFileSync(readmePath, 'utf8'), 'AWESOME-SKILLS', markdown)

  fs.writeFileSync(readmePath, updated)
  console.log(`Updated awesome list section in ${readmePath}`)
}
