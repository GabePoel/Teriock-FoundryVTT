import { isKebabCase } from "../../../helpers/string.mjs";

/**
 * Validate the type from the provided UUID.
 * @param {UUID<CommonDocument>} uuid
 * @param {Teriock.Documents.CommonType[]} types
 * @returns {boolean}
 */
export function typeValidator(uuid, types = []) {
  const item = fromUuidSync(uuid);
  if (item) {
    return types.includes(item.type);
  }
}

/**
 * Validates the types from the provided array of UUIDS.
 * @param {UUID<CommonDocument>[]} uuids
 * @param {Teriock.Documents.CommonType[]} types
 * @returns {boolean}
 */
export function arrayTypeValidator(uuids, types = []) {
  let valid = true;
  for (const uuid of uuids) {
    valid = valid && typeValidator(uuid, types);
  }
  return valid;
}

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
