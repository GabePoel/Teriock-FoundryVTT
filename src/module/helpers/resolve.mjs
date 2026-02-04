import { TypeCollection } from "../documents/collections/_module.mjs";

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
  return /** @type {UUID<T>} */ (safeUuid.replace(/_/g, "."));
}

/**
 * Ensure a document is not an index.
 * @param {Index<TeriockDocument>} syncDoc
 * @returns {Promise<TeriockDocument|void>}
 */
export async function resolveDocument(syncDoc) {
  if (!syncDoc) return;
  if (syncDoc instanceof Document) {
    return syncDoc;
  } else {
    return fromUuid(syncDoc.uuid);
  }
}

/**
 * Ensure all documents in an array are not indexes.
 * @template T
 * @param {Index<T>[]} syncDocs
 * @returns {Promise<T[]>}
 */
export async function resolveDocuments(syncDocs) {
  return Promise.all(syncDocs.map(async (syncDoc) => resolveDocument(syncDoc)));
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
 * @param {TeriockCommon} document
 * @param {Teriock.Documents.CommonType} type
 * @param {string[]} names
 * @returns {Promise<TeriockChild[]>}
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
 * Attempt to add a compendium source for some document.
 * @param {TeriockCommon} document
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
      console.log(document.name);
    }
  }
}

/**
 * Attempt to add a compendium source for some document's children.
 * @param {TeriockCommon} document
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
