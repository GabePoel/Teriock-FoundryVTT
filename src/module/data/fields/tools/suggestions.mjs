/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

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
      for (const [id, name] of Object.entries(game.teriock.identifiers.getNames(type))) {
        resolved[typed ? `${type}:${id}` : id] = name;
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
