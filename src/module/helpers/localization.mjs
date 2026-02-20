import { sortObject } from "./utils.mjs";

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
