import { toCamelCase, toKebabCase } from "./string.mjs";
import { sortObject } from "./utils.mjs";

// Pre-localization code is blatantly stolen from D&D 5E and then brutally modified.

/**
 * @typedef {"lc"|"uc"|"cc"|"kc"} TransformKey
 */

/**
 * Localize an object.
 * @param {Record<string, string>} choices
 * @param {object} [options]
 * @param {boolean} [options.sort]
 * @returns {Record<string, string>}
 */
export function localizeChoices(choices, options = { sort: true }) {
  const out = Object.fromEntries(
    Object.entries(choices).map(([k, v]) => [k, game.i18n.localize(v)]),
  );
  if (options.sort) return sortObject(out, { value: true });
  return out;
}

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj - The object to sort.
 * @param {string|Function} [sortKey] - An inner key upon which to sort or sorting function.
 * @returns {object} - A copy of the original object that has been sorted.
 */
export function sortObjectEntries(obj, sortKey) {
  let sorted = Object.entries(obj);
  const sort = (lhs, rhs) =>
    foundry.utils.getType(lhs) === "string"
      ? lhs.localeCompare(rhs, game.i18n.lang)
      : lhs - rhs;
  if (foundry.utils.getType(sortKey) === "function")
    sorted = sorted.sort((lhs, rhs) => sortKey(lhs[1], rhs[1]));
  else if (sortKey)
    sorted = sorted.sort((lhs, rhs) => sort(lhs[1][sortKey], rhs[1][sortKey]));
  else sorted = sorted.sort((lhs, rhs) => sort(lhs[1], rhs[1]));
  return Object.fromEntries(sorted);
}

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKeyPath - Key path within `TERIOCK` to localize.
 * @param {object} [options={}]
 * @param {string} [options.key] - If each entry in the config enum is an object, localize and sort using this property.
 * @param {string[]} [options.keys=[]]- Array of localization keys. First key listed will be used for sorting if
 * multiple are provided.
 * @param {string} [options.prefix] - Add a prefix to the values being localized.
 * @param {string} [options.suffix] - Add a suffix to the values being localized.
 * @param {TransformKey} [options.transform] - Add a transformation to the value before localizing.
 * @param {boolean} [options.sort=false] - Sort this config enum, using the key if set.
 */
export function preLocalize(
  configKeyPath,
  { key, keys = [], sort = false, prefix = "", transform, suffix = "" } = {},
) {
  if (key) keys.unshift(key);
  _preLocalizationRegistrations[configKeyPath] = {
    keys,
    sort,
    prefix,
    suffix,
    transform,
  };
}

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config - The `TERIOCK` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
  for (const [keyPath, settings] of Object.entries(
    _preLocalizationRegistrations,
  )) {
    const target = foundry.utils.getProperty(config, keyPath);
    if (!target) continue;
    localizeObject(target, settings);
    if (settings.sort)
      foundry.utils.setProperty(
        config,
        keyPath,
        sortObjectEntries(target, settings.keys[0]),
      );
  }

  // Localize & sort status effects
  CONFIG.statusEffects.forEach((s) => (s.name = game.i18n.localize(s.name)));
  CONFIG.statusEffects.sort((lhs, rhs) =>
    lhs?.name.localeCompare(rhs?.name, game.i18n.lang),
  );
}

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj - The configuration object to localize.
 * @param {object} [options]
 * @param {string[]} [options.keys] - List of inner keys that should be localized if this is an object.
 * @param {string} [options.prefix] - An optional prefix to add to the value being localized.
 * @param {string} [options.suffix] - An optional suffix to add to the value being localized.
 * @param {TransformKey} [options.transform] - An optional transformation to make to the value before localizing.
 */
export function localizeObject(
  obj,
  { keys, prefix = "", transform, suffix = "" } = {},
) {
  for (const [k, v] of Object.entries(obj)) {
    const type = typeof v;
    if (type === "string") {
      obj[k] = game.i18n.localize(
        prefix + transformValue(v, transform) + suffix,
      );
      continue;
    }

    if (type !== "object") {
      console.error(
        new Error(
          `Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`,
        ),
      );
      continue;
    }
    if (!keys?.length) {
      console.error(
        new Error(
          "Localization keys must be provided for pre-localizing when target is an object.",
        ),
      );
      continue;
    }

    for (const key of keys) {
      const value = foundry.utils.getProperty(v, key);
      if (!value) continue;
      foundry.utils.setProperty(
        v,
        key,
        game.i18n.localize(prefix + transformValue(value, transform) + suffix),
      );
    }
  }
}

/**
 * @param {string} value
 * @param {"lc"|"uc"|"cc"|"kc"} [transform]
 * @returns {string}
 */
function transformValue(value, transform) {
  if (transform === "lc") return value.toLowerCase();
  if (transform === "uc") return value.toUpperCase();
  if (transform === "cc") return toCamelCase(value);
  if (transform === "kc") return toKebabCase(value);
  return value;
}
