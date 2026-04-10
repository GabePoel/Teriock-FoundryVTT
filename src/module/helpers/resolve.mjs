import { TypeCollection } from "../documents/collections/_module.mjs";
import { toId } from "./string.mjs";

const { Document } = foundry.abstract;

/**
 * Convert a UUID to a string that can be safely used as a key in some document's system data.
 * @template T
 * @param {UUID<T>} uuid - The UUID to convert.
 * @returns {SafeUUID<T>} The converted safe UUID.
 */
export function safeUuid(uuid) {
  return /** @type {SafeUUID<*>} */ (uuid.replace(/\./g, "_"));
}

/**
 * Convert a UUID to a string that can be safely used as a key in some document's system data.
 * @template T
 * @param {SafeUUID<T>} safeUuid - The safe UUID to convert.
 * @returns {UUID<T>} The original UUID.
 */
export function pureUuid(safeUuid) {
  return /** @type {UUID} */ (safeUuid.replace(/_/g, "."));
}

/**
 * Ensure a document is not an index.
 * @template T
 * @param {Index<T> | UUID<T>} syncDoc
 * @param {Teriock.System.ResolveDocumentOptions} [options]
 * @returns {Promise<T|null>}
 */
export async function resolveDocument(syncDoc, options = {}) {
  let out = null;
  if (!syncDoc) return out;
  if (typeof syncDoc === "string") {
    out = await fromUuid(syncDoc);
  } else if (syncDoc instanceof Document) {
    out = syncDoc;
  } else {
    out = await foundry.utils.fromUuid(syncDoc.uuid);
  }
  if (out?.type === "wrapper" && !options.preserveWrappers) {
    out = out.system?.effect || out;
  }
  return out;
}

/**
 * Ensure all documents in an array are not indexes.
 * @template T
 * @param {Index<T>[] | UUID<T>} syncDocs
 * @param {Teriock.System.ResolveDocumentsOptions} [options]
 * @returns {Promise<T[]>}
 */
export async function resolveDocuments(syncDocs, options = {}) {
  const fetched = await Promise.all(
    syncDocs.map(async (syncDoc) => resolveDocument(syncDoc, options)),
  );
  let out = [...fetched.filter((d) => d?.documentName !== "Folder")];
  const folders = /** @type {TeriockFolder[]} */ fetched.filter(
    (d) => d?.documentName === "Folder",
  );
  if (options.expandFolders) {
    const toAdd = await Promise.all(folders.map((d) => d.getAllContents()));
    for (const arr of toAdd) out.push(...arr);
  } else {
    out.push(...folders);
  }
  // Add rollable tables. This includes the tables that were in folders.
  const tables = /** @type {TeriockRollTable[]} */ out.filter(
    (d) => d?.documentName === "RollTable",
  );
  out = out.filter((d) => d?.documentName !== "RollTable");
  if (options.expandTables) {
    const toAdd = await Promise.all(tables.map((d) => d.getAllContents()));
    for (const arr of toAdd) out.push(...arr);
  } else {
    out.push(...tables);
  }
  return out.filter((_) => _);
}

/**
 * Ensure all documents in a collection are not indexes.
 * @param {IndexCollection} typeCollection
 * @returns {Promise<TypeCollection>}
 */
export async function resolveCollection(typeCollection) {
  const syncDocs = await resolveDocuments(typeCollection.contents);
  return new TypeCollection(syncDocs.map((d) => [d.id, d]));
}

/**
 * Ensure a document has all the predefined documents named.
 * @param {CommonDocument} document
 * @param {Teriock.Documents.CommonType} type
 * @param {string[]} names
 * @returns {Promise<ChildDocument[]>}
 */
export async function ensureChildren(document, type, names) {
  if (names.length === 0) return [];
  const existing = document.children.typeMap[type] || [];
  names = names.filter((n) => !existing.map((e) => e.name).includes(n));
  const packName = TERIOCK.options.document[type]["pack"];
  if (names.length === 0 || !packName) return [];
  const pack = game.packs.get(`teriock.${packName}`);
  if (!pack) return [];
  const docs = await resolveDocuments(names.map((n) => pack.index.getName(n)));
  const data = docs.map((d) => {
    const uuid = d?.uuid;
    const doc = d?.type === "wrapper" ? d?.system.effect : d;
    const out = doc.toObject();
    foundry.utils.setProperty(out, "_stats.compendiumSource", uuid);
    return out;
  });
  if (data.length === 0) return [];
  const documentName =
    docs[0]?.type === "wrapper" ? "ActiveEffect" : docs[0]?.documentName;
  return document.createChildDocuments(documentName, data);
}

/**
 * Ensure a document has none of the predefined documents named.
 * @param {CommonDocument} document
 * @param {Teriock.Documents.CommonType} type
 * @param {string[]} names
 * @returns {Promise<CommonDocument[]>}
 */
export async function ensureNoChildren(document, type, names) {
  const existing = document.children.typeMap[type] || [];
  const toDelete = existing.filter((c) => names.includes(c.name));
  if (toDelete.length === 0) return [];
  const documentName = toDelete[0]?.documentName;
  return document.deleteChildDocuments(
    documentName,
    toDelete.map((c) => c.id),
  );
}

/**
 * Attempt to add a compendium source for some document.
 * @param {CommonDocument} document
 * @returns {Promise<void>}
 */
export async function inferCompendiumSource(document) {
  const pack = game.packs.get(
    "teriock." + TERIOCK.options.document[document.type]["pack"],
  );
  if (pack) {
    const ref = pack.index.getName(document.name);
    if (ref) {
      let uuid = ref.uuid;
      if (document.uuid.includes(uuid)) uuid = null;
      await document.update({ "_stats.compendiumSource": uuid });
    } else {
      console.warn(`Could not find a compendium source for ${document.name}`);
    }
  }
}

/**
 * Attempt to add a compendium source for some document's children.
 * @param {CommonDocument} document
 * @returns {Promise<void>}
 */
export async function inferChildCompendiumSources(document) {
  for (const d of await document.getChildArray()) {
    const pack = game.packs.get(
      "teriock." + TERIOCK.options.document[d.type]["pack"],
    );
    if (pack) {
      const ref = pack.index.getName(d.name);
      if (ref) {
        let uuid = ref.uuid;
        if (d.uuid.includes(uuid)) uuid = null;
        await d.update({ "_stats.compendiumSource": uuid });
        await inferChildCompendiumSources(d);
      }
    }
  }
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
