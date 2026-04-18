import { TypeCollection } from "../documents/collections/_module.mjs";
import { toId } from "./string.mjs";
import { fromIdentifier, parseIdentifier } from "./utils.mjs";

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
 * @returns {Promise<T|null>}
 */
export async function resolveDocument(syncDoc) {
  let out = null;
  if (!syncDoc) return out;
  if (typeof syncDoc === "string") out = await fromUuid(syncDoc);
  else if (syncDoc instanceof Document) out = syncDoc;
  else out = await foundry.utils.fromUuid(syncDoc.uuid);
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
 * @param {TypedIdentifier[]} identifiers
 * @returns {Promise<ChildDocument[]>}
 */
export async function ensureChildren(document, identifiers) {
  if (identifiers.length === 0) return [];
  const typed = (await document.getChildren()).typeMap;
  const candidates = await Promise.all(
    identifiers.map(async (identifier) => {
      const parsed = parseIdentifier(identifier);
      if (!(parsed?.type && parsed?.identifier)) return;
      const existing = (typed[parsed.type] || []).filter(
        (n) => n?.system?.identifier === parsed.identifier,
      );
      if (existing.length) return;
      const doc = await fromIdentifier(identifier);
      if (!doc) return;
      const obj = doc.toObject(true);
      foundry.utils.setProperty(obj, "_stats.compendiumSource", doc.uuid);
      return { documentName: doc.documentName, data: obj };
    }),
  );
  const filtered = candidates.filter((_) => _);
  const documentNames = new Set(
    Object.values(filtered).map((v) => v?.documentName),
  );
  const childPromises = [];
  for (const documentName of documentNames) {
    const data = filtered
      .filter((d) => d?.documentName === documentName)
      .map((d) => d?.data);
    childPromises.push(document.createChildDocuments(documentName, data));
  }
  const childArrays = await Promise.all(childPromises);
  const children = [];
  for (const childArray of childArrays) {
    children.push(...childArray.filter((_) => _));
  }
  return children;
}

/**
 * Ensure a document has none of the predefined documents named.
 * @param {CommonDocument} document
 * @param {TypedIdentifier[]} identifiers
 * @returns {Promise<ChildDocument[]>}
 */
export async function ensureNoChildren(document, identifiers) {
  if (identifiers.length === 0) return [];
  const toDelete = (await document.getChildArray()).filter((c) =>
    identifiers.includes(c.typedIdentifier),
  );
  if (toDelete.length === 0) return [];
  const documentNames = new Set(toDelete.map((c) => c?.documentName));
  const deletePromises = [];
  for (const documentName of documentNames) {
    const ids = toDelete
      .filter((c) => c?.documentName === documentName)
      .map((c) => c.id);
    deletePromises.push(document.deleteChildDocuments(documentName, ids));
  }
  const deletedArrays = await Promise.all(deletePromises);
  const deletedDocs = [];
  for (const deletedArray of deletedArrays) {
    deletedDocs.push(...deletedArray.filter((_) => _));
  }
  return deletedDocs;
}

/**
 * Attempt to add a compendium source for some document.
 * @param {CommonDocument} document
 * @returns {Promise<void>}
 */
export async function inferCompendiumSource(document) {
  const ref = await fromIdentifier(document.typedIdentifier);
  if (ref?.uuid) await document.update({ "_stats.compendiumSource": ref.uuid });
}

/**
 * Attempt to add a compendium source for some document's children.
 * @param {CommonDocument} document
 * @returns {Promise<void>}
 */
export async function inferChildCompendiumSources(document) {
  const children = (await document.getChildArray()).map((_) => _);
  await Promise.all(children.map(async (c) => await inferCompendiumSource(c)));
}
/**
 * Get the UUID for a rule's journal entry page.
 * @param {string} namespace
 * @param {string} pageName
 * @returns {string}
 */
export function ruleUuid(namespace, pageName) {
  const nsId = toId(namespace, { hash: false });
  const pnId = toId(pageName, { hash: false });
  return `Compendium.teriock.rules.JournalEntry.${nsId}.JournalEntryPage.${pnId}`;
}
