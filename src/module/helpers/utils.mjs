import { default as thumbnails } from "../../assets/thumbnails/manifest.json" with { type: "json" };
import { default as index } from "../../json/wiki-index.json" with { type: "json" };
import { choicesWithNone, localizeChoices } from "./localization.mjs";
import { toCamelCase } from "./string.mjs";

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

/**
 * Make fields fancy.
 * @param {Teriock.Display.DisplayField[]} displayFields
 * @returns {Teriock.Display.FancyDisplayField[]}
 */
export function fancifyFields(displayFields) {
  return displayFields.map(f => {
    let fancy;
    if (typeof f === "string") { fancy = { path: f }; }
    else { fancy = f; }
    const {
      button,
      choices,
      classes = [],
      dataset = {},
      editable = true,
      gmOnly = false,
      label = "",
      path = fancy.path,
      value,
      visible = true,
    } = fancy;
    return { button, choices, classes, dataset, editable, gmOnly, label, path, value, visible };
  }).filter(f => f.visible);
}

/**
 * Iterate through an array with a progress bar using batched processing.
 * @param {Array} arr
 * @param {string} message
 * @param {function} callback
 * @param {object} [options]
 * @param {number} [options.batch=1]
 * @param {"info"|"success"|"warn"|"error"} [options.style="info"]
 */
export async function progressBar(arr, message, callback, options = {}) {
  const { batch = 1, style = "info" } = options;
  const count = arr.length;
  const progress = ui.notifications[style](message, { pct: 0, progress: true });
  for (let i = 0; i < count; i += batch) {
    const chunk = arr.slice(i, i + batch);
    await Promise.all(chunk.map(item => callback(item)));
    ui.notifications.update(progress, { pct: Math.min((i + batch) / count, 1) });
  }
}

/**
 * Prefix all keys in some object.
 * @param {object} obj
 * @param {string} prefix
 * @returns {object}
 */
export function prefixObject(obj, prefix) {
  return Object.fromEntries(
    Object.entries(foundry.utils.flattenObject(obj)).map(([k, v]) => [k.length > 0 ? `${prefix}.${k}` : prefix, v]),
  );
}

/**
 * Map the values of an object.
 * @template V1 - Initial values.
 * @template V2 - Final values.
 * @param {Record<string, V1>} obj
 * @param {(V1) => V2} [transformValue]
 * @param {object} [options]
 * @param {(V1) => boolean} [options.filter] - Filter values before transformation.
 * @param {boolean} [options.kebabify=false] - Make the keys kebab-case.
 * @param {boolean} [options.localize=false] - The output can only be localized if the output is a string.
 * @param {boolean} [options.none=false] - Prepend a blank "None" choice.
 * @returns {Record<string, V2>}
 */
export function objectMap(obj, transformValue = (v) => v, options = {}) {
  const { filter = () => true, kebabify = false, localize = false, none = false } = options;
  const transformKey = kebabify ? (k) => teriock.helpers.string.toKebabCase(k) : (k) => k;
  const out = Object.fromEntries(
    Object.entries(obj).filter(([_k, v]) => filter(v)).map(([k, v]) => [transformKey(k), transformValue(v, k)]),
  );
  if (localize) { return localizeChoices(out, { none }); }
  return none ? choicesWithNone(out) : out;
}

/**
 * Pre-process grouped choices into something that {@link SelectInputConfig} can read.
 * @param {Teriock.Fields.DynamicChoices|Teriock.Fields.DynamicChoices[]} choices
 * @param {object} [options]
 * @param {boolean} [options.localize]
 * @param {boolean} [options.none] - Prepend a blank "None" choice.
 * @returns {Record<string, FormSelectOption>}
 */
export function formatDynamicSelectOptions(choices = {}, options = {}) {
  const out = {};
  const choiceArray = [];
  if (Array.isArray(choices)) { choiceArray.push(...choices); }
  else {
    for (const group of Object.values(choices)) {
      const groupLabel = options.localize ? _loc(group.label) : group.label;
      for (const [choiceValue, choiceLabel] of Object.entries(group.choices)) {
        choiceArray.push({
          group: groupLabel,
          label: options.localize ? _loc(choiceLabel) : choiceLabel,
          value: choiceValue,
        });
      }
    }
  }
  for (const choice of choiceArray) {
    out[choice.value] = choice;
    delete out[choice.value].value;
  }
  return options.none ? teriock.helpers.localization.choicesWithNone(out) : out;
}

/**
 * Helper function to ensure a value with a min and max is allowed.
 * @param {Teriock.Fields.BarField} bar
 * @param {number} change
 * @returns {number}
 */
export function barClamp(bar, change) {
  return Math.clamp(bar.value + change, bar.min, bar.max);
}

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
    if (document) {
      Object.assign(operation, {
        documentName: document.documentName,
        ids: [document.id],
        pack: document.pack,
        parent: document.parent,
      });
    }
    delete operation.uuid;
  }
  return operation;
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
    const opMini = { ...op };
    for (const exclusion of exclusions) { delete opMini[exclusion]; }
    const comOp = consolidated.find(co => {
      const coMini = { ...co };
      for (const exclusion of exclusions) { delete coMini[exclusion]; }
      return foundry.utils.equals(opMini, coMini);
    });
    if (comOp) {
      comOp.ids = [...(comOp.ids ?? []), ...(op?.ids ?? [])];
      comOp.data = [...(comOp.data ?? []), ...(op?.data ?? [])];
      comOp.updates = [...(comOp.updates ?? []), ...(op?.updates ?? [])];
      comOp.replacements = Object.assign(comOp.replacements ?? {}, op?.replacements ?? {});
    } else {
      consolidated.push(op);
    }
  }
  return consolidated;
}

/**
 * Infer a document's icon from an identifier.
 * @param {TypedIdentifier|Identifier} identifier
 * @returns {string}
 */
export function getIcon(identifier) {
  let icon = TERIOCK.config.document.document.icon;
  const parsed = parseIdentifier(identifier);
  if (parsed?.type) { icon = TERIOCK.config.document[parsed.type]?.icon ?? icon; }
  return icon;
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
  const children = await relativeTo.previewed.getContents();
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
  if (!document?.previewed?.getContents || !teriock.helpers.formula.formulaExists(qualifier)) { return []; }
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

/**
 * Construct an object from another object with certain keys removed. Only works for plain objects.
 * @template T
 * @template {keyof T} K
 * @param {T} obj
 * @param {K[]} keys
 * @returns {Omit<T, K>}
 */
export function omit(obj, keys) {
  const out = { ...obj };
  for (const k of keys) { delete out[k]; }
  return out;
}

/**
 * A helper function to delete multiple properties.
 * @param {object} object - The object to traverse
 * @param {...string} keys - Property paths using dot notation (e.g., 'a.b.c')
 * @returns {boolean} Were all the properties deleted?
 */
export function deleteProperties(object, ...keys) {
  let allDeleted = true;
  for (const key of keys) {
    const success = foundry.utils.deleteProperty(object, key);
    if (!success) { allDeleted = false; }
  }
  return allDeleted;
}

/**
 * Build a simple config from the wiki index.
 * @param {string} indexKey
 * @param {string} localizationPrefix
 * @returns {Record<string, Teriock.Config.SimpleEntry>}
 */
export function wikiIndexToConfig(indexKey, localizationPrefix) {
  return Object.fromEntries(
    Object.keys(index[indexKey]).map(k => {
      const entry = { label: `${localizationPrefix}.${toCamelCase(k)}` };
      const img = thumbnails[indexKey]?.[toCamelCase(k)];
      if (img) { entry.img = img; }
      return [k, entry];
    }),
  );
}
