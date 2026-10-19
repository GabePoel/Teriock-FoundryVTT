/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/**
 * Create an element with pre-defined attributes. These can use the normal foundry "." notation.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tagName
 * @param {Partial<HTMLElementTagNameMap[K]> & object} [attributes]
 * @returns {HTMLElementTagNameMap[K]}
 */
export function createElement(tagName, attributes = {}) {
  const element = document.createElement(tagName);
  for (const [k, v] of Object.entries(foundry.utils.flattenObject(attributes))) {
    if (k.includes(".")) { foundry.utils.setProperty(element, k, v); }
    else { element[k] = v; }
  }
  return element;
}

/**
 * Join CSS classes into a className string.
 * @param {Iterable<string>|string|null|undefined} [classes]
 * @returns {string}
 */
export function toClass(classes) {
  if (classes == null || classes === "") { return ""; }
  if (typeof classes === "string") { return classes; }
  if (typeof classes?.[Symbol.iterator] === "function") { return Array.from(classes).filter(Boolean).join(" "); }
  return "";
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
 * Pre-process grouped choices into something that {@link SelectInputConfig} can read.
 * @param {Teriock.Fields.DynamicChoices} choices
 * @param {object} [options]
 * @param {boolean} [options.localize]
 * @param {boolean} [options.none] - Prepend a blank "None" choice.
 * @returns {Record<string, FormSelectOption>}
 */
export function formatDynamicSelectOptions(choices = {}, options = {}) {
  const out = {};
  for (const group of Object.values(choices)) {
    const groupLabel = options.localize ? _loc(group.label) : group.label;
    for (const [choiceValue, choiceLabel] of Object.entries(group.choices)) {
      out[choiceValue] = { group: groupLabel, label: options.localize ? _loc(choiceLabel) : choiceLabel };
    }
  }
  return options.none ? teriock.helpers.localization.choicesWithNone(out) : out;
}

/**
 * Iterate through an array with a progress bar using batched processing.
 * @param {Array} arr
 * @param {string} message
 * @param {function} callback
 * @param {object} [options]
 * @param {number} [options.batch=1]
 * @param {"info"|"success"|"warn"|"error"|"morganti"} [options.style="info"]
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
