import { isKebabCase } from "../../../helpers/string.mjs";

/**
 * Validates that a string is a valid identifier.
 * @param {string} identifier
 * @param {object} [options]
 * @param {boolean} [options.allowType]
 */
export function identifierValidator(identifier, options = {}) {
  if (options.allowType) {
    const split = identifier.split(":");
    if (split.length > 2) return false;
    identifier = split[1];
  }
  return isKebabCase(identifier);
}
