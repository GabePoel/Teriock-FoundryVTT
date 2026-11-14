/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * Resolve anything (UUID, identifier, compendium index, or Document) that represents a Document to an actual Document.
 * @template T
 * @param {Teriock.Hierarchy.Index<T> | UUID<T> | TypedIdentifier} syncDoc
 * @returns {Promise<T|null>}
 */
export async function resolveDocument(syncDoc) {
  if (!syncDoc) { return null; }
  if (typeof syncDoc === "string") { return fromKey(syncDoc); }
  if (syncDoc instanceof foundry.abstract.Document) { return syncDoc; }
  return foundry.utils.fromUuid(syncDoc.uuid);
}

/**
 * Ensure all documents in an array are not indexes.
 * @template T
 * @param {Teriock.Hierarchy.Index<T>[] | UUID<T> | TypedIdentifier} syncDocs
 * @param {Teriock.System.ResolveDocumentsOptions} [options]
 * @returns {Promise<T[]>}
 */
export async function resolveDocuments(syncDocs, options = {}) {
  let out = await Promise.all(syncDocs.map(syncDoc => resolveDocument(syncDoc)));
  for (const [name, expand] of [["Folder", options.expandFolders], ["RollTable", options.expandTables]]) {
    const matches = out.filter(d => d?.documentName === name);
    out = out.filter(d => d?.documentName !== name);
    out.push(...(expand ? (await Promise.all(matches.map(d => d.getAllContents()))).flat() : matches));
  }
  return out.filter(Boolean);
}

/**
 * Parse an identifier into its component parts.
 * @param {Identifier} identifier
 * @returns {Teriock.System.ResolvedIdentifier}
 */
export function parseIdentifier(identifier) {
  const [type, ident] = identifier?.includes(":") ? identifier.split(":") : [null, identifier];
  return { identifier: ident, type };
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
 * Find the best document from a string that describes it. The preference goes identifiers then lookup keys then names.
 * @param {TypedIdentifier|Identifier|string} lookup
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} [relativeTo]
 * @returns {Promise<TeriockDocument|null>}
 */
export async function findBestDocument(lookup, relativeTo) {
  if (!lookup) { return null; }
  const doc = await fromIdentifier(lookup, { relativeTo });
  if (doc) { return doc; }
  const children = (await relativeTo?.previewed?.getContents()) ?? [];
  return children.find(c => c.lookupKey === lookup) ?? children.find(c => c.name === lookup) ?? null;
}

/**
 * Get a local document from its identifier.
 * @param {Identifier|TypedIdentifier} identifier
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} relativeTo - The document to compare against.
 * @returns {Promise<TeriockActiveEffect|TeriockActor|TeriockItem|null>}
 */
export async function fromIdentifierLocal(identifier, relativeTo) {
  if (!identifier || !relativeTo?.previewed?.getContents) { return null; }
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
  return (await document.previewed.getContents()).filter(c => {
    const rollData = c.system?.getLocalRollData?.();
    return rollData && teriock.dice.rolls.BaseRoll.qualify(qualifier, rollData);
  });
}

/**
 * Get a world document from its identifier.
 * @param {TypedIdentifier} identifier
 * @param {Teriock.System.SyncFetchOptions} [options]
 * @returns {TeriockActiveEffect|TeriockActor|TeriockItem|null}
 */
export function fromIdentifierSync(identifier, options = {}) {
  return foundry.utils.fromUuidSync(game.teriock.identifiers.get(identifier), options);
}

/**
 * Get a document from its identifier.
 * @param {TypedIdentifier} identifier
 * @param {Teriock.System.FetchOptions} [options]
 * @returns {Promise<TeriockDocument|null>}
 */
export async function fromIdentifier(identifier, options = {}) {
  const { relativeOnly, relativeTo, ...fetchOptions } = options;
  if (relativeTo) {
    const doc = await fromIdentifierLocal(identifier, relativeTo);
    if (doc || relativeOnly) { return doc; }
  } else if (relativeOnly) { return null; }
  return foundry.utils.fromUuid(game.teriock.identifiers.get(identifier), fetchOptions);
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
