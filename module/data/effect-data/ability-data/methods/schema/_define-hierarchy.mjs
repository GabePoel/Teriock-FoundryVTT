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
  schema.supUuid = new fields.DocumentUUIDField({
    initial: null,
    nullable: true,
    label: "Super Ability UUID",
    hint: "The UUID of the ability or effect that provides this ability, if there is one.",
  });
  schema.subIds = new fields.ArrayField(new fields.DocumentIdField(), {
    label: "Sub IDs",
    hint: "The IDs of the abilities that this ability provides, if there are any.",
  });
  schema.subUuids = new fields.ArrayField(new fields.DocumentUUIDField(), {
    label: "Sub UUIDs",
    hint: "The UUIDs of the abilities that this ability provides, if there are any.",
  });
  return schema;
}
