import { resolveDocument } from "./resolve.mjs";

/**
 * Open a page on the [Teriock wiki](https://wiki.teriock.com).
 * @param title
 */
export function openWikiPage(title) {
  const baseWikiUrl = "https://wiki.teriock.com";
  const pageUrl = `${baseWikiUrl}/index.php/${encodeURIComponent(title)}`;
  window.open(pageUrl, "_blank");
}

/**
 * Get the UUID for some document referenced on the wiki.
 * @param {string} namespace
 * @param {string} name
 * @returns {Promise<UUID<TeriockDocument>|null>}
 */
export async function wikiToUuid(namespace, name) {
  const config = TERIOCK.config.wiki.namespaces[namespace];
  if (!config) return null;
  const packs = config.packs.map((p) => game.packs.get(p)).filter((_) => _);
  const parentName = config.parentKey === "name" ? name : namespace;
  const candidates = [];
  for (const p of packs) {
    const parentIndex = p.index.getName(parentName);
    if (parentIndex && config.collection) {
      const parent = await resolveDocument(parentIndex);
      const embed = parent[config.collection]?.getName(name);
      if (embed) candidates.push(embed.uuid);
    } else if (parentIndex) candidates.push(parentIndex.uuid);
  }
  if (candidates.length) return candidates[0];
  return null;
}
