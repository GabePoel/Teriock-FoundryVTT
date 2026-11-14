import { fromIdentifier } from "./document.mjs";
import { omit } from "./object.mjs";

/**
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

/**
 * Builds a single document write operation given its UUID and some document data. Best for simplifying create and
 * delete operation construction.
 * @param {DatabaseWriteOperation & { uuid?: UUID<TeriockDocument>, docData?: object}} operation
 * @returns {Promise<DatabaseWriteOperation | null>}
 */
export async function buildWriteOperation(operation) {
  if (operation.uuid && ["delete", "update"].includes(operation.action)) {
    const document = await foundry.utils.fromUuid(operation.uuid);
    if (!document) { return null; }
    if (operation.docData) {
      if (operation.action === "update") { operation.updates = [{ ...operation.docData, _id: document.id }]; }
      delete operation.docData;
    }
    Object.assign(operation, {
      documentName: document.documentName,
      ids: [document.id],
      pack: document.pack,
      parent: document.parent,
    });
    delete operation.uuid;
  }
  return operation;
}

/**
 * Merge updates that target the same document.
 * @param {object[]} updates
 * @returns {object[]}
 */
function mergeUpdates(updates) {
  const merged = {};
  for (const update of updates) { merged[update._id] = foundry.utils.mergeObject(merged[update._id] ?? {}, update); }
  return Object.values(merged);
}

/**
 * Consolidate operations so that they are more easily batched.
 * @param {DatabaseWriteOperation[]} operations
 * @returns {DatabaseWriteOperation[]}
 */
export function consolidateWriteOperations(operations) {
  const exclusions = ["ids", "_id", "replacements", "data", "updates"];
  /** @type {DatabaseWriteOperation[]} */
  const consolidated = [];
  for (const op of operations.filter(Boolean)) {
    const opMini = omit(op, exclusions);
    const comOp = consolidated.find(co => foundry.utils.equals(opMini, omit(co, exclusions)));
    if (comOp) {
      comOp.ids = [...(comOp.ids ?? []), ...(op.ids ?? [])];
      comOp.data = [...(comOp.data ?? []), ...(op.data ?? [])];
      comOp.updates = mergeUpdates([...(comOp.updates ?? []), ...(op.updates ?? [])]);
      comOp.replacements = Object.assign(comOp.replacements ?? {}, op.replacements ?? {});
    } else {
      consolidated.push(op);
    }
  }
  return consolidated;
}

/**
 * Build, consolidate, and write a bunch of batched operations.
 * @param {(DatabaseWriteOperation & { uuid?: UUID<TeriockDocument>, docData?: object })[]} operations
 * @param {object} [options]
 * @param {boolean} [options.asGM] - Have the GM make the changes.
 * @returns {Promise<void>}
 */
export async function batchWrite(operations, { asGM = false } = {}) {
  const built = await Promise.all(operations.map(op => buildWriteOperation(op)));
  const consolidated = consolidateWriteOperations(built);
  if (!consolidated.length) { return; }
  if (asGM && !game.user.isGM) {
    const relayed = consolidated.map(({ parent, ...op }) => (parent ? { ...op, parentUuid: parent.uuid } : op));
    await game.users.queryGM("teriock.modifyBatch", { operations: relayed }, {
      timeout: TERIOCK.CONST.WRITE_OPERATION_TIMEOUT,
    });
  } else { await foundry.documents.modifyBatch(consolidated); }
}

/**
 * Get the operations that ensure a document has all the predefined documents named.
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} document
 * @param {TypedIdentifier[]} identifiers
 * @returns {Promise<DatabaseWriteOperation[]>}
 */
export async function getEnsureChildrenOperations(document, identifiers) {
  if (identifiers.length === 0) { return []; }
  const existing = document.children.identifiers;
  const candidates = await Promise.all(identifiers.map(async identifier => {
    if (!(teriock.data.fields.tools.validators.validateTypedIdentifier(identifier, { strict: true }))) { return; }
    if (existing?.has(identifier)) { return; }
    const doc = await fromIdentifier(identifier);
    if (!doc) { return; }
    const obj = doc.toObject(true);
    foundry.utils.setProperty(obj, "_stats.compendiumSource", doc.uuid);
    return { data: obj, documentName: doc.documentName };
  }));
  return [...Map.groupBy(candidates.filter(Boolean), c => c.documentName)].map(([documentName, group]) =>
    document.getCreateChildDocumentsOperation(documentName, group.map(c => c.data))
  ).filter(Boolean);
}

/**
 * Get the operations that ensure a document has none of the predefined documents named.
 * @param {TeriockActiveEffect|TeriockActor|TeriockItem} document
 * @param {TypedIdentifier[]} identifiers
 * @returns {Promise<DatabaseWriteOperation[]>}
 */
export async function getEnsureNoChildrenOperations(document, identifiers) {
  if (identifiers.length === 0) { return []; }
  const toDelete = (await document.children.getContents()).filter(c => identifiers.includes(c.typedIdentifier));
  return [...Map.groupBy(toDelete, c => c.documentName)].map(([documentName, group]) =>
    document.getDeleteChildDocumentsOperation(documentName, group.map(c => c.id))
  ).filter(Boolean);
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
 * @param {(object|UUID)[]} [data]
 * @param {string|null} [supId=null] ID of the sup that `data` are subs of.
 * @param {object} [operation]
 * @param {boolean} [operation.keepId] Top-level documents keep their `_id`.
 * @param {boolean} [operation.keepSubIds] Subs keep their `_id`. Defaults to `operation.keepId` and only applies when
 *   top-level documents keep theirs too.
 * @param {object} [options={}]
 * @param {boolean} [options.inplace] Write `system._sup` directly instead of deferring to `_preCreateOperation`.
 * @param {boolean} [options.keepId] Top-level documents keep their `_id`. Used for embedded arrays.
 * @returns {Promise<object[]>}
 * @category Hierarchy
 * @category Dependents
 */
export async function expandDocumentDataArray(data = [], supId = null, operation = {}, options = {}) {
  operation.knownSubs ??= new Set();
  const resolvedData = await Promise.all(
    data.map(async d => (typeof d === "string" ? (await foundry.utils.fromUuid(d))?.toObject() : d)),
  );

  const expandedData = await Promise.all(resolvedData.map(async d => {
    if (!d || typeof d !== "object") { return []; }
    const masterDocumentName = inferChildDocumentName(d);

    // Expand children array and sort them into their collections.
    // TODO: Do something about `type="base"` type collisions. This is only gonna be a problem with modules though.
    if (Array.isArray(d.children) && d.children.length) {
      const childrenByDocumentName = Object.groupBy(d.children, c => inferChildDocumentName(c));

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

    // Assign the ID. Subs follow `keepSubIds` (defaulting to `keepId`), but never keep theirs when the top level isn't,
    // since that would steal them from whatever sup already owns them.
    const keepTopId = operation.keepId || options.keepId;
    const keepId = supId ? keepTopId && (operation.keepSubIds ?? operation.keepId) : keepTopId;
    const newId = keepId && d._id ? d._id : foundry.utils.randomID();
    foundry.utils.setProperty(d, "_id", newId);
    if (supId) {
      foundry.utils.mergeObject(d, { "flags._teriock.keep": true, "flags._teriock.sup": supId, "system._sup": _del }, {
        applyOperators: true,
        inplace: true,
      });
      if (options.inplace) { foundry.utils.setProperty(d, "system._sup", supId); }
      if (!operation?.allowDuplicateSubs && foundry.utils.getProperty(d, "flags._teriock.ref")) {
        operation.knownSubs.add(foundry.utils.getProperty(d, "flags._teriock.ref"));
      }
    }
    foundry.utils.setProperty(d, "flags._teriock.id", newId);

    // Expand embedded effects array.
    if (masterDocumentName === "Item" && Array.isArray(d.effects) && d.effects.length) {
      d.effects = await expandDocumentDataArray(d.effects, null, {
        keepSubIds: operation.keepSubIds ?? operation.keepId,
        knownSubs: operation.knownSubs,
      }, { inplace: true, keepId: operation.keepEmbeddedIds ?? true });
    }

    // Migrate the dependents array to flags.
    foundry.utils.setProperty(d, "flags._teriock.dependents", d.dependents ?? []);
    delete d.dependents;

    // Expand the sub array.
    const expandedSubs = await expandDocumentDataArray(d.subs ?? [], newId, operation, options);
    delete d.subs;

    return [d, ...expandedSubs];
  }));

  return expandedData.flat();
}
