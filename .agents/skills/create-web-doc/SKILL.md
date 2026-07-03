---
name: create-web-doc
description: Use this skill when creating a new Astro docs page for a topic.
metadata:
  internal: true
---

# Create Web Doc

## Prerequisites

- Astro-based docs site (Starlight or custom Astro content collections)
- Know the topic title and target section

## Workflow

1. **Locate the content directory**
   - Check for `src/content/docs/` (Starlight) or `src/pages/` (plain Astro)
   - Confirm the section subdirectory for the topic (e.g., `guides/`, `reference/`, `concepts/`)

2. **Determine the slug**
   - Derive from topic title: lowercase, words separated by `-`, no special chars
   - Example: "Agent Configuration" → `agent-configuration`

3. **Create the file**
   - Path: `src/content/docs/<section>/<slug>.md` (or `.mdx` if JSX components needed)
   - Write frontmatter:
     ```yaml
     ---
     title: <Topic Title>
     description: <One-sentence summary of the page>
     ---
     ```

4. **Scaffold content**
   - Add an intro paragraph: what this topic is and when it matters
   - Add `## ` sections covering the topic's key concepts
   - Keep prose tight; prefer examples over explanation

5. **Register in sidebar (if manual)**
   - Check `astro.config.mjs` or `astro.config.ts` for a `sidebar` array
   - Add an entry under the correct section group:
     ```js
     { label: '<Topic Title>', slug: '<section>/<slug>' }
     ```
   - Skip if sidebar is auto-generated (`autogenerate` option present)

6. **Verify**
   - Run `pnpm dev` (or `npm run dev`) and navigate to the page
   - Confirm title renders, nav entry appears, no build errors

## Anti-patterns

- Do not create pages outside `src/content/docs/` for Starlight sites
- Do not skip the `description` frontmatter — it powers SEO and link previews
- Do not hardcode sidebar order without checking existing convention in `astro.config`
