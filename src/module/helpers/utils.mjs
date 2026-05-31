import { iconStyles } from "../constants/display/_module.mjs";
import { BaseRoll } from "../dice/rolls/_module.mjs";
import { formulaExists } from "./formula.mjs";
import { createElement } from "./html.mjs";
import { localizeChoices } from "./localization.mjs";

/**
 * Creates an HTML icon using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, ...styles) {
  const classString = makeIconClass(icon, ...styles);
  return `<i class="${classString}"></i>`;
}

/**
 * Creates an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {HTMLElement}
 */
export function makeIconElement(icon, ...styles) {
  return createElement("i", { className: makeIconClass(icon, ...styles) });
}

/**
 * Creates the class for an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIconClass(icon, ...styles) {
  if (!icon) { return ""; }
  const prefix = "fa-";
  let start = "fa-fw";
  const styleClasses = styles.map(s => iconStyles[s] || s).filter(s => typeof s === "string");
  if (icon.startsWith("ms-")) { start += " mic"; }
  if (icon.startsWith("mdi-")) {
    start += " mdi";
    if (styleClasses.includes("light") || styleClasses.includes("regular")) { icon = `${icon} ${icon}-outline`; }
  }
  const classString = styleClasses.map(s => `${prefix}${s}`).join(" ");
  return `${start} ${classString} ${icon}`;
}

/**
 * Determines the appropriate dice icon based on the roll formula.
 * @param {string} rollFormula - The dice roll formula to analyze.
 * @returns {string} The Font Awesome class for the appropriate dice icon.
 */
export function getRollIcon(rollFormula) {
  const polyhedralDice = [4, 6, 8, 10, 12, 20];
  const roll = new BaseRoll(rollFormula, {});
  const dice = roll.dice;
  dice.sort((a, b) => b.faces - a.faces);
  for (const die of dice) {
    if (polyhedralDice.includes(die.faces)) { return `fa-dice-d${die.faces}`; }
    else if (die.faces === 2) { return "fa-coins"; }
    else if (die.faces === 100) { return "fa-percent"; }
  }
  return "fa-dice";
}

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
      classes = "",
      dataset = {},
      editable = true,
      label = "",
      path = fancy.path,
      value,
      visible = true,
    } = fancy;
    return { button, choices, classes, dataset, editable, label, path, value, visible };
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
 * Sort an object by its keys.
 * @template T
 * @param {T} obj
 * @param {object} [options]
 * @param {boolean} [options.value]
 * @returns {T}
 */
export function sortObject(obj, options = {}) {
  const sortIndex = options.value ? 1 : 0;
  return Object.fromEntries(
    Object.entries(obj).sort((a, b) => {
      return a[sortIndex].toString().localeCompare(b[sortIndex].toString());
    }),
  );
}

/**
 * Map the values of an object.
 * @template T
 * @template U
 * @param {Record<string, T>} obj
 * @param {(T) => U} fn
 * @param {object} [options]
 * @param {(T) => boolean} [options.filter]
 * @param {boolean} [options.localize] - The output can only be localized if the output is a string.
 * @returns {Record<string, U>}
 */
export function objectMap(obj, fn, options = {}) {
  const { filter = () => true, localize = false } = options;
  const out = Object.fromEntries(Object.entries(obj).filter(([_k, v]) => filter(v)).map(([k, v]) => [k, fn(v)]));
  return localize ? localizeChoices(out) : out;
}

/**
 * Map the keys of an object to strings.
 * @param {Record<string, *>} obj
 * @param {(string) => string} fn
 * @param {object} [options]
 * @param {boolean} [options.localize] - Whether to localize the values of the returned object.
 * @returns {Record<string, string>}
 */
export function choiceMap(obj, fn, options = { localize: true }) {
  const out = Object.fromEntries(Object.keys(obj).map(k => [k, fn(k)]));
  if (options.localize) { return localizeChoices(out); }
  return out;
}

/**
 * Pre-process grouped choices into something that {@link SelectInputConfig} can read.
 * @param {Teriock.Fields.DynamicChoices|Teriock.Fields.DynamicChoices[]} choices
 * @param {object} [options]
 * @param {boolean} [options.localize]
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
  return out;
}

/**
 * Helper function to ensure a value with a min and max is allowed.
 * @param {Foundry.BarField} bar
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
 * @returns {DatabaseWriteOperation | null}
 */
export async function buildWriteOperation(operation) {
  if (operation.uuid && ["delete", "update"].includes(operation.action)) {
    const document = await foundry.utils.fromUuid(operation.uuid);
    if (!document) { return null; }
    if (operation.docData) {
      const data = [{ ...operation.docData, _id: document.id }];
      if (operation.action === "update") { operation.updates = data; }
      else if (operation.action === "create") { operation.data = data; }
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
  for (const op of operations) {
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
 * @param {AnyCommonDocument} relativeTo
 * @param {object} [options]
 * @param {boolean} [options.relativeOnly]
 * @returns {Promise<AnyCommonDocument|null>}
 */
export async function findBestDocument(lookup, relativeTo, options = {}) {
  if (options.relativeOnly && typeof relativeTo?.getEffectiveChildren !== "function") { return null; }
  if (!lookup) { return null; }
  const doc = await fromIdentifier(lookup, { relativeOnly: Boolean(options.relativeOnly), relativeTo });
  if (doc) { return doc; }
  const children = await relativeTo.getEffectiveChildren();
  return children.find(c => c.lookupKey === lookup) ?? null;
}

/**
 * Get a local document from its identifier.
 * @param {Identifier|TypedIdentifier} identifier
 * @param {AnyCommonDocument} relativeTo - The document to compare against.
 * @returns {Promise<AnyCommonDocument|null>}
 */
export async function fromIdentifierLocal(identifier, relativeTo) {
  if (typeof relativeTo?.getEffectiveChildren !== "function") { return null; }
  if (!identifier) { return null; }
  const children = await relativeTo.getEffectiveChildren();
  return children.find(c => c?.typedIdentifier === identifier || c?.system?.identifier === identifier) ?? null;
}

/**
 * Effective children of a document for which the qualifier formula's minimum
 * value is truthy against each child's local roll data.
 * @param {AnyCommonDocument} document
 * @param {Teriock.System.FormulaString} qualifier
 * @returns {Promise<AnyCommonDocument[]>}
 */
export async function fromQualifier(document, qualifier) {
  if (!document || !formulaExists(qualifier)) { return []; }
  if (typeof document.getEffectiveChildren !== "function") { return []; }
  const children = await document.getEffectiveChildren();
  const matched = [];
  for (const child of children) {
    const rollData = child.system?.getLocalRollData?.();
    if (rollData === undefined) { continue; }
    const value = BaseRoll.minValue(qualifier, rollData, {});
    if (value) { matched.push(child); }
  }
  return matched;
}

/**
 * Get a world document from its identifier.
 * @param {TypedIdentifier} identifier
 * @param {Teriock.System.SyncFetchOptions} [options]
 * @returns {AnyCommonDocument|null}
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
 * @returns {Promise<unknown>}
 */
export async function fromKey(uuidOrIdentifier, options = {}) {
  if (uuidOrIdentifier.includes(":") && !uuidOrIdentifier.includes(".")) {
    return fromIdentifier(uuidOrIdentifier, options);
  }
  return fromUuid(uuidOrIdentifier, options);
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
  for (const k of keys) { foundry.utils.deleteProperty(out, k); }
  return out;
}
