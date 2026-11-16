import { isSlug } from "../../../utils/_module.mjs";

/**
 * Validates that a string is a valid slug.
 * @param {string} slug
 * @param {object} [options]
 * @param {boolean} [options.strict=false] - Nullish values are rejected.
 */
export function validateSlug(slug, options = {}) {
  if (["", null, undefined].includes(slug)) { return !options.strict; }
  if (typeof slug !== "string") { return false; }
  return isSlug(slug);
}

/**
 * Validates that a string is an identifier in the form `type:slug`.
 * @param {string} identifier
 * @param {object} [options]
 * @param {string[]} [options.types] - Allowed document type prefixes. When omitted, any type is accepted.
 * @param {boolean} [options.strict=false] - Identifier must be fully formatted. Nullish values are rejected.
 */
export function validateIdentifier(identifier, options = {}) {
  if (["", null, undefined].includes(identifier)) { return !options.strict; }
  if (typeof identifier !== "string") { return false; }
  const parts = identifier.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) { return false; }
  const [type, id] = parts;
  if (options.types?.length && !options.types.includes(type)) { return false; }
  return isSlug(type) && isSlug(id);
}

/**
 * Validate that a number is not zero.
 * @param {number} value
 * @returns {boolean}
 */
export function validateNonZero(value) {
  return value !== 0;
}
