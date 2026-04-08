import { resolveDocument } from "./resolve.mjs";
import { toId } from "./string.mjs";

/**
 * Get a {@link TeriockItem} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockItem}.
 * @param {string} pack - Key corresponding to some {@link CompendiumCollection}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockItem}.
 * @returns {Promise<TeriockItem|null>}
 */
export async function getDocument(name, pack, options = {}) {
  if (!pack.includes(".")) pack = `teriock.${pack}`;
  const compendium = game.packs.get(pack);
  const uuid = compendium?.index.getName(name).uuid;
  const item = await fromUuid(uuid);
  if (!item) return null;
  if (item && options.clone) return item.clone();
  return item;
}

/**
 * Get a {@link TeriockRank} from the default {@link CompendiumCollection}.
 * @param {string} classKey - Key for the class of the {@link TeriockRank}.
 * @param {number} number - Number of the {@link TeriockRank} in the class.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockRank}.
 * @returns {Promise<TeriockRank|null>}
 */
export async function getRank(classKey, number, options = {}) {
  if (
    number > 5 ||
    number < 1 ||
    !Object.keys(TERIOCK.index.classes).includes(classKey)
  ) {
    return null;
  }
  const name = `Rank ${number} ${TERIOCK.index.classes[classKey]}`;
  return await getDocument(name, "classes", options);
}

/**
 * Copy a {@link TeriockRank} from the default {@link CompendiumCollection}.
 * @param {string} classKey - Key for the class of the {@link TeriockRank}.
 * @param {number} number - Number of the {@link TeriockRank} in the class.
 * @returns {Promise<TeriockRank|null>}
 */
export async function copyRank(classKey, number) {
  return await getRank(classKey, number, { clone: true });
}

/**
 * Get the UUID for a rules journal entry page.
 * @param {string} namespace
 * @param {string} pageName
 * @returns {string}
 */
export function ruleUuid(namespace, pageName) {
  const nsId = toId(namespace, { hash: false });
  const pnId = toId(pageName, { hash: false });
  return `Compendium.teriock.rules.JournalEntry.${nsId}.JournalEntryPage.${pnId}`;
}

/**
 * Get the object corresponding to some document.
 * @param {string} name - Name of the document.
 * @param {string} pack - Pack to find document in.
 * @param {object} [options]
 * @param {boolean} [options.stats]
 * @param {boolean} [options.source]
 * @returns {Promise<object|null>}
 */
export async function getObject(name, pack, options = {}) {
  const { source = true, stats = false } = options;
  if (!pack.includes(".")) pack = `teriock.${pack}`;
  const compendium = game.packs.get(pack);
  const doc = await resolveDocument(compendium?.index.getName(name).uuid);
  if (!doc) return null;
  const obj = doc.toObject(source);
  if (stats) {
    let srcUuid = doc.uuid;
    if (doc.parent?.type === "wrapper") srcUuid = doc.parent.uuid;
    foundry.utils.setProperty(obj, "_stats.compendiumSource", srcUuid);
  }
  return obj;
}
