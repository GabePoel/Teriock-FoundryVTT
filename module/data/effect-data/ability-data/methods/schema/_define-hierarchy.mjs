const { fields } = foundry.data;

/**
 * Defines the local effect hierarchy for this ability.
 *
 * @param {object} schema - The bast schema object to extend
 * @returns {object} Schema object with hierarchy fields added
 * @private
 */
export function _defineHierarchy(schema) {
  schema.supId = new fields.DocumentIdField({
    initial: null,
    nullable: true,
    label: "Super Ability ID",
    hint: "The ID of the ability or effect that provides this ability, if there is one.",
  });
  schema.subIds = new fields.SetField(/** @type {typeof DocumentIdField} */ new fields.DocumentIdField(), {
    label: "Sub IDs",
    hint: "The IDs of the abilities that this ability provides, if there are any.",
  });
  schema.rootUuid = new fields.DocumentUUIDField({
    label: "Root UUID",
    hint: "The UUID of the document this ability is embedded in.",
  });
  return schema;
}
