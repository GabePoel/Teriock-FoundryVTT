/**
 * Validate the type from the provided UUID.
 * @param {Teriock.UUID<TeriockCommon>} uuid
 * @param {Teriock.Documents.CommonType[]} types
 * @returns {boolean}
 */
export function typeValidator(uuid, types = []) {
  const item = foundry.utils.fromUuidSync(uuid);
  if (item) {
    return types.includes(item.type);
  }
}

/**
 * Validates the types from the provided array of UUIDS.
 * @param {Teriock.UUID<TeriockCommon>[]} uuids
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
