#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
//#region src/skills/configure-awesome-sources/scripts/configure-awesome-sources.ts
function normalizeRepo(repo) {
	return repo.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/^\/+|\/+$/g, "");
}
function normalizePath(filePath) {
	return filePath.trim().replace(/^\/+/, "") || "awesome-skills.json";
}
function sourceKey(source) {
	return `${normalizeRepo(source.repo)}::${normalizePath(source.path)}`;
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
function loadSourceConfigFile(filePath) {
	if (!fs.existsSync(filePath)) return {
		version: 1,
		sources: [],
		disabled_sources: []
	};
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function saveSourceConfigFile(filePath, config) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify({
		version: 1,
		...config.sources && config.sources.length > 0 ? { sources: config.sources } : {},
		...config.disabled_sources && config.disabled_sources.length > 0 ? { disabled_sources: config.disabled_sources } : {}
	}, null, 2)}\n`);
}
function parseArgs(argv) {
	const args = argv.slice(2);
	return {
		command: args[0],
		layerValue: readFlag(args, "--layer"),
		repo: readFlag(args, "--repo"),
		filePath: normalizePath(readFlag(args, "--path") ?? "awesome-skills.json")
	};
}
function readFlag(args, flag) {
	const index = args.indexOf(flag);
	return index === -1 ? void 0 : args[index + 1];
}
function resolveLayer(value) {
	switch (value) {
		case "local":
		case "local-private": return "local-private";
		case "repo":
		case "repo-shared": return "repo-shared";
		case "global":
		case "global-user": return "global-user";
		default: throw new Error("Expected --layer local|repo|global");
	}
}
function mutateRefs(refs, predicate, next) {
	const kept = refs.filter((ref) => !predicate(ref));
	if (next) kept.push(next);
	return kept.sort((a, b) => sourceKey(a).localeCompare(sourceKey(b)));
}
function getCurrentSourceSet(config) {
	return new Set([...config.sources ?? [], ...config.disabled_sources ?? []].map(sourceKey));
}
function getLowerLayerSources(cwd, layer) {
	const all = [
		"global-user",
		"repo-shared",
		"local-private"
	];
	const index = all.indexOf(layer);
	const refs = /* @__PURE__ */ new Set();
	for (const item of all.slice(0, index)) {
		const config = loadSourceConfigFile(getLayerFilePath(cwd, item));
		for (const ref of config.sources ?? []) refs.add(sourceKey(ref));
	}
	return refs;
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
			sourceClass: "default"
		});
	}
	for (const layer of layers.reverse()) {
		const config = loadSourceConfigFile(layer.path);
		for (const ref of config.sources ?? []) {
			const key = sourceKey(ref);
			if (disabled.has(key) || kept.has(key)) continue;
			kept.set(key, {
				...ref,
				sourceClass: layer.sourceClass
			});
		}
	}
	return Array.from(kept.values());
}
function printUsage() {
	console.log("Usage:");
	console.log("  node skills/configure-awesome-sources/scripts/configure-awesome-sources.mjs list");
	console.log("  node skills/configure-awesome-sources/scripts/configure-awesome-sources.mjs add --layer local|repo|global --repo owner/name [--path awesome-skills.json]");
	console.log("  node skills/configure-awesome-sources/scripts/configure-awesome-sources.mjs remove --layer local|repo|global --repo owner/name [--path awesome-skills.json]");
	console.log("  node skills/configure-awesome-sources/scripts/configure-awesome-sources.mjs disable --layer local|repo|global --repo owner/name [--path awesome-skills.json]");
	console.log("  node skills/configure-awesome-sources/scripts/configure-awesome-sources.mjs enable --layer local|repo|global --repo owner/name [--path awesome-skills.json]");
}
const cwd = process.cwd();
const { command, layerValue, repo, filePath } = parseArgs(process.argv);
if (!command || command === "--help" || command === "help") {
	printUsage();
	process.exit(0);
}
if (command === "list") {
	const sources = getResolvedSources(cwd);
	if (sources.length === 0) {
		console.log("No awesome sources configured.");
		process.exit(0);
	}
	console.log("Effective awesome sources:");
	for (const source of sources) console.log(`- ${source.repo} (${source.path}) [${source.sourceClass}]`);
	process.exit(0);
}
const layer = resolveLayer(layerValue);
if (!repo) throw new Error("Expected --repo owner/name");
const ref = {
	repo: normalizeRepo(repo),
	path: filePath
};
const configPath = getLayerFilePath(cwd, layer);
const config = loadSourceConfigFile(configPath);
const predicate = (item) => sourceKey(item) === sourceKey(ref);
const currentRefs = getCurrentSourceSet(config);
const inheritedSources = getLowerLayerSources(cwd, layer);
switch (command) {
	case "add":
		config.sources = mutateRefs(config.sources ?? [], predicate, ref);
		config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate);
		saveSourceConfigFile(configPath, config);
		console.log(`Added ${ref.repo} (${ref.path}) to ${configPath}`);
		break;
	case "remove":
		config.sources = mutateRefs(config.sources ?? [], predicate);
		config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate);
		saveSourceConfigFile(configPath, config);
		console.log(`Removed ${ref.repo} (${ref.path}) from ${configPath}`);
		break;
	case "disable":
		config.sources = mutateRefs(config.sources ?? [], predicate);
		config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate, ref);
		saveSourceConfigFile(configPath, config);
		console.log(`Disabled ${ref.repo} (${ref.path}) in ${configPath}`);
		break;
	case "enable":
		config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate);
		if (!currentRefs.has(sourceKey(ref)) && !inheritedSources.has(sourceKey(ref))) {
			config.sources = mutateRefs(config.sources ?? [], predicate, ref);
			console.log(`Enabled ${ref.repo} (${ref.path}) in ${configPath} and added it as a direct source.`);
		} else {
			config.sources = mutateRefs(config.sources ?? [], predicate);
			console.log(`Enabled ${ref.repo} (${ref.path}) in ${configPath}.`);
		}
		saveSourceConfigFile(configPath, config);
		break;
	default:
		printUsage();
		process.exit(1);
}
const currentRepo = parseRepositoryFromPackage(cwd);
if (currentRepo && sourceKey(ref) === sourceKey({
	repo: currentRepo,
	path: "awesome-skills.json"
}) && command === "disable") console.log("Note: this disables the built-in default source for the current repo as well.");
//#endregion
export {};
