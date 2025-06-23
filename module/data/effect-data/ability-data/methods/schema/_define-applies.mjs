const { fields } = foundry.data;

/**
 * Creates a field for applies data configuration.
 *
 * This field defines what effects apply to targets at different proficiency levels:
 * - **Statuses**: Conditions applied to the target
 * - **Damage**: Damage formulas applied
 * - **Drain**: Drain formulas effects
 * - **Changes**: Effect changes to target properties
 *
 * @returns {SchemaField} Field for configuring applies data
 * @deprecated This is being phased out in favor of the more robust consequences system.
 *
 * @example
 * // Create applies field
 * const appliesField = appliesField();
 */
function appliesField() {
  return new fields.SchemaField({
    statuses: new fields.ArrayField(new fields.StringField()),
    damage: new fields.ArrayField(new fields.StringField()),
    drain: new fields.ArrayField(new fields.StringField()),
    changes: new fields.ArrayField(
      new fields.SchemaField({
        key: new fields.StringField({ initial: "" }),
        mode: new fields.NumberField({ initial: 4 }),
        value: new fields.StringField({ initial: "" }),
        priority: new fields.NumberField({ initial: 20 }),
      }),
    ),
  });
}

/**
 * Defines the applies fields for Teriock ability data schema.
 *
 * This function creates schema fields for data that applies to targets at different
 * proficiency levels:
 *
 * - **Base**: Effects applied when using the ability at basic proficiency
 * - **Proficient**: Enhanced effects when proficient with the ability
 * - **Fluent**: Maximum effects when fluent with the ability
 *
 * Each level can have different status effects, damage formulas, drain effects,
 * and property changes applied to targets.
 *
 * @param {object} schema - The base schema object to extend
 * @returns {object} Schema object with applies fields added
 * @deprecated This is being phased out in favor of the more robust consequences system.
 * @private
 *
 * @example
 * // Add applies fields to a schema
 * const schema = _defineApplies({});
 *
 * @example
 * // Use in complete schema definition
 * let schema = {};
 * schema = _defineApplies(schema);
 * schema = _defineConsequences(schema);
 * schema = _defineGeneral(schema);
 */
export function _defineApplies(schema) {
  schema.applies = new fields.SchemaField({
    base: appliesField(),
    proficient: appliesField(),
    fluent: appliesField(),
  });

  return schema;
}
