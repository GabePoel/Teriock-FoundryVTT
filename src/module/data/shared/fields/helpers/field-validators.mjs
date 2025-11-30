/**
 * Validate the type from the provided UUID.
 * @param {UUID<TeriockCommon>} uuid
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
 * @param {UUID<TeriockCommon>[]} uuids
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
