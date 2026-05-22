import { isKebabCase } from "../../../helpers/string.mjs";

/**
 * Validates that a string is a valid untyped identifier.
 * @param {string} identifier
 */
export function identifierValidator(identifier) {
  if (identifier == null || identifier === "") return true;
  if (identifier.includes(":")) return false;
  return isKebabCase(identifier);
}

/**
 * Validates that a string is a typed identifier in the form `type:identifier`.
 * @param {string} identifier
 * @param {string[]} [types] Allowed document type prefixes. When omitted, any type is accepted.
 */
export function typedIdentifierValidator(identifier, types) {
  if (identifier == null || identifier === "") return true;
  const parts = identifier.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [type, id] = parts;
  if (types?.length && !types.includes(type)) return false;
  return isKebabCase(type) && isKebabCase(id);
}
