import { objectMap } from "../../../helpers/utils.mjs";

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/** @type {Record<string, Record<Identifier, string>>} */
const CONFIG_SUGGESTIONS = {};

/**
 * Suggested identifiers and names for a category.
 * @param {string} category
 * @returns {Record<Identifier, string>}
 */
export function categorySuggestions(category) {
  const path = TERIOCK.config.category[category]?.suggestions;
  if (!path || path === "none") { return {}; }
  if (path === "registry") { return game.teriock.identifiers.getNames(category, { permission: "LIMITED" }); }
  CONFIG_SUGGESTIONS[path] ??= objectMap(foundry.utils.getProperty(TERIOCK, path) || {}, e => e.label);
  return CONFIG_SUGGESTIONS[path];
}

/**
 * Resolve a field's `suggestions` option into Autocomplete options.
 * @param {Teriock.Fields.IdentifierSuggestions|null} [suggestions]
 * @param {object} [options]
 * @param {string[]} [options.types] - Identifier types to pull registry names from when `suggestions` is `true`.
 * @param {boolean} [options.typed] - Whether to key registry names by typed identifier.
 * @returns {FormSelectOption[]|undefined}
 */
export function prepareSuggestions(suggestions, { typed = false, types = [] } = {}) {
  /** @type {Record<string, string>|string[]|null|undefined} */
  let resolved;
  if (suggestions === true) {
    resolved = {};
    for (const type of types) {
      for (
        const [identifier, name] of Object.entries(game.teriock.identifiers.getNames(type, { permission: "LIMITED" }))
      ) {
        resolved[typed ? `${type}:${identifier}` : identifier] = name;
      }
    }
  } else if (typeof suggestions === "function") { resolved = suggestions(); }
  else { resolved = suggestions; }
  let options;
  if (Array.isArray(resolved)) { options = resolved.map(value => ({ label: value, value })); }
  else if (resolved && typeof resolved === "object") {
    options = Object.entries(resolved).map(([value, label]) => ({ label, value }));
  }
  if (!options?.length) { return undefined; }
  return options.sort((a, b) => a.label.localeCompare(b.label));
}
