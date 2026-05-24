import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
//#region src/hooks/lib/package-root.mts
/** Package root (parent of hooks/). */
function getPackageRoot() {
	const candidate = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
	return basename(candidate) === "src" ? dirname(candidate) : candidate;
}
//#endregion
export { getPackageRoot };
