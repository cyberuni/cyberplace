import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
//#region src/skills/find-awesome-skill/scripts/awesome-lib.ts
const SOURCE_CLASS_RANK = {
	default: 0,
	"global-user": 1,
	"repo-shared": 2,
	"local-private": 3
};
function normalizeRepo(repo) {
	return repo.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/^\/+|\/+$/g, "");
}
function normalizePath(filePath) {
	return filePath.trim().replace(/^\/+/, "") || "awesome-skills.json";
}
function normalizeTag(tag) {
	return tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function normalizeTags(value) {
	if (!Array.isArray(value)) return [];
	return Array.from(new Set(value.map((item) => normalizeTag(String(item))).filter(Boolean))).sort();
}
function entryId(entry) {
	return entry.type === "repo" ? entry.repo : `${entry.repo}::${entry.skill}`;
}
function skillEntryId(repo, skill) {
	return `${repo}::${skill}`;
}
function highlightId(repo, highlight) {
	return `${repo}::${highlight.type}::${highlight.key}`;
}
function sourceKey(source) {
	return `${normalizeRepo(source.repo)}::${normalizePath(source.path)}`;
}
function deriveInstallCommand(entry) {
	return entry.type === "repo" ? `npx skills add ${entry.repo}` : `npx skills add ${entry.repo} --skill ${entry.skill}`;
}
function getLayerFilePath(cwd, sourceClass) {
	switch (sourceClass) {
		case "local-private": return path.join(cwd, ".agents", "awesome-skill-sources.local.json");
		case "repo-shared": return path.join(cwd, ".agents", "awesome-skill-sources.json");
		case "global-user": return path.join(os.homedir(), ".agents", "awesome-skill-sources.json");
	}
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
function validateHighlight(value, context) {
	const highlight = value;
	if (!highlight || typeof highlight !== "object") throw new Error(`${context} must be an object`);
	if (!highlight.type || !highlight.key || !highlight.summary || !highlight.why_recommended) throw new Error(`${context} must include type, key, summary, and why_recommended`);
	return {
		type: highlight.type,
		key: String(highlight.key),
		summary: String(highlight.summary),
		why_recommended: String(highlight.why_recommended),
		tags: normalizeTags(highlight.tags)
	};
}
function validateAwesomeList(data, origin) {
	const file = data;
	if (!file || typeof file !== "object" || file.version !== 1 || typeof file.repos !== "object" || file.repos === null || typeof file.skills !== "object" || file.skills === null) throw new Error(`${origin} must contain version: 1 plus repos and skills objects`);
	return {
		version: 1,
		repos: Object.fromEntries(Object.entries(file.repos).map(([key, raw], index) => {
			const entry = raw;
			const context = `${origin} repo ${index + 1}`;
			if (!entry || typeof entry !== "object") throw new Error(`${context} must be an object`);
			if (!entry.repo || !entry.summary || !entry.why_recommended || !entry.kind || !entry.trust) throw new Error(`${context} is missing required fields`);
			const normalizedRepo = normalizeRepo(entry.repo);
			if (key !== normalizedRepo) throw new Error(`${context} key must match normalized repo ${normalizedRepo}`);
			return [key, {
				repo: normalizedRepo,
				kind: entry.kind,
				trust: entry.trust,
				summary: String(entry.summary),
				why_recommended: String(entry.why_recommended),
				tags: normalizeTags(entry.tags),
				highlights: Array.isArray(entry.highlights) ? entry.highlights.map((item, i) => validateHighlight(item, `${context} highlight ${i + 1}`)) : []
			}];
		})),
		skills: Object.fromEntries(Object.entries(file.skills).map(([key, raw], index) => {
			const entry = raw;
			const context = `${origin} skill ${index + 1}`;
			if (!entry || typeof entry !== "object") throw new Error(`${context} must be an object`);
			if (!entry.repo || !entry.skill || !entry.summary || !entry.why_recommended || !entry.kind || !entry.trust) throw new Error(`${context} is missing required fields`);
			const normalizedRepo = normalizeRepo(entry.repo);
			const normalizedSkill = String(entry.skill);
			const normalizedId = skillEntryId(normalizedRepo, normalizedSkill);
			if (key !== normalizedId) throw new Error(`${context} key must match normalized skill id ${normalizedId}`);
			return [key, {
				repo: normalizedRepo,
				skill: normalizedSkill,
				kind: entry.kind,
				trust: entry.trust,
				summary: String(entry.summary),
				why_recommended: String(entry.why_recommended),
				tags: normalizeTags(entry.tags)
			}];
		}))
	};
}
function flattenAwesomeEntries(file) {
	const repoEntries = Object.values(file.repos).map((entry) => ({
		type: "repo",
		...entry
	}));
	const skillEntries = Object.values(file.skills).map((entry) => ({
		type: "skill",
		...entry
	}));
	return [...repoEntries, ...skillEntries];
}
function loadSourceConfigFile(filePath) {
	if (!fs.existsSync(filePath)) return {
		version: 1,
		sources: [],
		disabled_sources: []
	};
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function getResolvedSources(cwd) {
	const layers = [
		{
			sourceClass: "local-private",
			path: getLayerFilePath(cwd, "local-private")
		},
		{
			sourceClass: "repo-shared",
			path: getLayerFilePath(cwd, "repo-shared")
		},
		{
			sourceClass: "global-user",
			path: getLayerFilePath(cwd, "global-user")
		}
	];
	const disabled = /* @__PURE__ */ new Set();
	const kept = /* @__PURE__ */ new Map();
	for (const layer of layers) {
		const config = loadSourceConfigFile(layer.path);
		for (const ref of config.disabled_sources ?? []) disabled.add(sourceKey(ref));
	}
	const currentRepo = parseRepositoryFromPackage(cwd);
	if (currentRepo) {
		const ref = {
			repo: currentRepo,
			path: "awesome-skills.json"
		};
		const key = sourceKey(ref);
		if (!disabled.has(key) && fs.existsSync(path.join(cwd, ref.path))) kept.set(key, {
			...ref,
			sourceClass: "default",
			origin: path.join(cwd, ref.path)
		});
	}
	for (const layer of layers.slice().reverse()) {
		const config = loadSourceConfigFile(layer.path);
		for (const ref of config.sources ?? []) {
			const key = sourceKey(ref);
			if (disabled.has(key)) continue;
			const existing = kept.get(key);
			if (!existing || SOURCE_CLASS_RANK[layer.sourceClass] > SOURCE_CLASS_RANK[existing.sourceClass]) kept.set(key, {
				...ref,
				sourceClass: layer.sourceClass,
				origin: layer.path
			});
		}
	}
	return Array.from(kept.values()).sort((a, b) => SOURCE_CLASS_RANK[b.sourceClass] - SOURCE_CLASS_RANK[a.sourceClass]);
}
async function loadAwesomeListFromSource(source, cwd) {
	const currentRepo = parseRepositoryFromPackage(cwd);
	if (currentRepo && source.repo === currentRepo) return validateAwesomeList(JSON.parse(fs.readFileSync(path.join(cwd, source.path), "utf8")), source.path);
	const response = await fetch(`https://api.github.com/repos/${source.repo}/contents/${source.path}`, { headers: {
		Accept: "application/vnd.github+json",
		"User-Agent": "cyber-skills-awesome-skills"
	} });
	if (!response.ok) throw new Error(`Failed to fetch ${source.repo}/${source.path}: ${response.status} ${response.statusText}`);
	const body = await response.json();
	if (!body.content || body.encoding !== "base64") throw new Error(`GitHub contents API did not return base64 content for ${source.repo}/${source.path}`);
	return validateAwesomeList(JSON.parse(Buffer.from(body.content, "base64").toString("utf8")), `${source.repo}/${source.path}`);
}
async function loadAllAwesomeLists(cwd) {
	const loaded = [];
	for (const source of getResolvedSources(cwd)) loaded.push({
		source,
		file: await loadAwesomeListFromSource(source, cwd)
	});
	return loaded;
}
function mergeAwesomeEntries(loaded) {
	const byId = /* @__PURE__ */ new Map();
	for (const { source, file } of loaded) for (const entry of flattenAwesomeEntries(file)) {
		const id = entryId(entry);
		const note = {
			source: `${source.repo}/${source.path}`,
			sourceClass: source.sourceClass,
			why_recommended: entry.why_recommended
		};
		const existing = byId.get(id);
		if (!existing) {
			byId.set(id, {
				canonical: entry,
				canonicalSourceClass: source.sourceClass,
				tags: new Set(entry.tags),
				notes: [note],
				highlights: new Map((entry.type === "repo" ? entry.highlights ?? [] : []).map((item) => [highlightId(entry.repo, item), item])),
				sourceClasses: new Set([source.sourceClass])
			});
			continue;
		}
		existing.sourceClasses.add(source.sourceClass);
		for (const tag of entry.tags) existing.tags.add(tag);
		if (!existing.notes.some((item) => item.source === note.source && item.why_recommended === note.why_recommended)) existing.notes.push(note);
		if (entry.type === "repo") for (const highlight of entry.highlights ?? []) {
			const key = highlightId(entry.repo, highlight);
			if (!existing.highlights.has(key)) existing.highlights.set(key, highlight);
		}
		if (SOURCE_CLASS_RANK[source.sourceClass] > SOURCE_CLASS_RANK[existing.canonicalSourceClass]) {
			existing.canonical = entry;
			existing.canonicalSourceClass = source.sourceClass;
		}
	}
	return Array.from(byId.entries()).map(([id, state]) => ({
		id,
		type: state.canonical.type,
		repo: state.canonical.repo,
		skill: state.canonical.type === "skill" ? state.canonical.skill : void 0,
		kind: state.canonical.kind,
		trust: state.canonical.trust,
		summary: state.canonical.summary,
		why_recommended: state.notes[0]?.why_recommended ?? state.canonical.why_recommended,
		notes: state.notes,
		tags: Array.from(state.tags).sort(),
		highlights: state.canonical.type === "repo" ? Array.from(state.highlights.values()).sort((a, b) => a.key.localeCompare(b.key)) : void 0,
		corroborationCount: state.notes.length,
		sourceClasses: Array.from(state.sourceClasses).sort((a, b) => SOURCE_CLASS_RANK[b] - SOURCE_CLASS_RANK[a]),
		installCommand: deriveInstallCommand(state.canonical)
	}));
}
function tokenize(value) {
	return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
async function findAwesomeSkills(cwd, query) {
	const entries = mergeAwesomeEntries(await loadAllAwesomeLists(cwd));
	const q = query.trim().toLowerCase();
	const tokens = tokenize(q);
	return entries.map((entry) => {
		let score = 0;
		const reasons = [];
		const repoText = entry.repo.toLowerCase();
		const skillText = entry.skill?.toLowerCase() ?? "";
		const summaryText = entry.summary.toLowerCase();
		const highlightText = (entry.highlights ?? []).map((item) => `${item.type} ${item.key} ${item.summary} ${item.tags.join(" ")}`).join(" ").toLowerCase();
		if (!q) {
			score += entry.trust === "authored" ? 10 : 0;
			score += entry.corroborationCount;
		}
		if (q && (repoText === q || skillText === q)) {
			score += 100;
			reasons.push("exact name match");
		}
		if (q && (repoText.includes(q) || skillText.includes(q) || highlightText.includes(q))) {
			score += 50;
			reasons.push("name contains query");
		}
		for (const token of tokens) {
			if (summaryText.includes(token)) score += 10;
			if (entry.tags.some((tag) => tag.includes(token))) score += 12;
			if (highlightText.includes(token)) score += 8;
		}
		const corroborationBonus = Math.max(0, entry.corroborationCount - 1) * 6;
		score += corroborationBonus;
		if (corroborationBonus > 0) reasons.push(`recommended by ${entry.corroborationCount} sources`);
		if (entry.sourceClasses.includes("local-private")) score += 6;
		else if (entry.sourceClasses.includes("repo-shared")) score += 4;
		else if (entry.sourceClasses.includes("global-user")) score += 2;
		if (score > 0 && tokens.some((token) => entry.tags.includes(token))) reasons.push("tag match");
		return {
			...entry,
			score,
			reasons: Array.from(new Set(reasons))
		};
	}).filter((entry) => entry.score > 0 || !q).sort((a, b) => b.score - a.score || a.repo.localeCompare(b.repo) || (a.skill ?? "").localeCompare(b.skill ?? ""));
}
//#endregion
export { findAwesomeSkills, flattenAwesomeEntries, validateAwesomeList };
