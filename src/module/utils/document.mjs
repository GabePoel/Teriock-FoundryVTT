/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * Ensure a document is not an index.
 * @template T
 * @param {Teriock.Hierarchy.Index<T> | UUID<T> | TypedIdentifier} syncDoc
 * @returns {Promise<T|null>}
 */
export async function resolveDocument(syncDoc) {
  let out = null;
  if (!syncDoc) { return out; }
  if (typeof syncDoc === "string") { out = await fromKey(syncDoc); }
  else if (syncDoc instanceof foundry.abstract.Document) { out = syncDoc; }
  else { out = await foundry.utils.fromUuid(syncDoc.uuid); }
  return out;
}

/**
 * Ensure all documents in an array are not indexes.
 * @template T
 * @param {Teriock.Hierarchy.Index<T>[] | UUID<T> | TypedIdentifier} syncDocs
 * @param {Teriock.System.ResolveDocumentsOptions} [options]
 * @returns {Promise<T[]>}
 */
export async function resolveDocuments(syncDocs, options = {}) {
  const fetched = await Promise.all(syncDocs.map(syncDoc => resolveDocument(syncDoc)));
  let out = [...fetched.filter(d => d?.documentName !== "Folder")];
  const folders = /** @type {TeriockFolder[]} */ fetched.filter(d => d?.documentName === "Folder");
  if (options.expandFolders) {
    const toAdd = await Promise.all(folders.map(d => d.getAllContents()));
    for (const arr of toAdd) { out.push(...arr); }
  } else { out.push(...folders); }
  // Add rollable tables. This includes the tables that were in folders.
  const tables = /** @type {TeriockRollTable[]} */ out.filter(d => d?.documentName === "RollTable");
  out = out.filter(d => d?.documentName !== "RollTable");
  if (options.expandTables) {
    const toAdd = await Promise.all(tables.map(d => d.getAllContents()));
    for (const arr of toAdd) { out.push(...arr); }
  } else { out.push(...tables); }
  return out.filter(Boolean);
}

/**
 * Parse an identifier into its component parts.
 * @param {Identifier} identifier
 * @returns {Teriock.System.ResolvedIdentifier | null}
 */
export function parseIdentifier(identifier) {
  let type = null;
  if (identifier && identifier.includes(":")) {
    const parts = identifier.split(":");
    type = parts[0];
    identifier = parts[1];
  }
  return { identifier, type };
}

/**
 * Get a document's name from an identifier.
 * @param {TypedIdentifier} identifier
 * @returns {string}
 */
export function getName(identifier) {
  return game.teriock.identifiers.getName(identifier, { forced: true });
}

/**
 * Infer a document's icon from an identifier.
 * @param {TypedIdentifier|Identifier} identifier
 * @returns {string}
 */
export function getIcon(identifier) {
  const parsed = parseIdentifier(identifier);
  return getSystemClass(parsed?.type)?.metadata.icon ?? TERIOCK.DISPLAY.icons.manifest.ui.document;
}

/**
 * Get a system subtype data model from the type.
 * @param {string} type
 * @returns {typeof TypeDataModel | null}
 */
export function getSystemClass(type) {
  for (const documentName of ["ActiveEffect", "Actor", "Card", "Item", "JournalEntryPage"]) {
    const model = CONFIG[documentName].dataModels[type];
    if (model) { return model; }
  }
  return null;
}

/**
 * Get the label for a system subtype from the type.
 * @param {string} type
 * @returns {string|undefined}
 */
export function getTypeLabel(type) {
  const documentName = getSystemClass(type)?.metadata.documentName;
  return documentName ? _loc(CONFIG[documentName].typeLabels[type]) : undefined;
}

/**
 * Find the best document from a string that describes it. Typed identifiers are preferred over plain identifiers
 * which are preferred over names.
 * @param {TypedIdentifier|Identifier|string} lookup
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} relativeTo
 * @param {object} [options]
 * @param {boolean} [options.relativeOnly]
 * @returns {Promise<TeriockActiveEffect|TeriockActor|TeriockItem|null>}
 */
export async function findBestDocument(lookup, relativeTo, options = {}) {
  if (options.relativeOnly && !relativeTo?.previewed?.getContents) { return null; }
  if (!lookup) { return null; }
  const doc = await fromIdentifier(lookup, { relativeOnly: Boolean(options.relativeOnly), relativeTo });
  if (doc) { return doc; }
  const children = (await relativeTo?.previewed?.getContents()) ?? [];
  return children.find(c => c.lookupKey === lookup) ?? null;
}

/**
 * Get a local document from its identifier.
 * @param {Identifier|TypedIdentifier} identifier
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} relativeTo - The document to compare against.
 * @returns {Promise<TeriockActiveEffect|TeriockActor|TeriockItem|null>}
 */
export async function fromIdentifierLocal(identifier, relativeTo) {
  if (!relativeTo?.previewed?.getContents) { return null; }
  if (!identifier) { return null; }
  const children = await relativeTo.previewed.getContents();
  return children.find(c => c?.typedIdentifier === identifier || c?.system?.identifier === identifier) ?? null;
}

/**
 * Effective children of a document for which the qualifier formula's minimum
 * value is truthy against each child's local roll data.
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} document
 * @param {Teriock.System.FormulaString} qualifier
 * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
 */
export async function fromQualifier(document, qualifier) {
  if (!document?.previewed?.getContents || !teriock.data.fields.FormulaField.exists(qualifier)) { return []; }
  const children = await document.previewed.getContents();
  const matched = [];
  for (const child of children) {
    const rollData = child.system?.getLocalRollData?.();
    if (rollData === undefined) { continue; }
    const value = teriock.dice.rolls.BaseRoll.minValue(qualifier, rollData, {});
    if (value) { matched.push(child); }
  }
  return matched;
}

/**
 * Get a world document from its identifier.
 * @param {TypedIdentifier} identifier
 * @param {Teriock.System.SyncFetchOptions} [options]
 * @returns {TeriockActiveEffect|TeriockActor|TeriockItem|null}
 */
export function fromIdentifierSync(identifier, options = {}) {
  if (!identifier) { return null; }
  return game.teriock.identifiers.fromIdentifierSync(identifier, options);
}

/**
 * Get a document from its identifier. Prefers compendium documents over world documents.
 * @param {TypedIdentifier} identifier
 * @param {Teriock.System.FetchOptions} [options]
 * @returns {Promise<TeriockDocument|null>}
 */
export async function fromIdentifier(identifier, options = {}) {
  if (!identifier) { return null; }
  if (options.relativeOnly && !options.relativeTo) { return null; }
  if (options.relativeTo) {
    const doc = await fromIdentifierLocal(identifier, options.relativeTo);
    if (doc) { return doc; }
    if (options.relativeOnly) { return null; }
  }
  return game.teriock.identifiers.fromIdentifier(identifier);
}

/**
 * Get a document from some key that specifies it. This could be either a typed identifier or a UUID.
 * @param {TypedIdentifier|UUID} uuidOrIdentifier
 * @param {Teriock.System.FetchOptions} options
 * @returns {Promise<TeriockDocument|null>}
 */
export async function fromKey(uuidOrIdentifier, options = {}) {
  if (uuidOrIdentifier.includes(":") && !uuidOrIdentifier.includes(".")) {
    return fromIdentifier(uuidOrIdentifier, options);
  }
  return fromUuid(uuidOrIdentifier, options);
}

/**
 * Synchronously get a document from some key that specifies it. This could be either a typed identifier or a UUID.
 * @param {TypedIdentifier|UUID} uuidOrIdentifier
 * @param {Teriock.System.FetchOptions} options
 * @returns {TeriockDocument|null}
 */
export function fromKeySync(uuidOrIdentifier, options = {}) {
  if (uuidOrIdentifier.includes(":") && !uuidOrIdentifier.includes(".")) {
    return fromIdentifierSync(uuidOrIdentifier, options);
  }
  return fromUuidSync(uuidOrIdentifier, options);
}
