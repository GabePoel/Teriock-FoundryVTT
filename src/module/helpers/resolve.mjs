/**
 * Ensure a document is not an index.
 * @template T
 * @param {Teriock.Hierarchy.Index<T> | UUID<T> | TypedIdentifier} syncDoc
 * @returns {Promise<T|null>}
 */
export async function resolveDocument(syncDoc) {
  let out = null;
  if (!syncDoc) { return out; }
  if (typeof syncDoc === "string") { out = await teriock.helpers.utils.fromKey(syncDoc); }
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
 * Ensure a document has all the predefined documents named.
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} document
 * @param {TypedIdentifier[]} identifiers
 * @returns {Promise<(TeriockActiveEffect|TeriockItem)[]>}
 */
export async function ensureChildren(document, identifiers) {
  if (identifiers.length === 0) { return []; }
  const existing = document.children.identifiers;
  const candidates = await Promise.all(identifiers.map(async identifier => {
    if (!(teriock.data.fields.tools.validators.validateTypedIdentifier(identifier, { strict: true }))) { return; }
    if (existing?.has(identifier)) { return; }
    const doc = await teriock.helpers.utils.fromIdentifier(identifier);
    if (!doc) { return; }
    const obj = doc.toObject(true);
    foundry.utils.setProperty(obj, "_stats.compendiumSource", doc.uuid);
    return { data: obj, documentName: doc.documentName };
  }));
  const filtered = candidates.filter(Boolean);
  const documentNames = new Set(Object.values(filtered).map(v => v?.documentName));
  const operations = [];
  for (const documentName of documentNames) {
    const data = filtered.filter(d => d?.documentName === documentName).map(d => d?.data);
    operations.push(document.getCreateChildDocumentsOperation(documentName, data));
  }
  const childArrays = await foundry.documents.modifyBatch(operations.filter(Boolean));
  const children = [];
  for (const childArray of childArrays) { children.push(...childArray.filter(Boolean)); }
  return children;
}

/**
 * Ensure a document has none of the predefined documents named.
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} document
 * @param {TypedIdentifier[]} identifiers
 * @returns {Promise<(TeriockActiveEffect|TeriockItem)[]>}
 */
export async function ensureNoChildren(document, identifiers) {
  if (identifiers.length === 0) { return []; }
  const toDelete = (await document.children.getContents()).filter(c => identifiers.includes(c.typedIdentifier));
  if (toDelete.length === 0) { return []; }
  const documentNames = new Set(toDelete.map(c => c?.documentName));
  const operations = [];
  for (const documentName of documentNames) {
    const ids = toDelete.filter(c => c?.documentName === documentName).map(c => c.id);
    operations.push(document.getDeleteChildDocumentsOperation(documentName, ids));
  }
  const deletedArrays = await foundry.documents.modifyBatch(operations.filter(Boolean));
  const deletedDocs = [];
  for (const deletedArray of deletedArrays) { deletedDocs.push(...deletedArray.filter(Boolean)); }
  return deletedDocs;
}

/**
 * Infer the `documentName` for a common document from its UUID or creation data.
 * @param {object|UUID} data
 * @returns {"ActiveEffect" | "Item" | null}
 */
function inferChildDocumentName(data) {
  if (typeof data === "string") { return foundry.utils.parseUuid(data)?.type || null; }
  if (ActiveEffect.implementation.TYPES.includes(data?.type)) { return "ActiveEffect"; }
  if (Item.implementation.TYPES.includes(data?.type)) { return "Item"; }
  return null;
}

/**
 * Expand document data arrays recursively.
 * @param {object[]} [data]
 * @param {string|null} [sup=null]
 * @param {object} [operation={}]
 * @param {object} [options={}]
 * @returns {object[]}
 */
export function expandDocumentDataArray(data = [], sup = null, operation = {}, options = {}) {
  operation.knownSubs ??= new Set();
  const expandedData = [];

  for (const d of data) {
    if (!d || typeof d !== "object") { continue; }
    const masterDocumentName = inferChildDocumentName(d);

    // Expand children array and sort them into their collections.
    // TODO: Do something about `type="base"` type collisions. This is only gonna be a problem with modules though.
    if (Array.isArray(d.children) && d.children.length) {
      const childrenByDocumentName = {};
      for (const c of d.children) {
        const childDocumentName = inferChildDocumentName(c);
        if (childDocumentName) {
          childrenByDocumentName[childDocumentName] ??= [];
          childrenByDocumentName[childDocumentName].push(c);
        }
      }

      // Special handling by master document name.
      if (masterDocumentName === "ActiveEffect") {
        d.dependents ??= [];
        d.dependents.push(...(childrenByDocumentName.Item ?? []));
      } else if (masterDocumentName === "Item") {
        d.effects ??= [];
        d.effects.push(...(childrenByDocumentName.ActiveEffect ?? []));
      }

      if (masterDocumentName) {
        d.subs ??= [];
        d.subs.push(...(childrenByDocumentName[masterDocumentName] ?? []));
      }
      delete d.children;
    }

    // Assign sup id.
    const newId = (operation.keepId || options.keepId) && !sup && d._id ? d._id : foundry.utils.randomID();
    if (sup && operation?.keepSubIds !== false) { foundry.utils.setProperty(d, "_id", newId); }
    if (!sup && operation?.keepId !== false) { foundry.utils.setProperty(d, "_id", newId); }
    if (options.inplace) { foundry.utils.setProperty(d, "_id", newId); }
    if (sup) {
      foundry.utils.mergeObject(d, { "flags._teriock.keep": true, "flags._teriock.sup": sup, "system._sup": _del }, {
        applyOperators: true,
        inplace: true,
      });
      if (options.inplace) { foundry.utils.setProperty(d, "system._sup", sup); }
      if (!operation?.allowDuplicateSubs && foundry.utils.getProperty(d, "flags._teriock.ref")) {
        operation.knownSubs.add(foundry.utils.getProperty(d, "flags._teriock.ref"));
      }
    }
    foundry.utils.setProperty(d, "flags._teriock.id", newId);

    // Expand embedded effects array.
    if (masterDocumentName === "Item" && Array.isArray(d.effects) && d.effects.length) {
      d.effects = expandDocumentDataArray(d.effects, null, {
        keepSubIds: operation.keepId,
        knownSubs: operation.knownSubs,
      }, { inplace: true, keepId: operation.keepEmbeddedIds ?? true });
    }

    // Migrate the dependents array to flags.
    foundry.utils.setProperty(d, "flags._teriock.dependents", d.dependents ?? []);
    delete d.dependents;

    // Expand the sub array.
    const expandedSubs = expandDocumentDataArray(d.subs ?? [], newId, operation, options);
    delete d.subs;

    expandedData.push(d, ...expandedSubs);
  }

  return expandedData;
}
