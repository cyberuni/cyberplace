#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
//#region src/skills/update-awesome-list/scripts/inspect-skills-repo.ts
function normalizeRepo(repo) {
	return repo.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/^\/+|\/+$/g, "");
}
function parseRepositoryFromPackage(cwd) {
	const manifestPath = path.join(cwd, "package.json");
	if (!fs.existsSync(manifestPath)) return null;
	const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
	const repoUrl = typeof manifest.repository === "string" ? manifest.repository : manifest.repository?.url;
	if (!repoUrl) return null;
	const match = repoUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
	return match ? normalizeRepo(match[1]) : null;
}
function parseFrontmatter(content) {
	const lines = content.split("\n");
	let frontmatterCount = 0;
	let name = "";
	let description = "";
	for (const line of lines) {
		if (line.trim() === "---") {
			frontmatterCount += 1;
			if (frontmatterCount === 2) break;
			continue;
		}
		if (frontmatterCount !== 1) continue;
		const nameMatch = line.match(/^name:\s*(.+)$/);
		if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
		const descriptionMatch = line.match(/^description:\s*(.+)$/);
		if (descriptionMatch) description = descriptionMatch[1].trim().replace(/^["']|["']$/g, "");
	}
	return {
		name,
		description
	};
}
async function fetchRepoSkills(repo) {
	const response = await fetch(`https://api.github.com/repos/${repo}/contents/skills`, { headers: {
		Accept: "application/vnd.github+json",
		"User-Agent": "cyber-skills-awesome-skills"
	} });
	if (!response.ok) throw new Error(`Failed to inspect skills/ in ${repo}: ${response.status} ${response.statusText}`);
	const entries = await response.json();
	const results = [];
	for (const directory of entries.filter((entry) => entry.type === "dir").map((entry) => entry.name).sort()) {
		const skillResponse = await fetch(`https://api.github.com/repos/${repo}/contents/skills/${directory}/SKILL.md`, { headers: {
			Accept: "application/vnd.github+json",
			"User-Agent": "cyber-skills-awesome-skills"
		} });
		if (!skillResponse.ok) continue;
		const body = await skillResponse.json();
		if (!body.content || body.encoding !== "base64") continue;
		const fm = parseFrontmatter(Buffer.from(body.content, "base64").toString("utf8"));
		results.push({
			directory,
			...fm
		});
	}
	return results;
}
function readLocalRepoSkills(cwd) {
	const skillsDir = path.join(cwd, "skills");
	if (!fs.existsSync(skillsDir)) return [];
	return fs.readdirSync(skillsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
		const skillMd = path.join(skillsDir, entry.name, "SKILL.md");
		const fm = parseFrontmatter(fs.existsSync(skillMd) ? fs.readFileSync(skillMd, "utf8") : "");
		return {
			directory: entry.name,
			...fm
		};
	}).filter((item) => item.name && item.description).sort((a, b) => a.directory.localeCompare(b.directory));
}
const args = process.argv.slice(2);
const repoIndex = args.indexOf("--repo");
const queryIndex = args.indexOf("--query");
const repo = normalizeRepo(repoIndex !== -1 ? args[repoIndex + 1] : "");
const query = (queryIndex !== -1 ? args[queryIndex + 1] : "").toLowerCase();
if (!repo) {
	console.error("Usage: node skills/update-awesome-list/scripts/inspect-skills-repo.mjs --repo owner/name [--query term]");
	process.exit(1);
}
const skills = repo === parseRepositoryFromPackage(process.cwd()) ? readLocalRepoSkills(process.cwd()) : await fetchRepoSkills(repo);
const filtered = query ? skills.filter((skill) => `${skill.directory} ${skill.name} ${skill.description}`.toLowerCase().includes(query)) : skills;
console.log(`${repo} has ${skills.length} public skill(s).`);
for (const skill of filtered) console.log(`- ${skill.directory}: ${skill.description}`);
//#endregion
export {};
