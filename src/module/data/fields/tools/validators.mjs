import { isKebabCase } from "../../../helpers/string.mjs";

/**
 * Validates that a string is a valid untyped identifier.
 * @param {string} identifier
 * @param {object} [options]
 * @param {boolean} [options.strict=false] - Nullish values are rejected.
 */
export function validateIdentifier(identifier, options = {}) {
  if (["", null, undefined].includes(identifier)) { return !options.strict; }
  if (typeof identifier !== "string") { return false; }
  if (identifier.includes(":")) { return false; }
  return isKebabCase(identifier);
}

/**
 * Validates that a string is a typed identifier in the form `type:identifier`.
 * @param {string} identifier
 * @param {object} [options]
 * @param {string[]} [options.types] - Allowed document type prefixes. When omitted, any type is accepted.
 * @param {boolean} [options.strict=false] - Identifier must be fully formatted. Nullish values are rejected.
 */
export function validateTypedIdentifier(identifier, options = {}) {
  if (["", null, undefined].includes(identifier)) { return !options.strict; }
  if (typeof identifier !== "string") { return false; }
  const parts = identifier.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) { return false; }
  const [type, id] = parts;
  if (options.types?.length && !options.types.includes(type)) { return false; }
  return isKebabCase(type) && isKebabCase(id);
}
