import { choicesWithNone, localizeChoices } from "../helpers/localization.mjs";

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
 * @param {boolean} [options.localize=false] - The output can only be localized if the output is a string.
 * @param {boolean} [options.none=false] - Prepend a blank "None" choice.
 * @param {boolean} [options.sort=true] - Sort localized output.
 * @returns {Record<string, V2>}
 */
export function objectMap(obj, transformValue = (v) => v, options = {}) {
  const { filter = () => true, localize = false, none = false, sort = true } = options;
  const out = Object.fromEntries(
    Object.entries(obj).filter(([_k, v]) => filter(v)).map(([k, v]) => [k, transformValue(v, k)]),
  );
  if (localize) { return localizeChoices(out, { none, sort }); }
  return none ? choicesWithNone(out) : out;
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
